const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'donation_app.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing database schema...');

const sqlCommands = [
  // Fix ngo_profiles table
  "ALTER TABLE ngo_profiles ADD COLUMN latitude REAL",
  "ALTER TABLE ngo_profiles ADD COLUMN longitude REAL", 
  "ALTER TABLE ngo_profiles ADD COLUMN service_radius INTEGER DEFAULT 10",
  
  // Fix user_profiles table
  "ALTER TABLE user_profiles ADD COLUMN address TEXT",
  "ALTER TABLE user_profiles ADD COLUMN city TEXT",
  "ALTER TABLE user_profiles ADD COLUMN state TEXT", 
  "ALTER TABLE user_profiles ADD COLUMN pincode TEXT",
  
  // Fix donations table
  "ALTER TABLE donations ADD COLUMN verification_data TEXT",
  "ALTER TABLE donations ADD COLUMN food_source TEXT"
];

function runCommand(command, index) {
  return new Promise((resolve, reject) => {
    db.run(command, function(err) {
      if (err) {
        if (err.message.includes('duplicate column name')) {
          console.log(`✅ Column already exists: ${command}`);
        } else {
          console.log(`⚠️  Note: ${err.message}`);
        }
      } else {
        console.log(`✅ Executed: ${command}`);
      }
      resolve();
    });
  });
}

async function runAllFixes() {
  console.log('🚀 Starting database fixes...');
  
  for (let i = 0; i < sqlCommands.length; i++) {
    await runCommand(sqlCommands[i], i);
  }
  
  // Verify tables
  console.log('\n📊 Verifying tables...');
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.log('❌ Error listing tables:', err);
    } else {
      console.log('✅ All tables:', tables.map(t => t.name));
      
      // Check ngo_profiles structure
      db.all("PRAGMA table_info(ngo_profiles)", (err, columns) => {
        console.log('\n🔍 ngo_profiles columns:');
        columns.forEach(col => {
          console.log(`   ${col.name} (${col.type})`);
        });
        
        console.log('\n🎉 Database fixes completed!');
        db.close();
      });
    }
  });
}

runAllFixes().catch(console.error);