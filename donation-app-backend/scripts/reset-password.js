const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    const email = 'shraygupta8010@gmail.com';
    const newPassword = '123456'; // Simple password for testing
    
    console.log(`🔄 Resetting password for: ${email}`);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    await pool.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    console.log('✅ Password reset successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 New Password: ${newPassword}`);
    console.log(`🔒 Hashed: ${hashedPassword.substring(0, 20)}...`);
    
  } catch (error) {
    console.error('❌ Reset error:', error.message);
  } finally {
    process.exit();
  }
}

resetPassword();