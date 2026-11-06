const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'donation_app.db');

// Create a single database connection
const db = new sqlite3.Database(dbPath);

const pool = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows: rows || [] });
        }
      });
    });
  },
  
  // Add method to get last inserted ID
  getLastInsertId: () => {
    return new Promise((resolve, reject) => {
      db.get('SELECT last_insert_rowid() as id', (err, row) => {
        if (err) reject(err);
        else resolve(row.id);
      });
    });
  }
};

console.log('✅ SQLite Database Connected Successfully!');
module.exports = pool;