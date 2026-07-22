# Ubiquitous Language

English | [日本語](ubiquitous-language.ja.md)

This glossary defines terms used consistently across zenchi-zenno. When in doubt, prefer these definitions over colloquial synonyms.

**Related:** [ARCHITECTURE.md](ARCHITECTURE.md) · [knowledge-model.md](knowledge-model.md) · [event-model.md](event-model.md)

---

## Core terms

| Term             | Definition                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------- |
| **Source**       | An external system or export bundle (GitHub, Drive, Slack, ChatGPT export, …)                 |
| **Connector**    | Implementation that produces Observations from a Source. Hides API / Export / MCP differences |
| **SourceRecord** | Raw payload (or content-addressed reference) plus metadata. Immutable after store             |
| **Observation**  | A normalized record of "what was seen" in a source at a point in time                         |
| **Evidence**     | Link from an Entity, Relation, or Claim back to one or more Observations                      |
| **Entity**       | Canonical normalized knowledge object (Decision, Idea, Project, …)                            |
| **Claim**        | A statement about an entity attribute, relation, or state. Often extraction-derived           |
| **Hypothesis**   | An unconfirmed Claim with a confidence score                                                  |
| **Confirmation** | Human or policy action that accepts, rejects, or merges a Hypothesis                          |
| **Relation**     | Typed semantic link between entities or between evidence and knowledge                        |
| **Projection**   | Derived index or view (full-text, vector, timeline). Rebuildable, non-canonical               |
| **Workspace**    | Boundary for Personal or Project knowledge (tenant)                                           |
| **Sensitivity**  | Handling class: `private`, `shareable`, `restricted`, …                                       |

---

## Entity types

| Term         | Definition                                                                     |
| ------------ | ------------------------------------------------------------------------------ |
| **Decision** | An adopted choice with rationale, alternatives, and scope                      |
| **Idea**     | An unadopted or exploring concept not yet promoted to Decision                 |
| **Project**  | A bounded initiative with goals, timeframe, and contained knowledge            |
| **Person**   | A human or stable agent identity                                               |
| **Interest** | A sustained topic or domain of attention                                       |
| **Learning** | A record of understanding gained (including from mistakes)                     |
| **Artifact** | A durable output: document, code, diagram, note, export file, …                |
| **Event**    | A time-bound occurrence: meeting, release, conversation session, media view, … |

---

## Temporal and system terms

| Term                 | Definition                                                                      |
| -------------------- | ------------------------------------------------------------------------------- |
| **Domain Event**     | Append-only internal system fact (`ObservationIngested`, `EntityUpserted`, …)   |
| **Event** (entity)   | User-facing occurrence in the knowledge model. **Not** the same as Domain Event |
| **Valid time**       | When a piece of knowledge was true in the world (`valid_from`, `valid_to`)      |
| **System time**      | When zenchi-zenno recorded or updated something (`created_at`, `updated_at`)    |
| **ReasoningEpisode** | Auditable record of which entities/evidence an agent used and what it concluded |
| **CurationAction**   | Confirmation, rejection, merge, or archival applied to knowledge                |

---

## Terms to avoid in domain language

| Avoid                                | Use instead                                   |
| ------------------------------------ | --------------------------------------------- |
| "document" (alone)                   | `Artifact` + evidence                         |
| "memory" (alone)                     | `Entity`, `ReasoningEpisode`, or `Projection` |
| "embedding" as knowledge             | `Projection` (vector index)                   |
| "GoogleDoc" / "SlackMessage" in core | `Observation` with `source_type`              |
| "the AI decided"                     | `Hypothesis` until `Confirmation`             |

---

## Disambiguation examples

### Observation vs Entity

- A Git commit is an **Observation** (`code.change`).
- "We chose PostgreSQL for the event log" is a **Decision** entity, grounded by Observations (ADR, Slack thread, issue comment).

### Domain Event vs Event entity

- `ObservationIngested` is a **Domain Event** in the system log.
- "Architecture review meeting on 2026-07-15" is an **Event** entity in the knowledge graph.

### Hypothesis vs Confirmed

- Extractor materializes a commit / doc / chat as an **Artifact** → **Confirmed** by policy (`provenance.policy: observation_fact`). These are observation facts, not claims.
- Extractor infers a **Decision** or **Idea** from source text → **Hypothesis** (`confirmation_state: hypothesized`).
- User confirms in CLI → **Confirmed** (`HypothesisConfirmed` domain event).
- User rejects in CLI → **Archived** (`HypothesisRejected`); rejected entities are hidden from default search.

---

## Naming conventions

- Entity type names: PascalCase enum (`Decision`, `Artifact`)
- Relation predicates: snake_case (`promoted_to`, `decides_for`)
- Domain event names: PascalCase past tense (`EntityUpserted`)
- Observation `source_type`: dot-separated lowercase (`code.change`, `chat.thread`)
