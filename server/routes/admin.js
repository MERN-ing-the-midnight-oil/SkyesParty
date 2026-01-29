const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all RSVPs (simple admin view)
// In production, add authentication here!
router.get('/rsvps', (req, res) => {
  try {
    const database = db.getDb();
    
    database.all(
      'SELECT * FROM rsvps ORDER BY submitted_at DESC',
      [],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        const rsvps = rows.map(row => ({
          id: row.id,
          email: row.email,
          name: row.name,
          going: row.going === 1,
          num_adults: row.num_adults,
          num_kids: row.num_kids,
          submitted_at: row.submitted_at,
          updated_at: row.updated_at
        }));

        res.json({ rsvps, total: rsvps.length });
      }
    );
  } catch (error) {
    console.error('Error getting RSVPs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get summary statistics
router.get('/stats', (req, res) => {
  try {
    const database = db.getDb();
    
    database.all(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN going = 1 THEN 1 ELSE 0 END) as going,
        SUM(CASE WHEN going = 0 THEN 1 ELSE 0 END) as not_going,
        SUM(num_adults) as total_adults,
        SUM(num_kids) as total_kids
      FROM rsvps`,
      [],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        res.json(rows[0] || {
          total: 0,
          going: 0,
          not_going: 0,
          total_adults: 0,
          total_kids: 0
        });
      }
    );
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


