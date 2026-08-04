import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Accessibility,
  AudioLines,
  Boxes,
  Braces,
  Check,
  CircleDot,
  Cloud,
  Code2,
  Database,
  FileCode2,
  Gauge,
  GitBranch,
  Globe2,
  Heart,
  Layers3,
  LockKeyhole,
  Music2,
  Network,
  PackageCheck,
  Play,
  Radio,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TestTube2,
  Video,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react-native';
import { useMusicStore } from '../store/useMusicStore';
import { getTheme, palette, radii } from '../theme';

interface SectionTitleProps {
  index: string;
  kicker: string;
  title: string;
  description: string;
  accent: string;
}

function SectionTitle({ index, kicker, title, description, accent }: SectionTitleProps) {
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const theme = getTheme(isDarkMode);

  return (
    <View style={styles.sectionHeading}>
      <View style={[styles.sectionIndex, { borderColor: `${accent}55`, backgroundColor: `${accent}12` }]}>
        <Text style={[styles.sectionIndexText, { color: accent }]}>{index}</Text>
      </View>
      <View style={styles.sectionHeadingCopy}>
        <Text style={[styles.sectionKicker, { color: accent }]}>{kicker}</Text>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.sectionDescription, { color: theme.muted }]}>{description}</Text>
      </View>
    </View>
  );
}

const featureGroups = [
  {
    icon: Search,
    title: 'Catalog discovery',
    accent: palette.lime,
    summary: 'Search Apple catalog previews by artist, track, or mood with clear loading, empty, retry, and refresh states.',
    points: ['Thirty-result search window', 'Five-minute in-memory cache', 'Abortable requests with stale-result protection'],
  },
  {
    icon: AudioLines,
    title: 'Audio player',
    accent: palette.coral,
    summary: 'A shared mini and full player controls remote previews while synchronizing progress and playback state across the app.',
    points: ['Play, pause, seek, next, and previous', 'Shuffle and three repeat modes', 'Lock-screen metadata and background audio'],
  },
  {
    icon: Video,
    title: 'Video matching',
    accent: palette.pink,
    summary: 'Music-video results are normalized and scored against the active track instead of trusting the first search result.',
    points: ['Unicode-aware normalization', 'Weighted title and artist scoring', 'On-demand mounting to reduce resource use'],
  },
  {
    icon: Heart,
    title: 'Local collection',
    accent: '#62DDF5',
    summary: 'Favorites persist on the current device without requiring an account, profile, or remote user database.',
    points: ['AsyncStorage persistence', 'Play-all queue creation', 'Immediate optimistic updates'],
  },
  {
    icon: Settings2,
    title: 'Studio controls',
    accent: palette.violet,
    summary: 'Listeners can change the complete visual atmosphere and choose how audio, video, haptics, and autoplay respond.',
    points: ['Daylight and After Dark modes', 'Five accent profiles', 'Persistent playback preferences'],
  },
  {
    icon: Globe2,
    title: 'Installable web app',
    accent: '#F4B942',
    summary: 'The Expo web export includes a manifest, install guidance, a service worker, and a same-origin catalog gateway.',
    points: ['PWA app-shell caching', 'iPhone Add to Home Screen guidance', 'Cross-origin media excluded from cache'],
  },
];

const toolGroups = [
  {
    label: 'CORE PLATFORM',
    accent: palette.lime,
    icon: Smartphone,
    tools: [
      ['Expo SDK 57', 'Runtime, native configuration, Metro bundling, and web export'],
      ['React Native 0.86', 'Shared component model for iOS, Android, and web'],
      ['React 19', 'Components, hooks, lifecycle, memoization, and rendering'],
      ['TypeScript 6', 'Static contracts for API data, state, props, and utilities'],
    ],
  },
  {
    label: 'STATE + DATA',
    accent: '#62DDF5',
    icon: Database,
    tools: [
      ['Zustand 5', 'Global search, player, queue, favorites, modal, and preference state'],
      ['AsyncStorage 2', 'Device-local favorites, preferences, and issue-report drafts'],
      ['iTunes Search API', 'Public song and music-video catalog metadata with preview URLs'],
      ['Netlify Function', 'Validated same-origin web proxy that avoids browser CORS failures'],
    ],
  },
  {
    label: 'MEDIA + INTERACTION',
    accent: palette.coral,
    icon: Play,
    tools: [
      ['expo-audio', 'Preview playback, status updates, seeking, audio mode, and media metadata'],
      ['expo-video', 'Native and web video-preview lifecycle with platform controls'],
      ['Reanimated 4', 'UI-thread carousel transforms, springs, timing, and player motion'],
      ['Gesture Handler', 'Pan gestures for the expandable full-player sheet'],
      ['expo-image', 'Optimized artwork rendering, fitting, and transitions'],
      ['Expo Haptics', 'Optional tactile feedback for selection and transport controls'],
    ],
  },
  {
    label: 'QUALITY + RELEASE',
    accent: palette.violet,
    icon: PackageCheck,
    tools: [
      ['Vitest', 'Unit and integration-style coverage for services, state, and queue logic'],
      ['Expo ESLint', 'Code-quality and React Hooks enforcement with zero warnings'],
      ['EAS profiles', 'Development, Android preview, and production build definitions'],
      ['Netlify', 'Static web hosting and serverless catalog gateway deployment'],
    ],
  },
];

const searchFlow = [
  ['01', 'Intent', 'A search submission, mood selection, refresh, or initial query starts the pipeline.'],
  ['02', 'Concurrency guard', 'The previous AbortController is cancelled and a monotonically increasing request ID is assigned.'],
  ['03', 'Platform route', 'Native calls Apple directly. Web calls the same-origin /api/itunes-search Netlify Function.'],
  ['04', 'Gateway validation', 'The function validates the entity, limits the term length, clamps result count, and applies a timeout.'],
  ['05', 'Domain mapping', 'Results without previews are removed; valid API records become typed Song objects with larger artwork.'],
  ['06', 'Safe commit', 'The screen updates only when the response still belongs to the latest request ID.'],
];

const sourceMap = [
  ['App.tsx', 'Root composition and local tab selection'],
  ['src/screens/', 'Discover, Collection, Learn, and Studio use cases'],
  ['src/components/', 'Reusable search, cards, carousel, player, modal, PWA, and form UI'],
  ['src/hooks/', 'Audio engine integration and reduced-motion detection'],
  ['src/services/', 'Catalog access, response validation, video matching, and issue submission'],
  ['src/store/', 'Shared application state, actions, and local persistence'],
  ['src/types/', 'External API and internal domain contracts'],
  ['src/utils/', 'Pure queue behavior and platform-aware shadow helpers'],
  ['netlify/functions/', 'Validated same-origin web catalog proxy'],
  ['public/', 'PWA shell, manifest, service worker, icons, and privacy page'],
  ['scripts/', 'Production checks and interactive DOM nesting test'],
];

const safeguards = [
  {
    icon: Accessibility,
    title: 'Accessibility',
    accent: palette.lime,
    text: 'Semantic roles, labels, hints, selected states, adjustable seek actions, safe areas, reduced-motion support, and responsive compact layouts.',
  },
  {
    icon: Gauge,
    title: 'Performance',
    accent: palette.coral,
    text: 'UI-thread transforms, conditional animation, on-demand video, optimized artwork, response caching, and a production bundle-size budget.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy',
    accent: '#62DDF5',
    text: 'No account, advertising tracker, or analytics SDK. Favorites and preferences stay local, and diagnostics require explicit opt-in.',
  },
  {
    icon: LockKeyhole,
    title: 'Gateway safety',
    accent: palette.violet,
    text: 'The web proxy allowlists catalog entities, limits input, clamps result counts, times out upstream work, and returns stable errors.',
  },
];

const commands = [
  ['npm start', 'Start the Expo development server'],
  ['npm run web', 'Run Expo web with the local Netlify catalog function'],
  ['npm run typecheck', 'Validate TypeScript without emitting files'],
  ['npm run lint', 'Run Expo ESLint with zero warnings allowed'],
  ['npm test', 'Execute the Vitest test suite'],
  ['npm run build:web', 'Create the production Expo web export'],
  ['npm run verify:production', 'Run the complete release-readiness pipeline'],
];

export function DocumentationScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const activeThemeColor = useMusicStore((state) => state.activeThemeColor);
  const activeSong = useMusicStore((state) => state.activeSong);
  const theme = getTheme(isDarkMode);
  const compact = width < 380;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: activeSong ? 194 : 116 },
        ]}
      >
        <LinearGradient
          colors={isDarkMode ? [`${activeThemeColor}38`, '#16131D', '#0B0A0E'] : [`${activeThemeColor}4A`, '#FFFFFF', '#ECE8F0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { borderColor: `${activeThemeColor}55` }]}
        >
          <View style={styles.heroTop}>
            <View style={[styles.guideBadge, { backgroundColor: activeThemeColor }]}>
              <FileCode2 size={13} color={palette.ink} />
              <Text style={styles.guideBadgeText}>OPEN PROJECT GUIDE</Text>
            </View>
            <View style={[styles.versionBadge, { borderColor: `${activeThemeColor}55` }]}>
              <View style={[styles.versionDot, { backgroundColor: activeThemeColor }]} />
              <Text style={[styles.versionText, { color: theme.text }]}>V1.0</Text>
            </View>
          </View>
          <View style={styles.heroIconRow}>
            <View style={[styles.heroIcon, { backgroundColor: `${activeThemeColor}1F`, borderColor: `${activeThemeColor}55` }]}>
              <Braces size={24} color={activeThemeColor} />
            </View>
            <View style={styles.heroSignal}>
              {[12, 23, 34, 18, 29, 15, 37, 25].map((height, index) => (
                <View key={index} style={[styles.heroSignalBar, { height, backgroundColor: index < 5 ? activeThemeColor : `${activeThemeColor}55` }]} />
              ))}
            </View>
          </View>
          <Text style={[styles.eyebrow, { color: activeThemeColor }]}>MUSE ENGINEERING HANDBOOK</Text>
          <Text style={[styles.heroTitle, compact && styles.heroTitleCompact, { color: theme.text }]}>Learn how every signal works.</Text>
          <Text style={[styles.heroCopy, { color: theme.muted }]}>A practical tour of the product, architecture, tools, data flow, media engine, quality safeguards, and release path behind this universal music-discovery app.</Text>
          <View style={styles.statGrid}>
            {[
              ['57', 'EXPO SDK'],
              ['3', 'PLATFORMS'],
              ['20', 'TESTS'],
              ['1', 'CODEBASE'],
            ].map(([value, label]) => (
              <View key={label} style={[styles.stat, { backgroundColor: `${theme.background}A8`, borderColor: theme.line }]}>
                <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={[styles.definitionCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <View style={[styles.definitionIcon, { backgroundColor: `${palette.lime}18` }]}><Radio size={20} color={palette.lime} /></View>
          <View style={styles.definitionCopy}>
            <Text style={[styles.definitionLabel, { color: palette.lime }]}>WHAT MUSE IS</Text>
            <Text style={[styles.definitionTitle, { color: theme.text }]}>A discovery and preview experience</Text>
            <Text style={[styles.definitionText, { color: theme.muted }]}>MUSE searches a public music catalog and plays the preview media supplied by Apple. It is not a full-track streaming service, subscription platform, music uploader, or Spotify clone.</Text>
          </View>
        </View>

        <SectionTitle index="01" kicker="PRODUCT TOUR" title="What people can do" description="Each capability is designed as part of one continuous discover, listen, explore, and personalize journey." accent={palette.lime} />
        <View style={styles.featureGrid}>
          {featureGroups.map(({ icon: Icon, title, accent, summary, points }) => (
            <View key={title} style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <View style={styles.featureTop}>
                <View style={[styles.featureIcon, { backgroundColor: `${accent}17` }]}><Icon size={19} color={accent} /></View>
                <View style={[styles.featureStatus, { borderColor: `${accent}45` }]}><CircleDot size={10} color={accent} /><Text style={[styles.featureStatusText, { color: accent }]}>LIVE</Text></View>
              </View>
              <Text style={[styles.featureTitle, { color: theme.text }]}>{title}</Text>
              <Text style={[styles.featureSummary, { color: theme.muted }]}>{summary}</Text>
              <View style={styles.pointList}>
                {points.map((point) => <View key={point} style={styles.point}><Check size={12} color={accent} /><Text style={[styles.pointText, { color: theme.muted }]}>{point}</Text></View>)}
              </View>
            </View>
          ))}
        </View>

        <SectionTitle index="02" kicker="SYSTEM MAP" title="One codebase, three platforms" description="Expo and React Native share the product surface while platform-specific adapters handle media, networking, storage, and installation." accent="#62DDF5" />
        <View style={[styles.architectureCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <View style={styles.architectureTop}>
            <View style={[styles.architectureNode, { backgroundColor: `${palette.lime}18`, borderColor: `${palette.lime}45` }]}><Code2 size={18} color={palette.lime} /><Text style={[styles.architectureNodeText, { color: theme.text }]}>React UI</Text></View>
            <View style={[styles.architectureNode, { backgroundColor: `${palette.violet}18`, borderColor: `${palette.violet}45` }]}><Layers3 size={18} color={palette.violet} /><Text style={[styles.architectureNodeText, { color: theme.text }]}>Zustand</Text></View>
          </View>
          <View style={[styles.architectureLine, { backgroundColor: theme.line }]} />
          <View style={styles.architectureMiddle}>
            <Workflow size={17} color="#62DDF5" />
            <Text style={[styles.architectureMiddleText, { color: theme.muted }]}>SHARED TYPES, SERVICES, HOOKS, AND ACTIONS</Text>
          </View>
          <View style={[styles.architectureLine, { backgroundColor: theme.line }]} />
          <View style={styles.platformRow}>
            {[
              [Smartphone, 'iOS'],
              [Smartphone, 'ANDROID'],
              [Globe2, 'WEB / PWA'],
            ].map(([Icon, label]) => {
              const PlatformIcon = Icon as typeof Smartphone;
              return <View key={label as string} style={[styles.platformNode, { borderColor: theme.line, backgroundColor: theme.surfaceSoft }]}><PlatformIcon size={17} color={activeThemeColor} /><Text style={[styles.platformText, { color: theme.text }]}>{label as string}</Text></View>;
            })}
          </View>
          <View style={[styles.architectureFooter, { borderTopColor: theme.line }]}>
            <Network size={15} color={palette.coral} />
            <Text style={[styles.architectureFooterText, { color: theme.muted }]}>Native reaches Apple directly. Web uses a validated same-origin Netlify gateway.</Text>
          </View>
        </View>

        <SectionTitle index="03" kicker="TOOLCHAIN" title="Why each tool exists" description="The stack is intentionally layered so UI, application state, device behavior, external data, and release checks remain understandable." accent={palette.coral} />
        <View style={styles.toolGroupList}>
          {toolGroups.map(({ label, accent, icon: Icon, tools }) => (
            <View key={label} style={[styles.toolGroup, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <View style={[styles.toolGroupHeader, { borderBottomColor: theme.line }]}>
                <View style={[styles.toolGroupIcon, { backgroundColor: `${accent}18` }]}><Icon size={18} color={accent} /></View>
                <Text style={[styles.toolGroupLabel, { color: accent }]}>{label}</Text>
              </View>
              {tools.map(([name, detail], index) => (
                <View key={name} style={[styles.toolRow, index < tools.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.line }]}>
                  <View style={[styles.toolBullet, { backgroundColor: accent }]} />
                  <View style={styles.toolCopy}>
                    <Text style={[styles.toolName, { color: theme.text }]}>{name}</Text>
                    <Text style={[styles.toolDetail, { color: theme.muted }]}>{detail}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        <SectionTitle index="04" kicker="DATA FLOW" title="A search from tap to screen" description="The catalog pipeline is built to remain predictable when users type quickly, refresh repeatedly, lose connection, or receive malformed upstream data." accent={palette.pink} />
        <View style={[styles.flowCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          {searchFlow.map(([number, title, detail], index) => (
            <View key={number} style={styles.flowStep}>
              <View style={styles.flowRail}>
                <View style={[styles.flowNumber, { backgroundColor: index === 0 ? palette.pink : theme.surfaceSoft, borderColor: index === 0 ? palette.pink : theme.line }]}><Text style={[styles.flowNumberText, { color: index === 0 ? palette.ink : theme.text }]}>{number}</Text></View>
                {index < searchFlow.length - 1 && <View style={[styles.flowConnector, { backgroundColor: theme.line }]} />}
              </View>
              <View style={styles.flowCopy}>
                <Text style={[styles.flowTitle, { color: theme.text }]}>{title}</Text>
                <Text style={[styles.flowDetail, { color: theme.muted }]}>{detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.mediaCard, { borderColor: `${palette.violet}50` }]}>
          <LinearGradient colors={isDarkMode ? ['#2A1A46', '#141119', '#0C0B0F'] : ['#DDD0FF', '#FFFFFF', '#EEE9F5']} style={StyleSheet.absoluteFill} />
          <View style={styles.mediaTop}>
            <View style={[styles.mediaIcon, { backgroundColor: `${palette.violet}22` }]}><Music2 size={22} color={palette.violet} /></View>
            <Text style={[styles.mediaKicker, { color: palette.violet }]}>MEDIA LIFECYCLE</Text>
          </View>
          <Text style={[styles.mediaTitle, { color: theme.text }]}>Audio and video never compete.</Text>
          <Text style={[styles.mediaCopy, { color: theme.muted }]}>Selecting a song replaces the remote preview source, attaches lock-screen metadata, and optionally starts playback. Opening video pauses audio first, then mounts the video player only when requested. Player status returns to the shared store roughly every 120 ms.</Text>
          <View style={styles.mediaSequence}>
            {['SELECT', 'LOAD', 'PLAY', 'SYNC'].map((label, index) => <React.Fragment key={label}><View style={[styles.mediaStep, { borderColor: index === 2 ? palette.violet : theme.line }]}><Text style={[styles.mediaStepText, { color: index === 2 ? palette.violet : theme.muted }]}>{label}</Text></View>{index < 3 && <Zap size={11} color={theme.muted} />}</React.Fragment>)}
          </View>
        </View>

        <SectionTitle index="05" kicker="SOURCE GUIDE" title="Where to start reading" description="The repository follows a role-based structure. Begin at the root composition, then follow a screen into its store actions, hooks, services, and pure utilities." accent={palette.violet} />
        <View style={[styles.sourceCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          {sourceMap.map(([path, purpose], index) => (
            <View key={path} style={[styles.sourceRow, index < sourceMap.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.line }]}>
              <View style={[styles.sourceIcon, { backgroundColor: `${palette.violet}16` }]}><FileCode2 size={14} color={palette.violet} /></View>
              <View style={styles.sourceCopy}>
                <Text selectable style={[styles.sourcePath, { color: theme.text }]}>{path}</Text>
                <Text style={[styles.sourcePurpose, { color: theme.muted }]}>{purpose}</Text>
              </View>
            </View>
          ))}
        </View>

        <SectionTitle index="06" kicker="ENGINEERING QUALITY" title="Safeguards built into the product" description="Quality is treated as product behavior: resilient requests, inclusive interaction, bounded resource use, local-first privacy, and repeatable verification." accent="#F4B942" />
        <View style={styles.safeguardGrid}>
          {safeguards.map(({ icon: Icon, title, accent, text }) => (
            <View key={title} style={[styles.safeguardCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <View style={[styles.safeguardIcon, { backgroundColor: `${accent}18` }]}><Icon size={18} color={accent} /></View>
              <Text style={[styles.safeguardTitle, { color: theme.text }]}>{title}</Text>
              <Text style={[styles.safeguardText, { color: theme.muted }]}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.testCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <View style={styles.testHeader}>
            <View style={[styles.testIcon, { backgroundColor: `${palette.lime}18` }]}><TestTube2 size={19} color={palette.lime} /></View>
            <View><Text style={[styles.testKicker, { color: palette.lime }]}>AUTOMATED COVERAGE</Text><Text style={[styles.testTitle, { color: theme.text }]}>6 files · 20 tests</Text></View>
          </View>
          <Text style={[styles.testCopy, { color: theme.muted }]}>Coverage includes catalog edge cases, HTML-response guards, proxy routing and validation, Unicode video matching, queue wrapping and shuffle safety, issue validation and submission, theme persistence, and interactive web DOM nesting.</Text>
        </View>

        <SectionTitle index="07" kicker="DEVELOPMENT" title="Commands you will use" description="The project keeps everyday development and production verification behind a small, memorable command surface." accent={palette.lime} />
        <View style={[styles.commandCard, { backgroundColor: '#0B0A0E', borderColor: 'rgba(255,255,255,0.14)' }]}>
          <View style={styles.commandWindowTop}><View style={styles.windowDots}><View style={[styles.windowDot, { backgroundColor: palette.coral }]} /><View style={[styles.windowDot, { backgroundColor: '#F4B942' }]} /><View style={[styles.windowDot, { backgroundColor: palette.lime }]} /></View><Text style={styles.commandWindowTitle}>MUSE TERMINAL</Text></View>
          {commands.map(([command, purpose], index) => (
            <View key={command} style={[styles.commandRow, index < commands.length - 1 && styles.commandDivider]}>
              <Text selectable style={styles.commandText}><Text style={{ color: palette.lime }}>$ </Text>{command}</Text>
              <Text style={styles.commandPurpose}>{purpose}</Text>
            </View>
          ))}
        </View>

        <SectionTitle index="08" kicker="HONEST BOUNDARIES" title="What the project does not claim" description="Clear limitations make the architecture easier to evaluate and the next engineering priorities easier to choose." accent={palette.coral} />
        <View style={[styles.boundaryCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          {[
            ['Preview catalog', 'Media availability, duration, and regional access depend on the upstream Apple catalog.'],
            ['Offline scope', 'The app shell can reopen offline, but search and third-party audio, artwork, and video still require a connection.'],
            ['Release operations', 'Store credentials, listings, screenshots, final policy review, and device-matrix testing remain external release tasks.'],
            ['Next priorities', 'End-to-end tests, real-device accessibility review, operational monitoring, and negative-result video caching.'],
          ].map(([title, text], index) => (
            <View key={title} style={[styles.boundaryRow, index < 3 && { borderBottomWidth: 1, borderBottomColor: theme.line }]}>
              <View style={[styles.boundaryNumber, { backgroundColor: `${palette.coral}16` }]}><Text style={[styles.boundaryNumberText, { color: palette.coral }]}>{String(index + 1).padStart(2, '0')}</Text></View>
              <View style={styles.boundaryCopy}><Text style={[styles.boundaryTitle, { color: theme.text }]}>{title}</Text><Text style={[styles.boundaryText, { color: theme.muted }]}>{text}</Text></View>
            </View>
          ))}
        </View>

        <LinearGradient colors={[`${activeThemeColor}35`, `${palette.violet}22`, 'transparent']} style={[styles.footerCard, { borderColor: `${activeThemeColor}45` }]}>
          <View style={[styles.footerIcon, { backgroundColor: activeThemeColor }]}><Boxes size={22} color={palette.ink} /></View>
          <Text style={[styles.footerKicker, { color: activeThemeColor }]}>KEEP EXPLORING</Text>
          <Text style={[styles.footerTitle, { color: theme.text }]}>Trace one feature end to end.</Text>
          <Text style={[styles.footerText, { color: theme.muted }]}>A useful study path is HomeScreen → searchSongs → Netlify Function → Song mapping → Zustand actions → player hook → UI status. That route demonstrates the full architecture in a single real interaction.</Text>
          <View style={styles.footerTags}>
            {[['UI', Sparkles], ['STATE', GitBranch], ['DATA', Cloud], ['MEDIA', Music2], ['QA', Wrench]].map(([label, Icon]) => {
              const TagIcon = Icon as typeof Sparkles;
              return <View key={label as string} style={[styles.footerTag, { borderColor: theme.line }]}><TagIcon size={11} color={activeThemeColor} /><Text style={[styles.footerTagText, { color: theme.muted }]}>{label as string}</Text></View>;
            })}
          </View>
        </LinearGradient>

        <View style={styles.footerWordmark}><Text style={[styles.footerWordmarkText, { color: theme.text }]}>MUSE<Text style={{ color: activeThemeColor }}>°</Text></Text><Text style={[styles.footerVersion, { color: theme.muted }]}>PROJECT GUIDE · EXPO SDK 57 · ENGLISH EDITION</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  hero: { borderWidth: 1, borderRadius: radii.xl, padding: 20, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  guideBadge: { height: 30, paddingHorizontal: 10, borderRadius: radii.pill, flexDirection: 'row', alignItems: 'center', gap: 6 },
  guideBadgeText: { color: palette.ink, fontSize: 7.5, fontWeight: '900', letterSpacing: 0.85 },
  versionBadge: { height: 30, borderRadius: radii.pill, borderWidth: 1, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  versionDot: { width: 5, height: 5, borderRadius: 3 },
  versionText: { fontSize: 7.5, fontWeight: '900', letterSpacing: 0.8 },
  heroIconRow: { marginTop: 30, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  heroIcon: { width: 54, height: 54, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  heroSignal: { height: 42, flexDirection: 'row', gap: 4, alignItems: 'flex-end' },
  heroSignalBar: { width: 4, borderRadius: 2 },
  eyebrow: { marginTop: 25, fontSize: 8.5, fontWeight: '900', letterSpacing: 1.5 },
  heroTitle: { marginTop: 7, fontSize: 39, lineHeight: 39, fontWeight: '900', letterSpacing: -1.8, maxWidth: 390 },
  heroTitleCompact: { fontSize: 34, lineHeight: 35, letterSpacing: -1.4 },
  heroCopy: { marginTop: 12, fontSize: 11.5, lineHeight: 18, fontWeight: '600', maxWidth: 430 },
  statGrid: { flexDirection: 'row', gap: 7, marginTop: 21 },
  stat: { flex: 1, minHeight: 61, borderWidth: 1, borderRadius: 16, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontWeight: '900', letterSpacing: -0.6 },
  statLabel: { marginTop: 3, fontSize: 6.5, fontWeight: '900', letterSpacing: 0.7, textAlign: 'center' },
  definitionCard: { marginTop: 14, borderWidth: 1, borderRadius: radii.lg, padding: 16, flexDirection: 'row' },
  definitionIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  definitionCopy: { flex: 1, marginLeft: 12 },
  definitionLabel: { fontSize: 7.5, fontWeight: '900', letterSpacing: 1.05 },
  definitionTitle: { fontSize: 16, lineHeight: 19, fontWeight: '900', letterSpacing: -0.4, marginTop: 3 },
  definitionText: { fontSize: 9.5, lineHeight: 15, fontWeight: '600', marginTop: 5 },
  sectionHeading: { flexDirection: 'row', marginTop: 36, marginBottom: 14 },
  sectionIndex: { width: 36, height: 36, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sectionIndexText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  sectionHeadingCopy: { flex: 1, marginLeft: 11 },
  sectionKicker: { fontSize: 7.5, fontWeight: '900', letterSpacing: 1.2 },
  sectionTitle: { fontSize: 24, lineHeight: 27, fontWeight: '900', letterSpacing: -0.85, marginTop: 2 },
  sectionDescription: { fontSize: 9.5, lineHeight: 14.5, fontWeight: '600', marginTop: 5 },
  featureGrid: { gap: 9 },
  featureCard: { borderWidth: 1, borderRadius: radii.lg, padding: 16 },
  featureTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featureIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  featureStatus: { height: 24, paddingHorizontal: 8, borderRadius: radii.pill, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  featureStatusText: { fontSize: 6.5, fontWeight: '900', letterSpacing: 0.8 },
  featureTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.45, marginTop: 14 },
  featureSummary: { fontSize: 9.5, lineHeight: 15, fontWeight: '600', marginTop: 5 },
  pointList: { marginTop: 11, gap: 6 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  pointText: { flex: 1, fontSize: 8.5, lineHeight: 12, fontWeight: '700' },
  architectureCard: { borderWidth: 1, borderRadius: radii.lg, padding: 15 },
  architectureTop: { flexDirection: 'row', gap: 9 },
  architectureNode: { flex: 1, minHeight: 67, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  architectureNodeText: { fontSize: 9.5, fontWeight: '900' },
  architectureLine: { width: 1, height: 15, alignSelf: 'center' },
  architectureMiddle: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  architectureMiddleText: { fontSize: 6.8, fontWeight: '900', letterSpacing: 0.75, textAlign: 'center' },
  platformRow: { flexDirection: 'row', gap: 6 },
  platformNode: { flex: 1, minHeight: 58, borderWidth: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center', gap: 6 },
  platformText: { fontSize: 7.5, fontWeight: '900', letterSpacing: 0.5 },
  architectureFooter: { borderTopWidth: 1, marginTop: 14, paddingTop: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  architectureFooterText: { flex: 1, fontSize: 8.5, lineHeight: 13, fontWeight: '600' },
  toolGroupList: { gap: 9 },
  toolGroup: { borderWidth: 1, borderRadius: radii.lg, overflow: 'hidden' },
  toolGroupHeader: { minHeight: 52, paddingHorizontal: 14, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  toolGroupIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toolGroupLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  toolRow: { padding: 13, flexDirection: 'row', alignItems: 'flex-start' },
  toolBullet: { width: 5, height: 5, borderRadius: 3, marginTop: 5, marginRight: 9 },
  toolCopy: { flex: 1 },
  toolName: { fontSize: 11, fontWeight: '900' },
  toolDetail: { fontSize: 8.5, lineHeight: 13, fontWeight: '600', marginTop: 3 },
  flowCard: { borderWidth: 1, borderRadius: radii.lg, padding: 16 },
  flowStep: { flexDirection: 'row', minHeight: 72 },
  flowRail: { width: 39, alignItems: 'center' },
  flowNumber: { width: 31, height: 31, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  flowNumberText: { fontSize: 7.5, fontWeight: '900', letterSpacing: 0.5 },
  flowConnector: { width: 1, flex: 1 },
  flowCopy: { flex: 1, paddingLeft: 10, paddingBottom: 15 },
  flowTitle: { fontSize: 12, fontWeight: '900', letterSpacing: -0.2 },
  flowDetail: { fontSize: 8.8, lineHeight: 13.5, fontWeight: '600', marginTop: 4 },
  mediaCard: { marginTop: 12, borderWidth: 1, borderRadius: radii.xl, overflow: 'hidden', padding: 18 },
  mediaTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mediaIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  mediaKicker: { fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  mediaTitle: { fontSize: 23, lineHeight: 26, fontWeight: '900', letterSpacing: -0.7, marginTop: 16 },
  mediaCopy: { fontSize: 9.5, lineHeight: 15, fontWeight: '600', marginTop: 6 },
  mediaSequence: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mediaStep: { borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 7 },
  mediaStepText: { fontSize: 6.5, fontWeight: '900', letterSpacing: 0.6 },
  sourceCard: { borderWidth: 1, borderRadius: radii.lg, overflow: 'hidden' },
  sourceRow: { padding: 12, flexDirection: 'row', alignItems: 'center' },
  sourceIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  sourceCopy: { flex: 1, marginLeft: 10 },
  sourcePath: { fontSize: 9.5, fontWeight: '900' },
  sourcePurpose: { fontSize: 8.2, lineHeight: 12, fontWeight: '600', marginTop: 2 },
  safeguardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  safeguardCard: { width: '48.8%', minHeight: 170, borderWidth: 1, borderRadius: radii.lg, padding: 14 },
  safeguardIcon: { width: 37, height: 37, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  safeguardTitle: { fontSize: 13, fontWeight: '900', marginTop: 12 },
  safeguardText: { fontSize: 8.3, lineHeight: 13, fontWeight: '600', marginTop: 5 },
  testCard: { borderWidth: 1, borderRadius: radii.lg, padding: 16, marginTop: 10 },
  testHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  testIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  testKicker: { fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  testTitle: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  testCopy: { fontSize: 9, lineHeight: 14, fontWeight: '600', marginTop: 12 },
  commandCard: { borderWidth: 1, borderRadius: radii.lg, padding: 15 },
  commandWindowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12 },
  windowDots: { flexDirection: 'row', gap: 5 },
  windowDot: { width: 7, height: 7, borderRadius: 4 },
  commandWindowTitle: { color: 'rgba(247,244,238,0.45)', fontSize: 6.5, fontWeight: '900', letterSpacing: 1 },
  commandRow: { paddingVertical: 11 },
  commandDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  commandText: { color: palette.text, fontSize: 9.5, fontWeight: '800' },
  commandPurpose: { color: 'rgba(247,244,238,0.47)', fontSize: 7.8, lineHeight: 12, fontWeight: '600', marginTop: 4 },
  boundaryCard: { borderWidth: 1, borderRadius: radii.lg, overflow: 'hidden' },
  boundaryRow: { padding: 14, flexDirection: 'row' },
  boundaryNumber: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  boundaryNumberText: { fontSize: 8, fontWeight: '900' },
  boundaryCopy: { flex: 1, marginLeft: 10 },
  boundaryTitle: { fontSize: 11, fontWeight: '900' },
  boundaryText: { fontSize: 8.5, lineHeight: 13, fontWeight: '600', marginTop: 3 },
  footerCard: { marginTop: 34, borderWidth: 1, borderRadius: radii.xl, padding: 20, overflow: 'hidden' },
  footerIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  footerKicker: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2, marginTop: 18 },
  footerTitle: { fontSize: 23, lineHeight: 26, fontWeight: '900', letterSpacing: -0.75, marginTop: 4 },
  footerText: { fontSize: 9.5, lineHeight: 15, fontWeight: '600', marginTop: 7 },
  footerTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16 },
  footerTag: { borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerTagText: { fontSize: 6.5, fontWeight: '900', letterSpacing: 0.6 },
  footerWordmark: { alignItems: 'center', paddingTop: 28 },
  footerWordmarkText: { fontSize: 22, fontWeight: '900', letterSpacing: -0.9 },
  footerVersion: { fontSize: 6.8, fontWeight: '900', letterSpacing: 0.8, marginTop: 4 },
});
