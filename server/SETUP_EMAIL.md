# Email Setup Guide

## Problem
Emails are not being sent because SMTP credentials are not configured.

## Solution

### Step 1: Create `.env` file in the `server/` directory

Create a file named `.env` in the `server/` folder with the following content:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
ADMIN_EMAIL=r.smoker@gmail.com
FROM_EMAIL=noreply@skyesparty.com
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Step 2: Get Gmail App Password

If you're using Gmail, you **cannot** use your regular Gmail password. You need to create an **App Password**:

1. Go to your [Google Account](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", make sure **2-Step Verification** is enabled
   - If not enabled, enable it first (this is required for App Passwords)
4. Scroll down to **App passwords**
5. Click **App passwords**
6. Select **Mail** as the app and **Other (Custom name)** as the device
7. Enter a name like "Skye Party RSVP"
8. Click **Generate**
9. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
10. Use this password in your `.env` file as `SMTP_PASS` (remove the spaces)

### Step 3: Update Your `.env` File

Replace the placeholders in your `.env` file:

```env
SMTP_USER=r.smoker@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
ADMIN_EMAIL=r.smoker@gmail.com
```

**Important:** Remove spaces from the app password when adding it to `.env`:
```env
SMTP_PASS=abcdefghijklmnop
```

### Step 4: Restart the Server

After creating/updating the `.env` file, restart your server:

```bash
# Stop the current server (Ctrl+C if running in terminal)
# Then restart:
cd server
npm start
```

### Step 5: Verify Configuration

Run the verification script:

```bash
cd server
node verify-config.js
```

You should see:
- ✅ SMTP_USER: configured
- ✅ SMTP_PASS: configured
- ✅ Email sending is ENABLED

### Step 6: Test Email Sending

1. Submit a test RSVP through the form
2. Check your email at `r.smoker@gmail.com`
3. You should receive a notification email

## Alternative Email Providers

If you're not using Gmail, update the SMTP settings:

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### SendGrid (Recommended for Production)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## Troubleshooting

### "Invalid login" error
- Make sure you're using an App Password, not your regular password
- For Gmail, 2-Step Verification must be enabled

### "Connection timeout" error
- Check your firewall settings
- Try port 465 with `secure: true` (update email.js if needed)

### Emails still not sending
- Check server logs for error messages
- Verify `.env` file is in the `server/` directory
- Make sure server was restarted after creating `.env`
- Run `node verify-config.js` to check configuration

