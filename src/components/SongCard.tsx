import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Heart, Pause, Play } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Song } from '../types/song';
import { useMusicStore } from '../store/useMusicStore';
import { getTheme, palette, radii } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface SongCardProps {
  song: Song;
  index: number;
  onPress: (song: Song) => void;
  onLongPress: (song: Song) => void;
  onSkip?: (song: Song) => void;
}

function formatDuration(ms: number) {
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function SongCard({ song, index, onPress, onLongPress }: SongCardProps) {
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const activeSong = useMusicStore((state) => state.activeSong);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const favorites = useMusicStore((state) => state.favorites);
  const toggleFavorite = useMusicStore((state) => state.toggleFavorite);
  const hapticsEnabled = useMusicStore((state) => state.hapticsEnabled);
  const activeThemeColor = useMusicStore((state) => state.activeThemeColor);
  const reducedMotion = useReducedMotion();
  const theme = getTheme(isDarkMode);
  const current = activeSong?.id === song.id;
  const favorite = favorites.some((item) => item.id === song.id);

  const feedback = (style: Haptics.ImpactFeedbackStyle) => {
    if (hapticsEnabled) void Haptics.impactAsync(style);
  };

  return (
    <Animated.View style={styles.rowFrame} entering={reducedMotion ? undefined : FadeInDown.delay(Math.min(index * 45, 220)).springify().damping(18)}>
      <Pressable
        onPress={() => { feedback(Haptics.ImpactFeedbackStyle.Light); onPress(song); }}
        onLongPress={() => { feedback(Haptics.ImpactFeedbackStyle.Heavy); onLongPress(song); }}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: current ? `${activeThemeColor}24` : theme.surface, borderColor: current ? `${activeThemeColor}80` : theme.line },
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${song.title} by ${song.artist}`}
        accessibilityHint="Plays this preview. Long press for track details."
      >
        <Text style={[styles.number, { color: current ? activeThemeColor : theme.muted }]}>{String(index + 1).padStart(2, '0')}</Text>
        <View style={styles.artworkWrap}>
          <Image source={{ uri: song.artwork }} style={styles.artwork} contentFit="cover" transition={250} />
          {current && <View style={styles.playingOverlay}>{isPlaying ? <Pause size={14} color={palette.text} fill={palette.text} /> : <Play size={14} color={palette.text} fill={palette.text} />}</View>}
        </View>
        <View style={styles.info}>
          <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>{song.title}</Text>
          <Text numberOfLines={1} style={[styles.artist, { color: theme.muted }]}>{song.artist} · {song.genre}</Text>
        </View>
        <View style={styles.end}>
          <Text style={[styles.duration, { color: theme.muted }]}>{formatDuration(song.durationMs)}</Text>
        </View>
      </Pressable>
      <Pressable
        hitSlop={8}
        onPress={() => { feedback(Haptics.ImpactFeedbackStyle.Medium); void toggleFavorite(song); }}
        style={styles.heartButton}
        accessibilityRole="button"
        accessibilityLabel={favorite ? `Remove ${song.title} from favorites` : `Save ${song.title} to favorites`}
        accessibilityState={{ selected: favorite }}
      >
        <Heart size={17} color={favorite ? palette.pink : theme.muted} fill={favorite ? palette.pink : 'transparent'} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rowFrame: { position: 'relative' },
  row: { height: 74, borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  number: { width: 25, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  artworkWrap: { width: 50, height: 50, borderRadius: 14, overflow: 'hidden' },
  artwork: { width: '100%', height: '100%' },
  playingOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(8,7,11,0.54)', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 11, marginRight: 7 },
  title: { fontSize: 13, fontWeight: '800', letterSpacing: -0.15 },
  artist: { fontSize: 9.5, fontWeight: '600', marginTop: 3 },
  end: { width: 38, height: 54, alignItems: 'center', paddingTop: 4 },
  duration: { fontSize: 8.5, fontWeight: '700' },
  heartButton: { position: 'absolute', right: 10, bottom: 2, zIndex: 2, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
});
