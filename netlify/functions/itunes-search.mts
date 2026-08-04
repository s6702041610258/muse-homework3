// Same-origin catalog gateway for the Web/PWA; native clients call Apple directly.
const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';
const ALLOWED_ENTITIES = new Set(['song', 'musicVideo']);
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 30;

function jsonResponse(body: unknown, status = 200, cacheable = false) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-content-type-options': 'nosniff',
      'cache-control': cacheable
        ? 'public, max-age=60, stale-while-revalidate=300'
        : 'no-store',
      ...(cacheable
        ? { 'netlify-cdn-cache-control': 'public, durable, s-maxage=300, stale-while-revalidate=900' }
        : {}),
    },
  });
}

export default async function handler(request: Request) {
  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const requestUrl = new URL(request.url);
  const term = requestUrl.searchParams.get('term')?.trim() ?? '';
  const entity = requestUrl.searchParams.get('entity') ?? 'song';
  const requestedLimit = Number.parseInt(requestUrl.searchParams.get('limit') ?? '', 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(MAX_LIMIT, Math.max(1, requestedLimit))
    : DEFAULT_LIMIT;

  if (!term || term.length > 120) {
    return jsonResponse({ error: 'Search term must contain 1 to 120 characters.' }, 400);
  }
  if (!ALLOWED_ENTITIES.has(entity)) {
    return jsonResponse({ error: 'Unsupported catalog entity.' }, 400);
  }

  const upstreamUrl = new URL(ITUNES_SEARCH_URL);
  upstreamUrl.searchParams.set('term', term);
  upstreamUrl.searchParams.set('entity', entity);
  upstreamUrl.searchParams.set('limit', String(limit));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7500);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });

    if (!upstream.ok) {
      return jsonResponse({ error: `Music catalog returned status ${upstream.status}.` }, 502);
    }

    const payload = await upstream.json();
    if (!payload || typeof payload !== 'object' || !Array.isArray((payload as { results?: unknown }).results)) {
      return jsonResponse({ error: 'Music catalog returned an invalid response.' }, 502);
    }

    return jsonResponse(payload, 200, true);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    return jsonResponse(
      { error: timedOut ? 'Music catalog request timed out.' : 'Music catalog is temporarily unavailable.' },
      timedOut ? 504 : 502,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const config = {
  path: '/api/itunes-search',
};
