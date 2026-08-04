import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Download, Share, X } from 'lucide-react-native';
import { getTheme, palette, radii } from '../theme';
import { createShadow } from '../utils/shadows';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMusicStore } from '../store/useMusicStore';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const insets = useSafeAreaInsets();
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const activeThemeColor = useMusicStore((state) => state.activeThemeColor);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const theme = getTheme(isDarkMode);
  const showIosHelp = Platform.OS === 'web'
    && typeof window !== 'undefined'
    && /iphone|ipad|ipod/i.test(window.navigator.userAgent)
    && !window.matchMedia('(display-mode: standalone)').matches
    && !Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    if (standalone) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (Platform.OS !== 'web' || dismissed || (!installEvent && !showIosHelp)) return null;

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') setDismissed(true);
    setInstallEvent(null);
  };

  return (
    <View
      style={[
        styles.card,
        {
          top: Math.max(14, insets.top + 6),
          borderColor: theme.line,
          backgroundColor: isDarkMode ? 'rgba(17,16,22,0.97)' : 'rgba(255,255,255,0.97)',
        },
      ]}
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.icon, { backgroundColor: activeThemeColor }]}>{showIosHelp && !installEvent ? <Share size={17} color={palette.ink} /> : <Download size={17} color={palette.ink} />}</View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text }]}>Install MUSE</Text>
        <Text style={[styles.detail, { color: theme.muted }]}>{showIosHelp && !installEvent ? 'Tap Share, then Add to Home Screen.' : 'Add MUSE to your home screen.'}</Text>
      </View>
      {installEvent && <Pressable onPress={() => void install()} style={[styles.install, { backgroundColor: activeThemeColor }]} accessibilityRole="button" accessibilityLabel="Install MUSE"><Text style={styles.installText}>INSTALL</Text></Pressable>}
      <Pressable onPress={() => setDismissed(true)} style={styles.close} accessibilityRole="button" accessibilityLabel="Dismiss install instructions"><X size={15} color={theme.muted} /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { position: 'absolute', top: 14, left: 14, right: 14, maxWidth: 500, alignSelf: 'center', zIndex: 500, minHeight: 64, borderRadius: radii.md, borderWidth: 1, borderColor: palette.line, backgroundColor: 'rgba(17,16,22,0.97)', padding: 10, flexDirection: 'row', alignItems: 'center', ...createShadow('#000', 8, 18, 0.35, 16) },
  icon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginHorizontal: 10 },
  title: { color: palette.text, fontSize: 12, fontWeight: '900' },
  detail: { color: palette.muted, fontSize: 9.5, fontWeight: '600', marginTop: 2 },
  install: { height: 34, borderRadius: 17, paddingHorizontal: 11, justifyContent: 'center' },
  installText: { color: palette.ink, fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  close: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', marginLeft: 2 },
});
