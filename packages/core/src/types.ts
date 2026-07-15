/** Canonical knowledge types for zenchi-zenno Personal MVP. */

export type EntityType = "Decision" | "Idea" | "Artifact" | "Event";

export type ConfirmationState =
  | "hypothesized"
  | "confirmed"
  | "disputed"
  | "archived";

export type Sensitivity = "private" | "shareable" | "restricted";

export interface Provenance {
  extractor?: string;
  model?: string;
  prompt_version?: string;
  connector_version?: string;
}

export interface Entity {
  id: string;
  workspace_id: string;
  type: EntityType;
  title: string;
  summary?: string;
  status: string;
  sensitivity?: Sensitivity;
  confidence?: number;
  confirmation_state: ConfirmationState;
  valid_from?: string;
  valid_to?: string;
  aliases?: string[];
  tags?: string[];
  evidence_refs: string[];
  provenance?: Provenance;
  attributes?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Relation {
  id: string;
  workspace_id: string;
  predicate: string;
  from_id: string;
  to_id: string;
  confirmation_state: ConfirmationState;
  confidence?: number;
  evidence_refs: string[];
  created_at: string;
  updated_at: string;
}

export interface ObservationPointers {
  url?: string;
  thread_id?: string;
  repo?: string;
  path?: string;
  message_id?: string;
  [key: string]: string | undefined;
}

export interface Observation {
  id: string;
  workspace_id: string;
  source_system: string;
  source_type: string;
  source_native_id: string;
  observed_at: string;
  ingested_at: string;
  actor?: { display_name?: string; identity_hint?: string };
  title?: string;
  text?: string;
  structured?: Record<string, unknown>;
  pointers?: ObservationPointers;
  content_ref: string;
  checksum: string;
  language?: string;
}

export interface SourceRecord {
  id: string;
  workspace_id: string;
  content_ref: string;
  checksum: string;
  source_native_id: string;
  media_type?: string;
  body: string;
  stored_at: string;
}

export interface Evidence {
  id: string;
  workspace_id: string;
  observation_id: string;
  note?: string;
  created_at: string;
}

export type DomainEventType =
  | "SourceConnectionRegistered"
  | "SyncStarted"
  | "SyncCompleted"
  | "SyncFailed"
  | "SourceRecordStored"
  | "ObservationIngested"
  | "ClaimsExtracted"
  | "EntityUpserted"
  | "RelationUpserted"
  | "HypothesisConfirmed"
  | "HypothesisRejected"
  | "EntitiesMerged"
  | "ProjectionRebuilt"
  | "ReasoningEpisodeRecorded";

export interface DomainEvent {
  id: string;
  workspace_id: string;
  type: DomainEventType;
  occurred_at: string;
  correlation_id?: string;
  causation_id?: string;
  actor?: string;
  payload: Record<string, unknown>;
  schema_version: string;
}

export interface WorkspaceMeta {
  id: string;
  kind: "personal" | "project";
  name: string;
  created_at: string;
}
