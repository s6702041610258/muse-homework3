import React, { useEffect, useSyncExternalStore } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';

import { AnimatedBackground } from '../components/AnimatedBackground';
import { CustomTabBar } from '../components/CustomTabBar';
import { InstallPrompt } from '../components/InstallPrompt';
import { MusicPlayerSheet } from '../components/MusicPlayerSheet';
import { SongDetailModal } from '../components/SongDetailModal';
import { useMusicStore } from '../store/useMusicStore';
import { getTheme, palette } from '../theme';

type AppTab = 'search' | 'favorites' | 'documentation' | 'settings';

const routeByTab: Record<AppTab, '/' | '/collection' | '/learn' | '/studio'> = {
  search: '/',
  favorites: '/collection',
  documentation: '/learn',
  settings: '/studio',
};

function tabFromPath(pathname: string): AppTab {
  if (pathname.startsWith('/collection')) return 'favorites';
  if (pathname.startsWith('/learn')) return 'documentation';
  if (pathname.startsWith('/studio')) return 'settings';
  return 'search';
}

function ClientMusicPlayerSheet() {
  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  if (!isMounted) return null;
  return <MusicPlayerSheet />;
}

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const loadFavorites = useMusicStore((state) => state.loadFavorites);
  const loadPreferences = useMusicStore((state) => state.loadPreferences);
  const selectedSongForDetail = useMusicStore((state) => state.selectedSongForDetail);
  const selectedSongInitialView = useMusicStore((state) => state.selectedSongInitialView);
  const setSelectedSongForDetail = useMusicStore((state) => state.setSelectedSongForDetail);
  const setActiveSong = useMusicStore((state) => state.setActiveSong);
  const setIsPlayerExpanded = useMusicStore((state) => state.setIsPlayerExpanded);
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    void Promise.all([loadFavorites(), loadPreferences()]);
  }, [loadFavorites, loadPreferences]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.background).catch(() => undefined);
    if (typeof document !== 'undefined') {
      document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.background);
    }
  }, [isDarkMode, theme.background]);

  const changeTab = (tab: AppTab) => {
    router.replace(routeByTab[tab]);
  };

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.background }]}>
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <AnimatedBackground />

        <View style={styles.viewport}>
          <View style={[styles.screenContainer, width > 700 && styles.desktopFrame]}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' }, animation: 'none' }} />
          </View>
        </View>

        <CustomTabBar activeTab={tabFromPath(pathname)} onTabChange={changeTab} />
        <ClientMusicPlayerSheet />
        <InstallPrompt />
        <SongDetailModal
          song={selectedSongForDetail}
          initialView={selectedSongInitialView}
          onClose={() => setSelectedSongForDetail(null)}
          onPlaySong={(song) => {
            setActiveSong(song);
            setIsPlayerExpanded(true);
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink },
  viewport: { flex: 1, alignItems: 'center' },
  screenContainer: { flex: 1, width: '100%' },
  desktopFrame: { maxWidth: 540 },
});
