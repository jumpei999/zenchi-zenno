> **日本語版**（正本は英語: [README.md](README.md)）。解釈が異なる場合は英語版を優先します。
>
> [English](README.md) | 日本語

# Connectors

Phase 1 Personal MVP コネクタ。既定はローカル / エクスポート輸送です。GitHub は任意の読み取り専用 REST API もサポートします。

| Package                                  | Transport                                     | Observation types               | Live API                                   |
| ---------------------------------------- | --------------------------------------------- | ------------------------------- | ------------------------------------------ |
| `@zenchi-zenno/connector-markdown-local` | ローカルファイル                              | `doc.revision`, `meeting.notes` | N/A                                        |
| `@zenchi-zenno/connector-chatgpt-export` | ChatGPT データエクスポート ZIP / JSON         | `ai.conversation`               | N/A                                        |
| `@zenchi-zenno/connector-github`         | エクスポート / fixture JSON **または** RO API | `code.change`, `code.review`    | 任意（`GITHUB_TOKEN` / `ZZ_GITHUB_TOKEN`） |

## GitHub: エクスポート + 任意の読み取り専用 API

### エクスポート / fixture モード

```bash
pnpm zz ingest --connector github --path ./fixtures/github
```

合成またはエクスポートされた JSON fixture を読みます（`fixtures/github/` 参照）。ネットワーク呼び出しなし。

### API モード（読み取り専用）

```bash
export GITHUB_TOKEN=ghp_...   # または ZZ_GITHUB_TOKEN
# PAT / fine-grained: contents:read, pull-requests:read
pnpm zz ingest --connector github --repo owner/name
# 任意: --limit 30
```

REST で直近の commits と closed/merged PRs を取得し、エクスポートモードと同じ `code.change` / `code.review` Observation にマップします。トークンは Observation 本文やログに書き込みません。

- Capabilities: `export_only: false`、`supported_transports: ['export','api']`
- ネットワークフットプリント評価: アクティブなリポから API ingest したうえで `confirm` / `trace` / MCP を使う

すべてのコネクタは [docs/connector-spi.md](../../docs/connector-spi.ja.md) を実装します。**Observations のみ**を生成し、エンティティ抽出は `@zenchi-zenno/core` で実行されます。
