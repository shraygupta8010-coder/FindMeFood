const bcrypt = require('bcryptjs');

async function testPasswordHash() {
  try {
    const testPassword = 'password123';
    
    console.log('🧪 Testing password hashing...');
    console.log('Input password:', testPassword);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    console.log('Hashed password:', hashedPassword);
    
    // Test comparison
    const isValid1 = bcrypt.compareSync(testPassword, hashedPassword);
    console.log('Comparison with correct password:', isValid1);
    
    const isValid2 = bcrypt.compareSync('wrongpassword', hashedPassword);
    console.log('Comparison with wrong password:', isValid2);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPasswordHash();