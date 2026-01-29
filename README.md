# Skye's 4th Birthday Party RSVP System 🎉

A beautiful, modern RSVP system for Skye's birthday party - **100% frontend, no backend required!** Uses GitHub Gists API as a lightweight database.

## Features

- 🚀 **No Backend Required** - Uses GitHub Gists API for data storage
- 🔒 **Access Control** - Optional secret link protection for private events
- 📝 Simple RSVP form with going/not going options
- 👥 Track number of adults and kids attending
- 💾 GitHub Gist storage (private, secure)
- 🎨 Beautiful, responsive UI
- 🌐 Deploy to GitHub Pages with zero configuration

## Project Structure

```
SkyesParty/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # RSVP form and admin view
│   │   └── services/    # GitHub Gist service
│   └── public/
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Create a GitHub Personal Access Token

The app uses GitHub Gists API to store RSVPs. You'll need a GitHub Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Skye Party RSVP"
4. Select the `gist` scope (this allows creating and updating gists)
5. Click "Generate token"
6. **Copy the token immediately** (you won't be able to see it again!)

### 3. Configure the Tokens

You need to configure two tokens:

#### A. GitHub Token (for storing RSVPs)

**Option 1: Environment Variable (Recommended for Development)**

Create a `.env` file in the `client/` directory:

```env
REACT_APP_GITHUB_TOKEN=your_github_token_here
```

**Option 2: URL Parameter (Works for GitHub Pages)**

You can pass the token as a URL parameter:
```
https://your-site.github.io/SkyesParty?token=your_github_token_here
```

**Note:** For production on GitHub Pages, you'll want to set the token as a GitHub Secret and use it in the build process (see Deployment section).

#### B. Access Token (for private event access - Optional)

To make your RSVP form private (only accessible with a secret link), set an access token:

**Option 1: Environment Variable (Recommended)**

Add to your `.env` file in the `client/` directory:

```env
REACT_APP_ACCESS_TOKEN=your_secret_access_token_here
```

**Option 2: GitHub Secret (for Production)**

Add `REACT_APP_ACCESS_TOKEN` as a GitHub Secret (same as the GitHub token).

**Note:** If you don't set an access token, the form will be publicly accessible (backward compatible).

### 4. Run the Application

```bash
cd client
npm start
```

The app will open at `http://localhost:3000`

## How It Works

1. **Share the RSVP Link**: 
   - **Public access** (no access token): Share `https://your-site.github.io/SkyesParty` with your guests
   - **Private access** (with access token): Share `https://your-site.github.io/SkyesParty?access=your_secret_token` with your guests
2. **Guest Fills Form**: Guest fills out the RSVP form (name, email, going/not going, number of adults/kids)
3. **Submit**: RSVP is saved to a private GitHub Gist
4. **View Admin**: Access admin view at `https://your-site.github.io/SkyesParty/admin` to see all RSVPs

### Access Control

If you've set `REACT_APP_ACCESS_TOKEN`, the RSVP form will only be accessible to people with the correct access token in the URL. 

- **With access token**: `https://your-site.github.io/SkyesParty?access=your_secret_token` ✅ Shows form
- **Without access token**: `https://your-site.github.io/SkyesParty` ❌ Shows "Private Event" message

**Important:** The access token is different from the GitHub token:
- **GitHub token** (`REACT_APP_GITHUB_TOKEN`): Used to authenticate with GitHub API for storing RSVPs
- **Access token** (`REACT_APP_ACCESS_TOKEN`): Used to control who can see the RSVP form (optional)

## Data Storage

RSVPs are stored in a private GitHub Gist. The Gist ID is automatically saved in your browser's localStorage after the first RSVP is submitted. All data is stored securely in your GitHub account.

## Viewing RSVPs

### Admin Dashboard

Access the admin dashboard at: **`http://localhost:3000/admin`** (or your deployed URL + `/admin`)

This beautiful interface shows:
- 📊 Statistics (total RSVPs, going/not going, total adults/kids)
- 📋 Complete list of all RSVPs in a table
- 🍕 Planning summary for pizza and cupcakes
- 🔄 Refresh button to get latest responses

**Note:** Keep this URL secret! Anyone who knows the URL can view all RSVPs. For production, you may want to add password protection.

### Viewing the Gist Directly

You can also view the RSVPs directly on GitHub:
1. Go to your GitHub Gists: https://gist.github.com
2. Look for a gist named "Skye's Party RSVPs"
3. Click on it to view the JSON data

## Production Deployment

### Deploy to GitHub Pages

The app is configured for automatic deployment to GitHub Pages:

1. **Push to GitHub** (if you haven't already):
   ```bash
   git remote add origin https://github.com/username/SkyesParty.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically deploy when you push to `main`

3. **Configure Tokens for Production**:
   - Go to repository **Settings** → **Secrets and variables** → **Actions**
   - Add a secret named `REACT_APP_GITHUB_TOKEN` with your GitHub Personal Access Token
   - (Optional) Add a secret named `REACT_APP_ACCESS_TOKEN` with your secret access token for private events
   - The GitHub Actions workflow will automatically use these tokens during the build

4. **Update Homepage URL** (if needed):
   - If your repo is `https://github.com/username/SkyesParty`, the homepage in `client/package.json` should be:
     ```json
     "homepage": "https://username.github.io/SkyesParty"
     ```

Your site will be available at: `https://username.github.io/SkyesParty`

**Note:** The GitHub token is injected during the build process, so it's safe to use in the deployed app. The token is only used client-side to access the GitHub Gists API.

## Troubleshooting

- **"GitHub token not found" error?** 
  - Make sure you've created a GitHub Personal Access Token with `gist` scope
  - For local development: Create a `.env` file in `client/` with `REACT_APP_GITHUB_TOKEN=your_token`
  - For GitHub Pages: Add the token as a secret named `REACT_APP_GITHUB_TOKEN` in repository Settings → Secrets
  - Or pass it as a URL parameter: `?token=your_token_here`

- **RSVPs not saving?** 
  - Check that your GitHub token has the `gist` scope enabled
  - Check the browser console for error messages
  - Verify the token is valid by testing it at https://api.github.com/user (with Authorization header)

- **Admin view not loading?**
  - Make sure you're accessing `/admin` route
  - Check that the GitHub token is configured correctly
  - The Gist will be created automatically on the first RSVP submission

## License

ISC

