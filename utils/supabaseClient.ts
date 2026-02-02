import { createClient } from '@supabase/supabase-js';

// Bezpieczna funkcja do pobierania zmiennych środowiskowych
// Działa w Vite (import.meta.env), CRA (process.env) i zapobiega crashom
const getEnvVar = (key: string): string => {
  let value = '';

  // 1. Sprawdź Vite (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      value = import.meta.env[key] || '';
    }
  } catch (e) {
    // Ignoruj błędy dostępu do import.meta
  }

  if (value) return value;

  // 2. Sprawdź Process (Node/CRA)
  try {
    if (typeof process !== 'undefined' && process.env) {
      // Obsługa prefiksów VITE_ oraz REACT_APP_
      value = process.env[key] || process.env[`REACT_APP_${key.replace('VITE_', '')}`] || '';
    }
  } catch (e) {
    // Ignoruj błędy
  }

  return value;
};

// Pobieramy wartości bezpiecznie. Jeśli nie ma zmiennych (np. lokalny podgląd bez .env), używamy fallbacków.
// WAŻNE: Na produkcji (Vercel) te fallbacki nie będą używane, jeśli ustawisz zmienne w panelu Vercel.
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://idbvgxjvitowbysvpjlk.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkYnZneGp2aXRvd2J5c3ZwamxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTQyNzcsImV4cCI6MjA3MTg3MDI3N30.3vwYJTVnGaDDUIZ6fi3XCLPTYirLY3TlnB5KlZ7tFtk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);