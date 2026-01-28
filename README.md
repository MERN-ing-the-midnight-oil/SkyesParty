# Skye's 4th Birthday Party RSVP System 🎉

A beautiful, modern RSVP system for Skye's birthday party with magic link authentication.

## Features

- ✨ Single shared magic link - anyone with the link can RSVP
- 📝 Simple RSVP form with going/not going options
- 👥 Track number of adults and kids attending
- 💾 SQLite database for storing RSVPs
- 🎨 Beautiful, responsive UI
- 📧 Optional email notifications with styled HTML emails

## Project Structure

```
SkyesParty/
├── server/          # Backend Express server
│   ├── routes/      # API routes
│   ├── services/    # Email service
│   └── db.js        # Database setup
├── client/          # React frontend
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm run install-all
```

This will install dependencies for the root, server, and client.

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000

# Email Configuration (for sending magic links and RSVP notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Admin email for RSVP notifications (defaults to r.smoker@gmail.com)
ADMIN_EMAIL=r.smoker@gmail.com
```

Save this as `server/.env` (create the file if it doesn't exist).

**For Gmail users:**
- You'll need to create an [App Password](https://support.google.com/accounts/answer/185833)
- Enable 2-factor authentication on your Google account
- Use the app password (not your regular password) in `SMTP_PASS`

**Note:** If you don't configure email, the system will work in "mock mode" and print magic links/notifications to the console instead of sending emails.

**RSVP Notifications:** You'll receive an email notification at `ADMIN_EMAIL` (defaults to r.smoker@gmail.com) every time someone submits an RSVP. The notification includes RSVP details and a link to the admin dashboard.

### 3. Run the Application

From the root directory:

```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend React app (port 3000).

Or run them separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## Generating the Magic Link

The system uses a **single shared magic link** that anyone can use to RSVP. This makes it simple - just share one link with all your guests!

### Option 1: Using the Helper Script (Recommended)

```bash
cd server
node generate-links.js
```

This will create or retrieve the magic link. You can also optionally send it via email:

```bash
node generate-links.js guest@example.com
```

### Option 2: Using the API

Get the current link:
```bash
curl http://localhost:5000/api/auth/get-link
```

Create a new link (or get existing):
```bash
curl -X POST http://localhost:5000/api/auth/generate-link \
  -H "Content-Type: application/json" \
  -d '{"email": "guest@example.com"}'  # email is optional
```

## How It Works

1. **Generate One Magic Link**: Create a single shared magic link (or get the existing one)
2. **Share the Link**: Send the link to all your guests via email, text, or any method you prefer
3. **Guest Clicks Link**: Guest clicks the link
4. **RSVP Form**: Guest fills out the form (name, email optional, going/not going, number of adults/kids)
5. **Submit**: RSVP is saved to the database - anyone with the link can submit!

## Database

The system uses SQLite (stored in `server/rsvp.db`). The database includes:

- `magic_links` table: Stores the single shared magic link token
- `rsvps` table: Stores all RSVP responses (email is optional)

## Viewing RSVPs

### Admin Dashboard (Recommended)

Access the admin dashboard at: **`http://localhost:3000/admin`**

This beautiful interface shows:
- 📊 Statistics (total RSVPs, going/not going, total adults/kids)
- 📋 Complete list of all RSVPs in a table
- 🍕 Planning summary for pizza and cupcakes
- 🔄 Refresh button to get latest responses

**Note:** Keep this URL secret! Anyone who knows the URL can view all RSVPs. For production, you may want to add password protection.

### API Endpoints

You can also access RSVPs via API:

```bash
# Get all RSVPs
curl http://localhost:5000/api/admin/rsvps

# Get statistics
curl http://localhost:5000/api/admin/stats
```

### Database Query

Or query the database directly:

```bash
sqlite3 server/rsvp.db "SELECT * FROM rsvps;"
```

## Production Deployment

### Frontend - GitHub Pages

The frontend is configured for automatic deployment to GitHub Pages:

1. **Create a GitHub repository** (if you haven't already):
   ```bash
   # On GitHub, create a new repository named "SkyesParty" (or your preferred name)
   ```

2. **Update the homepage URL** in `client/package.json`:
   - If your repo is `https://github.com/username/SkyesParty`, the homepage should be:
     ```json
     "homepage": "https://username.github.io/SkyesParty"
     ```

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/username/SkyesParty.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically deploy when you push to `main`

5. **Configure API URL** (if your backend is hosted elsewhere):
   - Go to repository **Settings** → **Secrets and variables** → **Actions**
   - Add a secret named `REACT_APP_API_URL` with your backend API URL
   - Example: `https://your-backend.railway.app/api` or `https://your-backend.render.com/api`

Your site will be available at: `https://username.github.io/SkyesParty`

### Backend Deployment

The backend needs to be deployed separately (GitHub Pages only serves static files). Options:

- **Railway**: Easy deployment, free tier available
- **Render**: Free tier available
- **Heroku**: Paid plans available
- **Vercel/Netlify Functions**: For serverless approach

For backend deployment:

1. Set `FRONTEND_URL` to your GitHub Pages URL
2. Configure proper SMTP settings
3. Use a production database (PostgreSQL, MySQL, etc.) instead of SQLite
4. Set up proper environment variables
5. Update the `REACT_APP_API_URL` secret in GitHub to point to your deployed backend

## Troubleshooting

- **Email not sending?** Check your SMTP credentials. The system will work in mock mode if credentials aren't set. You can always just copy the link and send it manually!
- **Token invalid?** Make sure you're using the correct token. Use `node generate-links.js` to get the current link.
- **Database errors?** Make sure the `server/` directory is writable for SQLite to create the database file.

## License

ISC

