import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AudioLines, Check, Clapperboard, Database, Gauge, Heart, Headphones, LifeBuoy, Moon, Radio, RefreshCcw, Send, Smartphone, Sparkles, Sun, Volume2, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMusicStore } from '../store/useMusicStore';
import { getTheme, palette, radii } from '../theme';
import { ReportIssueSheet } from '../components/ReportIssueSheet';

const profiles = [
  { name: 'Obsidian Pulse', note: 'Acid signal on pure black', accent: palette.lime, glow: '#5D701B' },
  { name: 'Ultraviolet', note: 'Deep violet after midnight', accent: palette.violet, glow: '#3A246A' },
  { name: 'Ember Noir', note: 'Warm coral in the dark', accent: palette.coral, glow: '#692C22' },
  { name: 'Rose Static', note: 'Electric pink broadcast', accent: palette.pink, glow: '#68213F' },
  { name: 'Cyan Void', note: 'Cold blue studio light', accent: '#62DDF5', glow: '#174E59' },
];

interface ControlRowProps {
  icon: React.ReactNode;
  title: string;
  detail: string;
  value: boolean;
  onToggle: () => void;
  accent: string;
  line: string;
  text: string;
  muted: string;
  hapticsEnabled: boolean;
}

function ControlRow({ icon, title, detail, value, onToggle, accent, line, text, muted, hapticsEnabled }: ControlRowProps) {
  return (
    <View>
      <View style={styles.controlRow}>
        <View style={[styles.controlIcon, { backgroundColor: `${accent}16` }]}>{icon}</View>
        <View style={styles.controlCopy}>
          <Text style={[styles.controlTitle, { color: text }]}>{title}</Text>
          <Text style={[styles.controlDetail, { color: muted }]}>{detail}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={() => {
            if (hapticsEnabled) void Haptics.selectionAsync();
            onToggle();
          }}
          trackColor={{ false: '#2C2931', true: accent }}
          thumbColor={value && accent === palette.lime ? palette.ink : '#FFFFFF'}
          accessibilityLabel={title}
          accessibilityHint={detail}
        />
      </View>
      <View style={[styles.controlDivider, { backgroundColor: line }]} />
    </View>
  );
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [reportVisible, setReportVisible] = useState(false);
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const setColorScheme = useMusicStore((state) => state.setColorScheme);
  const theme = getTheme(isDarkMode);
  const activeThemeColor = useMusicStore((state) => state.activeThemeColor);
  const setActiveThemeColor = useMusicStore((state) => state.setActiveThemeColor);
  const hapticsEnabled = useMusicStore((state) => state.hapticsEnabled);
  const toggleHaptics = useMusicStore((state) => state.toggleHaptics);
  const soundEnabled = useMusicStore((state) => state.soundEnabled);
  const toggleSound = useMusicStore((state) => state.toggleSound);
  const autoPlayEnabled = useMusicStore((state) => state.autoPlayEnabled);
  const toggleAutoPlay = useMusicStore((state) => state.toggleAutoPlay);
  const backgroundPlaybackEnabled = useMusicStore((state) => state.backgroundPlaybackEnabled);
  const toggleBackgroundPlayback = useMusicStore((state) => state.toggleBackgroundPlayback);
  const videoAutoplayEnabled = useMusicStore((state) => state.videoAutoplayEnabled);
  const toggleVideoAutoplay = useMusicStore((state) => state.toggleVideoAutoplay);
  const resetPreferences = useMusicStore((state) => state.resetPreferences);
  const favorites = useMusicStore((state) => state.favorites);
  const searchResults = useMusicStore((state) => state.searchResults);
  const activeSong = useMusicStore((state) => state.activeSong);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const activeProfile = profiles.find((profile) => profile.accent.toLowerCase() === activeThemeColor.toLowerCase()) ?? profiles[0];

  const selectProfile = (accent: string) => {
    if (hapticsEnabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveThemeColor(accent);
  };

  const selectColorScheme = (dark: boolean) => {
    if (dark === isDarkMode) return;
    if (hapticsEnabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setColorScheme(dark);
  };

  const reset = () => {
    if (hapticsEnabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetPreferences();
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: insets.top + 13, paddingBottom: activeSong ? 194 : 116 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.eyebrow, { color: activeThemeColor }]}>MUSE CONTROL ROOM</Text>
            <Text style={[styles.title, { color: theme.text }]}>Studio<Text style={{ color: activeThemeColor }}>.</Text></Text>
          </View>
          <View style={[styles.readyBadge, { borderColor: `${activeThemeColor}50`, backgroundColor: `${activeThemeColor}12` }]}><View style={[styles.readyDot, { backgroundColor: activeThemeColor }]} /><Text style={[styles.readyText, { color: activeThemeColor }]}>READY</Text></View>
        </View>
        <Text style={[styles.subtitle, { color: theme.muted }]}>Tune the look, playback behavior and performance of your listening space.</Text>

        <View style={[styles.appearanceCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <View style={styles.appearanceTop}>
            <View style={[styles.appearanceIcon, { backgroundColor: `${activeThemeColor}18` }]}>{isDarkMode ? <Moon size={19} color={activeThemeColor} /> : <Sun size={19} color={activeThemeColor} />}</View>
            <View style={styles.appearanceCopy}><Text style={[styles.appearanceKicker, { color: activeThemeColor }]}>APPEARANCE</Text><Text style={[styles.appearanceTitle, { color: theme.text }]}>{isDarkMode ? 'After Dark' : 'Daylight'}</Text><Text style={[styles.appearanceNote, { color: theme.muted }]}>Switch the complete MUSE atmosphere. Your choice stays on this device.</Text></View>
          </View>
          <View style={[styles.modeTrack, { backgroundColor: theme.surfaceSoft, borderColor: theme.line }]}>
            {[
              { dark: false, label: 'Daylight', Icon: Sun },
              { dark: true, label: 'After Dark', Icon: Moon },
            ].map(({ dark, label, Icon }) => {
              const selected = dark === isDarkMode;
              const selectedBackground = dark ? palette.inkRaised : palette.paperRaised;
              const selectedText = dark ? palette.text : palette.textDark;
              return (
                <Pressable
                  key={label}
                  onPress={() => selectColorScheme(dark)}
                  style={[styles.modeOption, selected && { backgroundColor: selectedBackground, borderColor: dark ? palette.line : palette.lineDark }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${label} appearance`}
                  accessibilityState={{ selected }}
                >
                  <Icon size={15} color={selected ? selectedText : theme.muted} />
                  <Text style={[styles.modeLabel, { color: selected ? selectedText : theme.muted }]}>{label}</Text>
                  {selected && <View style={[styles.modeDot, { backgroundColor: activeThemeColor }]} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        <LinearGradient colors={isDarkMode ? [activeProfile.glow, '#121016', '#0B0A0D'] : [`${activeThemeColor}42`, '#FFFEFA', '#EDE8F3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.profileHero, { borderColor: `${activeThemeColor}50` }]}>
          <View style={styles.profileHeroTop}>
            <View><Text style={[styles.heroLabel, { color: isDarkMode ? activeThemeColor : theme.muted }]}>ACTIVE {isDarkMode ? 'NIGHT' : 'DAYLIGHT'} PROFILE</Text><Text style={[styles.profileName, { color: theme.text }]}>{activeProfile.name}</Text><Text style={[styles.profileNote, { color: theme.muted }]}>{activeProfile.note}</Text></View>
            <View style={[styles.orbOuter, { borderColor: `${activeThemeColor}70` }]}><View style={[styles.orbInner, { backgroundColor: activeThemeColor }]} /><View style={[styles.orbCore, { backgroundColor: theme.background }]} /></View>
          </View>
          <View style={styles.waveRow}>{[10, 22, 14, 30, 18, 38, 24, 13, 34, 20, 28, 12, 36, 17, 25, 9].map((height, index) => <View key={index} style={[styles.waveBar, { height, backgroundColor: index < 9 ? activeThemeColor : theme.line }]} />)}</View>
          <View style={[styles.heroStatus, { borderTopColor: theme.line }]}><View style={styles.heroStatusItem}><Radio size={13} color={activeThemeColor} /><Text style={[styles.heroStatusText, { color: theme.muted }]}>GLOBAL ACCENT</Text></View><Text style={[styles.hex, { color: isDarkMode ? activeThemeColor : theme.text }]}>{activeThemeColor.toUpperCase()}</Text></View>
        </LinearGradient>

        <View style={styles.sectionHeading}>
          <View><Text style={[styles.sectionKicker, { color: theme.muted }]}>THEME PROFILE LAB</Text><Text style={[styles.sectionTitle, { color: theme.text }]}>Choose your atmosphere</Text></View>
          <Text style={[styles.sectionMeta, { color: theme.muted }]}>DAY / NIGHT</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileRail}>
          {profiles.map((profile) => {
            const selected = profile.accent.toLowerCase() === activeThemeColor.toLowerCase();
            return (
              <Pressable key={profile.name} onPress={() => selectProfile(profile.accent)} style={[styles.profileCard, { borderColor: selected ? profile.accent : theme.line }]} accessibilityRole="button" accessibilityLabel={`Use ${profile.name} theme`} accessibilityHint={profile.note} accessibilityState={{ selected }}>
                <LinearGradient colors={[profile.glow, '#111015']} style={StyleSheet.absoluteFill} />
                <View style={styles.profileCardTop}><View style={[styles.miniOrb, { backgroundColor: profile.accent }]} />{selected && <View style={[styles.selectedBadge, { backgroundColor: profile.accent }]}><Check size={11} color={palette.ink} /><Text style={styles.selectedText}>ACTIVE</Text></View>}</View>
                <View><Text style={styles.profileCardName}>{profile.name}</Text><Text style={styles.profileCardNote}>{profile.note}</Text></View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeading}>
          <View><Text style={[styles.sectionKicker, { color: theme.muted }]}>PLAYBACK BEHAVIOR</Text><Text style={[styles.sectionTitle, { color: theme.text }]}>How MUSE responds</Text></View>
        </View>
        <View style={[styles.controlCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <ControlRow icon={<Volume2 size={18} color={activeThemeColor} />} title="Preview audio" detail="Enable 30-second catalog playback" value={soundEnabled} onToggle={toggleSound} accent={activeThemeColor} line={theme.line} text={theme.text} muted={theme.muted} hapticsEnabled={hapticsEnabled} />
          <ControlRow icon={<Zap size={18} color={palette.coral} />} title="Instant play" detail="Start audio when a new track is selected" value={autoPlayEnabled} onToggle={toggleAutoPlay} accent={palette.coral} line={theme.line} text={theme.text} muted={theme.muted} hapticsEnabled={hapticsEnabled} />
          <ControlRow icon={<Headphones size={18} color={palette.violet} />} title="Background playback" detail="Keep audio active outside the app" value={backgroundPlaybackEnabled} onToggle={toggleBackgroundPlayback} accent={palette.violet} line={theme.line} text={theme.text} muted={theme.muted} hapticsEnabled={hapticsEnabled} />
          <ControlRow icon={<Clapperboard size={18} color={palette.pink} />} title="Video autoplay" detail="Play official previews after they load" value={videoAutoplayEnabled} onToggle={toggleVideoAutoplay} accent={palette.pink} line={theme.line} text={theme.text} muted={theme.muted} hapticsEnabled={hapticsEnabled} />
          <ControlRow icon={<Smartphone size={18} color="#62DDF5" />} title="Touch feedback" detail="Tactile cues for gestures and controls" value={hapticsEnabled} onToggle={toggleHaptics} accent="#62DDF5" line="transparent" text={theme.text} muted={theme.muted} hapticsEnabled={hapticsEnabled} />
        </View>

        <View style={styles.sectionHeading}>
          <View><Text style={[styles.sectionKicker, { color: theme.muted }]}>LIVE SYSTEM</Text><Text style={[styles.sectionTitle, { color: theme.text }]}>At a glance</Text></View>
        </View>
        <View style={styles.metricGrid}>
          <View style={[styles.metric, width < 350 && styles.metricCompact, { backgroundColor: theme.surface, borderColor: theme.line }]} accessible accessibilityLabel={`${favorites.length} saved tracks`}><Heart size={17} color={palette.pink} /><Text style={[styles.metricValue, { color: theme.text }]}>{favorites.length}</Text><Text style={[styles.metricLabel, { color: theme.muted }]}>SAVED TRACKS</Text></View>
          <View style={[styles.metric, width < 350 && styles.metricCompact, { backgroundColor: theme.surface, borderColor: theme.line }]} accessible accessibilityLabel={`${searchResults.length} catalog results`}><Database size={17} color={activeThemeColor} /><Text style={[styles.metricValue, { color: theme.text }]}>{searchResults.length}</Text><Text style={[styles.metricLabel, { color: theme.muted }]}>CATALOG RESULTS</Text></View>
          <View style={[styles.metric, width < 350 && styles.metricCompact, { backgroundColor: theme.surface, borderColor: theme.line }]} accessible accessibilityLabel={`Audio engine ${isPlaying ? 'playing' : 'standby'}`}><AudioLines size={17} color={palette.coral} /><Text style={[styles.metricValueSmall, { color: theme.text }]}>{isPlaying ? 'PLAYING' : 'STANDBY'}</Text><Text style={[styles.metricLabel, { color: theme.muted }]}>AUDIO ENGINE</Text></View>
          <View style={[styles.metric, width < 350 && styles.metricCompact, { backgroundColor: theme.surface, borderColor: theme.line }]} accessible accessibilityLabel="Player refresh 120 milliseconds"><Gauge size={17} color={palette.violet} /><Text style={[styles.metricValueSmall, { color: theme.text }]}>120 MS</Text><Text style={[styles.metricLabel, { color: theme.muted }]}>PLAYER REFRESH</Text></View>
        </View>

        <View style={[styles.performanceCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <View style={styles.performanceHeader}><View style={[styles.performanceIcon, { backgroundColor: `${activeThemeColor}18` }]}><Sparkles size={18} color={activeThemeColor} /></View><View><Text style={[styles.performanceTitle, { color: theme.text }]}>Adaptive performance</Text><Text style={[styles.performanceSub, { color: theme.muted }]}>Visual depth without wasteful rendering</Text></View></View>
          <View style={styles.performanceList}>
            {['3D cover transforms run on the UI thread', 'Vinyl animation runs only while visible', 'Music videos mount only when requested', 'Video previews stream without app-side caching'].map((item) => <View key={item} style={styles.performanceItem}><Check size={13} color={activeThemeColor} /><Text style={[styles.performanceText, { color: theme.muted }]}>{item}</Text></View>)}
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View><Text style={[styles.sectionKicker, { color: theme.muted }]}>SUPPORT SIGNAL</Text><Text style={[styles.sectionTitle, { color: theme.text }]}>Help us tune MUSE</Text></View>
          <Text style={[styles.sectionMeta, { color: activeThemeColor }]}>PRIVATE DRAFT</Text>
        </View>
        <View style={[styles.supportCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <View style={styles.supportTop}>
            <View style={[styles.supportIcon, { backgroundColor: `${activeThemeColor}18` }]}><LifeBuoy size={20} color={activeThemeColor} /></View>
            <View style={styles.supportCopy}><Text style={[styles.supportTitle, { color: theme.text }]}>Something off signal?</Text><Text style={[styles.supportText, { color: theme.muted }]}>Report playback, search, video or visual issues. Your unfinished draft stays on this device.</Text></View>
          </View>
          <Pressable
            onPress={() => setReportVisible(true)}
            style={({ pressed }) => [styles.reportButton, { backgroundColor: activeThemeColor }, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Report an issue"
            accessibilityHint="Opens the MUSE support form"
          >
            <Send size={15} color={palette.ink} />
            <Text style={styles.reportButtonText}>REPORT AN ISSUE</Text>
          </Pressable>
        </View>

        <Pressable onPress={reset} style={({ pressed }) => [styles.resetButton, { borderColor: theme.line }, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Reset Studio to MUSE defaults"><RefreshCcw size={15} color={theme.muted} /><Text style={[styles.resetText, { color: theme.muted }]}>Reset Studio to MUSE defaults</Text></Pressable>
        <View style={styles.footer}><Text style={[styles.footerWordmark, { color: theme.text }]}>MUSE°</Text><Text style={[styles.version, { color: theme.muted }]}>1.0 · EXPO SDK 57 · AUDIO + VIDEO</Text></View>
      </ScrollView>
      <ReportIssueSheet visible={reportVisible} onClose={() => setReportVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1.35, marginBottom: 4 },
  title: { fontSize: 40, lineHeight: 43, fontWeight: '900', letterSpacing: -1.9 },
  subtitle: { fontSize: 11, lineHeight: 16, fontWeight: '600', marginTop: 7, maxWidth: 320 },
  readyBadge: { height: 32, borderRadius: radii.pill, borderWidth: 1, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  readyDot: { width: 6, height: 6, borderRadius: 3 },
  readyText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  appearanceCard: { borderWidth: 1, borderRadius: radii.lg, padding: 14, marginTop: 20 },
  appearanceTop: { flexDirection: 'row', alignItems: 'center' },
  appearanceIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  appearanceCopy: { flex: 1, marginLeft: 11 },
  appearanceKicker: { fontSize: 7.5, fontWeight: '900', letterSpacing: 1.05 },
  appearanceTitle: { fontSize: 17, lineHeight: 20, fontWeight: '900', letterSpacing: -0.45, marginTop: 2 },
  appearanceNote: { fontSize: 8.5, lineHeight: 12, fontWeight: '600', marginTop: 2 },
  modeTrack: { height: 48, borderRadius: 16, borderWidth: 1, padding: 4, flexDirection: 'row', marginTop: 13, gap: 4 },
  modeOption: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  modeLabel: { fontSize: 9.5, fontWeight: '800' },
  modeDot: { width: 5, height: 5, borderRadius: 3 },
  profileHero: { borderWidth: 1, borderRadius: radii.xl, padding: 18, marginTop: 22, overflow: 'hidden' },
  profileHeroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  profileName: { color: palette.text, fontSize: 23, fontWeight: '900', letterSpacing: -0.7, marginTop: 4 },
  profileNote: { color: 'rgba(247,244,238,0.60)', fontSize: 9.5, fontWeight: '600', marginTop: 3 },
  orbOuter: { width: 66, height: 66, borderRadius: 33, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', transform: [{ rotateX: '57deg' }, { rotateZ: '-18deg' }] },
  orbInner: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  orbCore: { width: 17, height: 17, borderRadius: 9, position: 'absolute' },
  waveRow: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 18 },
  waveBar: { flex: 1, minHeight: 5, borderRadius: 2 },
  heroStatus: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.10)', paddingTop: 11, marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroStatusItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroStatusText: { color: 'rgba(247,244,238,0.54)', fontSize: 7.5, fontWeight: '800', letterSpacing: 0.8 },
  hex: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  sectionHeading: { marginTop: 28, marginBottom: 11, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionKicker: { fontSize: 8, fontWeight: '900', letterSpacing: 1.25, marginBottom: 3 },
  sectionTitle: { fontSize: 21, fontWeight: '900', letterSpacing: -0.65 },
  sectionMeta: { fontSize: 7.5, fontWeight: '800', letterSpacing: 1 },
  profileRail: { gap: 9, paddingRight: 20 },
  profileCard: { width: 190, height: 126, borderRadius: 23, borderWidth: 1, padding: 14, overflow: 'hidden', justifyContent: 'space-between' },
  profileCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  miniOrb: { width: 25, height: 25, borderRadius: 13, borderWidth: 7, borderColor: 'rgba(8,7,11,0.64)' },
  selectedBadge: { height: 23, borderRadius: 12, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectedText: { color: palette.ink, fontSize: 6.5, fontWeight: '900', letterSpacing: 0.6 },
  profileCardName: { color: palette.text, fontSize: 14, fontWeight: '900' },
  profileCardNote: { color: 'rgba(247,244,238,0.56)', fontSize: 8.5, lineHeight: 12, marginTop: 3 },
  controlCard: { borderWidth: 1, borderRadius: radii.lg, paddingHorizontal: 14, overflow: 'hidden' },
  controlRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center' },
  controlIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  controlCopy: { flex: 1, marginLeft: 11, marginRight: 7 },
  controlTitle: { fontSize: 12.5, fontWeight: '800' },
  controlDetail: { fontSize: 9, lineHeight: 13, fontWeight: '600', marginTop: 2 },
  controlDivider: { height: 1, marginLeft: 50 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { width: '48.7%', minHeight: 118, borderRadius: 21, borderWidth: 1, padding: 14, justifyContent: 'space-between' },
  metricCompact: { width: '100%' },
  metricValue: { fontSize: 27, fontWeight: '900', letterSpacing: -1.1, marginTop: 10 },
  metricValueSmall: { fontSize: 15, fontWeight: '900', letterSpacing: -0.35, marginTop: 13 },
  metricLabel: { fontSize: 7.5, fontWeight: '800', letterSpacing: 0.8 },
  performanceCard: { borderWidth: 1, borderRadius: radii.lg, padding: 16, marginTop: 20 },
  performanceHeader: { flexDirection: 'row', alignItems: 'center' },
  performanceIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  performanceTitle: { fontSize: 13, fontWeight: '800' },
  performanceSub: { fontSize: 9, fontWeight: '600', marginTop: 2 },
  performanceList: { marginTop: 14, gap: 10 },
  performanceItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  performanceText: { fontSize: 9.5, fontWeight: '600' },
  supportCard: { borderWidth: 1, borderRadius: radii.lg, padding: 16 },
  supportTop: { flexDirection: 'row', alignItems: 'center' },
  supportIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  supportCopy: { flex: 1, marginLeft: 12 },
  supportTitle: { fontSize: 13.5, fontWeight: '800' },
  supportText: { fontSize: 9, lineHeight: 13, fontWeight: '600', marginTop: 3 },
  reportButton: { height: 45, borderRadius: 15, marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  reportButtonText: { color: palette.ink, fontSize: 9.5, fontWeight: '900', letterSpacing: 0.8 },
  resetButton: { height: 45, borderRadius: radii.pill, borderWidth: 1, marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  resetText: { fontSize: 9.5, fontWeight: '700' },
  pressed: { opacity: 0.68, transform: [{ scale: 0.985 }] },
  footer: { alignItems: 'center', marginTop: 28 },
  footerWordmark: { fontSize: 19, fontWeight: '900', letterSpacing: -0.8 },
  version: { fontSize: 7.5, fontWeight: '800', letterSpacing: 0.9, marginTop: 4 },
});
