import { Song } from '../types/song';

export function getAdjacentSong(
  queue: Song[],
  activeSongId: string,
  direction: 1 | -1,
  shuffleEnabled: boolean,
  randomValue = Math.random(),
): Song | null {
  if (queue.length === 0) return null;

  const currentIndex = queue.findIndex((song) => song.id === activeSongId);
  if (shuffleEnabled && queue.length > 1) {
    const safeRandom = Math.max(0, Math.min(0.999999, randomValue));
    const offset = 1 + Math.floor(safeRandom * (queue.length - 1));
    const baseIndex = currentIndex >= 0 ? currentIndex : 0;
    return queue[(baseIndex + offset) % queue.length];
  }

  const baseIndex = currentIndex >= 0 ? currentIndex : direction === 1 ? -1 : 0;
  const nextIndex = (baseIndex + direction + queue.length) % queue.length;
  return queue[nextIndex];
}
