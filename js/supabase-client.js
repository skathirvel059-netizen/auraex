/**
 * AURAEX SUPABASE CLIENT INTEGRATION
 * -------------------------------------------------------------
 * Provides direct connection to Supabase for PostgreSQL database,
 * OAuth providers (Google, GitHub), email/password auth, and real-time.
 */

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_CONFIG = {
  // Reads from Vite environment variables or localStorage overrides
  get url() {
    return (
      import.meta.env.VITE_SUPABASE_URL ||
      localStorage.getItem('auraex_supabase_url') ||
      ''
    );
  },
  set url(val) {
    if (val && val.trim()) {
      localStorage.setItem('auraex_supabase_url', val.trim());
    } else {
      localStorage.removeItem('auraex_supabase_url');
    }
    resetSupabaseInstance();
  },

  get anonKey() {
    return (
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      localStorage.getItem('auraex_supabase_anon_key') ||
      ''
    );
  },
  set anonKey(val) {
    if (val && val.trim()) {
      localStorage.setItem('auraex_supabase_anon_key', val.trim());
    } else {
      localStorage.removeItem('auraex_supabase_anon_key');
    }
    resetSupabaseInstance();
  },

  isConfigured() {
    return Boolean(
      this.url &&
      !this.url.includes('YOUR_PROJECT') &&
      this.anonKey &&
      !this.anonKey.includes('YOUR_ANON_KEY')
    );
  }
};

let supabaseInstance = null;

export function resetSupabaseInstance() {
  supabaseInstance = null;
}

/**
 * Returns active Supabase client instance or null if not yet configured
 */
export function getSupabase() {
  if (!SUPABASE_CONFIG.isConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}
