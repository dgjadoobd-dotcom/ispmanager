import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "pwa-icons/*.png"],
      manifest: {
        name: "NetPulse - Customer Portal",
        short_name: "NetPulse",
        description: "Manage your internet connection, view bills, and make payments",
        theme_color: "#3b82f6",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/app",
        icons: [
          {
            src: "/pwa-icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "/pwa-icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "/pwa-icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "/pwa-icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "/pwa-icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "/pwa-icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/pwa-icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "/pwa-icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MiB
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*supabase\.co\/rest\/v1\/bills.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "bills-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*supabase\.co\/rest\/v1\/payments.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "payments-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select", "@radix-ui/react-tabs", "@radix-ui/react-tooltip"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-charts": ["recharts"],
          "vendor-motion": ["framer-motion"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-pdf": ["jspdf", "jspdf-autotable"],
        },
      },
    },
  },
}));
