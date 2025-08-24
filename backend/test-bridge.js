// Test script for Training Progress Bridge
// Run this to verify the bridge is working correctly

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/bridge';

// Test data - Using valid MongoDB ObjectId format (24 characters)
const testData = {
  userId: 'test-user-123',
  trainingId: '507f1f77bcf86cd799439011', // Valid ObjectId
  moduleId: '507f1f77bcf86cd799439012',   // Valid ObjectId
  videoId: '507f1f77bcf86cd799439013'     // Valid ObjectId
};

async function testBridge() {
  console.log('🧪 Testing Training Progress Bridge...\n');

  try {
    // Test 1: Update training progress
    console.log('1️⃣ Testing progress update...');
    const progressResponse = await axios.post(`${BASE_URL}/update-progress`, {
      ...testData,
      progress: 50,
      status: 'in_progress',
      action: 'video_progress'
    });
    console.log('✅ Progress update successful:', progressResponse.data.message);

    // Test 2: Handle video completion
    console.log('\n2️⃣ Testing video completion...');
    const completionResponse = await axios.post(`${BASE_URL}/video-completion`, {
      ...testData,
      duration: 120,
      watchTime: 120
    });
    console.log('✅ Video completion successful:', completionResponse.data.message);

    // Test 3: Get training progress
    console.log('\n3️⃣ Testing progress retrieval...');
    const progressGetResponse = await axios.get(`${BASE_URL}/progress/${testData.userId}/${testData.trainingId}`);
    console.log('✅ Progress retrieval successful:', progressGetResponse.data.message);

    // Test 4: Sync all progress
    console.log('\n4️⃣ Testing progress sync...');
    const syncResponse = await axios.post(`${BASE_URL}/sync-all-progress`);
    console.log('✅ Progress sync successful:', syncResponse.data.message);

    console.log('\n🎉 All bridge tests passed successfully!');
    console.log('\n📊 Test Results Summary:');
    console.log('   • Progress Update: ✅');
    console.log('   • Video Completion: ✅');
    console.log('   • Progress Retrieval: ✅');
    console.log('   • Progress Sync: ✅');

  } catch (error) {
    console.error('\n❌ Bridge test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure your backend server is running on port 5000');
    console.log('   2. Check that the bridge routes are properly registered');
    console.log('   3. Verify your database connection');
    console.log('   4. Check the server logs for detailed error information');
  }
}

// Run the test
if (require.main === module) {
  testBridge();
}

module.exports = { testBridge };
