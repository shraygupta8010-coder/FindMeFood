const pool = require('./config/database');

async function addNGOLocation() {
  try {
    console.log('🗺️ Adding location fields to NGO tables...');
    
    // Add location fields to ngo_profiles table
    await pool.query(`
      ALTER TABLE ngo_profiles 
      ADD COLUMN latitude DECIMAL(10, 8),
      ADD COLUMN longitude DECIMAL(11, 8),
      ADD COLUMN address TEXT,
      ADD COLUMN service_radius INTEGER DEFAULT 10
    `);
    
    console.log('✅ NGO location fields added successfully!');
    
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ Location fields already exist');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    process.exit();
  }
}

addNGOLocation();
