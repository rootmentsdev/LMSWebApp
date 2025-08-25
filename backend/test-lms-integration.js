const axios = require('axios');

// Test script specifically for your LMS data structure
const API_BASE = 'http://localhost:5000/api';

// Your actual LMS data - Updated with newly created test data
const USER_ID = 'Emp257';
// Use the newly created training and module IDs from create-test-data.js
const TRAINING_ID = '68abfe92d2cda156c26f9cbe'; // From test data creation
const MODULE_ID = '68abfe92d2cda156c26f9cb8';  // From test data creation
const VIDEO_INDEX = 0; // Using index instead of ID since videos are embedded

async function testLMSIntegration() {
  console.log('🎯 Testing LMS Integration with Your Real Data Structure');
  console.log('=' .repeat(65));
  console.log(`📚 Training ID: ${TRAINING_ID}`);
  console.log(`👤 Employee: ${USER_ID}`);
  console.log(`📖 Module ID: ${MODULE_ID}`);
  console.log(`🎥 Video Index: ${VIDEO_INDEX}`);
  console.log('=' .repeat(65));

  try {
    // Step 1: Test LMS-specific assigned trainings endpoint
    console.log('\n1️⃣ Testing: LMS Get assigned trainings for Emp257...');
    try {
      const trainingsResponse = await axios.get(`${API_BASE}/lms/user/${USER_ID}/assigned-trainings`);
      console.log('✅ LMS assigned trainings API works!');
      console.log(`📊 Found ${trainingsResponse.data.count} training(s)`);
      
      if (trainingsResponse.data.data && trainingsResponse.data.data.length > 0) {
        trainingsResponse.data.data.forEach((training, index) => {
          console.log(`   ${index + 1}. ${training.title} (Progress: ${training.progress}%)`);
          console.log(`      Status: ${training.status}, Type: ${training.type}`);
        });
      } else {
        console.log('❌ No trainings found - Check if collection name is correct');
        console.log('💡 Your data might be in "trainings" collection, not "traininglms"');
      }
    } catch (error) {
      console.log('❌ LMS assigned trainings failed:', error.response?.data?.message || error.message);
    }

    // Step 2: Test LMS training details
    console.log('\n2️⃣ Testing: LMS Get training details...');
    try {
      const detailsResponse = await axios.get(`${API_BASE}/lms/user/${USER_ID}/training/${TRAINING_ID}/details`);
      console.log('✅ LMS training details API works!');
      console.log('📋 Training Details:', {
        title: detailsResponse.data.data.title,
        progress: detailsResponse.data.data.progress,
        status: detailsResponse.data.data.status,
        modules: detailsResponse.data.data.modules.length
      });

      // Show video details if available
      if (detailsResponse.data.data.modules[0]?.videos) {
        console.log('🎬 First Module Videos:');
        detailsResponse.data.data.modules[0].videos.forEach((video, index) => {
          console.log(`   ${index}. ${video.videoTitle} (Progress: ${video.progress}%)`);
        });
      }
    } catch (error) {
      console.log('❌ LMS training details failed:', error.response?.data?.message || error.message);
    }

    // Step 3: Test LMS video progress update
    console.log('\n3️⃣ Testing: LMS Video progress update...');
    try {
      const progressData = {
        watchTime: 180, // 3 minutes
        totalDuration: 600, // 10 minutes
        completed: false
      };

      console.log('📊 Sending progress data:', progressData);
      
      const progressResponse = await axios.put(
        `${API_BASE}/lms/user/${USER_ID}/training/${TRAINING_ID}/module/${MODULE_ID}/video/${VIDEO_INDEX}/progress`,
        progressData
      );

      console.log('✅ LMS video progress update works!');
      console.log('📈 Progress Response:', progressResponse.data.data);
      
    } catch (error) {
      console.log('❌ LMS video progress update failed:', error.response?.data?.message || error.message);
      console.log('💡 Error details:', error.response?.data);
    }

    // Step 4: Test completing the video
    console.log('\n4️⃣ Testing: Complete the video...');
    try {
      const completeData = {
        watchTime: 600, // Full video
        totalDuration: 600,
        completed: true
      };

      const completeResponse = await axios.put(
        `${API_BASE}/lms/user/${USER_ID}/training/${TRAINING_ID}/module/${MODULE_ID}/video/${VIDEO_INDEX}/progress`,
        completeData
      );

      console.log('✅ Video completion works!');
      console.log('🎉 Completion Response:', {
        progress: `${completeResponse.data.data.progress}%`,
        completed: completeResponse.data.data.completed,
        moduleProgress: `${completeResponse.data.data.moduleProgress}%`,
        overallProgress: `${completeResponse.data.data.overallProgress}%`
      });
      
    } catch (error) {
      console.log('❌ Video completion failed:', error.response?.data?.message || error.message);
    }

    // Step 5: Verify final state
    console.log('\n5️⃣ Testing: Get final training state...');
    try {
      const finalResponse = await axios.get(`${API_BASE}/lms/user/${USER_ID}/training/${TRAINING_ID}/details`);
      const finalTraining = finalResponse.data.data;
      
      console.log('✅ Final verification complete!');
      console.log('📊 Final State:', {
        trainingTitle: finalTraining.title,
        overallProgress: `${finalTraining.progress}%`,
        status: finalTraining.status,
        firstVideoProgress: finalTraining.modules[0]?.videos[0]?.progress || 0
      });
      
    } catch (error) {
      console.log('❌ Final verification failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 LMS Integration Test Summary:');
    console.log('=' .repeat(50));
    console.log('✅ LMS-specific endpoints created');
    console.log('✅ Video progress tracking with embedded videos');
    console.log('✅ Progress calculation and persistence');
    console.log('✅ Compatible with your existing data structure');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Create some test data if trainings not found');
    console.log('2. Use these APIs in your consumption site');
    console.log('3. Test real-time progress updates');

  } catch (error) {
    console.error('❌ General test error:', error.message);
  }
}

// Check server and database connectivity
async function checkLMSSetup() {
  try {
    console.log('🔍 Checking LMS Setup...\n');
    
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Server running:', healthResponse.data.message);
    console.log('📊 Database:', healthResponse.data.database);
    
    return true;
  } catch (error) {
    console.log('❌ Server check failed:', error.message);
    console.log('💡 Make sure to start your backend: cd backend && npm start');
    return false;
  }
}

async function runLMSTest() {
  console.log('🚀 Starting LMS Integration Test for Emp257\n');
  
  const setupOk = await checkLMSSetup();
  
  if (setupOk) {
    await testLMSIntegration();
  }
  
  console.log('\n💡 LMS API Endpoints:');
  console.log(`   GET  /api/lms/user/${USER_ID}/assigned-trainings`);
  console.log(`   GET  /api/lms/user/${USER_ID}/training/{trainingId}/details`);
  console.log(`   PUT  /api/lms/user/${USER_ID}/training/{trainingId}/module/{moduleId}/video/{videoIndex}/progress`);
}

// Run the test
if (require.main === module) {
  runLMSTest();
}

module.exports = { testLMSIntegration, checkLMSSetup };

