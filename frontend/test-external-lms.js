// Test script for External LMS Integration
// This tests your external LMS API directly without the bridge

// Test data - using CORRECT IDs from debug output
const testData = {
  userId: '68aab7310e17c845daa50352',        // Real user ID from your LMS
  trainingId: '68aae52917665863bf7979df',    // Real training ID ("abhiram test")
  moduleId: '68173662b95f4caae809067e',      // Real module ID from your LMS
  videoId: '68173662b95f4caae809067f'       // CORRECT video ID from debug output
};

// Test external LMS API endpoints
async function testExternalLMS() {
  console.log('🧪 Testing External LMS Integration...\n');

  try {
    // Test 1: Update training progress
    console.log('1️⃣ Testing progress update...');
    const progressResponse = await fetch(`https://lms-testenv.onrender.com/api/user/update/trainingprocess?userId=${testData.userId}&trainingId=${testData.trainingId}&moduleId=${testData.moduleId}&videoId=${testData.videoId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (progressResponse.ok) {
      const result = await progressResponse.json();
      console.log('✅ Progress update successful:', result);
    } else {
      console.log('❌ Progress update failed:', progressResponse.status);
      console.log('Response:', await progressResponse.text());
    }

    // Test 2: Get training data
    console.log('\n2️⃣ Testing training data retrieval...');
    const trainingResponse = await fetch(`https://lms-testenv.onrender.com/api/get/Full/allusertraining`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      }
    });

    if (trainingResponse.ok) {
      const result = await trainingResponse.json();
      console.log('✅ Training data retrieved successfully');
      console.log('📊 Number of trainings:', result.data?.length || 0);
      
      // Show first training structure
      if (result.data && result.data.length > 0) {
        console.log('🔍 First training structure:', JSON.stringify(result.data[0], null, 2));
      }
    } else {
      console.log('❌ Training data retrieval failed:', trainingResponse.status);
      console.log('Response:', await trainingResponse.text());
    }

    console.log('\n🎉 External LMS tests completed!');

  } catch (error) {
    console.error('\n❌ External LMS test failed:', error.message);
  }
}

// Run the test
testExternalLMS();
