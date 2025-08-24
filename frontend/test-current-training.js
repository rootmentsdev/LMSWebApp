// Test the current training: 68aaf9559782e8652d5a8ba1 (test abhiram)
// This will diagnose why the automatic integration isn't working

const currentTrainingData = {
  userId: '68aab7310e17c845daa50352',
  trainingId: '68aaf9559782e8652d5a8ba1',  // Current training: test abhiram
};

async function diagnoseCurrentTraining() {
  console.log('🔍 Diagnosing Current Training Integration...\n');
  console.log('🎯 Current Training: test abhiram');
  console.log('Training ID:', currentTrainingData.trainingId);
  console.log('Current Status: 0.00% (Pending)\n');

  try {
    // Step 1: Check if training exists in LMS
    console.log('1️⃣ Checking if training exists in LMS...');
    const response = await fetch(`https://lms-testenv.onrender.com/api/user/getAll/trainingprocess?userId=${currentTrainingData.userId}&trainingId=${currentTrainingData.trainingId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Training found in LMS!');
      console.log('📊 Training Details:', JSON.stringify(result, null, 2));
      
      if (result.data && result.data.modules && result.data.modules.length > 0) {
        const module = result.data.modules[0];
        if (module.videos && module.videos.length > 0) {
          const video = module.videos[0];
          
          console.log('✅ Found module and video:', {
            moduleId: module.moduleId,
            videoId: video.videoId,
            modulePass: module.pass,
            videoPass: video.pass
          });
          
          // Step 2: Test progress update
          console.log('\n2️⃣ Testing progress update...');
          const progressResponse = await fetch(`https://lms-testenv.onrender.com/api/user/update/trainingprocess?userId=${currentTrainingData.userId}&trainingId=${currentTrainingData.trainingId}&moduleId=${module.moduleId}&videoId=${video.videoId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (progressResponse.ok) {
            const progressResult = await progressResponse.json();
            console.log('✅ Progress update successful!');
            console.log('📊 Response:', JSON.stringify(progressResult, null, 2));
            
            // Step 3: Verify the update
            console.log('\n3️⃣ Verifying the update...');
            const verifyResponse = await fetch(`https://lms-testenv.onrender.com/api/user/getAll/trainingprocess?userId=${currentTrainingData.userId}&trainingId=${currentTrainingData.trainingId}`, {
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
              
              if (verifyResult.data?.modules && verifyResult.data.modules.length > 0) {
                const updatedModule = verifyResult.data.modules[0];
                console.log('🔹 Updated Module Pass:', updatedModule.pass);
                
                if (updatedModule.videos && updatedModule.videos.length > 0) {
                  const updatedVideo = updatedModule.videos[0];
                  console.log('🎬 Updated Video Pass:', updatedVideo.pass);
                }
              }
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
      console.log('❌ Training not found in LMS:', response.status);
      console.log('Response:', await response.text());
      
      // Try alternative method
      console.log('\n🔍 Trying alternative method: Check all trainings...');
      const allTrainingsResponse = await fetch(`https://lms-testenv.onrender.com/api/get/Full/allusertraining`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
          'Content-Type': 'application/json'
        }
      });
      
      if (allTrainingsResponse.ok) {
        const result = await allTrainingsResponse.json();
        const ourTraining = result.data?.find(t => t.trainingId === currentTrainingData.trainingId);
        
        if (ourTraining) {
          console.log('✅ Training found in all trainings list:', {
            trainingName: ourTraining.trainingName,
            numberOfModules: ourTraining.numberOfModules,
            userProgress: ourTraining.userProgress?.length || 0
          });
        } else {
          console.log('❌ Training not found in all trainings list');
        }
      }
    }

    console.log('\n🎉 Diagnosis completed!');
    console.log('📱 Now check your assigning website to see if 0.00% has changed!');
    console.log('🌐 URL: https://lms-testenv-q8co.vercel.app/assigtraining/68aaf9559782e8652d5a8ba1');

  } catch (error) {
    console.error('❌ Error diagnosing training:', error.message);
  }
}

// Run the diagnosis
diagnoseCurrentTraining();
