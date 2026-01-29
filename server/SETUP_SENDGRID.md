# Easy Email Setup with SendGrid (No App Password Needed!)

## Why SendGrid?

You're right - you shouldn't need an app password just to **receive** emails! The app password is only needed to **send** emails through Gmail's SMTP server.

**SendGrid is easier** because:
- ✅ Free tier: 100 emails/day forever (perfect for RSVPs!)
- ✅ No app password needed - just an API key
- ✅ Simple setup - takes 2 minutes
- ✅ More reliable for automated emails
- ✅ You still receive emails at r.smoker@gmail.com normally

## Quick Setup (2 minutes)

### Step 1: Sign up for SendGrid (Free)

1. Go to https://signup.sendgrid.com/
2. Sign up for a free account (no credit card needed)
3. Verify your email address

### Step 2: Create an API Key

1. Once logged in, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it "Skye Party RSVP"
4. Select **Full Access** (or just "Mail Send" permissions)
5. Click **Create & View**
6. **Copy the API key immediately** (you can't see it again!)

### Step 3: Verify Your Sender Email (One-time)

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in the form:
   - **From Email Address**: `r.smoker@gmail.com` (or any email you control)
   - **From Name**: Skye's Party
   - Fill in the rest of the form
4. Check your email and click the verification link
5. Wait a few minutes for verification to complete

### Step 4: Configure Your Server

Create or edit `server/.env`:

```env
# SendGrid Configuration (EASIEST - No app password needed!)
SENDGRID_API_KEY=SG.your-api-key-here

# Email Settings
ADMIN_EMAIL=r.smoker@gmail.com
FROM_EMAIL=r.smoker@gmail.com

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Replace `SG.your-api-key-here` with the API key you copied in Step 2.

### Step 5: Restart Your Server

```bash
# Stop current server (Ctrl+C)
cd server
npm start
```

### Step 6: Test It!

1. Submit a test RSVP through the form
2. Check your email at `r.smoker@gmail.com`
3. You should receive the notification! 🎉

## That's It!

No app passwords, no 2-step verification setup, no Gmail configuration. Just:
1. Sign up for SendGrid (free)
2. Get API key
3. Add to `.env`
4. Done!

## Why This Works

- **Sending**: SendGrid sends the email using their servers (authenticated with API key)
- **Receiving**: You receive emails at r.smoker@gmail.com normally (no special setup needed)
- **Free**: 100 emails/day is plenty for RSVPs

## Troubleshooting

### "Sender not verified" error
- Make sure you verified your sender email in SendGrid
- Check your email for the verification link
- Wait a few minutes after verification

### Still not receiving emails?
- Check server logs for errors
- Verify API key is correct in `.env`
- Make sure server was restarted after adding `.env`
- Check SendGrid dashboard for delivery status

### Want to use Gmail instead?
That's fine too! See `SETUP_EMAIL.md` for Gmail setup (requires app password).

