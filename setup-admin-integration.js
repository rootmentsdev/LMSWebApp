#!/usr/bin/env node

/**
 * Setup Script for Admin Training Integration
 * This script helps you test the connection between your admin and training websites
 */

const axios = require('axios');

// Configuration
const LOCAL_API_BASE = 'http://localhost:5000/api';
const EXTERNAL_LMS_BASE = 'https://lms-testenv.onrender.com/api';
const TEST_USER_ID = 'EMP103';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0';

console.log('🚀 Admin Training Integration Setup');
console.log('===================================');

async function testLocalBackend() {
  console.log('\n📡 Testing Local Backend Connection...');
  
  try {
    // Test training stats endpoint
    const statsResponse = await axios.get(`${LOCAL_API_BASE}/trainings/stats`);
    console.log('✅ Local backend connection successful');
    console.log(`   Total trainings: ${statsResponse.data.data?.totalTrainings || 0}`);
    console.log(`   Total assignments: ${statsResponse.data.data?.totalAssignments || 0}`);
    return true;
  } catch (error) {
    console.log('❌ Local backend connection failed');
    console.log(`   Error: ${error.message}`);
    console.log(`   Make sure your backend is running on port 5000`);
    return false;
  }
}

async function testExternalLMS() {
  console.log('\n🌐 Testing External LMS Connection...');
  
  try {
    const headers = {
      'Authorization': `Bearer ${TEST_TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    const response = await axios.get(`${EXTERNAL_LMS_BASE}/get/allusertraining`, { headers });
    console.log('✅ External LMS connection successful');
    console.log(`   Training data retrieved: ${response.data?.data?.length || 0} records`);
    return true;
  } catch (error) {
    console.log('❌ External LMS connection failed');
    console.log(`   Error: ${error.message}`);
    console.log(`   Check your API token and LMS URL in config.js`);
    return false;
  }
}

async function createTestTraining() {
  console.log('\n🎓 Creating Test Training...');
  
  try {
    const testTraining = {
      title: 'Admin Integration Test Training',
      description: 'This is a test training created by the integration setup script',
      type: 'regular',
      duration: 7,
      modules: [
        {
          moduleId: 'test-module-1',
          moduleName: 'Test Module 1',
          moduleOrder: 1
        }
      ]
    };

    const response = await axios.post(`${LOCAL_API_BASE}/trainings`, testTraining);
    
    if (response.data.status === 'success') {
      console.log('✅ Test training created successfully');
      console.log(`   Training ID: ${response.data.data._id}`);
      console.log(`   Title: ${response.data.data.title}`);
      return response.data.data._id;
    }
  } catch (error) {
    console.log('❌ Failed to create test training');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

async function assignTestTraining(trainingId) {
  console.log('\n👥 Assigning Test Training to User...');
  
  try {
    const assignmentData = {
      userId: TEST_USER_ID,
      userName: 'Test User',
      userRole: 'Employee',
      userBranch: 'Test Branch',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      priority: 'medium'
    };

    const response = await axios.post(`${LOCAL_API_BASE}/trainings/${trainingId}/assign`, assignmentData);
    
    if (response.data.status === 'success') {
      console.log('✅ Training assigned successfully');
      console.log(`   User ID: ${assignmentData.userId}`);
      console.log(`   Deadline: ${assignmentData.deadline.split('T')[0]}`);
      return true;
    }
  } catch (error) {
    console.log('❌ Failed to assign training');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testProgressTracking(trainingId) {
  console.log('\n📊 Testing Progress Tracking...');
  
  try {
    // Test local progress endpoint
    const progressResponse = await axios.get(`${LOCAL_API_BASE}/trainings/users/${TEST_USER_ID}/progress`);
    
    if (progressResponse.data.status === 'success') {
      console.log('✅ Progress tracking working');
      console.log(`   Total assigned: ${progressResponse.data.data.summary?.totalAssigned || 0}`);
      console.log(`   Completion rate: ${progressResponse.data.data.summary?.completionRate || 0}%`);
      return true;
    }
  } catch (error) {
    console.log('❌ Progress tracking failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

function displaySetupInstructions() {
  console.log('\n🎯 Setup Complete! Next Steps:');
  console.log('================================');
  console.log('');
  console.log('1. Start your frontend development server:');
  console.log('   cd frontend && npm start');
  console.log('');
  console.log('2. Login as an admin user with one of these roles:');
  console.log('   - Manager');
  console.log('   - Admin');
  console.log('   - super_admin');
  console.log('');
  console.log('3. Navigate to the admin dashboard:');
  console.log('   http://localhost:3000/admin');
  console.log('');
  console.log('4. Test the integration:');
  console.log('   - Create new training in "Manage Trainings" tab');
  console.log('   - Assign users in the assignment modal');
  console.log('   - Monitor progress in "Progress Tracking" tab');
  console.log('');
  console.log('5. Test video tracking:');
  console.log('   - Login as a regular user');
  console.log('   - Go to assigned training');
  console.log('   - Watch videos and see progress sync in admin dashboard');
  console.log('');
  console.log('🔍 For debugging, check browser console for detailed logs');
  console.log('📖 See ADMIN_TRAINING_INTEGRATION_GUIDE.md for full documentation');
}

function displayTroubleshooting() {
  console.log('\n🚨 Troubleshooting:');
  console.log('===================');
  console.log('');
  console.log('If tests failed:');
  console.log('1. Backend Issues:');
  console.log('   - Make sure backend is running: cd backend && npm start');
  console.log('   - Check database connection');
  console.log('   - Verify port 5000 is available');
  console.log('');
  console.log('2. LMS Connection Issues:');
  console.log('   - Update API token in frontend/src/config.js');
  console.log('   - Check LMS API URL');
  console.log('   - Verify network connectivity');
  console.log('');
  console.log('3. Admin Access Issues:');
  console.log('   - Use demo credentials: EMP103 / 123456');
  console.log('   - Make sure user role is admin-level');
  console.log('   - Clear localStorage if needed');
}

async function main() {
  const results = {
    local: false,
    external: false,
    training: null,
    assignment: false,
    progress: false
  };

  // Test connections
  results.local = await testLocalBackend();
  results.external = await testExternalLMS();

  // If local backend works, test training functionality
  if (results.local) {
    results.training = await createTestTraining();
    
    if (results.training) {
      results.assignment = await assignTestTraining(results.training);
      results.progress = await testProgressTracking(results.training);
    }
  }

  // Display results
  console.log('\n📋 Integration Test Results:');
  console.log('============================');
  console.log(`Local Backend:    ${results.local ? '✅ Connected' : '❌ Failed'}`);
  console.log(`External LMS:     ${results.external ? '✅ Connected' : '❌ Failed'}`);
  console.log(`Test Training:    ${results.training ? '✅ Created' : '❌ Failed'}`);
  console.log(`Assignment:       ${results.assignment ? '✅ Working' : '❌ Failed'}`);
  console.log(`Progress Tracking: ${results.progress ? '✅ Working' : '❌ Failed'}`);

  if (results.local && results.training && results.assignment) {
    displaySetupInstructions();
  } else {
    displayTroubleshooting();
  }
}

// Run the setup
main().catch(console.error);
