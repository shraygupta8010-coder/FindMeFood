const pool = require('./config/database');

async function addSampleNGOs() {
  try {
    console.log('🏢 Adding sample NGOs to database...');

    // Sample NGOs for Delhi area
    const sampleNGOs = [
      {
        name: 'Robin Hood Army',
        email: 'delhi@robinhoodarmy.com',
        description: 'Food distribution to the underprivileged across Delhi',
        phone: '9876543210',
        contact_person: 'Neel Ghose',
        website: 'https://robinhoodarmy.com',
        registration_number: 'NGO12345',
        address: 'Connaught Place, New Delhi, Delhi 110001',
        latitude: 28.632808,
        longitude: 77.219721,
        service_radius: 15
      },
      {
        name: 'Feeding India',
        email: 'delhi@feedingindia.org',
        description: 'Hunger relief and food rescue organization',
        phone: '9876543211',
        contact_person: 'Ankit Kawatra',
        website: 'https://feedingindia.org',
        registration_number: 'NGO12346',
        address: 'Saket, New Delhi, Delhi 110017',
        latitude: 28.527516,
        longitude: 77.219104,
        service_radius: 20
      },
      {
        name: 'No Food Waste',
        email: 'delhi@nofoodwaste.org',
        description: 'Reducing food waste and fighting hunger in Delhi',
        phone: '9876543212',
        contact_person: 'Padmanaban Gopalan',
        website: 'https://nofoodwaste.org',
        registration_number: 'NGO12347',
        address: 'Lajpat Nagar, New Delhi, Delhi 110024',
        latitude: 28.569847,
        longitude: 77.243241,
        service_radius: 12
      },
      {
        name: 'Delhi Food Bank',
        email: 'info@delhifoodbank.org',
        description: 'Food storage and distribution for needy families',
        phone: '9876543213',
        contact_person: 'Rahul Singh',
        website: 'https://delhifoodbank.org',
        registration_number: 'NGO12348',
        address: 'Karol Bagh, New Delhi, Delhi 110005',
        latitude: 28.651718,
        longitude: 77.190849,
        service_radius: 10
      },
      {
        name: 'Annapurna Foundation',
        email: 'contact@annapurnafoundation.org',
        description: 'Providing meals to homeless and underprivileged',
        phone: '9876543214',
        contact_person: 'Priya Sharma',
        website: 'https://annapurnafoundation.org',
        registration_number: 'NGO12349',
        address: 'Rajouri Garden, New Delhi, Delhi 110027',
        latitude: 28.650848,
        longitude: 77.121939,
        service_radius: 8
      }
    ];

    let addedCount = 0;

    for (let ngoData of sampleNGOs) {
      try {
        // Check if NGO already exists
        const existingNGO = await pool.query(
          'SELECT id FROM ngo WHERE email = ?',
          [ngoData.email]
        );

        if (existingNGO.rows.length === 0) {
          // Insert into ngo table
          await pool.query(
            'INSERT INTO ngo (name, email) VALUES (?, ?)',
            [ngoData.name, ngoData.email]
          );

          // Get the last inserted ID
          const ngoIdResult = await pool.query('SELECT last_insert_rowid() as id');
          const ngoId = ngoIdResult.rows[0].id;

          // Insert into ngo_profiles
          await pool.query(
            `INSERT INTO ngo_profiles 
            (ngo_id, description, phone, contact_person, website, registration_number, 
             address, latitude, longitude, service_radius, verified) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              ngoId,
              ngoData.description,
              ngoData.phone,
              ngoData.contact_person,
              ngoData.website,
              ngoData.registration_number,
              ngoData.address,
              ngoData.latitude,
              ngoData.longitude,
              ngoData.service_radius,
              1 // Mark as verified
            ]
          );

          console.log(`✅ Added NGO: ${ngoData.name}`);
          addedCount++;
        } else {
          console.log(`ℹ️ NGO already exists: ${ngoData.name}`);
        }
      } catch (error) {
        console.log(`⚠️ Error adding NGO ${ngoData.name}: ${error.message}`);
      }
    }

    console.log(`🎉 Added ${addedCount} new NGOs to database!`);

    // Verify the NGOs were added
    const ngoCount = await pool.query('SELECT COUNT(*) as count FROM ngo');
    const profileCount = await pool.query('SELECT COUNT(*) as count FROM ngo_profiles');
    
    console.log(`📊 Total NGOs in database: ${ngoCount.rows[0].count}`);
    console.log(`📊 Total NGO profiles: ${profileCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error adding sample NGOs:', error);
  }
}

// Run the function
addSampleNGOs().then(() => {
  console.log('Sample NGO addition completed');
  process.exit(0);
});