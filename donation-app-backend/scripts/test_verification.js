const http = require('http');

// Use your actual token from the link
const verificationToken = 'abc123def456...'; // REPLACE WITH YOUR ACTUAL TOKEN

function testVerification() {
  console.log('🔗 Testing email verification...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/auth/verify/${verificationToken}`,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    console.log(`📧 Verification Response Status: ${res.statusCode}`);

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Verification Response:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.success) {
          console.log('\n🎉 EMAIL VERIFIED SUCCESSFULLY!');
          console.log('✅ User can now login!');
        }
      } catch (error) {
        console.log('📄 Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.end();
}

testVerification();
