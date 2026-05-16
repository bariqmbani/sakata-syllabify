# Sakata Syllable Engine

Deterministic Indonesian last-syllable engine for word-chain gameplay.

The engine is designed for consistent gameplay behavior, not academic syllabification. It has no runtime database, network, AI, ML, or Node-only dependency in the core engine.

## Package

Install it from a Node project:

```bash
npm install sakata-syllable-engine
```

This package is ESM-only and exports its TypeScript declarations from the root entrypoint.

## Usage

```ts
import { getLastSyllable, identifyLastSyllable, splitLastSyllable } from 'sakata-syllable-engine';

identifyLastSyllable('makan');
// ['ma', 'kan']

getLastSyllable('kandidat');
// 'dat'

splitLastSyllable('makan');
// {
//   original: 'makan',
//   normalized: 'makan',
//   prefix: 'ma',
//   last: 'kan',
//   parts: ['ma', 'kan'],
//   ruleId: 'ends-with-vc',
//   source: 'rule'
// }
```

## Base Word Lookup

Some gameplay splits depend on knowing whether a stripped base word is known. The engine includes a small built-in gameplay fallback, and callers can override it with `isKnownBaseWord`.

```ts
identifyLastSyllable('memulai', {
  isKnownBaseWord: (word) => word === 'mulai',
});
// ['memu', 'lai']
```

## Edge Handler

The package also exports a framework-neutral Web `Request` handler.

```ts
import { handleSyllableRequest } from 'sakata-syllable-engine';

export const GET = handleSyllableRequest;
```

For a valid request like `?word=makan`, the handler returns:

```json
{
  "word": "makan",
  "lastSyllable": "kan",
  "parts": ["ma", "kan"]
}
```

For a missing or empty word, it returns `400`:

```json
{
  "error": "EMPTY_INPUT",
  "message": "Kata wajib diisi."
}
```

For Cloudflare Worker deployment and quota-saving WAF rules, see
[docs/cloudflare-quota-protection.md](docs/cloudflare-quota-protection.md).

## Development

```bash
npm install
npm run test
npm run typecheck
npm run lint
npm run format:check
npm run build
```
