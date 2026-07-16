# Connectors

Phase 1 Personal MVP connectors. Transports are local/export by default; GitHub also supports an optional read-only REST API.

| Package                                  | Transport                           | Observation types               | Live API                                          |
| ---------------------------------------- | ----------------------------------- | ------------------------------- | ------------------------------------------------- |
| `@zenchi-zenno/connector-markdown-local` | Local files                         | `doc.revision`, `meeting.notes` | N/A                                               |
| `@zenchi-zenno/connector-chatgpt-export` | ChatGPT data export ZIP / JSON      | `ai.conversation`               | N/A                                               |
| `@zenchi-zenno/connector-github`         | Export / fixture JSON **or** RO API | `code.change`, `code.review`    | Optional (`GITHUB_TOKEN` / `ZENCHI_GITHUB_TOKEN`) |

## GitHub: export + optional read-only API

### Export / fixture mode

```bash
pnpm zenchi ingest --connector github --path ./fixtures/github
```

Reads a synthetic or exported JSON fixture (see `fixtures/github/`). No network calls.

### API mode (read-only)

```bash
export GITHUB_TOKEN=ghp_...   # or ZENCHI_GITHUB_TOKEN
# PAT / fine-grained: contents:read, pull-requests:read
pnpm zenchi ingest --connector github --repo owner/name
# optional: --limit 30
```

Fetches recent commits and closed/merged PRs via REST, maps them to the same `code.change` / `code.review` Observations as export mode. Tokens are never written into Observation bodies or logs.

- Capabilities: `export_only: false`, `supported_transports: ['export','api']`
- Network footprint evaluation: prefer API ingest from an active repo, then `confirm` / `trace` / MCP

All connectors implement [docs/connector-spi.md](../docs/connector-spi.md). They produce **Observations only**; entity extraction runs in `@zenchi-zenno/core`.
