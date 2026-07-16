import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type {
  Capabilities,
  Connector,
  ConnectorMetadata,
  SourceRecordDraft,
  SyncInput,
  SyncResult,
} from '@zenchi-zenno/connector-spi';
import { checksum, newId, nowIso } from '@zenchi-zenno/core';

interface CommitExport {
  sha: string;
  message: string;
  author?: string;
  date?: string;
  repo?: string;
  url?: string;
}

interface PrExport {
  number: number;
  title: string;
  body?: string;
  merged?: boolean;
  repo?: string;
  url?: string;
  closed_at?: string;
}

interface GithubExportFile {
  commits?: CommitExport[];
  pull_requests?: PrExport[];
}

export type GithubFetch = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface GithubConnectorOptions {
  /** Injectable fetch for tests (mock HTTP). Defaults to global fetch. */
  fetch?: GithubFetch;
}

const DEFAULT_LIMIT = 30;

function loadExport(path: string): GithubExportFile {
  const st = statSync(path);
  const file = st.isDirectory() ? join(path, 'github-export.json') : path;
  return JSON.parse(readFileSync(file, 'utf8')) as GithubExportFile;
}

function emptyResult(): SyncResult {
  return {
    observations: [],
    records: [],
    cursor: { value: nowIso() },
    has_more: false,
    errors: [],
  };
}

function pushCommit(
  result: SyncResult,
  workspace_id: string,
  c: CommitExport,
): void {
  const body = `${c.message}\n\nauthor: ${c.author ?? 'unknown'}\nrepo: ${c.repo ?? ''}`;
  const sum = checksum(body);
  const observation = {
    id: newId(),
    workspace_id,
    source_system: 'github',
    source_type: 'code.change' as const,
    source_native_id: c.sha,
    observed_at: c.date ?? nowIso(),
    actor: c.author ? { display_name: c.author } : undefined,
    title: c.message.split('\n')[0],
    text: body,
    pointers: { repo: c.repo, url: c.url },
    content_ref: '',
    checksum: sum,
  };
  const record: SourceRecordDraft = {
    body,
    source_native_id: c.sha,
    checksum: sum,
    media_type: 'text/plain',
    observation,
  };
  result.records.push(record);
  result.observations.push(observation);
}

function pushPr(result: SyncResult, workspace_id: string, pr: PrExport): void {
  const body = `# PR #${pr.number}: ${pr.title}\n\n${pr.body ?? ''}\n\nmerged: ${pr.merged ?? false}`;
  const sum = checksum(body);
  const nativeId = `${pr.repo ?? 'repo'}#${pr.number}`;
  const observation = {
    id: newId(),
    workspace_id,
    source_system: 'github',
    source_type: 'code.review' as const,
    source_native_id: nativeId,
    observed_at: pr.closed_at ?? nowIso(),
    title: pr.title,
    text: body,
    pointers: { repo: pr.repo, url: pr.url },
    content_ref: '',
    checksum: sum,
  };
  result.records.push({
    body,
    source_native_id: nativeId,
    checksum: sum,
    media_type: 'text/plain',
    observation,
  });
  result.observations.push(observation);
}

function appendExportData(
  result: SyncResult,
  workspace_id: string,
  data: GithubExportFile,
): void {
  for (const c of data.commits ?? []) pushCommit(result, workspace_id, c);
  for (const pr of data.pull_requests ?? []) pushPr(result, workspace_id, pr);
}

async function ghJson<T>(
  fetchImpl: GithubFetch,
  token: string,
  url: string,
): Promise<T> {
  const res = await fetchImpl(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'zenchi-zenno-github-connector',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const detail = text ? `: ${text.slice(0, 200)}` : '';
    throw new Error(`GitHub API ${res.status} ${res.statusText}${detail}`);
  }
  return (await res.json()) as T;
}

interface GhCommitApi {
  sha: string;
  commit?: {
    message?: string;
    author?: { name?: string; date?: string };
  };
  html_url?: string;
  author?: { login?: string } | null;
}

interface GhPullApi {
  number: number;
  title: string;
  body?: string | null;
  merged_at?: string | null;
  closed_at?: string | null;
  html_url?: string;
  state?: string;
}

async function syncFromApi(
  fetchImpl: GithubFetch,
  input: SyncInput,
): Promise<SyncResult> {
  const result = emptyResult();
  const token = input.token;
  const repo = input.repo;
  if (!token || !repo) {
    result.errors.push({
      message: 'token and repo are required for github API mode',
    });
    return result;
  }
  if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
    result.errors.push({
      message: 'repo must be owner/name (e.g. jumpei999/zenchi-zenno)',
    });
    return result;
  }

  const limit = Math.min(Math.max(input.limit ?? DEFAULT_LIMIT, 1), 100);
  const base = `https://api.github.com/repos/${repo}`;

  try {
    const commits = await ghJson<GhCommitApi[]>(
      fetchImpl,
      token,
      `${base}/commits?per_page=${limit}`,
    );
    for (const c of commits) {
      pushCommit(result, input.workspace_id, {
        sha: c.sha,
        message: c.commit?.message ?? c.sha,
        author: c.commit?.author?.name ?? c.author?.login ?? undefined,
        date: c.commit?.author?.date,
        repo,
        url: c.html_url,
      });
    }

    const pulls = await ghJson<GhPullApi[]>(
      fetchImpl,
      token,
      `${base}/pulls?state=closed&per_page=${limit}&sort=updated&direction=desc`,
    );
    for (const pr of pulls) {
      pushPr(result, input.workspace_id, {
        number: pr.number,
        title: pr.title,
        body: pr.body ?? undefined,
        merged: Boolean(pr.merged_at),
        repo,
        url: pr.html_url,
        closed_at: pr.closed_at ?? pr.merged_at ?? undefined,
      });
    }
  } catch (e) {
    result.errors.push({ message: (e as Error).message });
  }

  return result;
}

/**
 * GitHub connector — export/fixture mode and optional read-only REST API mode.
 * Observations stay the same shape for both transports.
 */
export function createGithubConnector(
  opts: GithubConnectorOptions = {},
): Connector {
  const fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis);

  return {
    metadata(): ConnectorMetadata {
      return {
        id: 'github',
        version: '0.2.0',
        source_system: 'github',
        supported_transports: ['export', 'api'],
      };
    },
    capabilities(): Capabilities {
      return {
        incremental: false,
        webhook: false,
        export_only: false,
        realtime: false,
        observation_types: ['code.change', 'code.review'],
      };
    },
    async authenticate(credentials) {
      const token = credentials.token;
      if (!token) return { ok: false, error: 'token is required' };
      try {
        const res = await fetchImpl('https://api.github.com/user', {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'User-Agent': 'zenchi-zenno-github-connector',
          },
        });
        if (!res.ok) {
          return { ok: false, error: `GitHub auth failed: ${res.status}` };
        }
        return { ok: true };
      } catch (e) {
        return { ok: false, error: (e as Error).message };
      }
    },
    async sync(input) {
      if (input.token && input.repo) {
        return syncFromApi(fetchImpl, input);
      }

      const result = emptyResult();
      if (!input.path) {
        result.errors.push({
          message:
            'Provide --path for export mode, or --repo with GITHUB_TOKEN / ZENCHI_GITHUB_TOKEN for API mode',
        });
        return result;
      }
      try {
        const data = loadExport(input.path);
        appendExportData(result, input.workspace_id, data);
      } catch (e) {
        result.errors.push({ message: (e as Error).message });
      }
      return result;
    },
  };
}
