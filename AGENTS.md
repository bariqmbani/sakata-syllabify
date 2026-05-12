# AGENTS.md — Indonesian Last Syllable Engine

## Purpose

This repository contains a lightweight deterministic engine for identifying the last syllable of Indonesian words, used in a word-chain web game.

Example gameplay:

```txt
ma-kan -> kan-di-dat -> da-ta -> ...
```

The engine does not need to perform perfect academic syllabification. It only needs to identify the last gameplay syllable **consistently**.

Primary goals:

- deterministic behavior
- fast execution
- easy debugging
- strong regression tests
- edge/serverless compatibility
- no runtime AI or ML dependency

---

## Goals & Non-Goals

**Goals:**

- Return the same result for the same input, always
- Run safely in edge/serverless functions
- Support gameplay-friendly splitting that may differ from academic rules
- Be easy to debug and extend with new rules

**Non-Goals:**

- Perfect linguistic syllabification
- Runtime AI/ML inference
- Database or network dependency in the core engine
- Support for multiple languages

---

## Current Behavior

Current functions can be read [here](https://raw.githubusercontent.com/bariqmbani/sa-kata__web/refs/heads/master/app/api/service/word/syllabify.api.ts).
The legacy function is:

```ts
identifyLastSyllable(word: string): string[]
```

It returns the word split into a prefix and last syllable.

```ts
identifyLastSyllable("makan");
// ["ma", "kan"]

identifyLastSyllable("kandidat");
// ["kandi", "dat"]
```

Note: despite its name, the function returns **split parts**, not just the last syllable.

When refactoring, **preserve backward compatibility** unless explicitly instructed otherwise.

---

## Target Public API

Introduce a new structured API while keeping the legacy function.

```ts
// New structured API
export function splitLastSyllable(
  input: string,
  options?: SyllableEngineOptions
): LastSyllableResult;

export function getLastSyllable(
  input: string,
  options?: SyllableEngineOptions
): string;

// Legacy API — must remain available
export function identifyLastSyllable(
  input: string,
  options?: SyllableEngineOptions
): string[];
```

---

## Types

Use explicit types. Do not use `any`.

```ts
export type LastSyllableSource = 'override' | 'rule' | 'fallback';

export type SyllableMode = 'gameplay' | 'orthographic';

export type SyllableEngineOptions = {
  mode?: SyllableMode;
  wordExists?: (word: string) => boolean;
};

export type LastSyllableResult = {
  original: string;
  normalized: string;
  prefix: string;
  last: string;
  parts: string[];
  ruleId: string;
  source: LastSyllableSource;
};
```

Expected usage:

```ts
getLastSyllable("makan");
// "kan"

splitLastSyllable("makan");
// {
//   original: "makan",
//   normalized: "makan",
//   prefix: "ma",
//   last: "kan",
//   parts: ["ma", "kan"],
//   ruleId: "ends-with-vc",
//   source: "rule"
// }
```

---

## Linguistic Terminology

Use these terms consistently throughout the codebase.

### Vowels

```txt
a, i, u, e, o
```

### Diphthongs

Vowel combinations that act as one sound unit.

```txt
ai, au, ei, oi
```

Examples: `survei`, `pandai`, `amboi`, `saudara`

### Consonant Digraphs

Consonant combinations that represent a special consonant unit. **These are not diphthongs.**

```txt
ng, ny, sy, kh
```

Examples: `kucing`, `banyak`, `syekh`, `tarikh`

**Bad naming:**

```ts
handleEndsWithDiphthong("kucing");  // wrong — ng is a digraph
```

**Good naming:**

```ts
handleEndsWithConsonantDigraph("kucing");  // correct
```

---

## Normalization

All input must be normalized before rule processing.

```ts
export function normalizeWord(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^a-z-]/g, '');
}
```

The engine must **not** treat `-` as a vowel or consonant. Hyphenated words must be handled intentionally.

Examples: `berkata-kata`, `berangan-angan`, `bercakap-cakap`

Define and document whether the engine processes the whole word or only the segment after the final hyphen. Whatever the decision, it must be tested.

---

## Safe Split Helper

Use a helper to avoid returning empty syllable parts.

```ts
export function makeParts(prefix: string, last: string): string[] {
  if (!prefix) return [last];
  if (!last) return [prefix];
  return [prefix, last];
}
```

Never return `['', 'kan']`. Always return `['kan']`.

All rule handlers must return through `makeParts` or an equivalent helper.

---

## Verified Overrides

Special-case words must be stored in a data structure, not scattered across `if` chains.

```ts
// overrides.ts
export const VERIFIED_OVERRIDES: Record<string, string[]> = {
  iduladha: ['idulad', 'ha'],
  menggei:  ['meng', 'gei'],
  menggwei: ['meng', 'gwei'],
  bau:      ['ba', 'u'],
};
```

**Do not do this:**

```ts
if (word === 'iduladha') return ['idulad', 'ha'];
if (word === 'menggei')  return ['meng', 'gei'];
```

Every override must have a test and a documented reason:

```ts
{
  word: "bau",
  expected: ["ba", "u"],
  reason: "Gameplay-specific split; avoids treating 'au' as final diphthong."
}
```

**Pattern-based cases should become rules, not overrides.** For example, `endsWith('gram')` logic belongs in `ends-with-gram.rule.ts`, not in `VERIFIED_OVERRIDES`.

---

## Rule Structure

Each rule must be isolated with its own identifier, description, matcher, and handler.

```ts
export type SyllableRule = {
  id: string;
  description: string;
  match: (word: string) => boolean;
  apply: (word: string, options?: SyllableEngineOptions) => string[];
};
```

Example:

```ts
export const endsWithCVRule: SyllableRule = {
  id: 'ends-with-cv',
  description: 'Handles words ending with consonant + vowel.',
  match: isEndsWithCV,
  apply: handleEndsWithCV,
};
```

---

## Rule Priority

Rules are applied in this order. **Do not reorder casually.** Run the full test suite when changing order.

```txt
1.  verified overrides
2.  hyphenated word handling
3.  consonant digraph endings: ng, ny, sy, kh
4.  VVV endings
5.  VV endings
6.  CCC endings
7.  CC endings
8.  VC endings
9.  CV endings
10. fallback
```

Engine loop:

```ts
const RULES: SyllableRule[] = [
  endsWithDigraphRule,
  endsWithVVVRule,
  endsWithVVRule,
  endsWithCCCRule,
  endsWithCCRule,
  endsWithVCRule,
  endsWithCVRule,
  fallbackRule,
];

export function identifyLastSyllable(
  input: string,
  options: SyllableEngineOptions = {}
): string[] {
  const word = normalizeWord(input);
  const override = VERIFIED_OVERRIDES[word];

  if (override) return override;

  for (const rule of RULES) {
    if (rule.match(word)) return rule.apply(word, options);
  }

  return fallbackRule.apply(word, options);
}
```

---

## Gameplay Mode

Default mode is `'gameplay'`. This takes priority over academic syllabification when they conflict.

```ts
mode: 'gameplay'  // default
```

Words that may need gameplay-specific treatment:

```txt
bau, survei, memulai, mewarnai, menguasai,
terangkai, menodai, menilai, bermain
```

When gameplay behavior differs from academic rules, **document the reason** in code comments.

---

## Edge Compatibility

The core engine must be safe for edge/serverless runtimes.

**Never use inside the core engine:**

- `fs`, `path`, `process`
- database clients
- HTTP clients
- remote dictionary lookups
- large NLP packages
- runtime LLM SDKs

**Dictionary lookup must be injected, not imported:**

```ts
// Bad
import { isWordExists } from '..';

// Good — inject via options
const wordExists = options.wordExists ?? (() => false);
```

The engine must be able to run with **no** injected `wordExists`.

---

## Error Handling

Invalid input must not crash the engine.

```ts
// Typed error codes
type SyllableErrorCode =
  | 'EMPTY_INPUT'
  | 'INVALID_WORD'
  | 'UNSUPPORTED_CHARACTER';
```

Edge handler example:

```ts
export async function GET(req: Request) {
  const url = new URL(req.url);
  const word = url.searchParams.get('word');

  if (!word) {
    return Response.json(
      { error: 'EMPTY_INPUT', message: 'Kata wajib diisi.' },
      { status: 400 }
    );
  }

  const result = splitLastSyllable(word);

  return Response.json({
    word: result.normalized,
    lastSyllable: result.last,
    parts: result.parts,
  });
}
```

---

## Testing Requirements

### Current tests
The legacy functions have these [test](https://raw.githubusercontent.com/bariqmbani/sa-kata__web/refs/heads/master/test/syllabify.test.ts) and [test data](https://raw.githubusercontent.com/bariqmbani/sa-kata__web/refs/heads/master/test/syllabify.test.data.ts).

### Every rule needs positive and negative tests

```ts
expect(splitLastSyllable("kucing").parts).toEqual(["ku", "cing"]);
expect(splitLastSyllable("long").parts).toEqual(["long"]);
```

### Invariant tests are mandatory for all known words

```ts
const result = identifyLastSyllable(word);

expect(result.every(Boolean)).toBe(true);
expect(result[result.length - 1].length).toBeGreaterThan(0);
expect(result.join('')).toBe(normalizeWord(word));
```

For hyphenated words, explicitly define and document the invariant behavior.

### Regression rule

Do not update expected outputs just to make tests pass. Only update when the gameplay rule **intentionally** changes. If outputs change, explain why.

### Test categories to maintain

```txt
Core endings:
  ends with ng, ny, sy, kh
  ends with CV, VC, VV, VVV, CC, CCC

Edge cases:
  short words (1–2 chars)
  one-syllable words
  uppercase input
  input with whitespace
  input with punctuation
  hyphenated words

Word types:
  borrowed words
  gameplay overrides
```

---

## Implementation Plan

Follow this plan phase by phase. Do not rewrite the whole engine in one change.

After each phase: run tests → inspect regressions → preserve behavior → document intentional changes.

---

### Phase 1 — Stabilize Legacy Engine

Goal: improve safety without changing current behavior.

1. Add constants to `constants.ts`: `VOWELS`, `DIPHTHONGS`, `CONSONANT_DIGRAPHS`
2. Add `normalizeWord` to `normalize.ts`
3. Add `makeParts` to `result.ts`
4. Add normalization tests
5. Add invariant tests
6. Confirm all existing tests pass

**Do not restructure rules yet.**

Acceptance:
```txt
[ ] Constants exist
[ ] normalizeWord exists
[ ] makeParts exists
[ ] All existing tests pass
[ ] New normalization tests pass
[ ] New invariant tests pass
```

---

### Phase 2 — Move Special Cases to Overrides

Goal: eliminate hardcoded `if` chains for special words.

1. Create `overrides.ts` with `VERIFIED_OVERRIDES`
2. Move special words from `if` chains into the map
3. Keep pattern-based rules (e.g. `endsWith('gram')`) as rules, not overrides
4. Add a test for every override entry
5. Confirm all existing tests pass

Acceptance:
```txt
[ ] VERIFIED_OVERRIDES contains all special words
[ ] No long if-equality chains remain for specific words
[ ] Pattern rules are not mixed into overrides
[ ] Every override has a test with a documented reason
[ ] All existing tests pass
```

---

### Phase 3 — Remove Direct Dictionary Dependency

Goal: make the core engine portable to edge/serverless.

1. Create `options.ts` with `SyllableEngineOptions`
2. Add optional `wordExists?: (word: string) => boolean`
3. Pass `options` into handlers that need dictionary lookup
4. Replace all direct `isWordExists` imports with injected `wordExists`
5. Add tests for engine without `wordExists` and with injected `wordExists`

Acceptance:
```txt
[ ] Core engine does not import isWordExists
[ ] Engine works without wordExists
[ ] Engine can optionally use injected wordExists
[ ] All existing tests pass
[ ] New injection tests pass
```

---

### Phase 4 — Add Structured API

Goal: add a better public API without breaking the old one.

1. Add `LastSyllableResult` type to `result.ts`
2. Implement `splitLastSyllable`
3. Implement `getLastSyllable`
4. Keep `identifyLastSyllable` backward compatible
5. Add tests for all three APIs

Initial implementation may use `ruleId: 'legacy'` and `source: 'rule'` until Phase 5 is complete.

Acceptance:
```txt
[ ] identifyLastSyllable still works
[ ] splitLastSyllable exists and returns structured result
[ ] getLastSyllable exists and returns string
[ ] All existing tests pass
[ ] New public API tests pass
```

---

### Phase 5 — Convert Handlers into Rules

Goal: make rule behavior explicit, isolated, and debuggable.

Refactor in this order:

```txt
1. fallback
2. ends-with-cv
3. ends-with-vc
4. ends-with-cc
5. ends-with-ccc
6. ends-with-digraph
7. ends-with-vv
8. ends-with-vvv
```

After each extraction: run full tests. Stop and fix if any regression appears.

Acceptance:
```txt
[ ] Each rule is isolated in its own file with id and description
[ ] Rule order is explicit in engine.ts
[ ] splitLastSyllable exposes correct ruleId
[ ] All existing tests pass after each extraction
[ ] No direct database/network/filesystem dependency
```

---

### Phase 6 — Prepare Edge Function

Goal: verify the engine runs cleanly in edge/serverless.

1. Audit all imports in the core engine for Node.js-only modules
2. Confirm no database, network, or filesystem calls exist
3. Create a lean API handler using `splitLastSyllable`
4. Return only the fields needed for gameplay: `word`, `lastSyllable`, `parts`

Acceptance:
```txt
[ ] Edge handler calls splitLastSyllable with no Node.js-only APIs
[ ] API returns normalized word, lastSyllable, and parts
[ ] Invalid input returns a controlled error response
[ ] No database lookup required in the core engine
```

---

## File Structure

```txt
app/api/service/word/syllable/
  constants.ts          # VOWELS, DIPHTHONGS, CONSONANT_DIGRAPHS
  normalize.ts          # normalizeWord
  overrides.ts          # VERIFIED_OVERRIDES
  options.ts            # SyllableEngineOptions, SyllableMode
  result.ts             # LastSyllableResult, makeParts
  engine.ts             # identifyLastSyllable, splitLastSyllable, getLastSyllable
  rules/
    fallback.rule.ts
    ends-with-cv.rule.ts
    ends-with-vc.rule.ts
    ends-with-vv.rule.ts
    ends-with-vvv.rule.ts
    ends-with-cc.rule.ts
    ends-with-ccc.rule.ts
    ends-with-digraph.rule.ts
  __tests__/
    syllable.test.ts
    syllable-invariant.test.ts
    syllable-normalize.test.ts
    syllable.test-data.ts
```

---

## Commands

Before finishing work, run the relevant test command for the project:

```bash
npm test
# or
pnpm test
# or
yarn test
```

Do not claim the implementation is complete unless tests were run. If tests were not run, state clearly why.

---

## Do Not Do

- Rewrite the whole engine in one large change
- Introduce runtime LLM calls
- Introduce TensorFlow, ONNX, or NLP libraries
- Add database access inside the core engine
- Make remote calls from the core engine
- Silently change expected test outputs
- Delete test cases to make tests pass
- Mix up diphthong and consonant digraph terminology
- Make the engine depend on Node.js-only APIs
- Return empty syllable parts
- Remove backward compatibility without being asked
- Add large dependencies for simple string processing
- Hide gameplay-specific behavior inside unclear conditions

---

## Global Acceptance Criteria

The implementation is complete when all of the following are true:

```txt
Core correctness
[ ] Existing tests pass
[ ] New invariant tests pass
[ ] New normalization tests pass
[ ] New public API tests pass
[ ] No empty syllable parts are returned

API
[ ] identifyLastSyllable remains backward compatible
[ ] splitLastSyllable exists and returns LastSyllableResult
[ ] getLastSyllable exists and returns a string

Portability
[ ] No direct database access in the core engine
[ ] No network access in the core engine
[ ] No filesystem access in the core engine
[ ] No runtime AI or ML calls
[ ] Engine runs without injected wordExists
[ ] Engine can optionally use injected wordExists
[ ] Edge handler runs without Node.js-only APIs

Code quality
[ ] Special cases are stored in VERIFIED_OVERRIDES, not if chains
[ ] Diphthongs and consonant digraphs are named correctly throughout
[ ] Rule order is documented and explicit
[ ] Gameplay-specific behavior is documented with reasons
```