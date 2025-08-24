// Configuration file for your training system
// Updated to match your exact API structure

export const config = {
  // API Configuration  
  API_BASE_URL: 'https://lms-testenv.onrender.com',
  
  // Authentication - JWT Bearer token
  USE_AUTH: true,
  API_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
  
  // API Endpoints - Updated to match your system
  ENDPOINTS: {
    // Health check (if available)
    HEALTH: '/api/health',
    
    // Core Training Endpoints
    GET_ALL_USER_TRAININGS: '/api/get/Full/allusertraining',
    GET_USER_TRAININGS_WITH_COMPLETION: '/api/get/allusertraining',
    GET_MANDATORY_TRAININGS: '/api/get/mandatory/allusertraining',
    GET_TRAINING_BY_ID: '/api/trainings/:id',
    
    // Assessment Endpoints
    GET_ALL_ASSESSMENTS: '/api/user/get/AllAssessment',
    GET_ASSESSMENT_DETAILS: '/api/user/get/assessment/details/:id',
    
    // Module Endpoints
    GET_ALL_MODULES: '/api/modules',
    GET_MODULE_BY_ID: '/api/modules/:id',
    
    // Progress and Completion (if available)
    UPDATE_TRAINING_PROGRESS: '/api/trainings/:trainingId/progress',
    COMPLETE_TRAINING: '/api/trainings/:trainingId/complete',
  },
  
  // Test Configuration
  TEST_USER_ID: 'user123', // Default test user ID
  
  // Debug Configuration
  ENABLE_DEBUG: true, // Set to false in production
  LOG_API_CALLS: true, // Log all API calls to console
  
  // LMS Sync Configuration - Fixed URLs and method
  LMS_SYNC_ENABLED: true, // Enable/disable LMS synchronization
  LMS_SYNC_BASE_URL: 'https://lms.rootments.live', // Production LMS
  LMS_SYNC_TEST_URL: 'https://lms-testenv.onrender.com', // Test environment - FIXED URL
  LMS_SYNC_LOCAL_URL: 'http://localhost:7000', // Local development
  LMS_SYNC_ENDPOINT: '/api/user/update/trainingprocess', // Video completion endpoint
  LMS_SYNC_AUTH: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JjMDJlNjg2Mzk2ZGNhNWNkNmIwNjQiLCJ1c2VybmFtZSI6IlJldmF0aHkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTU4NjAyNzd9.GKA_DS539DHnalkco7ZDbJLDMnNsd2HyCPSjikUpyd0',
  LMS_SYNC_BATCH_INTERVAL: 300000, // 5 minutes in milliseconds
  LMS_ENVIRONMENT: 'test', // 'production', 'test', or 'local' - Using test environment to match your site
};

// Helper function to replace URL parameters
export const buildEndpoint = (endpoint, params) => {
  let url = endpoint;
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  return url;
};

// Helper function to get API headers with JWT authentication
export const getApiHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (config.USE_AUTH && config.API_TOKEN) {
    headers['Authorization'] = `Bearer ${config.API_TOKEN}`;
  }
  
  return headers;
};

// Helper function to get the correct LMS sync URL based on environment
export const getLMSSyncURL = () => {
  switch (config.LMS_ENVIRONMENT) {
    case 'production':
      return config.LMS_SYNC_BASE_URL + config.LMS_SYNC_ENDPOINT;
    case 'test':
      return config.LMS_SYNC_TEST_URL + config.LMS_SYNC_ENDPOINT;
    case 'local':
      return config.LMS_SYNC_LOCAL_URL + config.LMS_SYNC_ENDPOINT;
    default:
      return config.LMS_SYNC_BASE_URL + config.LMS_SYNC_ENDPOINT;
  }
};
