// backend/fixUserProfilesTable.js
const pool = require('./config/database');

async function fixUserProfilesTable() {
  try {
    console.log('🔧 Fixing user_profiles table structure...\n');
    
    // Check current table structure
    const tableInfo = await pool.query("PRAGMA table_info(user_profiles)");
    console.log('📊 Current table structure:');
    tableInfo.rows.forEach(col => {
      console.log(`- ${col.name} (${col.type})`);
    });
    
    // Add missing columns if they don't exist
    const missingColumns = [
      { name: 'address', type: 'TEXT' },
      { name: 'city', type: 'VARCHAR(100)' },
      { name: 'state', type: 'VARCHAR(100)' },
      { name: 'pincode', type: 'VARCHAR(10)' },
      { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    console.log('\n➕ Adding missing columns...');
    for (const column of missingColumns) {
      try {
        await pool.query(`ALTER TABLE user_profiles ADD COLUMN ${column.name} ${column.type}`);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`✅ Column already exists: ${column.name}`);
        } else {
          console.log(`❌ Error adding ${column.name}:`, error.message);
        }
      }
    }
    
    // Check if preferences column exists and remove it (optional)
    try {
      const hasPreferences = tableInfo.rows.some(col => col.name === 'preferences');
      if (hasPreferences) {
        console.log('\n🗑️  Found old preferences column...');
        // We'll keep it for now to avoid data loss
        console.log('ℹ️ Keeping preferences column (can remove later if not needed)');
      }
    } catch (error) {
      console.log('ℹ️ Could not check preferences column');
    }
    
    console.log('\n🎉 User profiles table structure updated!');
    
    // Verify the new structure
    const newTableInfo = await pool.query("PRAGMA table_info(user_profiles)");
    console.log('\n📊 Updated table structure:');
    newTableInfo.rows.forEach(col => {
      console.log(`- ${col.name} (${col.type})`);
    });
    
    // Test with a sample user
    console.log('\n🧪 Testing with sample user...');
    const sampleUser = await pool.query(
      `SELECT u.id, u.email, up.full_name, up.address, up.city, up.state, up.pincode 
       FROM users u 
       LEFT JOIN user_profiles up ON u.id = up.user_id 
       LIMIT 1`
    );
    
    if (sampleUser.rows.length > 0) {
      console.log('✅ Sample user data:', sampleUser.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Error fixing table:', error);
  } finally {
    console.log('\n✨ Fix script completed!');
  }
}

// Run the function
fixUserProfilesTable();