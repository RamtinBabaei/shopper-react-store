import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({ base: "./", plugins: [react(), tailwindcss()], server: {port: 4173, strictPort: true}, build: {target: "es2022"} });
