# Contributing to zenchi-zenno

Thank you for your interest in zenchi-zenno. See also [GOVERNANCE.md](GOVERNANCE.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [SECURITY.md](SECURITY.md), and [TRADEMARK.md](TRADEMARK.md).

## What to contribute now

- Architecture feedback and corrections
- Ontology / SPI proposals ([ontology-change](.github/ISSUE_TEMPLATE/ontology-change.md))
- Connector requests ([connector-request](.github/ISSUE_TEMPLATE/connector-request.md))
- Bug fixes and tests for `@zenchi-zenno/core`, connectors, and CLI
- Documentation improvements

## What not to contribute here

- Team Workspace / cloud tenancy / SSO (commercial — see [docs/commercial-boundary.md](docs/commercial-boundary.md))
- Monetization or paywall logic in the OSS kernel
- Breaking ontology changes without migration notes and an RFC

## Developer setup

```bash
pnpm install
pnpm build
pnpm zenchi init
pnpm zenchi ingest --connector markdown-local --path ./fixtures/notes
```

## Commit messages (Conventional Commits)

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Releases are driven by [semantic-release](https://semantic-release.gitbook.io/) from commit history on `main`.

| Type | When to use | Version impact |
|------|-------------|----------------|
| `feat` | New user-visible capability | minor |
| `fix` | Bug fix | patch |
| `docs` | Documentation only | none (unless configured) |
| `chore` | Build, CI, tooling, deps | none |
| `refactor` | Code change with no feature/fix | none |
| `test` | Tests only | none |
| `ci` | CI configuration | none |
| `perf` | Performance improvement | patch |

Breaking changes: add `BREAKING CHANGE:` in the commit body, or use `feat!:` / `fix!:` — these trigger a **major** bump.

### Recommended: Commitizen

```bash
pnpm commit
```

This runs an interactive prompt that produces a valid message. DCO `Signed-off-by:` is appended automatically by Husky. **commitlint** runs on every `commit-msg`; invalid messages are rejected locally. CI also lint-checks PR commits against `main`.

Examples:

```text
feat: add local full-text search projection
fix: preserve provenance ids on re-ingest
docs: clarify Event vs domain event in glossary
chore: bump typescript to 5.7
feat!: rename Decision status enum values

BREAKING CHANGE: Decision.status now uses confirmed|rejected instead of done|failed.
```

## DCO

Phase 0–1 uses **[DCO 1.1](DCO)**. By signing off, you certify the terms in that document.

Husky adds `Signed-off-by:` automatically on every commit (`prepare-commit-msg`, equivalent to `git commit -s`). The `commit-msg` hook rejects commits that lack it.

```bash
git commit -m "feat: your change"
# or
pnpm commit
```

You do not need to pass `-s` manually unless hooks are bypassed (`git commit --no-verify`).

## Releases

Maintainers merge to `main`. [semantic-release](https://semantic-release.gitbook.io/) then:

1. Determines the next SemVer from Conventional Commits
2. Updates `CHANGELOG.md` and package versions (locked across the monorepo)
3. Publishes `@zenchi-zenno/*` to npm
4. Creates a GitHub Release and git tag

Contributors do **not** publish packages under `@zenchi-zenno` without maintainership. See [GOVERNANCE.md](GOVERNANCE.md).

## Documentation standards

- Architecture docs: **English**, Markdown, **Mermaid** for diagrams
- Follow [ubiquitous-language.md](docs/ubiquitous-language.md)
- Distinguish Domain Events from Event entities

## Pull request process

1. Open an issue for significant ontology or architecture changes
2. Keep PRs focused
3. Update cross-links if you add or rename docs
4. Do not commit secrets, personal exports, or PII

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Be respectful. Treat privacy and data sovereignty as first-class concerns.
