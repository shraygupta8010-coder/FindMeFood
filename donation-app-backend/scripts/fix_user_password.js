const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function fixUserPassword() {
  try {
    console.log('🔧 Fixing user password...');
    
    const email = 'shraygupta8010@gmail.com';
    const newPassword = 'password123';
    
    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (user.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User found:', user.rows[0].email);
    console.log('🔐 Current password:', user.rows[0].password);
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user with new password
    await pool.query(
      'UPDATE users SET password = ?, is_verified = 1 WHERE email = ?',
      [hashedPassword, email]
    );
    
    console.log('✅ Password updated successfully!');
    console.log('🔑 New login credentials:');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixUserPassword();