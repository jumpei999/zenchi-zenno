> **日本語版**（正本は英語: [ubiquitous-language.md](ubiquitous-language.ja.md)）。解釈が異なる場合は英語版を優先します。
>
> [English](ubiquitous-language.ja.md) | 日本語

<a id="ubiquitous-language"></a>

# ユビキタス言語

この用語集は、zenchi-zenno 全体で一貫して使用される用語を定義します。疑問がある場合は、口語的な同義語よりもこれらの定義を優先してください。

**関連:** [ARCHITECTURE.md](ARCHITECTURE.ja.md) · [knowledge-model.md](knowledge-model.ja.md) · [event-model.md](event-model.ja.md)

---

<a id="core-terms"></a>

## 主要な用語

| 用語             | 定義                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------- |
| **出典**         | 外部システムまたはエクスポート バンドル (GitHub、ドライブ、Slack、ChatGPT エクスポートなど) |
| **Connector**    | ソースから観測値を生成する実装。 API / Export / MCP の違いを非表示                          |
| **SourceRecord** | 未加工のペイロード (またはコンテンツ アドレス参照) とメタデータ。ストア後は不変             |
| **Observation**  | ある時点でソース内で「何が見られたか」の正規化された記録                                    |
| **Evidence**     | Entity、Relation、または Claim から 1 つ以上の観測に戻るリンク                              |
| **Entity**       | 正規化された正規化ナレッジ オブジェクト (Decision、Idea、Project、...)                      |
| **Claim**        | エンティティの属性、関係、または状態に関するステートメント。多くの場合抽出由来              |
| **Hypothesis**   | 未確認の Claim と信頼度スコア                                                               |
| **Confirmation** | Hypothesis                                                                                  | を受け入れる、拒否する、またはマージする人間またはポリシーのアクション。 |
| **Relation**     | エンティティ間または証拠と知識の間の型付きセマンティック リンク                             |
| **Projection**   | 派生インデックスまたはビュー (フルテキスト、ベクター、タイムライン)。再構築可能、非正規     |
| **Workspace**    | 個人または Project の知識の境界 (テナント)                                                  |
| **Sensitivity**  | 処理クラス: `private`、`shareable`、`restricted`、…                                         |

---

<a id="entity-types"></a>

## Entity タイプ

| 用語         | 定義                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| **Decision** | 根拠、代替案、範囲を含む採用された選択                                      |
| **Idea**     | 未採用またはまだ Decision に昇格していない検討中のコンセプト                |
| **Project**  | 目標、期間、および含まれる知識を備えた限定された取り組み                    |
| **Person**   | 人間または安定したエージェントのアイデンティティ                            |
| **Interest** | 持続的な注目のトピックまたは領域                                            |
| **Learning** | 得られた理解の記録（失敗も含む）                                            |
| **Artifact** | 耐久性のある出力: ドキュメント、コード、図、メモ、エクスポート ファイルなど |
| **Event**    | 時間制限のあるイベント: 会議、リリース、会話セッション、メディア ビューなど |

---

<a id="temporal-and-system-terms"></a>

## 時間用語とシステム用語

| 用語                     | 定義                                                                            |
| ------------------------ | ------------------------------------------------------------------------------- |
| **Domain Event**         | 追加専用の内部システム ファクト (`ObservationIngested`、`EntityUpserted`、…)    |
| **Event** (エンティティ) | 知識モデルにおけるユーザー向けの出来事。 **ではありません** Domain Event        |
| **有効時間**             | 知識の一部が世界で真実だったとき (`valid_from`、`valid_to`)                     |
| **システム時間**         | zenchi-zenno が何かを記録または更新したとき (`created_at`、`updated_at`)        |
| **ReasoningEpisode**     | エージェントがどの entities/evidence を使用し、何を結論付けたかの監査可能な記録 |
| **CurationAction**       | Confirmation、ナレッジに適用される拒否、マージ、またはアーカイブ                |

---

<a id="terms-to-avoid-in-domain-language"></a>

## ドメイン言語で避けるべき用語

| 避ける                               | 代わりに使用してください                          |
| ------------------------------------ | ------------------------------------------------- |
| 「文書」（単独）                     | `Artifact` + 証拠                                 |
| 「記憶」（一人）                     | `Entity`、`ReasoningEpisode`、または `Projection` |
| 知識としての「埋め込み」             | `Projection` (ベクトルインデックス)               |
| コアの「GoogleDoc」/「SlackMessage」 | `Observation` と `source_type`                    |
| 「AIが決めた」                       | `Hypothesis` から `Confirmation` まで             |

---

<a id="disambiguation-examples"></a>

## 曖昧さ回避の例

<a id="observation-vs-entity"></a>

### Observation 対 Entity

- Git コミットは **Observation** (`code.change`) です。
- 「イベント ログに PostgreSQL を選択しました」は **Decision** エンティティであり、観察 (ADR、Slack スレッド、問題コメント) によって根拠付けられています。

<a id="domain-event-vs-event-entity"></a>

### Domain Event 対 Event エンティティ

- `ObservationIngested` は、システム ログ内の **Domain Event** です。
- 「2026-07-15 のアーキテクチャ レビュー ミーティング」は、ナレッジ グラフ内の **Event** エンティティです。

<a id="hypothesis-vs-confirmed"></a>

### Hypothesis vs 確認済み

- エクストラクターは、Slack スレッドから Decision を推論します → **Hypothesis** (`confirmation_state: hypothesized`)。
- ユーザーは CLI → **確認済み** (`HypothesisConfirmed` ドメイン イベント) で確認します。

---

<a id="naming-conventions"></a>

## 命名規則

- Entity 型名: PascalCase 列挙型 (`Decision`、`Artifact`)
- Relation 述語:snake_case (`promoted_to`、`decides_for`)
- ドメイン イベント名: PascalCase 過去形 (`EntityUpserted`)
- Observation `source_type`: ドット区切りの小文字 (`code.change`、`chat.thread`)
