// update-database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'donation_app.db');
const db = new sqlite3.Database(dbPath);

function runQuery(query) {
  return new Promise((resolve, reject) => {
    db.run(query, function(err) {
      if (err) {
        // If column/table already exists, it's not an error
        if (err.message.includes('duplicate column name') || err.message.includes('already exists')) {
          resolve({ skipped: true, message: err.message });
        } else {
          reject(err);
        }
      } else {
        resolve({ success: true });
      }
    });
  });
}

async function updateDatabase() {
  try {
    console.log('🔄 Updating database schema for Aadhaar...');
    console.log('Database path:', dbPath);

    // Add columns to users table
    console.log('\n1. Adding columns to users table...');
    
    const queries = [
      `ALTER TABLE users ADD COLUMN aadhaar_number TEXT`,
      `ALTER TABLE users ADD COLUMN aadhaar_verified BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE users ADD COLUMN aadhaar_verification_status TEXT DEFAULT 'pending'`,
      `ALTER TABLE users ADD COLUMN aadhaar_verified_at DATETIME`,
      
      // Create aadhaar_verifications table
      `CREATE TABLE IF NOT EXISTS aadhaar_verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        aadhaar_number TEXT NOT NULL,
        aadhaar_front_image TEXT,
        aadhaar_back_image TEXT,
        verification_method TEXT DEFAULT 'manual',
        verification_status TEXT DEFAULT 'pending',
        rejection_reason TEXT,
        verified_by INTEGER,
        verified_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (verified_by) REFERENCES users(id)
      )`
    ];

    for (let i = 0; i < queries.length; i++) {
      try {
        const result = await runQuery(queries[i]);
        if (result.skipped) {
          console.log(`✅ Query ${i+1}: Already exists (skipped)`);
        } else {
          console.log(`✅ Query ${i+1}: Executed successfully`);
        }
      } catch (error) {
        console.log(`⚠️ Query ${i+1}: ${error.message}`);
      }
    }

    console.log('\n🎉 Database schema update completed!');
    
    // Verify the changes
    console.log('\n🔍 Verifying changes...');
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('Error verifying tables:', err);
      } else {
        console.log('📊 Current tables:', tables.map(t => t.name));
      }
      
      db.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database update error:', error);
    db.close();
    process.exit(1);
  }
}

updateDatabase();