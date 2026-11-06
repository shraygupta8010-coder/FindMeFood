const pool = require('./config/database');

async function fixNgoColumns() {
  try {
    console.log('🔧 Fixing missing columns in ngo_profiles table...');

    // Columns to add
    const missingColumns = [
      { name: 'contact_person', type: 'TEXT' },
      { name: 'website', type: 'TEXT' },
      { name: 'registration_number', type: 'TEXT' }
    ];

    for (let column of missingColumns) {
      try {
        // Check if column already exists
        const columnCheck = await pool.query(
          `PRAGMA table_info(ngo_profiles)`
        );
        
        const columnExists = columnCheck.rows.some(col => col.name === column.name);
        
        if (!columnExists) {
          await pool.query(
            `ALTER TABLE ngo_profiles ADD COLUMN ${column.name} ${column.type}`
          );
          console.log(`✅ Added column: ${column.name}`);
        } else {
          console.log(`ℹ️ Column ${column.name} already exists`);
        }
      } catch (error) {
        console.log(`⚠️ Could not add column ${column.name}: ${error.message}`);
      }
    }

    console.log('🎉 NGO profiles table fix completed!');

    // Verify the fix
    const finalCheck = await pool.query(`PRAGMA table_info(ngo_profiles)`);
    console.log('📋 Final ngo_profiles columns:', finalCheck.rows.map(c => c.name));

  } catch (error) {
    console.error('❌ Fix error:', error);
  }
}

// Run the fix
fixNgoColumns().then(() => {
  console.log('Column fix process completed');
  process.exit(0);
});