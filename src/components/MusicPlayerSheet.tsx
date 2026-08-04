import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent, Modal, ScrollView, useWindowDimensions } from 'react-native';
import Animated, { cancelAnimation, Easing, FadeIn, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, Clapperboard, Heart, ListMusic, Pause, Play, Repeat2, Shuffle, SkipBack, SkipForward, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMusicStore } from '../store/useMusicStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { getTheme, palette, radii } from '../theme';
import { createShadow } from '../utils/shadows';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../hooks/useReducedMotion';

const MINI_HEIGHT = 72;

export function MusicPlayerSheet() {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const activeSong = useMusicStore((state) => state.activeSong);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const playbackPosition = useMusicStore((state) => state.playbackPosition);
  const playbackDuration = useMusicStore((state) => state.playbackDuration);
  const meteringLevel = useMusicStore((state) => state.meteringLevel);
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const activeThemeColor = useMusicStore((state) => state.activeThemeColor);
  const isPlayerExpanded = useMusicStore((state) => state.isPlayerExpanded);
  const isVideoPlaying = useMusicStore((state) => state.isVideoPlaying);
  const setIsPlayerExpanded = useMusicStore((state) => state.setIsPlayerExpanded);
  const favorites = useMusicStore((state) => state.favorites);
  const toggleFavorite = useMusicStore((state) => state.toggleFavorite);
  const hapticsEnabled = useMusicStore((state) => state.hapticsEnabled);
  const playbackQueue = useMusicStore((state) => state.playbackQueue);
  const shuffleEnabled = useMusicStore((state) => state.shuffleEnabled);
  const repeatMode = useMusicStore((state) => state.repeatMode);
  const playbackError = useMusicStore((state) => state.playbackError);
  const toggleShuffle = useMusicStore((state) => state.toggleShuffle);
  const cycleRepeatMode = useMusicStore((state) => state.cycleRepeatMode);
  const setActiveSong = useMusicStore((state) => state.setActiveSong);
  const openSelectedSongVideo = useMusicStore((state) => state.openSelectedSongVideo);
  const { playPause, seekTo, changeTrack } = useAudioPlayer();
  const [progressWidth, setProgressWidth] = useState(1);
  const [showQueue, setShowQueue] = useState(false);
  const expansion = useSharedValue(0);
  const rotation = useSharedValue(0);
  const theme = getTheme(isDarkMode);
  const compact = screenHeight < 730 || screenWidth < 360;
  const fullHeight = Math.max(MINI_HEIGHT, Math.min(820, screenHeight - Math.max(8, insets.top)));
  const miniBottom = Math.max(88, insets.bottom + 70);

  useEffect(() => {
    expansion.value = reducedMotion ? (isPlayerExpanded ? 1 : 0) : withSpring(isPlayerExpanded ? 1 : 0, { damping: 20, stiffness: 150 });
  }, [isPlayerExpanded, expansion, reducedMotion]);

  useEffect(() => {
    if (isPlaying && isPlayerExpanded && !reducedMotion) {
      rotation.value = withRepeat(withTiming(rotation.value + 360, { duration: 11000, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(rotation);
      if (reducedMotion) rotation.value = 0;
    }
  }, [isPlaying, isPlayerExpanded, reducedMotion, rotation]);

  const shellStyle = useAnimatedStyle(() => ({
    height: interpolate(expansion.value, [0, 1], [MINI_HEIGHT, fullHeight]),
    bottom: interpolate(expansion.value, [0, 1], [miniBottom, 0]),
    borderRadius: interpolate(expansion.value, [0, 1], [23, 36]),
  }));
  const artStyle = useAnimatedStyle(() => ({ transform: [{ perspective: 900 }, { rotateY: '-7deg' }, { rotateZ: `${rotation.value}deg` }] }));

  const feedback = (style = Haptics.ImpactFeedbackStyle.Light) => {
    if (hapticsEnabled) void Haptics.impactAsync(style);
  };

  const skipTrack = (direction: 1 | -1) => {
    feedback(Haptics.ImpactFeedbackStyle.Medium);
    changeTrack(direction);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const seekFromPress = (event: { nativeEvent: { locationX: number } }) => {
    const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / progressWidth));
    void seekTo(playbackDuration * ratio);
  };

  const closeGesture = Gesture.Pan().onEnd((event) => {
    if (event.translationY > 55 || event.velocityY > 650) {
      setIsPlayerExpanded(false);
    }
  }).runOnJS(true);

  if (!activeSong || isVideoPlaying) return null;
  const favorite = favorites.some((item) => item.id === activeSong.id);
  const percent = Math.max(0, Math.min(100, playbackDuration ? (playbackPosition / playbackDuration) * 100 : 0));
  const bars = [0.44, 0.72, 0.92, 0.58, 1, 0.66, 0.84, 0.5, 0.76, 0.96, 0.62, 0.8, 0.48, 0.9, 0.7, 1, 0.56, 0.82, 0.64, 0.94, 0.52, 0.74, 0.88, 0.6];

  return (
    <GestureDetector gesture={closeGesture}>
      <Animated.View style={[styles.shell, shellStyle, { borderColor: theme.line, backgroundColor: theme.surface }]}>
        <BlurView intensity={isDarkMode ? 72 : 86} tint={isDarkMode ? 'dark' : 'light'} style={[styles.fill, styles.clip, { backgroundColor: isDarkMode ? 'rgba(17,16,22,0.86)' : 'rgba(255,255,255,0.84)' }]}>
          {!isPlayerExpanded ? (
            <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(180)} style={styles.mini}>
              <Pressable onPress={() => { feedback(Haptics.ImpactFeedbackStyle.Medium); setIsPlayerExpanded(true); }} style={styles.miniMain} accessibilityRole="button" accessibilityLabel={`Open player for ${activeSong.title}`}>
                <Image source={{ uri: activeSong.artwork }} style={styles.miniArt} contentFit="cover" />
                <View style={styles.miniCopy}>
                  <View style={styles.miniSignal}><View style={[styles.signalDot, { backgroundColor: activeThemeColor }]} /><Text style={[styles.miniLabel, { color: activeThemeColor }]}>NOW PLAYING</Text></View>
                  <Text numberOfLines={1} style={[styles.miniTitle, { color: theme.text }]}>{activeSong.title}</Text>
                  <Text numberOfLines={1} style={[styles.miniArtist, { color: theme.muted }]}>{activeSong.artist}</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => { feedback(); playPause(); }} style={[styles.miniPlay, { backgroundColor: activeThemeColor }]} accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pause preview' : 'Play preview'}>
                {isPlaying ? <Pause size={18} color={palette.ink} fill={palette.ink} /> : <Play size={18} color={palette.ink} fill={palette.ink} />}
              </Pressable>
              <View style={[styles.miniProgress, { width: `${percent}%`, backgroundColor: activeThemeColor }]} />
            </Animated.View>
          ) : (
            <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(260)} style={[styles.full, compact && styles.fullCompact]}>
              <LinearGradient colors={[`${activeThemeColor}24`, 'transparent']} style={StyleSheet.absoluteFill} />
              <View style={styles.dragHandle} />
              <View style={styles.fullHeader}>
                <Pressable onPress={() => setIsPlayerExpanded(false)} style={[styles.headerButton, { borderColor: theme.line }]} accessibilityRole="button" accessibilityLabel="Collapse player"><ChevronDown size={20} color={theme.text} /></Pressable>
                <View style={styles.headerCenter}><Text style={[styles.headerLabel, { color: activeThemeColor }]}>MUSE PLAYER</Text><Text style={[styles.headerSub, { color: theme.muted }]}>PREVIEW SESSION</Text></View>
                <Pressable onPress={() => void toggleFavorite(activeSong)} style={[styles.headerButton, { borderColor: theme.line }]} accessibilityRole="button" accessibilityLabel={favorite ? 'Remove from favorites' : 'Save to favorites'} accessibilityState={{ selected: favorite }}><Heart size={19} color={favorite ? palette.pink : theme.text} fill={favorite ? palette.pink : 'transparent'} /></Pressable>
              </View>

              <View style={[styles.artStage, compact && styles.artStageCompact]}>
                <View style={[styles.backPlate, { backgroundColor: `${activeThemeColor}55` }]} />
                <Animated.View style={[styles.album, artStyle, { borderColor: `${activeThemeColor}80` }]}>
                  <Image source={{ uri: activeSong.artwork }} style={styles.fill} contentFit="cover" />
                  <View style={styles.discRing} /><View style={styles.discLabel} /><View style={styles.discPin} />
                </Animated.View>
                <View style={[styles.orbit, { borderColor: `${activeThemeColor}55` }]} />
                <View style={[styles.orbitPearl, { backgroundColor: activeThemeColor }]} />
              </View>

              <View style={styles.waveform}>
                {bars.map((height, index) => <View key={index} style={[styles.waveBar, { height: 5 + height * 28 * (isPlaying ? 0.55 + meteringLevel : 0.45), backgroundColor: index / bars.length * 100 <= percent ? activeThemeColor : theme.line }]} />)}
              </View>

              <View style={styles.songCopy}>
                <Text numberOfLines={2} style={[styles.fullTitle, { color: theme.text }]}>{activeSong.title}</Text>
                <Text numberOfLines={1} style={[styles.fullArtist, { color: theme.muted }]}>{activeSong.artist} · {activeSong.album}</Text>
              </View>

              <View style={styles.progressBlock}>
                <Pressable
                  onPress={seekFromPress}
                  onLayout={(event: LayoutChangeEvent) => setProgressWidth(event.nativeEvent.layout.width)}
                  style={[styles.progressTrack, { backgroundColor: theme.line }]}
                  accessibilityRole="adjustable"
                  accessibilityLabel="Playback position"
                  accessibilityValue={{ min: 0, max: Math.round(playbackDuration / 1000), now: Math.round(playbackPosition / 1000), text: `${formatTime(playbackPosition)} of ${formatTime(playbackDuration)}` }}
                  accessibilityActions={[{ name: 'increment', label: 'Forward five seconds' }, { name: 'decrement', label: 'Back five seconds' }]}
                  onAccessibilityAction={(event) => {
                    const offset = event.nativeEvent.actionName === 'increment' ? 5000 : -5000;
                    void seekTo(Math.max(0, Math.min(playbackDuration, playbackPosition + offset)));
                  }}
                >
                  <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: activeThemeColor }]}><View style={[styles.progressThumb, { backgroundColor: activeThemeColor }]} /></View>
                </Pressable>
                <View style={styles.timeRow}><Text style={[styles.time, { color: theme.muted }]}>{formatTime(playbackPosition)}</Text><Text style={[styles.time, { color: theme.muted }]}>{formatTime(playbackDuration)}</Text></View>
              </View>

              <View style={styles.controls}>
                <Pressable onPress={() => { feedback(); toggleShuffle(); }} style={[styles.utility, shuffleEnabled && { backgroundColor: `${activeThemeColor}20` }]} accessibilityRole="button" accessibilityLabel="Shuffle" accessibilityState={{ selected: shuffleEnabled }}><Shuffle size={19} color={shuffleEnabled ? activeThemeColor : theme.muted} /></Pressable>
                <Pressable onPress={() => skipTrack(-1)} style={styles.control} accessibilityRole="button" accessibilityLabel="Previous track"><SkipBack size={28} color={theme.text} fill={theme.text} /></Pressable>
                <Pressable onPress={playPause} style={[styles.mainPlay, { backgroundColor: activeThemeColor }]} accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pause preview' : 'Play preview'}>{isPlaying ? <Pause size={28} color={palette.ink} fill={palette.ink} /> : <Play size={28} color={palette.ink} fill={palette.ink} />}</Pressable>
                <Pressable onPress={() => skipTrack(1)} style={styles.control} accessibilityRole="button" accessibilityLabel="Next track"><SkipForward size={28} color={theme.text} fill={theme.text} /></Pressable>
                <Pressable onPress={() => { feedback(); cycleRepeatMode(); }} style={[styles.utility, repeatMode !== 'off' && { backgroundColor: `${activeThemeColor}20` }]} accessibilityRole="button" accessibilityLabel={`Repeat ${repeatMode}`} accessibilityState={{ selected: repeatMode !== 'off' }}>
                  <Repeat2 size={20} color={repeatMode !== 'off' ? activeThemeColor : theme.muted} />
                  {repeatMode === 'one' && <Text style={[styles.repeatOne, { color: activeThemeColor }]}>1</Text>}
                </Pressable>
              </View>
              {playbackError && <Text style={styles.playbackError} accessibilityRole="alert">{playbackError}</Text>}
              <View style={styles.playerActions}>
                <Pressable onPress={() => setShowQueue(true)} style={[styles.queue, { borderColor: theme.line }]} accessibilityRole="button" accessibilityLabel={`Open queue with ${playbackQueue.length} tracks`}><ListMusic size={15} color={theme.muted} /><Text style={[styles.queueText, { color: theme.muted }]}>{Math.max(0, playbackQueue.length - 1)} UP NEXT</Text></Pressable>
                <Pressable
                  onPress={() => {
                    feedback(Haptics.ImpactFeedbackStyle.Medium);
                    setIsPlayerExpanded(false);
                    openSelectedSongVideo(activeSong);
                  }}
                  style={[styles.watchVideo, { borderColor: theme.line }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Find a music video for ${activeSong.title}`}
                >
                  <Clapperboard size={15} color={activeThemeColor} />
                  <Text style={[styles.watchVideoText, { color: theme.text }]}>WATCH VIDEO</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </BlurView>
        <Modal transparent visible={showQueue} animationType="fade" onRequestClose={() => setShowQueue(false)}>
          <Pressable style={styles.queueOverlay} onPress={() => setShowQueue(false)} accessible={false}>
            <Pressable style={[styles.queueSheet, { backgroundColor: theme.surface, borderColor: theme.line }]} onPress={(event) => event.stopPropagation()} accessible={false} accessibilityViewIsModal>
              <View style={styles.queueHeader}>
                <View><Text style={[styles.headerLabel, { color: activeThemeColor }]}>PLAYBACK QUEUE</Text><Text style={[styles.queueTitle, { color: theme.text }]}>{playbackQueue.length} tracks</Text></View>
                <Pressable onPress={() => setShowQueue(false)} style={[styles.headerButton, { borderColor: theme.line }]} accessibilityRole="button" accessibilityLabel="Close queue"><X size={18} color={theme.text} /></Pressable>
              </View>
              <ScrollView style={styles.queueList} contentContainerStyle={styles.queueListContent}>
                {playbackQueue.map((song, index) => {
                  const current = song.id === activeSong.id;
                  return (
                    <Pressable
                      key={`${song.id}-${index}`}
                      onPress={() => { setActiveSong(song); setShowQueue(false); }}
                      style={[styles.queueRow, { borderColor: current ? activeThemeColor : theme.line, backgroundColor: current ? `${activeThemeColor}16` : 'transparent' }]}
                      accessibilityRole="button"
                      accessibilityLabel={`Play ${song.title} by ${song.artist}`}
                      accessibilityState={{ selected: current }}
                    >
                      <Image source={{ uri: song.artwork }} style={styles.queueArtwork} contentFit="cover" />
                      <View style={styles.queueCopy}><Text numberOfLines={1} style={[styles.queueSong, { color: theme.text }]}>{song.title}</Text><Text numberOfLines={1} style={[styles.queueArtist, { color: theme.muted }]}>{song.artist}</Text></View>
                      <Text style={[styles.queueIndex, { color: current ? activeThemeColor : theme.muted }]}>{current ? 'PLAYING' : String(index + 1).padStart(2, '0')}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  shell: { position: 'absolute', left: 12, right: 12, maxWidth: 540, alignSelf: 'center', overflow: 'hidden', borderWidth: 1, zIndex: 200, ...createShadow('#000000', 10, 24, 0.42, 20) },
  clip: { overflow: 'hidden' },
  mini: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 8 },
  miniMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  miniArt: { width: 54, height: 54, borderRadius: 17 },
  miniCopy: { flex: 1, marginLeft: 11, marginRight: 7 },
  miniSignal: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  signalDot: { width: 5, height: 5, borderRadius: 3 },
  miniLabel: { fontSize: 7.5, fontWeight: '900', letterSpacing: 0.9 },
  miniTitle: { fontSize: 12.5, fontWeight: '800', marginTop: 2 },
  miniArtist: { fontSize: 9.5, fontWeight: '600', marginTop: 1 },
  miniPlay: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  miniProgress: { position: 'absolute', left: 18, bottom: 0, height: 2 },
  full: { flex: 1, paddingHorizontal: 20, paddingBottom: 18, alignItems: 'center' },
  fullCompact: { paddingBottom: 8 },
  dragHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(150,145,158,0.48)', marginTop: 8, marginBottom: 8 },
  fullHeader: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1.3 },
  headerSub: { fontSize: 7.5, fontWeight: '800', letterSpacing: 0.8, marginTop: 2 },
  artStage: { width: 250, height: 250, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  artStageCompact: { transform: [{ scale: 0.78 }], marginTop: -8, marginBottom: -48 },
  backPlate: { position: 'absolute', width: 188, height: 188, borderRadius: 42, transform: [{ rotate: '12deg' }, { translateX: 13 }] },
  album: { width: 196, height: 196, borderRadius: 98, overflow: 'hidden', borderWidth: 7, backgroundColor: palette.ink, ...createShadow('#000000', 14, 26, 0.5, 18) },
  discRing: { position: 'absolute', left: 20, top: 20, right: 20, bottom: 20, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.30)' },
  discLabel: { position: 'absolute', left: 72, top: 72, width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(8,7,11,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.34)' },
  discPin: { position: 'absolute', left: 91, top: 91, width: 14, height: 14, borderRadius: 7, backgroundColor: palette.text },
  orbit: { position: 'absolute', width: 245, height: 104, borderRadius: 122, borderWidth: 1.5, transform: [{ rotate: '-18deg' }] },
  orbitPearl: { position: 'absolute', width: 14, height: 14, borderRadius: 7, left: 7, top: 113, ...createShadow('#D8FF43', 0, 8, 0.8, 5) },
  waveform: { height: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: -5 },
  waveBar: { width: 3, minHeight: 4, borderRadius: 2 },
  songCopy: { width: '100%', alignItems: 'center', marginTop: 6 },
  fullTitle: { fontSize: 24, lineHeight: 28, fontWeight: '900', letterSpacing: -0.9, textAlign: 'center' },
  fullArtist: { fontSize: 11, fontWeight: '600', marginTop: 5, textAlign: 'center' },
  progressBlock: { width: '100%', marginTop: 20 },
  progressTrack: { height: 5, borderRadius: 3 },
  progressFill: { height: 5, borderRadius: 3, alignItems: 'flex-end', justifyContent: 'center' },
  progressThumb: { width: 12, height: 12, borderRadius: 6 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  time: { fontSize: 8.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
  controls: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 13 },
  utility: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  repeatOne: { position: 'absolute', fontSize: 7, fontWeight: '900' },
  control: { padding: 8 },
  mainPlay: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', ...createShadow('#D8FF43', 7, 16, 0.24, 10) },
  playerActions: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  queue: { borderWidth: 1, borderRadius: radii.pill, height: 34, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  queueText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.9 },
  watchVideo: { borderWidth: 1, borderRadius: radii.pill, height: 34, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  watchVideoText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  playbackError: { color: palette.coral, fontSize: 9.5, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  queueOverlay: { flex: 1, backgroundColor: 'rgba(8,7,11,0.72)', justifyContent: 'flex-end', padding: 12 },
  queueSheet: { maxHeight: '72%', width: '100%', maxWidth: 540, alignSelf: 'center', borderRadius: 30, borderWidth: 1, padding: 18 },
  queueHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  queueTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.8, marginTop: 3 },
  queueList: { flexGrow: 0 },
  queueListContent: { gap: 8, paddingBottom: 4 },
  queueRow: { minHeight: 66, borderWidth: 1, borderRadius: 18, padding: 8, flexDirection: 'row', alignItems: 'center' },
  queueArtwork: { width: 48, height: 48, borderRadius: 13 },
  queueCopy: { flex: 1, marginHorizontal: 10 },
  queueSong: { fontSize: 12, fontWeight: '800' },
  queueArtist: { fontSize: 9.5, fontWeight: '600', marginTop: 2 },
  queueIndex: { fontSize: 7.5, fontWeight: '900', letterSpacing: 0.6 },
});
