# Troubleshooting Email Notifications

If you're not receiving emails after submitting an RSVP, follow these steps:

## Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Submit a test RSVP
4. Look for messages starting with:
   - `📧 Attempting to send RSVP notification email...`
   - `✅ RSVP notification email sent successfully!` (success)
   - `❌ Error sending RSVP notification email:` (error)
   - `⚠️ EmailJS not configured` (configuration issue)

## Step 2: Verify Environment Variables

### If Testing Locally:

1. Make sure you have a `.env` file in the `client/` directory
2. Check that it contains:
   ```
   REACT_APP_EMAILJS_SERVICE_ID=service_igsrlz8
   REACT_APP_EMAILJS_TEMPLATE_ID=template_a2hdf0j
   REACT_APP_EMAILJS_PUBLIC_KEY=RULpPGERQuAtLqd-9
   REACT_APP_ADMIN_EMAIL=r.smoker@gmail.com
   ```
3. **IMPORTANT:** Restart your dev server after creating/updating `.env`:
   ```bash
   # Stop the server (Ctrl+C) and restart:
   cd client
   npm start
   ```

### If Testing on GitHub Pages (Production):

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Verify these secrets exist:
   - `REACT_APP_EMAILJS_SERVICE_ID` = `service_igsrlz8`
   - `REACT_APP_EMAILJS_TEMPLATE_ID` = `template_a2hdf0j`
   - `REACT_APP_EMAILJS_PUBLIC_KEY` = `RULpPGERQuAtLqd-9`
   - `REACT_APP_ADMIN_EMAIL` = `r.smoker@gmail.com` (optional)
3. Check the GitHub Actions workflow file (`.github/workflows/deploy.yml`) to ensure these secrets are being used in the build step

## Step 3: Verify EmailJS Template Configuration

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/admin)
2. Navigate to **Email Templates** → Your template
3. **CRITICAL:** Check the **"To Email"** field:
   - It should be: `{{to_email}}` OR `r.smoker@gmail.com`
   - If it's set to a variable, make sure the variable name matches
4. Check the **"Subject"** field:
   - It should be: `{{subject}}`
5. Verify all template variables match what we're sending:
   - `{{from_name}}`
   - `{{from_email}}`
   - `{{child_name}}`
   - `{{going}}`
   - `{{num_adults}}`
   - `{{num_kids}}`
   - `{{total_people}}`
   - `{{message}}`
   - `{{submitted_at}}`
   - `{{to_email}}` (if using variable)
   - `{{subject}}` (for subject line)

## Step 4: Check EmailJS Service Connection

1. Go to EmailJS Dashboard → **Email Services**
2. Make sure your service (service_igsrlz8) is **connected** and shows a green checkmark
3. If it's not connected, reconnect it following the setup instructions

## Step 5: Check EmailJS Logs

1. Go to EmailJS Dashboard → **Logs**
2. Look for recent email attempts
3. Check if emails are being sent but failing, or not being sent at all
4. Look for error messages

## Step 6: Verify EmailJS Quota

1. Check your EmailJS account → **Usage**
2. Free tier includes 200 emails/month
3. If you've exceeded the limit, you won't receive emails

## Step 7: Check Spam Folder

- Check the spam/junk folder in `r.smoker@gmail.com`
- Sometimes automated emails get filtered

## Common Issues:

### Issue: "EmailJS not configured" warning
**Solution:** Environment variables are not being loaded. Restart dev server or check GitHub Secrets.

### Issue: EmailJS error with status 400
**Solution:** Template variables don't match. Check Step 3 above.

### Issue: EmailJS error with status 401
**Solution:** Public key is incorrect. Verify `REACT_APP_EMAILJS_PUBLIC_KEY` in your environment.

### Issue: No errors but no email
**Solution:** 
- Check EmailJS logs (Step 5)
- Verify "To Email" in template is set correctly (Step 3)
- Check spam folder
- Verify email service is connected (Step 4)

## Still Not Working?

1. Check the browser console for the detailed error messages
2. Check EmailJS dashboard logs
3. Verify all credentials are correct
4. Try testing with a different email address to rule out email provider issues

