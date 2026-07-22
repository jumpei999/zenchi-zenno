# @zenchi-zenno/mcp-server

English | [日本語](README.ja.md)

Local MCP **egress** for zenchi-zenno Personal MVP.

Exposes canonical knowledge tools over stdio (JSON-RPC):

| Tool                 | Purpose                                                 |
| -------------------- | ------------------------------------------------------- |
| `search_entities`    | Full-text search                                        |
| `get_decision_trace` | Decision → evidence / `derived_from` / related entities |
| `list_evidence`      | Evidence snippets for an entity id                      |
| `list_hypotheses`    | Decision/Idea queue (same as `zz confirm --list`)       |

## Run

```bash
# After pnpm build and zz init + ingest
pnpm zz mcp
# or
pnpm --filter @zenchi-zenno/mcp-server exec zz-mcp --data-dir ./.zz
```

Example Cursor / Claude MCP config:

```json
{
  "mcpServers": {
    "zenchi-zenno": {
      "command": "node",
      "args": [
        "packages/mcp-server/dist/cli.js",
        "--data-dir",
        "/absolute/path/to/.zz"
      ]
    }
  }
}
```

This package operates on **canonical entities**, not raw connector internals.
