// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: "public", // ensure public/ files like _redirects are copied
  build: {
    outDir: "dist",
  },
  server: {
    allowedHosts: true, // allow all hosts during dev
  },
});
