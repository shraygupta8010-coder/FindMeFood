const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'donation_app.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Adding missing columns to existing tables...');

db.serialize(() => {
  // Add missing columns to ngo_profiles
  db.run(`ALTER TABLE ngo_profiles ADD COLUMN contact_person TEXT`, (err) => {
    if (err) console.log('ℹ️ contact_person column may already exist');
    else console.log('✅ Added contact_person to ngo_profiles');
  });

  db.run(`ALTER TABLE ngo_profiles ADD COLUMN latitude REAL`, (err) => {
    if (err) console.log('ℹ️ latitude column may already exist');
    else console.log('✅ Added latitude to ngo_profiles');
  });

  db.run(`ALTER TABLE ngo_profiles ADD COLUMN longitude REAL`, (err) => {
    if (err) console.log('ℹ️ longitude column may already exist');
    else console.log('✅ Added longitude to ngo_profiles');
  });

  db.run(`ALTER TABLE ngo_profiles ADD COLUMN service_radius INTEGER DEFAULT 10`, (err) => {
    if (err) console.log('ℹ️ service_radius column may already exist');
    else console.log('✅ Added service_radius to ngo_profiles');
  });

  db.run(`ALTER TABLE ngo_profiles ADD COLUMN website TEXT`, (err) => {
    if (err) console.log('ℹ️ website column may already exist');
    else console.log('✅ Added website to ngo_profiles');
  });

  db.run(`ALTER TABLE ngo_profiles ADD COLUMN registration_number TEXT`, (err) => {
    if (err) console.log('ℹ️ registration_number column may already exist');
    else console.log('✅ Added registration_number to ngo_profiles');
  });

  // Add OTP columns to users for future verification
  db.run(`ALTER TABLE users ADD COLUMN otp TEXT`, (err) => {
    if (err) console.log('ℹ️ otp column may already exist');
    else console.log('✅ Added otp to users');
  });

  db.run(`ALTER TABLE users ADD COLUMN otp_expiry DATETIME`, (err) => {
    if (err) console.log('ℹ️ otp_expiry column may already exist');
    else console.log('✅ Added otp_expiry to users');
  });

  db.run(`ALTER TABLE users ADD COLUMN aadhaar_number TEXT`, (err) => {
    if (err) console.log('ℹ️ aadhaar_number column may already exist');
    else console.log('✅ Added aadhaar_number to users');
  });

  db.run(`ALTER TABLE users ADD COLUMN aadhaar_verification_status TEXT DEFAULT 'not_provided'`, (err) => {
    if (err) console.log('ℹ️ aadhaar_verification_status column may already exist');
    else console.log('✅ Added aadhaar_verification_status to users');
  });
});

setTimeout(() => {
  db.close((err) => {
    if (err) console.error('❌ Error closing database:', err);
    else console.log('🎉 All missing columns added successfully!');
    console.log('🚀 You can now start your server: npm start');
  });
}, 3000);