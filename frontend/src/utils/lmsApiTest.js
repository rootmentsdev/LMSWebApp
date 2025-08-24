import axios from 'axios';

// Test function to check LMS API endpoints
export const testLMSApiEndpoints = async () => {
  const baseUrl = 'https://lms-testenv-q8co.vercel.app';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0';
  
  const endpoints = [
    '/api/user/update/trainingprocess',
    '/api/user/get/assignment/data',
    '/api/get/allusertraining',
    '/api/get/Full/allusertraining',
    '/AssigData/api',
    '/api/assignment/update',
    '/api/training/progress/update'
  ];

  console.log('🧪 Testing LMS API endpoints...');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${baseUrl}${endpoint}`);
      
      // Try different HTTP methods
      const methods = ['GET', 'POST', 'PUT', 'PATCH'];
      
      for (const method of methods) {
        try {
          const config = {
            method: method.toLowerCase(),
            url: `${baseUrl}${endpoint}`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            timeout: 5000
          };
          
          if (method !== 'GET') {
            config.data = {
              userId: 'test-user',
              trainingId: 'test-training',
              moduleId: 'test-module',
              videoId: 'test-video',
              status: 'completed'
            };
          }
          
          const response = await axios(config);
          
          results.push({
            endpoint,
            method,
            status: response.status,
            success: true,
            data: response.data
          });
          
          console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
          break; // If one method works, move to next endpoint
          
        } catch (error) {
          // Log but continue to next method
          if (error.response) {
            console.log(`⚠️ ${method} ${endpoint} - Status: ${error.response.status}`);
            if (error.response.status !== 404 && error.response.status !== 405) {
              results.push({
                endpoint,
                method,
                status: error.response.status,
                success: false,
                error: error.response.data
              });
            }
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint} - Failed: ${error.message}`);
      results.push({
        endpoint,
        method: 'ALL',
        success: false,
        error: error.message
      });
    }
  }
  
  console.log('📊 Test Results:', results);
  return results;
};

// Test specific training progress update
export const testTrainingProgressUpdate = async (employeeId, trainingId, progress = 50) => {
  const baseUrl = 'https://lms-testenv-q8co.vercel.app';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0';
  
  console.log('🎯 Testing training progress update...');
  
  const testCases = [
    // Test case 1: Query parameters
    {
      name: 'Query Parameters',
      url: `${baseUrl}/api/user/update/trainingprocess?userId=${employeeId}&trainingId=${trainingId}`,
      method: 'PATCH',
      data: {
        progress: progress,
        status: 'in_progress',
        completedAt: new Date().toISOString()
      }
    },
    // Test case 2: Body data only
    {
      name: 'Body Data Only',
      url: `${baseUrl}/api/user/update/trainingprocess`,
      method: 'POST',
      data: {
        userId: employeeId,
        trainingId: trainingId,
        progress: progress,
        status: 'in_progress',
        completedAt: new Date().toISOString()
      }
    },
    // Test case 3: Different endpoint structure
    {
      name: 'Alternative Endpoint',
      url: `${baseUrl}/api/training/${trainingId}/user/${employeeId}/progress`,
      method: 'PUT',
      data: {
        progress: progress,
        status: 'in_progress'
      }
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    try {
      console.log(`🔍 Testing: ${testCase.name}`);
      
      const response = await axios({
        method: testCase.method.toLowerCase(),
        url: testCase.url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: testCase.data,
        timeout: 10000
      });
      
      results.push({
        ...testCase,
        success: true,
        status: response.status,
        response: response.data
      });
      
      console.log(`✅ ${testCase.name} - SUCCESS: Status ${response.status}`);
      
    } catch (error) {
      console.log(`❌ ${testCase.name} - FAILED:`, error.response?.status || error.message);
      
      results.push({
        ...testCase,
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message
      });
    }
  }
  
  console.log('📊 Progress Update Test Results:', results);
  return results;
};

// Export for use in the test component
export default {
  testLMSApiEndpoints,
  testTrainingProgressUpdate
};
