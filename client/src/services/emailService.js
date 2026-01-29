import emailjs from '@emailjs/browser';

// EmailJS configuration
// Get these from https://dashboard.emailjs.com/admin
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'r.smoker@gmail.com';

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
  console.log('   To:', ADMIN_EMAIL);

  // Initialize EmailJS with public key
  emailjs.init(EMAILJS_PUBLIC_KEY);

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
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
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

