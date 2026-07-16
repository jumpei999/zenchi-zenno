# Agent skill: decision traceability

**Question this skill answers:**

> What did I decide about X, and what is the evidence?

This is the Phase 1 Personal MVP agent skill (ARCHITECTURE §10). It uses the local workspace under `.zenchi/` — no cloud required.

## Prerequisites

```bash
pnpm install
pnpm build
pnpm zenchi init
```

Ingest at least one source (fixtures work for a demo):

```bash
pnpm zenchi ingest --connector markdown-local --path ./fixtures/notes
# optional second source
pnpm zenchi ingest --connector chatgpt-export --path ./fixtures/chatgpt-export
pnpm zenchi ingest --connector github --path ./fixtures/github
```

For **network footprint** evaluation (commits / PRs from a real repo):

```bash
export GITHUB_TOKEN=ghp_...   # or ZENCHI_GITHUB_TOKEN
# fine-grained PAT: contents:read, pull-requests:read
pnpm zenchi ingest --connector github --repo owner/name
```

Review hypotheses before treating them as accepted knowledge:

```bash
pnpm zenchi confirm --list
pnpm zenchi confirm --accept <entity-id>
```

Extractors never auto-confirm Decisions. Confidence bands (`high` / `medium` / `low`) are labels, not truth.

## CLI workflow

```bash
# Find candidates
pnpm zenchi search "postgres"

# Decision archaeology: Decision → evidence → derived_from → related entities
pnpm zenchi trace --query "database"
```

Interpret results:

| Field                  | Meaning                                                  |
| ---------------------- | -------------------------------------------------------- |
| `state: hypothesized`  | Not yet human-confirmed — treat as provisional           |
| `state: confirmed`     | Accepted knowledge                                       |
| `confidence` + band    | Heuristic extractor certainty                            |
| `evidence` / `snippet` | Observation text that justified the claim                |
| `derived_from`         | Link from entity to source observation                   |
| `related_entities`     | Other entities sharing the same evidence (e.g. Artifact) |

## MCP workflow (agent clients)

Start the local stdio server:

```bash
pnpm zenchi mcp
# or: node packages/mcp-server/dist/cli.js --data-dir /absolute/path/to/.zenchi
```

Cursor / Claude Desktop style config — see also [packages/mcp-server/README.md](../packages/mcp-server/README.md):

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

| Tool                 | Use when                                                |
| -------------------- | ------------------------------------------------------- |
| `search_entities`    | Broad discovery by keyword / type                       |
| `get_decision_trace` | Answer “what did I decide about X?” with evidence graph |
| `list_evidence`      | Drill into one entity id                                |
| `list_hypotheses`    | Same as `zenchi confirm --list` — review before accept  |

Example agent prompt:

> Using zenchi-zenno MCP, call `get_decision_trace` with query `database`. Summarize each Decision’s confirmation state, confidence band, and evidence snippets. Do not invent decisions that are not returned.

## Manual context

Person / Project / Interest / Learning are not auto-extracted in Phase 1:

```bash
pnpm zenchi create --type Project --title "zenchi-zenno MVP" --goal "Ship Personal OS"
pnpm zenchi create --type Person --title "Ada" --identity github:ada
```

## Out of scope for this skill

- Google / Slack sync (GitHub read-only API ingest is supported)
- Treating hypothesized entities as ground truth
- General entity-graph traversal beyond Decision-centric trace (`get_entity_graph` deferred)
