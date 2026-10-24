/**
 * AURAEX AUTHENTICATION CONTROLLER
 * -------------------------------------------------------------
 * Manages the first-screen sign-in experience, account creation,
 * Supabase Auth (PostgreSQL backend), Google OAuth 2.0 GIS,
 * session persistence, sign-out switching, and password recovery.
 */

import { AUTH_CONFIG, parseJwt, initGoogleAuthSDK, initGoogleTokenClient } from './auth-config.js';
import { getSupabase, SUPABASE_CONFIG, recordUserLogin } from './supabase-client.js';
import { sendLoginNotification } from './mailer.js';
import { showToast } from './toast.js';

export function initAuth() {
  const authWrapper = document.getElementById('auth-view');
  const mainSite = document.getElementById('main-site');
  const authTabs = document.querySelectorAll('.auth-tab-btn');
  const authForm = document.getElementById('auth-form');
  const submitBtn = document.getElementById('auth-submit-btn');
  const googleBtn = document.getElementById('btn-google-auth');
  const googleBtnContainer = document.getElementById('google-btn-container');
  const guestBtn = document.getElementById('btn-guest-access');
  const forgotLink = document.getElementById('auth-forgot-link');
  const forgotModal = document.getElementById('forgot-modal');
  const forgotClose = document.getElementById('forgot-modal-close');
  const forgotForm = document.getElementById('forgot-form');
  const navAccountPill = document.getElementById('nav-account-pill');
  const navAccountText = document.getElementById('nav-account-text');
  const navSignoutBtn = document.getElementById('nav-signout-btn');
  const mobileAccountBtn = document.getElementById('mobile-account-btn');
  const mobileSignoutBtn = document.getElementById('mobile-signout-btn');

  // Active Session Banner elements
  const activeSessionBanner = document.getElementById('active-session-banner');
  const activeSessionName = document.getElementById('active-session-name');
  const activeSessionEmail = document.getElementById('active-session-email');
  const activeSessionAvatar = document.getElementById('active-session-avatar');
  const btnSessionEnter = document.getElementById('btn-session-enter');
  const btnSessionLogout = document.getElementById('btn-session-logout');

  // Google Modal elements
  const googleAuthModal = document.getElementById('google-auth-modal');
  const googleModalClose = document.getElementById('google-modal-close');
  const googleAuthForm = document.getElementById('google-auth-form');
  const googleInputEmail = document.getElementById('google-input-email');
  const googleInputName = document.getElementById('google-input-name');
  const googleCustomClientId = document.getElementById('google-custom-client-id');
  const btnSaveGoogleClientId = document.getElementById('btn-save-google-client-id');
  const btnClearGoogleClientId = document.getElementById('btn-clear-google-client-id');

  // Supabase connection elements
  const supabaseUrlInput = document.getElementById('supabase-url-input');
  const supabaseKeyInput = document.getElementById('supabase-key-input');
  const btnSaveSupabase = document.getElementById('btn-save-supabase');
  const btnClearSupabase = document.getElementById('btn-clear-supabase');

  // Input elements
  const nameGroup = document.getElementById('auth-name-group');
  const nameInput = document.getElementById('auth-name');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const togglePassBtn = document.getElementById('toggle-password-btn');
  const authRemember = document.getElementById('auth-remember');

  let currentMode = 'signin'; // 'signin' or 'signup'
  let tokenClient = null;

  // Supabase Auth Integration
  initSupabaseAuthListener();

  // Initialize Google Identity Services (handles both immediate load and async load)
  if (window.google?.accounts) {
    setupGoogleIdentityServices();
  } else {
    let attempts = 0;
    const checkGisInterval = setInterval(() => {
      attempts++;
      if (window.google?.accounts) {
        clearInterval(checkGisInterval);
        setupGoogleIdentityServices();
      } else if (attempts > 25) {
        clearInterval(checkGisInterval);
        if (googleBtn) googleBtn.style.display = 'flex';
      }
    }, 200);
  }

  // Check for active session
  const storedUser = getActiveSession();
  if (storedUser) {
    updateNavUser(storedUser);
    updateActiveSessionBanner(storedUser);

    if (window.location.hash === '#auth') {
      showAuthView();
    } else {
      hideAuthView(false);
    }
  } else {
    showAuthView();
    if (activeSessionBanner) activeSessionBanner.style.display = 'none';
    if (navSignoutBtn) navSignoutBtn.style.display = 'none';
    if (mobileSignoutBtn) mobileSignoutBtn.style.display = 'none';
  }

  // Tab switching: Sign In vs Create Account
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMode = tab.dataset.mode;

      if (currentMode === 'signup') {
        nameGroup.style.display = 'flex';
        nameInput.setAttribute('required', 'required');
        submitBtn.textContent = 'Create Auraex Account';
        document.getElementById('auth-form-title').textContent = 'Join Auraex Network';
        document.getElementById('auth-form-subtitle').textContent = 'Access engineering dashboards, IoT telemetry, and global trade corridors.';
      } else {
        nameGroup.style.display = 'none';
        nameInput.removeAttribute('required');
        submitBtn.textContent = 'Sign In to Auraex';
        document.getElementById('auth-form-title').textContent = 'Welcome Back';
        document.getElementById('auth-form-subtitle').textContent = 'Enter your credentials to access your Auraex systems workspace.';
      }
      clearErrors();
    });
  });

  // Password visibility toggle
  if (togglePassBtn) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPass ? 'text' : 'password');
      togglePassBtn.textContent = isPass ? '🔒' : '👁️';
    });
  }

  // Handle Standard Form Submit (Email & Password with Supabase or Local)
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const name = nameInput?.value.trim() || 'Auraex Partner';

      let isValid = true;

      if (!validateEmail(email)) {
        showError(emailInput, 'Please enter a valid work or personal email address.');
        isValid = false;
      }

      if (password.length < 6) {
        showError(passwordInput, 'Password must be at least 6 characters.');
        isValid = false;
      }

      if (currentMode === 'signup' && name.length < 2) {
        showError(nameInput, 'Please enter your full name or company name.');
        isValid = false;
      }

      if (!isValid) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating...';

      const supabase = getSupabase();
      if (supabase) {
        try {
          if (currentMode === 'signup') {
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { full_name: name }
              }
            });
            if (error) {
              showToast('Sign Up Failed', error.message, 'warning');
              submitBtn.disabled = false;
              submitBtn.textContent = 'Create Auraex Account';
              return;
            }
            const userObj = {
              name: name,
              email: email,
              method: 'supabase-auth',
              signedInAt: new Date().toISOString()
            };
            saveUserSession(userObj, authRemember ? authRemember.checked : true);
            showToast('Account Created', `Welcome to Auraex, ${userObj.name}!`, 'success');
            hideAuthView(true);
          } else {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            if (error) {
              showToast('Sign In Failed', error.message, 'warning');
              submitBtn.disabled = false;
              submitBtn.textContent = 'Sign In to Auraex';
              return;
            }
            const userObj = {
              name: data.user.user_metadata?.full_name || email.split('@')[0],
              email: email,
              method: 'supabase-auth',
              signedInAt: new Date().toISOString()
            };
            saveUserSession(userObj, authRemember ? authRemember.checked : true);
            showToast('Authentication Successful', `Welcome back, ${userObj.name}!`, 'success');
            hideAuthView(true);
          }
        } catch (err) {
          showToast('Connection Error', err.message, 'warning');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = currentMode === 'signup' ? 'Create Auraex Account' : 'Sign In to Auraex';
        }
      } else {
        // Local / Prototype simulation
        setTimeout(() => {
          const userObj = {
            name: currentMode === 'signup' ? name : (email.split('@')[0] || 'User'),
            email: email,
            method: 'email-password',
            signedInAt: new Date().toISOString()
          };

          const remember = authRemember ? authRemember.checked : true;
          saveUserSession(userObj, remember);

          submitBtn.disabled = false;
          submitBtn.textContent = currentMode === 'signup' ? 'Create Auraex Account' : 'Sign In to Auraex';

          showToast(
            currentMode === 'signup' ? 'Account Created' : 'Authentication Successful',
            `Welcome to Auraex, ${userObj.name}!`,
            'success'
          );

          hideAuthView(true);
        }, 600);
      }
    });
  }

  // Google OAuth Button Handler
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      const supabase = getSupabase();
      if (supabase) {
        // Trigger Supabase Google OAuth
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) {
          showToast('Supabase OAuth Error', error.message, 'warning');
        }
        return;
      }

      if (tokenClient) {
        // Trigger Google OAuth 2.0 popup account chooser
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } else if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            openGoogleModal();
          }
        });
      } else {
        openGoogleModal();
      }
    });
  }

  // Google Auth Modal submission
  if (googleAuthForm) {
    googleAuthForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = googleInputEmail.value.trim();
      const name = googleInputName?.value.trim() || email.split('@')[0] || 'Google User';

      if (!validateEmail(email)) {
        showToast('Invalid Email', 'Please enter a valid Google email address.', 'warning');
        return;
      }

      const googleUser = {
        name: name,
        email: email,
        avatar: 'G',
        method: 'google-oauth',
        signedInAt: new Date().toISOString()
      };

      const remember = authRemember ? authRemember.checked : true;
      saveUserSession(googleUser, remember);

      if (googleAuthModal) googleAuthModal.classList.remove('open');

      showToast(
        'Google Authentication Successful',
        `Signed in as ${googleUser.email}`,
        'success'
      );

      hideAuthView(true);
    });
  }

  // Google Client ID configuration buttons in modal
  if (btnSaveGoogleClientId) {
    btnSaveGoogleClientId.addEventListener('click', () => {
      const customId = googleCustomClientId?.value.trim();
      if (!customId) {
        showToast('Client ID Required', 'Please enter a valid Google OAuth Client ID.', 'warning');
        return;
      }

      AUTH_CONFIG.googleClientId = customId;
      showToast('Client ID Saved', 'Google OAuth 2.0 Client ID configured.', 'success');
      setupGoogleIdentityServices();
    });
  }

  if (btnClearGoogleClientId) {
    btnClearGoogleClientId.addEventListener('click', () => {
      AUTH_CONFIG.googleClientId = '';
      if (googleCustomClientId) googleCustomClientId.value = '';
      showToast('Reset Complete', 'Default Client ID restored.', 'info');
      setupGoogleIdentityServices();
    });
  }

  // Supabase Configuration buttons in modal
  if (btnSaveSupabase) {
    btnSaveSupabase.addEventListener('click', () => {
      const url = supabaseUrlInput?.value.trim();
      const key = supabaseKeyInput?.value.trim();

      if (!url || !key) {
        showToast('Credentials Required', 'Please provide both Supabase Project URL and Anon Key.', 'warning');
        return;
      }

      SUPABASE_CONFIG.url = url;
      SUPABASE_CONFIG.anonKey = key;

      const supabase = getSupabase();
      if (supabase) {
        showToast('Supabase Connected', 'Database and Auth client initialized successfully.', 'success');
        initSupabaseAuthListener();
      } else {
        showToast('Configuration Warning', 'Please verify your Supabase URL format.', 'warning');
      }
    });
  }

  if (btnClearSupabase) {
    btnClearSupabase.addEventListener('click', () => {
      SUPABASE_CONFIG.url = '';
      SUPABASE_CONFIG.anonKey = '';
      if (supabaseUrlInput) supabaseUrlInput.value = '';
      if (supabaseKeyInput) supabaseKeyInput.value = '';
      showToast('Supabase Reset', 'Cleared saved Supabase configuration.', 'info');
    });
  }

  if (googleModalClose && googleAuthModal) {
    googleModalClose.addEventListener('click', () => {
      googleAuthModal.classList.remove('open');
    });

    googleAuthModal.addEventListener('click', (e) => {
      if (e.target === googleAuthModal) {
        googleAuthModal.classList.remove('open');
      }
    });
  }

  // Active Session Banner Enter / Logout handlers
  if (btnSessionEnter) {
    btnSessionEnter.addEventListener('click', () => {
      hideAuthView(true);
    });
  }

  if (btnSessionLogout) {
    btnSessionLogout.addEventListener('click', () => {
      logoutUser();
    });
  }

  // Continue as Guest
  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      const guestUser = {
        name: 'Guest Explorer',
        email: 'guest@auraex.io',
        method: 'guest',
        signedInAt: new Date().toISOString()
      };
      saveUserSession(guestUser, false);
      showToast('Guest Session Started', 'Exploring Auraex in preview mode.', 'info');
      hideAuthView(true);
    });
  }

  // Forgot Password modal triggers
  if (forgotLink && forgotModal) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      forgotModal.classList.add('open');
      const forgotEmail = document.getElementById('forgot-email');
      if (forgotEmail && emailInput.value) {
        forgotEmail.value = emailInput.value;
      }
    });
  }

  if (forgotClose && forgotModal) {
    forgotClose.addEventListener('click', () => {
      forgotModal.classList.remove('open');
    });

    forgotModal.addEventListener('click', (e) => {
      if (e.target === forgotModal) {
        forgotModal.classList.remove('open');
      }
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const resetEmail = document.getElementById('forgot-email').value.trim();
      if (!validateEmail(resetEmail)) {
        showToast('Invalid Email', 'Please provide a valid email address.', 'warning');
        return;
      }

      const supabase = getSupabase();
      if (supabase) {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: window.location.origin
          });
          if (error) {
            showToast('Reset Error', error.message, 'warning');
            return;
          }
          showToast('Reset Dispatched', `Password reset instructions sent to ${resetEmail}. Check your inbox.`, 'success');
        } catch (err) {
          showToast('Reset Error', err.message, 'warning');
        }
      } else {
        showToast('Reset Link Dispatched', `Simulated recovery link sent to ${resetEmail}. Check your inbox.`, 'success');
      }
      forgotModal.classList.remove('open');
    });
  }

  // Navbar Account Pill: toggle Auth View
  if (navAccountPill) {
    navAccountPill.addEventListener('click', () => {
      const user = getActiveSession();
      if (user) {
        updateActiveSessionBanner(user);
      }
      showAuthView();
    });
  }

  // Navbar explicit Sign Out button
  if (navSignoutBtn) {
    navSignoutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      logoutUser();
    });
  }

  // Mobile drawer Account and Sign Out buttons
  if (mobileAccountBtn) {
    mobileAccountBtn.addEventListener('click', () => {
      closeMobileDrawer();
      const user = getActiveSession();
      if (user) {
        updateActiveSessionBanner(user);
      }
      showAuthView();
    });
  }

  if (mobileSignoutBtn) {
    mobileSignoutBtn.addEventListener('click', () => {
      closeMobileDrawer();
      logoutUser();
    });
  }

  // --- Helper Functions ---

  function openGoogleModal() {
    if (googleAuthModal) {
      if (googleCustomClientId) {
        googleCustomClientId.value = AUTH_CONFIG.googleClientId;
      }
      if (supabaseUrlInput) {
        supabaseUrlInput.value = SUPABASE_CONFIG.url;
      }
      if (supabaseKeyInput) {
        supabaseKeyInput.value = SUPABASE_CONFIG.anonKey;
      }
      googleAuthModal.classList.add('open');
      if (googleInputEmail) {
        googleInputEmail.focus();
      }
    }
  }

  function initSupabaseAuthListener() {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const userObj = {
            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            email: session.user.email,
            avatar: session.user.user_metadata?.avatar_url || 'G',
            method: 'supabase-auth',
            signedInAt: new Date().toISOString()
          };
          saveUserSession(userObj, true);
          hideAuthView(true);
        } else if (event === 'SIGNED_OUT') {
          logoutUser(false);
        }
      });
    } catch (e) {
      console.warn('Supabase auth state listener error:', e);
    }
  }

  function setupGoogleIdentityServices() {
    initGoogleAuthSDK((response) => {
      const payload = parseJwt(response.credential);
      if (payload) {
        const googleUser = {
          name: payload.name || payload.email.split('@')[0],
          email: payload.email,
          avatar: payload.picture,
          method: 'google-oauth',
          signedInAt: new Date().toISOString()
        };
        const remember = authRemember ? authRemember.checked : true;
        saveUserSession(googleUser, remember);
        showToast('Google Sign-In Successful', `Welcome, ${googleUser.name}!`, 'success');
        hideAuthView(true);
      }
    });

    if (googleBtnContainer && window.google?.accounts?.id) {
      try {
        googleBtnContainer.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainer, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: 340
        });
        if (googleBtn) googleBtn.style.display = 'none';
      } catch (e) {
        if (googleBtn) googleBtn.style.display = 'flex';
      }
    } else {
      if (googleBtn) googleBtn.style.display = 'flex';
    }

    tokenClient = initGoogleTokenClient(async (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          });
          const profile = await res.json();
          if (profile && profile.email) {
            const googleUser = {
              name: profile.name || profile.email.split('@')[0],
              email: profile.email,
              avatar: profile.picture,
              method: 'google-oauth',
              signedInAt: new Date().toISOString()
            };
            const remember = authRemember ? authRemember.checked : true;
            saveUserSession(googleUser, remember);
            showToast('Google Sign-In Successful', `Welcome, ${googleUser.name}!`, 'success');
            hideAuthView(true);
          }
        } catch (err) {
          console.warn('Failed to fetch userinfo from Google:', err);
        }
      }
    });
  }

  function getActiveSession() {
    try {
      const raw = localStorage.getItem(AUTH_CONFIG.sessionKey) || sessionStorage.getItem(AUTH_CONFIG.sessionKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveUserSession(user, remember = true) {
    const serialized = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(AUTH_CONFIG.sessionKey, serialized);
    } else {
      sessionStorage.setItem(AUTH_CONFIG.sessionKey, serialized);
      localStorage.removeItem(AUTH_CONFIG.sessionKey);
    }
    updateNavUser(user);
    updateActiveSessionBanner(user);

    // Sync to Supabase user_logins table and dispatch real-time email to auraexbeta@gmail.com
    if (user && user.email) {
      recordUserLogin({
        name: user.name,
        email: user.email,
        authMethod: user.method || 'Standard Auth'
      });
      sendLoginNotification({
        name: user.name,
        email: user.email,
        authMethod: user.method || 'Standard Auth'
      });
    }
  }

  async function logoutUser(notifySupabase = true) {
    if (notifySupabase) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          // ignore signout errors
        }
      }
    }

    localStorage.removeItem(AUTH_CONFIG.sessionKey);
    sessionStorage.removeItem(AUTH_CONFIG.sessionKey);

    if (navAccountText) navAccountText.textContent = 'Sign In / Switch';
    if (navSignoutBtn) navSignoutBtn.style.display = 'none';
    if (mobileSignoutBtn) mobileSignoutBtn.style.display = 'none';
    if (activeSessionBanner) activeSessionBanner.style.display = 'none';

    clearErrors();
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (nameInput) nameInput.value = '';

    showAuthView();
    showToast('Signed Out', 'You have been disconnected from the session.', 'info');
  }

  function updateNavUser(user) {
    if (navAccountText) {
      navAccountText.textContent = user.name || user.email;
    }
    if (navSignoutBtn) {
      navSignoutBtn.style.display = 'inline-flex';
    }
    if (mobileSignoutBtn) {
      mobileSignoutBtn.style.display = 'block';
    }
  }

  function updateActiveSessionBanner(user) {
    if (!activeSessionBanner) return;
    activeSessionBanner.style.display = 'flex';
    if (activeSessionName) {
      activeSessionName.textContent = user.name || 'Authenticated User';
    }
    if (activeSessionEmail) {
      activeSessionEmail.textContent = user.email || 'No email attached';
    }
    if (activeSessionAvatar) {
      if (user.avatar && user.avatar.startsWith('http')) {
        activeSessionAvatar.innerHTML = `<img src="${user.avatar}" alt="Avatar" />`;
      } else {
        activeSessionAvatar.textContent = (user.name ? user.name[0] : 'U').toUpperCase();
      }
    }
  }

  function hideAuthView(scrollHero = true) {
    authWrapper.classList.add('hidden');
    document.body.style.overflow = 'auto';
    if (scrollHero) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function showAuthView() {
    authWrapper.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-drawer-overlay');
    const toggle = document.getElementById('mobile-toggle');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    if (toggle) toggle.classList.remove('open');
    document.body.style.overflow = '';
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(inputEl, msg) {
    inputEl.classList.add('is-invalid');
    const group = inputEl.closest('.form-group');
    if (group) {
      let errEl = group.querySelector('.form-error-msg');
      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.add('visible');
      }
    }
  }

  function clearErrors() {
    document.querySelectorAll('.form-input').forEach(i => i.classList.remove('is-invalid'));
    document.querySelectorAll('.form-error-msg').forEach(e => {
      e.textContent = '';
      e.classList.remove('visible');
    });
  }
}
