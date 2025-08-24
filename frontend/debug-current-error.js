// Debug script to find the exact error you're experiencing
// Replace TRAINING_ID with your actual training ID

const TRAINING_ID = '68aaf9559782e8652d5a8ba1'; // Replace with your current training ID
const USER_ID = '68aab7310e17c845daa50352';

async function debugCurrentError() {
  console.log('🔍 DEBUGGING CURRENT ERROR...\n');
  console.log('Training ID:', TRAINING_ID);
  
  try {
    // Step 1: Test if we can get training data
    console.log('1️⃣ Testing training data retrieval...');
    const response = await fetch(`https://lms-testenv.onrender.com/api/user/getAll/trainingprocess?userId=${USER_ID}&trainingId=${TRAINING_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Training data retrieved successfully');
      
      // Step 2: Check if we can detect IDs
      let moduleId = null;
      let videoId = null;
      
      if (result.data && result.data.trainingId && result.data.trainingId.modules && result.data.trainingId.modules.length > 0) {
        const module = result.data.trainingId.modules[0];
        if (module.videos && module.videos.length > 0) {
          const video = module.videos[0];
          moduleId = module._id;
          videoId = video._id;
          console.log('✅ IDs detected successfully:', { moduleId, videoId });
        } else {
          console.log('❌ ERROR: No videos found in module');
          return;
        }
      } else {
        console.log('❌ ERROR: Training structure not found');
        console.log('Response structure:', JSON.stringify(result, null, 2));
        return;
      }
      
      // Step 3: Test progress update
      console.log('\n2️⃣ Testing progress update...');
      const updateResponse = await fetch(`https://lms-testenv.onrender.com/api/user/update/trainingprocess?userId=${USER_ID}&trainingId=${TRAINING_ID}&moduleId=${moduleId}&videoId=${videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (updateResponse.ok) {
        console.log('✅ Progress update successful!');
        const updateResult = await updateResponse.json();
        console.log('Status:', updateResult.data?.trainingProgress?.status);
      } else {
        console.log('❌ ERROR: Progress update failed');
        console.log('Status:', updateResponse.status);
        console.log('Response:', await updateResponse.text());
      }
      
    } else {
      console.log('❌ ERROR: Cannot get training data');
      console.log('Status:', response.status);
      console.log('Response:', await response.text());
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error);
  }
  
  console.log('\n🔍 Debug completed. Check the logs above for the specific error.');
}

// Run debug
debugCurrentError();
