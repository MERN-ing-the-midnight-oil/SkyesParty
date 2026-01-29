# Setup Access Token for GitHub Pages

## Generated Access Token

A secure access token has been generated for you:

```
df650ca6b6de5968c760030f88bdff57e98a320801fde5cfc8c53f7fcb13dff6
```

## Step 1: Add GitHub Secret

1. Go to your GitHub repository: https://github.com/MERN-ing-the-midnight-oil/SkyesParty
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `REACT_APP_ACCESS_TOKEN`
5. Secret: `df650ca6b6de5968c760030f88bdff57e98a320801fde5cfc8c53f7fcb13dff6`
6. Click **"Add secret"**

## Step 2: Trigger Deployment

After adding the secret, you need to trigger a new deployment:

**Option A: Push a commit**
```bash
git commit --allow-empty -m "Add access token configuration"
git push
```

**Option B: Manual workflow trigger**
1. Go to **Actions** tab in your repository
2. Select **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** → **"Run workflow"**

## Step 3: Your Private Link

Once deployed, your private RSVP link will be:

```
https://MERN-ing-the-midnight-oil.github.io/SkyesParty?access=df650ca6b6de5968c760030f88bdff57e98a320801fde5cfc8c53f7fcb13dff6
```

## Share This Link

Share the link above with your guests. Only people with this exact link (including the access token) will be able to see and use the RSVP form.

## Important Notes

- **Keep the access token secret!** Anyone with the token can access the form
- The token is included in the URL, so be careful when sharing
- You can change the token anytime by updating the GitHub Secret and redeploying
- The access token is different from the GitHub token (which is used for API authentication)

## Testing

After deployment, test the links:

✅ **With token:** https://MERN-ing-the-midnight-oil.github.io/SkyesParty?access=df650ca6b6de5968c760030f88bdff57e98a320801fde5cfc8c53f7fcb13dff6
   - Should show the RSVP form

❌ **Without token:** https://MERN-ing-the-midnight-oil.github.io/SkyesParty
   - Should show "Private Event" message
