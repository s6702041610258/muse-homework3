import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEvent } from 'expo';
import { ArrowLeft, Clapperboard, Disc3, ExternalLink, Heart, Play, RotateCcw, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { MusicVideo, Song } from '../types/song';
import { searchMusicVideo } from '../services/itunesApi';
import { useMusicStore } from '../store/useMusicStore';
import { getTheme, palette, radii } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface SongDetailModalProps {
  song: Song | null;
  initialView?: 'details' | 'video';
  onClose: () => void;
  onPlaySong: (song: Song) => void;
}

function VideoPreview({ video, onBack, textColor, mutedColor, lineColor, accentColor }: { video: MusicVideo; onBack: () => void; textColor: string; mutedColor: string; lineColor: string; accentColor: string }) {
  const reducedMotion = useReducedMotion();
  const setIsVideoPlaying = useMusicStore((state) => state.setIsVideoPlaying);
  const videoAutoplayEnabled = useMusicStore((state) => state.videoAutoplayEnabled);
  const player = useVideoPlayer({ uri: video.previewUrl }, (instance) => {
    instance.loop = false;
    if (videoAutoplayEnabled) instance.play();
  });
  const statusEvent = useEvent(player, 'statusChange', { status: player.status });
  const playingEvent = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const status = statusEvent?.status ?? player.status;
  const isPlaying = playingEvent?.isPlaying ?? player.playing;
  const playbackError = statusEvent?.error;

  useEffect(() => {
    setIsVideoPlaying(true);
    return () => {
      player.pause();
      setIsVideoPlaying(false);
    };
  }, [player, setIsVideoPlaying]);

  return (
    <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(220)} style={styles.videoContent}>
      <View style={styles.videoHeader}>
        <Pressable onPress={onBack} style={[styles.roundButton, { borderColor: lineColor }]} accessibilityRole="button" accessibilityLabel="Back to track details"><ArrowLeft size={18} color={textColor} /></Pressable>
        <View style={styles.videoHeading}><Text style={[styles.videoKicker, { color: accentColor }]}>VIDEO PREVIEW</Text><Text style={[styles.videoSource, { color: mutedColor }]}>STREAMED ON DEMAND</Text></View>
        <Pressable onPress={() => void Linking.openURL(video.storeUrl)} disabled={!video.storeUrl} style={[styles.roundButton, { borderColor: lineColor }]} accessibilityRole="link" accessibilityLabel="Open video in Apple Music"><ExternalLink size={17} color={textColor} /></Pressable>
      </View>

      <View style={[styles.videoFrame, { borderColor: lineColor }]}>
        <VideoView
          player={player}
          style={styles.video}
          accessible
          accessibilityLabel={`Video preview for ${video.title} by ${video.artist}`}
          nativeControls
          contentFit="contain"
          surfaceType="textureView"
          allowsVideoFrameAnalysis={false}
          fullscreenOptions={{ enable: true }}
        />
        {status === 'loading' && <View style={styles.videoLoading}><ActivityIndicator color={accentColor} /></View>}
        {status === 'readyToPlay' && !isPlaying && player.currentTime <= 0 && !playbackError && (
          <Pressable
            onPress={() => player.play()}
            style={styles.videoPlayOverlay}
            accessibilityRole="button"
            accessibilityLabel={`Play video preview for ${video.title}`}
          >
            <View style={[styles.videoPlayButton, { backgroundColor: accentColor }]}><Play size={24} color={palette.ink} fill={palette.ink} /></View>
          </Pressable>
        )}
      </View>

      <Text numberOfLines={2} style={[styles.videoTitle, { color: textColor }]}>{video.title}</Text>
      <Text numberOfLines={1} style={[styles.videoArtist, { color: mutedColor }]}>{video.artist}</Text>
      {playbackError && <Text style={styles.videoError} accessibilityRole="alert">This preview could not be played on this device.</Text>}
      <View style={[styles.courtesy, { borderColor: lineColor }]}>
        <Text style={[styles.courtesyText, { color: mutedColor }]}>Preview provided courtesy of iTunes · streamed, never downloaded</Text>
        <Pressable disabled={!video.storeUrl} onPress={() => void Linking.openURL(video.storeUrl)} accessibilityRole="link" accessibilityLabel="View this video in Apple Music"><Text style={[styles.storeLink, { color: accentColor }]}>View in Apple Music</Text></Pressable>
      </View>
    </Animated.View>
  );
}

function SongDetailContent({ song, initialView = 'details', onClose, onPlaySong }: SongDetailModalProps & { song: Song }) {
  const reducedMotion = useReducedMotion();
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const favorites = useMusicStore((state) => state.favorites);
  const toggleFavorite = useMusicStore((state) => state.toggleFavorite);
  const hapticsEnabled = useMusicStore((state) => state.hapticsEnabled);
  const activeThemeColor = useMusicStore((state) => state.activeThemeColor);
  const setIsVideoPlaying = useMusicStore((state) => state.setIsVideoPlaying);
  const [video, setVideo] = useState<MusicVideo | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(initialView === 'video');
  const videoRequestId = useRef(0);
  const videoAbortRef = useRef<AbortController | null>(null);
  const initialVideoRequested = useRef(false);
  const theme = getTheme(isDarkMode);

  useEffect(() => () => {
    videoAbortRef.current?.abort();
    setIsVideoPlaying(false);
  }, [setIsVideoPlaying]);

  const favorite = favorites.some((item) => item.id === song.id);

  const feedback = (style: Haptics.ImpactFeedbackStyle) => {
    if (hapticsEnabled) void Haptics.impactAsync(style);
  };

  const play = () => {
    feedback(Haptics.ImpactFeedbackStyle.Medium);
    onPlaySong(song);
    onClose();
  };

  const openVideo = useCallback(async (withFeedback = true) => {
    if (withFeedback && hapticsEnabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowVideo(true);
    if (video) return;
    const requestId = ++videoRequestId.current;
    videoAbortRef.current?.abort();
    const controller = new AbortController();
    videoAbortRef.current = controller;
    setVideoLoading(true);
    setVideoError(null);
    setIsVideoPlaying(true);
    try {
      const result = await searchMusicVideo(song, controller.signal);
      if (requestId !== videoRequestId.current) return;
      if (result) setVideo(result);
      else {
        setVideoError('No matching official video preview was found for this track.');
        setIsVideoPlaying(false);
      }
    } catch (error) {
      if (requestId !== videoRequestId.current) return;
      setVideoError(error instanceof Error ? error.message : 'Video search is unavailable right now.');
      setIsVideoPlaying(false);
    } finally {
      if (requestId === videoRequestId.current) setVideoLoading(false);
    }
  }, [hapticsEnabled, setIsVideoPlaying, song, video]);

  useEffect(() => {
    if (initialView !== 'video' || initialVideoRequested.current) return;
    initialVideoRequested.current = true;
    void openVideo(false);
  }, [initialView, openVideo]);

  const closeVideo = () => {
    videoAbortRef.current?.abort();
    videoRequestId.current += 1;
    setIsVideoPlaying(false);
    setShowVideo(false);
    setVideoError(null);
  };

  return (
    <Modal transparent animationType="none" visible onRequestClose={showVideo ? closeVideo : onClose} statusBarTranslucent>
      <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(180)} exiting={reducedMotion ? undefined : FadeOut.duration(150)} style={styles.fill}>
        <BlurView intensity={isDarkMode ? 82 : 64} tint={isDarkMode ? 'dark' : 'light'} style={styles.fill}>
          <View style={styles.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={showVideo ? closeVideo : onClose} accessible={false} />
            <Animated.View entering={reducedMotion ? undefined : ZoomIn.springify().damping(17)} exiting={reducedMotion ? undefined : ZoomOut.duration(130)} style={[styles.card, showVideo && styles.videoCard, { backgroundColor: theme.surface, borderColor: theme.line }]} onStartShouldSetResponder={() => true} accessibilityViewIsModal>
              <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={styles.cardScroll}>
                {showVideo ? (
                video ? (
                  <VideoPreview video={video} onBack={closeVideo} textColor={theme.text} mutedColor={theme.muted} lineColor={theme.line} accentColor={activeThemeColor} />
                ) : (
                  <View style={styles.videoState}>
                    <View style={styles.videoHeader}>
                      <Pressable onPress={closeVideo} style={[styles.roundButton, { borderColor: theme.line }]} accessibilityRole="button" accessibilityLabel="Back to track details"><ArrowLeft size={18} color={theme.text} /></Pressable>
                      <Text style={[styles.contextText, { color: activeThemeColor }]}>FIND MUSIC VIDEO</Text>
                      <View style={styles.roundButtonSpacer} />
                    </View>
                    <View style={styles.stateBody}>
                      {videoLoading ? <ActivityIndicator size="large" color={activeThemeColor} /> : <Clapperboard size={38} color={theme.muted} />}
                      <Text style={[styles.stateTitle, { color: theme.text }]}>{videoLoading ? 'Finding the best match…' : 'Video unavailable'}</Text>
                      <Text style={[styles.stateCopy, { color: theme.muted }]}>{videoLoading ? `Searching official previews for ${song.title}` : videoError}</Text>
                      {!videoLoading && <Pressable onPress={() => void openVideo()} style={[styles.retry, { borderColor: theme.line }]} accessibilityRole="button" accessibilityLabel="Retry video search"><RotateCcw size={15} color={theme.text} /><Text style={[styles.retryText, { color: theme.text }]}>Try again</Text></Pressable>}
                    </View>
                  </View>
                )
              ) : (
                <>
                  <View style={styles.cardTop}>
                    <View style={styles.context}><Disc3 size={13} color={activeThemeColor} /><Text style={[styles.contextText, { color: activeThemeColor }]}>TRACK OPTIONS</Text></View>
                    <Pressable onPress={onClose} style={[styles.close, { borderColor: theme.line }]} accessibilityRole="button" accessibilityLabel="Close track details"><X size={17} color={theme.text} /></Pressable>
                  </View>

                  <View style={styles.artStage}>
                    <View style={[styles.artBack, { backgroundColor: `${activeThemeColor}45` }]} />
                    <Image source={{ uri: song.artwork }} style={styles.artwork} contentFit="cover" transition={300} />
                  </View>

                  <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>{song.title}</Text>
                  <Text numberOfLines={1} style={[styles.artist, { color: theme.muted }]}>{song.artist}</Text>
                  <View style={styles.chips}>
                    {[song.genre, song.releaseDate, song.price].map((label) => <View key={label} style={[styles.chip, { borderColor: theme.line }]}><Text numberOfLines={1} style={[styles.chipText, { color: theme.muted }]}>{label.toUpperCase()}</Text></View>)}
                  </View>
                  <Text numberOfLines={2} style={[styles.album, { color: theme.muted }]}>{song.album}</Text>

                  <View style={styles.actions}>
                    <Pressable onPress={play} style={[styles.primaryAction, { backgroundColor: activeThemeColor }]} accessibilityRole="button" accessibilityLabel={`Listen to ${song.title}`}><Play size={18} color={palette.ink} fill={palette.ink} /><Text style={styles.primaryText}>Listen</Text></Pressable>
                    <Pressable onPress={() => void openVideo()} style={[styles.secondaryAction, { borderColor: theme.line }]} accessibilityRole="button" accessibilityLabel={`Find a music video for ${song.title}`}><Clapperboard size={18} color={theme.text} /><Text style={[styles.secondaryText, { color: theme.text }]}>Video</Text></Pressable>
                  </View>
                  <View style={styles.secondaryRow}>
                    <Pressable onPress={() => { feedback(Haptics.ImpactFeedbackStyle.Medium); void toggleFavorite(song); }} style={[styles.secondarySmall, { borderColor: favorite ? palette.pink : theme.line, backgroundColor: favorite ? `${palette.pink}18` : 'transparent' }]} accessibilityRole="button" accessibilityLabel={favorite ? 'Remove from favorites' : 'Save to favorites'} accessibilityState={{ selected: favorite }}><Heart size={17} color={favorite ? palette.pink : theme.text} fill={favorite ? palette.pink : 'transparent'} /><Text style={[styles.secondarySmallText, { color: favorite ? palette.pink : theme.muted }]}>{favorite ? 'Saved' : 'Save'}</Text></Pressable>
                    <Pressable disabled={!song.storeUrl} onPress={() => void Linking.openURL(song.storeUrl)} style={[styles.secondarySmall, { borderColor: theme.line, opacity: song.storeUrl ? 1 : 0.4 }]} accessibilityRole="link" accessibilityLabel="Open track in Apple Music"><ExternalLink size={16} color={theme.muted} /><Text style={[styles.secondarySmallText, { color: theme.muted }]}>Apple Music</Text></Pressable>
                  </View>
                  <Text style={[styles.legal, { color: theme.muted }]}>Audio and video previews provided courtesy of iTunes.</Text>
                </>
                )}
              </ScrollView>
            </Animated.View>
          </View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

export function SongDetailModal(props: SongDetailModalProps) {
  if (!props.song) return null;
  return <SongDetailContent key={props.song.id} {...props} song={props.song} />;
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: 'rgba(8,7,11,0.30)' },
  card: { width: '100%', maxWidth: 380, maxHeight: '92%', borderRadius: radii.xl, borderWidth: 1 },
  cardScroll: { padding: 17 },
  videoCard: { maxWidth: 520 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  context: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contextText: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1.2 },
  close: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  artStage: { height: 192, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  artBack: { position: 'absolute', width: 158, height: 158, borderRadius: 30, transform: [{ rotate: '9deg' }, { translateX: 10 }] },
  artwork: { width: 162, height: 162, borderRadius: 28, transform: [{ rotate: '-3deg' }] },
  title: { fontSize: 23, lineHeight: 27, fontWeight: '900', letterSpacing: -0.9, textAlign: 'center', paddingHorizontal: 8 },
  artist: { fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  chips: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 13 },
  chip: { maxWidth: 104, borderRadius: radii.pill, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 6 },
  chipText: { fontSize: 7.5, fontWeight: '800', letterSpacing: 0.6 },
  album: { fontSize: 9.5, lineHeight: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 18 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 17 },
  primaryAction: { flex: 1, height: 50, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { color: palette.ink, fontSize: 12, fontWeight: '900' },
  secondaryAction: { flex: 1, height: 50, borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryText: { fontSize: 12, fontWeight: '800' },
  secondaryRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  secondarySmall: { flex: 1, height: 38, borderRadius: 13, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  secondarySmallText: { fontSize: 9.5, fontWeight: '700' },
  legal: { fontSize: 7.5, lineHeight: 11, textAlign: 'center', marginTop: 9 },
  videoContent: { width: '100%' },
  videoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  roundButton: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  roundButtonSpacer: { width: 38, height: 38 },
  videoHeading: { alignItems: 'center' },
  videoKicker: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1.2 },
  videoSource: { fontSize: 7.5, fontWeight: '700', letterSpacing: 0.8, marginTop: 2 },
  videoFrame: { width: '100%', aspectRatio: 16 / 9, borderRadius: 23, overflow: 'hidden', borderWidth: 1, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  videoLoading: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  videoPlayOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,7,11,0.20)' },
  videoPlayButton: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  videoTitle: { fontSize: 22, lineHeight: 26, fontWeight: '900', letterSpacing: -0.8, marginTop: 16 },
  videoArtist: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  videoError: { color: palette.coral, fontSize: 10, marginTop: 8 },
  courtesy: { borderTopWidth: 1, marginTop: 16, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  courtesyText: { flex: 1, fontSize: 7.5, lineHeight: 11 },
  storeLink: { fontSize: 8.5, fontWeight: '800' },
  videoState: { minHeight: 390 },
  stateBody: { flex: 1, minHeight: 320, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26 },
  stateTitle: { fontSize: 20, fontWeight: '900', marginTop: 15, textAlign: 'center' },
  stateCopy: { fontSize: 10.5, lineHeight: 16, marginTop: 6, textAlign: 'center' },
  retry: { height: 40, borderRadius: radii.pill, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15, marginTop: 18 },
  retryText: { fontSize: 10, fontWeight: '800' },
});
