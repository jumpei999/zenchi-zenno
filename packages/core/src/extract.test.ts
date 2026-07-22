import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  applyExtract,
  checksum,
  confidenceLabel,
  decisionTrace,
  extractFromObservation,
  KnowledgeStore,
  newId,
  nowIso,
  searchEntities,
} from './index.js';

// Runtime path is packages/core/dist/*.js → repo fixtures/
const fixturesRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../fixtures',
);

describe('confidenceLabel', () => {
  it('bands confidence for UX', () => {
    assert.equal(confidenceLabel(0.9), 'high');
    assert.equal(confidenceLabel(0.55), 'medium');
    assert.equal(confidenceLabel(0.5), 'low');
    assert.equal(confidenceLabel(undefined), 'unknown');
  });
});

describe('extractFromObservation fixtures', () => {
  it('extracts Decision + Artifact from adr-database.md', () => {
    const dir = mkdtempSync(join(tmpdir(), 'zenchi-'));
    try {
      const store = KnowledgeStore.init(dir, 'test');
      const body = readFileSync(
        join(fixturesRoot, 'notes/adr-database.md'),
        'utf8',
      );
      const sum = checksum(body);
      store.storeSourceRecord(body, 'adr-database.md', sum);
      const obs = store.ingestObservation({
        id: newId(),
        source_system: 'markdown',
        source_type: 'doc.revision',
        source_native_id: 'adr-database.md',
        observed_at: nowIso(),
        title: 'adr-database.md',
        text: body,
        content_ref: 'x',
        checksum: sum,
      });
      assert.ok(obs);
      const result = extractFromObservation(store, obs);
      applyExtract(store, result);

      const decisions = store.entities.filter((e) => e.type === 'Decision');
      const artifacts = store.entities.filter((e) => e.type === 'Artifact');
      assert.ok(decisions.length >= 1);
      assert.ok(artifacts.length >= 1);
      const decision = decisions[0];
      assert.ok(decision);
      assert.equal(decision.confirmation_state, 'hypothesized');
      assert.equal(confidenceLabel(decision.confidence), 'medium');
      assert.ok((decision.confidence ?? 0) < 0.8);
      const artifact = artifacts[0];
      assert.ok(artifact);
      assert.equal(artifact.confirmation_state, 'confirmed');
      assert.equal(artifact.provenance?.policy, 'observation_fact');
      assert.equal(store.listHypotheses().length, decisions.length);
      assert.ok(store.listHypotheses().every((e) => e.type === 'Decision'));
      assert.equal(store.listHypotheses('Artifact').length, 0);

      const trace = decisionTrace(store, 'postgres');
      assert.ok(trace.nodes.length >= 1);
      const node = trace.nodes[0];
      assert.ok(node);
      assert.ok(node.evidence.length >= 1);
      assert.ok(node.derived_from.length >= 1);
      assert.ok(node.related_entities.some((e) => e.type === 'Artifact'));

      // Alias relaxation: "database" should hit the PostgreSQL ADR Decision
      const byAlias = decisionTrace(store, 'database');
      assert.ok(
        byAlias.nodes.length >= 1,
        'trace --query database should match PostgreSQL ADR',
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('extracts Idea from idea-sync.md with low confidence', () => {
    const dir = mkdtempSync(join(tmpdir(), 'zenchi-'));
    try {
      const store = KnowledgeStore.init(dir, 'test');
      const body = readFileSync(
        join(fixturesRoot, 'notes/idea-sync.md'),
        'utf8',
      );
      const sum = checksum(body);
      store.storeSourceRecord(body, 'idea-sync.md', sum);
      const obs = store.ingestObservation({
        id: newId(),
        source_system: 'markdown',
        source_type: 'doc.revision',
        source_native_id: 'idea-sync.md',
        observed_at: nowIso(),
        title: 'idea-sync.md',
        text: body,
        content_ref: 'x',
        checksum: sum,
      });
      assert.ok(obs);
      const result = extractFromObservation(store, obs);
      applyExtract(store, result);
      const ideas = store.entities.filter((e) => e.type === 'Idea');
      assert.ok(ideas.length >= 1);
      const idea = ideas[0];
      assert.ok(idea);
      assert.equal(idea.confirmation_state, 'hypothesized');
      assert.equal(confidenceLabel(idea.confidence), 'low');
      const artifacts = store.entities.filter((e) => e.type === 'Artifact');
      assert.ok(artifacts.every((a) => a.confirmation_state === 'confirmed'));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('auto-confirms code.change Artifact while Decision stays hypothesized', () => {
    const dir = mkdtempSync(join(tmpdir(), 'zenchi-'));
    try {
      const store = KnowledgeStore.init(dir, 'test');
      const body =
        'We decided to adopt PostgreSQL as the primary store.\n\nSHA: abc123';
      const sum = checksum(body);
      store.storeSourceRecord(body, 'abc123', sum);
      const obs = store.ingestObservation({
        id: newId(),
        source_system: 'github',
        source_type: 'code.change',
        source_native_id: 'abc123',
        observed_at: nowIso(),
        title: 'We decided to adopt PostgreSQL as the primary store.',
        text: body,
        content_ref: 'x',
        checksum: sum,
      });
      assert.ok(obs);
      const result = extractFromObservation(store, obs);
      applyExtract(store, result);

      const artifacts = store.entities.filter((e) => e.type === 'Artifact');
      const decisions = store.entities.filter((e) => e.type === 'Decision');
      assert.equal(artifacts.length, 1);
      assert.equal(artifacts[0]?.confirmation_state, 'confirmed');
      assert.ok(decisions.length >= 1);
      assert.ok(
        decisions.every((d) => d.confirmation_state === 'hypothesized'),
      );
      assert.ok(store.listHypotheses().every((e) => e.type === 'Decision'));
      assert.equal(store.listHypotheses().length, decisions.length);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('extracts Event from meeting notes fixture', () => {
    const dir = mkdtempSync(join(tmpdir(), 'zenchi-'));
    try {
      const store = KnowledgeStore.init(dir, 'test');
      const body = readFileSync(
        join(fixturesRoot, 'notes/meeting-architecture-review.md'),
        'utf8',
      );
      const sum = checksum(body);
      store.storeSourceRecord(body, 'meeting-architecture-review.md', sum);
      const obs = store.ingestObservation({
        id: newId(),
        source_system: 'markdown',
        source_type: 'meeting.notes',
        source_native_id: 'meeting-architecture-review.md',
        observed_at: nowIso(),
        title: 'meeting-architecture-review.md',
        text: body,
        content_ref: 'x',
        checksum: sum,
      });
      assert.ok(obs);
      const result = extractFromObservation(store, obs);
      applyExtract(store, result);
      assert.ok(store.entities.some((e) => e.type === 'Event'));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('createManualEntity', () => {
  it('creates confirmed Person and Project', () => {
    const dir = mkdtempSync(join(tmpdir(), 'zenchi-'));
    try {
      const store = KnowledgeStore.init(dir, 'test');
      const person = store.createManualEntity({
        type: 'Person',
        title: 'Ada Lovelace',
        attributes: { identity_keys: [{ kind: 'github', value: 'ada' }] },
      });
      const project = store.createManualEntity({
        type: 'Project',
        title: 'zenchi-zenno MVP',
        summary: 'Ship Personal Knowledge OS',
        attributes: { goal: 'Local-first MVP' },
      });
      assert.equal(person.confirmation_state, 'confirmed');
      assert.equal(project.confirmation_state, 'confirmed');
      assert.equal(person.provenance?.extractor, 'manual');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('searchEntities trust', () => {
  it('excludes archived entities and prefers confirmed', () => {
    const dir = mkdtempSync(join(tmpdir(), 'zenchi-'));
    try {
      const store = KnowledgeStore.init(dir, 'test');
      store.createManualEntity({
        type: 'Project',
        title: 'Postgres rollout',
      });
      const hyp = store.createManualEntity({
        type: 'Decision',
        title: 'Postgres candidate',
      });
      hyp.confirmation_state = 'hypothesized';
      hyp.updated_at = nowIso();
      store.upsertEntity(hyp);

      const rejected = store.createManualEntity({
        type: 'Idea',
        title: 'Postgres alternative',
      });
      store.setConfirmation(rejected.id, 'rejected');

      const hits = searchEntities(store.entities, 'postgres');
      assert.ok(hits.every((e) => e.confirmation_state !== 'archived'));
      assert.ok(!hits.some((e) => e.id === rejected.id));
      assert.equal(hits[0]?.confirmation_state, 'confirmed');
      assert.ok(hits.some((e) => e.id === hyp.id));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
