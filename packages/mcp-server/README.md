# @zenchi-zenno/mcp-server

Local MCP **egress** for zenchi-zenno Personal MVP.

Exposes canonical knowledge tools over stdio (JSON-RPC):

| Tool                 | Purpose                                                 |
| -------------------- | ------------------------------------------------------- |
| `search_entities`    | Full-text search                                        |
| `get_decision_trace` | Decision → evidence / `derived_from` / related entities |
| `list_evidence`      | Evidence snippets for an entity id                      |

## Run

```bash
# After pnpm build and zenchi init + ingest
pnpm zenchi mcp
# or
pnpm --filter @zenchi-zenno/mcp-server exec zenchi-mcp --data-dir ./.zenchi
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
        "/absolute/path/to/.zenchi"
      ]
    }
  }
}
```

This package operates on **canonical entities**, not raw connector internals.
