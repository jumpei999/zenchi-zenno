import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { en } from './en.js';
import { createT, resolveLocale } from './index.js';
import { ja } from './ja.js';

describe('resolveLocale', () => {
  it('prefers --lang over env', () => {
    assert.equal(
      resolveLocale(['node', 'zz', '--lang', 'ja'], { ZZ_LANG: 'en' }),
      'ja',
    );
  });

  it('accepts --lang=ja', () => {
    assert.equal(resolveLocale(['node', 'zz', '--lang=ja'], {}), 'ja');
  });

  it('uses ZZ_LANG before LANG', () => {
    assert.equal(
      resolveLocale(['node', 'zz'], {
        ZZ_LANG: 'ja',
        LANG: 'en_US.UTF-8',
      }),
      'ja',
    );
  });

  it('maps LANG=ja_JP.UTF-8 to ja', () => {
    assert.equal(resolveLocale(['node', 'zz'], { LANG: 'ja_JP.UTF-8' }), 'ja');
  });

  it('defaults to en for unknown values', () => {
    assert.equal(
      resolveLocale(['node', 'zz', '--lang', 'xx'], { LANG: 'fr_FR' }),
      'en',
    );
  });
});

describe('createT', () => {
  it('interpolates placeholders', () => {
    const t = createT('en');
    assert.equal(
      t('init.initialized', { id: 'abc', path: '/tmp/.zz' }),
      'Initialized workspace abc at /tmp/.zz',
    );
  });

  it('returns Japanese strings for ja', () => {
    const t = createT('ja');
    assert.ok(t('confirm.no_hypotheses').includes('仮説'));
    assert.equal(t('search.no_matches'), ja['search.no_matches']);
  });

  it('documents observation-fact auto-confirm policy in both locales', () => {
    const enT = createT('en');
    const jaT = createT('ja');
    assert.match(enT('ingest.note_review'), /auto-confirmed/);
    assert.match(enT('confirm.description'), /Decision\/Idea/);
    assert.match(enT('confirm.tip_low_confidence'), /auto-confirmed/);
    assert.match(jaT('ingest.note_review'), /自動確定/);
    assert.match(jaT('confirm.description'), /Decision\/Idea/);
    assert.match(jaT('confirm.no_hypotheses'), /Decision\/Idea/);
    // Canonical identifiers stay English in both locales
    assert.match(enT('confirm.description'), /Artifacts/);
    assert.match(jaT('confirm.description'), /Artifact/);
  });

  it('falls back to English for missing ja keys via catalog completeness', () => {
    const enKeys = Object.keys(en).sort();
    const jaKeys = Object.keys(ja).sort();
    assert.deepEqual(jaKeys, enKeys);
  });
});
