import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type {
  Capabilities,
  Connector,
  ConnectorMetadata,
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

function loadExport(path: string): GithubExportFile {
  const st = statSync(path);
  const file = st.isDirectory() ? join(path, 'github-export.json') : path;
  return JSON.parse(readFileSync(file, 'utf8')) as GithubExportFile;
}

/**
 * GitHub connector (export / fixture mode for Phase 1).
 * Live API sync can be added later without changing Observation contracts.
 */
export function createGithubConnector(): Connector {
  return {
    metadata(): ConnectorMetadata {
      return {
        id: 'github',
        version: '0.1.0',
        source_system: 'github',
        supported_transports: ['export', 'api'],
      };
    },
    capabilities(): Capabilities {
      return {
        incremental: false,
        webhook: false,
        export_only: true,
        realtime: false,
        observation_types: ['code.change', 'code.review'],
      };
    },
    async sync({ path, workspace_id }) {
      const result: SyncResult = {
        observations: [],
        records: [],
        cursor: { value: nowIso() },
        has_more: false,
        errors: [],
      };
      if (!path) {
        result.errors.push({
          message: 'path is required for github export mode',
        });
        return result;
      }
      let data: GithubExportFile;
      try {
        data = loadExport(path);
      } catch (e) {
        result.errors.push({ message: (e as Error).message });
        return result;
      }

      for (const c of data.commits ?? []) {
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
        result.records.push({
          body,
          source_native_id: c.sha,
          checksum: sum,
          media_type: 'text/plain',
          observation,
        });
        result.observations.push(observation);
      }

      for (const pr of data.pull_requests ?? []) {
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
      return result;
    },
  };
}
