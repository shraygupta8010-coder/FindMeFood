const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function resetUserPassword() {
  try {
    console.log('🔧 Resetting user password...');
    
    const email = 'shraygupta8010@gmail.com';
    const newPassword = 'password123'; // Simple password that's easy to remember
    
    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (user.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User found:', user.rows[0].email);
    console.log('🔐 Current password hash:', user.rows[0].password);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('🆕 New password hash:', hashedPassword);
    
    // Update user with new password
    await pool.query(
      'UPDATE users SET password = ?, is_verified = 1 WHERE email = ?',
      [hashedPassword, email]
    );
    
    console.log('✅ Password reset successfully!');
    console.log('🔑 Login credentials:');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);
    console.log('📝 Use these exact credentials to login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetUserPassword();