const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const emailService = require('../services/email');

// Generate or get the single shared magic link
router.post('/generate-link', async (req, res) => {
  try {
    const { email } = req.body; // Optional - for sending email
    const database = db.getDb();

    // Check if a token already exists
    database.get('SELECT token FROM magic_links LIMIT 1', [], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      let token;
      if (row) {
        // Use existing token
        token = row.token;
      } else {
        // Generate new token
        token = crypto.randomBytes(32).toString('hex');
        database.run('INSERT INTO magic_links (token) VALUES (?)', [token], (insertErr) => {
          if (insertErr) {
            console.error('Database error:', insertErr);
            return res.status(500).json({ error: 'Failed to create magic link' });
          }
        });
      }

      const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/rsvp?token=${token}`;

      // If email provided, send it
      if (email) {
        emailService.sendMagicLink(email, magicLink)
          .then(() => {
            res.json({ 
              message: 'Magic link sent successfully',
              token: token,
              link: magicLink
            });
          })
          .catch((emailErr) => {
            console.error('Email error:', emailErr);
            res.json({ 
              message: 'Magic link generated (email failed to send)',
              token: token,
              link: magicLink
            });
          });
      } else {
        res.json({ 
          message: 'Magic link generated',
          token: token,
          link: magicLink
        });
      }
    });
  } catch (error) {
    console.error('Error generating magic link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get the current magic link
router.get('/get-link', (req, res) => {
  try {
    const database = db.getDb();

    database.get('SELECT token FROM magic_links LIMIT 1', [], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'No magic link generated yet' });
      }

      const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/rsvp?token=${row.token}`;
      res.json({ 
        token: row.token,
        link: magicLink
      });
    });
  } catch (error) {
    console.error('Error getting magic link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify magic link token (simplified - just check if it exists)
router.get('/verify-token/:token', (req, res) => {
  try {
    const { token } = req.params;
    const database = db.getDb();

    database.get('SELECT token FROM magic_links WHERE token = ?', [token], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json({ valid: true });
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

