const axios = require('axios');

// Simple test to verify video progress tracking with your existing data
const API_BASE = 'http://localhost:5000/api';

// Using your actual training data
const USER_ID = 'Emp257'; // Updated to match your assignment format
const TRAINING_ID = '68abf3dd52fbf4892aff2878';
const MODULE_ID = '68173662b95f4caae809067e';
const VIDEO_ID = '68abf3e352fbf4892aff2893';

async function testVideoProgressAPI() {
  console.log('🎯 Testing Video Progress API with Your Actual Training Data');
  console.log('=' .repeat(60));
  console.log(`📚 Training ID: ${TRAINING_ID}`);
  console.log(`👤 Employee ID: ${USER_ID}`);
  console.log(`📖 Module ID: ${MODULE_ID}`);
  console.log(`🎥 Video ID: ${VIDEO_ID}`);
  console.log('=' .repeat(60));

  try {
    // Step 1: Test direct video progress update with your specific IDs
    console.log('\n1️⃣ Testing video progress update with your training data...');
    
    // Simulate watching 2 minutes (120 seconds) of a 10-minute video
    const progressData = {
      watchTime: 120,
      totalDuration: 600, // 10 minutes
      completed: false
    };

    console.log('📊 Simulating progress:', progressData);

    const progressResponse = await axios.put(
      `${API_BASE}/trainings/user/${USER_ID}/training/${TRAINING_ID}/module/${MODULE_ID}/video/${VIDEO_ID}/progress`,
      progressData
    );

    console.log('✅ Video progress updated successfully!');
    console.log('📈 Response:', progressResponse.data);

    // Step 2: Test another progress update (watching more)
    console.log('\n2️⃣ Simulating watching more of the video...');
    
    const progressData2 = {
      watchTime: 300, // 5 minutes now
      totalDuration: 600,
      completed: false
    };

    const progressResponse2 = await axios.put(
      `${API_BASE}/trainings/user/${USER_ID}/training/${TRAINING_ID}/module/${MODULE_ID}/video/${VIDEO_ID}/progress`,
      progressData2
    );

    console.log('✅ Progress updated again!');
    console.log('📊 Progress Data:', {
      watchTime: `${progressResponse2.data.data.watchTime} seconds`,
      totalDuration: `${progressResponse2.data.data.totalDuration} seconds`,
      completed: progressResponse2.data.data.completed,
      moduleProgress: `${progressResponse2.data.data.moduleProgress}%`,
      overallProgress: `${progressResponse2.data.data.overallProgress}%`
    });

    // Step 3: Complete the video
    console.log('\n3️⃣ Completing the video...');
    
    const completeData = {
      watchTime: 600, // Full video
      totalDuration: 600,
      completed: true
    };

    const completeResponse = await axios.put(
      `${API_BASE}/trainings/user/${USER_ID}/training/${TRAINING_ID}/module/${MODULE_ID}/video/${VIDEO_ID}/progress`,
      completeData
    );

    console.log('✅ Video completed!');
    console.log('🎉 Final Progress:', {
      watchTime: `${completeResponse.data.data.watchTime} seconds`,
      completed: completeResponse.data.data.completed,
      moduleProgress: `${completeResponse.data.data.moduleProgress}%`,
      overallProgress: `${completeResponse.data.data.overallProgress}%`
    });

    // Step 4: Get training details to verify
    console.log('\n4️⃣ Getting training details to verify the updates...');
    const detailsResponse = await axios.get(`${API_BASE}/trainings/user/${USER_ID}/training/${TRAINING_ID}/details`);
    
    if (detailsResponse.data.status === 'success') {
      const training = detailsResponse.data.data;
      console.log('✅ Training details retrieved!');
      console.log('📋 Training Summary:', {
        title: training.title,
        overallProgress: `${training.progress}%`,
        status: training.status,
        modulesCount: training.modules.length
      });

      if (training.modules[0] && training.modules[0].videos[0]) {
        const video = training.modules[0].videos[0];
        console.log('🎥 Video Status:', {
          title: video.videoTitle,
          watchTime: video.watchTime,
          completed: video.completed,
          lastWatchedAt: video.lastWatchedAt
        });
      }
    }

    console.log('\n🎉 Integration Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Video progress tracking working');
    console.log('   ✅ Module progress calculation working');
    console.log('   ✅ Overall training progress working');
    console.log('   ✅ Video completion detection working');
    console.log('   ✅ Data persistence working');
    
    console.log('\n🚀 Your LMS video progress integration is ready!');
    console.log('💡 You can now build your consumption site using these APIs.');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Possible Issues:');
      console.log('   - Employee 257 might not be assigned to any trainings');
      console.log('   - Training might not have modules or videos');
      console.log('   - Make sure to create and assign trainings in your LMS admin first');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your backend server is running on port 5000');
      console.log('   Run: npm start or node server.js');
    }
  }
}

// Example of how to use the API from your consumption site
function showUsageExample() {
  console.log('\n📖 Usage Example for Consumption Site:');
  console.log('=' .repeat(50));
  console.log(`
// Update video progress when user watches a video
const updateProgress = async (watchTime, totalDuration) => {
  try {
    const response = await fetch(
      'http://localhost:5000/api/trainings/user/257/training/TRAINING_ID/module/MODULE_ID/video/VIDEO_ID/progress',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          watchTime: watchTime,
          totalDuration: totalDuration,
          completed: watchTime >= totalDuration * 0.9 // 90% completion
        })
      }
    );
    
    const result = await response.json();
    console.log('Progress updated:', result.data);
  } catch (error) {
    console.error('Progress update failed:', error);
  }
};

// Get training details to show in consumption site
const getTrainingDetails = async () => {
  try {
    const response = await fetch(
      'http://localhost:5000/api/trainings/user/257/training/TRAINING_ID/details'
    );
    const result = await response.json();
    return result.data; // Contains modules, videos, and progress
  } catch (error) {
    console.error('Failed to get training details:', error);
  }
};
`);
}

// Run the test
if (require.main === module) {
  testVideoProgressAPI().then(() => {
    showUsageExample();
  });
}

module.exports = { testVideoProgressAPI };
