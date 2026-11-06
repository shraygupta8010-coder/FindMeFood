const pool = require('./config/database');

async function checkPassword() {
  try {
    console.log('🔍 Checking password format in database...');
    
    const user = await pool.query('SELECT id, email, password FROM users WHERE email = ?', ['test1762878279039@example.com']);
    
    if (user.rows.length > 0) {
      console.log('👤 User found:', user.rows[0].email);
      console.log('🔐 Password in database:', user.rows[0].password);
      console.log('📏 Password length:', user.rows[0].password?.length);
      console.log('🔍 Password starts with:', user.rows[0].password?.substring(0, 10));
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPassword();