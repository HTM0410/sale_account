const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login...');
    
    // Test admin credentials
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
        csrfToken: 'test'
      })
    });

    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.text();
    console.log('Login response:', loginData);

    if (loginResponse.ok) {
      console.log('✅ Admin login successful!');
    } else {
      console.log('❌ Admin login failed');
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error.message);
  }
}

testAdminLogin();
