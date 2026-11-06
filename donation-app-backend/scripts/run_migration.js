const pool = require('./config/database');

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    // Add password column
    await pool.query('ALTER TABLE users ADD COLUMN password TEXT');
    console.log('✅ Added password column');
    
    // Add is_verified column
    await pool.query('ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0');
    console.log('✅ Added is_verified column');
    
    // Add verification_token column
    await pool.query('ALTER TABLE users ADD COLUMN verification_token TEXT');
    console.log('✅ Added verification_token column');
    
    // Verify the changes
    const result = await pool.query("SELECT name FROM pragma_table_info('users')");
    console.log('\n📊 Updated users table columns:');
    result.rows.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    console.log('\n🎉 Database migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  Columns already exist - schema is up to date!');
      process.exit(0);
    }
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();