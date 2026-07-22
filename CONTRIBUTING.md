# Contributing to zenchi-zenno

English | [日本語](CONTRIBUTING.ja.md)

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
pnpm zz init
pnpm zz ingest --connector markdown-local --path ./fixtures/notes
pnpm zz confirm --list
```

Japanese CLI UI (optional):

```bash
pnpm zz --lang ja --help
ZZ_LANG=ja pnpm zz confirm --list
```

### Hypothesis workflow

**Decision** and **Idea** extractions from sources start as **hypotheses**. Do not treat them as ground truth until confirmed. Source-derived **Artifacts** (commits, docs, chats) are auto-confirmed as observation facts and do not appear in the default confirm queue.

```bash
pnpm zz confirm --list                 # Decision/Idea + evidence + confidence bands
pnpm zz confirm --accept <id>          # single accept
pnpm zz confirm --reject <id>          # single reject (hidden from default search)
pnpm zz confirm --accept-all --type Decision   # bulk (use carefully)
pnpm zz create --type Person --title "Ada" --identity github:ada
pnpm zz mcp                            # local MCP egress for agents
```

Low-confidence Decision/Idea hypotheses should usually stay hypothesized until a human reviews the evidence.

## Documentation languages

- **English is canonical.** Japanese translations are published beside English files as `*.ja.md`.
- When you edit an English document that has a Japanese sibling, update the matching `*.ja.md` in the **same PR**.
- Do not add CI auto-translation. Cursor-assisted drafts are fine; humans review before merge.
- Legal / governance Japanese pages are non-authoritative if they conflict with English.

## Code style

TypeScript and JSON are formatted and linted with [Biome](https://biomejs.dev/). Markdown is formatted with [Prettier](https://prettier.io/) (Biome Markdown support is not production-ready yet).

```bash
pnpm check        # Biome + Prettier (CI and local gate)
pnpm check:fix    # apply safe fixes / formatting
```

Husky runs `lint-staged` on pre-commit (Biome for staged `*.{ts,json}`, Prettier for staged `*.md`). CI runs `pnpm check` before build.

For VS Code or Cursor, install the workspace-recommended extensions (Biome and Prettier). Format on save is enabled via [`.vscode/settings.json`](.vscode/settings.json).

Agent-oriented conventions live under [`.cursor/rules/`](.cursor/rules/). Local-only rules go in `.cursor/rules/private/` (gitignored).

## Commit messages (Conventional Commits)

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Releases are driven by [semantic-release](https://semantic-release.gitbook.io/) from commit history on `main`.

| Type       | When to use                     | Version impact           |
| ---------- | ------------------------------- | ------------------------ |
| `feat`     | New user-visible capability     | minor                    |
| `fix`      | Bug fix                         | patch                    |
| `docs`     | Documentation only              | none (unless configured) |
| `chore`    | Build, CI, tooling, deps        | none                     |
| `refactor` | Code change with no feature/fix | none                     |
| `test`     | Tests only                      | none                     |
| `ci`       | CI configuration                | none                     |
| `perf`     | Performance improvement         | patch                    |

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

Maintainers merge to `main`. [semantic-release](https://semantic-release.gitbook.io/) then runs on push (also available via **Actions → Release → Run workflow**). It:

1. Determines the next SemVer from Conventional Commits
2. Updates `CHANGELOG.md` and package versions (locked across the monorepo)
3. Publishes `@zenchi-zenno/*` to npm via **Trusted Publishing (OIDC)** with provenance — no `NPM_TOKEN` secret is used
4. Creates a GitHub Release and git tag

Publishing requires a Trusted Publisher (GitHub Actions → `release.yml`) configured for each `@zenchi-zenno/*` package on npmjs.com **before the first release of that package**, and pnpm 11+ / Node 22.14+ in CI.

`@semantic-release/git` pushes version bump commits directly to `main`. Maintainers must configure a fine-grained PAT (Token name `zenchi-zenno-release`) as the Actions secret `RELEASE_GITHUB_TOKEN`, and set that PAT owner to **Exempt** on the `main` ruleset Bypass list (the default `GITHUB_TOKEN` cannot bypass required PRs / status checks).

An accidental `1.0.0` publish was yanked from npm. Those package names **cannot reuse `1.0.0`** on the registry; a future GA should use `1.0.1` (or later). Current line is `0.x` (baseline tag `v0.1.0`). Avoid `BREAKING CHANGE` / `!` commits until you intend to leave `0.x` (they bump **major**).

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
