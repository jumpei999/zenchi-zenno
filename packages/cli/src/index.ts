#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createChatgptExportConnector } from '@zenchi-zenno/connector-chatgpt-export';
import { createGithubConnector } from '@zenchi-zenno/connector-github';
import { createMarkdownLocalConnector } from '@zenchi-zenno/connector-markdown-local';
import type { Connector } from '@zenchi-zenno/connector-spi';
import {
  applyExtract,
  confidenceLabel,
  decisionTrace,
  ENTITY_TYPES,
  type Entity,
  type EntityType,
  extractFromObservation,
  KnowledgeStore,
  listEvidenceForEntity,
  MANUAL_ENTITY_TYPES,
} from '@zenchi-zenno/core';
import { fullTextSearch } from '@zenchi-zenno/projections';
import { Command } from 'commander';

function defaultDataDir(): string {
  return resolve(process.cwd(), '.zenchi');
}

function openStore(dataDir?: string): KnowledgeStore {
  const root = resolve(dataDir ?? defaultDataDir());
  if (!existsSync(root)) {
    console.error(`Workspace not initialized: ${root}\nRun: zenchi init`);
    process.exit(1);
  }
  return new KnowledgeStore(root);
}

function getConnector(name: string): Connector {
  switch (name) {
    case 'markdown-local':
      return createMarkdownLocalConnector();
    case 'chatgpt-export':
      return createChatgptExportConnector();
    case 'github':
      return createGithubConnector();
    default:
      console.error(`Unknown connector: ${name}`);
      process.exit(1);
  }
}

function stateTag(e: Entity): string {
  return e.confirmation_state === 'confirmed' ? '[confirmed]' : '[hypothesis]';
}

function formatEntityLine(e: Entity): string {
  const band = confidenceLabel(e.confidence);
  return `${stateTag(e)} ${e.type} ${e.id}\n  ${e.title}\n  confidence=${e.confidence ?? 'n/a'} (${band}) evidence=${e.evidence_refs.length}`;
}

function printHypothesisDetail(store: KnowledgeStore, e: Entity): void {
  console.log('── Hypothesis ──');
  console.log(`type: ${e.type}`);
  console.log(`id: ${e.id}`);
  console.log(`title: ${e.title}`);
  if (e.summary) console.log(`summary: ${e.summary.slice(0, 280)}`);
  console.log(
    `confidence: ${e.confidence ?? 'n/a'} (${confidenceLabel(e.confidence)})`,
  );
  console.log(`status: ${e.status}`);
  console.log(`extractor: ${e.provenance?.extractor ?? 'n/a'}`);
  const links = listEvidenceForEntity(store, e.id);
  if (!links.length) {
    console.log('evidence: (none)');
  } else {
    for (const link of links) {
      console.log('evidence:');
      console.log(
        `  source: ${link.observation?.source_system}/${link.observation?.source_type}`,
      );
      console.log(`  native_id: ${link.observation?.source_native_id ?? ''}`);
      console.log(`  title: ${link.observation?.title ?? ''}`);
      if (link.snippet) console.log(`  snippet: ${link.snippet}`);
    }
  }
  console.log(
    `actions: zenchi confirm --accept ${e.id}  |  zenchi confirm --reject ${e.id}`,
  );
  console.log('');
}

function parseEntityType(raw: string | undefined): EntityType | undefined {
  if (!raw) return undefined;
  if (!(ENTITY_TYPES as readonly string[]).includes(raw)) {
    console.error(
      `Unknown entity type: ${raw}\nValid: ${ENTITY_TYPES.join(', ')}`,
    );
    process.exit(1);
  }
  return raw as EntityType;
}

function setEntityConfirmation(
  store: KnowledgeStore,
  id: string,
  state: 'confirmed' | 'rejected',
): void {
  const e = store.setConfirmation(id, state);
  if (!e) {
    console.error('Entity not found');
    process.exit(1);
  }
  const verb = state === 'confirmed' ? 'Confirmed' : 'Rejected';
  console.log(`${verb} ${e.type} ${e.id}: ${e.title}`);
}

function bulkSetConfirmation(
  store: KnowledgeStore,
  hyps: Entity[],
  state: 'confirmed' | 'rejected',
): void {
  const action = state === 'confirmed' ? 'accept' : 'reject';
  if (!hyps.length) {
    console.log(`No hypothesized entities to ${action}.`);
    return;
  }
  const verb = state === 'confirmed' ? 'Confirmed' : 'Rejected';
  for (const e of hyps) {
    store.setConfirmation(e.id, state);
    console.log(`${verb} ${e.type} ${e.id}: ${e.title}`);
  }
  const past = state === 'confirmed' ? 'Accepted' : 'Rejected';
  console.log(`${past} ${hyps.length} hypotheses.`);
}

function listHypotheses(store: KnowledgeStore, type?: EntityType): void {
  const hyps = store.listHypotheses(type);
  if (!hyps.length) {
    console.log('No hypothesized entities.');
    return;
  }
  console.log(
    `${hyps.length} hypothesized entit${hyps.length === 1 ? 'y' : 'ies'} (not yet confirmed):\n`,
  );
  for (const e of hyps) {
    printHypothesisDetail(store, e);
  }
  console.log(
    'Tip: low-confidence extractions entities stay hypothesized until you accept them.',
  );
}

const program = new Command();
program
  .name('zenchi')
  .description('zenchi-zenno Personal Knowledge OS CLI (OSS, local-first)')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a personal workspace under .zenchi/')
  .option('-d, --data-dir <path>', 'workspace directory', defaultDataDir())
  .option('-n, --name <name>', 'workspace name', 'personal')
  .action((opts: { dataDir: string; name: string }) => {
    const store = KnowledgeStore.init(resolve(opts.dataDir), opts.name);
    console.log(
      `Initialized workspace ${store.workspace.id} at ${resolve(opts.dataDir)}`,
    );
  });

program
  .command('ingest')
  .description('Ingest observations via a connector and extract hypotheses')
  .requiredOption(
    '-c, --connector <id>',
    'markdown-local | chatgpt-export | github',
  )
  .requiredOption('-p, --path <path>', 'export path or directory')
  .option('-d, --data-dir <path>', 'workspace directory', defaultDataDir())
  .action(
    async (opts: { connector: string; path: string; dataDir: string }) => {
      const store = openStore(opts.dataDir);
      const connector = getConnector(opts.connector);
      const correlation = `sync-${Date.now()}`;
      store.appendEvent(
        'SyncStarted',
        { connector: opts.connector, path: opts.path },
        {
          correlation_id: correlation,
        },
      );

      const sync = await connector.sync({
        path: resolve(opts.path),
        workspace_id: store.workspace.id,
      });

      let ingested = 0;
      let skipped = 0;
      let extracted = 0;

      for (const record of sync.records) {
        const saved = store.storeSourceRecord(
          record.body,
          record.source_native_id,
          record.checksum,
          record.media_type,
        );
        const obs = {
          ...record.observation,
          content_ref: saved.content_ref,
          id: record.observation.id,
        };
        const stored = store.ingestObservation(obs);
        if (!stored) {
          skipped += 1;
          continue;
        }
        ingested += 1;
        const result = extractFromObservation(store, stored);
        applyExtract(store, result);
        extracted += result.entities.length;
      }

      store.appendEvent(
        'SyncCompleted',
        {
          connector: opts.connector,
          ingested,
          skipped,
          extracted,
          errors: sync.errors,
        },
        { correlation_id: correlation },
      );

      console.log(
        JSON.stringify(
          {
            connector: opts.connector,
            ingested,
            skipped_duplicates: skipped,
            entities_extracted: extracted,
            errors: sync.errors,
            note: 'Extracted entities are hypothesized until you confirm them. Review with: zenchi confirm --list',
          },
          null,
          2,
        ),
      );
    },
  );

program
  .command('search')
  .description('Full-text search over canonical entities')
  .argument('<query>', 'search query')
  .option('-d, --data-dir <path>', 'workspace directory', defaultDataDir())
  .option('--type <type>', 'filter by entity type')
  .action((query: string, opts: { dataDir: string; type?: string }) => {
    const store = openStore(opts.dataDir);
    const type = parseEntityType(opts.type);
    let hits = fullTextSearch(store.entities, query);
    if (type) hits = hits.filter((e) => e.type === type);
    for (const e of hits) {
      console.log(formatEntityLine(e));
    }
    if (!hits.length) console.log('No matches.');
  });

program
  .command('trace')
  .description(
    'Decision archaeology: walk Decision → evidence, derived_from, related entities',
  )
  .requiredOption('-q, --query <query>', 'topic or keyword')
  .option('-d, --data-dir <path>', 'workspace directory', defaultDataDir())
  .action((opts: { query: string; dataDir: string }) => {
    const store = openStore(opts.dataDir);
    const { nodes } = decisionTrace(store, opts.query);
    if (!nodes.length) {
      console.log(
        'No Decision entities matched. Try a broader query or ingest more sources.',
      );
      return;
    }
    for (const node of nodes) {
      const d = node.decision;
      console.log('── Decision ──');
      console.log(`id: ${d.id}`);
      console.log(
        `state: ${d.confirmation_state} (status=${d.status}) confidence=${d.confidence ?? 'n/a'} (${confidenceLabel(d.confidence)})`,
      );
      console.log(`title: ${d.title}`);
      console.log(`summary: ${d.summary ?? ''}`);

      for (const m of node.evidence) {
        console.log('  evidence:');
        console.log(
          `    observation: ${m.observation?.source_system}/${m.observation?.source_type}`,
        );
        console.log(`    native_id: ${m.observation?.source_native_id}`);
        console.log(`    title: ${m.observation?.title ?? ''}`);
        console.log(`    snippet: ${m.snippet}`);
      }

      for (const edge of node.derived_from) {
        console.log('  derived_from:');
        console.log(`    relation: ${edge.relation.id}`);
        console.log(
          `    observation: ${edge.observation?.source_native_id ?? edge.relation.to_id}`,
        );
        console.log(`    title: ${edge.observation?.title ?? ''}`);
      }

      if (node.related_entities.length) {
        console.log('  related_entities (shared evidence):');
        for (const rel of node.related_entities) {
          console.log(
            `    ${stateTag(rel)} ${rel.type} ${rel.id} — ${rel.title}`,
          );
        }
      }
      console.log('');
    }
  });

program
  .command('confirm')
  .description(
    'List or resolve hypothesized entities (extraction is never auto-confirmed)',
  )
  .option('-d, --data-dir <path>', 'workspace directory', defaultDataDir())
  .option('-l, --list', 'list hypothesized entities with evidence (default)')
  .option('--type <type>', 'filter by entity type')
  .option('--accept <id>', 'confirm entity id')
  .option('--reject <id>', 'reject entity id')
  .option('--accept-all', 'confirm all listed hypotheses (respects --type)')
  .option('--reject-all', 'reject all listed hypotheses (respects --type)')
  .action(
    (opts: {
      dataDir: string;
      list?: boolean;
      type?: string;
      accept?: string;
      reject?: string;
      acceptAll?: boolean;
      rejectAll?: boolean;
    }) => {
      const store = openStore(opts.dataDir);
      const type = parseEntityType(opts.type);

      if (opts.accept) {
        setEntityConfirmation(store, opts.accept, 'confirmed');
        return;
      }
      if (opts.reject) {
        setEntityConfirmation(store, opts.reject, 'rejected');
        return;
      }
      if (opts.acceptAll) {
        bulkSetConfirmation(store, store.listHypotheses(type), 'confirmed');
        return;
      }
      if (opts.rejectAll) {
        bulkSetConfirmation(store, store.listHypotheses(type), 'rejected');
        return;
      }

      listHypotheses(store, type);
    },
  );

program
  .command('create')
  .description(
    'Manually create a confirmed entity (Person/Project/Interest/Learning, or any type)',
  )
  .requiredOption(
    '-t, --type <type>',
    `entity type (${MANUAL_ENTITY_TYPES.join(' | ')} | …)`,
  )
  .requiredOption('--title <title>', 'entity title')
  .option('-d, --data-dir <path>', 'workspace directory', defaultDataDir())
  .option('--summary <text>', 'short summary')
  .option('--status <status>', 'lifecycle status')
  .option(
    '--tag <tag>',
    'tag (repeatable)',
    (v: string, acc: string[]) => {
      acc.push(v);
      return acc;
    },
    [] as string[],
  )
  .option('--goal <goal>', 'Project.goal attribute')
  .option('--identity <kind:value>', 'Person identity key (e.g. github:ada)')
  .action(
    (opts: {
      dataDir: string;
      type: string;
      title: string;
      summary?: string;
      status?: string;
      tag: string[];
      goal?: string;
      identity?: string;
    }) => {
      const store = openStore(opts.dataDir);
      const type = parseEntityType(opts.type);
      if (!type) process.exit(1);

      const attributes: Record<string, unknown> = {};
      if (opts.goal) attributes.goal = opts.goal;
      if (opts.identity) {
        const [kind, ...rest] = opts.identity.split(':');
        const value = rest.join(':');
        if (!kind || !value) {
          console.error('identity must be kind:value (e.g. github:ada)');
          process.exit(1);
        }
        attributes.identity_keys = [{ kind, value }];
      }

      const entity = store.createManualEntity({
        type,
        title: opts.title,
        summary: opts.summary,
        status: opts.status,
        tags: opts.tag.length ? opts.tag : undefined,
        attributes: Object.keys(attributes).length ? attributes : undefined,
      });
      console.log(
        `Created [confirmed] ${entity.type} ${entity.id}\n  ${entity.title}`,
      );
    },
  );

program
  .command('export')
  .description('Export canonical knowledge JSON (data portability)')
  .option('-d, --data-dir <path>', 'workspace directory', defaultDataDir())
  .action((opts: { dataDir: string }) => {
    const store = openStore(opts.dataDir);
    console.log(JSON.stringify(store.exportCanonical(), null, 2));
  });

program
  .command('mcp')
  .description('Start local MCP egress server (stdio) for agent clients')
  .option('-d, --data-dir <path>', 'workspace directory', defaultDataDir())
  .action(async (opts: { dataDir: string }) => {
    const { startMcpServer } = await import('@zenchi-zenno/mcp-server');
    await startMcpServer(resolve(opts.dataDir));
  });

program.parseAsync(process.argv);
