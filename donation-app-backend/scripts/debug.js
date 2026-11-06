const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'donation_app.db');
const db = new sqlite3.Database(dbPath);

console.log('=== CHECKING NGO TABLE ===');
db.all('SELECT * FROM ngo', (err, rows) => {
  if (err) console.error(err);
  else console.log('NGO Table:', rows);
});

console.log('=== CHECKING NGO_PROFILES TABLE ===');
db.all('SELECT * FROM ngo_profiles', (err, rows) => {
  if (err) console.error(err);
  else console.log('NGO Profiles Table:', rows);
  
  db.close();
});