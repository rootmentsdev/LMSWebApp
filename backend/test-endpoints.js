const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const testUserId = 'user123';
const testTrainingId = 'test_training_id';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (color, message) => {
  console.log(`${color}${message}${colors.reset}`);
};

const testEndpoint = async (method, endpoint, data = null, description = '') => {
  try {
    log(colors.blue, `\n🧪 Testing: ${method} ${endpoint}`);
    if (description) log(colors.yellow, `   Description: ${description}`);
    
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) config.data = data;
    
    const response = await axios(config);
    
    log(colors.green, `✅ SUCCESS: ${response.status} ${response.statusText}`);
    if (response.data) {
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    }
    
    return true;
  } catch (error) {
    log(colors.red, `❌ FAILED: ${error.response?.status || 'Network Error'} ${error.response?.statusText || error.message}`);
    if (error.response?.data) {
      console.log('   Error Details:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
};

const runTests = async () => {
  log(colors.blue, '🚀 Starting API Endpoint Tests...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Health Check
  totalTests++;
  if (await testEndpoint('GET', '/api/health', null, 'Check API and database status')) {
    passedTests++;
  }
  
  // Test 2: Get All Trainings
  totalTests++;
  if (await testEndpoint('GET', '/api/trainings/all', null, 'Get all regular trainings')) {
    passedTests++;
  }
  
  // Test 3: Get All Mandatory Trainings
  totalTests++;
  if (await testEndpoint('GET', '/api/trainings/mandatorytrainings/all', null, 'Get all mandatory trainings')) {
    passedTests++;
  }
  
  // Test 4: Get User Assigned Trainings
  totalTests++;
  if (await testEndpoint('GET', `/api/trainings/user/${testUserId}/assigned-trainings`, null, 'Get user assigned trainings')) {
    passedTests++;
  }
  
  // Test 5: Get User Mandatory Trainings
  totalTests++;
  if (await testEndpoint('GET', `/api/trainings/user/${testUserId}/mandatory-trainings`, null, 'Get user mandatory trainings')) {
    passedTests++;
  }
  
  // Test 6: Create Sample Training
  totalTests++;
  const sampleTraining = {
    title: 'Test Training - Customer Service',
    description: 'This is a test training for customer service excellence',
    duration: 3,
    modules: [
      {
        moduleId: 'mod_test_001',
        moduleName: 'Introduction to Customer Service',
        moduleOrder: 1
      }
    ],
    targetCriteria: {
      branches: ['Sales', 'Support'],
      roles: ['Representative']
    },
    createdBy: 'test_admin'
  };
  
  if (await testEndpoint('POST', '/api/trainings', sampleTraining, 'Create sample training')) {
    passedTests++;
  }
  
  // Test 7: Create Sample Mandatory Training
  totalTests++;
  const sampleMandatoryTraining = {
    title: 'Test Mandatory Training - Safety Protocols',
    description: 'This is a test mandatory training for safety protocols',
    duration: 2,
    modules: [
      {
        moduleId: 'mod_mandatory_001',
        moduleName: 'Basic Safety Guidelines',
        moduleOrder: 1
      }
    ],
    targetCriteria: {
      designations: ['Employee', 'Manager']
    },
    createdBy: 'test_admin'
  };
  
  if (await testEndpoint('POST', '/api/trainings/mandatorytrainings', sampleMandatoryTraining, 'Create sample mandatory training')) {
    passedTests++;
  }
  
  // Test 8: Test Backward Compatibility
  totalTests++;
  if (await testEndpoint('GET', '/api/mandatorytrainings', null, 'Test backward compatibility endpoint')) {
    passedTests++;
  }
  
  // Test 9: Root Endpoint
  totalTests++;
  if (await testEndpoint('GET', '/', null, 'Get API root with endpoint list')) {
    passedTests++;
  }
  
  // Summary
  log(colors.blue, '\n📊 Test Results Summary');
  log(colors.green, `✅ Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    log(colors.green, '🎉 All tests passed! Your backend is working correctly.');
  } else {
    log(colors.red, `⚠️  ${totalTests - passedTests} tests failed. Check the errors above.`);
  }
  
  log(colors.blue, '\n🔗 Available Endpoints:');
  log(colors.yellow, '   GET  /api/health');
  log(colors.yellow, '   GET  /api/trainings/all');
  log(colors.yellow, '   GET  /api/trainings/mandatorytrainings/all');
  log(colors.yellow, '   GET  /api/trainings/user/:userId/assigned-trainings');
  log(colors.yellow, '   GET  /api/trainings/user/:userId/mandatory-trainings');
  log(colors.yellow, '   POST /api/trainings');
  log(colors.yellow, '   POST /api/trainings/mandatorytrainings');
  log(colors.yellow, '   PUT  /api/trainings/user/:userId/training/:trainingId/progress');
  log(colors.yellow, '   PUT  /api/trainings/user/:userId/training/:trainingId/complete');
  
  log(colors.blue, '\n🚀 Your frontend should now work with these endpoints!');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(colors.red, `\n💥 Test runner failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint };
