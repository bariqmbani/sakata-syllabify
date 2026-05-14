import { handleSyllableRequest } from './syllable/edge.js';
import type { SyllableErrorCode } from './syllable/types.js';

const SYLLABLE_PATH = '/api/syllable';
const MAX_WORD_LENGTH = 64;

type Env = {
  CORS_ALLOWED_ORIGIN?: string;
};

type WorkerErrorResponse = {
  error: SyllableErrorCode | 'METHOD_NOT_ALLOWED' | 'NOT_FOUND';
  message: string;
};

function corsHeaders(env: Env): HeadersInit {
  const allowedOrigin = env.CORS_ALLOWED_ORIGIN?.trim();

  if (!allowedOrigin) return {};

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function withCors(response: Response, env: Env): Response {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(corsHeaders(env))) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function jsonError(error: WorkerErrorResponse, status: number, env: Env): Response {
  return Response.json(error, { status, headers: corsHeaders(env) });
}

export default {
  async fetch(req: Request, env: Env = {}): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname !== SYLLABLE_PATH) {
      return jsonError(
        {
          error: 'NOT_FOUND',
          message: 'Endpoint tidak ditemukan.',
        },
        404,
        env,
      );
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(env),
      });
    }

    if (req.method !== 'GET') {
      return jsonError(
        {
          error: 'METHOD_NOT_ALLOWED',
          message: 'Metode tidak didukung.',
        },
        405,
        env,
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
        env,
      );
    }

    return withCors(await handleSyllableRequest(req), env);
  },
};
