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

    // Find trainings where this user is assigned (supporting your data structure)
    const userTrainings = await Training.find({
      $or: [
        { 'assignedUsers.userId': userId },
        { 'Assignedfor': userId },
        { 'Assignedfor': { $in: [userId] } }
      ]
      // Remove isActive filter since your data might not have this field
    })
      .select('-__v')
      .sort({ createdAt: -1 });

    // Format the response to include user-specific data
    const formattedTrainings = userTrainings.map(training => {
      // Check both old and new data structures
      const userAssignment = training.assignedUsers?.find(
        user => user.userId === userId
      );
      
      // For your data structure, use defaults since assignment is in Assignedfor array
      const isAssigned = training.Assignedfor?.includes(userId) || userAssignment;
      
      return {
        id: training._id,
        title: training.title || training.trainingName,
        description: training.description,
        type: training.type || training.Trainingtype,
        duration: training.duration,
        deadline: userAssignment?.deadline || training.deadline,
        progress: userAssignment?.progress || 0,
        status: userAssignment?.status || 'pending',
        assignedDate: userAssignment?.assignedDate || training.createdDate,
        completedDate: userAssignment?.completedDate,
        modules: training.modules,
        createdAt: training.createdAt || training.createdDate
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

    // Find mandatory trainings where this user is assigned (supporting your data structure)
    const userMandatoryTrainings = await Training.find({
      $or: [
        { type: 'mandatory', 'assignedUsers.userId': userId },
        { Trainingtype: 'mandatory', 'Assignedfor': userId },
        { Trainingtype: 'mandatory', 'Assignedfor': { $in: [userId] } }
      ]
      // Remove isActive filter since your data might not have this field
    })
      .select('-__v')
      .sort({ createdAt: -1 });

    // Format the response to include user-specific data  
    const formattedMandatoryTrainings = userMandatoryTrainings.map(training => {
      // Check both old and new data structures
      const userAssignment = training.assignedUsers?.find(
        user => user.userId === userId
      );
      
      return {
        id: training._id,
        title: training.title || training.trainingName,
        description: training.description,
        type: training.type || training.Trainingtype,
        duration: training.duration,
        deadline: userAssignment?.deadline || training.deadline,
        progress: userAssignment?.progress || 0,
        status: userAssignment?.status || 'pending',
        assignedDate: userAssignment?.assignedDate || training.createdDate,
        completedDate: userAssignment?.completedDate,
        modules: training.modules,
        createdAt: training.createdAt || training.createdDate
      };
    });

    res.json({
      status: 'success',
      data: formattedMandatoryTrainings,
      count: formattedMandatoryTrainings.length
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

// Update video watch progress (for consumption site)
exports.updateVideoProgress = async (req, res) => {
  try {
    const { userId, trainingId, moduleId, videoId } = req.params;
    const { watchTime, totalDuration, completed } = req.body;

    // Validate required parameters
    if (!userId || !trainingId || !moduleId || !videoId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID, training ID, module ID, and video ID are required'
      });
    }

    if (watchTime === undefined || totalDuration === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Watch time and total duration are required'
      });
    }

    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({
        status: 'error',
        message: 'Training not found'
      });
    }

    // Check if user is assigned to this training (supporting your data structure)
    const isAssigned = training.Assignedfor?.includes(userId) || 
                      training.assignedUsers?.some(user => user.userId === userId);

    if (!isAssigned) {
      return res.status(404).json({
        status: 'error',
        message: 'User not assigned to this training'
      });
    }

    const user = training.assignedUsers[userIndex];

    // Initialize moduleProgress if it doesn't exist
    if (!user.moduleProgress) {
      user.moduleProgress = [];
    }

    // Find or create module progress
    let moduleProgressIndex = user.moduleProgress.findIndex(
      mp => mp.moduleId === moduleId
    );

    if (moduleProgressIndex === -1) {
      // Create new module progress
      const module = training.modules.find(m => m.moduleId === moduleId);
      user.moduleProgress.push({
        moduleId,
        moduleName: module?.moduleName || 'Unknown Module',
        status: 'in_progress',
        completionPercentage: 0,
        videoProgress: []
      });
      moduleProgressIndex = user.moduleProgress.length - 1;
    }

    const moduleProgress = user.moduleProgress[moduleProgressIndex];

    // Find or create video progress
    let videoProgressIndex = moduleProgress.videoProgress.findIndex(
      vp => vp.videoId === videoId
    );

    if (videoProgressIndex === -1) {
      // Create new video progress
      const module = training.modules.find(m => m.moduleId === moduleId);
      const video = module?.videos?.find(v => v.videoId === videoId);
      
      moduleProgress.videoProgress.push({
        videoId,
        videoTitle: video?.videoTitle || 'Unknown Video',
        watchTime: 0,
        totalDuration,
        completed: false,
        lastWatchedAt: new Date()
      });
      videoProgressIndex = moduleProgress.videoProgress.length - 1;
    }

    const videoProgress = moduleProgress.videoProgress[videoProgressIndex];

    // Update video progress
    videoProgress.watchTime = Math.min(watchTime, totalDuration);
    videoProgress.totalDuration = totalDuration;
    videoProgress.lastWatchedAt = new Date();
    
    // Mark as completed if specified or if watch time >= 90% of total duration
    const completionThreshold = totalDuration * 0.9;
    if (completed || watchTime >= completionThreshold) {
      videoProgress.completed = true;
      videoProgress.completedAt = new Date();
    }

    // Calculate module completion percentage
    const totalVideos = moduleProgress.videoProgress.length;
    const completedVideos = moduleProgress.videoProgress.filter(vp => vp.completed).length;
    moduleProgress.completionPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

    // Update module status
    if (moduleProgress.completionPercentage === 100) {
      moduleProgress.status = 'completed';
    } else if (moduleProgress.completionPercentage > 0) {
      moduleProgress.status = 'in_progress';
    }

    // Calculate overall training progress
    const totalModules = user.moduleProgress.length;
    const completedModules = user.moduleProgress.filter(mp => mp.status === 'completed').length;
    user.progress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

    // Update training status
    if (user.progress === 100) {
      user.status = 'completed';
      user.completedDate = new Date();
    } else if (user.progress > 0) {
      user.status = 'in_progress';
    }

    await training.save();

    res.json({
      status: 'success',
      message: 'Video progress updated successfully',
      data: {
        userId,
        trainingId,
        moduleId,
        videoId,
        watchTime: videoProgress.watchTime,
        totalDuration: videoProgress.totalDuration,
        completed: videoProgress.completed,
        moduleProgress: moduleProgress.completionPercentage,
        overallProgress: user.progress
      }
    });

  } catch (error) {
    console.error('Error updating video progress:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update video progress',
      error: error.message
    });
  }
};

// Get detailed user progress for a specific training (for consumption site)
exports.getUserTrainingDetails = async (req, res) => {
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

    // Find the user
    const user = training.assignedUsers.find(u => u.userId === userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not assigned to this training'
      });
    }

    // Format the response with detailed progress
    const formattedTraining = {
      id: training._id,
      title: training.title,
      description: training.description,
      type: training.type,
      duration: training.duration,
      deadline: user.deadline,
      progress: user.progress || 0,
      status: user.status || 'pending',
      assignedDate: user.assignedDate,
      completedDate: user.completedDate,
      modules: training.modules.map(module => {
        const moduleProgress = user.moduleProgress?.find(mp => mp.moduleId === module.moduleId) || {
          status: 'not_started',
          completionPercentage: 0,
          videoProgress: []
        };

        return {
          moduleId: module.moduleId,
          moduleName: module.moduleName,
          moduleOrder: module.moduleOrder,
          status: moduleProgress.status,
          completionPercentage: moduleProgress.completionPercentage,
          videos: module.videos?.map(video => {
            const videoProgress = moduleProgress.videoProgress?.find(vp => vp.videoId === video.videoId) || {
              watchTime: 0,
              completed: false,
              lastWatchedAt: null
            };

            return {
              videoId: video.videoId,
              videoTitle: video.videoTitle,
              videoUrl: video.videoUrl,
              videoDuration: video.videoDuration,
              videoOrder: video.videoOrder,
              watchTime: videoProgress.watchTime,
              completed: videoProgress.completed,
              lastWatchedAt: videoProgress.lastWatchedAt,
              completedAt: videoProgress.completedAt
            };
          }) || []
        };
      })
    };

    res.json({
      status: 'success',
      data: formattedTraining
    });

  } catch (error) {
    console.error('Error fetching user training details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch training details',
      error: error.message
    });
  }
};