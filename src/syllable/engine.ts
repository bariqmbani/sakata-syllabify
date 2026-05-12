import { normalizeWord } from './normalize.js';
import { VERIFIED_OVERRIDES } from './overrides.js';
import { createLastSyllableResult } from './result.js';
import { endsWithCCRule } from './rules/ends-with-cc.rule.js';
import { endsWithCCCRule } from './rules/ends-with-ccc.rule.js';
import { endsWithConsonantDigraphRule } from './rules/ends-with-consonant-digraph.rule.js';
import { endsWithCVRule } from './rules/ends-with-cv.rule.js';
import { endsWithGramRule } from './rules/ends-with-gram.rule.js';
import { endsWithVCRule } from './rules/ends-with-vc.rule.js';
import { endsWithVVRule } from './rules/ends-with-vv.rule.js';
import { endsWithVVVRule } from './rules/ends-with-vvv.rule.js';
import { fallbackRule } from './rules/fallback.rule.js';
import type { LastSyllableResult, LastSyllableSource, SyllableEngineOptions } from './types.js';
import type { SyllableRule } from './types.js';

type AppliedParts = {
  parts: string[];
  ruleId: string;
  source: LastSyllableSource;
};

const RULES: SyllableRule[] = [
  endsWithConsonantDigraphRule,
  endsWithVVVRule,
  endsWithVVRule,
  endsWithCCCRule,
  endsWithGramRule,
  endsWithCCRule,
  endsWithVCRule,
  endsWithCVRule,
  fallbackRule,
];

export function identifyLastSyllable(input: string, options: SyllableEngineOptions = {}): string[] {
  const normalized = normalizeWord(input);
  return applyRulesToNormalizedWord(normalized, options).parts;
}

export function splitLastSyllable(
  input: string,
  options: SyllableEngineOptions = {},
): LastSyllableResult {
  const normalized = normalizeWord(input);
  const applied = applyRulesToNormalizedWord(normalized, options);

  return createLastSyllableResult({
    original: input,
    normalized,
    parts: applied.parts,
    ruleId: applied.ruleId,
    source: applied.source,
  });
}

export function getLastSyllable(input: string, options: SyllableEngineOptions = {}): string {
  return splitLastSyllable(input, options).last;
}

function applyRulesToNormalizedWord(
  normalized: string,
  options: SyllableEngineOptions = {},
): AppliedParts {
  if (!normalized) {
    return {
      parts: [],
      ruleId: 'empty-input',
      source: 'fallback',
    };
  }

  const override = VERIFIED_OVERRIDES[normalized];
  if (override) {
    return {
      parts: override.parts,
      ruleId: 'verified-override',
      source: 'override',
    };
  }

  const hyphenIndex = normalized.lastIndexOf('-');
  if (hyphenIndex >= 0) {
    return applyHyphenatedWord(normalized, hyphenIndex, options);
  }

  return applyRules(normalized, options);
}

function applyHyphenatedWord(
  normalized: string,
  hyphenIndex: number,
  options: SyllableEngineOptions,
): AppliedParts {
  const beforeSegment = normalized.substring(0, hyphenIndex + 1);
  const lastSegment = normalized.substring(hyphenIndex + 1);

  if (!lastSegment) {
    return {
      parts: [normalized],
      ruleId: 'hyphenated-empty-final-segment',
      source: 'fallback',
    };
  }

  const applied = applyRules(lastSegment, options);
  const [firstPart = '', ...remainingParts] = applied.parts;

  if (!firstPart) {
    return {
      parts: [beforeSegment, ...remainingParts].filter(Boolean),
      ruleId: `hyphenated:${applied.ruleId}`,
      source: applied.source,
    };
  }

  return {
    parts: [`${beforeSegment}${firstPart}`, ...remainingParts],
    ruleId: `hyphenated:${applied.ruleId}`,
    source: applied.source,
  };
}

function applyRules(word: string, options: SyllableEngineOptions): AppliedParts {
  for (const rule of RULES) {
    if (rule.match(word)) {
      return {
        parts: rule.apply(word, options, identifyNormalizedLastSyllable),
        ruleId: rule.id,
        source: rule.id === fallbackRule.id ? 'fallback' : 'rule',
      };
    }
  }

  return {
    parts: fallbackRule.apply(word, options, identifyNormalizedLastSyllable),
    ruleId: fallbackRule.id,
    source: 'fallback',
  };
}

function identifyNormalizedLastSyllable(
  normalizedWord: string,
  options: SyllableEngineOptions = {},
): string[] {
  return applyRulesToNormalizedWord(normalizedWord, options).parts;
}
