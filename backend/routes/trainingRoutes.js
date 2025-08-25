const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');

// GET endpoints for fetching trainings
router.get('/all', trainingController.getAllTrainings);
router.get('/mandatorytrainings/all', trainingController.getAllMandatoryTrainings);
router.get('/user/:userId/assigned-trainings', trainingController.getUserAssignedTrainings);
router.get('/user/:userId/mandatory-trainings', trainingController.getUserMandatoryTrainings);

// POST endpoints for creating trainings (existing functionality)
router.post('/', trainingController.createTraining);
router.post('/mandatorytrainings', trainingController.createMandatoryTraining);

// PUT endpoints for updating training progress
router.put('/user/:userId/training/:trainingId/progress', trainingController.updateTrainingProgress);
router.put('/user/:userId/training/:trainingId/complete', trainingController.completeTraining);

// Video progress tracking endpoints (for consumption site)
router.put('/user/:userId/training/:trainingId/module/:moduleId/video/:videoId/progress', trainingController.updateVideoProgress);
router.get('/user/:userId/training/:trainingId/details', trainingController.getUserTrainingDetails);

module.exports = router;
