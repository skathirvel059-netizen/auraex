/**
 * VERCEL SERVERLESS NOTIFICATION FUNCTION
 * Route: POST /api/notify
 * Dispatches notifications to auraexbeta@gmail.com
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const TARGET_EMAIL = 'auraexbeta@gmail.com';
  const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${TARGET_EMAIL}`;

  try {
    const body = req.body || {};
    
    // Dispatch to FormSubmit
    const response = await fetch(FORMSUBMIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': req.headers.origin || 'https://auraex-beta.vercel.app'
      },
      body: JSON.stringify({
        _subject: body._subject || `[Auraex Alert] Notification from ${body.name || body.user_name || 'Visitor'}`,
        _template: 'table',
        _captcha: 'false',
        ...body
      })
    });

    const result = await response.json();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('[API /api/notify Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
