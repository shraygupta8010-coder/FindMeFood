// updateUserProfiles.js - Add missing columns to user_profiles table
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'donation_app.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('🔄 Adding missing columns to user_profiles table...');
  
  // Add missing columns to user_profiles table
  db.run(`ALTER TABLE user_profiles ADD COLUMN address TEXT`, (err) => {
    if (err) console.log('ℹ️ Address column already exists or error:', err.message);
    else console.log('✅ Added address column');
  });
  
  db.run(`ALTER TABLE user_profiles ADD COLUMN city TEXT`, (err) => {
    if (err) console.log('ℹ️ City column already exists or error:', err.message);
    else console.log('✅ Added city column');
  });
  
  db.run(`ALTER TABLE user_profiles ADD COLUMN state TEXT`, (err) => {
    if (err) console.log('ℹ️ State column already exists or error:', err.message);
    else console.log('✅ Added state column');
  });
  
  db.run(`ALTER TABLE user_profiles ADD COLUMN pincode TEXT`, (err) => {
    if (err) console.log('ℹ️ Pincode column already exists or error:', err.message);
    else console.log('✅ Added pincode column');
  });
});

// Verify the schema
db.all("PRAGMA table_info(user_profiles)", (err, rows) => {
  if (err) {
    console.error('❌ Error checking schema:', err);
  } else {
    console.log('\n📊 Final user_profiles table schema:');
    rows.forEach(row => {
      console.log(`   ${row.name} (${row.type})`);
    });
  }
  db.close();
});