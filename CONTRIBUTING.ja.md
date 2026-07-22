> **日本語版**（正本は英語: [CONTRIBUTING.md](CONTRIBUTING.md)）。解釈が異なる場合は英語版を優先します。
>
> [English](CONTRIBUTING.md) | 日本語

# zenchi-zenno へのコントリビュート

zenchi-zenno への関心に感謝します。あわせて [GOVERNANCE.md](GOVERNANCE.ja.md)、[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.ja.md)、[SECURITY.md](SECURITY.ja.md)、[TRADEMARK.md](TRADEMARK.ja.md) を参照してください。

## 今コントリビュートできること

- アーキテクチャへのフィードバックと修正
- オントロジー / SPI 提案（[ontology-change](.github/ISSUE_TEMPLATE/ontology-change.md)）
- コネクタ要望（[connector-request](.github/ISSUE_TEMPLATE/connector-request.md)）
- `@zenchi-zenno/core`、コネクタ、CLI のバグ修正とテスト
- ドキュメント改善

## ここでコントリビュートしないこと

- Team Workspace / クラウドテナンシ / SSO（商用 — [docs/commercial-boundary.md](docs/commercial-boundary.ja.md) を参照）
- OSS カーネルへのマネタイズやペイウォールロジック
- 移行ノートと RFC なしの破壊的オントロジー変更

## 開発者セットアップ

```bash
pnpm install
pnpm build
pnpm zz init
pnpm zz ingest --connector markdown-local --path ./fixtures/notes
pnpm zz confirm --list
```

CLI を日本語表示にする（任意）:

```bash
pnpm zz --lang ja --help
ZZ_LANG=ja pnpm zz confirm --list
```

### 仮説ワークフロー

ソースから抽出された **Decision** / **Idea** は **仮説** から始まります。確認するまで真実として扱わないでください。ソース由来の **Artifact**（commit・文書・チャット）は観測事実として自動確定され、既定の confirm キューには出ません。

```bash
pnpm zz confirm --list                 # Decision/Idea + Evidence + confidence 帯
pnpm zz confirm --accept <id>          # 単体 accept
pnpm zz confirm --reject <id>          # 単体 reject（既定検索から除外）
pnpm zz confirm --accept-all --type Decision   # 一括（慎重に）
pnpm zz create --type Person --title "Ada" --identity github:ada
pnpm zz mcp                            # エージェント向けローカル MCP egress
```

低信頼度の Decision/Idea 仮説は、人間が Evidence をレビューするまで通常は仮説のままにしてください。

## ドキュメントの言語

- **英語が正本**です。日本語版は英語ファイルと同階層の `*.ja.md` として公開します。
- 対応する日本語版がある英語文書を編集するときは、**同じ PR** で `*.ja.md` も更新してください。
- CI による自動翻訳は行いません。Cursor による下書きは可、マージ前に人がレビューします。
- 法務・ガバナンスの日本語版は、英語と食い違う場合は英語を優先します。

## コードスタイル

TypeScript と JSON は [Biome](https://biomejs.dev/) でフォーマット・リントします。Markdown は [Prettier](https://prettier.io/) でフォーマットします（Biome の Markdown 対応はまだ本番向けではありません）。

```bash
pnpm check        # Biome + Prettier（CI とローカルのゲート）
pnpm check:fix    # 安全な修正 / フォーマットを適用
```

Husky は pre-commit で `lint-staged` を実行します（staged の `*.{ts,json}` は Biome、staged の `*.md` は Prettier）。CI はビルド前に `pnpm check` を実行します。

VS Code または Cursor では、ワークスペース推奨拡張（Biome と Prettier）を入れてください。保存時フォーマットは [`.vscode/settings.json`](.vscode/settings.json) で有効です。

エージェント向けの規約は [`.cursor/rules/`](.cursor/rules/) にあります。ローカル専用ルールは `.cursor/rules/private/`（gitignore 対象）に置きます。

## コミットメッセージ（Conventional Commits）

本プロジェクトは [Conventional Commits](https://www.conventionalcommits.org/) を使います。リリースは `main` のコミット履歴から [semantic-release](https://semantic-release.gitbook.io/) が駆動します。

| Type       | いつ使うか                             | バージョン影響   |
| ---------- | -------------------------------------- | ---------------- |
| `feat`     | ユーザーに見える新機能                 | minor            |
| `fix`      | バグ修正                               | patch            |
| `docs`     | ドキュメントのみ                       | なし（設定次第） |
| `chore`    | ビルド、CI、ツール、依存関係           | なし             |
| `refactor` | 機能追加・バグ修正を伴わないコード変更 | なし             |
| `test`     | テストのみ                             | なし             |
| `ci`       | CI 設定                                | なし             |
| `perf`     | パフォーマンス改善                     | patch            |

破壊的変更: コミット本文に `BREAKING CHANGE:` を追加するか、`feat!:` / `fix!:` を使う — **major** バンプになります。

### 推奨: Commitizen

```bash
pnpm commit
```

対話プロンプトで有効なメッセージを生成します。DCO の `Signed-off-by:` は Husky が自動付与します（`git commit -s` 相当）。毎回の `commit-msg` で **commitlint** が実行され、不正なメッセージはローカルで拒否されます。CI も PR のコミットを `main` 基準で検証します。

例:

```text
feat: add local full-text search projection
fix: preserve provenance ids on re-ingest
docs: clarify Event vs domain event in glossary
chore: bump typescript to 5.7
feat!: rename Decision status enum values

BREAKING CHANGE: Decision.status now uses confirmed|rejected instead of done|failed.
```

## DCO

Phase 0–1 は **[DCO 1.1](DCO)** を使います。署名により、その文書の条件に同意したことを証明します。

Husky がすべてのコミットに `Signed-off-by:` を自動付与します（`prepare-commit-msg`、`git commit -s` 相当）。`commit-msg` フックは、これがないコミットを拒否します。

```bash
git commit -m "feat: your change"
# または
pnpm commit
```

フックをバイパスしない限り（`git commit --no-verify`）、手動で `-s` を付ける必要はありません。

## リリース

メンテナーが `main` にマージします。[semantic-release](https://semantic-release.gitbook.io/) が次を行います:

1. Conventional Commits から次の SemVer を決定
2. `CHANGELOG.md` とパッケージバージョンを更新（モノレポ全体でロック）
3. `@zenchi-zenno/*` を npm に公開
4. GitHub Release と git タグを作成

メンテナーシップなしでは、コントリビューターは `@zenchi-zenno` 配下へパッケージを公開しません。[GOVERNANCE.md](GOVERNANCE.ja.md) を参照してください。

## ドキュメント規約

- アーキテクチャ文書: **英語**、Markdown、図は **Mermaid**
- [ubiquitous-language.md](docs/ubiquitous-language.ja.md) に従う
- Domain Event と Event エンティティを区別する

## プルリクエストの流れ

1. 重要なオントロジー / アーキテクチャ変更は先に issue を開く
2. PR は焦点を絞る
3. ドキュメントの追加・改名時はクロスリファレンスを更新
4. シークレット、個人エクスポート、PII をコミットしない

## 行動規範

本プロジェクトは [Contributor Covenant](CODE_OF_CONDUCT.ja.md) に従います。敬意を持ってください。プライバシーとデータ主権を第一級の関心事として扱います。
