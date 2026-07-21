> **日本語版**（正本は英語: [README.md](README.md)）。解釈が異なる場合は英語版を優先します。
>
> [English](README.md) | 日本語

<a id="zenchi-zenno"></a>

# zenchi-zenno

**zenchi-zenno — 正規ナレッジ オペレーティング システム**

_全知全能の知識OSへ —全知で実践的な知識を目指して_。

[![Status](https://img.shields.io/badge/status-Phase%201--usable-brightgreen)](#status)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

zenchi-zenno は、コミット、ドキュメント、会話、エクスポートなど散在する活動のシグナルを、共有可能な知識概念 (`Decision`、`Idea`、`Project`、`Person`、`Interest`、`Learning`、`Artifact`、`Event`) へ継続的に正規化します。**初日から存在するスーパーアーキテクト**のように振る舞い、追跡可能な意思決定、Evidence（根拠）に裏付けられた回答、時間とともに進化する知識を提供するよう設計されています。

**これは別の RAG ラッパーではありません。** 取得はプロジェクションです。製品の中心は、来歴、仮説の確認、イベントソーシングによる進化を備えた正規知識モデルです。

<a id="status"></a>

## 状態

**フェーズ 1 — 個人 MVP（usable）。** ローカルファースト Personal Knowledge OS: 取り込み → 確認 → 検索 → decision-trace → MCP egress。Phase 1→2 ゲート（低摩擦の確認 + ラベル付き抽出 confidence）は Personal 用途で満たしています。**このリポジトリには収益化機能はありません**。

- **OSS:** 個人/ローカルでの使用は永久に**完全に無料**です (コミュニティ プラン)。
- **将来の商用:** チーム ワークスペース、マネージド クラウド、エンタープライズ ポリシーは個別に計画されています。[docs/commercial-boundary.md](docs/commercial-boundary.ja.md) を参照してください。

### Phase 1 で後回し（ラベル済み）

| 項目                                         | 状態                                                              |
| -------------------------------------------- | ----------------------------------------------------------------- |
| GitHub コネクタ                              | エクスポート + 任意の読み取り専用 REST API（`--repo` + トークン） |
| 一般エンティティグラフ（`get_entity_graph`） | 未出荷 — Decision 中心の `trace` / MCP `get_decision_trace` のみ  |
| Google Drive / Gmail / Calendar              | **Phase 2**                                                       |
| Person / Interest / Learning の自動抽出      | Phase 1 は手動 `zz create` のみ                                   |

<a id="quick-start"></a>

## クイックスタート

```bash
pnpm install
pnpm build
pnpm zz --help

# CLI を日本語表示にする（任意）: --lang ja / ZZ_LANG=ja / LANG=ja_JP.UTF-8
pnpm zz --lang ja --help
# ZZ_LANG=ja pnpm zz confirm --list

# 合成 / エクスポートフィクスチャを取り込み、確認して検索
pnpm zz init
pnpm zz ingest --connector markdown-local --path ./fixtures/notes
pnpm zz ingest --connector chatgpt-export --path ./fixtures/chatgpt-export
pnpm zz ingest --connector github --path ./fixtures/github

# ネットワークフットプリント（任意）: 読み取り専用 GitHub API で直近 commits/PRs
# export GITHUB_TOKEN=...   # または ZZ_GITHUB_TOKEN; scopes: contents:read, pull-requests:read
# pnpm zz ingest --connector github --repo owner/name

# 抽出結果は仮説 — Evidence を見てから accept / reject
pnpm zz confirm --list
pnpm zz confirm --accept <entity-id>

pnpm zz search "postgres"
pnpm zz trace --query "database"

# 手動エンティティ（Person / Project / Interest / Learning）
pnpm zz create --type Project --title "zenchi-zenno MVP" --goal "Ship Personal OS"

# 任意: エージェント向け MCP egress（stdio）
pnpm zz mcp
```

**Hypothesis → Confirmation:** ヒューリスティック抽出は Decision を自動確定しません。受け入れた知識として扱う前に、必ず `zz confirm` でレビューしてください。

## 言語

- **英語が正本**です（ドキュメントとドメイン識別子）。
- **日本語版**は英語正本と同階層の `*.ja.md` です（例: この [README.ja.md](README.ja.md)）。
- 対応する日本語版がある英語文書を変更するときは、**同じ PR** で `*.ja.md` も更新してください。
- CLI の表示言語: `--lang ja` または `ZZ_LANG=ja`（JSON キーやエンティティ型名は変わりません）。

<a id="scope-continuum"></a>

## スコープ連続体

| フェーズ | フォーカス                                                  |
| -------- | ----------------------------------------------------------- |
| 今       | Personal Knowledge OS (OSS、ローカル優先)                   |
| 将来     | Project Knowledge OS + オプションのクラウド / チーム (商用) |

<a id="documentation"></a>

## ドキュメント

| ドキュメント                                                                | 説明                                               |
| --------------------------------------------------------------------------- | -------------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.ja.md)                             | マスター アーキテクチャ (11 セクション)            |
| [docs/agent-skill-decision-trace.md](docs/agent-skill-decision-trace.ja.md) | エージェントスキル: Decision + Evidence            |
| [docs/dogfood-backlog.md](docs/dogfood-backlog.md)                          | Phase 1 dogfood 優先バックログ                     |
| [docs/knowledge-model.md](docs/knowledge-model.ja.md)                       | Entity タイプ、関係、ライフサイクル                |
| [docs/event-model.md](docs/event-model.ja.md)                               | ドメイン イベント カタログ、冪等性                 |
| [docs/connector-spi.md](docs/connector-spi.ja.md)                           | Connector 契約 (API / Export / MCP)                |
| [docs/ubiquitous-language.md](docs/ubiquitous-language.ja.md)               | 用語集                                             |
| [docs/commercial-boundary.md](docs/commercial-boundary.ja.md)               | OSS と商業境界線                                   |
| [docs/license-strategy.md](docs/license-strategy.ja.md)                     | 現在 MIT Apache + フェーズ 2 のクラウド リポジトリ |
| [docs/launch.md](docs/launch.md)                                            | マニュアル GitHub 公開チェックリスト               |
| [GOVERNANCE.md](GOVERNANCE.ja.md)                                           | Project ガバナンス                                 |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)                                    | コミュニティ基準                                   |
| [SECURITY.md](SECURITY.md)                                                  | 脆弱性報告                                         |
| [DCO](DCO)                                                                  | Developer Certificate of Origin                    |
| [TRADEMARK.md](TRADEMARK.ja.md)                                             | 商標ポリシー                                       |

<a id="repository-map"></a>

## リポジトリマップ

```text
zenchi-zenno/
├── docs/              # Architecture and specifications
├── packages/
│   ├── core/          # Domain types, event log, entity store
│   ├── connector-spi/ # Connector interface
│   ├── projections/   # 全文検索（ローカル）
│   ├── mcp-server/    # MCP egress（stdio ツール）
│   └── cli/           # Personal CLI
├── connectors/        # chatgpt-export, github, markdown-local
├── fixtures/          # Synthetic demos (no personal data)
└── schemas/           # Draft JSON Schema stubs
```

<a id="design-highlights"></a>

## デザインのハイライト

- **正規オントロジー** — チャット ログではなく、8 つのエンティティ タイプ
- **出所** — すべての主張は証拠にリンクしています
- **Hypothesis → Confirmation** — 設計による抽出の正直さ
- **Connector-agnostic** — API、Export、および MCP はピアです
- **ローカルファースト対応** — OSS ユーザーのデータ主権
- **個人 → Project** — 1 つのカーネル、進化するテナント

<a id="contributing"></a>

## 貢献する

[CONTRIBUTING.md](CONTRIBUTING.ja.md)、[GOVERNANCE.md](GOVERNANCE.ja.md)、[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) を参照してください。

<a id="license"></a>

## ライセンス

[MIT](LICENSE) — フェーズ 2 計画については、[docs/license-strategy.md](docs/license-strategy.ja.md) も参照してください。
