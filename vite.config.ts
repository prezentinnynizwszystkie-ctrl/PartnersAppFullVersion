import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix dla __dirname w modułach ES (wymagane przez Vite na Vercel)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Ładujemy zmienne środowiskowe, aby były dostępne w konfiguracji
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        // To naprawia importy zaczynające się od @ (np. @/components/...)
        '@': path.resolve(__dirname, './'),
      },
    },
    // To pozwala używać process.env.API_KEY w kodzie klienckim (wymagane przez Google GenAI SDK)
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || ''),
      // Fallback dla innych zmiennych process.env jeśli są używane
      'process.env': {} 
    },
    build: {
      outDir: 'dist',
      // Zwiększenie limitu ostrzeżeń, aby logi były czystsze
      chunkSizeWarningLimit: 1600,
    },
  };
});