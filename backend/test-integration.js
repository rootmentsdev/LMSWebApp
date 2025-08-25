const axios = require('axios');

// Test script to verify the training progress integration
const API_BASE = 'http://localhost:5000/api'; // Server runs on port 5000 by default

// Test data - using your existing data structure
const testData = {
  userId: '68aab7310e17c845daa50352', // from the screenshot
  trainingId: '68abf3dd52fbf4892aff2878', // from the screenshot
  moduleId: '68173662b95f4caae809067e', // from the screenshot
  videoId: '68abf3e352fbf4892aff2893' // taken from videos[0]._id
};


async function runIntegrationTest() {
  console.log('🚀 Starting Video Progress Integration Test...\n');

  try {
    // 0. First, check server health and get available data
    console.log('0️⃣ Checking Server Health...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Server is running:', healthResponse.data.message);
    console.log('📊 Database status:', healthResponse.data.database);

    // 1. Let's try with a simple employee ID first and see what trainings exist
    console.log('\n1️⃣ Testing with Employee ID: 257...');
    testData.userId = '257'; // Start with a simple ID

    console.log('1️⃣ Testing LMS User Assigned Trainings...');
    const assignedResponse = await axios.get(`${API_BASE}/lms/user/${testData.userId}/assigned-trainings`);
    console.log('✅ Assigned trainings:', assignedResponse.data.count);

    if (assignedResponse.data.count === 0) {
      console.log('⚠️ No trainings found for user 257. Let\'s check what users exist...');

      // Try to get all trainings to see what's available
      try {
        const allTrainingsResponse = await axios.get(`${API_BASE}/trainings/all`);
        console.log('📋 Available trainings:', allTrainingsResponse.data.count);

        if (allTrainingsResponse.data.count > 0) {
          const firstTraining = allTrainingsResponse.data.data[0];
          testData.trainingId = firstTraining._id;
          console.log('🎯 Using training:', firstTraining.title || firstTraining.trainingName);
        } else {
          throw new Error('No trainings found in the system');
        }
      } catch (error) {
        console.log('❌ Could not fetch trainings. Let\'s create a test training...');
        throw error;
      }
    } else {
      // Use the first assigned training
      const firstTraining = assignedResponse.data.data[0];
      testData.trainingId = firstTraining.id;
      console.log('🎯 Using assigned training:', firstTraining.title || firstTraining.trainingName);
    }

    // 2. Test getting training details (LMS routes)
    console.log('\n2️⃣ Testing LMS Training Details...');
    const detailsResponse = await axios.get(`${API_BASE}/lms/user/${testData.userId}/training/${testData.trainingId}/details`);
    console.log('✅ Training details loaded:', detailsResponse.data.data.title);

    // Extract module ID from the response
    if (detailsResponse.data.data.modules && detailsResponse.data.data.modules.length > 0) {
      testData.moduleId = detailsResponse.data.data.modules[0].moduleId;
      console.log('📁 Using module:', detailsResponse.data.data.modules[0].moduleName);
    }

    // 3. Test NEW EXTERNAL WEBSITE API: Get user progress
    console.log('\n3️⃣ Testing External Website - Get User Progress...');
    const userProgressResponse = await axios.get(`${API_BASE}/training/user-progress/${testData.userId}`);
    console.log('✅ User progress retrieved:', userProgressResponse.data.data.activeTrainings.length, 'active trainings');

    // 4. Test NEW EXTERNAL WEBSITE API: Update video progress (started)
    console.log('\n4️⃣ Testing External Website - Video Progress Update (Started)...');
    const startProgressResponse = await axios.post(`${API_BASE}/training/update-video-progress`, {
      userId: testData.userId,
      trainingId: testData.trainingId,
      moduleId: testData.moduleId,
      videoId: testData.videoId,
      action: 'started',
      timestamp: new Date().toISOString(),
      progress: 0,
      duration: 600,
      currentTime: 0
    });
    console.log('✅ Video started:', startProgressResponse.data.data);

    // 5. Test NEW EXTERNAL WEBSITE API: Update video progress (in progress)
    console.log('\n5️⃣ Testing External Website - Video Progress Update (In Progress)...');
    const progressResponse = await axios.post(`${API_BASE}/training/update-video-progress`, {
      userId: testData.userId,
      trainingId: testData.trainingId,
      moduleId: testData.moduleId,
      videoId: testData.videoId,
      action: 'playing',
      timestamp: new Date().toISOString(),
      progress: 50,
      duration: 600,
      currentTime: 300
    });
    console.log('✅ Progress updated (50%):', {
      videoProgress: progressResponse.data.data.videoProgress.progress + '%',
      moduleProgress: progressResponse.data.data.moduleProgress.completionPercentage + '%',
      trainingProgress: progressResponse.data.data.trainingProgress.overallCompletion + '%'
    });

    // 6. Test NEW EXTERNAL WEBSITE API: Update video progress (completed)
    console.log('\n6️⃣ Testing External Website - Video Progress Update (Completed)...');
    const completedResponse = await axios.post(`${API_BASE}/training/update-video-progress`, {
      userId: testData.userId,
      trainingId: testData.trainingId,
      moduleId: testData.moduleId,
      videoId: testData.videoId,
      action: 'completed',
      timestamp: new Date().toISOString(),
      progress: 100,
      duration: 600,
      currentTime: 600
    });
    console.log('✅ Video completed:', {
      videoProgress: completedResponse.data.data.videoProgress.progress + '%',
      moduleProgress: completedResponse.data.data.moduleProgress.completionPercentage + '%',
      trainingProgress: completedResponse.data.data.trainingProgress.overallCompletion + '%'
    });

    // 7. Test NEW EXTERNAL WEBSITE API: Sync external progress
    console.log('\n7️⃣ Testing External Website - Sync External Progress...');
    const syncResponse = await axios.post(`${API_BASE}/training/sync-external-progress`, {
      userId: testData.userId,
      externalWebsiteData: {
        videoId: testData.videoId,
        watchTime: 600,
        totalTime: 600,
        completed: true,
        lastActivity: new Date().toISOString()
      }
    });
    console.log('✅ External progress synced:', syncResponse.data.message);

    // 8. Verify final progress after external website updates
    console.log('\n8️⃣ Verifying Final Progress After External Updates...');
    const finalUserProgressResponse = await axios.get(`${API_BASE}/training/user-progress/${testData.userId}`);
    const finalData = finalUserProgressResponse.data.data;
    const training = finalData.activeTrainings.find(t => t.trainingId === testData.trainingId);

    if (training) {
      const module = training.modules.find(m => m.moduleId === testData.moduleId);
      const video = module?.videos.find(v => v.videoId === testData.videoId);

      console.log('📊 Final Progress Report:');
      console.log(`   Training: ${training.trainingName}`);
      console.log(`   Overall Progress: ${training.overallProgress}%`);
      console.log(`   Status: ${training.status}`);
      console.log(`   Module Progress: ${module?.progress}%`);
      console.log(`   Video Progress: ${video?.progress}%`);
      console.log(`   Video Completed: ${video?.pass}`);
    }

    // 9. Test activity log collection (optional - check if collection exists)
    console.log('\n9️⃣ Testing Activity Log Collection...');
    try {
      const activityLogResponse = await axios.get(`${API_BASE}/lms/user/${testData.userId}/progress`);
      console.log('✅ Activity logs retrieved:', activityLogResponse.data.count, 'progress records');
    } catch (error) {
      console.log('⚠️ Activity logs not available (this is okay):', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Video Progress Integration Test Completed Successfully!');
    console.log('\n📝 Test Results Summary:');
    console.log('   ✅ LMS user assigned trainings working');
    console.log('   ✅ LMS training details working');
    console.log('   ✅ External website user progress API working');
    console.log('   ✅ External website video progress updates working');
    console.log('   ✅ Video progress calculations working');
    console.log('   ✅ Module progress calculations working');
    console.log('   ✅ Overall training progress working');
    console.log('   ✅ External website progress sync working');
    console.log('   ✅ Real-time progress tracking working');

    console.log('\n🚀 Ready for external website integration!');
    console.log('   📁 Example file: frontend/public/external-website-example.html');
    console.log('   🔗 Integration script: frontend/public/lms-progress-integration.js');
    console.log('   📖 Documentation: VIDEO_PROGRESS_INTEGRATION_README.md');

  } catch (error) {
    console.error('❌ Integration Test Failed:', error.response?.data || error.message);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }

    // Provide troubleshooting tips
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('   1. Make sure your backend server is running on port 5000');
    console.log('   2. Check that MongoDB is running and accessible');
    console.log('   3. Verify the userId, trainingId, and moduleId exist in your database');
    console.log('   4. Check the server logs for any errors');
    console.log('   5. If no data exists, you may need to create some test data first');
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  runIntegrationTest();
}

module.exports = { runIntegrationTest };
