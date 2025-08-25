// Test script to verify progression tracking integration
// Run this in your browser console when on the training page

console.log('🧪 PROGRESSION TRACKING TEST SCRIPT');
console.log('===================================');

// Test function to validate training data and get correct IDs
async function getValidTrainingIds(userId, trainingId) {
  console.log('📋 Getting valid training IDs...');
  
  try {
    const response = await fetch(`https://lms-testenv.onrender.com/api/user/getAll/trainingprocess?userId=${userId}&trainingId=${trainingId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Training data retrieved:', result);
      
      let moduleId = null;
      let videoId = null;
      
      if (result.data && result.data.trainingId && result.data.trainingId.modules && result.data.trainingId.modules.length > 0) {
        const module = result.data.trainingId.modules[0];
        if (module.videos && module.videos.length > 0) {
          const video = module.videos[0];
          moduleId = module._id;
          videoId = video._id;
          console.log('✅ Valid IDs found:', { moduleId, videoId });
          return { moduleId, videoId, trainingData: result };
        }
      }
      
      console.log('❌ No valid module/video structure found in training data');
      return null;
    } else {
      console.log('❌ Failed to get training data:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting training data:', error);
    return null;
  }
}

// Test function to simulate video progression
async function testVideoProgression() {
  console.log('🎬 Starting video progression test...');
  
  // Get user data from localStorage
  const employeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');
  const userId = employeeData.employeeId || '68aab7310e17c845daa50352';
  
  // Use a known working training ID from your debug script
  const trainingId = '68aaf9559782e8652d5a8ba1';
  
  console.log('📋 Test Parameters:', {
    userId,
    trainingId
  });
  
  // Step 1: Get valid IDs from the training data
  const validIds = await getValidTrainingIds(userId, trainingId);
  if (!validIds) {
    console.log('❌ Cannot proceed without valid training IDs');
    return;
  }
  
  const { moduleId, videoId } = validIds;
  
  try {
    // Test 1: Video Completion with Valid IDs
    console.log('\n📊 Testing video completion with valid IDs...');
    console.log('🎯 Using IDs:', { userId, trainingId, moduleId, videoId });
    
    const completionTest = await fetch(`https://lms-testenv.onrender.com/api/user/update/trainingprocess?userId=${userId}&trainingId=${trainingId}&moduleId=${moduleId}&videoId=${videoId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (completionTest.ok) {
      const result = await completionTest.json();
      console.log('✅ Video Completion Test - SUCCESS:', result);
      
      if (result.data?.trainingProgress?.pass) {
        console.log('🎉 TRAINING COMPLETED!');
        console.log(`📊 Training: ${result.data.trainingProgress.trainingName}`);
        console.log(`📊 Status: ${result.data.trainingProgress.status}`);
      } else {
        console.log('📊 Video marked as completed, training still in progress');
      }
    } else {
      const errorText = await completionTest.text();
      console.log('❌ Video Completion Test - FAILED:', completionTest.status);
      console.log('❌ Error Response:', errorText);
    }
    
    // Test 2: Check current progress
    console.log('\n🔍 Checking updated training progress...');
    const progressCheck = await fetch(`https://lms-testenv.onrender.com/api/user/getAll/trainingprocess?userId=${userId}&trainingId=${trainingId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      }
    });
    
    if (progressCheck.ok) {
      const currentProgress = await progressCheck.json();
      console.log('✅ Current Progress Check - SUCCESS:', currentProgress);
      
      if (currentProgress.data?.trainingProgress) {
        const progress = currentProgress.data.trainingProgress;
        console.log(`📊 Current Training Status: ${progress.status}`);
        console.log(`📊 Training Pass: ${progress.pass}`);
        console.log(`📊 Training Name: ${progress.trainingName}`);
      }
    } else {
      console.log('❌ Progress Check - FAILED:', progressCheck.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Helper function to test with different video IDs
function testWithVideoId(trainingId, moduleId, videoId) {
  console.log(`🧪 Testing with Training: ${trainingId}, Module: ${moduleId}, Video: ${videoId}`);
  
  // Update the test video data
  const testVideo = { _id: videoId, moduleId, trainingId, title: 'Custom Test Video' };
  
  // Run the test
  testVideoProgression();
}

// Instructions
console.log('\n📝 HOW TO USE THIS TEST:');
console.log('1. Open your browser developer tools');
console.log('2. Navigate to your LMS Web training page');
console.log('3. Run: testVideoProgression()');
console.log('4. Or test with specific IDs: testWithVideoId("trainingId", "moduleId", "videoId")');
console.log('\n🎯 The test will:');
console.log('   - Test 25% progress tracking');
console.log('   - Test 50% progress (completion)');
console.log('   - Check final training status');
console.log('\n💡 Expected Result:');
console.log('   - Progress should update in your LMS dashboard');
console.log('   - Training should show as completed');
console.log('   - You should see 100% completion in the LMS interface');

// Make functions available globally
window.testVideoProgression = testVideoProgression;
window.testWithVideoId = testWithVideoId;

console.log('\n🚀 Test functions loaded! Run testVideoProgression() to start testing.');
