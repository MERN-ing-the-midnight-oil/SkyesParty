import emailjs from '@emailjs/browser';

// EmailJS configuration
// Get these from https://dashboard.emailjs.com/admin
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_BULK_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_BULK_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'r.smoker@gmail.com';

/** Delay between EmailJS calls to reduce rate-limit issues when messaging many guests */
const BULK_SEND_DELAY_MS = 400;

/**
 * True when EmailJS is configured for admin → guest messages (separate template from RSVP notifications).
 * Create a template in EmailJS with To = {{to_email}}, and use params: to_email, to_name, subject, message, reply_to (optional).
 */
export const isBulkEmailConfigured = () =>
  Boolean(
    EMAILJS_SERVICE_ID &&
      EMAILJS_BULK_TEMPLATE_ID &&
      EMAILJS_PUBLIC_KEY
  );

/**
 * Send RSVP notification email using EmailJS
 * @param {Object} rsvpData - The RSVP data to send
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendRSVPNotification = async (rsvpData) => {
  // Check if EmailJS is configured
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('⚠️ EmailJS not configured. Email notification skipped.');
    console.warn('   Service ID:', EMAILJS_SERVICE_ID || 'MISSING');
    console.warn('   Template ID:', EMAILJS_TEMPLATE_ID || 'MISSING');
    console.warn('   Public Key:', EMAILJS_PUBLIC_KEY ? 'SET' : 'MISSING');
    console.warn('   Set REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TEMPLATE_ID, and REACT_APP_EMAILJS_PUBLIC_KEY');
    return Promise.resolve(); // Don't fail the RSVP submission if email isn't configured
  }

  console.log('📧 Attempting to send RSVP notification email...');
  console.log('   Service ID:', EMAILJS_SERVICE_ID);
  console.log('   Template ID:', EMAILJS_TEMPLATE_ID);
  console.log('   Public Key:', EMAILJS_PUBLIC_KEY);
  console.log('   To:', ADMIN_EMAIL);

  // Initialize EmailJS with public key (only once, but we'll do it each time to be safe)
  // In newer versions, this might not be needed, but it doesn't hurt
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } catch (initError) {
    console.warn('EmailJS init warning (may be normal):', initError);
  }

  // Prepare email template parameters
  const templateParams = {
    to_email: ADMIN_EMAIL,
    to_name: 'Rhys',
    from_name: rsvpData.name || 'Guest',
    from_email: rsvpData.email || 'No email provided',
    child_name: rsvpData.child_name || 'N/A',
    going: rsvpData.going ? 'Yes, going! 🎉' : 'No, cannot attend',
    num_adults: rsvpData.num_adults || 0,
    num_kids: rsvpData.num_kids || 0,
    total_people: (rsvpData.num_adults || 0) + (rsvpData.num_kids || 0),
    message: rsvpData.message || 'No message',
    submitted_at: new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }),
    subject: `🎉 New RSVP for Skye's Party! ${rsvpData.going ? '✅ Going' : '❌ Not Going'}`,
  };

  try {
    console.log('📤 Sending email with template params:', templateParams);
    // Try sending with public key as 4th parameter (newer API)
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY  // Pass public key as 4th parameter
    );
    console.log('✅ RSVP notification email sent successfully!');
    console.log('   Response:', response);
    console.log('   Status:', response.status);
    console.log('   Text:', response.text);
    return response;
  } catch (error) {
    console.error('❌ Error sending RSVP notification email:');
    console.error('   Error object:', error);
    console.error('   Error message:', error.text || error.message);
    console.error('   Status:', error.status);
    // Don't throw - we don't want RSVP submission to fail if email fails
    return null;
  }
};

/**
 * Send one email per guest via EmailJS (bulk / attendee template).
 * @param {Array<{ email: string, name?: string }>} recipients
 * @param {string} subject
 * @param {string} message - Plain text body (shown in template as {{message}})
 * @param {(progress: { current: number, total: number }) => void} [onProgress]
 * @returns {Promise<{ sent: string[], failed: { email: string, error: string }[] }>}
 */
export const sendBulkAttendeeEmails = async (recipients, subject, message, onProgress) => {
  const result = { sent: [], failed: [] };

  if (!isBulkEmailConfigured()) {
    console.warn('Bulk EmailJS not configured. Set REACT_APP_EMAILJS_BULK_TEMPLATE_ID (and service/public key).');
    return result;
  }

  const trimmedSubject = (subject || '').trim();
  const trimmedMessage = (message || '').trim();
  if (!trimmedSubject || !trimmedMessage) {
    return result;
  }

  const list = recipients
    .map((r) => ({
      email: (r.email || '').trim(),
      name: (r.name || '').trim() || 'there',
    }))
    .filter((r) => r.email);

  if (list.length === 0) {
    return result;
  }

  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } catch (initError) {
    console.warn('EmailJS init warning (may be normal):', initError);
  }

  const total = list.length;
  for (let i = 0; i < list.length; i++) {
    const { email, name } = list[i];
    if (typeof onProgress === 'function') {
      onProgress({ current: i + 1, total });
    }

    const templateParams = {
      to_email: email,
      to_name: name,
      subject: trimmedSubject,
      message: trimmedMessage,
      reply_to: ADMIN_EMAIL,
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_BULK_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      result.sent.push(email);
    } catch (error) {
      const errText =
        error?.text || error?.message || String(error);
      result.failed.push({ email, error: errText });
      console.error('Bulk email failed for', email, error);
    }

    if (i < list.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, BULK_SEND_DELAY_MS));
    }
  }

  if (typeof onProgress === 'function') {
    onProgress({ current: total, total });
  }

  return result;
};

