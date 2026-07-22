import type { Messages } from './types.js';

export const ja: Messages = {
  'cli.description':
    'zenchi-zenno Personal Knowledge OS CLI（OSS・ローカルファースト）',
  'cli.lang_option': 'CLI の表示言語（en | ja）',
  'option.data_dir': 'ワークスペースディレクトリ',
  'option.workspace_name': 'ワークスペース名',
  'option.entity_type': 'エンティティ型で絞り込む',
  'init.description': '.zz/ 配下に個人ワークスペースを初期化する',
  'init.initialized': 'ワークスペース {id} を {path} に初期化しました',
  'ingest.description':
    'コネクタ経由で Observation を取り込み、エンティティを抽出する',
  'ingest.option.connector': 'markdown-local | chatgpt-export | github',
  'ingest.option.path':
    'エクスポートパスまたはディレクトリ（GitHub API モード以外は必須）',
  'ingest.option.repo':
    'GitHub API モード: リポジトリ（GITHUB_TOKEN または ZZ_GITHUB_TOKEN を使用）',
  'ingest.option.limit':
    'GitHub API モード: 種別ごとの最大件数（デフォルト 30）',
  'ingest.error.token_required':
    'GitHub API モードには環境変数 GITHUB_TOKEN または ZZ_GITHUB_TOKEN が必要です。',
  'ingest.error.path_or_repo':
    'エクスポート／ローカルコネクタには --path を、API モードには GitHub トークン付きの --repo を指定してください。',
  'ingest.note_review':
    'ソース由来 Artifact は自動確定されます。Decision/Idea 仮説の確認: zz confirm --list',
  'search.description': '正規エンティティの全文検索',
  'search.argument.query': '検索クエリ',
  'search.no_matches': '一致するものがありません。',
  'trace.description':
    'Decision 考古学: Decision → evidence、derived_from、関連エンティティを辿る',
  'trace.option.query': 'トピックまたはキーワード',
  'trace.no_matches':
    '一致する Decision がありません。クエリを広げるか、さらにソースを取り込んでください。',
  'trace.decision_header': '── Decision ──',
  'trace.related_entities': '  related_entities（共有 evidence）:',
  'confirm.description':
    'Decision/Idea 仮説の一覧または確定／却下（ソース由来 Artifact は自動確定）',
  'confirm.option.list': 'Decision/Idea 仮説と evidence を一覧（デフォルト）',
  'confirm.option.accept': 'エンティティ ID を確定する',
  'confirm.option.reject': 'エンティティ ID を却下する',
  'confirm.option.accept_all': '一覧の仮説をすべて確定する（--type を尊重）',
  'confirm.option.reject_all': '一覧の仮説をすべて却下する（--type を尊重）',
  'confirm.hypothesis_header': '── 仮説 ──',
  'confirm.no_hypotheses': '仮説の Decision/Idea はありません。',
  'confirm.list_count': '{count} 件の仮説 Decision/Idea（未確定）:\n',
  'confirm.list_count_one': '1 件の仮説 Decision/Idea（未確定）:\n',
  'confirm.tip_low_confidence':
    'ヒント: Decision/Idea 仮説は accept するまで暫定扱いです。ソース由来 Artifact は自動確定されます。',
  'confirm.none_to_action': '{action} 対象の仮説エンティティはありません。',
  'confirm.confirmed': '確定しました {type} {id}: {title}',
  'confirm.rejected': '却下しました {type} {id}: {title}',
  'confirm.accepted_n': '{count} 件の仮説を確定しました。',
  'confirm.rejected_n': '{count} 件の仮説を却下しました。',
  'confirm.entity_not_found': 'エンティティが見つかりません',
  'create.description':
    '確定済みエンティティを手動作成する（Person/Project/Interest/Learning、または任意の型）',
  'create.option.type': 'エンティティ型（{types}）',
  'create.option.title': 'エンティティのタイトル',
  'create.option.summary': '短い要約',
  'create.option.status': 'ライフサイクル状態',
  'create.option.tag': 'タグ（繰り返し指定可）',
  'create.option.goal': 'Project.goal 属性',
  'create.option.identity': 'Person の identity キー（例: github:ada）',
  'create.error.identity':
    'identity は kind:value 形式にしてください（例: github:ada）',
  'create.created': '作成しました [confirmed] {type} {id}\n  {title}',
  'export.description': '正規知識を JSON でエクスポートする（データ可搬性）',
  'mcp.description':
    'エージェント向けローカル MCP egress サーバー（stdio）を起動する',
  'errors.workspace_missing':
    'ワークスペースが初期化されていません: {root}\n実行: zz init',
  'errors.unknown_connector': '不明なコネクタ: {name}',
  'errors.unknown_entity_type':
    '不明なエンティティ型: {raw}\n有効な値: {valid}',
  'labels.type': 'type',
  'labels.id': 'id',
  'labels.title': 'title',
  'labels.summary': 'summary',
  'labels.confidence': 'confidence',
  'labels.status': 'status',
  'labels.extractor': 'extractor',
  'labels.evidence': 'evidence',
  'labels.evidence_none': 'evidence: （なし）',
  'labels.source': 'source',
  'labels.native_id': 'native_id',
  'labels.snippet': 'snippet',
  'labels.actions': 'actions',
  'labels.state': 'state',
  'labels.observation': 'observation',
  'labels.relation': 'relation',
  'labels.hypothesis_section': '仮説',
  'format.entity_line':
    '{tag} {type} {id}\n  {title}\n  confidence={confidence} ({band}) evidence={evidence}',
  'format.state_line':
    'state: {state} (status={status}) confidence={confidence} ({band})',
};
