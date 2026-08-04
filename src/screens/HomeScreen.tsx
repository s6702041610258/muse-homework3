import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, BookOpen, Headphones, Radio, Sparkles, TrendingUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useMusicStore } from '../store/useMusicStore';
import { searchSongs } from '../services/itunesApi';
import { Song } from '../types/song';
import { SearchBar } from '../components/SearchBar';
import { SongCard } from '../components/SongCard';
import { Song3DCarousel } from '../components/Song3DCarousel';
import { SkeletonCard } from '../components/SkeletonCard';
import { getTheme, palette, radii } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

const moods = [
  { label: 'K-Pop', accent: palette.lime },
  { label: 'Alt R&B', accent: palette.violet },
  { label: 'Indie', accent: palette.coral },
  { label: 'Thai Pop', accent: palette.pink },
  { label: 'Electronic', accent: '#65D9FF' },
];

interface HomeScreenProps {
  onOpenDocumentation: () => void;
}

export function HomeScreen({ onOpenDocumentation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const searchQuery = useMusicStore((state) => state.searchQuery);
  const searchResults = useMusicStore((state) => state.searchResults);
  const setSearchQuery = useMusicStore((state) => state.setSearchQuery);
  const setSearchResults = useMusicStore((state) => state.setSearchResults);
  const isLoading = useMusicStore((state) => state.isLoading);
  const setIsLoading = useMusicStore((state) => state.setIsLoading);
  const error = useMusicStore((state) => state.error);
  const setError = useMusicStore((state) => state.setError);
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const activeThemeColor = useMusicStore((state) => state.activeThemeColor);
  const setActiveSong = useMusicStore((state) => state.setActiveSong);
  const setPlaybackQueue = useMusicStore((state) => state.setPlaybackQueue);
  const setIsPlayerExpanded = useMusicStore((state) => state.setIsPlayerExpanded);
  const setSelectedSongForDetail = useMusicStore((state) => state.setSelectedSongForDetail);
  const hapticsEnabled = useMusicStore((state) => state.hapticsEnabled);
  const activeSong = useMusicStore((state) => state.activeSong);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const searchRequestRef = useRef<{ id: number; controller: AbortController } | null>(null);
  const initialSearchQueryRef = useRef(searchQuery);
  const theme = getTheme(isDarkMode);

  const fetchMusic = useCallback(async (query: string, retryOnce = false) => {
    searchRequestRef.current?.controller.abort();
    setError(null);
    if (!query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      setRefreshing(false);
      return;
    }
    const request = {
      id: (searchRequestRef.current?.id ?? 0) + 1,
      controller: new AbortController(),
    };
    searchRequestRef.current = request;
    setIsLoading(true);
    try {
      let songs: Song[] = [];
      const maxAttempts = retryOnce ? 2 : 1;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          songs = await searchSongs(query, 30, request.controller.signal);
          break;
        } catch (requestError) {
          if (request.controller.signal.aborted || attempt === maxAttempts - 1) throw requestError;
          await new Promise((resolve) => setTimeout(resolve, 350));
          if (request.controller.signal.aborted) return;
        }
      }
      if (searchRequestRef.current?.id === request.id) setSearchResults(songs);
    } catch (err) {
      if (!request.controller.signal.aborted && searchRequestRef.current?.id === request.id) {
        setError(err instanceof Error ? err.message : 'Could not reach the music catalog.');
      }
    } finally {
      if (searchRequestRef.current?.id === request.id) {
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  }, [setError, setIsLoading, setSearchResults]);

  useEffect(() => {
    void fetchMusic(initialSearchQueryRef.current, true);
    return () => searchRequestRef.current?.controller.abort();
  }, [fetchMusic]);

  const handleSelectSong = (song: Song, expand = false) => {
    setPlaybackQueue(searchResults);
    setActiveSong(song);
    setIsPlayerExpanded(expand);
  };

  const openSongDetails = (song: Song) => {
    setPlaybackQueue(searchResults);
    setSelectedSongForDetail(song);
  };

  const selectMood = (label: string) => {
    if (hapticsEnabled) void Haptics.selectionAsync();
    setSearchQuery(label);
    void fetchMusic(label);
  };

  const onRefresh = () => {
    if (hapticsEnabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    void fetchMusic(searchQuery);
  };

  const quickPicks = useMemo(
    () => (showAll ? searchResults : searchResults.slice(0, 5)),
    [searchResults, showAll],
  );
  const featured = searchResults[0];
  const bottomSpace = activeSong ? 194 : 116;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: bottomSpace }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeThemeColor} colors={[activeThemeColor]} />}
      >
        <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(500)} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.signalLabel, { color: theme.muted }]}>LIVE CATALOG · SIGNAL 94.2</Text>
              <Text style={[styles.wordmark, { color: theme.text }]}>MUSE<Text style={{ color: activeThemeColor }}>°</Text></Text>
            </View>
            <View style={[styles.livePill, { borderColor: `${palette.coral}55`, backgroundColor: `${palette.coral}12` }]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={[styles.statement, width < 350 && styles.statementCompact, { color: theme.text }]}>Find your{`\n`}frequency.</Text>
          <Text style={[styles.statementCopy, { color: theme.muted }]}>Thirty-second previews. Zero noise. <Text style={{ color: activeThemeColor }}>•</Text>{`\n`}A universe of sound, tuned to you.</Text>
        </Animated.View>

        <Pressable
          onPress={onOpenDocumentation}
          style={({ pressed }) => [styles.learnBanner, { backgroundColor: theme.surface, borderColor: `${activeThemeColor}55` }, pressed && styles.learnBannerPressed]}
          accessibilityRole="button"
          accessibilityLabel="Open the MUSE project guide"
          accessibilityHint="Shows detailed English documentation about the app architecture, tools, and features"
        >
          <View style={styles.learnBannerLeft}>
            <View style={[styles.learnBannerIcon, { backgroundColor: activeThemeColor }]}><BookOpen size={17} color={palette.ink} /></View>
            <View style={styles.learnBannerCopy}>
              <Text style={[styles.learnBannerKicker, { color: activeThemeColor }]}>NEW · OPEN PROJECT GUIDE</Text>
              <Text style={[styles.learnBannerTitle, { color: theme.text }]}>See how MUSE is built</Text>
              <Text style={[styles.learnBannerText, { color: theme.muted }]}>Architecture, tools, features, data flow, testing, and release notes.</Text>
            </View>
          </View>
          <View style={[styles.learnBannerArrow, { borderColor: theme.line }]}><ArrowRight size={16} color={theme.text} /></View>
        </Pressable>

        <SearchBar key={searchQuery} onSearch={(text) => void fetchMusic(text)} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodRail}>
          {moods.map((mood) => {
            const selected = searchQuery.toLowerCase() === mood.label.toLowerCase();
            return (
              <Pressable
                key={mood.label}
                onPress={() => selectMood(mood.label)}
                style={[
                  styles.moodChip,
                  { borderColor: selected ? mood.accent : theme.line, backgroundColor: selected ? mood.accent : theme.surface },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Search ${mood.label}`}
                accessibilityState={{ selected }}
              >
                <View style={[styles.moodDot, { backgroundColor: selected ? palette.ink : mood.accent }]} />
                <Text style={[styles.moodText, { color: selected ? palette.ink : theme.text }]}>{mood.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {isLoading && !refreshing ? (
          <View style={styles.loadingBlock}>
            <View style={[styles.loadingHero, { backgroundColor: theme.surfaceSoft }]} />
            {[0, 1, 2].map((item) => <SkeletonCard key={item} />)}
          </View>
        ) : error ? (
          <Animated.View entering={reducedMotion ? undefined : FadeIn} style={[styles.messageCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
            <Radio size={25} color={palette.coral} />
            <Text style={[styles.messageTitle, { color: theme.text }]}>Signal interrupted</Text>
            <Text style={[styles.messageCopy, { color: theme.muted }]}>{error}</Text>
            <Pressable style={[styles.retryButton, { backgroundColor: activeThemeColor }]} onPress={() => void fetchMusic(searchQuery)} accessibilityRole="button" accessibilityLabel="Retry music search">
              <Text style={styles.retryText}>Reconnect</Text>
            </Pressable>
          </Animated.View>
        ) : searchResults.length === 0 ? (
          <View style={[styles.hero, { borderColor: theme.line }]}>
            <Image source={require('../../assets/prism-sound-hero-720.jpg')} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient colors={['transparent', 'rgba(8,7,11,0.30)', 'rgba(8,7,11,0.96)']} locations={[0.08, 0.44, 1]} style={StyleSheet.absoluteFill} />
            <View style={styles.heroContent}>
              <Text style={[styles.heroLabel, { color: activeThemeColor }]}>MUSE ORIGINAL · 001</Text>
              <Text style={styles.heroTitle}>Sound without{`\n`}the algorithm.</Text>
              <Text style={styles.heroCopy}>Choose a mood above or search for an artist to start your session.</Text>
            </View>
          </View>
        ) : (
          <>
            <Pressable onPress={() => featured && handleSelectSong(featured, true)} style={[styles.hero, { borderColor: theme.line }]} accessibilityRole="button" accessibilityLabel={`Play ${featured.title} by ${featured.artist}`}>
              <Image source={{ uri: featured.artwork }} style={StyleSheet.absoluteFill} contentFit="cover" transition={350} />
              <LinearGradient colors={['rgba(8,7,11,0.02)', 'rgba(8,7,11,0.22)', 'rgba(8,7,11,0.98)']} locations={[0.05, 0.45, 1]} style={StyleSheet.absoluteFill} />
              <View style={styles.heroTopRow}>
                <View style={[styles.featuredTag, { backgroundColor: activeThemeColor }]}><Sparkles size={12} color={palette.ink} /><Text style={styles.featuredTagText}>FEATURED</Text></View>
                <View style={styles.heroArrow}><ArrowRight size={18} color={palette.text} /></View>
              </View>
              <View style={styles.heroContent}>
                <Text style={[styles.heroLabel, { color: activeThemeColor }]}>{featured.genre.toUpperCase()} · {featured.releaseDate}</Text>
                <Text numberOfLines={2} style={styles.heroTitle}>{featured.title}</Text>
                <Text numberOfLines={1} style={styles.heroCopy}>{featured.artist} — {featured.album}</Text>
              </View>
            </Pressable>

            <View style={styles.sectionHeader}>
              <View>
                <View style={styles.sectionKicker}><TrendingUp size={13} color={activeThemeColor} /><Text style={[styles.sectionKickerText, { color: activeThemeColor }]}>ON YOUR RADAR</Text></View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Fresh orbit</Text>
              </View>
              <Text style={[styles.sectionCount, { color: theme.muted }]}>{searchResults.length} TRACKS</Text>
            </View>

            <Song3DCarousel songs={searchResults.slice(0, 10)} onSelectSong={handleSelectSong} onLongPressSong={openSongDetails} />

            <View style={styles.sectionHeader}>
              <View>
                <View style={styles.sectionKicker}><Headphones size={13} color={palette.coral} /><Text style={[styles.sectionKickerText, { color: palette.coral }]}>QUICK LISTEN</Text></View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>In the mix</Text>
              </View>
              <Pressable onPress={() => setShowAll((value) => !value)} accessibilityRole="button" accessibilityLabel={showAll ? 'Collapse track list' : 'Show all tracks'} accessibilityState={{ expanded: showAll }}><Text style={[styles.seeAll, { color: theme.text }]}>{showAll ? 'Collapse' : 'See all'}</Text></Pressable>
            </View>

            <View style={styles.list}>
              {quickPicks.map((song, index) => (
                <SongCard key={song.id} song={song} index={index} onPress={handleSelectSong} onLongPress={openSongDetails} />
              ))}
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
  header: { paddingHorizontal: 20, paddingTop: 1, paddingBottom: 4 },
  headerTop: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  signalLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1.35, marginBottom: 2 },
  wordmark: { fontSize: 26, lineHeight: 29, fontWeight: '900', letterSpacing: -1.25 },
  livePill: { height: 34, borderRadius: radii.pill, borderWidth: 1, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.coral, marginRight: 6 },
  liveText: { color: palette.coral, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.9 },
  statement: { fontSize: 42, lineHeight: 40, fontWeight: '900', letterSpacing: -2.1, marginTop: 14 },
  statementCompact: { fontSize: 36, lineHeight: 35, letterSpacing: -1.7 },
  statementCopy: { fontSize: 10.5, lineHeight: 15, fontWeight: '600', marginTop: 5, marginBottom: 5 },
  learnBanner: { marginHorizontal: 20, marginTop: 10, marginBottom: 12, borderWidth: 1, borderRadius: radii.lg, padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  learnBannerPressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  learnBannerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  learnBannerIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  learnBannerCopy: { flex: 1, marginLeft: 10 },
  learnBannerKicker: { fontSize: 6.8, fontWeight: '900', letterSpacing: 0.85 },
  learnBannerTitle: { fontSize: 13, fontWeight: '900', letterSpacing: -0.25, marginTop: 2 },
  learnBannerText: { fontSize: 7.8, lineHeight: 11.5, fontWeight: '600', marginTop: 2 },
  learnBannerArrow: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  moodRail: { paddingHorizontal: 20, paddingTop: 3, paddingBottom: 16, gap: 8 },
  moodChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.pill, paddingVertical: 9, paddingHorizontal: 12 },
  moodDot: { width: 6, height: 6, borderRadius: 3, marginRight: 7 },
  moodText: { fontSize: 11, fontWeight: '700' },
  hero: { height: 280, marginHorizontal: 20, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, backgroundColor: palette.inkRaised, justifyContent: 'space-between' },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  featuredTag: { flexDirection: 'row', alignItems: 'center', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 7, gap: 5 },
  featuredTagText: { color: palette.ink, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  heroArrow: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,7,11,0.62)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  heroContent: { marginTop: 'auto', padding: 22 },
  heroLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginBottom: 8 },
  heroTitle: { color: palette.text, fontSize: 29, lineHeight: 30, fontWeight: '900', letterSpacing: -1 },
  heroCopy: { color: 'rgba(247,244,238,0.70)', fontSize: 11.5, lineHeight: 16, fontWeight: '600', marginTop: 9 },
  sectionHeader: { paddingHorizontal: 20, marginTop: 30, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionKicker: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  sectionKickerText: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1.25 },
  sectionTitle: { fontSize: 25, lineHeight: 29, fontWeight: '900', letterSpacing: -0.9 },
  sectionCount: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  seeAll: { fontSize: 11, fontWeight: '800', textDecorationLine: 'underline' },
  list: { paddingHorizontal: 20, gap: 8 },
  loadingBlock: { paddingTop: 4 },
  loadingHero: { height: 270, borderRadius: radii.xl, marginHorizontal: 20, marginBottom: 12 },
  messageCard: { margin: 20, borderWidth: 1, borderRadius: radii.lg, padding: 24, alignItems: 'flex-start' },
  messageTitle: { fontSize: 20, fontWeight: '800', marginTop: 15 },
  messageCopy: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  retryButton: { marginTop: 18, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 10 },
  retryText: { color: palette.ink, fontSize: 11, fontWeight: '900' },
});
