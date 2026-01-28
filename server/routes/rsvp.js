const express = require('express');
const router = express.Router();
const db = require('../db');
const emailService = require('../services/email');

// Submit RSVP (simplified - no email requirement, token just needs to be valid)
router.post('/submit', (req, res) => {
  try {
    const { token, email, name, child_name, going, num_adults, num_kids, message } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (going === undefined || going === null) {
      return res.status(400).json({ error: 'Please indicate if you are going' });
    }

    const database = db.getDb();

    // Verify the token exists (simple check)
    database.get('SELECT token FROM magic_links WHERE token = ?', [token], (err, linkRow) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!linkRow) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Create new RSVP (anyone with the link can submit)
      database.run(
        'INSERT INTO rsvps (email, name, child_name, going, num_adults, num_kids, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [email.trim(), name.trim(), child_name ? child_name.trim() : null, going ? 1 : 0, num_adults || 0, num_kids || 0, message ? message.trim() : null],
        function(insertErr) {
          if (insertErr) {
            console.error('Database error:', insertErr);
          return res.status(500).json({ error: 'Failed to submit RSVP' });
          }

          const rsvpData = {
            id: this.lastID,
            email: email.trim(),
            name: name.trim(),
            child_name: child_name ? child_name.trim() : null,
            going: going ? true : false,
            num_adults: num_adults || 0,
            num_kids: num_kids || 0,
            message: message ? message.trim() : null
          };

          // Send notification email (don't wait for it - send response immediately)
          emailService.sendRSVPNotification(rsvpData).catch(err => {
            console.error('Failed to send RSVP notification:', err);
            // Don't fail the request if email fails
          });

          res.json({ 
            success: true,
            message: 'RSVP submitted successfully',
            rsvp: rsvpData
          });
        }
      );
    });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

