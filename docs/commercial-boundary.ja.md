> **日本語版**（正本は英語: [commercial-boundary.md](commercial-boundary.ja.md)）。解釈が異なる場合は英語版を優先します。
>
> [English](commercial-boundary.ja.md) | 日本語

<a id="commercial-boundary"></a>

# 商業境界

zenchi-zenno ハイブリッド戦略におけるオープンソースと商用の公式定義。

**関連:** [ARCHITECTURE.md](ARCHITECTURE.ja.md) · [GOVERNANCE.md](../GOVERNANCE.ja.md) · [TRADEMARK.md](../TRADEMARK.ja.md) · [license-strategy.md](license-strategy.ja.md)

---

<a id="strategy-summary"></a>

## 戦略の概要

zenchi-zenno は **オープンコアのハイブリッド GTM** を使用します。

1. **OSS が最初** — Personal Knowledge OS、ローカルファースト、支払いなしで完全に使用可能
2. **商用は後で** — チーム / Project ワークスペース、マネージド クラウド、エンタープライズ ポリシー、プレミアム コネクタおよびエクストラクター

収益は、ナレッジ カーネルのロックからではなく、**運用、信頼、コラボレーション、および抽出品質**から得られます。

---

<a id="principle"></a>

## 原理

> OSS ユーザーは、自分のマシン上で完全な Personal Knowledge OS を実行できます (取り込み、確認、検索、意思決定トレース)。クラウドおよびチーム機能は**オプション**です。正規の知識は引き続き**エクスポート可能**です。

これは、[ARCHITECTURE §7 Storage](ARCHITECTURE.ja.md#7-storage-design) (エクスポート可能性、ローカル優先) と一致します。

---

<a id="open-source-this-repository"></a>

## オープンソース (このリポジトリ)

| エリア                         | 含まれるもの                                                                      | 理論的根拠                     |
| ------------------------------ | --------------------------------------------------------------------------------- | ------------------------------ |
| **カーネル**                   | Entity 型、関係、イベント ログ コントラクト、冪等                                 | 信頼性とフォーク耐性のあるコア |
| **Connector SPI**              | API / Export / MCP ピアトランスポートとして                                       | 生態系の成長                   |
| **基本的なコネクタ**           | ChatGPT エクスポート、GitHub (読み取り専用 / エクスポート)、ローカル マークダウン | 個人的な「働く」経験           |
| **個人 CLI**                   | `ingest`、`confirm`、`search`、`trace`                                            | Personal Knowledge OS UX       |
| **スキーマ**                   | [`schemas/`](../schemas/)                                                         | 相互運用性                     |
| **MCP 下り (基本)**            | `search_entities`、`get_decision_trace`、`list_evidence`、`list_hypotheses`       | エージェントの相互運用性       |
| **ドキュメントとオントロジー** | アーキテクチャ、ユビキタス言語、知識モデル                                        | コミュニティの重力             |

---

<a id="commercial-planned-separate-product"></a>

## コマーシャル（別製品予定）

ローカルの OSS 使用に対する人為的な制限としてではなく、**マネージド オファリング and/or、別の `zenchi-zenno-cloud` リポジトリ**として後で出荷されます。

| エリア                         | 含まれるもの                                                | なぜ支払ったのか                                                                                |
| ------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **チーム / Project Workspace** | マルチユーザー、共有 Decision グラフ、必須レビュー フロー   | コラボレーションの価値 ([ARCHITECTURE §5.9](ARCHITECTURE.ja.md#59-personal--project-evolution)) |
| **マネージド クラウド**        | ホスト型同期、バックアップ、マルチデバイス                  | 運用コスト + 利便性                                                                             |
| **エンタープライズ ポリシー**  | SSO/SAML、SCIM、ACL、監査ログ、保持、PII 編集               | コンプライアンス                                                                                |
| **プレミアム コネクタ**        | Slack / Gmail / ライブ同期、高頻度 Webhook を駆動する       | API とメンテナンス費用                                                                          |
| **プレミアム抽出**             | 高精度の Decision 抽出、重複排除、ID 解決                   | LLM コスト + チューニング                                                                       |
| **理由監査プラス**             | 長期 ReasoningEpisode 保持、検索、コンプライアンス レポート | 企業の説明責任                                                                                  |
| **SLA / サポート**             | 優先サポート、オンボーディング、カスタム コネクタ           | B2B標準                                                                                         |

---

<a id="monetization-hooks-product-not-kernel-locks"></a>

## 収益化フック (カーネル ロックではなく製品)

商業的な差別化は OSS の差別化要因にマップされます ([ARCHITECTURE §9](ARCHITECTURE.ja.md#9-oss-differentiation)):

| 能力                                          | 代表的なプラン   |
| --------------------------------------------- | ---------------- |
| Decision 証拠チェーンを共有した考古学         | チーム+          |
| チーム Hypothesis → Confirmation ワークフロー | チーム           |
| クロスソースリンク (例: Git + Slack + Drive)  | プロ+            |
| ReasoningEpisode 監査証跡                     | エンタープライズ |

---

<a id="pricing-outline-indicative-usd"></a>

## 価格の概要 (参考値、米ドル)

拘束力はありません。製品と GTM の調整:

| 計画                 | 観客           | 参考価格               | 含まれるもの                                 |
| -------------------- | -------------- | ---------------------- | -------------------------------------------- |
| **コミュニティ**     | 個人           | $0                     | 完全な OSS、ローカル、基本コネクタ           |
| **プロ**             | パワーユーザー | $12–20 / ユーザー / 月 | クラウド同期、追加コネクタ、高速抽出         |
| **チーム**           | スタートアップ | $25–40 / ユーザー / 月 | Project Workspace、共有確認、30 日間の監査   |
| **エンタープライズ** | 企業           | カスタム               | SSO、SCIM、無制限の監査、SLA、VPC オプション |

日本: 上記の約 0.8 ～ 1.2 倍以内の試験。初期の収益の焦点は **チーム** です。 **プロ** は個人→チームの橋渡しをします。

---

<a id="repository-layout-target"></a>

## リポジトリのレイアウト (ターゲット)

```text
zenchi-zenno/              # OSS (MIT now; Apache 2.0 under evaluation — see license-strategy.md)
  packages/core
  packages/connector-spi
  packages/projections
  connectors/*
  cli/                     # Phase 1+

zenchi-zenno-cloud/        # Commercial (BSL 1.1 or proprietary; planned)
  packages/tenancy
  packages/policy
  services/api
  services/sync
```

---

<a id="what-we-will-not-do"></a>

## やらないこと

- 正規オントロジーを独自のものにする
- ローカルの OSS 機能を人為的に無効にする
- MCP / Connector エコシステムを第三者に対して閉鎖する
- Personal Knowledge OS を使用するにはクラウドまたは MCP が必要です

---

<a id="change-control"></a>

## 変更制御

この境界を変更するには、以下が必要です。

1. このドキュメントを参照する RFC または問題
2. [GOVERNANCE.md](../GOVERNANCE.ja.md) に更新し、ユーザー向けの場合は公開 README を更新します。
3. 既存の OSS ユーザーの移行メモをクリアします
