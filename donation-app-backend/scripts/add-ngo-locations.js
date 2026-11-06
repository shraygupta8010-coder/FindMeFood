const pool = require('./config/database');

async function addNGOLocations() {
  try {
    console.log('🗺️ Adding sample locations to NGOs...\n');
    
    // Get all NGOs
    const ngos = await pool.query(`
      SELECT n.id, n.name, np.id as profile_id 
      FROM ngo n 
      JOIN ngo_profiles np ON n.id = np.ngo_id
    `);
    
    console.log(`📊 Found ${ngos.rows.length} NGOs to update`);
    
    // Sample locations in major Indian cities
    const sampleLocations = [
      // Delhi locations
      { lat: 28.6139, lng: 77.2090, city: 'Delhi' },
      { lat: 28.5355, lng: 77.3910, city: 'Noida' },
      { lat: 28.4595, lng: 77.0266, city: 'Gurgaon' },
      
      // Mumbai locations
      { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
      { lat: 19.2183, lng: 72.9781, city: 'Mumbai Suburbs' },
      { lat: 19.0176, lng: 72.8561, city: 'South Mumbai' },
      
      // Bangalore locations
      { lat: 12.9716, lng: 77.5946, city: 'Bangalore' },
      { lat: 13.0225, lng: 77.5946, city: 'Bangalore North' },
      
      // Chennai locations
      { lat: 13.0827, lng: 80.2707, city: 'Chennai' },
      
      // Kolkata locations
      { lat: 22.5726, lng: 88.3639, city: 'Kolkata' }
    ];
    
    let updatedCount = 0;
    
    for (let i = 0; i < ngos.rows.length; i++) {
      const ngo = ngos.rows[i];
      const location = sampleLocations[i % sampleLocations.length]; // Cycle through locations
      
      const address = {
        street: `Sample Street ${i + 1}`,
        city: location.city,
        state: 'Sample State',
        pincode: '1100' + (i + 10)
      };
      
      await pool.query(
        `UPDATE ngo_profiles 
         SET latitude = ?, longitude = ?, address = ?, contact_person = ?, phone = ?
         WHERE id = ?`,
        [
          location.lat,
          location.lng,
          JSON.stringify(address),
          `Contact Person ${i + 1}`,
          `987654321${i}`,
          ngo.profile_id
        ]
      );
      
      console.log(`✅ Updated ${ngo.name} with location: ${location.city}`);
      updatedCount++;
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} NGOs with location data!`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

addNGOLocations();