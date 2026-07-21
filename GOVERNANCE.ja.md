> **日本語版**（正本は英語: [GOVERNANCE.md](GOVERNANCE.md)）。解釈が異なる場合は英語版を優先します。
>
> [English](GOVERNANCE.md) | 日本語

# ガバナンス

zenchi-zenno オープンソースプロジェクトにおける意思決定の仕方。

**関連:** [CONTRIBUTING.md](CONTRIBUTING.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) · [SECURITY.md](SECURITY.md) · [docs/commercial-boundary.md](docs/commercial-boundary.ja.md) · [TRADEMARK.md](TRADEMARK.md)

---

## プロジェクト状況

zenchi-zenno は **初期ガバナンス** 段階です。メンテナーは少数（当初は創設メンテナー）で、コミュニティ入力は issues、Discussions、RFC 経由です。

コミュニティ成長に伴い、本ドキュメントにメンテナー委員会や投票ルールが追加されることがあります。

---

## 役割

| Role            | Responsibilities                                                           |
| --------------- | -------------------------------------------------------------------------- |
| **Maintainer**  | マージ権限、リリースタグ、オントロジースチュワードシップ、商用境界の健全性 |
| **Contributor** | PR、issues、docs、connectors（CONTRIBUTING に従う）                        |
| **RFC author**  | オントロジー、SPI、ライセンス戦略、商用境界への実質的変更を提案            |

---

## 決定の種類

### ルーチン

バグ修正、ドキュメントの誤字、コネクタ fixture、破壊的でないスキーマ明確化。

- **経路:** PR + メンテナーレビュー
- **SLA（努力目標）:** 初期フェーズで 1–2 週間

### オントロジー / SPI / アーキテクチャ（RFC）

新エンティティ型、関係述語、ドメインイベント、connector SPI の破壊、ストレージ契約の変更。

- **経路:**
  1. [ontology-change](.github/ISSUE_TEMPLATE/ontology-change.md) で issue を開くか、`docs/rfcs/` に専用 RFC を置く
  2. 議論期間（Phase 1 出荷後は最低 **7 日**。Phase 0 ではアーキテクチャがより速く動くことがある）
  3. メンテナーが書面で受理 / 却下
- **必須更新:** 受理時は [ubiquitous-language.md](docs/ubiquitous-language.md) と関連仕様を更新

### 商用境界とライセンス

機能を OSS と商用の間で移す変更、または OSS ライセンスの変更。

- **経路:** 公開提案 + メンテナー決定。[commercial-boundary.md](docs/commercial-boundary.ja.md) と [license-strategy.md](docs/license-strategy.md) に文書化
- **制約:** 無料として約束済みのローカル Personal OS を黙って損なうことはできない

---

## リリース方針

| Phase             | Release shape                                                    |
| ----------------- | ---------------------------------------------------------------- |
| Phase 0           | ドキュメントとスキーマ。タグ付きランタイムリリースは必須ではない |
| Phase 1+          | パッケージは SemVer。ユーザー向け変更は `CHANGELOG.md`           |
| Breaking ontology | major バンプ + 移行ノート                                        |

リリースは `main` へのマージ時に [semantic-release](https://semantic-release.gitbook.io/) で **自動化** されます（Conventional Commits → バージョンバンプ、`CHANGELOG.md`、GitHub Release、npm 公開）。メンテナーがパイプライン（ブランチ保護、`NPM_TOKEN`、npm スコープ）を所有します。メンテナーシップなしでは、コントリビューターは `@zenchi-zenno` 配下へ公開しません。

---

## コントリビューター同意

| Mechanism          | When                                                      |
| ------------------ | --------------------------------------------------------- |
| **[DCO 1.1](DCO)** | 初期 OSS（Phase 0–1）の既定。コミットに `Signed-off-by:`  |
| **CLA**            | Enterprise 販売前に、顧客法務が要求する場合に導入されうる |

CLA が公開されるまで DCO で十分です。

---

## コミュニケーション

| Channel                  | Use                                    |
| ------------------------ | -------------------------------------- |
| **GitHub Issues**        | バグ、コネクタ要望、オントロジー提案   |
| **GitHub Discussions**   | Q&A、デザインブレスト、ロードマップ    |
| **Discord**（予定）      | コネクタ開発者向けリアルタイムチャット |
| **Office Hours**（予定） | 月次。デモと Pro/Team の案内           |

---

## 行動規範

プロジェクトは [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) に従います。zenchi-zenno は個人、のちに組織の知識を対象とします — **プライバシーとデータ主権** を第一級の関心事として扱います。

ハラスメント、ドクシング、他人のプライベートなエクスポート / PII を issues に投稿すると、BAN とコンテンツ削除の対象になります。

---

## 商用プロダクトとの衝突

OSS メンテナーが優先すること:

1. ローカルファースト Personal OS の使いやすさ
2. オープンな Connector SPI とスキーマ
3. 商用境界の明確な文書化

商用ロードマップは、CONTRIBUTING に適合する OSS 互換カーネル改善のマージを妨げてはなりません。
