import { describe, expect, it } from 'vitest';

const PRODUCTION_IMPORTS: Record<string, string[]> = {
  'constants.ts': [],
  'edge.ts': ['./engine.js', './normalize.js', './types.js'],
  'engine.ts': [
    './normalize.js',
    './overrides.js',
    './result.js',
    './rules/ends-with-cc.rule.js',
    './rules/ends-with-ccc.rule.js',
    './rules/ends-with-consonant-digraph.rule.js',
    './rules/ends-with-cv.rule.js',
    './rules/ends-with-gram.rule.js',
    './rules/ends-with-vc.rule.js',
    './rules/ends-with-vv.rule.js',
    './rules/ends-with-vvv.rule.js',
    './rules/fallback.rule.js',
    './types.js',
  ],
  'gameplay-base-words.ts': [],
  'normalize.ts': [],
  'overrides.ts': [],
  'result.ts': ['./types.js'],
  'rules/ends-with-cc.rule.ts': ['../types.js', '../utils.js'],
  'rules/ends-with-ccc.rule.ts': ['../result.js', '../types.js', '../utils.js'],
  'rules/ends-with-consonant-digraph.rule.ts': [
    '../constants.js',
    '../result.js',
    '../types.js',
    '../utils.js',
  ],
  'rules/ends-with-cv.rule.ts': ['../result.js', '../types.js', '../utils.js'],
  'rules/ends-with-gram.rule.ts': ['../result.js', '../types.js'],
  'rules/ends-with-vc.rule.ts': ['../result.js', '../types.js', '../utils.js'],
  'rules/ends-with-vv.rule.ts': ['../gameplay-base-words.js', '../types.js', '../utils.js'],
  'rules/ends-with-vvv.rule.ts': ['../types.js', '../utils.js', './ends-with-vv.rule.js'],
  'rules/fallback.rule.ts': ['../result.js', '../types.js'],
  'types.ts': [],
  'utils.ts': ['./constants.js'],
};

const FORBIDDEN_IMPORTS = new Set([
  'node:fs',
  'node:path',
  'node:process',
  'fs',
  'path',
  'process',
  'http',
  'https',
  'net',
  'tls',
]);

describe('edge safety', () => {
  it('keeps production syllable modules free from Node-only imports', () => {
    const violations = Object.entries(PRODUCTION_IMPORTS).flatMap(([file, specifiers]) =>
      specifiers
        .filter((specifier) => FORBIDDEN_IMPORTS.has(specifier))
        .map((specifier) => `${file}: ${specifier}`),
    );

    expect(violations).toEqual([]);
  });
});
