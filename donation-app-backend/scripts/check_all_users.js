const pool = require('./config/database');

async function checkAllUsers() {
  try {
    console.log('🔍 Checking all users for password issues...');
    
    const users = await pool.query(`
      SELECT u.id, u.email, u.password, u.is_verified 
      FROM users u 
      ORDER BY u.id
    `);
    
    console.log('\n📊 All users in database:');
    users.rows.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Verified: ${user.is_verified}`);
      console.log(`   Password: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL/UNDEFINED'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAllUsers();