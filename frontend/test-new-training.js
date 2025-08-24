// Test the new training: 68aaf7929782e8652d5a7212 (abhiram tester 2)
// This will verify if our dynamic integration works for this training

const newTrainingData = {
  userId: '68aab7310e17c845daa50352',
  trainingId: '68aaf7929782e8652d5a7212',  // New training: abhiram tester 2
};

async function testNewTraining() {
  console.log('🧪 Testing New Training Integration...\n');
  console.log('🎯 New Training: abhiram tester 2');
  console.log('Training ID:', newTrainingData.trainingId);
  console.log('Current Status: 0.00% (Pending)\n');

  try {
    // Step 1: Auto-detect LMS IDs for this new training
    console.log('1️⃣ Auto-detecting LMS IDs for new training...');
    const response = await fetch(`https://lms-testenv.onrender.com/api/user/getAll/trainingprocess?userId=${newTrainingData.userId}&trainingId=${newTrainingData.trainingId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Training data retrieved successfully!');
      
      if (result.data && result.data.modules && result.data.modules.length > 0) {
        const module = result.data.modules[0];
        if (module.videos && module.videos.length > 0) {
          const video = module.videos[0];
          
          console.log('✅ Auto-detected LMS IDs:', {
            moduleId: module.moduleId,
            videoId: video.videoId
          });
          
          // Step 2: Test progress update with detected IDs
          console.log('\n2️⃣ Testing progress update for new training...');
          const progressResponse = await fetch(`https://lms-testenv.onrender.com/api/user/update/trainingprocess?userId=${newTrainingData.userId}&trainingId=${newTrainingData.trainingId}&moduleId=${module.moduleId}&videoId=${video.videoId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (progressResponse.ok) {
            const progressResult = await progressResponse.json();
            console.log('✅ Progress update successful for new training!');
            console.log('📊 Response:', JSON.stringify(progressResult, null, 2));
            
            // Step 3: Verify the update
            console.log('\n3️⃣ Verifying the update...');
            const verifyResponse = await fetch(`https://lms-testenv.onrender.com/api/user/getAll/trainingprocess?userId=${newTrainingData.userId}&trainingId=${newTrainingData.trainingId}`, {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
                'Content-Type': 'application/json'
              }
            });
            
            if (verifyResponse.ok) {
              const verifyResult = await verifyResponse.json();
              console.log('✅ Verification successful!');
              console.log('📊 Updated Status:', verifyResult.data?.status);
              console.log('📊 Updated Pass:', verifyResult.data?.pass);
            }
          } else {
            console.log('❌ Progress update failed:', progressResponse.status);
            console.log('Response:', await progressResponse.text());
          }
        } else {
          console.log('❌ No videos found in module');
        }
      } else {
        console.log('❌ No modules found in training');
      }
    } else {
      console.log('❌ Failed to get training data:', response.status);
      console.log('Response:', await response.text());
    }

    console.log('\n🎉 New Training Test Completed!');
    console.log('📱 Now check your assigning website to see if 0.00% has changed!');
    console.log('🌐 URL: https://lms-testenv-q8co.vercel.app/assigtraining/68aaf7929782e8652d5a7212');

  } catch (error) {
    console.error('❌ Error testing new training:', error.message);
  }
}

// Run the test
testNewTraining();
