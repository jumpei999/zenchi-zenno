# License Strategy

Decision record for OSS licensing and the future commercial repository.

**Status:** Decided for Phase 0–1; revisit **before Phase 2 (Team / Cloud)** implementation.  
**Related:** [commercial-boundary.md](commercial-boundary.md) · [LICENSE](../LICENSE) · [GOVERNANCE.md](../GOVERNANCE.md)

---

## Decision (Phase 0–1)

| Item                    | Decision                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Current OSS license** | **MIT** (retain)                                                                                            |
| **Rationale**           | Maximize early community adoption and contributor frictionlessness while architecture and Personal MVP ship |
| **Commercial code**     | Not in this repo yet; no revenue features in Phase 1                                                        |
| **Revisit gate**        | Before implementing Team Workspace, managed sync SaaS, or Enterprise Policy                                 |

---

## Decision for Phase 2+ (pre-commitment)

When Team / Cloud work begins, adopt the following **default plan** unless an RFC changes it:

| Item                                         | Planned choice                                                          | Why                                                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **OSS license migration**                    | **Apache License 2.0**                                                  | Enterprise-friendly; patent grant; common in cloud-native OSS; clearer contribution stories than MIT for companies |
| **Alternative if SaaS freeloading is acute** | **AGPL-3.0** for network-facing OSS services                            | Stronger copyleft against closed SaaS rehosts of the OSS server                                                    |
| **Commercial repo**                          | Separate **`zenchi-zenno-cloud`**                                       | Keeps kernel open; clear Open Core boundary                                                                        |
| **Commercial license**                       | **BSL 1.1** (Change License → Apache after ~4 years) **or** proprietary | Room to charge for collaboration / ops without relicensing the OSS kernel mid-flight                               |

**Preferred primary path:** Apache 2.0 (OSS) + BSL/proprietary (`zenchi-zenno-cloud`).

**Escalation path:** If a well-funded host rehosts the OSS API without contributing, reconsider AGPL for server packages only — document via RFC.

---

## What stays open under either path

Always OSS (per [commercial-boundary.md](commercial-boundary.md)):

- Canonical knowledge model and schemas
- Connector SPI and basic connectors
- Local Personal CLI
- Basic MCP egress tools

Never “paywalled kernel ontology.”

---

## Migration checklist (execute at Phase 2 start)

- [ ] Community notice (Discussions + README) **≥ 14 days** before LICENSE file change
- [ ] Replace `LICENSE` with Apache-2.0 text (or AGPL if that RFC wins)
- [ ] Update README / package metadata SPDX identifiers
- [ ] Add `NOTICE` if Apache 2.0
- [ ] Create `zenchi-zenno-cloud` private or public-BSL repository
- [ ] Point commercial-boundary.md at the live cloud repo URL
- [ ] Confirm CLA vs DCO for cloud and/or Enterprise customer needs

---

## Explicit non-decisions (deferred)

| Topic                               | Deferred until                            |
| ----------------------------------- | ----------------------------------------- |
| Exact BSL change date               | First cloud release                       |
| CLA legal entity                    | First Enterprise design partner           |
| Trademark registration jurisdiction | After public launch and name confirmation |

---

## Approval

This document constitutes the **Phase 2 license and cloud-repo policy decision** for the monetization plan. Changing it requires an RFC under [GOVERNANCE.md](../GOVERNANCE.md).
