// Removed reference to 'vite/client' to resolve "Cannot find type definition file" error.
// The types are defined manually below.
// /// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_API_KEY: string
  [key: string]: any
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
