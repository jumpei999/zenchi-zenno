import type { Messages } from './types.js';

export const en: Messages = {
  'cli.description':
    'zenchi-zenno Personal Knowledge OS CLI (OSS, local-first)',
  'cli.lang_option': 'CLI language (en | ja)',
  'option.data_dir': 'workspace directory',
  'option.workspace_name': 'workspace name',
  'option.entity_type': 'filter by entity type',
  'init.description': 'Initialize a personal workspace under .zz/',
  'init.initialized': 'Initialized workspace {id} at {path}',
  'ingest.description':
    'Ingest observations via a connector and extract entities',
  'ingest.option.connector': 'markdown-local | chatgpt-export | github',
  'ingest.option.path':
    'export path or directory (required except github API mode)',
  'ingest.option.repo':
    'GitHub API mode: repository (uses GITHUB_TOKEN or ZZ_GITHUB_TOKEN)',
  'ingest.option.limit':
    'GitHub API mode: max commits/PRs per type (default 30)',
  'ingest.error.token_required':
    'GitHub API mode requires GITHUB_TOKEN or ZZ_GITHUB_TOKEN in the environment.',
  'ingest.error.path_or_repo':
    'Provide --path for export/local connectors, or --repo with a GitHub token for API mode.',
  'ingest.note_review':
    'Source Artifacts are auto-confirmed. Decision/Idea hypotheses need review: zz confirm --list',
  'search.description': 'Full-text search over canonical entities',
  'search.argument.query': 'search query',
  'search.no_matches': 'No matches.',
  'trace.description':
    'Decision archaeology: walk Decision → evidence, derived_from, related entities',
  'trace.option.query': 'topic or keyword',
  'trace.no_matches':
    'No Decision entities matched. Try a broader query or ingest more sources.',
  'trace.decision_header': '── Decision ──',
  'trace.related_entities': '  related_entities (shared evidence):',
  'confirm.description':
    'List or resolve Decision/Idea hypotheses (source Artifacts are auto-confirmed)',
  'confirm.option.list':
    'list Decision/Idea hypotheses with evidence (default)',
  'confirm.option.accept': 'confirm entity id',
  'confirm.option.reject': 'reject entity id',
  'confirm.option.accept_all':
    'confirm all listed hypotheses (respects --type)',
  'confirm.option.reject_all': 'reject all listed hypotheses (respects --type)',
  'confirm.hypothesis_header': '── Hypothesis ──',
  'confirm.no_hypotheses': 'No hypothesized Decision/Idea entities.',
  'confirm.list_count':
    '{count} hypothesized Decision/Idea entities (not yet confirmed):\n',
  'confirm.list_count_one':
    '1 hypothesized Decision/Idea entity (not yet confirmed):\n',
  'confirm.tip_low_confidence':
    'Tip: Decision/Idea hypotheses stay provisional until you accept them. Source Artifacts are auto-confirmed.',
  'confirm.none_to_action': 'No hypothesized entities to {action}.',
  'confirm.confirmed': 'Confirmed {type} {id}: {title}',
  'confirm.rejected': 'Rejected {type} {id}: {title}',
  'confirm.accepted_n': 'Accepted {count} hypotheses.',
  'confirm.rejected_n': 'Rejected {count} hypotheses.',
  'confirm.entity_not_found': 'Entity not found',
  'create.description':
    'Manually create a confirmed entity (Person/Project/Interest/Learning, or any type)',
  'create.option.type': 'entity type ({types})',
  'create.option.title': 'entity title',
  'create.option.summary': 'short summary',
  'create.option.status': 'lifecycle status',
  'create.option.tag': 'tag (repeatable)',
  'create.option.goal': 'Project.goal attribute',
  'create.option.identity': 'Person identity key (e.g. github:ada)',
  'create.error.identity': 'identity must be kind:value (e.g. github:ada)',
  'create.created': 'Created [confirmed] {type} {id}\n  {title}',
  'export.description': 'Export canonical knowledge JSON (data portability)',
  'mcp.description': 'Start local MCP egress server (stdio) for agent clients',
  'errors.workspace_missing': 'Workspace not initialized: {root}\nRun: zz init',
  'errors.unknown_connector': 'Unknown connector: {name}',
  'errors.unknown_entity_type': 'Unknown entity type: {raw}\nValid: {valid}',
  'labels.type': 'type',
  'labels.id': 'id',
  'labels.title': 'title',
  'labels.summary': 'summary',
  'labels.confidence': 'confidence',
  'labels.status': 'status',
  'labels.extractor': 'extractor',
  'labels.evidence': 'evidence',
  'labels.evidence_none': 'evidence: (none)',
  'labels.source': 'source',
  'labels.native_id': 'native_id',
  'labels.snippet': 'snippet',
  'labels.actions': 'actions',
  'labels.state': 'state',
  'labels.observation': 'observation',
  'labels.relation': 'relation',
  'labels.hypothesis_section': 'Hypothesis',
  'format.entity_line':
    '{tag} {type} {id}\n  {title}\n  confidence={confidence} ({band}) evidence={evidence}',
  'format.state_line':
    'state: {state} (status={status}) confidence={confidence} ({band})',
};
