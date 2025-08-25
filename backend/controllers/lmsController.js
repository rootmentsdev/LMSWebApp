// Use your existing models instead of creating new ones
const Training = require('../models/Training');

// Import LMS-specific models
const { TrainingLMS, ModuleLMS, TrainingProgressLMS } = require('../models/TrainingLMS');

// Get user's assigned trainings (works with your data structure)
exports.getUserAssignedTrainings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }

    console.log('Looking for trainings assigned to:', userId);

    // Find trainings where this user is in Assignedfor array
    const userTrainings = await TrainingLMS.find({
      Assignedfor: { $in: [userId] }
    }).populate('modules');

    console.log('Found trainings query result:', userTrainings.length);
    console.log('Training IDs found:', userTrainings.map(t => t._id)); // Populate module details

    console.log('Found trainings:', userTrainings.length);

    // Get training progress for these trainings
    const trainingWithProgress = await Promise.all(
      userTrainings.map(async (training) => {
        const progress = await TrainingProgressLMS.findOne({
          trainingId: training._id,
          userId: userId // This might need to be converted to ObjectId
        });

        return {
          id: training._id,
          title: training.trainingName,
          description: training.description,
          type: training.Trainingtype,
          duration: training.deadline,
          progress: progress?.overallProgress || 0,
          status: progress?.status || 'pending',
          deadline: training.deadline,
          assignedDate: training.createdDate,
          completedDate: progress?.completedAt,
          modules: training.modules,
          createdAt: training.createdDate
        };
      })
    );

    res.json({
      status: 'success',
      data: trainingWithProgress,
      count: trainingWithProgress.length
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

// Get detailed training information with progress
exports.getUserTrainingDetails = async (req, res) => {
  try {
    const { userId, trainingId } = req.params;

    if (!userId || !trainingId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and training ID are required'
      });
    }

    // Get training with populated modules
    const training = await TrainingLMS.findById(trainingId).populate('modules');
    if (!training) {
      return res.status(404).json({
        status: 'error',
        message: 'Training not found'
      });
    }

    // Check if user is assigned
    if (!training.Assignedfor.includes(userId)) {
      return res.status(404).json({
        status: 'error',
        message: 'User not assigned to this training'
      });
    }

    // Get training progress
    const progress = await TrainingProgressLMS.findOne({
      trainingId: training._id,
      userId: userId // This might need to be converted to ObjectId
    });

    // Format response with detailed progress
    const formattedTraining = {
      id: training._id,
      title: training.trainingName,
      description: training.description,
      type: training.Trainingtype,
      duration: training.deadline,
      progress: progress?.overallProgress || 0,
      status: progress?.status || 'pending',
      deadline: training.deadline,
      assignedDate: training.createdDate,
      completedDate: progress?.completedAt,
      modules: training.modules.map((module, moduleIndex) => {
        const moduleProgress = progress?.modules?.find(mp => 
          mp.moduleId.toString() === module._id.toString()
        );

        return {
          moduleId: module._id,
          moduleName: module.moduleName,
          moduleOrder: moduleIndex,
          description: module.description,
          status: moduleProgress?.pass ? 'completed' : 'pending',
          completionPercentage: moduleProgress ? 
            (moduleProgress.videos.filter(v => v.completed).length / module.videos.length) * 100 : 0,
          videos: module.videos.map((video, videoIndex) => {
            const videoProgress = moduleProgress?.videos?.find(vp => vp.videoIndex === videoIndex);

            return {
              videoIndex: videoIndex,
              videoTitle: video.title,
              videoUrl: video.videoUri,
              videoDuration: videoProgress?.totalDuration || 0,
              watchTime: videoProgress?.watchTime || 0,
              progress: videoProgress?.progress || 0,
              completed: videoProgress?.completed || false,
              lastWatchedAt: videoProgress?.lastWatchedAt,
              completedAt: videoProgress?.completedAt
            };
          })
        };
      })
    };

    res.json({
      status: 'success',
      data: formattedTraining
    });

  } catch (error) {
    console.error('Error fetching training details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch training details',
      error: error.message
    });
  }
};

// Update video progress (core functionality for consumption site)
exports.updateVideoProgress = async (req, res) => {
  try {
    const { userId, trainingId, moduleId, videoIndex } = req.params;
    const { watchTime, totalDuration, completed } = req.body;

    // Validate input
    if (!userId || !trainingId || !moduleId || videoIndex === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID, training ID, module ID, and video index are required'
      });
    }

    if (watchTime === undefined || totalDuration === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Watch time and total duration are required'
      });
    }

    // Get training and module to validate
    const training = await TrainingLMS.findById(trainingId);
    const module = await ModuleLMS.findById(moduleId);
    
    if (!training || !module) {
      return res.status(404).json({
        status: 'error',
        message: 'Training or module not found'
      });
    }

    // Check if user is assigned
    if (!training.Assignedfor.includes(userId)) {
      return res.status(404).json({
        status: 'error',
        message: 'User not assigned to this training'
      });
    }

    // Validate video index
    if (videoIndex >= module.videos.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid video index'
      });
    }

    const video = module.videos[videoIndex];

    // Find or create training progress
    let trainingProgress = await TrainingProgressLMS.findOne({
      trainingId: trainingId,
      userId: userId
    });

    if (!trainingProgress) {
      trainingProgress = new TrainingProgressLMS({
        userId: userId,
        trainingName: training.trainingName,
        trainingId: trainingId,
        deadline: training.deadline,
        modules: []
      });
    }

    // Find or create module progress
    let moduleProgress = trainingProgress.modules.find(mp => 
      mp.moduleId.toString() === moduleId
    );

    if (!moduleProgress) {
      moduleProgress = {
        moduleId: moduleId,
        pass: false,
        videos: []
      };
      trainingProgress.modules.push(moduleProgress);
    }

    // Find or create video progress
    let videoProgress = moduleProgress.videos.find(vp => vp.videoIndex === parseInt(videoIndex));

    if (!videoProgress) {
      videoProgress = {
        videoIndex: parseInt(videoIndex),
        videoTitle: video.title,
        watchTime: 0,
        totalDuration: totalDuration,
        progress: 0,
        completed: false,
        pass: false
      };
      moduleProgress.videos.push(videoProgress);
    }

    // Update video progress
    videoProgress.watchTime = Math.min(watchTime, totalDuration);
    videoProgress.totalDuration = totalDuration;
    videoProgress.progress = (videoProgress.watchTime / totalDuration) * 100;
    videoProgress.lastWatchedAt = new Date();

    // Mark as completed if specified or if watch time >= 90% of total duration
    const completionThreshold = totalDuration * 0.9;
    if (completed || watchTime >= completionThreshold) {
      videoProgress.completed = true;
      videoProgress.completedAt = new Date();
      videoProgress.pass = true;
    }

    // Calculate module completion
    const totalVideos = module.videos.length;
    const completedVideos = moduleProgress.videos.filter(vp => vp.completed).length;
    const moduleCompletionPercentage = (completedVideos / totalVideos) * 100;
    
    if (moduleCompletionPercentage === 100) {
      moduleProgress.pass = true;
    }

    // Calculate overall training progress
    const totalModules = training.modules.length;
    const completedModules = trainingProgress.modules.filter(mp => mp.pass).length;
    trainingProgress.overallProgress = (completedModules / totalModules) * 100;

    // Update training status
    if (trainingProgress.overallProgress === 100) {
      trainingProgress.status = 'Completed';
      trainingProgress.pass = true;
    } else if (trainingProgress.overallProgress > 0) {
      trainingProgress.status = 'In Progress';
    }

    // Save progress
    await trainingProgress.save();

    res.json({
      status: 'success',
      message: 'Video progress updated successfully',
      data: {
        userId,
        trainingId,
        moduleId,
        videoIndex: parseInt(videoIndex),
        watchTime: videoProgress.watchTime,
        totalDuration: videoProgress.totalDuration,
        progress: videoProgress.progress,
        completed: videoProgress.completed,
        moduleProgress: moduleCompletionPercentage,
        overallProgress: trainingProgress.overallProgress
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

// Get all training progress for a user (dashboard overview)
exports.getUserTrainingProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }

    const progressRecords = await TrainingProgressLMS.find({ userId })
      .populate('trainingId', 'trainingName description Trainingtype');

    res.json({
      status: 'success',
      data: progressRecords,
      count: progressRecords.length
    });

  } catch (error) {
    console.error('Error fetching user training progress:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch training progress',
      error: error.message
    });
  }
};
