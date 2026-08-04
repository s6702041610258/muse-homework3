import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';

import { useMusicStore } from './src/store/useMusicStore';
import { AnimatedBackground } from './src/components/AnimatedBackground';
import { CustomTabBar } from './src/components/CustomTabBar';
import { MusicPlayerSheet } from './src/components/MusicPlayerSheet';
import { SongDetailModal } from './src/components/SongDetailModal';
import { InstallPrompt } from './src/components/InstallPrompt';

import { HomeScreen } from './src/screens/HomeScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { getTheme, palette } from './src/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'settings'>('search');
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const loadFavorites = useMusicStore((state) => state.loadFavorites);
  const loadPreferences = useMusicStore((state) => state.loadPreferences);
  const selectedSongForDetail = useMusicStore((state) => state.selectedSongForDetail);
  const selectedSongInitialView = useMusicStore((state) => state.selectedSongInitialView);
  const setSelectedSongForDetail = useMusicStore((state) => state.setSelectedSongForDetail);
  const setActiveSong = useMusicStore((state) => state.setActiveSong);
  const setIsPlayerExpanded = useMusicStore((state) => state.setIsPlayerExpanded);
  const { width } = useWindowDimensions();

  useEffect(() => {
    void Promise.all([loadFavorites(), loadPreferences()]);
  }, [loadFavorites, loadPreferences]);

  useEffect(() => {
    const theme = getTheme(isDarkMode);
    void SystemUI.setBackgroundColorAsync(theme.background);
    if (typeof document !== 'undefined') {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.background);
    }
  }, [isDarkMode]);

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: getTheme(isDarkMode).background }]}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

        {/* 1. Skia Custom Shader Gradient Canvas + Gyroscope Parallax Background */}
        <AnimatedBackground />

        {/* 2. Screen Views */}
        <View style={styles.viewport}>
          <View style={[styles.screenContainer, width > 700 && styles.desktopFrame]}>
            {activeTab === 'search' && <HomeScreen />}
            {activeTab === 'favorites' && <FavoritesScreen />}
            {activeTab === 'settings' && <SettingsScreen />}
          </View>
        </View>

        {/* 3. Floating Custom Animated Tab Bar */}
        <CustomTabBar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

        {/* 4. Mini Player / Drag Bottom Sheet Full Player */}
        <MusicPlayerSheet />
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
  root: {
    flex: 1,
    backgroundColor: palette.ink,
  },
  viewport: {
    flex: 1,
    alignItems: 'center',
  },
  screenContainer: {
    flex: 1,
    width: '100%',
  },
  desktopFrame: {
    maxWidth: 540,
  },
});
