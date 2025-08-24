// Debug script to check what's actually in your training data
// This will help us understand the video/module structure

const BASE_URL = 'https://lms-testenv.onrender.com';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0';

// Your actual IDs
const realIds = {
  userId: '68aab7310e17c845daa50352',
  trainingId: '68aae52917665863bf7979df',
  moduleId: '68173662b95f4caae809067e',
  videoId: '68aae53017665863bf7979ec'
};

async function debugTrainingData() {
  console.log('🔍 Debugging Training Data Structure...\n');
  
  try {
    // Step 1: Check training progress data
    console.log('1️⃣ Checking training progress data...');
    const progressUrl = `${BASE_URL}/api/user/getAll/trainingprocess?userId=${realIds.userId}&trainingId=${realIds.trainingId}`;
    
    const progressResponse = await fetch(progressUrl, {
      headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (progressResponse.ok) {
      const progressData = await progressResponse.json();
      console.log('✅ Training progress data found');
      console.log('📊 Full progress data:', JSON.stringify(progressData, null, 2));
      
      if (progressData.data && progressData.data.modules) {
        console.log('\n📁 Modules found:', progressData.data.modules.length);
        
        progressData.data.modules.forEach((module, index) => {
          console.log(`\nModule ${index + 1}:`);
          console.log(`  🆔 Module ID: ${module.moduleId}`);
          console.log(`  ✅ Module Pass: ${module.pass}`);
          
          if (module.videos && module.videos.length > 0) {
            console.log(`  🎬 Videos: ${module.videos.length}`);
            module.videos.forEach((video, videoIndex) => {
              console.log(`    Video ${videoIndex + 1}:`);
              console.log(`      🆔 Video ID: ${video.videoId}`);
              console.log(`      ✅ Video Pass: ${video.pass}`);
            });
          } else {
            console.log(`  ❌ No videos found in this module`);
          }
        });
      } else {
        console.log('❌ No modules found in training progress');
      }
    } else {
      console.log(`❌ Failed to get training progress: ${progressResponse.status}`);
      const errorText = await progressResponse.text();
      console.log('Error:', errorText);
    }

    // Step 2: Check module progress specifically
    console.log('\n2️⃣ Checking specific module progress...');
    const moduleUrl = `${BASE_URL}/api/user/getAll/trainingprocess/module?userId=${realIds.userId}&trainingId=${realIds.trainingId}&moduleId=${realIds.moduleId}`;
    
    const moduleResponse = await fetch(moduleUrl, {
      headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (moduleResponse.ok) {
      const moduleData = await moduleResponse.json();
      console.log('✅ Module progress data found');
      console.log('📊 Module data:', JSON.stringify(moduleData, null, 2));
    } else {
      console.log(`❌ Failed to get module progress: ${moduleResponse.status}`);
      const errorText = await moduleResponse.text();
      console.log('Error:', errorText);
    }

    // Step 3: Try different API endpoints to understand structure
    console.log('\n3️⃣ Trying alternative endpoints...');
    
    // Try getting training by ID
    const trainingDetailUrl = `${BASE_URL}/api/get/training/${realIds.trainingId}`;
    try {
      const trainingDetailResponse = await fetch(trainingDetailUrl, {
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        }
      });
      
      if (trainingDetailResponse.ok) {
        const trainingDetail = await trainingDetailResponse.json();
        console.log('✅ Training detail found');
        console.log('📚 Training structure:', JSON.stringify(trainingDetail, null, 2));
      }
    } catch (error) {
      console.log('⚠️ Training detail endpoint not available');
    }

    // Step 4: Check if we need to create video entry first
    console.log('\n4️⃣ Testing if video needs to be created first...');
    
    // Try a simpler approach - just mark module as in progress
    const simpleUpdateUrl = `${BASE_URL}/api/user/update/trainingprocess?userId=${realIds.userId}&trainingId=${realIds.trainingId}&moduleId=${realIds.moduleId}`;
    
    const simpleResponse = await fetch(simpleUpdateUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (simpleResponse.ok) {
      const result = await simpleResponse.json();
      console.log('✅ Module-only update worked!');
      console.log('Response:', result);
    } else {
      const errorText = await simpleResponse.text();
      console.log(`❌ Module-only update failed: ${simpleResponse.status}`);
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugTrainingData();
