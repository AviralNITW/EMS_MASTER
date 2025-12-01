import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testAdminLogin() {
  try {
    console.log('🚀 Testing admin login...');
    const response = await axios.post(`${API_BASE}/auth/admin/login`, {
      email: 'admin@example.com',
      password: '123'
    });
    
    console.log('✅ Admin login successful!');
    console.log('Token:', response.data.token);
    
    // Test getting admin profile
    const profileResponse = await axios.get(`${API_BASE}/admin/me`, {
      headers: { 'x-auth-token': response.data.token }
    });
    
    console.log('\n📋 Admin Profile:');
    console.log('ID:', profileResponse.data._id);
    console.log('Name:', profileResponse.data.name);
    console.log('Email:', profileResponse.data.email);
    console.log('Number of employees:', profileResponse.data.employees?.length || 0);
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Admin test failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function testEmployeeLogin() {
  try {
    console.log('\n🚀 Testing employee login...');
    const response = await axios.post(`${API_BASE}/auth/employee/login`, {
      email: 'e@e.com',
      password: '123'
    });
    
    console.log('✅ Employee login successful!');
    console.log('Employee data:', response.data);
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Employee test failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Run all tests
async function runTests() {
  try {
    console.log('🔍 Starting authentication tests...\n');
    
    // Test admin login
    await testAdminLogin();
    
    // Test employee login
    await testEmployeeLogin();
    
    console.log('\n✨ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Some tests failed!');
    process.exit(1);
  }
}

runTests();
