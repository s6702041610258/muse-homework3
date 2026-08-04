# MUSE° — Universal Music Discovery

MUSE° is a music discovery and preview application built with Expo, React Native, and TypeScript. One codebase targets iOS, Android, and Web/PWA while providing catalog search, audio and video previews, a playback queue, local favorites, personalized themes, accessibility support, and production release tooling.

Live web app: https://muse-pj.netlify.app/

> MUSE is a discovery and preview experience. It is not a full-track streaming service, subscription platform, music uploader, or Spotify clone. Preview availability and duration are controlled by the upstream Apple catalog.

## Project guide inside the app

Open the **Learn** tab in MUSE for a visual English handbook covering:

- Every user-facing feature
- System architecture and platform routing
- The complete toolchain and why each dependency exists
- Search, audio, video, persistence, and state-management flows
- Repository structure and suggested code-reading paths
- Accessibility, performance, privacy, and gateway safeguards
- Automated testing and production verification
- Known limitations and next engineering priorities

The Discover screen also contains a prominent **See how MUSE is built** entry point.

## Core features

### Music discovery

- Search by track, artist, or mood
- Thirty-result catalog window
- Initial request retry for transient network failures
- Abortable requests and request IDs that prevent stale results
- Five-minute in-memory response cache
- Loading, empty, error, retry, and pull-to-refresh states
- Featured track, 3D cover carousel, and expandable quick-list presentation

### Audio player

- Remote catalog preview playback through `expo-audio`
- Shared mini-player and expandable full-player interfaces
- Play, pause, seek, next, and previous controls
- Playback queue management
- Shuffle that avoids returning the current song when alternatives exist
- Repeat off, repeat all, and repeat one modes
- Background playback configuration
- Lock-screen title, artist, album, and artwork metadata
- Playback errors surfaced in the UI
- Audio pauses automatically before video playback

### Music-video previews

- Searches up to eight `musicVideo` catalog candidates
- Normalizes Unicode text with NFKC
- Removes version labels and punctuation before comparison
- Uses weighted title and artist matching
- Requires a minimum confidence score
- Mounts video only when requested
- Supports native video controls and user-gesture fallback when autoplay is blocked

### Local collection

- Save and remove favorite tracks
- Persist favorites with AsyncStorage
- Create a playback queue from the collection
- Play the complete saved collection
- No user account or remote profile required

### Studio controls

- Daylight and After Dark visual modes
- Five persistent accent profiles
- Audio preview toggle
- Instant-play toggle
- Background-playback toggle
- Video-autoplay toggle
- Haptic-feedback toggle
- Live catalog, favorite, and audio status metrics
- Reset to MUSE defaults

### Issue reporting

- Controlled React form with validation
- Draft persistence on the current device
- Optional contact email and diagnostic consent
- Configurable HTTPS support endpoint
- Email or native share fallback when no endpoint is configured
- Timeout and stable submission states

### PWA behavior

- Installable standalone web manifest
- iPhone Add to Home Screen guidance
- Service worker for the application shell
- Network-first navigation
- Same-origin static asset caching
- Cross-origin artwork, audio, and video intentionally excluded from cache
- Same-origin Netlify Function for catalog search on the web

## Technology stack

| Layer | Technology | Responsibility |
|---|---|---|
| Platform | Expo SDK 57 | Runtime, native configuration, Metro bundling, and web export |
| UI | React Native 0.86 | Shared iOS, Android, and web component model |
| Rendering | React 19 | Components, hooks, lifecycle, and stateful interaction |
| Language | TypeScript 6 | Static contracts for API records, state, props, and utilities |
| State | Zustand 5 | Shared search, player, queue, favorite, modal, and preference state |
| Persistence | AsyncStorage 2 | Device-local favorites, preferences, and issue drafts |
| Audio | `expo-audio` | Playback, status, seeking, audio mode, and lock-screen metadata |
| Video | `expo-video` | On-demand music-video preview lifecycle |
| Artwork | `expo-image` | Optimized remote image rendering and transitions |
| Motion | Reanimated 4 | UI-thread transforms, springs, timing, and player animation |
| Gestures | Gesture Handler | Full-player pan interaction |
| Feedback | Expo Haptics | Optional tactile interaction cues |
| API | Apple iTunes Search API | Public song and music-video preview catalog |
| Web gateway | Netlify Functions | Validated same-origin proxy for browser requests |
| Testing | Vitest | Service, state, queue, and gateway tests |
| Release | EAS + Netlify | Native build profiles and web deployment |

## Application architecture

```text
index.ts
  └─ App.tsx
      ├─ AnimatedBackground
      ├─ Discover / Collection / Learn / Studio
      ├─ CustomTabBar
      ├─ MusicPlayerSheet
      ├─ SongDetailModal + VideoView
      └─ InstallPrompt

Screens and components
  ⇅ selectors and actions
Zustand music store
  ⇅
AsyncStorage

Discover and detail UI
  └─ catalog services
      ├─ iOS / Android ───────────────> Apple iTunes Search API
      └─ Web / PWA ─> Netlify Function ─> Apple iTunes Search API

MusicPlayerSheet
  └─ useAudioPlayer ─> expo-audio and native media session
```

The project uses the standard Expo entry structure:

```text
index.ts → App.tsx → src/screens/
```

It does not use Expo Router, so an `app/` directory, `app/index.tsx`, and `app/_layout.tsx` are not required.

## Search pipeline

1. A search submission, mood selection, refresh, or initial query begins the request.
2. The screen cancels its previous `AbortController`.
3. A monotonically increasing request ID identifies the new request.
4. Native platforms call Apple directly; web calls `/api/itunes-search`.
5. The Netlify Function validates the entity, limits the term, clamps result count, and applies an upstream timeout.
6. The service rejects HTML and malformed responses before parsing catalog data.
7. Records without playable previews are removed.
8. API records are mapped into typed `Song` objects.
9. Results update the screen only if the request ID still matches the latest request.

Both cancellation and request IDs are intentional: cancellation reduces wasted work, while the ID guard prevents a slow stale response from overwriting a newer result in environments where abort handling is delayed.

## State model

The Zustand store contains five major state groups:

1. Search query, results, loading, and error state
2. Active song, player status, progress, queue, shuffle, repeat, and playback errors
3. Favorite songs
4. Audio, video, haptic, appearance, and autoplay preferences
5. Shared expanded-player and song-detail modal state

Persistent values:

- Favorites: `@music_app_favorites`
- Preferences: `@muse_preferences`
- Issue-report draft: a component-specific AsyncStorage key

Search responses, active playback position, and transient errors remain session state.

## Repository map

```text
App.tsx                         Root composition and local tab selection
app.json                       Expo, native, web, and plugin configuration
eas.json                       Development, preview, production, and submit profiles
public/                        PWA shell, manifest, service worker, icons, and privacy
netlify/functions/             Same-origin web catalog proxy
netlify.toml                   Build, publish, and function configuration
scripts/                       Production checks and DOM nesting test
src/components/                Reusable search, cards, player, modal, and form UI
src/hooks/                     Audio engine integration and reduced-motion detection
src/screens/                   Discover, Collection, Learn, and Studio screens
src/services/                  Catalog access, video matching, and issue reporting
src/store/                     Shared state, actions, and persistence
src/types/                     External API and internal domain contracts
src/utils/                     Pure queue behavior and style helpers
```

## Accessibility

- Button, tab, and adjustable roles
- Accessible labels, hints, selected states, and expanded states
- Seek bar increment and decrement actions
- Live status regions where appropriate
- Safe-area support around device cutouts and home indicators
- Reduced Motion detection and decorative-animation suppression
- Compact responsive layouts for narrow or short screens
- Automated protection against nested interactive `Pressable` elements on web

Recommended pre-release checks still include VoiceOver, TalkBack, keyboard focus order, large-text stress testing, and full accent-profile contrast measurement on real devices.

## Performance strategy

- Reanimated shared values keep 3D cover transforms on the UI thread
- Decorative motion stops when it is not visible or relevant
- Video mounts only after explicit user intent
- `expo-image` handles remote artwork efficiently
- Catalog responses remain cached in memory for five minutes
- The web experience is presented in a bounded mobile-first frame on desktop
- Production verification enforces raw and gzip JavaScript bundle budgets

## Privacy and security

- No account system
- No advertising tracker or analytics SDK
- No microphone or recording permission
- Favorites and preferences remain on the current device
- Issue diagnostics require explicit consent and exclude listening history
- Public support routing values are configurable, but secrets are never stored in `EXPO_PUBLIC_` variables
- The web gateway allowlists entities, limits input, clamps result counts, and times out upstream requests
- The service worker rejects cross-origin media before caching

## Testing

The current suite contains 6 test files and 20 tests covering:

- Blank catalog queries
- Filtering results without previews
- Web proxy routing
- Request cancellation propagation
- HTML-response safeguards
- Unicode-aware video matching
- Queue next, previous, wrap, shuffle, empty, and missing-song behavior
- Issue validation, reference creation, formatting, and endpoint submission
- Netlify Function validation, clamping, cache headers, and upstream failure behavior
- Theme switching and AsyncStorage preference restoration
- Interactive DOM nesting rules for web

## Development commands

```bash
# Start Expo
npm start

# Run Expo web with the local Netlify Function
# Open http://localhost:8888
npm run web

# Run Expo web alone for UI-only work
npm run web:expo

# Quality checks
npm run typecheck
npm run lint
npm test

# Production web export
npm run build:web

# Complete production verification
npm run verify:production
```

## Environment values

Issue reporting supports optional public routing values. See `.env.example` when configuring a support destination. Never place private credentials in variables prefixed with `EXPO_PUBLIC_`, because those values are embedded in the client bundle.

## Release paths

```bash
# Native development build
eas build --profile development --platform ios

# Installable Android preview
eas build --profile preview --platform android

# Production iOS build and submission
eas build --profile production --platform ios
eas submit --profile production --platform ios

# Production web deployment
netlify deploy --prod --dir=dist --functions=netlify/functions
```

## Known boundaries

- Preview availability and regional access depend on the Apple catalog.
- The PWA provides an offline app shell, but new searches and third-party media require a connection.
- Video matching is a scoring heuristic, not a canonical relationship identifier.
- Negative video results are not currently cached.
- The repository does not yet include end-to-end UI automation or a native device matrix.
- Store credentials, metadata, screenshots, privacy declarations, and final device QA remain release-operation tasks.

## Recommended next priorities

1. Add end-to-end search, playback, favorite, and video flows.
2. Run VoiceOver and TalkBack validation on physical devices.
3. Add privacy-conscious crash and operational monitoring.
4. Cache negative video matches for a bounded period.
5. Add consent-based recent listening or search history only if the product needs it.
6. Complete store metadata, screenshots, credentials, and release-candidate testing.

## License

See [LICENSE](LICENSE).
