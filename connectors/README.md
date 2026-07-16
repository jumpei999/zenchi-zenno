# Connectors

Phase 1 Personal MVP connectors. All are **local / export** transports — no revenue features, no required cloud APIs.

| Package                                  | Transport                      | Observation types               | Live API                   |
| ---------------------------------------- | ------------------------------ | ------------------------------- | -------------------------- |
| `@zenchi-zenno/connector-markdown-local` | Local files                    | `doc.revision`, `meeting.notes` | N/A                        |
| `@zenchi-zenno/connector-chatgpt-export` | ChatGPT data export ZIP / JSON | `ai.conversation`               | N/A                        |
| `@zenchi-zenno/connector-github`         | **Export / fixture JSON only** | `code.change`, `code.review`    | **Not shipped** (deferred) |

## GitHub: export-only (explicit)

`@zenchi-zenno/connector-github` reads a synthetic or exported JSON fixture (see `fixtures/github/`). It does **not** call the GitHub REST/GraphQL API in Phase 1.

- Capabilities flag: `export_only: true`
- A read-only live API mode is a **later candidate** (Phase 1.x / Phase 2 backlog), not part of the usable Phase 1 gate

All connectors implement [docs/connector-spi.md](../docs/connector-spi.md). They produce **Observations only**; entity extraction runs in `@zenchi-zenno/core`.
