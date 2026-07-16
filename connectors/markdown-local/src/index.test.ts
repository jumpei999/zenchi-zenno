import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createMarkdownLocalConnector } from './index.js';

const fixturesNotes = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../fixtures/notes',
);

describe('markdown-local connector smoke', () => {
  it('syncs fixture notes into observations', async () => {
    const connector = createMarkdownLocalConnector();
    assert.equal(connector.metadata().id, 'markdown-local');
    assert.equal(connector.capabilities().export_only, true);

    const result = await connector.sync({
      path: fixturesNotes,
      workspace_id: 'test-ws',
    });

    assert.equal(result.errors.length, 0);
    assert.ok(result.records.length >= 3);
    for (const record of result.records) {
      assert.ok(record.body.length > 0);
      assert.ok(record.checksum.length > 0);
      assert.equal(record.observation.source_system, 'markdown');
      assert.ok(
        record.observation.source_type === 'doc.revision' ||
          record.observation.source_type === 'meeting.notes',
      );
    }
  });
});
