import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The Android app (`npm run build:android`) lays the WebView out INSIDE the system bars
 * rather than under them: Capacitor's SystemBars handling pads the view when the page
 * does not ask for `viewport-fit=cover`. The web build keeps `cover`, which the phone
 * layout relies on for the home-indicator inset, so only the Android build drops it.
 */
const androidViewport = {
  name: 'ecu-lab-android-viewport',
  transformIndexHtml: (html) => html.replace(/,\s*viewport-fit=cover/, ''),
};

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'android' ? [androidViewport] : [])],
  // Relative base so a production build works when served from a subdirectory
  // (GitHub Pages project sites, for example) as well as from a domain root.
  base: './',
  build: {
    outDir: 'dist',
    // No source maps in the APK: they would double its size for no one to read.
    sourcemap: mode !== 'android',
  },
  test: {
    // The simulation is pure JS with no DOM dependency, so the default Node
    // environment is both correct and much faster than jsdom. Component tests opt
    // into jsdom per-file with `// @vitest-environment jsdom` rather than slowing
    // the physics suite down for everyone.
    environment: 'node',
    include: ['tests/**/*.test.{js,jsx}'],
    // Resets `window.location.hash` before every test. Navigation lives in the URL
    // now, and jsdom shares one `window` across a whole file, so without this each
    // test inherits the previous one's route. See tests/setup.js.
    setupFiles: ['./tests/setup.js'],
  },
}));
