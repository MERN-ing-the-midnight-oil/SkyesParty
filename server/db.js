const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'rsvp.db');

let db = null;

const init = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Simple magic link table - just stores a single shared token
      db.run(`
        CREATE TABLE IF NOT EXISTS magic_links (
          id INTEGER PRIMARY KEY,
          token TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      // RSVPs table - email is now optional
      db.run(`
        CREATE TABLE IF NOT EXISTS rsvps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT,
          name TEXT,
          child_name TEXT,
          going INTEGER NOT NULL,
          num_adults INTEGER DEFAULT 0,
          num_kids INTEGER DEFAULT 0,
          message TEXT,
          submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Add message column if it doesn't exist (for existing databases)
        db.run(`
          ALTER TABLE rsvps ADD COLUMN message TEXT
        `, (alterErr) => {
          // Ignore error if column already exists
        });
        
        // Add child_name column if it doesn't exist (for existing databases)
        db.run(`
          ALTER TABLE rsvps ADD COLUMN child_name TEXT
        `, (alterErr) => {
          // Ignore error if column already exists
          resolve();
        });
      });
    });
  });
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

const close = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log('Database connection closed');
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  init,
  getDb,
  close
};

