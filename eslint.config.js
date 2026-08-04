const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/**', 'web-build/**', 'ios/**', 'android/**'],
  },
  {
    files: ['src/hooks/useAudioPlayer.ts'],
    rules: {
      // expo-audio intentionally exposes an imperative player object from a hook.
      'react-hooks/immutability': 'off',
    },
  },
]);
