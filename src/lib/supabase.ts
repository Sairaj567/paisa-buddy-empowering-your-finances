import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Use localStorage for session persistence (works across tabs)
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      // Automatically refresh tokens before they expire
      autoRefreshToken: true,
      // Persist session across browser restarts
      persistSession: true,
      // Detect session from URL (for OAuth redirects)
      detectSessionInUrl: true,
      // Storage key for the session
      storageKey: 'pb-supabase-auth',
    },
  }
);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
