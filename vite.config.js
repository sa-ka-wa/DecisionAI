import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: "gzip",
      ext: ".gz",
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "DecisionAI - AI Assisted Dashboard",
        short_name: "DecisionAI",
        description:
          "AI-powered decision dashboard for task prioritization and impact analysis",
        theme_color: "#667eea",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "chart-vendor": ["recharts"],
          "utils-vendor": ["date-fns", "clsx"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
});
