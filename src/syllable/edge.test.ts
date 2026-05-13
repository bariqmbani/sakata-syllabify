import { describe, expect, it } from 'vitest';

import { handleSyllableRequest, type SyllableEdgeResponse } from './edge.js';

async function jsonOf(response: Response): Promise<SyllableEdgeResponse> {
  return (await response.json()) as SyllableEdgeResponse;
}

describe('handleSyllableRequest', () => {
  it('returns EMPTY_INPUT when word is missing', async () => {
    const response = await handleSyllableRequest(new Request('https://example.test/api/syllable'));

    expect(response.status).toBe(400);
    expect(await jsonOf(response)).toEqual({
      error: 'EMPTY_INPUT',
      message: 'Kata wajib diisi.',
    });
  });

  it('returns EMPTY_INPUT when word normalizes to empty', async () => {
    const response = await handleSyllableRequest(
      new Request('https://example.test/api/syllable?word=!!!'),
    );

    expect(response.status).toBe(400);
    expect(await jsonOf(response)).toEqual({
      error: 'EMPTY_INPUT',
      message: 'Kata wajib diisi.',
    });
  });

  it('returns normalized gameplay fields for a valid word', async () => {
    const response = await handleSyllableRequest(
      new Request('https://example.test/api/syllable?word=makan'),
    );

    expect(response.status).toBe(200);
    expect(await jsonOf(response)).toEqual({
      word: 'makan',
      lastSyllable: 'kan',
      parts: ['ma', 'kan'],
    });
  });

  it('normalizes uppercase and punctuation input', async () => {
    const response = await handleSyllableRequest(
      new Request('https://example.test/api/syllable?word=%20MAKAN!!%20'),
    );

    expect(response.status).toBe(200);
    expect(await jsonOf(response)).toEqual({
      word: 'makan',
      lastSyllable: 'kan',
      parts: ['ma', 'kan'],
    });
  });
});
