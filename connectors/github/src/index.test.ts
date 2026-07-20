import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createGithubConnector, type GithubFetch } from './index.js';

const fixturesGithub = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../fixtures/github',
);

describe('github connector export smoke', () => {
  it('syncs fixture export into observations', async () => {
    const connector = createGithubConnector();
    const result = await connector.sync({
      path: fixturesGithub,
      workspace_id: 'test-ws',
    });
    assert.equal(result.errors.length, 0);
    assert.ok(result.records.length >= 2);
    assert.ok(
      result.records.some((r) => r.observation.source_type === 'code.change'),
    );
    assert.ok(
      result.records.some((r) => r.observation.source_type === 'code.review'),
    );
  });
});

describe('github connector API mode (mock HTTP)', () => {
  it('maps commits and pulls via injectable fetch', async () => {
    const exportData = JSON.parse(
      readFileSync(join(fixturesGithub, 'github-export.json'), 'utf8'),
    ) as {
      commits: Array<{
        sha: string;
        message: string;
        author?: string;
        date?: string;
        url?: string;
      }>;
      pull_requests: Array<{
        number: number;
        title: string;
        body?: string;
        merged?: boolean;
        url?: string;
        closed_at?: string;
      }>;
    };

    const fetchMock: GithubFetch = async (input) => {
      const url = String(input);
      if (url.includes('/commits')) {
        const body = exportData.commits.map((c) => ({
          sha: c.sha,
          commit: {
            message: c.message,
            author: { name: c.author, date: c.date },
          },
          html_url: c.url,
          author: { login: c.author },
        }));
        return new Response(JSON.stringify(body), { status: 200 });
      }
      if (url.includes('/pulls')) {
        const body = exportData.pull_requests.map((pr) => ({
          number: pr.number,
          title: pr.title,
          body: pr.body,
          merged_at: pr.merged ? pr.closed_at : null,
          closed_at: pr.closed_at,
          html_url: pr.url,
          state: 'closed',
        }));
        return new Response(JSON.stringify(body), { status: 200 });
      }
      return new Response('not found', { status: 404 });
    };

    const connector = createGithubConnector({ fetch: fetchMock });
    const result = await connector.sync({
      workspace_id: 'test-ws',
      token: 'gho_test_not_a_real_token',
      repo: 'jumpei999/zenchi-zenno',
      limit: 10,
    });

    assert.equal(result.errors.length, 0);
    assert.ok(result.records.length >= 2);
    const commit = result.records.find(
      (r) => r.observation.source_type === 'code.change',
    );
    assert.ok(commit);
    assert.equal(commit.observation.pointers?.repo, 'jumpei999/zenchi-zenno');
    assert.ok(!JSON.stringify(result).includes('gho_test'));
  });
});
