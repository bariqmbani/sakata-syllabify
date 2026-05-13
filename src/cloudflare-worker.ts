import { handleSyllableRequest } from './syllable/edge.js';
import type { SyllableErrorCode } from './syllable/types.js';

const SYLLABLE_PATH = '/api/syllable';
const MAX_WORD_LENGTH = 64;

type WorkerErrorResponse = {
  error: SyllableErrorCode | 'METHOD_NOT_ALLOWED' | 'NOT_FOUND';
  message: string;
};

function jsonError(error: WorkerErrorResponse, status: number): Response {
  return Response.json(error, { status });
}

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname !== SYLLABLE_PATH) {
      return jsonError(
        {
          error: 'NOT_FOUND',
          message: 'Endpoint tidak ditemukan.',
        },
        404,
      );
    }

    if (req.method !== 'GET') {
      return jsonError(
        {
          error: 'METHOD_NOT_ALLOWED',
          message: 'Metode tidak didukung.',
        },
        405,
      );
    }

    const word = url.searchParams.get('word');
    if (word && word.length > MAX_WORD_LENGTH) {
      return jsonError(
        {
          error: 'INVALID_WORD',
          message: 'Kata terlalu panjang.',
        },
        400,
      );
    }

    return handleSyllableRequest(req);
  },
};
