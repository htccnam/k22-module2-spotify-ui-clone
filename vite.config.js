import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/k22-module2-spotify-ui-clone/" : "/",
  plugins: [react()],
}));
