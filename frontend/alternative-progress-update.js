// Alternative approaches to update training progress
// Since the video might be from YouTube and not in the DB properly

const BASE_URL = 'https://lms-testenv.onrender.com';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0';

const realIds = {
  userId: '68aab7310e17c845daa50352',
  trainingId: '68aae52917665863bf7979df',
  moduleId: '68173662b95f4caae809067e',
  videoId: '68aae53017665863bf7979ec'
};

async function tryDifferentApproaches() {
  console.log('🔄 Trying Different Progress Update Approaches...\n');

  // Approach 1: Update without video ID (module level)
  console.log('1️⃣ Approach 1: Module-level update (no video ID)...');
  try {
    const url1 = `${BASE_URL}/api/user/update/trainingprocess?userId=${realIds.userId}&trainingId=${realIds.trainingId}&moduleId=${realIds.moduleId}`;
    
    const response1 = await fetch(url1, {
      method: 'PATCH',
      headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (response1.ok) {
      const result = await response1.json();
      console.log('✅ SUCCESS with module-level update!');
      console.log('Response:', result);
    } else {
      const error = await response1.text();
      console.log(`❌ Failed: ${response1.status} - ${error}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Approach 2: Training-level update only
  console.log('\n2️⃣ Approach 2: Training-level update (no module/video)...');
  try {
    const url2 = `${BASE_URL}/api/user/update/trainingprocess?userId=${realIds.userId}&trainingId=${realIds.trainingId}`;
    
    const response2 = await fetch(url2, {
      method: 'PATCH',
      headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (response2.ok) {
      const result = await response2.json();
      console.log('✅ SUCCESS with training-level update!');
      console.log('Response:', result);
    } else {
      const error = await response2.text();
      console.log(`❌ Failed: ${response2.status} - ${error}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Approach 3: Try POST method to create video entry first
  console.log('\n3️⃣ Approach 3: Create video entry first (POST)...');
  try {
    const url3 = `${BASE_URL}/api/user/update/trainingprocess`;
    
    const response3 = await fetch(url3, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        userId: realIds.userId,
        trainingId: realIds.trainingId,
        moduleId: realIds.moduleId,
        videoId: realIds.videoId,
        action: 'create_video_entry'
      })
    });

    if (response3.ok) {
      const result = await response3.json();
      console.log('✅ SUCCESS with POST method!');
      console.log('Response:', result);
    } else {
      const error = await response3.text();
      console.log(`❌ Failed: ${response3.status} - ${error}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Approach 4: Try with progress percentage
  console.log('\n4️⃣ Approach 4: Update with progress percentage...');
  try {
    const url4 = `${BASE_URL}/api/user/update/trainingprocess?userId=${realIds.userId}&trainingId=${realIds.trainingId}&moduleId=${realIds.moduleId}&videoId=${realIds.videoId}&progress=100&status=completed`;
    
    const response4 = await fetch(url4, {
      method: 'PATCH',
      headers: {
        'Authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (response4.ok) {
      const result = await response4.json();
      console.log('✅ SUCCESS with progress percentage!');
      console.log('Response:', result);
    } else {
      const error = await response4.text();
      console.log(`❌ Failed: ${response4.status} - ${error}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Approach 5: Try alternative endpoint patterns
  console.log('\n5️⃣ Approach 5: Try alternative endpoints...');
  
  const alternativeEndpoints = [
    '/api/user/training/update',
    '/api/user/training/progress',
    '/api/training/user/progress',
    '/api/user/complete/video',
    '/api/user/mark/video/complete'
  ];

  for (const endpoint of alternativeEndpoints) {
    try {
      console.log(`   Testing: ${endpoint}`);
      const url = `${BASE_URL}${endpoint}?userId=${realIds.userId}&trainingId=${realIds.trainingId}&moduleId=${realIds.moduleId}&videoId=${realIds.videoId}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ SUCCESS with ${endpoint}!`);
        console.log('   Response:', result);
        break;
      } else if (response.status !== 404) {
        const error = await response.text();
        console.log(`   ⚠️ ${endpoint}: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.message}`);
    }
  }

  console.log('\n📋 SUMMARY');
  console.log('='.repeat(50));
  console.log('If any approach succeeded, use that method in your integration.');
  console.log('If none worked, the video entry might need to be created in your LMS admin panel first.');
}

// Run the test
tryDifferentApproaches();
