// setupContactTable.js
const pool = require('./config/database');

async function setupContactTable() {
  try {
    console.log('🔄 Setting up contact_messages table...');
    
    // First, let's check what tables already exist
    const existingTables = await pool.query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Existing tables:');
    existingTables.rows.forEach(table => {
      console.log(`- ${table.name}`);
    });
    
    // SQL to create the contact_messages table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        status VARCHAR(20) DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Execute the SQL
    await pool.query(createTableSQL);
    console.log('✅ Contact messages table created successfully!');
    
    // Verify the table was created
    const checkTableSQL = "SELECT name FROM sqlite_master WHERE type='table' AND name='contact_messages'";
    const result = await pool.query(checkTableSQL);
    
    if (result.rows.length > 0) {
      console.log('✅ Table verification: contact_messages exists');
      
      // Show table structure
      const tableInfo = await pool.query("PRAGMA table_info(contact_messages)");
      console.log('\n📊 Table Structure:');
      console.log('-------------------');
      tableInfo.rows.forEach(col => {
        console.log(`- ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
      });
    } else {
      console.log('❌ Table verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error setting up contact table:', error);
  } finally {
    console.log('\n🎉 Setup completed!');
    // Don't close the pool for SQLite
  }
}

// Run the setup
setupContactTable();