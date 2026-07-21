> **日本語版**（正本は英語: [agent-skill-decision-trace.md](agent-skill-decision-trace.ja.md)）。解釈が異なる場合は英語版を優先します。
>
> [English](agent-skill-decision-trace.ja.md) | 日本語

# エージェントスキル: 意思決定の追跡可能性

**このスキルが答える問い:**

> X について何を決めたか、その Evidence（根拠）は何か？

これは Phase 1 Personal MVP のエージェントスキルです（ARCHITECTURE §10）。`.zz/` 配下のローカルワークスペースを使い、クラウドは不要です。

## 前提

```bash
pnpm install
pnpm build
pnpm zz init
```

少なくとも 1 ソースを取り込みます（デモなら fixtures で可）:

```bash
pnpm zz ingest --connector markdown-local --path ./fixtures/notes
# 任意の第 2 ソース
pnpm zz ingest --connector chatgpt-export --path ./fixtures/chatgpt-export
pnpm zz ingest --connector github --path ./fixtures/github
```

**ネットワークフットプリント**評価（実リポの commits / PRs）:

```bash
export GITHUB_TOKEN=ghp_...   # または ZZ_GITHUB_TOKEN
# fine-grained PAT: contents:read, pull-requests:read
pnpm zz ingest --connector github --repo owner/name
```

受け入れた知識として扱う前に仮説をレビューします:

```bash
pnpm zz confirm --list
pnpm zz confirm --accept <entity-id>
```

抽出器は Decision を自動確定しません。confidence 帯（`high` / `medium` / `low`）はラベルであり、真実ではありません。

## CLI ワークフロー

```bash
# 候補を探す
pnpm zz search "postgres"

# 意思決定考古学: Decision → Evidence → derived_from → 関連エンティティ
pnpm zz trace --query "database"
```

結果の読み方:

| フィールド             | 意味                                                   |
| ---------------------- | ------------------------------------------------------ |
| `state: hypothesized`  | まだ人間未確認 — 暫定として扱う                        |
| `state: confirmed`     | 受け入れた知識                                         |
| `confidence` + 帯      | ヒューリスティック抽出の確信度                         |
| `evidence` / `snippet` | 主張を正当化した Observation テキスト                  |
| `derived_from`         | エンティティからソース Observation へのリンク          |
| `related_entities`     | 同じ Evidence を共有する他エンティティ（例: Artifact） |

## MCP ワークフロー（エージェントクライアント）

ローカル stdio サーバーを起動:

```bash
pnpm zz mcp
# または: node packages/mcp-server/dist/cli.js --data-dir /absolute/path/to/.zz
```

Cursor / Claude Desktop 系の設定 — 詳細は [packages/mcp-server/README.md](../packages/mcp-server/README.md):

```json
{
  "mcpServers": {
    "zenchi-zenno": {
      "command": "node",
      "args": [
        "packages/mcp-server/dist/cli.js",
        "--data-dir",
        "/absolute/path/to/.zz"
      ]
    }
  }
}
```

| ツール               | 使うタイミング                                             |
| -------------------- | ---------------------------------------------------------- |
| `search_entities`    | キーワード / 型による広い探索                              |
| `get_decision_trace` | 「X について何を決めたか？」を Evidence グラフ付きで答える |
| `list_evidence`      | 1 つの entity id を掘る                                    |
| `list_hypotheses`    | `zz confirm --list` 相当 — accept 前のレビュー             |

エージェント向けプロンプト例:

> zenchi-zenno MCP の `get_decision_trace` を query `database` で呼んでください。各 Decision の confirmation state、confidence 帯、Evidence スニペットを要約してください。返ってこない Decision を捏造しないでください。

## 手動コンテキスト

Person / Project / Interest / Learning は Phase 1 では自動抽出しません:

```bash
pnpm zz create --type Project --title "zenchi-zenno MVP" --goal "Ship Personal OS"
pnpm zz create --type Person --title "Ada" --identity github:ada
```

## このスキルの対象外

- Google / Slack 同期（GitHub 読み取り専用 API ingest はサポート）
- 仮説エンティティを真実として扱うこと
- Decision 中心の trace を超える一般エンティティグラフ（`get_entity_graph` は延期）
