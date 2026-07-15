import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { checksum, newId, nowIso } from "@zenchi-zenno/core";
import type { Capabilities, Connector, ConnectorMetadata, SyncResult } from "@zenchi-zenno/connector-spi";

function walkMarkdown(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walkMarkdown(p, base));
    else if (name.endsWith(".md") || name.endsWith(".markdown")) out.push(p);
  }
  return out;
}

export function createMarkdownLocalConnector(): Connector {
  const metadata = (): ConnectorMetadata => ({
    id: "markdown-local",
    version: "0.1.0",
    source_system: "markdown",
    supported_transports: ["export"],
  });

  const capabilities = (): Capabilities => ({
    incremental: false,
    webhook: false,
    export_only: true,
    realtime: false,
    observation_types: ["doc.revision", "meeting.notes"],
  });

  return {
    metadata,
    capabilities,
    async sync({ path, workspace_id }) {
      const result: SyncResult = {
        observations: [],
        records: [],
        cursor: { value: nowIso() },
        has_more: false,
        errors: [],
      };
      if (!path) {
        result.errors.push({ message: "path is required for markdown-local" });
        return result;
      }
      let files: string[] = [];
      try {
        const st = statSync(path);
        files = st.isDirectory() ? walkMarkdown(path) : [path];
      } catch (e) {
        result.errors.push({ message: `cannot read path: ${(e as Error).message}` });
        return result;
      }

      for (const file of files) {
        try {
          const body = readFileSync(file, "utf8");
          const sum = checksum(body);
          const nativeId = relative(path, file) || file;
          const isMeeting = /meeting|議事|会議/i.test(nativeId) || /meeting|議事|会議/i.test(body.slice(0, 200));
          const obsId = newId();
          const observation = {
            id: obsId,
            workspace_id,
            source_system: "markdown",
            source_type: isMeeting ? "meeting.notes" : "doc.revision",
            source_native_id: nativeId,
            observed_at: statSync(file).mtime.toISOString(),
            title: nativeId,
            text: body,
            pointers: { path: file },
            content_ref: "", // filled after store
            checksum: sum,
          };
          result.records.push({
            body,
            source_native_id: nativeId,
            checksum: sum,
            media_type: "text/markdown",
            observation,
          });
          result.observations.push(observation);
        } catch (e) {
          result.errors.push({ item: file, message: (e as Error).message });
        }
      }
      return result;
    },
  };
}
