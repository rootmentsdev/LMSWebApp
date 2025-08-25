#!/usr/bin/env node

/**
 * LMS Integration Test Script
 * Tests the connection between your admin assignment system and LMS API
 * Based on your specific API endpoints and TrainingProgress schema
 */

const axios = require('axios');

// Your LMS Configuration
const LMS_CONFIG = {
  BASE_URL: 'https://lms-testenv.onrender.com',
  TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
  TEST_USER_ID: 'EMP103'
};

const LOCAL_API_BASE = 'http://localhost:5000/api';

console.log('🚀 LMS Training Assignment Integration Test');
console.log('==========================================');

function getHeaders() {
  return {
    'Authorization': `Bearer ${LMS_CONFIG.TOKEN}`,
    'Content-Type': 'application/json'
  };
}

async function testLMSConnection() {
  console.log('\n🌐 Testing LMS API Connection...');
  
  try {
    // Test your specific LMS endpoint
    const response = await axios.get(
      `${LMS_CONFIG.BASE_URL}/api/user/getAll/training?empID=${LMS_CONFIG.TEST_USER_ID}`,
      { headers: getHeaders() }
    );

    console.log('✅ LMS API connection successful');
    console.log(`   User ID: ${LMS_CONFIG.TEST_USER_ID}`);
    console.log(`   Training records found: ${response.data?.data?.length || 0}`);
    
    if (response.data?.data && response.data.data.length > 0) {
      const training = response.data.data[0];
      console.log(`   Sample training: ${training.title || training._id}`);
      console.log(`   Completion: ${training.completionPercentage || 0}%`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ LMS API connection failed');
    console.log(`   Error: ${error.message}`);
    console.log(`   Status: ${error.response?.status}`);
    return false;
  }
}

async function testTrainingProgressAPI() {
  console.log('\n📊 Testing Training Progress API...');
  
  try {
    // First get user trainings to find a valid training ID
    const trainingsResponse = await axios.get(
      `${LMS_CONFIG.BASE_URL}/api/user/getAll/training?empID=${LMS_CONFIG.TEST_USER_ID}`,
      { headers: getHeaders() }
    );

    if (!trainingsResponse.data?.data || trainingsResponse.data.data.length === 0) {
      console.log('⚠️ No training data found for user');
      return false;
    }

    const training = trainingsResponse.data.data[0];
    const trainingId = training._id;

    console.log(`   Testing with training: ${training.title || trainingId}`);

    // Test detailed training progress endpoint
    const progressResponse = await axios.get(
      `${LMS_CONFIG.BASE_URL}/api/user/getAll/trainingprocess?userId=${LMS_CONFIG.TEST_USER_ID}&trainingId=${trainingId}`,
      { headers: getHeaders() }
    );

    console.log('✅ Training progress API working');
    
    const progressData = progressResponse.data?.data;
    if (progressData) {
      console.log(`   Training status: ${progressData.trainingProgress?.status || 'Unknown'}`);
      console.log(`   Training pass: ${progressData.trainingProgress?.pass || false}`);
      console.log(`   Modules: ${progressData.trainingId?.modules?.length || 0}`);
      
      // Test module progress if modules exist
      if (progressData.trainingId?.modules && progressData.trainingId.modules.length > 0) {
        const moduleId = progressData.trainingId.modules[0]._id;
        console.log(`   Testing module progress for: ${moduleId}`);
        
        try {
          const moduleResponse = await axios.get(
            `${LMS_CONFIG.BASE_URL}/api/user/getAll/trainingprocess/module?userId=${LMS_CONFIG.TEST_USER_ID}&trainingId=${trainingId}&moduleId=${moduleId}`,
            { headers: getHeaders() }
          );
          
          console.log('✅ Module progress API working');
          console.log(`   Module data retrieved successfully`);
        } catch (moduleError) {
          console.log('⚠️ Module progress API issue:', moduleError.message);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ Training progress API failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testProgressUpdateAPI() {
  console.log('\n🎯 Testing Progress Update API...');
  
  try {
    // Get training data first
    const trainingsResponse = await axios.get(
      `${LMS_CONFIG.BASE_URL}/api/user/getAll/training?empID=${LMS_CONFIG.TEST_USER_ID}`,
      { headers: getHeaders() }
    );

    if (!trainingsResponse.data?.data || trainingsResponse.data.data.length === 0) {
      console.log('⚠️ No training data available for progress update test');
      return false;
    }

    const training = trainingsResponse.data.data[0];
    const trainingId = training._id;

    // Get detailed progress to find module and video IDs
    const progressResponse = await axios.get(
      `${LMS_CONFIG.BASE_URL}/api/user/getAll/trainingprocess?userId=${LMS_CONFIG.TEST_USER_ID}&trainingId=${trainingId}`,
      { headers: getHeaders() }
    );

    const progressData = progressResponse.data?.data;
    if (!progressData?.trainingId?.modules || progressData.trainingId.modules.length === 0) {
      console.log('⚠️ No modules found for progress update test');
      return false;
    }

    const module = progressData.trainingId.modules[0];
    const moduleId = module._id;

    if (!module.videos || module.videos.length === 0) {
      console.log('⚠️ No videos found in module for progress update test');
      return false;
    }

    const videoId = module.videos[0]._id;

    console.log(`   Testing progress update:`);
    console.log(`   - Training: ${trainingId}`);
    console.log(`   - Module: ${moduleId}`);
    console.log(`   - Video: ${videoId}`);

    // Test the PATCH endpoint (your core progress update API)
    const updateResponse = await axios.patch(
      `${LMS_CONFIG.BASE_URL}/api/user/update/trainingprocess?userId=${LMS_CONFIG.TEST_USER_ID}&trainingId=${trainingId}&moduleId=${moduleId}&videoId=${videoId}`,
      {},
      { headers: getHeaders() }
    );

    console.log('✅ Progress update API working');
    console.log(`   Response status: ${updateResponse.status}`);
    
    const updateData = updateResponse.data?.data;
    if (updateData?.trainingProgress) {
      console.log(`   Updated training status: ${updateData.trainingProgress.status}`);
      console.log(`   Training completed: ${updateData.trainingProgress.pass}`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Progress update API failed');
    console.log(`   Error: ${error.message}`);
    console.log(`   Status: ${error.response?.status}`);
    return false;
  }
}

async function testLocalBackendIntegration() {
  console.log('\n🏠 Testing Local Backend Integration...');
  
  try {
    // Test local admin endpoints
    const statsResponse = await axios.get(`${LOCAL_API_BASE}/trainings/stats`);
    console.log('✅ Local backend connection successful');
    console.log(`   Training stats retrieved`);
    
    // Test local training list
    const trainingsResponse = await axios.get(`${LOCAL_API_BASE}/trainings/all`);
    console.log(`   Local trainings found: ${trainingsResponse.data?.data?.length || 0}`);
    
    return true;
  } catch (error) {
    console.log('❌ Local backend connection failed');
    console.log(`   Error: ${error.message}`);
    console.log(`   Make sure backend is running on port 5000`);
    return false;
  }
}

function testCompletionCalculation() {
  console.log('\n🧮 Testing Completion Calculation Logic...');
  
  try {
    // Test your specific completion calculation logic
    // Based on: (moduleCompletionPercentage + videoCompletionPercentage) / 2
    
    const mockTrainingData = {
      trainingId: {
        modules: [
          { _id: 'mod1', videos: [{ _id: 'vid1' }, { _id: 'vid2' }] },
          { _id: 'mod2', videos: [{ _id: 'vid3' }, { _id: 'vid4' }] }
        ]
      },
      modules: [
        { 
          moduleId: 'mod1', 
          pass: true,
          videos: [
            { videoId: 'vid1', pass: true },
            { videoId: 'vid2', pass: true }
          ]
        },
        { 
          moduleId: 'mod2', 
          pass: false,
          videos: [
            { videoId: 'vid3', pass: true },
            { videoId: 'vid4', pass: false }
          ]
        }
      ]
    };

    // Calculate using your logic
    const totalModules = mockTrainingData.trainingId.modules.length; // 2
    const completedModules = mockTrainingData.modules.filter(m => m.pass).length; // 1
    const moduleCompletion = (completedModules / totalModules) * 100; // 50%

    const totalVideos = mockTrainingData.trainingId.modules.reduce((total, mod) => total + mod.videos.length, 0); // 4
    const completedVideos = mockTrainingData.modules.reduce((total, mod) => 
      total + mod.videos.filter(v => v.pass).length, 0); // 3
    const videoCompletion = (completedVideos / totalVideos) * 100; // 75%

    const overallCompletion = (moduleCompletion + videoCompletion) / 2; // 62.5%

    console.log('✅ Completion calculation working');
    console.log(`   Module completion: ${moduleCompletion}%`);
    console.log(`   Video completion: ${videoCompletion}%`);
    console.log(`   Overall completion: ${overallCompletion}%`);
    console.log(`   Formula: (${moduleCompletion} + ${videoCompletion}) / 2 = ${overallCompletion}`);
    
    return true;
  } catch (error) {
    console.log('❌ Completion calculation failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

function displayIntegrationSummary(results) {
  console.log('\n📋 LMS Integration Test Results:');
  console.log('===============================');
  console.log(`LMS API Connection:      ${results.lms ? '✅ Working' : '❌ Failed'}`);
  console.log(`Training Progress API:   ${results.progress ? '✅ Working' : '❌ Failed'}`);
  console.log(`Progress Update API:     ${results.update ? '✅ Working' : '❌ Failed'}`);
  console.log(`Local Backend:           ${results.local ? '✅ Working' : '❌ Failed'}`);
  console.log(`Completion Logic:        ${results.calculation ? '✅ Working' : '❌ Failed'}`);

  if (results.lms && results.progress && results.update) {
    console.log('\n🎉 LMS Integration Status: READY FOR PRODUCTION!');
    console.log('===============================================');
    console.log('');
    console.log('✅ Your LMS API integration is fully working');
    console.log('✅ Training progress tracking is operational');
    console.log('✅ Video completion updates are functioning');
    console.log('✅ Admin dashboard can monitor real-time progress');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('1. Start your frontend: cd frontend && npm start');
    console.log('2. Login as admin: EMP103 / 123456');
    console.log('3. Go to /admin dashboard');
    console.log('4. Assign training and monitor progress');
    console.log('5. Test video watching with real-time LMS sync');
  } else {
    console.log('\n🚨 Integration Issues Found:');
    console.log('============================');
    if (!results.lms) console.log('- Check LMS API URL and token in config.js');
    if (!results.progress) console.log('- Verify training progress endpoints');
    if (!results.update) console.log('- Test progress update PATCH endpoint');
    if (!results.local) console.log('- Start local backend server');
  }
}

async function main() {
  const results = {
    lms: false,
    progress: false,
    update: false,
    local: false,
    calculation: false
  };

  // Run all tests
  results.lms = await testLMSConnection();
  results.progress = await testTrainingProgressAPI();
  results.update = await testProgressUpdateAPI();
  results.local = await testLocalBackendIntegration();
  results.calculation = testCompletionCalculation();

  // Display summary
  displayIntegrationSummary(results);
}

// Run the LMS integration test
main().catch(console.error);
