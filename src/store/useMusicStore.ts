import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types/song';

const FAVORITES_STORAGE_KEY = '@music_app_favorites';
const PREFERENCES_STORAGE_KEY = '@muse_preferences';

interface MusicPreferences {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  autoPlayEnabled: boolean;
  backgroundPlaybackEnabled: boolean;
  videoAutoplayEnabled: boolean;
  activeThemeColor: string;
  isDarkMode: boolean;
}

const DEFAULT_PREFERENCES: MusicPreferences = {
  hapticsEnabled: true,
  soundEnabled: true,
  autoPlayEnabled: true,
  backgroundPlaybackEnabled: true,
  videoAutoplayEnabled: true,
  activeThemeColor: '#D8FF43',
  isDarkMode: true,
};

function savePreferences(preferences: MusicPreferences) {
  return AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

function snapshotPreferences(preferences: MusicPreferences, overrides: Partial<MusicPreferences> = {}): MusicPreferences {
  return {
    hapticsEnabled: preferences.hapticsEnabled,
    soundEnabled: preferences.soundEnabled,
    autoPlayEnabled: preferences.autoPlayEnabled,
    backgroundPlaybackEnabled: preferences.backgroundPlaybackEnabled,
    videoAutoplayEnabled: preferences.videoAutoplayEnabled,
    activeThemeColor: preferences.activeThemeColor,
    isDarkMode: preferences.isDarkMode,
    ...overrides,
  };
}

interface MusicState {
  // Search & List state
  searchQuery: string;
  searchResults: Song[];
  isLoading: boolean;
  error: string | null;

  // Active Music Player state
  activeSong: Song | null;
  isPlaying: boolean;
  playbackPosition: number;
  playbackDuration: number;
  meteringLevel: number; // 0..1 for audio visualizer
  isPlayerExpanded: boolean;
  isVideoPlaying: boolean;
  playbackQueue: Song[];
  shuffleEnabled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  playbackError: string | null;
  playbackRequestId: number;
  activeThemeColor: string; // Dynamic hex/rgb color derived from song

  // Favorites state
  favorites: Song[];

  // User Settings
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  autoPlayEnabled: boolean;
  backgroundPlaybackEnabled: boolean;
  videoAutoplayEnabled: boolean;
  isDarkMode: boolean;

  // Selected Detail Modal
  selectedSongForDetail: Song | null;
  selectedSongInitialView: 'details' | 'video';

  // Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Song[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  setActiveSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackPosition: (pos: number) => void;
  setPlaybackDuration: (dur: number) => void;
  setMeteringLevel: (level: number) => void;
  setIsPlayerExpanded: (expanded: boolean) => void;
  setIsVideoPlaying: (playing: boolean) => void;
  setPlaybackQueue: (queue: Song[]) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setPlaybackError: (error: string | null) => void;
  setActiveThemeColor: (color: string) => void;

  toggleFavorite: (song: Song) => Promise<void>;
  loadFavorites: () => Promise<void>;
  loadPreferences: () => Promise<void>;
  isFavorite: (songId: string) => boolean;

  setSelectedSongForDetail: (song: Song | null) => void;
  openSelectedSongVideo: (song: Song) => void;
  toggleHaptics: () => void;
  toggleSound: () => void;
  toggleAutoPlay: () => void;
  toggleBackgroundPlayback: () => void;
  toggleVideoAutoplay: () => void;
  setColorScheme: (dark: boolean) => void;
  resetPreferences: () => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  searchQuery: 'K-Pop',
  searchResults: [],
  isLoading: false,
  error: null,

  activeSong: null,
  isPlaying: false,
  playbackPosition: 0,
  playbackDuration: 30000,
  meteringLevel: 0.5,
  isPlayerExpanded: false,
  isVideoPlaying: false,
  playbackQueue: [],
  shuffleEnabled: false,
  repeatMode: 'off',
  playbackError: null,
  playbackRequestId: 0,
  activeThemeColor: '#D8FF43',

  favorites: [],

  soundEnabled: true,
  hapticsEnabled: true,
  autoPlayEnabled: true,
  backgroundPlaybackEnabled: true,
  videoAutoplayEnabled: true,
  isDarkMode: true,

  selectedSongForDetail: null,
  selectedSongInitialView: 'details',

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setActiveSong: (activeSong) => {
    set({ activeSong, playbackPosition: 0, playbackError: null, playbackRequestId: get().playbackRequestId + 1 });
  },
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackPosition: (playbackPosition) => set({ playbackPosition }),
  setPlaybackDuration: (playbackDuration) => set({ playbackDuration }),
  setMeteringLevel: (meteringLevel) => set({ meteringLevel }),
  setIsPlayerExpanded: (isPlayerExpanded) => set({ isPlayerExpanded }),
  setIsVideoPlaying: (isVideoPlaying) => set({ isVideoPlaying }),
  setPlaybackQueue: (playbackQueue) => set({ playbackQueue }),
  toggleShuffle: () => set({ shuffleEnabled: !get().shuffleEnabled }),
  cycleRepeatMode: () => {
    const current = get().repeatMode;
    const repeatMode: MusicState['repeatMode'] = current === 'off' ? 'all' : current === 'all' ? 'one' : 'off';
    set({ repeatMode });
  },
  setPlaybackError: (playbackError) => set({ playbackError }),
  setActiveThemeColor: (activeThemeColor) => {
    set({ activeThemeColor });
    void savePreferences(snapshotPreferences(get(), { activeThemeColor }));
  },

  loadFavorites: async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        set({ favorites: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load favorites from storage', e);
    }
  },

  loadPreferences: async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const preferences = JSON.parse(stored);
        set({
          isDarkMode: preferences.isDarkMode ?? DEFAULT_PREFERENCES.isDarkMode,
          hapticsEnabled: preferences.hapticsEnabled ?? DEFAULT_PREFERENCES.hapticsEnabled,
          soundEnabled: preferences.soundEnabled ?? DEFAULT_PREFERENCES.soundEnabled,
          autoPlayEnabled: preferences.autoPlayEnabled ?? DEFAULT_PREFERENCES.autoPlayEnabled,
          backgroundPlaybackEnabled: preferences.backgroundPlaybackEnabled ?? DEFAULT_PREFERENCES.backgroundPlaybackEnabled,
          videoAutoplayEnabled: preferences.videoAutoplayEnabled ?? DEFAULT_PREFERENCES.videoAutoplayEnabled,
          activeThemeColor: preferences.activeThemeColor ?? DEFAULT_PREFERENCES.activeThemeColor,
        });
      }
    } catch (error) {
      console.error('Failed to load preferences', error);
    }
  },

  toggleFavorite: async (song: Song) => {
    const currentFavs = get().favorites;
    const exists = currentFavs.some((item) => item.id === song.id);
    let updated: Song[];
    if (exists) {
      updated = currentFavs.filter((item) => item.id !== song.id);
    } else {
      updated = [song, ...currentFavs];
    }
    set({ favorites: updated });
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save favorites to storage', e);
    }
  },

  isFavorite: (songId: string) => {
    return get().favorites.some((item) => item.id === songId);
  },

  setSelectedSongForDetail: (selectedSongForDetail) => set({ selectedSongForDetail, selectedSongInitialView: 'details' }),
  openSelectedSongVideo: (selectedSongForDetail) => set({ selectedSongForDetail, selectedSongInitialView: 'video' }),
  toggleHaptics: () => set((state) => {
    const next = !state.hapticsEnabled;
    void savePreferences(snapshotPreferences(state, { hapticsEnabled: next }));
    return { hapticsEnabled: next };
  }),
  toggleSound: () => set((state) => {
    const next = !state.soundEnabled;
    void savePreferences(snapshotPreferences(state, { soundEnabled: next }));
    return { soundEnabled: next };
  }),
  toggleAutoPlay: () => set((state) => {
    const next = !state.autoPlayEnabled;
    void savePreferences(snapshotPreferences(state, { autoPlayEnabled: next }));
    return { autoPlayEnabled: next };
  }),
  toggleBackgroundPlayback: () => set((state) => {
    const next = !state.backgroundPlaybackEnabled;
    void savePreferences(snapshotPreferences(state, { backgroundPlaybackEnabled: next }));
    return { backgroundPlaybackEnabled: next };
  }),
  toggleVideoAutoplay: () => set((state) => {
    const next = !state.videoAutoplayEnabled;
    void savePreferences(snapshotPreferences(state, { videoAutoplayEnabled: next }));
    return { videoAutoplayEnabled: next };
  }),
  setColorScheme: (isDarkMode) => set((state) => {
    void savePreferences(snapshotPreferences(state, { isDarkMode }));
    return { isDarkMode };
  }),
  resetPreferences: () => {
    set(DEFAULT_PREFERENCES);
    void savePreferences(DEFAULT_PREFERENCES);
  },
}));
