export interface iTunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100: string;
  artworkUrl60?: string;
  previewUrl?: string;
  primaryGenreName?: string;
  releaseDate?: string;
  trackPrice?: number;
  currency?: string;
  trackTimeMillis?: number;
  trackViewUrl?: string;
  trackCensoredName?: string;
  kind?: string;
}

export interface iTunesSearchResponse {
  resultCount: number;
  results: iTunesTrack[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  previewUrl: string;
  genre: string;
  releaseDate: string;
  price: string;
  durationMs: number;
  storeUrl: string;
}

export interface MusicVideo {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  previewUrl: string;
  storeUrl: string;
  durationMs: number;
}

export function mapiTunesTrackToSong(track: iTunesTrack): Song {
  // Get high-res artwork URL (600x600) from 100x100
  const highResArtwork = track.artworkUrl100
    ? track.artworkUrl100.replace('100x100bb', '600x600bb')
    : 'https://via.placeholder.com/600';

  const priceFormatted = track.trackPrice && track.trackPrice > 0
    ? `${track.trackPrice} ${track.currency || 'USD'}`
    : 'Free / N/A';

  return {
    id: String(track.trackId),
    title: track.trackName || 'Unknown Title',
    artist: track.artistName || 'Unknown Artist',
    album: track.collectionName || 'Single / Unknown Album',
    artwork: highResArtwork,
    previewUrl: track.previewUrl || '',
    genre: track.primaryGenreName || 'Music',
    releaseDate: track.releaseDate ? new Date(track.releaseDate).getFullYear().toString() : 'N/A',
    price: priceFormatted,
    durationMs: track.trackTimeMillis || 30000,
    storeUrl: track.trackViewUrl || '',
  };
}
