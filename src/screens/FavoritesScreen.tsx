import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowUpRight, Heart, Play, RadioTower } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMusicStore } from '../store/useMusicStore';
import { SongCard } from '../components/SongCard';
import { Song } from '../types/song';
import { getTheme, palette, radii } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const favorites = useMusicStore((state) => state.favorites);
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const setActiveSong = useMusicStore((state) => state.setActiveSong);
  const setPlaybackQueue = useMusicStore((state) => state.setPlaybackQueue);
  const setIsPlayerExpanded = useMusicStore((state) => state.setIsPlayerExpanded);
  const setSelectedSongForDetail = useMusicStore((state) => state.setSelectedSongForDetail);
  const activeSong = useMusicStore((state) => state.activeSong);
  const hapticsEnabled = useMusicStore((state) => state.hapticsEnabled);
  const theme = getTheme(isDarkMode);

  const play = (song: Song, expand = false) => {
    setPlaybackQueue(favorites);
    setActiveSong(song);
    setIsPlayerExpanded(expand);
  };

  const openSongDetails = (song: Song) => {
    setPlaybackQueue(favorites);
    setSelectedSongForDetail(song);
  };

  const playAll = () => {
    if (!favorites[0]) return;
    if (hapticsEnabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    play(favorites[0], true);
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: insets.top + 13, paddingBottom: activeSong ? 194 : 116 }]}>
        <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(450)} style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.pink }]}>YOUR PRIVATE FREQUENCY</Text>
            <Text style={[styles.title, { color: theme.text }]}>Collection<Text style={{ color: palette.pink }}>.</Text></Text>
          </View>
          <View style={[styles.count, { borderColor: theme.line, backgroundColor: theme.surface }]}>
            <Heart size={14} color={palette.pink} fill={palette.pink} />
            <Text style={[styles.countText, { color: theme.text }]}>{favorites.length}</Text>
          </View>
        </Animated.View>

        {favorites.length === 0 ? (
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(100)} style={[styles.empty, { borderColor: theme.line }]}>
            <Image source={require('../../assets/prism-sound-hero-720.jpg')} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient colors={['rgba(8,7,11,0.06)', 'rgba(8,7,11,0.94)']} style={StyleSheet.absoluteFill} />
            <View style={styles.emptyIcon}><RadioTower size={19} color={palette.ink} /></View>
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>Your signal is quiet.</Text>
              <Text style={styles.emptyText}>Tap the heart on any track and it will live here — saved locally, ready when you return.</Text>
            </View>
          </Animated.View>
        ) : (
          <>
            <View style={[styles.summary, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <View>
                <Text style={[styles.summaryLabel, { color: theme.muted }]}>SAVED SESSION</Text>
                <Text style={[styles.summaryTitle, { color: theme.text }]}>{favorites.length} tracks</Text>
                <Text style={[styles.summarySub, { color: theme.muted }]}>Curated by you · stored on device</Text>
              </View>
              <Pressable onPress={playAll} style={styles.playAll} accessibilityRole="button" accessibilityLabel="Play all favorite tracks"><Play size={18} color={palette.ink} fill={palette.ink} /></Pressable>
            </View>

            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Loved lately</Text>
              <View style={styles.updated}><Text style={[styles.updatedText, { color: theme.muted }]}>UPDATED NOW</Text><ArrowUpRight size={13} color={theme.muted} /></View>
            </View>
            <View style={styles.list}>
              {favorites.map((song, index) => <SongCard key={song.id} song={song} index={index} onPress={play} onLongPress={openSongDetails} />)}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1 },
  header: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  eyebrow: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1.35, marginBottom: 4 },
  title: { fontSize: 38, lineHeight: 41, fontWeight: '900', letterSpacing: -1.8 },
  count: { minWidth: 54, height: 38, borderRadius: radii.pill, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  countText: { fontSize: 11, fontWeight: '800' },
  empty: { height: 440, marginHorizontal: 20, borderRadius: radii.xl, borderWidth: 1, overflow: 'hidden', justifyContent: 'space-between', padding: 22 },
  emptyIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: palette.lime, alignItems: 'center', justifyContent: 'center' },
  emptyCopy: { marginTop: 'auto' },
  emptyTitle: { color: palette.text, fontSize: 28, lineHeight: 31, fontWeight: '900', letterSpacing: -1.1 },
  emptyText: { color: 'rgba(247,244,238,0.67)', fontSize: 12, lineHeight: 18, fontWeight: '600', marginTop: 9, maxWidth: 290 },
  summary: { marginHorizontal: 20, borderWidth: 1, borderRadius: radii.lg, padding: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1.15 },
  summaryTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.8, marginTop: 5 },
  summarySub: { fontSize: 10.5, fontWeight: '600', marginTop: 2 },
  playAll: { width: 52, height: 52, borderRadius: 26, backgroundColor: palette.lime, alignItems: 'center', justifyContent: 'center' },
  sectionRow: { paddingHorizontal: 20, marginTop: 29, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.8 },
  updated: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  updatedText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  list: { paddingHorizontal: 20, gap: 8 },
});
