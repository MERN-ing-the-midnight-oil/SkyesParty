const nodemailer = require('nodemailer');

// Create transporter
// For production, configure with your email service (Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// If no SMTP credentials, use a mock transporter for development
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('⚠️  No SMTP credentials found. Email sending will be mocked.');
  console.warn('   Set SMTP_USER and SMTP_PASS in .env file to enable real email sending.');
}

const sendMagicLink = async (email, magicLink) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@skyesparty.com',
    to: email,
    subject: "RSVP for Skye's 4th Birthday Party! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Skye's 4th Birthday Party! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi there!</p>
              <p>You're invited to Skye's 4th birthday party! We'd love to know if you can make it.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>📅 Date:</strong> Saturday, March 22nd, 2026</p>
                <p style="margin: 10px 0;"><strong>⏰ Time:</strong> 10:30 AM - 12:30 PM</p>
                <p style="margin: 10px 0;"><strong>📍 Location:</strong> Arne Hanna Aquatic Center, Bellingham WA</p>
              </div>

              <p><strong>🏊 Pool Safety Reminder:</strong> All swimmers under 7 years old must be within arm's reach of a parent while in the pool.</p>
              
              <p>Please RSVP so we can plan for pizza and cupcakes! 🍕🧁</p>
              
              <p>Click the button below to RSVP:</p>
              <div style="text-align: center;">
                <a href="${magicLink}" class="button">RSVP Now</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${magicLink}</p>
              
              <p>We can't wait to celebrate with you!</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      RSVP for Skye's 4th Birthday Party!
      
      Hi there!
      
      You're invited to Skye's 4th birthday party! We'd love to know if you can make it.
      
      Date: Saturday, March 22nd, 2026
      Time: 10:30 AM - 12:30 PM
      Location: Arne Hanna Aquatic Center, Bellingham WA
      
      Pool Safety Reminder: All swimmers under 7 years old must be within arm's reach of a parent while in the pool.
      
      Please RSVP so we can plan for pizza and cupcakes!
      
      Click this link to RSVP: ${magicLink}
      
      We can't wait to celebrate with you!
    `
  };

  // If no SMTP credentials, just log the email
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n📧 MOCK EMAIL (SMTP not configured):');
    console.log('To:', email);
    console.log('Subject:', mailOptions.subject);
    console.log('Magic Link:', magicLink);
    console.log('');
    return Promise.resolve();
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendRSVPNotification = async (rsvpData) => {
  const adminUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin`;
  const adminEmail = process.env.ADMIN_EMAIL || 'r.smoker@gmail.com';

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@skyesparty.com',
    to: adminEmail,
    subject: `🎉 New RSVP for Skye's Party! ${rsvpData.going ? '✅ Going' : '❌ Not Going'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .rsvp-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid ${rsvpData.going ? '#28a745' : '#dc3545'};
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .admin-reminder {
              background: #fff3cd;
              border: 2px solid #ffc107;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New RSVP Received! 🎉</h1>
            </div>
            <div class="content">
              <p>Someone just submitted an RSVP for Skye's 4th Birthday Party!</p>
              
              <div class="rsvp-details">
                <p><strong>Name:</strong> ${rsvpData.name || 'Not provided'}</p>
                ${rsvpData.child_name ? `<p><strong>Child's Name:</strong> ${rsvpData.child_name}</p>` : ''}
                <p><strong>Email:</strong> ${rsvpData.email || 'Not provided'}</p>
                <p><strong>Status:</strong> <span style="color: ${rsvpData.going ? '#28a745' : '#dc3545'}; font-weight: bold;">
                  ${rsvpData.going ? '✅ Going!' : '❌ Not Going'}
                </span></p>
                ${rsvpData.going ? `
                  <p><strong>Adults:</strong> ${rsvpData.num_adults || 0}</p>
                  <p><strong>Kids:</strong> ${rsvpData.num_kids || 0}</p>
                  <p><strong>Total People:</strong> ${(rsvpData.num_adults || 0) + (rsvpData.num_kids || 0)}</p>
                ` : ''}
                ${rsvpData.message ? `
                  <p><strong>Message:</strong></p>
                  <p style="background: #f9f9f9; padding: 12px; border-radius: 6px; white-space: pre-wrap;">${rsvpData.message}</p>
                ` : ''}
                <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}</p>
              </div>

              <div class="admin-reminder">
                <p><strong>📊 View All RSVPs:</strong></p>
                <p>Check the admin dashboard to see all responses and plan for pizza and cupcakes!</p>
                <div style="text-align: center; margin: 15px 0;">
                  <a href="${adminUrl}" class="button">View Admin Dashboard</a>
                </div>
                <p style="font-size: 0.9rem; margin-top: 10px;">
                  Or visit: <a href="${adminUrl}" style="word-break: break-all; color: #667eea;">${adminUrl}</a>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      New RSVP for Skye's 4th Birthday Party!
      
      Someone just submitted an RSVP!
      
      Name: ${rsvpData.name || 'Not provided'}
      ${rsvpData.child_name ? `Child's Name: ${rsvpData.child_name}\n` : ''}Email: ${rsvpData.email || 'Not provided'}
      Status: ${rsvpData.going ? '✅ Going!' : '❌ Not Going'}
      ${rsvpData.going ? `
      Adults: ${rsvpData.num_adults || 0}
      Kids: ${rsvpData.num_kids || 0}
      Total People: ${(rsvpData.num_adults || 0) + (rsvpData.num_kids || 0)}
      ` : ''}
      ${rsvpData.message ? `
      Message: ${rsvpData.message}
      ` : ''}
      Submitted: ${new Date().toLocaleString()}
      
      📊 View All RSVPs:
      Check the admin dashboard to see all responses and plan for pizza and cupcakes!
      
      Admin Dashboard: ${adminUrl}
    `
  };

  // If no SMTP credentials, just log the email
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n📧 MOCK RSVP NOTIFICATION (SMTP not configured):');
    console.log('To:', adminEmail);
    console.log('Subject:', mailOptions.subject);
    console.log('RSVP Details:', rsvpData);
    console.log('Admin URL:', adminUrl);
    console.log('');
    return Promise.resolve();
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('RSVP notification sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending RSVP notification:', error);
    // Don't throw - we don't want RSVP submission to fail if email fails
    return null;
  }
};

module.exports = {
  sendMagicLink,
  sendRSVPNotification
};

