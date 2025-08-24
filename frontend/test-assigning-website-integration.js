// Test integration with the correct IDs from your assigning website
// This will update the training that shows 0.00% on your LMS dashboard

const testData = {
  userId: '68aab7310e17c845daa50352',        // Real user ID from your LMS
  trainingId: '68aaf1f19782e8652d5a334f',    // Training ID from your assigning website
  moduleId: '68173662b95f4caae809067e',      // Module ID: "Educate the customer"
  videoId: '68173662b95f4caae809067f'        // Video ID: "Educate the customer"
};

async function testAssigningWebsiteIntegration() {
  console.log('🧪 Testing Integration with Assigning Website...\n');
  console.log('🎯 Target Training: abhiram s kumar');
  console.log('📊 Current Status: 0.00% (Pending)');
  console.log('🎬 Target Video: Educate the customer\n');

  try {
    // Test 1: Update training progress (mark video as completed)
    console.log('1️⃣ Marking video as completed...');
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
      console.log('✅ Video marked as completed successfully!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      
      // Check if the training status was updated
      if (result.data?.trainingProgress?.status) {
        console.log('🎯 Training Status Updated:', result.data.trainingProgress.status);
      }
      
      if (result.data?.trainingProgress?.modules) {
        const module = result.data.trainingProgress.modules[0];
        if (module?.videos && module.videos.length > 0) {
          const video = module.videos[0];
          console.log('🎬 Video Status Updated:', video.pass ? 'Completed' : 'Not Completed');
        }
      }
    } else {
      console.log('❌ Failed to mark video as completed:', progressResponse.status);
      console.log('Response:', await progressResponse.text());
      return;
    }

    // Test 2: Verify the update by getting current progress
    console.log('\n2️⃣ Verifying the update...');
    const verifyResponse = await fetch(`https://lms-testenv.onrender.com/api/user/getAll/trainingprocess?userId=${testData.userId}&trainingId=${testData.trainingId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
        'Content-Type': 'application/json'
      }
    });

    if (verifyResponse.ok) {
      const result = await verifyResponse.json();
      console.log('✅ Progress verification successful!');
      
      if (result.data) {
        const training = result.data;
        console.log('📊 Updated Training Details:');
        console.log('  Status:', training.status);
        console.log('  Pass:', training.pass);
        
        if (training.modules && training.modules.length > 0) {
          const module = training.modules[0];
          console.log('🔹 Module Status:', module.pass ? 'Completed' : 'Not Completed');
          
          if (module.videos && module.videos.length > 0) {
            const video = module.videos[0];
            console.log('🎬 Video Status:', video.pass ? 'Completed' : 'Not Completed');
          }
        }
      }
    } else {
      console.log('❌ Failed to verify progress:', verifyResponse.status);
    }

    console.log('\n🎉 Integration test completed!');
    console.log('📱 Now check your assigning website to see if the 0.00% has changed!');
    console.log('🌐 URL: https://lms-testenv-q8co.vercel.app/assigtraining/68aaf1f19782e8652d5a334f');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }
}

// Run the test
testAssigningWebsiteIntegration();
