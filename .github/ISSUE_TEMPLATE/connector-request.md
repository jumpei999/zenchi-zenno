---
name: Connector request
about: Propose a new source connector for zenchi-zenno
title: '[Connector] '
labels: connector
---

## Source system

<!-- e.g. GitHub, Slack, Notion, custom MCP server -->

## Available transports

- [ ] API
- [ ] Export (file bundle)
- [ ] MCP

## Motivation

<!-- Why should zenchi-zenno support this source? What knowledge is currently unreachable? -->

## Observation types

<!-- What source_type values would this connector produce? e.g. code.change, chat.thread -->

| Source object | observation.source_type | Notes |
| ------------- | ----------------------- | ----- |
|               |                         |       |

## Entity mapping (candidates)

<!-- What entity types might extraction target? Remember: connectors produce Observations only. -->

| Observation | Likely entities (hypothesis) |
| ----------- | ---------------------------- |
|             |                              |

## Authentication and limits

<!-- OAuth, API keys, export-only, rate limits, webhook support -->

## Example data

<!-- Link to public fixture, redacted sample, or API docs. Do NOT attach personal exports. -->

## References

- [Connector SPI](../docs/connector-spi.md)
- [Architecture](../docs/ARCHITECTURE.md)
