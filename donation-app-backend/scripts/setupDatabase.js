// setupDatabase.js - CLEAN CORRECTED VERSION
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'donation_app.db');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  console.log('🔄 Creating database tables...');

  // 1. Create users table with all required columns
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT 0,
    verification_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('❌ Error creating users table:', err);
    else console.log('✅ Users table created');
  });

  // 2. Create user_profiles table
  db.run(`CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    full_name TEXT,
    phone TEXT,
    preferences TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('❌ Error creating user_profiles table:', err);
    else console.log('✅ User profiles table created');
  });

  // 3. Create ngo table
  db.run(`CREATE TABLE IF NOT EXISTS ngo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('❌ Error creating ngo table:', err);
    else console.log('✅ NGO table created');
  });

  // 4. Create ngo_profiles table
  db.run(`CREATE TABLE IF NOT EXISTS ngo_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ngo_id INTEGER NOT NULL,
    description TEXT,
    contact_email TEXT,
    phone TEXT,
    address TEXT,
    verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ngo_id) REFERENCES ngo(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('❌ Error creating ngo_profiles table:', err);
    else console.log('✅ NGO profiles table created');
  });

  // 5. Create donations table
  db.run(`CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    food_type TEXT,
    food_image_url TEXT,
    food_source TEXT,
    location TEXT,
    status TEXT DEFAULT 'pending',
    ngo_id INTEGER,
    pickup_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES ngo(id) ON DELETE SET NULL
  )`, (err) => {
    if (err) console.error('❌ Error creating donations table:', err);
    else console.log('✅ Donations table created');
  });

  // 6. Create donation_status_history table
  db.run(`CREATE TABLE IF NOT EXISTS donation_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donation_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    changed_by INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('❌ Error creating donation_status_history table:', err);
    else console.log('✅ Donation status history table created');
  });
});

// Close database connection after a short delay
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err);
    } else {
      console.log('✅ Database setup completed successfully!');
      console.log('📊 Database file: donation_app.db');
    }
  });
}, 1000);