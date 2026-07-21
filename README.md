# zenchi-zenno

English | [日本語](README.ja.md)

**zenchi-zenno — a canonical knowledge operating system**

_全知全能の知識 OS へ — toward omniscient, actionable knowledge._

[![Status](https://img.shields.io/badge/status-Phase%201--usable-brightgreen)](#status)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![CI](https://github.com/jumpei999/zenchi-zenno/actions/workflows/ci.yml/badge.svg)](https://github.com/jumpei999/zenchi-zenno/actions/workflows/ci.yml)
[![Release](https://github.com/jumpei999/zenchi-zenno/actions/workflows/release.yml/badge.svg)](https://github.com/jumpei999/zenchi-zenno/actions/workflows/release.yml)

zenchi-zenno continuously normalizes scattered activity signals — commits, documents, conversations, exports — into shared knowledge concepts (`Decision`, `Idea`, `Project`, `Person`, `Interest`, `Learning`, `Artifact`, `Event`). It is designed to behave like a **super-architect who has been present since day one**: traceable decisions, evidence-backed answers, and knowledge that evolves over time.

**This is not another RAG wrapper.** Retrieval is a projection. The product center is a canonical knowledge model with provenance, hypothesis confirmation, and event-sourced evolution.

## Status

**Phase 1 — Personal MVP (usable).** Local-first Personal Knowledge OS: ingest → confirm → search → decision-trace → MCP egress. The Phase 1→2 gate (low-friction confirmation + labeled extraction confidence) is met for Personal use. **No monetization features** in this repository.

- **OSS:** Personal / local use is **completely free** forever (Community plan).
- **Future commercial:** Team Workspaces, managed Cloud, and Enterprise Policy are planned separately — see [docs/commercial-boundary.md](docs/commercial-boundary.md).

### Phase 1 deferred (labeled)

| Item                                          | Status                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| GitHub connector                              | Export + optional read-only REST API (`--repo` + token)                |
| General entity graph (`get_entity_graph`)     | Not shipped — Decision-centric `trace` / MCP `get_decision_trace` only |
| Google Drive / Gmail / Calendar               | **Phase 2**                                                            |
| Auto-extract for Person / Interest / Learning | Manual `zz create` only in Phase 1                                     |

## Quick start

```bash
pnpm install
pnpm build
pnpm zz --help

# Japanese CLI UI (optional): --lang ja, or ZZ_LANG=ja, or LANG=ja_JP.UTF-8
# pnpm zz --lang ja --help
# ZZ_LANG=ja pnpm zz confirm --list

# Ingest synthetic / export fixtures, then confirm and search
pnpm zz init
pnpm zz ingest --connector markdown-local --path ./fixtures/notes
pnpm zz ingest --connector chatgpt-export --path ./fixtures/chatgpt-export
pnpm zz ingest --connector github --path ./fixtures/github

# Network footprint (optional): recent commits/PRs via read-only GitHub API
# export GITHUB_TOKEN=...   # or ZZ_GITHUB_TOKEN; scopes: contents:read, pull-requests:read
# pnpm zz ingest --connector github --repo owner/name

# Extractions are hypothesized — review evidence, then accept or reject
pnpm zz confirm --list
pnpm zz confirm --accept <entity-id>

pnpm zz search "postgres"
pnpm zz trace --query "database"

# Manual entities (Person / Project / Interest / Learning)
pnpm zz create --type Project --title "zenchi-zenno MVP" --goal "Ship Personal OS"

# Optional: MCP egress for agent clients (stdio)
pnpm zz mcp
```

**Hypothesis → Confirmation:** Heuristic extractors never auto-confirm Decisions. Always review with `zz confirm` before treating knowledge as accepted.

## Languages

- **English** is canonical for documentation and domain identifiers.
- **Japanese** translations live next to their English counterparts as `*.ja.md` (for example [README.ja.md](README.ja.md)).
- When you change an English doc that has a Japanese sibling, update the `*.ja.md` file in the same PR.
- CLI display language: `--lang ja` or `ZZ_LANG=ja` (does not change JSON keys or entity type names).

## Scope continuum

| Phase  | Focus                                                     |
| ------ | --------------------------------------------------------- |
| Now    | Personal Knowledge OS (OSS, local-first)                  |
| Future | Project Knowledge OS + optional Cloud / Team (commercial) |

## Documentation

| Document                                                                 | Description                             |
| ------------------------------------------------------------------------ | --------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)                             | Master architecture (11 sections)       |
| [docs/agent-skill-decision-trace.md](docs/agent-skill-decision-trace.md) | Agent skill: decision + evidence        |
| [docs/knowledge-model.md](docs/knowledge-model.md)                       | Entity types, relations, lifecycles     |
| [docs/event-model.md](docs/event-model.md)                               | Domain event catalog, idempotency       |
| [docs/connector-spi.md](docs/connector-spi.md)                           | Connector contract (API / Export / MCP) |
| [docs/ubiquitous-language.md](docs/ubiquitous-language.md)               | Glossary                                |
| [docs/commercial-boundary.md](docs/commercial-boundary.md)               | OSS vs commercial boundary              |
| [docs/license-strategy.md](docs/license-strategy.md)                     | MIT now; Apache + cloud repo at Phase 2 |
| [GOVERNANCE.md](GOVERNANCE.md)                                           | Project governance                      |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)                                 | Community standards                     |
| [SECURITY.md](SECURITY.md)                                               | Vulnerability reporting                 |
| [DCO](DCO)                                                               | Developer Certificate of Origin         |
| [TRADEMARK.md](TRADEMARK.md)                                             | Trademark policy                        |

## Repository map

```text
zenchi-zenno/
├── docs/              # Architecture and specifications
├── packages/
│   ├── core/          # Domain types, event log, entity store
│   ├── connector-spi/ # Connector interface
│   ├── projections/   # Full-text search (local)
│   ├── mcp-server/    # MCP egress (stdio tools)
│   └── cli/           # Personal CLI
├── connectors/        # chatgpt-export, github, markdown-local
├── fixtures/          # Synthetic demos (no personal data)
└── schemas/           # Draft JSON Schema stubs
```

## Design highlights

- **Canonical ontology** — eight entity types, not chat logs
- **Provenance** — every claim links to evidence
- **Hypothesis → Confirmation** — extraction honesty by design
- **Connector-agnostic** — API, Export, and MCP are peers
- **Local-first capable** — data sovereignty for OSS users
- **Personal → Project** — one kernel, evolving tenancy

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), [GOVERNANCE.md](GOVERNANCE.md), and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) — see also [docs/license-strategy.md](docs/license-strategy.md) for Phase 2 plans.
