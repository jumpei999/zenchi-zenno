import { newId, normalizeText, nowIso } from './ids.js';
import type { KnowledgeStore } from './store.js';
import type { Entity, Evidence, Observation, Relation } from './types.js';

export interface ExtractResult {
  entities: Entity[];
  relations: Relation[];
  evidence: Evidence[];
}

export type ConfidenceBand = 'high' | 'medium' | 'low' | 'unknown';

/** Human-readable confidence band for CLI / MCP display. */
export function confidenceLabel(confidence?: number): ConfidenceBand {
  if (confidence == null || Number.isNaN(confidence)) return 'unknown';
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.55) return 'medium';
  return 'low';
}

const DECISION_PATTERNS = [
  /\bwe (?:decided|chose|picked|selected)\b/i,
  /\bdecision:\s*/i,
  /\bgoing with\b/i,
  /\badopt(?:ed|ing)?\b.{0,40}\b(?:as|for)\b/i,
  /決定[：:]/i,
  /採用[するした]/i,
];

const IDEA_PATTERNS = [
  /\bidea:\s*/i,
  /\bwhat if\b/i,
  /\bwe could\b/i,
  /\bproposal:\s*/i,
  /アイデア[：:]/i,
  /提案[：:]/i,
];

function titleFromText(text: string, fallback: string): string {
  const line = text
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!line) return fallback;
  return line.length > 80 ? `${line.slice(0, 77)}...` : line;
}

function matchAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

/**
 * Heuristic extractor for Phase 1 MVP.
 * Produces hypothesized entities only — never auto-confirms Decisions.
 */
export function extractFromObservation(
  store: KnowledgeStore,
  observation: Observation,
): ExtractResult {
  const text = observation.text ?? observation.title ?? '';
  const entities: Entity[] = [];
  const relations: Relation[] = [];
  const evidence: Evidence[] = [];
  const ws = store.workspace.id;
  const ts = nowIso();

  const ev = store.addEvidence(observation.id, 'extracted_from_observation');
  evidence.push(ev);

  // Always create an Artifact for document-like sources
  if (
    observation.source_type === 'doc.revision' ||
    observation.source_type === 'ai.conversation' ||
    observation.source_type === 'code.change' ||
    observation.source_type === 'code.review'
  ) {
    const artifact: Entity = {
      id: newId(),
      workspace_id: ws,
      type: 'Artifact',
      title:
        observation.title ?? titleFromText(text, observation.source_native_id),
      summary: text.slice(0, 280) || undefined,
      status: 'active',
      confidence: 0.9,
      confirmation_state: 'hypothesized',
      evidence_refs: [ev.id],
      provenance: { extractor: 'heuristic-v0.1', connector_version: '0.1.0' },
      attributes: {
        media_type: 'text/plain',
        canonical_uri: observation.pointers?.path ?? observation.pointers?.url,
        source_type: observation.source_type,
      },
      created_at: ts,
      updated_at: ts,
    };
    entities.push(artifact);
  }

  // Calendar / meeting-ish → Event
  if (
    observation.source_type === 'calendar.event' ||
    observation.source_type === 'meeting.notes' ||
    /\bmeeting\b/i.test(observation.title ?? '') ||
    /会議/.test(observation.title ?? '')
  ) {
    const eventEntity: Entity = {
      id: newId(),
      workspace_id: ws,
      type: 'Event',
      title: observation.title ?? titleFromText(text, 'Untitled event'),
      summary: text.slice(0, 280) || undefined,
      status: 'occurred',
      confidence: 0.75,
      confirmation_state: 'hypothesized',
      evidence_refs: [ev.id],
      provenance: { extractor: 'heuristic-v0.1' },
      attributes: {
        occurred_at: observation.observed_at,
        location_or_channel: observation.pointers?.url,
      },
      created_at: ts,
      updated_at: ts,
    };
    entities.push(eventEntity);
  }

  // Decision hypotheses — never confirmed here
  if (
    matchAny(text, DECISION_PATTERNS) ||
    matchAny(observation.title ?? '', DECISION_PATTERNS)
  ) {
    const decision: Entity = {
      id: newId(),
      workspace_id: ws,
      type: 'Decision',
      title: titleFromText(text, 'Untitled decision'),
      summary: text.slice(0, 400),
      status: 'proposed',
      confidence: 0.55,
      confirmation_state: 'hypothesized',
      evidence_refs: [ev.id],
      provenance: { extractor: 'heuristic-v0.1' },
      attributes: {
        rationale: text.slice(0, 800),
        decided_at: observation.observed_at,
        alternatives: [],
      },
      created_at: ts,
      updated_at: ts,
    };
    entities.push(decision);
  }

  // Idea hypotheses
  if (
    matchAny(text, IDEA_PATTERNS) ||
    matchAny(observation.title ?? '', IDEA_PATTERNS)
  ) {
    const idea: Entity = {
      id: newId(),
      workspace_id: ws,
      type: 'Idea',
      title: titleFromText(text, 'Untitled idea'),
      summary: text.slice(0, 400),
      status: 'captured',
      confidence: 0.5,
      confirmation_state: 'hypothesized',
      evidence_refs: [ev.id],
      provenance: { extractor: 'heuristic-v0.1' },
      attributes: {
        problem_frame: text.slice(0, 400),
      },
      created_at: ts,
      updated_at: ts,
    };
    entities.push(idea);
  }

  // Link entities to the observation via derived_from (entity → observation id in from/to)
  for (const entity of entities) {
    const rel: Relation = {
      id: newId(),
      workspace_id: ws,
      predicate: 'derived_from',
      from_id: entity.id,
      to_id: observation.id,
      confirmation_state: 'hypothesized',
      confidence: entity.confidence,
      evidence_refs: [ev.id],
      created_at: ts,
      updated_at: ts,
    };
    relations.push(rel);
  }

  store.appendEvent('ClaimsExtracted', {
    observation_ids: [observation.id],
    claim_count: entities.length,
    extractor_version: 'heuristic-v0.1',
  });

  return { entities, relations, evidence };
}

export function applyExtract(
  store: KnowledgeStore,
  result: ExtractResult,
): void {
  for (const e of result.entities) store.upsertEntity(e);
  for (const r of result.relations) store.upsertRelation(r);
}

/** Lightweight query aliases so natural phrases hit domain terms. */
const QUERY_ALIASES: Record<string, string[]> = {
  database: ['database', 'postgres', 'postgresql', 'db'],
  db: ['db', 'database', 'postgres', 'postgresql'],
  postgres: ['postgres', 'postgresql', 'database'],
  postgresql: ['postgresql', 'postgres', 'database'],
};

function tokenMatchesHaystack(hay: string, token: string): boolean {
  const aliases = QUERY_ALIASES[token] ?? [token];
  return aliases.some((a) => hay.includes(a));
}

export function searchEntities(entities: Entity[], query: string): Entity[] {
  const q = normalizeText(query);
  if (!q) return [];
  const rawTokens = q.split(' ').filter(Boolean);
  return entities
    .filter((e) => {
      const hay = normalizeText(
        [e.title, e.summary ?? '', e.type, e.status, ...(e.tags ?? [])].join(
          ' ',
        ),
      );
      if (hay.includes(q)) return true;
      // Single token: OR aliases (e.g. "database" → postgresql ADR)
      if (rawTokens.length === 1) {
        return tokenMatchesHaystack(hay, rawTokens[0] ?? '');
      }
      // Multi-word: every original token must match (alias-aware AND)
      return rawTokens.every((t) => tokenMatchesHaystack(hay, t));
    })
    .sort((a, b) => {
      // Prefer confirmed
      if (
        a.confirmation_state === 'confirmed' &&
        b.confirmation_state !== 'confirmed'
      )
        return -1;
      if (
        b.confirmation_state === 'confirmed' &&
        a.confirmation_state !== 'confirmed'
      )
        return 1;
      return b.updated_at.localeCompare(a.updated_at);
    });
}

export interface EvidenceLink {
  evidence: Evidence;
  observation?: Observation;
  snippet: string;
}

export interface DecisionTraceNode {
  decision: Entity;
  evidence: EvidenceLink[];
  derived_from: Array<{
    relation: Relation;
    observation?: Observation;
  }>;
  related_entities: Entity[];
}

export interface DecisionTraceResult {
  nodes: DecisionTraceNode[];
}

export function listEvidenceForEntity(
  store: KnowledgeStore,
  entityId: string,
): EvidenceLink[] {
  const entity = store.getEntity(entityId);
  if (!entity) return [];
  const out: EvidenceLink[] = [];
  for (const eid of entity.evidence_refs) {
    const ev = store.evidence.find((x) => x.id === eid);
    if (!ev) continue;
    const observation = store.observations.find(
      (o) => o.id === ev.observation_id,
    );
    out.push({
      evidence: ev,
      observation,
      snippet: (observation?.text ?? observation?.title ?? '')
        .slice(0, 240)
        .replaceAll('\n', ' '),
    });
  }
  return out;
}

/**
 * Decision archaeology with a minimal graph walk:
 * Decision → evidence/observations, derived_from edges, sibling entities sharing evidence.
 */
export function decisionTrace(
  store: KnowledgeStore,
  query: string,
): DecisionTraceResult {
  const decisions = searchEntities(store.entities, query).filter(
    (e) => e.type === 'Decision',
  );
  const nodes: DecisionTraceNode[] = [];

  for (const decision of decisions) {
    const evidence = listEvidenceForEntity(store, decision.id);

    const derived_from = store.relations
      .filter(
        (r) => r.predicate === 'derived_from' && r.from_id === decision.id,
      )
      .map((relation) => ({
        relation,
        observation: store.observations.find((o) => o.id === relation.to_id),
      }));

    const evidenceIds = new Set(decision.evidence_refs);
    const related_entities = store.entities.filter(
      (e) =>
        e.id !== decision.id &&
        e.evidence_refs.some((ref) => evidenceIds.has(ref)),
    );

    nodes.push({ decision, evidence, derived_from, related_entities });
  }

  return { nodes };
}
