const pool = require('./config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database structure...');
    
    // Check if tables exist
    const usersTable = await pool.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `);
    console.log('✅ Users table exists:', usersTable.rows.length > 0);
    
    const profilesTable = await pool.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='user_profiles'
    `);
    console.log('✅ User_profiles table exists:', profilesTable.rows.length > 0);
    
    // Check table structures
    if (usersTable.rows.length > 0) {
      const usersColumns = await pool.query(`PRAGMA table_info(users)`);
      console.log('\n📋 Users table columns:');
      usersColumns.rows.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
      });
    }
    
    if (profilesTable.rows.length > 0) {
      const profilesColumns = await pool.query(`PRAGMA table_info(user_profiles)`);
      console.log('\n📋 User_profiles table columns:');
      profilesColumns.rows.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
      });
    }
    
    // Check data
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Total users: ${userCount.rows[0].count}`);
    
    console.log('\n✅ Database check completed!');
    
  } catch (error) {
    console.error('❌ Database check error:', error.message);
  } finally {
    process.exit();
  }
}

checkDatabase();