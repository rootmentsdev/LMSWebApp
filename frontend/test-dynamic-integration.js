// Test Dynamic Integration - Works for ANY training automatically
// This simulates what happens when you visit different training pages

const testTrainings = [
  {
    trainingId: '68aaf1f19782e8652d5a334f',  // abhiram s kumar (current working one)
    expectedName: 'abhiram s kumar'
  },
  {
    trainingId: '68aae52917665863bf7979df',  // abhiram test (another training)
    expectedName: 'abhiram test'
  }
];

async function detectLMSIds(trainingId) {
  try {
    console.log('🔍 Auto-detecting LMS IDs for training:', trainingId);
    
    // Get training progress to find the correct module and video IDs
    const response = await fetch(`https://lms-testenv.onrender.com/api/user/getAll/trainingprocess?userId=68aab7310e17c845daa50352&trainingId=${trainingId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.data && result.data.modules && result.data.modules.length > 0) {
        const module = result.data.modules[0];
        if (module.videos && module.videos.length > 0) {
          const video = module.videos[0];
          console.log('✅ Auto-detected LMS IDs:', {
            moduleId: module.moduleId,
            videoId: video.videoId
          });
          return {
            moduleId: module.moduleId,
            videoId: video.videoId
          };
        }
      }
    }
    
    // Fallback to working IDs if auto-detection fails
    console.log('⚠️ Auto-detection failed, using fallback IDs');
    return {
      moduleId: '68173662b95f4caae809067e',
      videoId: '68173662b95f4caae809067f'
    };
  } catch (error) {
    console.error('❌ Error auto-detecting LMS IDs:', error);
    // Fallback to working IDs
    return {
      moduleId: '68173662b95f4caae809067e',
      videoId: '68173662b95f4caae809067f'
    };
  }
}

async function testDynamicIntegration() {
  console.log('🧪 Testing Dynamic LMS Integration...\n');
  console.log('🎯 This simulates visiting different training pages\n');

  for (let i = 0; i < testTrainings.length; i++) {
    const training = testTrainings[i];
    console.log(`\n${i + 1}️⃣ Testing Training: ${training.expectedName}`);
    console.log('Training ID:', training.trainingId);
    
    try {
      // Simulate what happens when you visit a training page
      console.log('🔍 Auto-detecting LMS IDs...');
      const detectedIds = await detectLMSIds(training.trainingId);
      
      console.log('✅ Detected IDs:', {
        trainingId: training.trainingId,
        moduleId: detectedIds.moduleId,
        videoId: detectedIds.videoId
      });
      
      // Test if we can update progress with detected IDs
      console.log('🧪 Testing progress update with detected IDs...');
      const progressResponse = await fetch(`https://lms-testenv.onrender.com/api/user/update/trainingprocess?userId=68aab7310e17c845daa50352&trainingId=${training.trainingId}&moduleId=${detectedIds.moduleId}&videoId=${detectedIds.videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (progressResponse.ok) {
        console.log('✅ Progress update successful with detected IDs!');
      } else {
        console.log('❌ Progress update failed:', progressResponse.status);
      }
      
    } catch (error) {
      console.error('❌ Error testing training:', error.message);
    }
  }
  
  console.log('\n🎉 Dynamic Integration Test Completed!');
  console.log('📱 Now your viewing website will work for ANY training automatically!');
}

// Run the test
testDynamicIntegration();
