const pool = require('./config/database');

async function checkNGOData() {
  try {
    console.log('🔍 Checking current NGO data...\n');
    
    // Check ngo table
    const ngos = await pool.query('SELECT * FROM ngo');
    console.log(`📊 Total NGOs: ${ngos.rows.length}`);
    
    ngos.rows.forEach(ngo => {
      console.log(`   - ID: ${ngo.id}, Name: ${ngo.name}, Email: ${ngo.email}`);
    });
    
    // Check ngo_profiles table structure
    console.log('\n📋 ngo_profiles table structure:');
    const profilesInfo = await pool.query(`PRAGMA table_info(ngo_profiles)`);
    profilesInfo.rows.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });
    
    // Check ngo_profiles data
    console.log('\n👥 NGO Profiles data:');
    const profiles = await pool.query(`
      SELECT np.*, n.name, n.email 
      FROM ngo_profiles np 
      JOIN ngo n ON np.ngo_id = n.id
    `);
    
    profiles.rows.forEach(profile => {
      console.log(`   - NGO: ${profile.name}`);
      console.log(`     Contact: ${profile.contact_person || 'Not set'}`);
      console.log(`     Phone: ${profile.phone || 'Not set'}`);
      console.log(`     Location: ${profile.latitude ? `${profile.latitude}, ${profile.longitude}` : 'Not set'}`);
      console.log('     ---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

checkNGOData();