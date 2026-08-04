# MUSE release checklist

The native identifiers are configured as `com.mongkoi.muse` for iOS and Android. Change them before the first store build if that identifier is not owned by your developer account; store identifiers cannot be renamed after release.

## Build on a real phone

1. Install EAS CLI and sign in: `npm install --global eas-cli` then `eas login`.
2. Link the project once: `eas init`.
3. For an iPhone development build, run `eas device:create`, then `eas build --profile development --platform ios`.
4. For an installable Android APK, run `eas build --profile preview --platform android`.

The iPhone flow needs a paid Apple Developer account and device registration. The Android preview profile produces an APK that can be installed directly.

## App Store production

1. Create the app record in App Store Connect with bundle ID `com.mongkoi.muse`.
2. Deploy the PWA, then use its `/privacy.html` URL as the public privacy-policy URL in App Store Connect.
3. Add support URL, screenshots, category, age rating, copyright, and review contact.
4. Build with `eas build --profile production --platform ios`.
5. Submit with `eas submit --profile production --platform ios`.

EAS creates and stores signing credentials interactively. The project deliberately does not contain Apple credentials, an App Store Connect app ID, or an EAS project UUID.

## PWA production on Netlify

The web build uses a same-origin Netlify Function at `/api/itunes-search` so Safari and other browsers do not fetch the Apple catalog cross-origin. Build and deploy both the static `dist` directory and the Function source:

```bash
npm run build:web
netlify deploy --prod --dir=dist --functions=netlify/functions
```

Do not upload `node_modules`. The committed `netlify.toml` defines `dist` as the publish directory and `netlify/functions` as the Functions directory. For local web testing with the proxy and hot reload, run `npm run web`, then open `http://localhost:8888`. The `npm run web:expo` command starts Expo alone and is intended only for UI work because it cannot serve `/api/itunes-search`.

## Support reporting

The Studio issue form works in two modes:

1. Set `EXPO_PUBLIC_SUPPORT_ENDPOINT` to an HTTPS endpoint that accepts a JSON `POST`. A successful response may return an `id`, `reference`, or `ticket` string.
2. Without an endpoint, MUSE uses `EXPO_PUBLIC_SUPPORT_EMAIL` when available, or opens the device share flow so the user controls the final send.

Copy `.env.example` to `.env.local` for local development. `EXPO_PUBLIC_` values ship inside the app, so use them only for public routing values—never credentials or private API keys. The production endpoint must validate input, allow requests from the deployed PWA origin, rate-limit abuse, and store issue reports according to the privacy policy.
