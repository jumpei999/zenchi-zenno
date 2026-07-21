# Governance

English | [日本語](GOVERNANCE.ja.md)

How decisions are made for the zenchi-zenno open-source project.

**Related:** [CONTRIBUTING.md](CONTRIBUTING.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) · [SECURITY.md](SECURITY.md) · [docs/commercial-boundary.md](docs/commercial-boundary.md) · [TRADEMARK.md](TRADEMARK.md)

---

## Project status

zenchi-zenno is in **early governance**: a small maintainer set (initially the founding maintainer), with community input via issues, Discussions, and RFCs.

As the community grows, this document may add a maintainer committee and voting rules.

---

## Roles

| Role            | Responsibilities                                                                     |
| --------------- | ------------------------------------------------------------------------------------ |
| **Maintainer**  | Merge rights, release tagging, ontology stewardship, commercial-boundary integrity   |
| **Contributor** | PRs, issues, docs, connectors (under CONTRIBUTING)                                   |
| **RFC author**  | Proposes material changes to ontology, SPI, license strategy, or commercial boundary |

---

## Decision types

### Routine

Bug fixes, docs typos, connector fixtures, non-breaking schema clarifications.

- **Path:** PR + maintainer review
- **SLA (best effort):** 1–2 weeks in early phases

### Ontology / SPI / architecture (RFC)

New entity types, relation predicates, domain events, connector SPI breaks, storage contract changes.

- **Path:**
  1. Open an issue with [ontology-change](.github/ISSUE_TEMPLATE/ontology-change.md) or a dedicated RFC markdown under `docs/rfcs/`
  2. Discussion period (minimum **7 days** once Phase 1 ships; during Phase 0 architecture may move faster)
  3. Maintainer accept / reject with written rationale
- **Must update:** [ubiquitous-language.md](docs/ubiquitous-language.md) and related specs when accepted

### Commercial boundary and license

Changes that move features between OSS and commercial, or change the OSS license.

- **Path:** Public proposal + maintainer decision; document in [commercial-boundary.md](docs/commercial-boundary.md) and [license-strategy.md](docs/license-strategy.md)
- **Constraint:** Must not silently cripple local Personal OS already promised as free

---

## Release policy

| Phase             | Release shape                                                  |
| ----------------- | -------------------------------------------------------------- |
| Phase 0           | Documentation and schemas; no tagged runtime releases required |
| Phase 1+          | SemVer for packages; `CHANGELOG.md` for user-visible changes   |
| Breaking ontology | Major version bump + migration notes                           |

Releases are **automated** by [semantic-release](https://semantic-release.gitbook.io/) on merge to `main` (Conventional Commits → version bump, `CHANGELOG.md`, GitHub Release, npm publish). Publishing uses npm **Trusted Publishing (OIDC)** — no long-lived `NPM_TOKEN` is stored; the release workflow exchanges a short-lived GitHub Actions identity for a per-package npm credential. Version commits pushed by `@semantic-release/git` use the `RELEASE_GITHUB_TOKEN` secret (PAT `zenchi-zenno-release`) with the PAT owner **Exempt** on the `main` ruleset. Maintainers own the pipeline (branch protection / ruleset bypass, npm Trusted Publisher configuration, npm scope). Contributors do not publish packages under `@zenchi-zenno` without maintainership.

---

## Contributor agreements

| Mechanism          | When                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| **[DCO 1.1](DCO)** | Default for early OSS (Phase 0–1). Sign-off via `Signed-off-by:` in commits |
| **CLA**            | May be introduced before Enterprise sales if customer legal requires it     |

Until a CLA is published, DCO is sufficient.

---

## Communication

| Channel                    | Use                                          |
| -------------------------- | -------------------------------------------- |
| **GitHub Issues**          | Bugs, connector requests, ontology proposals |
| **GitHub Discussions**     | Q&A, design brainstorming, roadmaps          |
| **Discord** (planned)      | Real-time connector-developer chat           |
| **Office Hours** (planned) | Monthly; demos and Pro/Team orientation      |

---

## Code of conduct

The project follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). zenchi-zenno targets personal and later organizational knowledge — treat **privacy and data sovereignty** as first-class concerns.

Harassment, doxxing, or posting others' private exports/PII in issues will result in bans and content removal.

---

## Conflict with commercial product

OSS maintainers prioritize:

1. Local-first Personal OS usability
2. Open Connector SPI and schemas
3. Clear documentation of commercial boundaries

Commercial product roadmap must not block merging OSS-compatible kernel improvements that meet CONTRIBUTING standards.
