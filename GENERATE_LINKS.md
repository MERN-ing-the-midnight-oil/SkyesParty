# How to Generate the Private Access Link

## Quick Start

The system uses an **access token** to keep your RSVP form private. Only people with the correct access token in the URL can see and use the form.

## Setting Up Access Control

### Step 1: Set Your Access Token

Choose a secret token (e.g., `skye2026party` or a random string like `a7f3k9m2p5q8`).

**For Local Development:**
Add to `client/.env`:
```env
REACT_APP_ACCESS_TOKEN=your_secret_token_here
```

**For Production (GitHub Pages):**
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add a secret named `REACT_APP_ACCESS_TOKEN` with your secret token value

### Step 2: Generate Your Private Link

Once you've set the access token, your private link will be:

**Local Development:**
```
http://localhost:3000?access=your_secret_token_here
```

**Production (GitHub Pages):**
```
https://username.github.io/SkyesParty?access=your_secret_token_here
```

Replace `your_secret_token_here` with the actual token you set in Step 1.

## Example

If you set `REACT_APP_ACCESS_TOKEN=skye2026party`, your private link would be:

```
https://username.github.io/SkyesParty?access=skye2026party
```

## Sharing the Link

1. **Generate your private link** using the format above
2. **Share this link** with your guests (via email, text, social media, etc.)
3. **Guests click the link** - they'll see the RSVP form
4. **Guests fill out and submit** - RSVP is saved to GitHub Gist
5. **Anyone without the link** will see "Private Event" message

## Important Notes

- **The access token is different from the GitHub token:**
  - `REACT_APP_GITHUB_TOKEN`: Used to authenticate with GitHub API (for storing RSVPs)
  - `REACT_APP_ACCESS_TOKEN`: Used to control who can see the form (for privacy)

- **If you don't set an access token**, the form will be publicly accessible (backward compatible)

- **Keep your access token secret!** Anyone with the token can access the form

- **You can change the token anytime** by updating the environment variable and rebuilding/redeploying

## Viewing All RSVPs

Access the admin dashboard at:
- **Local:** `http://localhost:3000/admin`
- **Production:** `https://username.github.io/SkyesParty/admin`

Or view the GitHub Gist directly at: https://gist.github.com (look for "Skye's Party RSVPs")
