const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'donation_app.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Adding OTP columns to users table...');

// Add OTP columns
db.serialize(() => {
  db.run(`ALTER TABLE users ADD COLUMN otp VARCHAR(6)`, function(err) {
    if (err) {
      console.log('ℹ️ OTP column already exists or error:', err.message);
    } else {
      console.log('✅ Added otp column');
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN otp_expiry DATETIME`, function(err) {
    if (err) {
      console.log('ℹ️ OTP expiry column already exists or error:', err.message);
    } else {
      console.log('✅ Added otp_expiry column');
    }
  });

  // Verify the changes
  db.all(`PRAGMA table_info(users)`, (err, rows) => {
    if (err) {
      console.error('Error checking table structure:', err);
    } else {
      console.log('\n📊 Users table structure:');
      rows.forEach(row => {
        console.log(`- ${row.name} (${row.type})`);
      });
    }
    
    db.close();
    console.log('\n✅ Database update completed!');
  });
});