import { createInterface } from 'node:readline';
import {
  confidenceLabel,
  decisionTrace,
  type Entity,
  KnowledgeStore,
  listEvidenceForEntity,
} from '@zenchi-zenno/core';
import { fullTextSearch } from '@zenchi-zenno/projections';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

const TOOLS = [
  {
    name: 'search_entities',
    description:
      'Full-text search over canonical zenchi-zenno entities (Decision, Idea, Artifact, …).',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        type: {
          type: 'string',
          description: 'Optional entity type filter',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_decision_trace',
    description:
      'Walk Decision entities matching a query with evidence, derived_from edges, and related entities.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Topic or keyword' },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_evidence',
    description: 'List evidence and observation snippets for an entity id.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string', description: 'Canonical entity id' },
      },
      required: ['entity_id'],
    },
  },
  {
    name: 'list_hypotheses',
    description:
      'List hypothesized entities awaiting confirmation (same as `zenchi confirm --list`).',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Optional entity type filter (Decision, Idea, …)',
        },
      },
    },
  },
] as const;

function openStore(dataDir: string): KnowledgeStore {
  return new KnowledgeStore(dataDir);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function toolResult(payload: unknown): {
  content: Array<{ type: 'text'; text: string }>;
} {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}

function handleTool(
  store: KnowledgeStore,
  name: string,
  args: Record<string, unknown>,
): unknown {
  switch (name) {
    case 'search_entities': {
      const query = asString(args.query);
      const type = typeof args.type === 'string' ? args.type : undefined;
      let hits = fullTextSearch(store.entities, query);
      if (type) hits = hits.filter((e) => e.type === type);
      return toolResult(
        hits.map((e) => ({
          id: e.id,
          type: e.type,
          title: e.title,
          confirmation_state: e.confirmation_state,
          confidence: e.confidence,
          confidence_band: confidenceLabel(e.confidence),
          evidence_count: e.evidence_refs.length,
          summary: e.summary,
        })),
      );
    }
    case 'get_decision_trace': {
      const query = asString(args.query);
      const { nodes } = decisionTrace(store, query);
      return toolResult(
        nodes.map((node) => ({
          decision: {
            id: node.decision.id,
            title: node.decision.title,
            confirmation_state: node.decision.confirmation_state,
            status: node.decision.status,
            confidence: node.decision.confidence,
            confidence_band: confidenceLabel(node.decision.confidence),
            summary: node.decision.summary,
          },
          evidence: node.evidence.map((e) => ({
            evidence_id: e.evidence.id,
            observation_id: e.evidence.observation_id,
            source_system: e.observation?.source_system,
            source_type: e.observation?.source_type,
            native_id: e.observation?.source_native_id,
            title: e.observation?.title,
            snippet: e.snippet,
          })),
          derived_from: node.derived_from.map((d) => ({
            relation_id: d.relation.id,
            observation_id: d.relation.to_id,
            native_id: d.observation?.source_native_id,
            title: d.observation?.title,
          })),
          related_entities: node.related_entities.map((e) => ({
            id: e.id,
            type: e.type,
            title: e.title,
            confirmation_state: e.confirmation_state,
          })),
        })),
      );
    }
    case 'list_evidence': {
      const entityId = asString(args.entity_id);
      const entity = store.getEntity(entityId);
      if (!entity) {
        return toolResult({ error: 'entity_not_found', entity_id: entityId });
      }
      const links = listEvidenceForEntity(store, entityId);
      return toolResult({
        entity: {
          id: entity.id,
          type: entity.type,
          title: entity.title,
          confirmation_state: entity.confirmation_state,
        },
        evidence: links.map((e) => ({
          evidence_id: e.evidence.id,
          observation_id: e.evidence.observation_id,
          note: e.evidence.note,
          source_system: e.observation?.source_system,
          source_type: e.observation?.source_type,
          native_id: e.observation?.source_native_id,
          title: e.observation?.title,
          snippet: e.snippet,
        })),
      });
    }
    case 'list_hypotheses': {
      const type =
        typeof args.type === 'string'
          ? (args.type as Entity['type'])
          : undefined;
      const hyps = store.listHypotheses(type);
      return toolResult(
        hyps.map((e) => ({
          id: e.id,
          type: e.type,
          title: e.title,
          confirmation_state: e.confirmation_state,
          confidence: e.confidence,
          confidence_band: confidenceLabel(e.confidence),
          evidence_count: e.evidence_refs.length,
          summary: e.summary,
        })),
      );
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function send(message: JsonRpcResponse): void {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function handleRequest(
  store: KnowledgeStore,
  req: JsonRpcRequest,
): JsonRpcResponse | null {
  const id = req.id ?? null;

  try {
    switch (req.method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: {
              name: 'zenchi-zenno',
              version: '0.1.0',
            },
          },
        };
      case 'notifications/initialized':
      case 'initialized':
        return null;
      case 'ping':
        return { jsonrpc: '2.0', id, result: {} };
      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: { tools: TOOLS },
        };
      case 'tools/call': {
        const params = req.params ?? {};
        const name = asString(params.name);
        const args = (params.arguments ?? {}) as Record<string, unknown>;
        const result = handleTool(store, name, args);
        return { jsonrpc: '2.0', id, result };
      }
      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${req.method}` },
        };
    }
  } catch (err) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

/**
 * Start a thin MCP egress server on stdio over the local `.zenchi` store.
 */
export async function startMcpServer(dataDir: string): Promise<void> {
  const store = openStore(dataDir);
  const rl = createInterface({ input: process.stdin, terminal: false });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let req: JsonRpcRequest;
    try {
      req = JSON.parse(trimmed) as JsonRpcRequest;
    } catch {
      send({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' },
      });
      continue;
    }
    const response = handleRequest(store, req);
    if (response) send(response);
  }
}
