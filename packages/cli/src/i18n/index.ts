import { en } from './en.js';
import { ja } from './ja.js';
import type { Locale, Messages, TranslateFn } from './types.js';

export type { Locale, MessageKey, Messages, TranslateFn } from './types.js';

const catalogs: Record<Locale, Messages> = { en, ja };

function normalizeLocaleToken(raw: string | undefined): Locale | undefined {
  if (!raw) return undefined;
  const base = raw.trim().toLowerCase().split(/[._-]/)[0] ?? '';
  if (base === 'ja' || base === 'jp') return 'ja';
  if (base === 'en') return 'en';
  return undefined;
}

/**
 * Resolve CLI locale: --lang > ZZ_LANG > LANG/LC_ALL > en.
 */
export function resolveLocale(
  argv: string[] = process.argv,
  env: NodeJS.ProcessEnv = process.env,
): Locale {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--lang' || arg === '-L') {
      const next = argv[i + 1];
      const fromFlag = normalizeLocaleToken(next);
      if (fromFlag) return fromFlag;
    }
    if (arg?.startsWith('--lang=')) {
      const fromFlag = normalizeLocaleToken(arg.slice('--lang='.length));
      if (fromFlag) return fromFlag;
    }
  }

  const fromZz = normalizeLocaleToken(env.ZZ_LANG);
  if (fromZz) return fromZz;

  const fromLc =
    normalizeLocaleToken(env.LC_ALL) ?? normalizeLocaleToken(env.LANG);
  if (fromLc) return fromLc;

  return 'en';
}

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export function createT(locale: Locale): TranslateFn {
  const primary = catalogs[locale] ?? en;
  return (key, params) => {
    const template = primary[key] ?? en[key] ?? key;
    return interpolate(template, params);
  };
}
