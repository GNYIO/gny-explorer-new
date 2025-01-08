// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false, // activates client side rendering

  runtimeConfig: {
    public: {
      gnyEndpoint: "testnet.gny.io",
      gnyPort: "80",
      gnyNetwork: "testnet",
      gnyHttps: "true",
    }
  }
})
