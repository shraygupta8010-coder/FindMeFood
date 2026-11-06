const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function createRealTestUsers() {
  try {
    console.log('👤 Creating real test users...');
    
    // REAL test users with actual email addresses
    const testUsers = [
      {
        email: 'your-real-email@gmail.com', // REPLACE WITH ACTUAL EMAIL
        password: 'your-actual-password',   // REPLACE WITH ACTUAL PASSWORD
        full_name: 'Test User 1',
        phone: '1234567890'
      },
      {
        email: 'another-real-email@gmail.com', // REPLACE WITH ACTUAL EMAIL  
        password: 'another-actual-password',   // REPLACE WITH ACTUAL PASSWORD
        full_name: 'Test User 2',
        phone: '0987654321'
      }
    ];
    
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [userData.email]
      );
      
      if (existingUser.rows.length > 0) {
        console.log(`⚠️ User already exists: ${userData.email}`);
        
        // Update existing user with real password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await pool.query(
          'UPDATE users SET password = ?, is_verified = 1 WHERE email = ?',
          [hashedPassword, userData.email]
        );
        console.log(`✅ Updated password for: ${userData.email}`);
        
      } else {
        // Create new user with real credentials
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Insert into users table
        await pool.query(
          `INSERT INTO users (email, phone, password, is_verified) 
           VALUES (?, ?, ?, ?)`,
          [userData.email, userData.phone, hashedPassword, 1]
        );
        
        // Get user ID
        const lastId = await pool.query('SELECT last_insert_rowid() as id');
        const userId = lastId.rows[0].id;
        
        // Insert into user_profiles
        await pool.query(
          `INSERT INTO user_profiles (user_id, full_name, phone) 
           VALUES (?, ?, ?)`,
          [userId, userData.full_name, userData.phone]
        );
        
        console.log(`✅ Created new user: ${userData.email}`);
      }
      
      console.log(`🔑 Login credentials:`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log('---');
    }
    
    console.log('🎉 All real test users are ready!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createRealTestUsers();