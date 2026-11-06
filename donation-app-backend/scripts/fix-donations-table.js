// fix-donations-table.js
const pool = require('./config/database');

async function fixDonationsTable() {
  try {
    console.log('🔧 Checking donations table structure...');
    
    // Check current table structure
    const tableInfo = await pool.query("PRAGMA table_info(donations)");
    console.log('📋 Current donations table columns:');
    tableInfo.rows.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });
    
    // Check if verification_data column exists
    const hasVerificationData = tableInfo.rows.some(col => col.name === 'verification_data');
    
    if (!hasVerificationData) {
      console.log('❌ verification_data column missing. Adding it now...');
      
      // SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS, so we need to be careful
      try {
        await pool.query(`
          ALTER TABLE donations 
          ADD COLUMN verification_data TEXT
        `);
        console.log('✅ Added verification_data column to donations table');
      } catch (alterError) {
        console.log('⚠️ Column might already exist:', alterError.message);
      }
    } else {
      console.log('✅ verification_data column already exists');
    }
    
    // Also check if pickup_time column exists (common missing column)
    const hasPickupTime = tableInfo.rows.some(col => col.name === 'pickup_time');
    if (!hasPickupTime) {
      console.log('❌ pickup_time column missing. Adding it now...');
      try {
        await pool.query(`
          ALTER TABLE donations 
          ADD COLUMN pickup_time TEXT
        `);
        console.log('✅ Added pickup_time column to donations table');
      } catch (alterError) {
        console.log('⚠️ Column might already exist:', alterError.message);
      }
    } else {
      console.log('✅ pickup_time column already exists');
    }
    
    console.log('🎉 Donations table structure updated successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing donations table:', error);
  }
}

fixDonationsTable();