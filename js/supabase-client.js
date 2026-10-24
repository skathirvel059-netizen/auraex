/**
 * AURAEX SUPABASE CLIENT INTEGRATION
 * -------------------------------------------------------------
 * Provides direct connection to Supabase for PostgreSQL database,
 * OAuth providers (Google, GitHub), email/password auth, and real-time.
 */

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_CONFIG = {
  // Reads from Vite/Next environment variables, localStorage overrides, or project defaults
  get url() {
    return (
      import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
      localStorage.getItem('auraex_supabase_url') ||
      'https://ltziczggfwqbeodfxpwx.supabase.co'
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
      import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      localStorage.getItem('auraex_supabase_anon_key') ||
      'sb_publishable_zS4lcu7YU-_rkL2GHt2a1Q_IREjY-GL'
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

/**
 * Records user login information into Supabase 'user_logins' table
 * and caches locally in browser history.
 */
export async function recordUserLogin({ name, email, authMethod }) {
  const timestamp = new Date().toISOString();
  const entry = {
    name: name || 'User',
    email: email || 'unknown',
    auth_method: authMethod || 'Standard Auth',
    logged_in_at: timestamp,
    user_agent: navigator.userAgent
  };

  // 1. Always keep in local history cache so owner can inspect in devtools / storage
  try {
    const history = JSON.parse(localStorage.getItem('auraex_logins_history') || '[]');
    history.unshift(entry);
    if (history.length > 100) history.pop();
    localStorage.setItem('auraex_logins_history', JSON.stringify(history));
  } catch (e) {
    // Ignore storage quota
  }

  // 2. Insert into Supabase if configured
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('user_logins').insert([entry]);
      if (error) {
        console.warn('[Supabase] user_logins insert notice:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase] user_logins network exception:', err);
    }
  }
}

/**
 * Records a contact/collaboration brief submission into Supabase 'contact_submissions'
 * and caches locally in browser history.
 */
export async function recordContactSubmission({ name, email, org, budget, services, message }) {
  const timestamp = new Date().toISOString();
  const servicesStr = Array.isArray(services) ? services.join(', ') : (services || '');

  const entry = {
    name: name,
    email: email,
    organization: org || null,
    budget: budget || null,
    services: servicesStr,
    message: message,
    submitted_at: timestamp
  };

  // 1. Keep in local inquiries history
  try {
    const history = JSON.parse(localStorage.getItem('auraex_contacts_history') || '[]');
    history.unshift(entry);
    if (history.length > 100) history.pop();
    localStorage.setItem('auraex_contacts_history', JSON.stringify(history));
  } catch (e) {
    // Ignore storage quota
  }

  // 2. Insert into Supabase if configured
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('contact_submissions').insert([entry]);
      if (error) {
        console.warn('[Supabase] contact_submissions insert notice:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase] contact_submissions network exception:', err);
    }
  }
}

