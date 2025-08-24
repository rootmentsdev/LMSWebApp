const express = require('express');
const router = express.Router();
const trainingProgressBridge = require('../controllers/trainingProgressBridge');

// Bridge: Update training progress in both local DB and LMS system
router.post('/update-progress', trainingProgressBridge.updateLMSProgress);

// Bridge: Get training progress from both systems
router.get('/progress/:userId/:trainingId', trainingProgressBridge.getLMSProgress);

// Bridge: Sync all training progress between systems
router.post('/sync-all-progress', trainingProgressBridge.syncAllProgress);

// Bridge: Handle video completion events
router.post('/video-completion', trainingProgressBridge.handleVideoCompletion);

module.exports = router;
