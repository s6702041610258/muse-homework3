import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, SharedValue } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Pause, Play } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Song } from '../types/song';
import { useMusicStore } from '../store/useMusicStore';
import { getTheme, palette, radii } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { createShadow } from '../utils/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(184, SCREEN_WIDTH * 0.46);
const GAP = 12;
const SNAP = CARD_WIDTH + GAP;

interface Song3DCarouselProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onLongPressSong: (song: Song) => void;
}

interface OrbitCardProps extends Song3DCarouselProps {
  song: Song;
  index: number;
  scrollX: SharedValue<number>;
  reducedMotion: boolean;
}

function OrbitCard({ song, index, scrollX, onSelectSong, onLongPressSong, reducedMotion }: OrbitCardProps) {
  const activeSong = useMusicStore((state) => state.activeSong);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const favorites = useMusicStore((state) => state.favorites);
  const toggleFavorite = useMusicStore((state) => state.toggleFavorite);
  const hapticsEnabled = useMusicStore((state) => state.hapticsEnabled);
  const activeThemeColor = useMusicStore((state) => state.activeThemeColor);
  const theme = getTheme(isDarkMode);
  const current = activeSong?.id === song.id;
  const favorite = favorites.some((item) => item.id === song.id);

  const animatedStyle = useAnimatedStyle(() => {
    if (reducedMotion) return { opacity: 1, zIndex: 1, transform: [{ perspective: 760 }, { translateX: 0 }, { translateY: 0 }, { scale: 1 }, { rotateY: '0deg' }, { rotateZ: '0deg' }] };
    const input = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];
    return {
      opacity: interpolate(scrollX.value, input, [0.62, 1, 0.72], Extrapolation.CLAMP),
      zIndex: Math.round(interpolate(scrollX.value, input, [1, 10, 1], Extrapolation.CLAMP)),
      transform: [
        { perspective: 760 },
        { translateX: interpolate(scrollX.value, input, [15, 0, -15], Extrapolation.CLAMP) },
        { translateY: interpolate(scrollX.value, input, [22, -4, 15], Extrapolation.CLAMP) },
        { scale: interpolate(scrollX.value, input, [0.82, 1.035, 0.88], Extrapolation.CLAMP) },
        { rotateY: `${interpolate(scrollX.value, input, [34, -2, -29], Extrapolation.CLAMP)}deg` },
        { rotateZ: `${interpolate(scrollX.value, input, [-2.4, 0, 2.1], Extrapolation.CLAMP)}deg` },
      ],
    };
  }, [reducedMotion]);

  const artworkStyle = useAnimatedStyle(() => {
    if (reducedMotion) return { transform: [{ translateX: 0 }, { scale: 1 }, { rotateZ: '0deg' }] };
    const input = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];
    return {
      transform: [
        { translateX: interpolate(scrollX.value, input, [-10, 0, 10], Extrapolation.CLAMP) },
        { scale: interpolate(scrollX.value, input, [1.08, 1.015, 1.08], Extrapolation.CLAMP) },
        { rotateZ: `${interpolate(scrollX.value, input, [1.4, 0, -1.4], Extrapolation.CLAMP)}deg` },
      ],
    };
  }, [reducedMotion]);

  const glowStyle = useAnimatedStyle(() => {
    if (reducedMotion) return { opacity: 0, transform: [{ scale: 0.92 }] };
    const input = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];
    return {
      opacity: interpolate(scrollX.value, input, [0.05, 0.3, 0.06], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(scrollX.value, input, [0.86, 1.04, 0.9], Extrapolation.CLAMP) }],
    };
  }, [reducedMotion]);

  const shineStyle = useAnimatedStyle(() => {
    if (reducedMotion) return { opacity: 0, transform: [{ translateX: -CARD_WIDTH }, { rotateZ: '16deg' }] };
    const input = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];
    return {
      opacity: interpolate(scrollX.value, input, [0.08, 0.42, 0.1], Extrapolation.CLAMP),
      transform: [
        { translateX: interpolate(scrollX.value, input, [-CARD_WIDTH * 0.8, CARD_WIDTH * 0.18, CARD_WIDTH * 0.9], Extrapolation.CLAMP) },
        { rotateZ: '16deg' },
      ],
    };
  }, [reducedMotion]);

  const haptic = (style: Haptics.ImpactFeedbackStyle) => {
    if (hapticsEnabled) void Haptics.impactAsync(style);
  };

  return (
    <Animated.View style={[styles.cardFrame, animatedStyle]}>
      <Animated.View style={[styles.depthGlow, styles.noPointerEvents, glowStyle, { backgroundColor: activeThemeColor }]} />
      <Pressable
        onPress={() => { haptic(Haptics.ImpactFeedbackStyle.Light); onSelectSong(song); }}
        onLongPress={() => { haptic(Haptics.ImpactFeedbackStyle.Heavy); onLongPressSong(song); }}
        style={[styles.card, { backgroundColor: theme.surface, borderColor: current ? activeThemeColor : theme.line }]}
        accessibilityRole="button"
        accessibilityLabel={`${song.title} by ${song.artist}`}
        accessibilityHint="Plays this preview. Long press for track details."
      >
        <Animated.View style={[styles.artWrap, artworkStyle]}>
          <Image source={{ uri: song.artwork }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
          <LinearGradient colors={['transparent', 'rgba(8,7,11,0.74)']} style={StyleSheet.absoluteFill} />
          <Animated.View style={[styles.shine, styles.noPointerEvents, shineStyle]}>
            <LinearGradient colors={['transparent', 'rgba(255,255,255,0.38)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
          <View style={[styles.play, { backgroundColor: activeThemeColor }]}>
            {current && isPlaying ? <Pause size={15} color={palette.ink} fill={palette.ink} /> : <Play size={15} color={palette.ink} fill={palette.ink} />}
          </View>
        </Animated.View>
        <View style={styles.meta}>
          <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>{song.title}</Text>
          <Text numberOfLines={1} style={[styles.artist, { color: theme.muted }]}>{song.artist}</Text>
          <View style={styles.footer}>
            <Text numberOfLines={1} style={[styles.genre, { color: theme.muted }]}>{song.genre.toUpperCase()}</Text>
            {current && <View style={styles.signal}><View style={[styles.barSmall, { backgroundColor: activeThemeColor }]} /><View style={[styles.barTall, { backgroundColor: activeThemeColor }]} /><View style={[styles.barMid, { backgroundColor: activeThemeColor }]} /></View>}
          </View>
        </View>
      </Pressable>
      <Pressable
        hitSlop={12}
        onPress={() => { haptic(Haptics.ImpactFeedbackStyle.Light); void toggleFavorite(song); }}
        style={styles.favorite}
        accessibilityRole="button"
        accessibilityLabel={favorite ? `Remove ${song.title} from favorites` : `Save ${song.title} to favorites`}
        accessibilityState={{ selected: favorite }}
      >
        <Heart size={15} color={favorite ? palette.pink : palette.text} fill={favorite ? palette.pink : 'transparent'} />
      </Pressable>
    </Animated.View>
  );
}

export function Song3DCarousel(props: Song3DCarouselProps) {
  const scrollX = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const ref = useRef<Animated.ScrollView>(null);
  const scrollHandler = useAnimatedScrollHandler((event) => { scrollX.value = event.contentOffset.x; });

  return (
    <Animated.ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={SNAP}
      decelerationRate="fast"
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      contentContainerStyle={styles.rail}
    >
      {props.songs.map((song, index) => <OrbitCard key={song.id} {...props} song={song} index={index} scrollX={scrollX} reducedMotion={reducedMotion} />)}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  noPointerEvents: { pointerEvents: 'none' },
  rail: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: GAP },
  cardFrame: { width: CARD_WIDTH, height: 242, position: 'relative' },
  depthGlow: { position: 'absolute', left: 14, right: 14, top: 20, bottom: -8, borderRadius: radii.xl },
  card: { flex: 1, borderRadius: radii.lg, borderWidth: 1, overflow: 'hidden', backfaceVisibility: 'hidden', ...createShadow('#000000', 13, 24, 0.42, 12) },
  artWrap: { height: 165, margin: 7, borderRadius: 21, overflow: 'hidden', backgroundColor: palette.inkSoft, backfaceVisibility: 'hidden' },
  shine: { position: 'absolute', top: -35, bottom: -35, left: -18, width: 62 },
  index: { position: 'absolute', top: 10, left: 11, color: palette.text, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  favorite: { position: 'absolute', top: 15, right: 15, zIndex: 2, width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,7,11,0.55)' },
  play: { position: 'absolute', bottom: 9, right: 9, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  meta: { paddingHorizontal: 12, paddingBottom: 10, flex: 1, justifyContent: 'center' },
  title: { fontSize: 13.5, fontWeight: '800', letterSpacing: -0.25 },
  artist: { fontSize: 10.5, fontWeight: '600', marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 7 },
  genre: { fontSize: 7.5, fontWeight: '800', letterSpacing: 0.8, maxWidth: '75%' },
  signal: { height: 10, flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  barSmall: { width: 2, height: 4, borderRadius: 1 },
  barTall: { width: 2, height: 10, borderRadius: 1 },
  barMid: { width: 2, height: 7, borderRadius: 1 },
});
