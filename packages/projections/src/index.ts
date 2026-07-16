import type { Entity } from '@zenchi-zenno/core';
import { normalizeText, searchEntities } from '@zenchi-zenno/core';

/**
 * Full-text projection — rebuildable from the entity store.
 * Vector indexes intentionally absent in Phase 1.
 */
export function fullTextSearch(entities: Entity[], query: string): Entity[] {
  return searchEntities(entities, query);
}

export function buildTokenIndex(entities: Entity[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const e of entities) {
    const tokens = normalizeText(
      [e.title, e.summary ?? '', e.type, ...(e.tags ?? [])].join(' '),
    )
      .split(' ')
      .filter(Boolean);
    for (const t of tokens) {
      if (!index.has(t)) index.set(t, new Set());
      index.get(t)?.add(e.id);
    }
  }
  return index;
}
