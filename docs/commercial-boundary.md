# Commercial Boundary

Official definition of what is open-source versus commercial in the zenchi-zenno hybrid strategy.

**Related:** [ARCHITECTURE.md](ARCHITECTURE.md) · [GOVERNANCE.md](../GOVERNANCE.md) · [TRADEMARK.md](../TRADEMARK.md) · [license-strategy.md](license-strategy.md)

---

## Strategy summary

zenchi-zenno uses an **open-core, hybrid GTM**:

1. **OSS first** — Personal Knowledge OS, local-first, fully usable without payment
2. **Commercial later** — Team / Project workspaces, managed cloud, enterprise policy, premium connectors and extractors

Revenue is earned from **operations, trust, collaboration, and extraction quality** — not from locking the knowledge kernel.

---

## Principle

> An OSS user can run a complete Personal Knowledge OS on their own machine: ingest, confirm, search, and decision-trace. Cloud and team features are **optional**. Canonical knowledge remains **exportable**.

This aligns with [ARCHITECTURE §7 Storage](ARCHITECTURE.md#7-storage-design) (exportability, local-first).

---

## Open source (this repository)

| Area                   | Includes                                                                    | Rationale                     |
| ---------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| **Kernel**             | Entity types, relations, event log contracts, idempotency                   | Trust and fork-resistant core |
| **Connector SPI**      | API / Export / MCP as peer transports                                       | Ecosystem growth              |
| **Basic connectors**   | ChatGPT export, GitHub (read-only / export), local Markdown                 | Personal “working” experience |
| **Personal CLI**       | `ingest`, `confirm`, `search`, `trace`                                      | Personal Knowledge OS UX      |
| **Schemas**            | [`schemas/`](../schemas/)                                                   | Interoperability              |
| **MCP egress (basic)** | `search_entities`, `get_decision_trace`, `list_evidence`, `list_hypotheses` | Agent interoperability        |
| **Docs & ontology**    | Architecture, ubiquitous language, knowledge model                          | Community gravity             |

---

## Commercial (planned separate product)

Shipped later as **managed offerings and/or a separate `zenchi-zenno-cloud` repository** — not as artificial limits on local OSS use.

| Area                         | Includes                                                         | Why paid                                                                                  |
| ---------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Team / Project Workspace** | Multi-user, shared Decision graph, mandatory review flows        | Collaboration value ([ARCHITECTURE §5.9](ARCHITECTURE.md#59-personal--project-evolution)) |
| **Managed Cloud**            | Hosted sync, backup, multi-device                                | Ops cost + convenience                                                                    |
| **Enterprise Policy**        | SSO/SAML, SCIM, ACL, audit log, retention, PII redaction         | Compliance                                                                                |
| **Premium connectors**       | Slack / Gmail / Drive live sync, high-frequency webhooks         | API and maintenance cost                                                                  |
| **Premium extraction**       | Higher-precision Decision extraction, dedup, identity resolution | LLM cost + tuning                                                                         |
| **Reasoning Audit Plus**     | Long-term ReasoningEpisode retention, search, compliance reports | Enterprise accountability                                                                 |
| **SLA / Support**            | Priority support, onboarding, custom connectors                  | B2B standard                                                                              |

---

## Monetization hooks (product, not kernel locks)

Commercial differentiation maps to OSS differentiators ([ARCHITECTURE §9](ARCHITECTURE.md#9-oss-differentiation)):

| Capability                                       | Typical plan |
| ------------------------------------------------ | ------------ |
| Decision archaeology with shared evidence chains | Team+        |
| Team Hypothesis → Confirmation workflows         | Team         |
| Cross-source linking (e.g. Git + Slack + Drive)  | Pro+         |
| ReasoningEpisode audit trails                    | Enterprise   |

---

## Pricing outline (indicative, USD)

Not binding; for product and GTM alignment:

| Plan           | Audience    | Indicative price   | Includes                                             |
| -------------- | ----------- | ------------------ | ---------------------------------------------------- |
| **Community**  | Individuals | $0                 | Full OSS, local, basic connectors                    |
| **Pro**        | Power users | $12–20 / user / mo | Cloud sync, extra connectors, faster extraction      |
| **Team**       | Startups    | $25–40 / user / mo | Project Workspace, shared confirmation, 30-day audit |
| **Enterprise** | Companies   | Custom             | SSO, SCIM, unlimited audit, SLA, VPC options         |

Japan: trial within ~0.8–1.2× of the above. Early revenue focus is **Team**; **Pro** bridges personal → team.

---

## Repository layout (target)

```text
zenchi-zenno/              # OSS (MIT now; Apache 2.0 under evaluation — see license-strategy.md)
  packages/core
  packages/connector-spi
  packages/projections
  connectors/*
  cli/                     # Phase 1+

zenchi-zenno-cloud/        # Commercial (BSL 1.1 or proprietary; planned)
  packages/tenancy
  packages/policy
  services/api
  services/sync
```

---

## What we will not do

- Make the canonical ontology proprietary
- Artificially cripple local OSS functionality
- Close the MCP / Connector ecosystem to third parties
- Require cloud or MCP to use Personal Knowledge OS

---

## Change control

Changes to this boundary require:

1. An RFC or issue referencing this document
2. Update to [GOVERNANCE.md](../GOVERNANCE.md) and public README if user-facing
3. Clear migration notes for existing OSS users
