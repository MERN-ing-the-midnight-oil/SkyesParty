# How to Generate the Magic Link

## Quick Start

The system uses a **single shared magic link** - anyone with the link can RSVP!

### Method 1: Using the Helper Script (Easiest)

1. Make sure your server is running:
   ```bash
   npm run server
   ```

2. In another terminal, run the script:
   ```bash
   cd server
   node generate-links.js
   ```

   This will create or retrieve the magic link. Copy it and share with your guests!

3. (Optional) Send the link via email:
   ```bash
   node generate-links.js guest@example.com
   ```

### Method 2: Using curl

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

### Method 3: Using a Browser/Postman

1. Open Postman or your browser's developer console
2. Make a GET request to: `http://localhost:5000/api/auth/get-link`
3. Or POST to: `http://localhost:5000/api/auth/generate-link` with optional email in body

## What Happens Next?

1. You get one magic link (e.g., `http://localhost:3000/rsvp?token=abc123...`)
2. Share this link with all your guests (via email, text, social media, etc.)
3. Guests click the link
4. They fill out the RSVP form (name and email are optional)
5. They submit their response
6. Anyone with the link can submit an RSVP!

## Viewing All RSVPs

Visit: `http://localhost:5000/api/admin/rsvps`

Or get statistics: `http://localhost:5000/api/admin/stats`

