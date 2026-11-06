const pool = require('./config/database');

async function checkPasswords() {
  try {
    console.log('🔐 Checking user passwords...\n');
    
    // Get all users with their password info
    const users = await pool.query(`
      SELECT u.id, u.email, u.password, u.is_verified, up.full_name 
      FROM users u 
      LEFT JOIN user_profiles up ON u.id = up.user_id 
      ORDER BY u.id
    `);
    
    console.log(`📊 Found ${users.rows.length} users:\n`);
    
    users.rows.forEach(user => {
      console.log(`👤 User ${user.id}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.full_name || 'Not set'}`);
      console.log(`   Verified: ${user.is_verified}`);
      console.log(`   Has Password: ${!!user.password}`);
      console.log(`   Password Length: ${user.password ? user.password.length : 0}`);
      console.log(`   Password Type: ${user.password ? (user.password.startsWith('$2') ? 'Bcrypt Hash' : 'Plain Text') : 'No Password'}`);
      if (user.password && !user.password.startsWith('$2')) {
        console.log(`   ⚠️  PLAIN TEXT PASSWORD: "${user.password}"`);
      }
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

checkPasswords();