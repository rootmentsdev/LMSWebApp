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

// POST endpoints for admin functionality
router.post('/:trainingId/assign', trainingController.assignTraining);

// GET endpoints for statistics and progress tracking
router.get('/stats', trainingController.getTrainingStats);
router.get('/users/:userId/progress', trainingController.getUserProgress);

module.exports = router;
