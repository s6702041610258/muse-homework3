import { useCallback, useEffect, useRef } from 'react';
import { setAudioModeAsync, useAudioPlayer as useExpoAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useMusicStore } from '../store/useMusicStore';
import { getAdjacentSong } from '../utils/playbackQueue';

export function useAudioPlayer() {
  const activeSong = useMusicStore((state) => state.activeSong);
  const soundEnabled = useMusicStore((state) => state.soundEnabled);
  const autoPlayEnabled = useMusicStore((state) => state.autoPlayEnabled);
  const backgroundPlaybackEnabled = useMusicStore((state) => state.backgroundPlaybackEnabled);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const isVideoPlaying = useMusicStore((state) => state.isVideoPlaying);
  const hapticsEnabled = useMusicStore((state) => state.hapticsEnabled);
  const playbackQueue = useMusicStore((state) => state.playbackQueue);
  const shuffleEnabled = useMusicStore((state) => state.shuffleEnabled);
  const repeatMode = useMusicStore((state) => state.repeatMode);
  const setActiveSong = useMusicStore((state) => state.setActiveSong);
  const setPlaybackError = useMusicStore((state) => state.setPlaybackError);
  const playbackRequestId = useMusicStore((state) => state.playbackRequestId);
  const setIsPlaying = useMusicStore((state) => state.setIsPlaying);
  const setPlaybackPosition = useMusicStore((state) => state.setPlaybackPosition);
  const setPlaybackDuration = useMusicStore((state) => state.setPlaybackDuration);
  const setMeteringLevel = useMusicStore((state) => state.setMeteringLevel);
  const player = useExpoAudioPlayer(null, { updateInterval: 120 });
  const status = useAudioPlayerStatus(player);
  const handledFinishRef = useRef<string | null>(null);

  const changeTrack = useCallback((direction: 1 | -1) => {
    if (!activeSong) return;
    const next = getAdjacentSong(playbackQueue, activeSong.id, direction, shuffleEnabled);
    if (next) setActiveSong(next);
  }, [activeSong, playbackQueue, setActiveSong, shuffleEnabled]);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
      allowsRecording: false,
      shouldPlayInBackground: backgroundPlaybackEnabled,
      shouldRouteThroughEarpiece: false,
    }).catch(() => setPlaybackError('Audio could not be configured on this device.'));
  }, [backgroundPlaybackEnabled, setPlaybackError]);

  useEffect(() => {
    if (!activeSong?.previewUrl) {
      player.pause();
      player.replace(null);
      setIsPlaying(false);
      setPlaybackPosition(0);
      return;
    }

    player.replace({ uri: activeSong.previewUrl, name: activeSong.title });
    setPlaybackError(null);
    handledFinishRef.current = null;
    player.loop = false;
    player.setActiveForLockScreen(true, {
      title: activeSong.title,
      artist: activeSong.artist,
      albumTitle: activeSong.album,
      artworkUrl: activeSong.artwork,
    });

    if (soundEnabled && autoPlayEnabled) {
      player.play();
      if (hapticsEnabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    return () => player.clearLockScreenControls();
  }, [activeSong, autoPlayEnabled, hapticsEnabled, playbackRequestId, player, setIsPlaying, setPlaybackError, setPlaybackPosition, soundEnabled]);

  useEffect(() => {
    if (!soundEnabled && status.playing) player.pause();
  }, [player, soundEnabled, status.playing]);

  useEffect(() => {
    if (isVideoPlaying && status.playing) player.pause();
  }, [isVideoPlaying, player, status.playing]);

  useEffect(() => {
    setIsPlaying(status.playing);
    setPlaybackPosition(status.currentTime * 1000);
    setPlaybackDuration((status.duration || 30) * 1000);
    const wave = Math.sin(status.currentTime * 8.4) * 0.28 + Math.cos(status.currentTime * 13.2) * 0.24 + 0.48;
    setMeteringLevel(status.playing ? Math.max(0.12, Math.min(1, wave)) : 0.12);
  }, [setIsPlaying, setMeteringLevel, setPlaybackDuration, setPlaybackPosition, status.currentTime, status.duration, status.playing]);

  useEffect(() => {
    if (!status.error) return;
    setPlaybackError('This preview could not be played. Try another track.');
  }, [setPlaybackError, status.error]);

  useEffect(() => {
    if (!status.didJustFinish || !activeSong || handledFinishRef.current === activeSong.id) return;
    handledFinishRef.current = activeSong.id;
    if (repeatMode === 'one') {
      void player.seekTo(0).then(() => player.play());
      return;
    }
    if (shuffleEnabled || repeatMode === 'all' || playbackQueue.findIndex((song) => song.id === activeSong.id) < playbackQueue.length - 1) {
      changeTrack(1);
    }
  }, [activeSong, changeTrack, playbackQueue, player, repeatMode, shuffleEnabled, status.didJustFinish]);

  const playPause = () => {
    if (!activeSong || !soundEnabled) return;
    if (hapticsEnabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) player.pause(); else player.play();
  };

  const seekTo = async (positionMs: number) => {
    if (!activeSong) return;
    if (hapticsEnabled) void Haptics.selectionAsync();
    await player.seekTo(positionMs / 1000);
  };

  return { playPause, seekTo, changeTrack };
}
