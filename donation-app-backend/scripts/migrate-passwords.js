const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function migratePasswords() {
  try {
    console.log('🔄 Checking and migrating passwords...');
    
    // Get all users with plain text passwords
    const users = await pool.query(`
      SELECT id, email, password FROM users 
      WHERE password IS NOT NULL AND password != '' 
      AND NOT password LIKE '$2%'
    `);
    
    console.log(`📊 Found ${users.rows.length} users with plain text passwords`);
    
    for (const user of users.rows) {
      console.log(`🔄 Migrating user: ${user.email}`);
      
      // Hash the existing plain text password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Update to bcrypt
      await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, user.id]
      );
      
      console.log(`✅ Migrated: ${user.email}`);
    }
    
    console.log('🎉 Password migration completed!');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    process.exit();
  }
}

migratePasswords();