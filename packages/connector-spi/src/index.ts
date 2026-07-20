import type { Observation } from '@zenchi-zenno/core';

export type Transport = 'api' | 'export' | 'mcp';

export interface ConnectorMetadata {
  id: string;
  version: string;
  source_system: string;
  supported_transports: Transport[];
}

export interface Capabilities {
  incremental: boolean;
  webhook: boolean;
  export_only: boolean;
  realtime: boolean;
  observation_types: string[];
}

export interface SyncCursor {
  value: string;
}

export interface SyncResult {
  observations: ObservationDraft[];
  records: SourceRecordDraft[];
  cursor: SyncCursor;
  has_more: boolean;
  errors: Array<{ item?: string; message: string }>;
}

/** Observation before workspace_id / ingested_at are assigned by the store. */
export type ObservationDraft = Omit<
  Observation,
  'workspace_id' | 'ingested_at'
> & {
  workspace_id?: string;
  ingested_at?: string;
};

export type SourceRecordDraft = {
  body: string;
  source_native_id: string;
  checksum: string;
  media_type?: string;
  observation: ObservationDraft;
};

/** Input for Connector.sync — transport-specific fields are optional. */
export interface SyncInput {
  workspace_id: string;
  path?: string;
  cursor?: SyncCursor;
  /** API auth token (e.g. GitHub PAT). Never log or persist in Observations. */
  token?: string;
  /** API scope such as `owner/repo` for GitHub. */
  repo?: string;
  /** Soft cap on items per resource type (API mode). */
  limit?: number;
}

export interface Connector {
  metadata(): ConnectorMetadata;
  capabilities(): Capabilities;
  authenticate?(
    credentials: Record<string, string>,
  ): Promise<{ ok: boolean; error?: string }>;
  sync(input: SyncInput): Promise<SyncResult>;
  health?(): Promise<{ ok: boolean; detail?: string }>;
}

export function assertConnector(c: Connector): Connector {
  return c;
}
