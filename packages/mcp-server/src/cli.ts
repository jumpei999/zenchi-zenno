#!/usr/bin/env node
import { resolve } from 'node:path';
import { startMcpServer } from './index.js';

const dataDir =
  process.argv
    .find((a) => a.startsWith('--data-dir='))
    ?.slice('--data-dir='.length) ??
  process.argv[process.argv.indexOf('--data-dir') + 1] ??
  resolve(process.cwd(), '.zenchi');

await startMcpServer(resolve(dataDir));
