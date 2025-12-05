import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: mode === "development" ? {
    proxy: {
      "/api": {
        target: "http://localhost:9000",
        changeOrigin: true,
        secure: false,
      },
    },
  } : undefined,
}));
