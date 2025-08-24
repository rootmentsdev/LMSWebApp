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
    
    // Real LMS API endpoints from your system
    GET_ALL_USER_TRAINING: '/api/get/allusertraining',
    GET_MANDATORY_TRAINING: '/api/get/mandatory/allusertraining',
    GET_FULL_TRAINING: '/api/get/Full/allusertraining',
    UPDATE_TRAINING_PROCESS: '/api/user/update/trainingprocess',
    GET_PROGRESS: '/api/get/progress',
    GET_USER_TRAINING_PROCESS: '/api/user/trainingprocess',
    GET_USER_TRAINING_PROCESS_MODULE: '/api/user/trainingprocessmodule',
    
    // Legacy endpoints for backward compatibility
    UPDATE_TRAINING_PROGRESS: '/api/user/training/:trainingId/progress',
    UPDATE_USER_TRAINING_PROGRESS: '/api/user/:userId/training/:trainingId/progress',
  },
  
  // Test Configuration
  TEST_USER_ID: 'user123', // Default test user ID
  
  // Test Video URL for debugging
  TEST_VIDEO_URL: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  
  // Debug Configuration
  ENABLE_DEBUG: true, // Set to false in production
  LOG_API_CALLS: true, // Log all API calls to console
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
