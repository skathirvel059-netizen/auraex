/**
 * AURAEX AUTHENTICATION CONFIGURATION
 * -------------------------------------------------------------
 * Provides configuration and hooks for Google OAuth 2.0
 * (Google Identity Services) and backend authentication endpoints.
 */

export const AUTH_CONFIG = {
  // Mode: 'production'
  mode: 'production',

  // Google OAuth 2.0 Client ID
  defaultGoogleClientId: '828133622960-vto4lijj72t4sl9eip77rh5er2b5cj27.apps.googleusercontent.com',

  get googleClientId() {
    return localStorage.getItem('auraex_google_client_id') || this.defaultGoogleClientId;
  },

  set googleClientId(val) {
    if (val && val.trim()) {
      localStorage.setItem('auraex_google_client_id', val.trim());
    } else {
      localStorage.removeItem('auraex_google_client_id');
    }
  },


  // Google OAuth Scopes
  googleScopes: 'email profile openid',

  // Real backend API endpoints
  apiEndpoints: {
    signIn: 'https://api.auraex.io/v1/auth/login',
    signUp: 'https://api.auraex.io/v1/auth/register',
    googleAuthCallback: 'https://api.auraex.io/v1/auth/google',
    resetPassword: 'https://api.auraex.io/v1/auth/forgot-password',
    verifySession: 'https://api.auraex.io/v1/auth/verify',
  },

  // Session storage keys
  sessionKey: 'auraex_authenticated_user'
};

/**
 * Decode Google Identity Services JWT credential token
 */
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('Could not parse Google JWT:', e);
    return null;
  }
}

/**
 * Initialize real Google Identity Services SDK if Client ID is configured
 */
export function initGoogleAuthSDK(callback) {
  const clientId = AUTH_CONFIG.googleClientId;

  if (clientId && window.google?.accounts?.id) {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: callback,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      return true;
    } catch (e) {
      console.warn('Google Identity initialization error:', e);
      return false;
    }
  }
  return false;
}

/**
 * Initialize Google OAuth2 Token Client for interactive popup account chooser
 */
export function initGoogleTokenClient(callback) {
  const clientId = AUTH_CONFIG.googleClientId;
  if (clientId && window.google?.accounts?.oauth2) {
    try {
      return window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: AUTH_CONFIG.googleScopes,
        callback: callback
      });
    } catch (e) {
      console.warn('Google Token Client initialization error:', e);
      return null;
    }
  }
  return null;
}


