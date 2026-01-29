# EmailJS Setup Guide

This guide will help you set up EmailJS to send email notifications when someone submits an RSVP.

## What is EmailJS?

EmailJS allows you to send emails directly from your browser (frontend) without needing a backend server. It's perfect for static sites like GitHub Pages!

## Step 1: Create an EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** (it's free!)
3. Create an account with your email

## Step 2: Add an Email Service

1. After logging in, go to **"Email Services"** in the dashboard
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended - easiest to set up)
   - **Outlook**
   - **Yahoo**
   - Or any other SMTP service
4. Follow the instructions to connect your email account
5. **Copy the Service ID** (you'll need this later)

## Step 3: Create an Email Template

1. Go to **"Email Templates"** in the dashboard
2. Click **"Create New Template"**
3. Give it a name like "RSVP Notification"
4. Set the **Subject** to: `{{subject}}`
5. Set the **To Email** to: `r.smoker@gmail.com`
6. Set the **From Name** to: `{{from_name}}`
7. Set the **From Email** to: `{{from_email}}`

8. In the **Content** section, use this HTML template:

```html
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
      border-left: 4px solid #667eea;
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
        <p><strong>Name:</strong> {{from_name}}</p>
        <p><strong>Email:</strong> {{from_email}}</p>
        <p><strong>Child's Name:</strong> {{child_name}}</p>
        <p><strong>Status:</strong> {{going}}</p>
        <p><strong>Adults:</strong> {{num_adults}}</p>
        <p><strong>Kids:</strong> {{num_kids}}</p>
        <p><strong>Total People:</strong> {{total_people}}</p>
        <p><strong>Message:</strong> {{message}}</p>
        <p><strong>Submitted:</strong> {{submitted_at}}</p>
      </div>
    </div>
  </div>
</body>
</html>
```

9. Click **"Save"**
10. **Copy the Template ID** (you'll need this later)

## Step 4: Get Your Public Key

1. Go to **"Account"** → **"General"** in the dashboard
2. Find your **Public Key** (also called API Key)
3. **Copy the Public Key** (you'll need this later)

## Step 5: Configure the App

### For Local Development

Create a `.env` file in the `client/` directory with:

```env
REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id_here
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
REACT_APP_ADMIN_EMAIL=r.smoker@gmail.com
```

Replace the placeholder values with the actual IDs you copied:
- `your_service_id_here` → Your Email Service ID
- `your_template_id_here` → Your Email Template ID
- `your_public_key_here` → Your Public Key

### For Production (GitHub Pages)

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:
   - `REACT_APP_EMAILJS_SERVICE_ID` = your service ID
   - `REACT_APP_EMAILJS_TEMPLATE_ID` = your template ID
   - `REACT_APP_EMAILJS_PUBLIC_KEY` = your public key
   - `REACT_APP_ADMIN_EMAIL` = `r.smoker@gmail.com`

4. The GitHub Actions workflow will automatically use these during the build

## Step 6: Test It!

1. Restart your development server (if running locally):
   ```bash
   cd client
   npm start
   ```

2. Submit a test RSVP through the form
3. Check your email at `r.smoker@gmail.com`
4. You should receive a notification email! 🎉

## Troubleshooting

### Email not sending?

1. **Check the browser console** for any error messages
2. **Verify your EmailJS credentials** are correct in `.env` or GitHub Secrets
3. **Check EmailJS dashboard** → **Logs** to see if emails are being sent
4. **Make sure your email service is connected** in EmailJS dashboard

### "EmailJS not configured" warning?

- Make sure all three environment variables are set:
  - `REACT_APP_EMAILJS_SERVICE_ID`
  - `REACT_APP_EMAILJS_TEMPLATE_ID`
  - `REACT_APP_EMAILJS_PUBLIC_KEY`

### Free Tier Limits

EmailJS free tier includes:
- 200 emails per month
- Perfect for a birthday party RSVP system!

If you need more, you can upgrade to a paid plan.

## That's It! 🎉

Your RSVP system will now send email notifications to `r.smoker@gmail.com` whenever someone submits an RSVP!

