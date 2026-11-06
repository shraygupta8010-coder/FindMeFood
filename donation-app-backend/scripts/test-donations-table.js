// test-donations-table.js
const pool = require('./config/database');

async function testDonationsTable() {
  try {
    console.log('🧪 Testing donations table structure...');
    
    // Check current table structure
    const tableInfo = await pool.query("PRAGMA table_info(donations)");
    console.log('📋 Current donations table columns:');
    tableInfo.rows.forEach(col => {
      console.log(`   ✅ ${col.name} (${col.type})`);
    });
    
    // Check if all required columns exist
    const requiredColumns = ['id', 'user_id', 'food_type', 'location', 'status', 'verification_data', 'pickup_time'];
    const existingColumns = tableInfo.rows.map(col => col.name);
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('🎉 All required columns are present!');
      
      // Test inserting a sample donation
      console.log('🧪 Testing donation insertion...');
      try {
        const testResult = await pool.query(`
          INSERT INTO donations (user_id, food_type, location, status) 
          VALUES (1, 'Test Food', '{"address": "Test Address"}', 'pending')
        `);
        console.log('✅ Test donation inserted successfully!');
        
        // Clean up test data
        await pool.query('DELETE FROM donations WHERE user_id = 1 AND food_type = "Test Food"');
        console.log('🧹 Test data cleaned up');
        
      } catch (insertError) {
        console.log('❌ Test insertion failed:', insertError.message);
      }
      
    } else {
      console.log('❌ Missing columns:', missingColumns);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDonationsTable();