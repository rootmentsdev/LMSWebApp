// LMS Integration Configuration Example
// Copy this file to lms-config.js and fill in your actual values

module.exports = {
  // Your LMS System Configuration
  LMS_BASE_URL: 'https://your-lms-system.com',
  LMS_API_TOKEN: 'your-lms-api-token-here',
  
  // API endpoints for updating training progress
  UPDATE_PROGRESS_ENDPOINT: '/api/update-training-progress',
  GET_PROGRESS_ENDPOINT: '/api/get-training-progress',
  
  // Training Progress Bridge Configuration
  BRIDGE_ENABLED: true,
  BRIDGE_SYNC_INTERVAL: 300000, // 5 minutes
  BRIDGE_RETRY_ATTEMPTS: 3,
  BRIDGE_RETRY_DELAY: 5000, // 5 seconds
  
  // Progress thresholds
  VIDEO_COMPLETION_THRESHOLD: 90, // 90% watched = completed
  MODULE_COMPLETION_THRESHOLD: 100, // 100% = completed
  
  // Sync settings
  ENABLE_AUTO_SYNC: true,
  SYNC_ON_VIDEO_COMPLETION: true,
  SYNC_ON_MODULE_COMPLETION: true,
  SYNC_ON_TRAINING_COMPLETION: true
};
