/**
 * AURAEX REAL-TIME EMAIL & NOTIFICATION DISPATCHER
 * -------------------------------------------------------------
 * Dispatches instant notifications directly to auraexbeta@gmail.com
 * whenever:
 *  1. A visitor/client submits a Contact or Collaboration inquiry.
 *  2. Any user signs in or creates an account on Auraex.
 */

const TARGET_NOTIFICATION_EMAIL = 'auraexbeta@gmail.com';
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${TARGET_NOTIFICATION_EMAIL}`;

/**
 * Dispatches an instant email alert when a contact/collaboration brief is submitted.
 * @param {Object} inquiry
 * @param {string} inquiry.name
 * @param {string} inquiry.email
 * @param {string} [inquiry.org]
 * @param {string} [inquiry.budget]
 * @param {string[]|string} inquiry.services
 * @param {string} inquiry.message
 */
export async function sendContactNotification({ name, email, org, budget, services, message }) {
  const formattedServices = Array.isArray(services) ? services.join(', ') : (services || 'General Inquiry');
  const now = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const payload = {
    _subject: `[Auraex Collab Brief] Inquiry from ${name} (${org || 'Direct Partner'})`,
    _template: 'table',
    _captcha: 'false',
    client_name: name,
    client_work_email: email,
    organization: org || 'Not specified',
    estimated_budget: budget || 'Not specified',
    strategic_services: formattedServices,
    message_brief: message,
    timestamp: now,
    origin_url: window.location.origin
  };

  try {
    const response = await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.warn('[Auraex Mailer] FormSubmit primary dispatch fallback note:', error);
    // Attempt fallback to Vercel API endpoint if present
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', ...payload })
      });
    } catch (e) {
      // Non-blocking fallback
    }
    return { success: false, error: error.message };
  }
}

/**
 * Dispatches an instant email notification when any user signs in.
 * @param {Object} user
 * @param {string} user.name
 * @param {string} user.email
 * @param {string} [user.authMethod]
 */
export async function sendLoginNotification({ name, email, authMethod }) {
  // Prevent duplicate dispatch spam within a short window for same user
  const dedupKey = `auraex_notified_login_${email}`;
  const lastSent = sessionStorage.getItem(dedupKey);
  if (lastSent && (Date.now() - parseInt(lastSent, 10)) < 30000) {
    return { success: true, skipped: 'deduplicated' };
  }
  sessionStorage.setItem(dedupKey, Date.now().toString());

  const now = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const payload = {
    _subject: `[Auraex Login Alert] ${name || 'User'} signed in (${email})`,
    _template: 'table',
    _captcha: 'false',
    user_name: name || 'User',
    user_email: email,
    auth_method: authMethod || 'Standard Auth',
    login_time: now,
    user_agent: navigator.userAgent,
    origin_url: window.location.origin
  };

  try {
    const response = await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.warn('[Auraex Mailer] Login alert dispatch note:', error);
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'login', ...payload })
      });
    } catch (e) {}
    return { success: false, error: error.message };
  }
}
