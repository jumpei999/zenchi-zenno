# Security Policy

zenchi-zenno is a local-first knowledge operating system. Security issues may affect **personal knowledge stores**, connector credentials, and ingestion pipelines. Please report vulnerabilities responsibly.

## Supported versions

| Version         | Supported                                |
| --------------- | ---------------------------------------- |
| `main` (latest) | Yes                                      |
| Tagged releases | Yes, until superseded by a newer release |
| Older tags      | Best-effort only                         |

## Reporting a vulnerability

**Do not** open a public GitHub Issue for security vulnerabilities.

Use one of the following:

1. **GitHub Private Vulnerability Reporting** (preferred once the repository is public)  
   Repository → **Security** → **Report a vulnerability**

2. **Maintainer contact**  
   If private reporting is unavailable, contact maintainers through a private channel listed in [GOVERNANCE.md](GOVERNANCE.md). Do not post exploit details in public Issues or Discussions.

## What to include

- A clear description of the issue and potential impact
- Steps to reproduce (commands, connector, fixture path, or minimal sample)
- Affected component (`@zenchi-zenno/core`, CLI, a connector, CI workflow, etc.)
- zenchi-zenno version or commit SHA
- Your environment (OS, Node.js version) if relevant

## What we commit to

- Acknowledge receipt within **7 days** (best effort during early phases)
- Provide a status update within **30 days**
- Coordinate disclosure after a fix or mitigation is available
- Credit reporters in the release notes when they agree

## Scope

In scope:

- Remote code execution, authentication bypass, or privilege escalation in shipped packages
- Path traversal, unsafe deserialization, or command injection in CLI / connectors
- Secrets or credentials written to logs, events, or committed artifacts
- CI/CD workflow weaknesses that could compromise releases

Out of scope (please use regular Issues):

- Social engineering
- Denial of service against a single user's local `.zenchi/` directory without a product defect
- Vulnerabilities in third-party services (GitHub, Google, Slack, etc.) unless zenchi-zenno misuses them
- Issues requiring physical access to an unlocked machine

## Safe harbor

We support good-faith security research. Do not access data you do not own. Do not degrade service for other users. Testing against your own local workspace and synthetic fixtures is encouraged.

## Personal data

zenchi-zenno ingests personal knowledge. When reporting:

- Use **synthetic fixtures** or redacted samples
- Do **not** attach real Gmail exports, Slack dumps, or other PII
- Describe data-flow issues without sharing private content

See also [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [CONTRIBUTING.md](CONTRIBUTING.md).
