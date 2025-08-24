// Test with CORRECT API structure as provided by user
// This will use the exact API structure from the user's training assigning website

const testData = {
  userId: '68aab7310e17c845daa50352',
  trainingId: '68aaf9559782e8652d5a8ba1',  // Current training: test abhiram
};

async function testCorrectAPIStructure() {
  console.log('🧪 Testing with CORRECT API Structure...\n');
  console.log('🎯 Current Training: test abhiram');
  console.log('Training ID:', testData.trainingId);
  console.log('Using CORRECT API structure from user documentation\n');

  try {
    // Step 1: Get training progress with CORRECT API structure
    console.log('1️⃣ Getting training progress with CORRECT API structure...');
    const response = await fetch(`https://lms-testenv.onrender.com/api/user/getAll/trainingprocess?userId=${testData.userId}&trainingId=${testData.trainingId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API Response received!');
      console.log('📊 Full API Response:', JSON.stringify(result, null, 2));
      
      let moduleId = null;
      let videoId = null;
      
      // Method 1: Extract from CORRECT API structure (result.data.trainingId.modules)
      if (result.data && result.data.trainingId && result.data.trainingId.modules && result.data.trainingId.modules.length > 0) {
        const module = result.data.trainingId.modules[0];
        if (module.videos && module.videos.length > 0) {
          const video = module.videos[0];
          moduleId = module._id;  // Using _id from trainingId.modules
          videoId = video._id;    // Using _id from trainingId.modules.videos
          
          console.log('✅ SUCCESS: Found IDs from CORRECT API structure (trainingId.modules):', {
            moduleId: moduleId,
            videoId: videoId,
            moduleName: module.moduleName,
            videoTitle: video.title
          });
        }
      }
      
      // Method 2: Extract from progress structure (result.data.modules) as fallback
      if (!moduleId && result.data && result.data.modules && result.data.modules.length > 0) {
        const module = result.data.modules[0];
        if (module.videos && module.videos.length > 0) {
          const video = module.videos[0];
          moduleId = module.moduleId;  // Using moduleId from progress modules
          videoId = video.videoId;     // Using videoId from progress modules
          
          console.log('✅ SUCCESS: Found IDs from progress structure (data.modules):', {
            moduleId: moduleId,
            videoId: videoId
          });
        }
      }
      
      if (moduleId && videoId) {
        // Step 2: Test progress update with detected IDs
        console.log('\n2️⃣ Testing progress update with CORRECT IDs...');
        const progressResponse = await fetch(`https://lms-testenv.onrender.com/api/user/update/trainingprocess?userId=${testData.userId}&trainingId=${testData.trainingId}&moduleId=${moduleId}&videoId=${videoId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (progressResponse.ok) {
          const progressResult = await progressResponse.json();
          console.log('✅ Progress update successful with CORRECT API structure!');
          console.log('📊 Progress Response:', JSON.stringify(progressResult, null, 2));
          
          // Step 3: Verify the update
          console.log('\n3️⃣ Verifying the update...');
          const verifyResponse = await fetch(`https://lms-testenv.onrender.com/api/user/getAll/trainingprocess?userId=${testData.userId}&trainingId=${testData.trainingId}`, {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
              'Content-Type': 'application/json'
            }
          });
          
          if (verifyResponse.ok) {
            const verifyResult = await verifyResponse.json();
            console.log('✅ Verification successful!');
            console.log('📊 Updated Completion Percentage:', verifyResult.data?.completionPercentage);
          }
        } else {
          console.log('❌ Progress update failed:', progressResponse.status);
          console.log('Response:', await progressResponse.text());
        }
      } else {
        console.log('❌ Could not extract module/video IDs from API response');
      }
    } else {
      console.log('❌ Failed to get training progress:', response.status);
      console.log('Response:', await response.text());
    }

    console.log('\n🎉 CORRECT API Structure test completed!');
    console.log('📱 Now check your assigning website to see if 0.00% has changed!');
    console.log('🌐 URL: https://lms-testenv-q8co.vercel.app/assigtraining/68aaf9559782e8652d5a8ba1');

  } catch (error) {
    console.error('❌ Error testing CORRECT API structure:', error.message);
  }
}

// Run the test
testCorrectAPIStructure();
