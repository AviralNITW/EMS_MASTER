import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

async function testAdminLogin() {
  try {
    // Test admin login
    console.log('Testing admin login...');
    const loginResponse = await axios.post(`${API_URL}/login`, {
      email: 'admin@example.com',
      password: '123',
      isAdmin: true
    });
    
    console.log('✅ Admin login successful!');
    console.log('Token:', loginResponse.data.token);
    
    // Test getting admin data
    console.log('\nFetching admin data...');
    const adminResponse = await axios.get(`${API_URL}/me`, {
      headers: {
        'x-auth-token': loginResponse.data.token
      }
    });
    
    console.log('✅ Admin data retrieved successfully!');
    console.log('Admin ID:', adminResponse.data._id);
    console.log('Number of employees:', adminResponse.data.employees?.length || 0);
    
    return loginResponse.data.token;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Run the test
testAdminLogin()
  .then(() => console.log('\n✅ All tests completed successfully!'))
  .catch(() => console.log('\n❌ Some tests failed!'));
