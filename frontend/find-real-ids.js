// Script to find real IDs from your LMS data
// This will help us get actual userId, trainingId, moduleId, and videoId

const BASE_URL = 'https://lms-testenv.onrender.com';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0';

async function findRealIds() {
  console.log('🔍 Finding Real IDs from Your LMS...\n');

  try {
    // Step 1: Get all trainings
    console.log('1️⃣ Getting all trainings...');
    const trainingResponse = await fetch(`${BASE_URL}/api/get/Full/allusertraining`, {
      headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (!trainingResponse.ok) {
      throw new Error(`Failed to get trainings: ${trainingResponse.status}`);
    }

    const trainingResult = await trainingResponse.json();
    console.log(`✅ Found ${trainingResult.data?.length || 0} trainings\n`);

    // Step 2: Find a training with userProgress
    let selectedTraining = null;
    let selectedUser = null;

    for (const training of trainingResult.data || []) {
      if (training.userProgress && training.userProgress.length > 0) {
        selectedTraining = training;
        selectedUser = training.userProgress[0];
        break;
      }
    }

    if (!selectedTraining) {
      console.log('❌ No trainings found with user progress');
      
      // Show available trainings
      console.log('\n📋 Available trainings:');
      (trainingResult.data || []).slice(0, 5).forEach((training, index) => {
        console.log(`${index + 1}. ${training.trainingName} (ID: ${training.trainingId})`);
      });
      
      console.log('\n💡 You need to assign users to trainings first in your LMS system.');
      return;
    }

    console.log('2️⃣ Found training with user progress:');
    console.log(`📚 Training: ${selectedTraining.trainingName}`);
    console.log(`🆔 Training ID: ${selectedTraining.trainingId}`);
    console.log(`👤 User ID: ${selectedUser.userId}\n`);

    // Step 3: Get detailed training progress
    console.log('3️⃣ Getting detailed training progress...');
    const progressResponse = await fetch(`${BASE_URL}/api/user/getAll/trainingprocess?userId=${selectedUser.userId}&trainingId=${selectedTraining.trainingId}`, {
      headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (progressResponse.ok) {
      const progressResult = await progressResponse.json();
      console.log('✅ Training progress found');
      
      if (progressResult.data && progressResult.data.modules && progressResult.data.modules.length > 0) {
        const firstModule = progressResult.data.modules[0];
        console.log(`📁 Module ID: ${firstModule.moduleId}`);
        
        if (firstModule.videos && firstModule.videos.length > 0) {
          const firstVideo = firstModule.videos[0];
          console.log(`🎬 Video ID: ${firstVideo.videoId}`);
          
          // Step 4: Test with real IDs
          console.log('\n4️⃣ Testing with real IDs...');
          await testWithRealIds(selectedUser.userId, selectedTraining.trainingId, firstModule.moduleId, firstVideo.videoId);
        } else {
          console.log('❌ No videos found in module');
        }
      } else {
        console.log('❌ No modules found in training progress');
      }
    } else {
      console.log(`❌ Failed to get training progress: ${progressResponse.status}`);
    }

    // Step 5: Show summary
    console.log('\n📋 REAL IDS FOUND:');
    console.log('='.repeat(50));
    console.log(`👤 User ID: ${selectedUser.userId}`);
    console.log(`📚 Training ID: ${selectedTraining.trainingId}`);
    
    if (progressResult?.data?.modules?.[0]) {
      console.log(`📁 Module ID: ${progressResult.data.modules[0].moduleId}`);
      if (progressResult.data.modules[0].videos?.[0]) {
        console.log(`🎬 Video ID: ${progressResult.data.modules[0].videos[0].videoId}`);
      }
    }

  } catch (error) {
    console.error('❌ Error finding real IDs:', error.message);
  }
}

async function testWithRealIds(userId, trainingId, moduleId, videoId) {
  try {
    console.log(`🧪 Testing progress update with real IDs...`);
    
    const testUrl = `${BASE_URL}/api/user/update/trainingprocess?userId=${userId}&trainingId=${trainingId}&moduleId=${moduleId}&videoId=${videoId}`;
    
    const response = await fetch(testUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      console.log('🎉 SUCCESS! Progress update worked with real IDs');
      console.log('✅ Response:', result.message);
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed with real IDs: ${response.status}`);
      console.log(`📄 Response: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Error testing with real IDs:', error.message);
  }
}

// Run the script
findRealIds();
