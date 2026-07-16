import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { newId, nowIso } from './ids.js';
import type {
  DomainEvent,
  Entity,
  Evidence,
  Observation,
  Relation,
  SourceRecord,
  WorkspaceMeta,
} from './types.js';

export interface StoreSnapshot {
  workspace: WorkspaceMeta;
  events: DomainEvent[];
  source_records: SourceRecord[];
  observations: Observation[];
  evidence: Evidence[];
  entities: Entity[];
  relations: Relation[];
  observation_keys: string[];
}

export class KnowledgeStore {
  readonly root: string;
  private readonly eventsPath: string;
  private readonly statePath: string;
  private readonly objectsDir: string;
  private state: StoreSnapshot;

  constructor(root: string) {
    this.root = root;
    this.eventsPath = join(root, 'events.jsonl');
    this.statePath = join(root, 'state.json');
    this.objectsDir = join(root, 'objects');
    this.state = this.loadOrEmpty();
  }

  static init(root: string, name = 'personal'): KnowledgeStore {
    mkdirSync(join(root, 'objects'), { recursive: true });
    const store = new KnowledgeStore(root);
    if (!existsSync(store.statePath)) {
      const workspace: WorkspaceMeta = {
        id: newId(),
        kind: 'personal',
        name,
        created_at: nowIso(),
      };
      store.state = {
        workspace,
        events: [],
        source_records: [],
        observations: [],
        evidence: [],
        entities: [],
        relations: [],
        observation_keys: [],
      };
      store.persist();
    }
    return store;
  }

  get workspace(): WorkspaceMeta {
    return this.state.workspace;
  }

  get entities(): Entity[] {
    return this.state.entities;
  }

  get observations(): Observation[] {
    return this.state.observations;
  }

  get evidence(): Evidence[] {
    return this.state.evidence;
  }

  get relations(): Relation[] {
    return this.state.relations;
  }

  private loadOrEmpty(): StoreSnapshot {
    if (!existsSync(this.statePath)) {
      return {
        workspace: {
          id: 'uninitialized',
          kind: 'personal',
          name: 'uninitialized',
          created_at: nowIso(),
        },
        events: [],
        source_records: [],
        observations: [],
        evidence: [],
        entities: [],
        relations: [],
        observation_keys: [],
      };
    }
    return JSON.parse(readFileSync(this.statePath, 'utf8')) as StoreSnapshot;
  }

  private persist(): void {
    mkdirSync(dirname(this.statePath), { recursive: true });
    writeFileSync(this.statePath, JSON.stringify(this.state, null, 2), 'utf8');
  }

  appendEvent(
    type: DomainEvent['type'],
    payload: Record<string, unknown>,
    opts?: { correlation_id?: string; causation_id?: string; actor?: string },
  ): DomainEvent {
    const event: DomainEvent = {
      id: newId(),
      workspace_id: this.state.workspace.id,
      type,
      occurred_at: nowIso(),
      correlation_id: opts?.correlation_id,
      causation_id: opts?.causation_id,
      actor: opts?.actor ?? 'system',
      payload,
      schema_version: '0.1.0',
    };
    this.state.events.push(event);
    mkdirSync(dirname(this.eventsPath), { recursive: true });
    appendFileSync(this.eventsPath, `${JSON.stringify(event)}\n`, 'utf8');
    this.persist();
    return event;
  }

  observationKey(
    source_system: string,
    source_native_id: string,
    content_checksum: string,
  ): string {
    return `${this.state.workspace.id}|${source_system}|${source_native_id}|${content_checksum}`;
  }

  hasObservationKey(key: string): boolean {
    return this.state.observation_keys.includes(key);
  }

  storeSourceRecord(
    body: string,
    source_native_id: string,
    checksum: string,
    media_type?: string,
  ): SourceRecord {
    const id = newId();
    const content_ref = join(this.objectsDir, `${id}.txt`);
    mkdirSync(this.objectsDir, { recursive: true });
    writeFileSync(content_ref, body, 'utf8');
    const record: SourceRecord = {
      id,
      workspace_id: this.state.workspace.id,
      content_ref,
      checksum,
      source_native_id,
      media_type,
      body,
      stored_at: nowIso(),
    };
    this.state.source_records.push(record);
    this.appendEvent('SourceRecordStored', {
      record_id: id,
      content_ref,
      checksum,
      source_native_id,
    });
    return record;
  }

  ingestObservation(
    obs: Omit<Observation, 'workspace_id' | 'ingested_at'> & {
      ingested_at?: string;
    },
  ): Observation | null {
    const key = this.observationKey(
      obs.source_system,
      obs.source_native_id,
      obs.checksum,
    );
    if (this.hasObservationKey(key)) {
      return null;
    }
    const full: Observation = {
      ...obs,
      workspace_id: this.state.workspace.id,
      ingested_at: obs.ingested_at ?? nowIso(),
    };
    this.state.observations.push(full);
    this.state.observation_keys.push(key);
    this.appendEvent('ObservationIngested', {
      observation_id: full.id,
      source_type: full.source_type,
      source_native_id: full.source_native_id,
      checksum: full.checksum,
    });
    return full;
  }

  upsertEntity(entity: Entity): void {
    const idx = this.state.entities.findIndex((e) => e.id === entity.id);
    if (idx >= 0) this.state.entities[idx] = entity;
    else this.state.entities.push(entity);
    this.appendEvent('EntityUpserted', {
      entity_id: entity.id,
      type: entity.type,
      confirmation_state: entity.confirmation_state,
      title: entity.title,
    });
  }

  upsertRelation(relation: Relation): void {
    const idx = this.state.relations.findIndex((r) => r.id === relation.id);
    if (idx >= 0) this.state.relations[idx] = relation;
    else this.state.relations.push(relation);
    this.appendEvent('RelationUpserted', {
      relation_id: relation.id,
      predicate: relation.predicate,
      from_id: relation.from_id,
      to_id: relation.to_id,
    });
  }

  addEvidence(observation_id: string, note?: string): Evidence {
    const ev: Evidence = {
      id: newId(),
      workspace_id: this.state.workspace.id,
      observation_id,
      note,
      created_at: nowIso(),
    };
    this.state.evidence.push(ev);
    return ev;
  }

  getEntity(id: string): Entity | undefined {
    return this.state.entities.find((e) => e.id === id);
  }

  setConfirmation(
    entityId: string,
    state: 'confirmed' | 'rejected',
  ): Entity | undefined {
    const entity = this.getEntity(entityId);
    if (!entity) return undefined;
    if (state === 'confirmed') {
      entity.confirmation_state = 'confirmed';
      entity.updated_at = nowIso();
      this.upsertEntity(entity);
      this.appendEvent('HypothesisConfirmed', {
        entity_id: entity.id,
        confirmed_by: 'cli',
      });
    } else {
      entity.confirmation_state = 'archived';
      entity.status = entity.type === 'Decision' ? 'retracted' : 'discarded';
      entity.updated_at = nowIso();
      this.upsertEntity(entity);
      this.appendEvent('HypothesisRejected', {
        entity_id: entity.id,
        rejected_by: 'cli',
        reason: 'user_rejected',
      });
    }
    return entity;
  }

  exportCanonical(): object {
    return {
      workspace: this.state.workspace,
      entities: this.state.entities,
      relations: this.state.relations,
      evidence: this.state.evidence,
      observations: this.state.observations.map((o) => ({
        ...o,
        // body stays in objects; export metadata for portability
      })),
      events_count: this.state.events.length,
    };
  }
}
