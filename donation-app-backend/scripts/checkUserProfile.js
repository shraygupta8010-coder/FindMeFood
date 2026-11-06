// backend/checkUserProfile.js
const pool = require('./config/database');

async function checkUserProfileSetup() {
  try {
    console.log('🔍 Checking User Profile Setup...\n');
    
    // 1. Check if user_profiles table exists
    const tableCheck = await pool.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='user_profiles'"
    );
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ user_profiles table does NOT exist!');
      console.log('💡 Creating user_profiles table...');
      
      // Create the table
      await pool.query(`
        CREATE TABLE user_profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          full_name VARCHAR(255),
          phone VARCHAR(20),
          address TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          pincode VARCHAR(10),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(user_id)
        )
      `);
      console.log('✅ user_profiles table created!');
    } else {
      console.log('✅ user_profiles table exists');
    }
    
    // 2. Check if we have users
    const users = await pool.query('SELECT id, email FROM users LIMIT 5');
    console.log('\n👥 Users in database:', users.rows.length);
    users.rows.forEach(user => console.log(`   - ID: ${user.id}, Email: ${user.email}`));
    
    // 3. Check user profiles
    if (users.rows.length > 0) {
      console.log('\n📊 Checking user profiles:');
      for (const user of users.rows) {
        const profile = await pool.query(
          'SELECT * FROM user_profiles WHERE user_id = ?',
          [user.id]
        );
        console.log(`   - User ${user.id}: ${profile.rows.length > 0 ? 'Has profile' : 'No profile'}`);
        if (profile.rows.length > 0) {
          console.log('     Profile data:', profile.rows[0]);
        }
      }
    }
    
    console.log('\n🎉 User profile setup check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserProfileSetup();