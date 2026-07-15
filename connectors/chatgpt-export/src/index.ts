import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { checksum, newId, nowIso } from "@zenchi-zenno/core";
import type { Capabilities, Connector, ConnectorMetadata, SyncResult } from "@zenchi-zenno/connector-spi";

interface ChatgptConversation {
  id?: string;
  title?: string;
  create_time?: number;
  update_time?: number;
  mapping?: Record<
    string,
    {
      message?: {
        id?: string;
        author?: { role?: string };
        content?: { parts?: Array<string | { text?: string }> };
        create_time?: number;
      };
    }
  >;
}

function extractText(conv: ChatgptConversation): string {
  const parts: string[] = [];
  if (conv.title) parts.push(`# ${conv.title}`);
  const mapping = conv.mapping ?? {};
  for (const node of Object.values(mapping)) {
    const msg = node.message;
    if (!msg?.content?.parts) continue;
    const role = msg.author?.role ?? "unknown";
    const texts = msg.content.parts
      .map((p) => (typeof p === "string" ? p : p.text ?? ""))
      .filter(Boolean);
    if (texts.length) parts.push(`[${role}]\n${texts.join("\n")}`);
  }
  return parts.join("\n\n");
}

function loadConversations(path: string): ChatgptConversation[] {
  const st = statSync(path);
  const file = st.isDirectory() ? join(path, "conversations.json") : path;
  const raw = JSON.parse(readFileSync(file, "utf8")) as unknown;
  if (Array.isArray(raw)) return raw as ChatgptConversation[];
  if (raw && typeof raw === "object" && Array.isArray((raw as { conversations?: unknown }).conversations)) {
    return (raw as { conversations: ChatgptConversation[] }).conversations;
  }
  return [raw as ChatgptConversation];
}

export function createChatgptExportConnector(): Connector {
  return {
    metadata(): ConnectorMetadata {
      return {
        id: "chatgpt-export",
        version: "0.1.0",
        source_system: "chatgpt",
        supported_transports: ["export"],
      };
    },
    capabilities(): Capabilities {
      return {
        incremental: false,
        webhook: false,
        export_only: true,
        realtime: false,
        observation_types: ["ai.conversation"],
      };
    },
    async sync({ path, workspace_id }) {
      const result: SyncResult = {
        observations: [],
        records: [],
        cursor: { value: nowIso() },
        has_more: false,
        errors: [],
      };
      if (!path) {
        result.errors.push({ message: "path is required for chatgpt-export" });
        return result;
      }
      let conversations: ChatgptConversation[] = [];
      try {
        conversations = loadConversations(path);
      } catch (e) {
        result.errors.push({ message: (e as Error).message });
        return result;
      }

      for (const conv of conversations) {
        const nativeId = conv.id ?? newId();
        const body = extractText(conv);
        const sum = checksum(body);
        const observed = conv.update_time
          ? new Date(conv.update_time * 1000).toISOString()
          : nowIso();
        const observation = {
          id: newId(),
          workspace_id,
          source_system: "chatgpt",
          source_type: "ai.conversation",
          source_native_id: nativeId,
          observed_at: observed,
          title: conv.title ?? nativeId,
          text: body,
          pointers: { thread_id: nativeId },
          content_ref: "",
          checksum: sum,
        };
        result.records.push({
          body,
          source_native_id: nativeId,
          checksum: sum,
          media_type: "application/json",
          observation,
        });
        result.observations.push(observation);
      }
      return result;
    },
  };
}
