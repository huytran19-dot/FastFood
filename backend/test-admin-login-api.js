const http = require('http');

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login API...\n');
    
    const postData = JSON.stringify({
      email: 'huy@gmail.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/login',
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
        console.log('Status:', res.statusCode);
        
        if (res.statusCode === 200) {
          console.log('✅ Login successful!');
          const response = JSON.parse(data);
          console.log('\n📦 Response data:');
          console.log('  Token:', response.token ? response.token.substring(0, 30) + '...' : 'N/A');
          console.log('  User ID:', response.user?.id);
          console.log('  Email:', response.user?.email);
          console.log('  Full Name:', response.user?.full_name);
          console.log('  Role:', response.user?.role);
          console.log('\n🍪 Cookies:', res.headers['set-cookie'] || 'None');
        } else {
          console.error('❌ Login failed!');
          console.error('Response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed!');
      console.error('Error:', error.message);
    });

    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Error:', error.message);
  }
}

testAdminLogin();
