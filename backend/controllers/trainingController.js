const Training = require('../models/Training');

// Get all trainings (admin view)
exports.getAllTrainings = async (req, res) => {
  try {
    const trainings = await Training.find({ isActive: true })
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      data: trainings,
      count: trainings.length
    });
  } catch (error) {
    console.error('Error fetching all trainings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trainings',
      error: error.message
    });
  }
};

// Get all mandatory trainings (admin view)
exports.getAllMandatoryTrainings = async (req, res) => {
  try {
    const mandatoryTrainings = await Training.find({ 
      type: 'mandatory', 
      isActive: true 
    })
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      data: mandatoryTrainings,
      count: mandatoryTrainings.length
    });
  } catch (error) {
    console.error('Error fetching mandatory trainings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch mandatory trainings',
      error: error.message
    });
  }
};

// Get user's assigned trainings
exports.getUserAssignedTrainings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }

    // Find trainings where this user is assigned
    const userTrainings = await Training.find({
      'assignedUsers.userId': userId,
      isActive: true
    })
      .select('-__v')
      .sort({ createdAt: -1 });

    // Format the response to include user-specific data
    const formattedTrainings = userTrainings.map(training => {
      const userAssignment = training.assignedUsers.find(
        user => user.userId === userId
      );
      
      return {
        id: training._id,
        title: training.title,
        description: training.description,
        type: training.type,
        duration: training.duration,
        deadline: userAssignment?.deadline,
        progress: userAssignment?.progress || 0,
        status: userAssignment?.status || 'pending',
        assignedDate: userAssignment?.assignedDate,
        completedDate: userAssignment?.completedDate,
        modules: training.modules,
        createdAt: training.createdAt
      };
    });

    res.json({
      status: 'success',
      data: formattedTrainings,
      count: formattedTrainings.length
    });
  } catch (error) {
    console.error('Error fetching user assigned trainings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user trainings',
      error: error.message
    });
  }
};

// Get user's mandatory trainings
exports.getUserMandatoryTrainings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }

    // Find mandatory trainings where this user is assigned
    const userMandatoryTrainings = await Training.find({
      type: 'mandatory',
      'assignedUsers.userId': userId,
      isActive: true
    })
      .select('-__v')
      .sort({ createdAt: -1 });

    // Format the response to include user-specific data
    const formattedTrainings = userMandatoryTrainings.map(training => {
      const userAssignment = training.assignedUsers.find(
        user => user.userId === userId
      );
      
      return {
        id: training._id,
        title: training.title,
        description: training.description,
        type: training.type,
        duration: training.duration,
        deadline: userAssignment?.deadline,
        progress: userAssignment?.progress || 0,
        status: userAssignment?.status || 'pending',
        assignedDate: userAssignment?.assignedDate,
        completedDate: userAssignment?.completedDate,
        modules: training.modules,
        createdAt: training.createdAt
      };
    });

    res.json({
      status: 'success',
      data: formattedTrainings,
      count: formattedTrainings.length
    });
  } catch (error) {
    console.error('Error fetching user mandatory trainings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user mandatory trainings',
      error: error.message
    });
  }
};

// Create new training (POST /api/trainings)
exports.createTraining = async (req, res) => {
  try {
    const trainingData = req.body;
    
    // Validate required fields
    if (!trainingData.title || !trainingData.duration) {
      return res.status(400).json({
        status: 'error',
        message: 'Title and duration are required'
      });
    }

    // Set type to regular for this endpoint
    trainingData.type = 'regular';
    
    const newTraining = new Training(trainingData);
    await newTraining.save();

    res.status(201).json({
      status: 'success',
      message: 'Training created successfully',
      data: newTraining
    });
  } catch (error) {
    console.error('Error creating training:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create training',
      error: error.message
    });
  }
};

// Create mandatory training (POST /api/mandatorytrainings)
exports.createMandatoryTraining = async (req, res) => {
  try {
    const trainingData = req.body;
    
    // Validate required fields
    if (!trainingData.title || !trainingData.duration) {
      return res.status(400).json({
        status: 'error',
        message: 'Title and duration are required'
      });
    }

    // Set type to mandatory for this endpoint
    trainingData.type = 'mandatory';
    
    const newTraining = new Training(trainingData);
    await newTraining.save();

    res.status(201).json({
      status: 'success',
      message: 'Mandatory training created successfully',
      data: newTraining
    });
  } catch (error) {
    console.error('Error creating mandatory training:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create mandatory training',
      error: error.message
    });
  }
};

// Update training progress
exports.updateTrainingProgress = async (req, res) => {
  try {
    const { userId, trainingId } = req.params;
    const { progress } = req.body;

    if (!userId || !trainingId || progress === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID, training ID, and progress are required'
      });
    }

    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({
        status: 'error',
        message: 'Training not found'
      });
    }

    // Find and update user's progress
    const userIndex = training.assignedUsers.findIndex(
      user => user.userId === userId
    );

    if (userIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'User not assigned to this training'
      });
    }

    // Update progress and status
    training.assignedUsers[userIndex].progress = Math.max(0, Math.min(100, progress));
    
    if (progress >= 100) {
      training.assignedUsers[userIndex].status = 'completed';
      training.assignedUsers[userIndex].completedDate = new Date();
    } else if (progress > 0) {
      training.assignedUsers[userIndex].status = 'in_progress';
    }

    await training.save();

    res.json({
      status: 'success',
      message: 'Training progress updated successfully',
      data: {
        trainingId,
        userId,
        progress: training.assignedUsers[userIndex].progress,
        status: training.assignedUsers[userIndex].status
      }
    });
  } catch (error) {
    console.error('Error updating training progress:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update training progress',
      error: error.message
    });
  }
};

// Mark training as completed
exports.completeTraining = async (req, res) => {
  try {
    const { userId, trainingId } = req.params;

    if (!userId || !trainingId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and training ID are required'
      });
    }

    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({
        status: 'error',
        message: 'Training not found'
      });
    }

    // Find and update user's status
    const userIndex = training.assignedUsers.findIndex(
      user => user.userId === userId
    );

    if (userIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'User not assigned to this training'
      });
    }

    // Mark as completed
    training.assignedUsers[userIndex].status = 'completed';
    training.assignedUsers[userIndex].progress = 100;
    training.assignedUsers[userIndex].completedDate = new Date();

    await training.save();

    res.json({
      status: 'success',
      message: 'Training marked as completed successfully',
      data: {
        trainingId,
        userId,
        status: 'completed',
        completedDate: training.assignedUsers[userIndex].completedDate
      }
    });
  } catch (error) {
    console.error('Error completing training:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete training',
      error: error.message
    });
  }
};

// Update training progress for video completion (PATCH endpoint)
exports.updateTrainingProcess = async (req, res) => {
  try {
    const { userId, trainingId, moduleId, videoId } = req.query;

    console.log('📹 Video completion request:', { userId, trainingId, moduleId, videoId });

    if (!userId || !trainingId || !moduleId || !videoId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userId, trainingId, moduleId, or videoId'
      });
    }

    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found for this user and training'
      });
    }

    // Find the user's progress in this training
    const userIndex = training.assignedUsers.findIndex(
      user => user.userId === userId
    );

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Training progress not found for this user and training'
      });
    }

    // Find the module and mark the video as completed
    const module = training.modules.find(mod => mod._id.toString() === moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found in this training'
      });
    }

    // Find the video in the module
    const video = module.videos?.find(vid => vid._id.toString() === videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found in this module'
      });
    }

    // Mark video as completed for this user
    // If there's no completion tracking array, create it
    if (!training.assignedUsers[userIndex].completedVideos) {
      training.assignedUsers[userIndex].completedVideos = [];
    }

    // Add this video to completed videos if not already there
    const videoAlreadyCompleted = training.assignedUsers[userIndex].completedVideos.some(
      cv => cv.moduleId === moduleId && cv.videoId === videoId
    );

    if (!videoAlreadyCompleted) {
      training.assignedUsers[userIndex].completedVideos.push({
        moduleId,
        videoId,
        completedAt: new Date()
      });
    }

    // Calculate progress based on completed videos
    const totalVideos = training.modules.reduce((total, mod) => {
      return total + (mod.videos ? mod.videos.length : 0);
    }, 0);

    const completedVideosCount = training.assignedUsers[userIndex].completedVideos?.length || 0;
    const progressPercentage = totalVideos > 0 ? Math.round((completedVideosCount / totalVideos) * 100) : 0;

    // Update progress
    training.assignedUsers[userIndex].progress = progressPercentage;
    
    // Update status based on progress
    if (progressPercentage >= 100) {
      training.assignedUsers[userIndex].status = 'completed';
      training.assignedUsers[userIndex].completedDate = new Date();
    } else if (progressPercentage > 0) {
      training.assignedUsers[userIndex].status = 'in_progress';
    }

    await training.save();

    res.json({
      success: true,
      message: 'Video marked as completed successfully',
      data: {
        userId,
        trainingId,
        moduleId,
        videoId,
        progress: progressPercentage,
        status: training.assignedUsers[userIndex].status,
        completedVideos: completedVideosCount,
        totalVideos
      }
    });

  } catch (error) {
    console.error('Error updating training process:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update training progress',
      error: error.message
    });
  }
};
