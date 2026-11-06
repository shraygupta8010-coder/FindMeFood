const pool = require('./config/database');

async function addNGOLocation() {
  try {
    console.log('🗺️ Adding location fields to NGO tables...');
    
    // Add location fields one by one to ngo_profiles table
    const columnsToAdd = [
      { name: 'latitude', type: 'DECIMAL(10, 8)' },
      { name: 'longitude', type: 'DECIMAL(11, 8)' },
      { name: 'address', type: 'TEXT' },
      { name: 'service_radius', type: 'INTEGER DEFAULT 10' },
      { name: 'contact_person', type: 'TEXT' },
      { name: 'website', type: 'TEXT' },
      { name: 'registration_number', type: 'TEXT' }
    ];
    
    for (const column of columnsToAdd) {
      try {
        await pool.query(`
          ALTER TABLE ngo_profiles 
          ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`✅ Column already exists: ${column.name}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('🎉 NGO location fields added successfully!');
    
    // Check current table structure
    console.log('\n📋 Current ngo_profiles structure:');
    const tableInfo = await pool.query(`PRAGMA table_info(ngo_profiles)`);
    tableInfo.rows.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

addNGOLocation();
