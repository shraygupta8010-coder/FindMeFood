const http = require('http');

function testRegistration() {
  const postData = JSON.stringify({
    email: 'testuser@example.com',
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

    console.log(`📝 Response Status: ${res.statusCode}`);

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Registration Response:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.success) {
          console.log('\n🎉 REGISTRATION SUCCESSFUL!');
          console.log('📧 Check your server terminal for the verification email simulation!');
          console.log('🔗 Look for: "Verification Link: http://localhost:5000/api/auth/verify/..."');
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.write(postData);
  req.end();
}

// Make sure server is running first
console.log('🚀 Testing registration...');
console.log('⚠️  Make sure your server is running with: npm start');
testRegistration();