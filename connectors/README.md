# Connectors

Phase 1 Personal MVP connectors (export / local — no revenue features):

| Package | Transport | Observation types |
|---------|-----------|-------------------|
| `@zenchi-zenno/connector-markdown-local` | Export/file | `doc.revision`, `meeting.notes` |
| `@zenchi-zenno/connector-chatgpt-export` | Export | `ai.conversation` |
| `@zenchi-zenno/connector-github` | Export (API later) | `code.change`, `code.review` |

All implement [docs/connector-spi.md](../docs/connector-spi.md). Connectors produce **Observations only**; entity extraction runs in `@zenchi-zenno/core`.
