import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const requireFile = (path) => {
  if (!existsSync(join(root, path))) throw new Error(`Missing required production file: ${path}`);
};

const app = readJson('app.json').expo;
const manifest = readJson('public/manifest.json');
const eas = readJson('eas.json');

if (!app.ios?.bundleIdentifier || !app.android?.package) {
  throw new Error('Native bundle identifiers are not configured.');
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
  'netlify.toml',
  'netlify/functions/itunes-search.mts',
  'dist/index.html',
  'dist/manifest.json',
  'dist/privacy.html',
  'dist/sw.js',
]) requireFile(path);

for (const htmlPath of ['public/index.html', 'dist/index.html']) {
  const html = readFileSync(join(root, htmlPath), 'utf8');
  if (!html.includes('<meta name="mobile-web-app-capable" content="yes"')) {
    throw new Error(`${htmlPath} is missing the current mobile web app capability meta tag.`);
  }
  if (!html.includes('<meta name="apple-mobile-web-app-capable" content="yes"')) {
    throw new Error(`${htmlPath} is missing the iOS standalone-mode meta tag.`);
  }
}

const netlifyConfig = readFileSync(join(root, 'netlify.toml'), 'utf8');
const catalogFunction = readFileSync(join(root, 'netlify/functions/itunes-search.mts'), 'utf8');
if (!netlifyConfig.includes('functions = "netlify/functions"') || !catalogFunction.includes("path: '/api/itunes-search'")) {
  throw new Error('The Netlify music-catalog proxy is not configured for deployment.');
}

const serviceWorker = readFileSync(join(root, 'public/sw.js'), 'utf8');
if (!serviceWorker.includes('url.origin !== self.location.origin')) {
  throw new Error('The service worker must reject cross-origin media requests before caching.');
}

const jsDir = join(root, 'dist/_expo/static/js/web');
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
