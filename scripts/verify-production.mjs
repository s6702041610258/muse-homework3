import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const requireFile = (path) => {
  if (!existsSync(join(root, path))) throw new Error(`Missing required production file: ${path}`);
};

const app = readJson('app.json').expo;
const packageJson = readJson('package.json');
const manifest = readJson('public/manifest.json');
const eas = readJson('eas.json');

if (!app.ios?.bundleIdentifier || !app.android?.package) {
  throw new Error('Native bundle identifiers are not configured.');
}
const routerPlugin = app.plugins?.find((plugin) => plugin === 'expo-router' || (Array.isArray(plugin) && plugin[0] === 'expo-router'));
if (packageJson.main !== 'expo-router/entry' || !routerPlugin) {
  throw new Error('Expo Router entry point and config plugin are required.');
}
if (app.web?.output !== 'server') {
  throw new Error('Expo web server output is required for local API routes.');
}
for (const path of ['src/app/+html.tsx', 'src/app/_layout.tsx', 'src/app/index.tsx', 'src/app/collection.tsx', 'src/app/learn.tsx', 'src/app/studio.tsx', 'src/app/api/itunes-search+api.ts', 'src/server/itunesGateway.ts']) {
  requireFile(path);
}
if (!app.ios?.buildNumber || !Number.isInteger(app.android?.versionCode)) {
  throw new Error('Native build numbers are not configured.');
}
if (!eas.build?.development || !eas.build?.preview || !eas.build?.production) {
  throw new Error('EAS development, preview and production profiles are required.');
}
if (manifest.display !== 'standalone' || !Array.isArray(manifest.icons) || manifest.icons.length < 2) {
  throw new Error('The PWA manifest is not install-ready.');
}

for (const path of [
  'assets/muse-app-icon-1024.png',
  'public/apple-touch-icon.png',
  'public/manifest.json',
  'public/privacy.html',
  'public/sw.js',
  'dist/server/index.html',
  'dist/client/manifest.json',
  'dist/client/privacy.html',
  'dist/client/sw.js',
  'dist/server/_expo/functions/api/itunes-search+api.js',
  'dist/server/_expo/routes.json',
]) requireFile(path);

for (const htmlPath of ['dist/server/index.html']) {
  const html = readFileSync(join(root, htmlPath), 'utf8');
  if (!html.includes('<meta name="mobile-web-app-capable" content="yes"')) {
    throw new Error(`${htmlPath} is missing the current mobile web app capability meta tag.`);
  }
  if (!html.includes('<meta name="apple-mobile-web-app-capable" content="yes"')) {
    throw new Error(`${htmlPath} is missing the iOS standalone-mode meta tag.`);
  }
}

const serviceWorker = readFileSync(join(root, 'public/sw.js'), 'utf8');
if (!serviceWorker.includes('url.origin !== self.location.origin')) {
  throw new Error('The service worker must reject cross-origin media requests before caching.');
}

const jsDir = join(root, 'dist/client/_expo/static/js/web');
const bundles = readdirSync(jsDir).filter((name) => name.endsWith('.js'));
if (bundles.length !== 1) throw new Error(`Expected one production JS bundle, found ${bundles.length}.`);

const bundlePath = join(jsDir, bundles[0]);
const bundle = readFileSync(bundlePath);
const gzipBytes = gzipSync(bundle).byteLength;
const maxRawBytes = 5 * 1024 * 1024;
const maxGzipBytes = 1024 * 1024;
if (statSync(bundlePath).size > maxRawBytes || gzipBytes > maxGzipBytes) {
  throw new Error(`Web bundle is too large: ${statSync(bundlePath).size} bytes raw / ${gzipBytes} bytes gzip.`);
}

console.log(`Production verification passed: ${app.ios.bundleIdentifier}`);
console.log(`Web bundle: ${(bundle.byteLength / 1024 / 1024).toFixed(2)} MB raw, ${(gzipBytes / 1024).toFixed(0)} KB gzip`);
