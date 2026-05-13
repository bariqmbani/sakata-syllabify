import { splitLastSyllable } from './engine.js';
import { normalizeWord } from './normalize.js';
import type { SyllableErrorCode } from './types.js';

type SyllableErrorResponse = {
  error: SyllableErrorCode;
  message: string;
};

type SyllableSuccessResponse = {
  word: string;
  lastSyllable: string;
  parts: string[];
};

export type SyllableEdgeResponse = SyllableErrorResponse | SyllableSuccessResponse;

export async function handleSyllableRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const input = url.searchParams.get('word');

  if (!input || !normalizeWord(input)) {
    return Response.json(
      {
        error: 'EMPTY_INPUT',
        message: 'Kata wajib diisi.',
      } satisfies SyllableErrorResponse,
      { status: 400 },
    );
  }

  const result = splitLastSyllable(input);

  return Response.json({
    word: result.normalized,
    lastSyllable: result.last,
    parts: result.parts,
  } satisfies SyllableSuccessResponse);
}
