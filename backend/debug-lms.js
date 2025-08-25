const axios = require('axios');

async function debugLMS() {
  try {
    console.log('🔍 Testing LMS API directly...\n');

    // Test the assigned trainings endpoint
    console.log('1️⃣ Testing: GET /api/lms/user/Emp257/assigned-trainings');
    const response = await axios.get('http://localhost:5000/api/lms/user/Emp257/assigned-trainings');
    console.log('✅ Response:', response.data);

    // Test training details
    console.log('\n2️⃣ Testing: GET /api/lms/user/Emp257/training/68abfe92d2cda156c26f9cbe/details');
    const detailsResponse = await axios.get('http://localhost:5000/api/lms/user/Emp257/training/68abfe92d2cda156c26f9cbe/details');
    console.log('✅ Training details:', detailsResponse.data);

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

debugLMS();
