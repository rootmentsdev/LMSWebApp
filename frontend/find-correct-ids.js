// Find correct IDs for training 68aaf1f19782e8652d5a334f
// This will help us get the right module and video IDs

const testData = {
  userId: '68aab7310e17c845daa50352',        // Real user ID from your LMS
  trainingId: '68aaf1f19782e8652d5a334f',    // Training ID from your assigning website
};

async function findCorrectIDs() {
  console.log('🔍 Finding correct IDs for training:', testData.trainingId);
  console.log('User ID:', testData.userId);

  try {
    // Get training progress for this specific training
    console.log('\n1️⃣ Getting training progress...');
    const progressResponse = await fetch(`https://lms-testenv.onrender.com/api/user/getAll/trainingprocess?userId=${testData.userId}&trainingId=${testData.trainingId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      }
    });

    if (progressResponse.ok) {
      const result = await progressResponse.json();
      console.log('✅ Training progress retrieved:', JSON.stringify(result, null, 2));
      
      if (result.data && result.data.length > 0) {
        const training = result.data[0];
        console.log('\n📊 Training Details:');
        console.log('Training Name:', training.trainingName);
        console.log('Status:', training.status);
        console.log('Modules:', training.modules?.length || 0);
        
        if (training.modules && training.modules.length > 0) {
          training.modules.forEach((module, index) => {
            console.log(`\n🔹 Module ${index + 1}:`);
            console.log('  Module ID:', module.moduleId);
            console.log('  Module Name:', module.moduleName);
            console.log('  Pass:', module.pass);
            console.log('  Videos:', module.videos?.length || 0);
            
            if (module.videos && module.videos.length > 0) {
              module.videos.forEach((video, vIndex) => {
                console.log(`    🎬 Video ${vIndex + 1}:`);
                console.log('      Video ID:', video.videoId);
                console.log('      Video Name:', video.videoName);
                console.log('      Pass:', video.pass);
              });
            }
          });
        }
      }
    } else {
      console.log('❌ Failed to get training progress:', progressResponse.status);
      console.log('Response:', await progressResponse.text());
    }

    // Also try to get all user trainings to see if this training exists
    console.log('\n2️⃣ Getting all user trainings...');
    const allTrainingsResponse = await fetch(`https://lms-testenv.onrender.com/api/get/Full/allusertraining`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      }
    });

    if (allTrainingsResponse.ok) {
      const result = await allTrainingsResponse.json();
      console.log('✅ All trainings retrieved');
      
      // Find our specific training
      const ourTraining = result.data?.find(t => t.trainingId === testData.trainingId);
      if (ourTraining) {
        console.log('\n🎯 Found our training in all trainings:');
        console.log('Training ID:', ourTraining.trainingId);
        console.log('Training Name:', ourTraining.trainingName);
        console.log('Number of Modules:', ourTraining.numberOfModules);
        console.log('User Progress:', ourTraining.userProgress?.length || 0);
        
        if (ourTraining.userProgress && ourTraining.userProgress.length > 0) {
          console.log('\n📊 User Progress Details:');
          ourTraining.userProgress.forEach((progress, index) => {
            console.log(`Progress ${index + 1}:`, JSON.stringify(progress, null, 2));
          });
        }
      } else {
        console.log('❌ Training not found in all trainings list');
      }
    } else {
      console.log('❌ Failed to get all trainings:', allTrainingsResponse.status);
    }

  } catch (error) {
    console.error('❌ Error finding correct IDs:', error.message);
  }
}

// Run the script
findCorrectIDs();
