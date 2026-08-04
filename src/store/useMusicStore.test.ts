import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMusicStore } from './useMusicStore';

const asyncStorageMock = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn().mockResolvedValue(undefined),
  removeItem: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({ default: asyncStorageMock }));

describe('appearance preferences', () => {
  beforeEach(() => {
    asyncStorageMock.getItem.mockReset();
    asyncStorageMock.setItem.mockClear();
    useMusicStore.setState({ isDarkMode: true });
  });

  it('switches to Daylight immediately and persists the choice', () => {
    useMusicStore.getState().setColorScheme(false);

    expect(useMusicStore.getState().isDarkMode).toBe(false);
    const savedPreferences = JSON.parse(asyncStorageMock.setItem.mock.calls.at(-1)?.[1] ?? '{}');
    expect(savedPreferences.isDarkMode).toBe(false);
  });

  it('restores a saved Daylight choice on the next launch', async () => {
    asyncStorageMock.getItem.mockResolvedValue(JSON.stringify({ isDarkMode: false }));

    await useMusicStore.getState().loadPreferences();

    expect(useMusicStore.getState().isDarkMode).toBe(false);
  });
});
