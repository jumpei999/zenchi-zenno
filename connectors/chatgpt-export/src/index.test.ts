import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createChatgptExportConnector } from './index.js';

const fixturesExport = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../fixtures/chatgpt-export',
);

describe('chatgpt-export connector smoke', () => {
  it('syncs conversations.json into observations', async () => {
    const connector = createChatgptExportConnector();
    assert.equal(connector.metadata().id, 'chatgpt-export');
    assert.equal(connector.capabilities().export_only, true);

    const result = await connector.sync({
      path: fixturesExport,
      workspace_id: 'test-ws',
    });

    assert.equal(result.errors.length, 0);
    assert.ok(result.records.length >= 1);
    for (const record of result.records) {
      assert.ok(record.body.length > 0);
      assert.equal(record.observation.source_system, 'chatgpt');
      assert.equal(record.observation.source_type, 'ai.conversation');
    }
  });
});
