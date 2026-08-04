import { afterEach, describe, expect, it, vi } from 'vitest';

// @ts-expect-error Vitest supports the ESM TypeScript extension used by Netlify Functions.
import handler from '../netlify/functions/itunes-search.mts';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Netlify iTunes search proxy', () => {
  it('rejects unsupported catalog entities before contacting Apple', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await handler(new Request('https://muse.example/api/itunes-search?term=MUSE&entity=album'));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('forwards a validated request and returns cacheable JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ resultCount: 0, results: [] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await handler(new Request('https://muse.example/api/itunes-search?term=K-Pop&entity=song&limit=99'));

    expect(response.status).toBe(200);
    expect(response.headers.get('netlify-cdn-cache-control')).toContain('s-maxage=300');
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('term=K-Pop&entity=song&limit=30');
    await expect(response.json()).resolves.toEqual({ resultCount: 0, results: [] });
  });

  it('converts an upstream failure into a stable gateway response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network unavailable')));

    const response = await handler(new Request('https://muse.example/api/itunes-search?term=Thai+Pop&entity=song'));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: 'Music catalog is temporarily unavailable.' });
  });
});
