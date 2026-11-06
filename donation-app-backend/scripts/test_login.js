const http = require('http');

function testLogin() {
  const postData = JSON.stringify({
    email: 'test1762878279039@example.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    console.log(`🔐 Login Response Status: ${res.statusCode}`);

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Login Response:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.success) {
          console.log('\n🎉 LOGIN SUCCESSFUL!');
          console.log('✅ Email verification system is working perfectly!');
          console.log('🔑 Token received:', result.data.token ? 'YES' : 'NO');
        } else {
          console.log('❌ Login failed:', result.message);
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

console.log('🚀 Testing login after verification...');
console.log('📧 Using email: test1762878279039@example.com');
testLogin();