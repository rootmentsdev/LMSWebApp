// Test script to verify the external API integration
const axios = require('axios');

async function testExternalAPI() {
  console.log('🧪 Testing external API integration...');

  // Test parameters from user's example
  const testParams = {
    userId: '68aab7310e17c845daa50352',
    trainingId: '68ab07279782e8652d5b0e1c',
    moduleId: '68173662b95f4caae809067e',
    videoId: '68ab072e9782e8652d5b10df'
  };

  const API_BASE_URL = 'https://lms-testenv.onrender.com';
  const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0';

  try {
    console.log('📡 Calling external API with test parameters:', testParams);

    // Build the URL with query parameters
    const endpoint = '/api/user/update/trainingprocess';
    const url = `${API_BASE_URL}${endpoint}?userId=${testParams.userId}&trainingId=${testParams.trainingId}&moduleId=${testParams.moduleId}&videoId=${testParams.videoId}`;

    console.log('🌐 Making PATCH request to:', url);

    const response = await axios.patch(url, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    console.log('✅ External API call successful!');
    console.log('📡 Response:', response.data);
    return true;

  } catch (error) {
    console.error('❌ External API call failed:', error.message);
    console.error('❌ Error details:', error.response?.data || error);
    return false;
  }
}

// Run the test
testExternalAPI().then(success => {
  if (success) {
    console.log('🎉 Integration test passed!');
  } else {
    console.log('❌ Integration test failed!');
  }
  process.exit(success ? 0 : 1);
});
