import { afterEach, describe, expect, it, vi } from 'vitest';

import { Song } from '../types/song';
import { normalizeCatalogText, searchMusicVideo, searchSongs } from './itunesApi';

const song: Song = {
  id: 'video-test-2026',
  title: 'Héroes (Live)',
  artist: 'Beyoncé',
  album: 'Signal',
  artwork: 'https://example.com/art.jpg',
  previewUrl: 'https://example.com/song.m4a',
  genre: 'Pop',
  releaseDate: '2026',
  price: 'Free / N/A',
  durationMs: 30_000,
  storeUrl: 'https://example.com/song',
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('normalizeCatalogText', () => {
  it('normalizes case, compatibility characters, punctuation and version labels', () => {
    expect(normalizeCatalogText('  ＨÉROES — Live [HD]  ')).toBe('héroes live');
    expect(normalizeCatalogText('Beyoncé feat. JAY-Z')).toBe('beyoncé feat jay z');
  });
});

describe('iTunes catalog requests', () => {
  const catalogResponse = (results: unknown[]) => new Response(
    JSON.stringify({ resultCount: results.length, results }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );

  it('does not request the network for a blank search', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchSongs('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('filters tracks without a playable preview', async () => {
    const fetchMock = vi.fn().mockResolvedValue(catalogResponse([
      { trackId: 1, trackName: 'Playable', artistName: 'MUSE', artworkUrl100: '100x100bb', previewUrl: 'https://example.com/a.m4a' },
      { trackId: 2, trackName: 'Unavailable', artistName: 'MUSE', artworkUrl100: '100x100bb' },
    ]));
    vi.stubGlobal('fetch', fetchMock);

    const results = await searchSongs('phase-six-unique-query');
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: '1', title: 'Playable' });
  });

  it('uses the same-origin Netlify proxy in a browser runtime', async () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('document', {});
    const fetchMock = vi.fn().mockResolvedValue(catalogResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    await searchSongs('phase-proxy-browser-query');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/itunes-search?term=phase-proxy-browser-query&entity=song&limit=30',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('propagates a signal that was already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchMock = vi.fn().mockImplementation((_url: string, options: RequestInit) => {
      expect(options.signal?.aborted).toBe(true);
      return Promise.reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchSongs('phase-six-aborted-query', 30, controller.signal)).rejects.toThrow('Connection timed out');
  });

  it('explains when a plain Expo web server returns HTML for the Function route', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('<!DOCTYPE html><html></html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchSongs('phase-html-response-query')).rejects.toThrow(
      'For local web development, start MUSE with `npm run web`',
    );
  });

  it('selects the closest Unicode-aware video match', async () => {
    const fetchMock = vi.fn().mockResolvedValue(catalogResponse([
      { trackId: 8, kind: 'music-video', trackName: 'Different Song', artistName: 'Someone Else', artworkUrl100: '100x100bb', previewUrl: 'https://example.com/wrong.m4v' },
      { trackId: 9, kind: 'music-video', trackName: 'Héroes', artistName: 'Beyoncé', artworkUrl100: '100x100bb', previewUrl: 'https://example.com/right.m4v' },
    ]));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchMusicVideo(song)).resolves.toMatchObject({ id: '9', artist: 'Beyoncé' });
  });
});
