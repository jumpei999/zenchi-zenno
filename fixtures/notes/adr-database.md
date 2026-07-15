# Decision: adopt PostgreSQL for the event log

We decided to use PostgreSQL as the primary event log store for local and
team deployments.

Rationale: mature JSONB support, familiar ops, and easier local-first migration
paths than introducing a specialized queue early.

Alternatives considered: NATS JetStream, file-only append logs.
