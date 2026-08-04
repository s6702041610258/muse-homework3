import { describe, expect, it } from 'vitest';

import { Song } from '../types/song';
import { getAdjacentSong } from './playbackQueue';

const makeSong = (id: string): Song => ({
  id,
  title: `Song ${id}`,
  artist: 'MUSE Test',
  album: 'Signal',
  artwork: 'https://example.com/art.jpg',
  previewUrl: 'https://example.com/preview.m4a',
  genre: 'Electronic',
  releaseDate: '2026',
  price: 'Free / N/A',
  durationMs: 30_000,
  storeUrl: 'https://example.com/song',
});

const queue = ['a', 'b', 'c'].map(makeSong);

describe('getAdjacentSong', () => {
  it('moves forward and wraps to the first song', () => {
    expect(getAdjacentSong(queue, 'a', 1, false)?.id).toBe('b');
    expect(getAdjacentSong(queue, 'c', 1, false)?.id).toBe('a');
  });

  it('moves backward and wraps to the last song', () => {
    expect(getAdjacentSong(queue, 'b', -1, false)?.id).toBe('a');
    expect(getAdjacentSong(queue, 'a', -1, false)?.id).toBe('c');
  });

  it('never returns the active song while shuffling a multi-song queue', () => {
    expect(getAdjacentSong(queue, 'a', 1, true, 0)?.id).toBe('b');
    expect(getAdjacentSong(queue, 'a', 1, true, 0.999)?.id).toBe('c');
  });

  it('handles missing active songs and empty queues safely', () => {
    expect(getAdjacentSong(queue, 'missing', 1, false)?.id).toBe('a');
    expect(getAdjacentSong([], 'missing', 1, false)).toBeNull();
  });
});
