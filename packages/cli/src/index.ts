#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createChatgptExportConnector } from '@zenchi-zenno/connector-chatgpt-export';
import { createGithubConnector } from '@zenchi-zenno/connector-github';
import { createMarkdownLocalConnector } from '@zenchi-zenno/connector-markdown-local';
import type { Connector } from '@zenchi-zenno/connector-spi';
import {
  applyExtract,
  decisionTrace,
  extractFromObservation,
  KnowledgeStore,
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
            note: 'Extracted entities are hypothesized until you confirm them.',
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
    let hits = fullTextSearch(store.entities, query);
    if (opts.type) hits = hits.filter((e) => e.type === opts.type);
    for (const e of hits) {
      console.log(
        `${e.confirmation_state === 'confirmed' ? '[confirmed]' : '[hypothesis]'} ${e.type} ${e.id}\n  ${e.title}\n  confidence=${e.confidence ?? 'n/a'} evidence=${e.evidence_refs.length}`,
      );
    }
    if (!hits.length) console.log('No matches.');
  });

program
  .command('trace')
  .description('Decision archaeology: "what did I decide, with evidence?"')
  .requiredOption('-q, --query <query>', 'topic or keyword')
  .option('-d, --data-dir <path>', 'workspace directory', defaultDataDir())
  .action((opts: { query: string; dataDir: string }) => {
    const store = openStore(opts.dataDir);
    const { decisions, evidence } = decisionTrace(store, opts.query);
    if (!decisions.length) {
      console.log(
        'No Decision entities matched. Try a broader query or ingest more sources.',
      );
      return;
    }
    for (const d of decisions) {
      console.log('── Decision ──');
      console.log(`id: ${d.id}`);
      console.log(`state: ${d.confirmation_state} (status=${d.status})`);
      console.log(`title: ${d.title}`);
      console.log(`summary: ${d.summary ?? ''}`);
      const mine = evidence.filter((x) =>
        d.evidence_refs.includes(x.evidence.id),
      );
      for (const m of mine) {
        console.log('  evidence:');
        console.log(
          `    observation: ${m.observation?.source_system}/${m.observation?.source_type}`,
        );
        console.log(`    native_id: ${m.observation?.source_native_id}`);
        console.log(`    title: ${m.observation?.title ?? ''}`);
        const snippet = (m.observation?.text ?? '')
          .slice(0, 200)
          .replaceAll('\n', ' ');
        console.log(`    snippet: ${snippet}`);
      }
      console.log('');
    }
  });

program
  .command('confirm')
  .description('List or resolve hypothesized entities')
  .option('-d, --data-dir <path>', 'workspace directory', defaultDataDir())
  .option('-l, --list', 'list hypothesized entities')
  .option('--accept <id>', 'confirm entity id')
  .option('--reject <id>', 'reject entity id')
  .action(
    (opts: {
      dataDir: string;
      list?: boolean;
      accept?: string;
      reject?: string;
    }) => {
      const store = openStore(opts.dataDir);
      if (opts.accept) {
        const e = store.setConfirmation(opts.accept, 'confirmed');
        if (!e) {
          console.error('Entity not found');
          process.exit(1);
        }
        console.log(`Confirmed ${e.type} ${e.id}: ${e.title}`);
        return;
      }
      if (opts.reject) {
        const e = store.setConfirmation(opts.reject, 'rejected');
        if (!e) {
          console.error('Entity not found');
          process.exit(1);
        }
        console.log(`Rejected ${e.type} ${e.id}: ${e.title}`);
        return;
      }
      const hyps = store.entities.filter(
        (e) => e.confirmation_state === 'hypothesized',
      );
      if (!hyps.length) {
        console.log('No hypothesized entities.');
        return;
      }
      for (const e of hyps) {
        console.log(`${e.type}\t${e.id}\t${e.title}`);
      }
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

program.parseAsync(process.argv);
