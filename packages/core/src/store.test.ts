import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  applyExtract,
  checksum,
  extractFromObservation,
  KnowledgeStore,
  newId,
  nowIso,
} from './index.js';

describe('KnowledgeStore idempotency', () => {
  it('skips duplicate observations with same checksum key', () => {
    const dir = mkdtempSync(join(tmpdir(), 'zenchi-'));
    try {
      const store = KnowledgeStore.init(dir, 'test');
      const body = 'We decided to use PostgreSQL.';
      const sum = checksum(body);
      store.storeSourceRecord(body, 'n1', sum, 'text/plain');
      const obs = {
        id: newId(),
        source_system: 'markdown',
        source_type: 'doc.revision',
        source_native_id: 'n1',
        observed_at: nowIso(),
        title: 'n1',
        text: body,
        content_ref: 'x',
        checksum: sum,
      };
      const first = store.ingestObservation(obs);
      const second = store.ingestObservation({ ...obs, id: newId() });
      assert.ok(first);
      assert.equal(second, null);
      assert.equal(store.observations.length, 1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('extracts hypothesized Decision without confirming', () => {
    const dir = mkdtempSync(join(tmpdir(), 'zenchi-'));
    try {
      const store = KnowledgeStore.init(dir, 'test');
      const body = 'We decided to use PostgreSQL for the event log.';
      const sum = checksum(body);
      store.storeSourceRecord(body, 'adr', sum);
      const obs = store.ingestObservation({
        id: newId(),
        source_system: 'markdown',
        source_type: 'doc.revision',
        source_native_id: 'adr',
        observed_at: nowIso(),
        title: 'adr',
        text: body,
        content_ref: 'x',
        checksum: sum,
      });
      assert.ok(obs);
      const result = extractFromObservation(store, obs);
      applyExtract(store, result);
      const decisions = store.entities.filter((e) => e.type === 'Decision');
      assert.ok(decisions.length >= 1);
      const decision = decisions[0];
      assert.ok(decision);
      assert.equal(decision.confirmation_state, 'hypothesized');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
