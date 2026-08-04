import { iTunesSearchResponse, MusicVideo, Song, mapiTunesTrackToSong } from '../types/song';

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';
const videoCache = new Map<string, MusicVideo>();
const songCache = new Map<string, { expiresAt: number; songs: Song[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getSearchEndpoint() {
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  return isBrowser ? '/api/itunes-search' : ITUNES_SEARCH_URL;
}

export function buildCatalogSearchUrl(term: string, entity: 'song' | 'musicVideo', limit: number) {
  const params = new URLSearchParams({
    term: term.trim(),
    entity,
    limit: String(Math.min(30, Math.max(1, limit))),
  });
  return `${getSearchEndpoint()}?${params.toString()}`;
}

function createTimedController(externalSignal?: AbortSignal) {
  const controller = new AbortController();
  const abortFromExternal = () => controller.abort();
  if (externalSignal?.aborted) controller.abort();
  else externalSignal?.addEventListener('abort', abortFromExternal, { once: true });
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', abortFromExternal);
    },
  };
}

async function readCatalogResponse(response: Response): Promise<iTunesSearchResponse> {
  const body = await response.text();
  const trimmedBody = body.trimStart();

  if (trimmedBody.startsWith('<!DOCTYPE') || trimmedBody.startsWith('<html')) {
    throw new Error(
      'The music gateway returned a web page instead of catalog data. For local web development, start MUSE with `npm run web`.',
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error('The music catalog returned an unreadable response. Please try again.');
  }

  if (!data || typeof data !== 'object' || !Array.isArray((data as iTunesSearchResponse).results)) {
    throw new Error('The music catalog returned incomplete data. Please try again.');
  }

  return data as iTunesSearchResponse;
}

export async function searchSongs(query: string, limit = 30, externalSignal?: AbortSignal): Promise<Song[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const cacheKey = `${query.trim().toLocaleLowerCase()}:${limit}`;
  const cached = songCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.songs;

  const url = buildCatalogSearchUrl(query, 'song', limit);
  const request = createTimedController(externalSignal);

  try {
    const response = await fetch(url, { signal: request.signal });

    if (!response.ok) {
      throw new Error(`iTunes API responded with status ${response.status}`);
    }

    const data = await readCatalogResponse(response);

    const songs = data.results
      .filter((track) => !!track.previewUrl)
      .map(mapiTunesTrackToSong);
    songCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, songs });
    return songs;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Connection timed out. Please try again.');
    }
    console.error('Error fetching iTunes songs:', error);
    throw error;
  } finally {
    request.cleanup();
  }
}

export function normalizeCatalogText(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export async function searchMusicVideo(song: Song, externalSignal?: AbortSignal): Promise<MusicVideo | null> {
  const cacheKey = `${song.id}:${normalizeCatalogText(song.title)}:${normalizeCatalogText(song.artist)}`;
  if (videoCache.has(cacheKey)) return videoCache.get(cacheKey) ?? null;

  const url = buildCatalogSearchUrl(`${song.title} ${song.artist}`, 'musicVideo', 8);
  const request = createTimedController(externalSignal);

  try {
    const response = await fetch(url, { signal: request.signal });
    if (!response.ok) throw new Error(`Video search failed with status ${response.status}`);
    const data = await readCatalogResponse(response);
    const targetTitle = normalizeCatalogText(song.title);
    const targetArtist = normalizeCatalogText(song.artist);
    const candidates = data.results
      .filter((item) => item.kind === 'music-video' && !!item.previewUrl)
      .map((item) => {
        const title = normalizeCatalogText(item.trackName || item.trackCensoredName || '');
        const artist = normalizeCatalogText(item.artistName || '');
        let score = 0;
        if (targetTitle && title === targetTitle) score += 8;
        else if (targetTitle && title && (title.includes(targetTitle) || targetTitle.includes(title))) score += 5;
        if (targetArtist && artist === targetArtist) score += 7;
        else if (targetArtist && artist && (artist.includes(targetArtist) || targetArtist.includes(artist))) score += 4;
        return { item, score };
      })
      .sort((a, b) => b.score - a.score);

    const best = candidates[0];
    if (!best || best.score < 5) {
      return null;
    }

    const item = best.item;
    const video: MusicVideo = {
      id: String(item.trackId),
      title: item.trackCensoredName || item.trackName || song.title,
      artist: item.artistName || song.artist,
      artwork: item.artworkUrl100?.replace('100x100bb', '1200x675bb') || song.artwork,
      previewUrl: item.previewUrl || '',
      storeUrl: item.trackViewUrl || '',
      durationMs: item.trackTimeMillis || 30000,
    };
    videoCache.set(cacheKey, video);
    return video;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Video search timed out. Please try again.');
    }
    throw error;
  } finally {
    request.cleanup();
  }
}
