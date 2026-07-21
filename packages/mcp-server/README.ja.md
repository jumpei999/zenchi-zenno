> **日本語版**（正本は英語: [README.md](README.md)）。解釈が異なる場合は英語版を優先します。
>
> [English](README.md) | 日本語

# @zenchi-zenno/mcp-server

zenchi-zenno Personal MVP 向けのローカル MCP **egress**。

stdio（JSON-RPC）経由で正規知識ツールを公開します:

| ツール               | 目的                                                    |
| -------------------- | ------------------------------------------------------- |
| `search_entities`    | 全文検索                                                |
| `get_decision_trace` | Decision → Evidence / `derived_from` / 関連エンティティ |
| `list_evidence`      | エンティティ ID の Evidence スニペット                  |
| `list_hypotheses`    | `zz confirm --list` 相当                                |

## 実行

```bash
# pnpm build と zz init + ingest の後
pnpm zz mcp
# または
pnpm --filter @zenchi-zenno/mcp-server exec zz-mcp --data-dir ./.zz
```

Cursor / Claude MCP 設定例:

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

本パッケージは、生のコネクタ内部ではなく **正規エンティティ** を操作します。
