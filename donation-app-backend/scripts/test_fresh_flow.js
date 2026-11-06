const http = require('http');

async function testFreshFlow() {
  console.log('🚀 Testing FRESH Registration & Verification Flow\n');
  
  const testEmail = `test${Date.now()}@example.com`;
  console.log('📧 Using email:', testEmail);
  
  // Step 1: Register new user
  console.log('1. 📝 Registering new user...');
  const result = await registerUser(testEmail);
  
  if (result.success) {
    console.log('   ✅ Registration successful!');
    console.log('   👤 User ID:', result.data.user.id);
    
    // The token will appear in your SERVER terminal
    console.log('\n📧 Check your SERVER terminal for the NEW verification link!');
    console.log('🔗 Then paste that link in your browser to verify.');
  }
}

function registerUser(email) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: email,
      password: 'password123',
      full_name: 'Test User',
      phone: '1234567890'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

testFreshFlow();
