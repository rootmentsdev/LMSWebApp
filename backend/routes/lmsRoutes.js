const express = require('express');
const router = express.Router();
const lmsController = require('../controllers/lmsControllerSimple');

// Routes specifically designed for your LMS data structure

// GET endpoints for fetching trainings
router.get('/user/:userId/assigned-trainings', lmsController.getUserAssignedTrainings);
router.get('/user/:userId/training/:trainingId/details', lmsController.getUserTrainingDetails);
router.get('/user/:userId/progress', lmsController.getUserTrainingProgress);

// PUT endpoint for updating video progress (existing)
router.put('/user/:userId/training/:trainingId/module/:moduleId/video/:videoIndex/progress', lmsController.updateVideoProgress);

// === NEW API ROUTES FOR EXTERNAL WEBSITE INTEGRATION ===

// 1. Update Video Progress API (Enhanced for external website)
router.post('/training/update-video-progress', lmsController.updateVideoProgressExternal);

// 2. Get User's Current Training Progress (for external website)
router.get('/training/user-progress/:userId', lmsController.getUserProgressExternal);

// 3. Sync External Website Progress
router.post('/training/sync-external-progress', lmsController.syncExternalProgress);

// Alternative route structure for external website (with userId in params)
router.put('/user/:userId/training/:trainingId/module/:moduleId/video/:videoId/progress-external', lmsController.updateVideoProgressExternal);

module.exports = router;
