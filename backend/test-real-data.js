const axios = require('axios');

// Test script specifically for your actual data structure
const API_BASE = 'http://localhost:5000/api';

// Your actual training data
const USER_ID = 'Emp257';
const TRAINING_ID = '68abf3dd52fbf4892aff2878';
const MODULE_ID = '68173662b95f4caae809067e';
const VIDEO_ID = '68abf3e352fbf4892aff2893';

async function testWithRealData() {
  console.log('🎯 Testing Video Progress with Your Actual Training Structure');
  console.log('=' .repeat(65));
  console.log(`📚 Training: "test" (ID: ${TRAINING_ID})`);
  console.log(`👤 Employee: ${USER_ID}`);
  console.log(`📖 Module ID: ${MODULE_ID}`);
  console.log(`🎥 Video ID: ${VIDEO_ID}`);
  console.log('=' .repeat(65));

  try {
    // Step 1: Test getting assigned trainings
    console.log('\n1️⃣ Testing: Get assigned trainings for Emp257...');
    try {
      const trainingsResponse = await axios.get(`${API_BASE}/trainings/user/${USER_ID}/assigned-trainings`);
      console.log('✅ Assigned trainings API works!');
      console.log(`📊 Found ${trainingsResponse.data.count} training(s)`);
      
      if (trainingsResponse.data.data && trainingsResponse.data.data.length > 0) {
        trainingsResponse.data.data.forEach((training, index) => {
          console.log(`   ${index + 1}. ${training.title} (Progress: ${training.progress}%)`);
        });
      }
    } catch (error) {
      console.log('❌ Get assigned trainings failed:', error.response?.data?.message || error.message);
    }

    // Step 2: Test getting training details
    console.log('\n2️⃣ Testing: Get training details...');
    try {
      const detailsResponse = await axios.get(`${API_BASE}/trainings/user/${USER_ID}/training/${TRAINING_ID}/details`);
      console.log('✅ Training details API works!');
      console.log('📋 Training Details:', {
        title: detailsResponse.data.data.title,
        progress: detailsResponse.data.data.progress,
        status: detailsResponse.data.data.status,
        modules: detailsResponse.data.data.modules.length
      });
    } catch (error) {
      console.log('❌ Get training details failed:', error.response?.data?.message || error.message);
      console.log('💡 This might be because the endpoint doesn\'t exist yet or data structure mismatch');
    }

    // Step 3: Test video progress update
    console.log('\n3️⃣ Testing: Video progress update...');
    try {
      const progressData = {
        watchTime: 180, // 3 minutes
        totalDuration: 600, // 10 minutes
        completed: false
      };

      console.log('📊 Sending progress data:', progressData);
      
      const progressResponse = await axios.put(
        `${API_BASE}/trainings/user/${USER_ID}/training/${TRAINING_ID}/module/${MODULE_ID}/video/${VIDEO_ID}/progress`,
        progressData
      );

      console.log('✅ Video progress update works!');
      console.log('📈 Response:', progressResponse.data);
      
    } catch (error) {
      console.log('❌ Video progress update failed:', error.response?.data?.message || error.message);
      
      if (error.response?.status === 404) {
        console.log('💡 This endpoint might not be implemented yet');
      } else if (error.response?.status === 400) {
        console.log('💡 Check if the request data format is correct');
      }
    }

    // Step 4: Test with existing endpoint structure
    console.log('\n4️⃣ Testing: Existing training progress update...');
    try {
      const basicProgressData = {
        progress: 30 // 30% completion
      };

      const basicProgressResponse = await axios.put(
        `${API_BASE}/trainings/user/${USER_ID}/training/${TRAINING_ID}/progress`,
        basicProgressData
      );

      console.log('✅ Basic training progress update works!');
      console.log('📈 Response:', basicProgressResponse.data);
      
    } catch (error) {
      console.log('❌ Basic training progress update failed:', error.response?.data?.message || error.message);
    }

    console.log('\n📋 Test Summary:');
    console.log('=' .repeat(50));
    console.log('This test checks which APIs are working with your current setup.');
    console.log('Based on the results above, we can see what needs to be implemented.');

  } catch (error) {
    console.error('❌ General test error:', error.message);
  }
}

// Also test if server is running
async function checkServerHealth() {
  try {
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Server is running!');
    console.log('📊 Server status:', healthResponse.data);
    return true;
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('💡 Make sure to start your backend server first:');
    console.log('   cd backend && npm start');
    return false;
  }
}

async function runFullTest() {
  console.log('🚀 Starting Real Data Integration Test\n');
  
  const serverRunning = await checkServerHealth();
  
  if (serverRunning) {
    await testWithRealData();
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Make sure your backend server is running');
  console.log('2. Check which APIs are working vs which need implementation');
  console.log('3. Update the backend to support video-level progress tracking');
  console.log('4. Test with your consumption site');
}

// Run the test
if (require.main === module) {
  runFullTest();
}

module.exports = { testWithRealData, checkServerHealth };

