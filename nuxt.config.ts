import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false, // activates client side rendering

  runtimeConfig: {
    public: {
      gnyEndpoint: "testnet.gny.io", // overwrite with: NUXT_PUBLIC_GNY_ENDPOINT= in .env
      gnyPort: "80",
      gnyNetwork: "testnet",
      gnyHttps: "true",
    }
  },
  modules: [
    '@element-plus/nuxt',
    "@vueuse/nuxt"
  ],
  vite: {
    plugins: [
      nodePolyfills(),
    ],
  },
  telemetry: false,
  // https://github.com/nuxt/nuxt/issues/30461#issuecomment-2572616714
  experimental: { appManifest: false },
});