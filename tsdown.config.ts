import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm', 'iife'],
  globalName: 'IwanClient', // explorer window.IwanClient
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  unused: true,
  platform: 'neutral',
  outputOptions: {
    globals: {
      'eventemitter3': 'eventemitter3',
      'crypto-js/hmac-sha256': 'crypto-js/hmac-sha256',
      'crypto-js/enc-base64': 'crypto-js/enc-base64',
    },
  },
  deps: {
    // skipNodeModulesBundle: true,
    neverBundle: ['ws'],
    alwaysBundle: ['eventemitter3', /^crypto-js(\/.*)?$/],
    onlyBundle: ['eventemitter3', /^crypto-js(\/.*)?$/]
  }
});