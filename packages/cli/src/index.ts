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
import { createT, resolveLocale, type TranslateFn } from './i18n/index.js';

function defaultDataDir(): string {
  return resolve(process.cwd(), '.zz');
}

function buildProgram(t: TranslateFn): Command {
  function openStore(dataDir?: string): KnowledgeStore {
    const root = resolve(dataDir ?? defaultDataDir());
    if (!existsSync(root)) {
      console.error(t('errors.workspace_missing', { root }));
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
        console.error(t('errors.unknown_connector', { name }));
        process.exit(1);
    }
  }

  function stateTag(e: Entity): string {
    return e.confirmation_state === 'confirmed'
      ? '[confirmed]'
      : '[hypothesis]';
  }

  function formatEntityLine(e: Entity): string {
    const band = confidenceLabel(e.confidence);
    return t('format.entity_line', {
      tag: stateTag(e),
      type: e.type,
      id: e.id,
      title: e.title,
      confidence: e.confidence ?? 'n/a',
      band,
      evidence: e.evidence_refs.length,
    });
  }

  function printHypothesisDetail(store: KnowledgeStore, e: Entity): void {
    console.log(t('confirm.hypothesis_header'));
    console.log(`${t('labels.type')}: ${e.type}`);
    console.log(`${t('labels.id')}: ${e.id}`);
    console.log(`${t('labels.title')}: ${e.title}`);
    if (e.summary) {
      console.log(`${t('labels.summary')}: ${e.summary.slice(0, 280)}`);
    }
    console.log(
      `${t('labels.confidence')}: ${e.confidence ?? 'n/a'} (${confidenceLabel(e.confidence)})`,
    );
    console.log(`${t('labels.status')}: ${e.status}`);
    console.log(
      `${t('labels.extractor')}: ${e.provenance?.extractor ?? 'n/a'}`,
    );
    const links = listEvidenceForEntity(store, e.id);
    if (!links.length) {
      console.log(t('labels.evidence_none'));
    } else {
      for (const link of links) {
        console.log(`${t('labels.evidence')}:`);
        console.log(
          `  ${t('labels.source')}: ${link.observation?.source_system}/${link.observation?.source_type}`,
        );
        console.log(
          `  ${t('labels.native_id')}: ${link.observation?.source_native_id ?? ''}`,
        );
        console.log(`  ${t('labels.title')}: ${link.observation?.title ?? ''}`);
        if (link.snippet) {
          console.log(`  ${t('labels.snippet')}: ${link.snippet}`);
        }
      }
    }
    console.log(
      `${t('labels.actions')}: zz confirm --accept ${e.id}  |  zz confirm --reject ${e.id}`,
    );
    console.log('');
  }

  function parseEntityType(raw: string | undefined): EntityType | undefined {
    if (!raw) return undefined;
    if (!(ENTITY_TYPES as readonly string[]).includes(raw)) {
      console.error(
        t('errors.unknown_entity_type', {
          raw,
          valid: ENTITY_TYPES.join(', '),
        }),
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
      console.error(t('confirm.entity_not_found'));
      process.exit(1);
    }
    const key =
      state === 'confirmed' ? 'confirm.confirmed' : 'confirm.rejected';
    console.log(t(key, { type: e.type, id: e.id, title: e.title }));
  }

  function bulkSetConfirmation(
    store: KnowledgeStore,
    hyps: Entity[],
    state: 'confirmed' | 'rejected',
  ): void {
    const action = state === 'confirmed' ? 'accept' : 'reject';
    if (!hyps.length) {
      console.log(t('confirm.none_to_action', { action }));
      return;
    }
    const key =
      state === 'confirmed' ? 'confirm.confirmed' : 'confirm.rejected';
    for (const e of hyps) {
      store.setConfirmation(e.id, state);
      console.log(t(key, { type: e.type, id: e.id, title: e.title }));
    }
    const summaryKey =
      state === 'confirmed' ? 'confirm.accepted_n' : 'confirm.rejected_n';
    console.log(t(summaryKey, { count: hyps.length }));
  }

  function listHypotheses(store: KnowledgeStore, type?: EntityType): void {
    const hyps = store.listHypotheses(type);
    if (!hyps.length) {
      console.log(t('confirm.no_hypotheses'));
      return;
    }
    console.log(
      hyps.length === 1
        ? t('confirm.list_count_one')
        : t('confirm.list_count', { count: hyps.length }),
    );
    for (const e of hyps) {
      printHypothesisDetail(store, e);
    }
    console.log(t('confirm.tip_low_confidence'));
  }

  const program = new Command();
  program
    .name('zz')
    .description(t('cli.description'))
    .version('0.1.0')
    .option('--lang <locale>', t('cli.lang_option'));

  program
    .command('init')
    .description(t('init.description'))
    .option('-d, --data-dir <path>', t('option.data_dir'), defaultDataDir())
    .option('-n, --name <name>', t('option.workspace_name'), 'personal')
    .action((opts: { dataDir: string; name: string }) => {
      const store = KnowledgeStore.init(resolve(opts.dataDir), opts.name);
      console.log(
        t('init.initialized', {
          id: store.workspace.id,
          path: resolve(opts.dataDir),
        }),
      );
    });

  program
    .command('ingest')
    .description(t('ingest.description'))
    .requiredOption('-c, --connector <id>', t('ingest.option.connector'))
    .option('-p, --path <path>', t('ingest.option.path'))
    .option('--repo <owner/name>', t('ingest.option.repo'))
    .option('--limit <n>', t('ingest.option.limit'), '30')
    .option('-d, --data-dir <path>', t('option.data_dir'), defaultDataDir())
    .action(
      async (opts: {
        connector: string;
        path?: string;
        repo?: string;
        limit: string;
        dataDir: string;
      }) => {
        const store = openStore(opts.dataDir);
        const connector = getConnector(opts.connector);
        const token =
          process.env.ZZ_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN ?? undefined;
        const useGithubApi =
          opts.connector === 'github' && Boolean(opts.repo) && Boolean(token);

        if (opts.connector === 'github' && opts.repo && !token) {
          console.error(t('ingest.error.token_required'));
          process.exit(1);
        }
        if (!useGithubApi && !opts.path) {
          console.error(t('ingest.error.path_or_repo'));
          process.exit(1);
        }

        const limit = Number.parseInt(opts.limit, 10);
        const correlation = `sync-${Date.now()}`;
        store.appendEvent(
          'SyncStarted',
          {
            connector: opts.connector,
            path: opts.path,
            repo: opts.repo,
            mode: useGithubApi ? 'api' : 'export',
          },
          {
            correlation_id: correlation,
          },
        );

        const sync = await connector.sync({
          path: opts.path ? resolve(opts.path) : undefined,
          workspace_id: store.workspace.id,
          token: useGithubApi ? token : undefined,
          repo: useGithubApi ? opts.repo : undefined,
          limit: Number.isFinite(limit) ? limit : 30,
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
            mode: useGithubApi ? 'api' : 'export',
          },
          { correlation_id: correlation },
        );

        console.log(
          JSON.stringify(
            {
              connector: opts.connector,
              mode: useGithubApi ? 'api' : 'export',
              repo: opts.repo,
              ingested,
              skipped_duplicates: skipped,
              entities_extracted: extracted,
              errors: sync.errors,
              note: t('ingest.note_review'),
            },
            null,
            2,
          ),
        );
      },
    );

  program
    .command('search')
    .description(t('search.description'))
    .argument('<query>', t('search.argument.query'))
    .option('-d, --data-dir <path>', t('option.data_dir'), defaultDataDir())
    .option('--type <type>', t('option.entity_type'))
    .action((query: string, opts: { dataDir: string; type?: string }) => {
      const store = openStore(opts.dataDir);
      const type = parseEntityType(opts.type);
      let hits = fullTextSearch(store.entities, query);
      if (type) hits = hits.filter((e) => e.type === type);
      for (const e of hits) {
        console.log(formatEntityLine(e));
      }
      if (!hits.length) console.log(t('search.no_matches'));
    });

  program
    .command('trace')
    .description(t('trace.description'))
    .requiredOption('-q, --query <query>', t('trace.option.query'))
    .option('-d, --data-dir <path>', t('option.data_dir'), defaultDataDir())
    .action((opts: { query: string; dataDir: string }) => {
      const store = openStore(opts.dataDir);
      const { nodes } = decisionTrace(store, opts.query);
      if (!nodes.length) {
        console.log(t('trace.no_matches'));
        return;
      }
      for (const node of nodes) {
        const d = node.decision;
        console.log(t('trace.decision_header'));
        console.log(`${t('labels.id')}: ${d.id}`);
        console.log(
          t('format.state_line', {
            state: d.confirmation_state,
            status: d.status,
            confidence: d.confidence ?? 'n/a',
            band: confidenceLabel(d.confidence),
          }),
        );
        console.log(`${t('labels.title')}: ${d.title}`);
        console.log(`${t('labels.summary')}: ${d.summary ?? ''}`);

        for (const m of node.evidence) {
          console.log(`  ${t('labels.evidence')}:`);
          console.log(
            `    ${t('labels.observation')}: ${m.observation?.source_system}/${m.observation?.source_type}`,
          );
          console.log(
            `    ${t('labels.native_id')}: ${m.observation?.source_native_id}`,
          );
          console.log(
            `    ${t('labels.title')}: ${m.observation?.title ?? ''}`,
          );
          console.log(`    ${t('labels.snippet')}: ${m.snippet}`);
        }

        for (const edge of node.derived_from) {
          console.log(`  derived_from:`);
          console.log(`    ${t('labels.relation')}: ${edge.relation.id}`);
          console.log(
            `    ${t('labels.observation')}: ${edge.observation?.source_native_id ?? edge.relation.to_id}`,
          );
          console.log(
            `    ${t('labels.title')}: ${edge.observation?.title ?? ''}`,
          );
        }

        if (node.related_entities.length) {
          console.log(t('trace.related_entities'));
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
    .description(t('confirm.description'))
    .option('-d, --data-dir <path>', t('option.data_dir'), defaultDataDir())
    .option('-l, --list', t('confirm.option.list'))
    .option('--type <type>', t('option.entity_type'))
    .option('--accept <id>', t('confirm.option.accept'))
    .option('--reject <id>', t('confirm.option.reject'))
    .option('--accept-all', t('confirm.option.accept_all'))
    .option('--reject-all', t('confirm.option.reject_all'))
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
    .description(t('create.description'))
    .requiredOption(
      '-t, --type <type>',
      t('create.option.type', {
        types: `${MANUAL_ENTITY_TYPES.join(' | ')} | …`,
      }),
    )
    .requiredOption('--title <title>', t('create.option.title'))
    .option('-d, --data-dir <path>', t('option.data_dir'), defaultDataDir())
    .option('--summary <text>', t('create.option.summary'))
    .option('--status <status>', t('create.option.status'))
    .option(
      '--tag <tag>',
      t('create.option.tag'),
      (v: string, acc: string[]) => {
        acc.push(v);
        return acc;
      },
      [] as string[],
    )
    .option('--goal <goal>', t('create.option.goal'))
    .option('--identity <kind:value>', t('create.option.identity'))
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
            console.error(t('create.error.identity'));
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
          t('create.created', {
            type: entity.type,
            id: entity.id,
            title: entity.title,
          }),
        );
      },
    );

  program
    .command('export')
    .description(t('export.description'))
    .option('-d, --data-dir <path>', t('option.data_dir'), defaultDataDir())
    .action((opts: { dataDir: string }) => {
      const store = openStore(opts.dataDir);
      console.log(JSON.stringify(store.exportCanonical(), null, 2));
    });

  program
    .command('mcp')
    .description(t('mcp.description'))
    .option('-d, --data-dir <path>', t('option.data_dir'), defaultDataDir())
    .action(async (opts: { dataDir: string }) => {
      const { startMcpServer } = await import('@zenchi-zenno/mcp-server');
      await startMcpServer(resolve(opts.dataDir));
    });

  return program;
}

const locale = resolveLocale();
const t = createT(locale);
await buildProgram(t).parseAsync(process.argv);
