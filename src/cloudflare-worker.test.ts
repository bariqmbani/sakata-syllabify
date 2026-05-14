import { describe, expect, it } from 'vitest';

import worker from './cloudflare-worker.js';

const env = {
  CORS_ALLOWED_ORIGIN: 'https://sakata.bariqmbani.com',
};

async function bodyOf(response: Response): Promise<unknown> {
  return response.json();
}

describe('cloudflare worker entrypoint', () => {
  it('returns syllable data for a valid request', async () => {
    const response = await worker.fetch(
      new Request('https://example.com/api/syllable?word=makan'),
      env,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://sakata.bariqmbani.com',
    );
    expect(await bodyOf(response)).toEqual({
      word: 'makan',
      lastSyllable: 'kan',
      parts: ['ma', 'kan'],
    });
  });

  it('rejects non-GET methods as a backup guard', async () => {
    const response = await worker.fetch(
      new Request('https://example.com/api/syllable?word=makan', { method: 'POST' }),
      env,
    );

    expect(response.status).toBe(405);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://sakata.bariqmbani.com',
    );
    expect(await bodyOf(response)).toEqual({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Metode tidak didukung.',
    });
  });

  it('rejects non-syllable paths as a backup guard', async () => {
    const response = await worker.fetch(
      new Request('https://example.com/wrong-path?word=makan'),
      env,
    );

    expect(response.status).toBe(404);
    expect(await bodyOf(response)).toEqual({
      error: 'NOT_FOUND',
      message: 'Endpoint tidak ditemukan.',
    });
  });

  it('rejects missing words through the edge handler', async () => {
    const response = await worker.fetch(new Request('https://example.com/api/syllable'), env);

    expect(response.status).toBe(400);
    expect(await bodyOf(response)).toEqual({
      error: 'EMPTY_INPUT',
      message: 'Kata wajib diisi.',
    });
  });

  it('rejects oversized words as a backup guard', async () => {
    const word = 'a'.repeat(65);
    const response = await worker.fetch(
      new Request(`https://example.com/api/syllable?word=${word}`),
      env,
    );

    expect(response.status).toBe(400);
    expect(await bodyOf(response)).toEqual({
      error: 'INVALID_WORD',
      message: 'Kata terlalu panjang.',
    });
  });

  it('handles CORS preflight from configured environment origin', async () => {
    const response = await worker.fetch(
      new Request('https://example.com/api/syllable', { method: 'OPTIONS' }),
      env,
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://sakata.bariqmbani.com',
    );
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
  });

  it('omits CORS headers when the environment variable is unset', async () => {
    const response = await worker.fetch(new Request('https://example.com/api/syllable?word=makan'));

    expect(response.status).toBe(200);
    expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
  });
});
