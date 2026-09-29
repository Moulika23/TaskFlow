import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // This makes Tailwind work with Vite
  ],
  server: {
    // This proxy forwards any request starting with /api
    // to our Express backend running on port 5000.
    // This way we don't have to type http://localhost:5000 everywhere in our fetch calls.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})

