/**
 * Locked monorepo SemVer: one release for all @zenchi-zenno/* packages.
 * Plain semantic-release (not semantic-release-monorepo) so commits under
 * packages/ and connectors/ participate in version calculation.
 *
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          { breaking: true, release: 'minor' },
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
        ],
      },
    ],
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd:
          'pnpm -r exec npm version ${nextRelease.version} --no-git-tag-version && npm version ${nextRelease.version} --no-git-tag-version',
        publishCmd:
          'pnpm -r publish --access public --no-git-checks --provenance',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'CHANGELOG.md',
          'package.json',
          'packages/*/package.json',
          'connectors/*/package.json',
          'pnpm-lock.yaml',
        ],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}\n\nSigned-off-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>',
      },
    ],
    '@semantic-release/github',
  ],
};
