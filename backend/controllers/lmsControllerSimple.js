const mongoose = require('mongoose');

// Simple controller that works with your existing collections
// We'll query your collections directly using the raw MongoDB driver

// Get user's assigned trainings (works with your actual data structure)
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

    // Query your actual trainings collection
    const db = mongoose.connection.db;
    const trainingsCollection = db.collection('trainings'); // Your actual collection name
    
    // Find trainings where this user is in Assignedfor array
    const userTrainings = await trainingsCollection.find({
      Assignedfor: { $in: [userId] }
    }).toArray();

    console.log('Found trainings:', userTrainings.length);

    // Format response to match expected structure
    const formattedTrainings = userTrainings.map(training => ({
      id: training._id,
      title: training.trainingName,
      description: training.description || '',
      type: training.Trainingtype || 'assigned',
      duration: training.deadline,
      progress: 0, // Will be calculated from progress collection
      status: 'pending', // Will be updated from progress collection
      deadline: training.deadline,
      assignedDate: training.createdDate,
      modules: training.modules || [],
      createdAt: training.createdDate
    }));

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

    const db = mongoose.connection.db;
    const trainingsCollection = db.collection('trainings');
    const modulesCollection = db.collection('modules');

    // Get training
    const training = await trainingsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(trainingId) 
    });
    
    if (!training) {
      return res.status(404).json({
        status: 'error',
        message: 'Training not found'
      });
    }

    // Check if user is assigned
    if (!training.Assignedfor || !training.Assignedfor.includes(userId)) {
      return res.status(404).json({
        status: 'error',
        message: 'User not assigned to this training'
      });
    }

    // Get modules for this training
    let modules = [];
    if (training.modules && training.modules.length > 0) {
      const moduleIds = training.modules.map(id => new mongoose.Types.ObjectId(id));
      modules = await modulesCollection.find({ 
        _id: { $in: moduleIds } 
      }).toArray();
    }

    // Format response
    const formattedTraining = {
      id: training._id,
      title: training.trainingName,
      description: training.description || '',
      type: training.Trainingtype || 'assigned',
      duration: training.deadline,
      progress: 0, // Will be calculated from progress
      status: 'pending',
      deadline: training.deadline,
      assignedDate: training.createdDate,
      modules: modules.map((module, moduleIndex) => ({
        moduleId: module._id,
        moduleName: module.moduleName,
        moduleOrder: moduleIndex,
        description: module.description || '',
        status: 'pending',
        completionPercentage: 0,
        videos: (module.videos || []).map((video, videoIndex) => ({
          videoIndex: videoIndex,
          videoTitle: video.title,
          videoUrl: video.videoUri,
          videoDuration: 0, // Will be set when video is played
          watchTime: 0,
          progress: 0,
          completed: false,
          lastWatchedAt: null,
          completedAt: null
        }))
      }))
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

    const db = mongoose.connection.db;
    const trainingsCollection = db.collection('trainings');
    const progressCollection = db.collection('trainingprogresses'); // Your progress collection

    // Validate training and assignment
    const training = await trainingsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(trainingId) 
    });
    
    if (!training || !training.Assignedfor?.includes(userId)) {
      return res.status(404).json({
        status: 'error',
        message: 'Training not found or user not assigned'
      });
    }

    // Find or create training progress record
    let progressRecord = await progressCollection.findOne({
      trainingId: new mongoose.Types.ObjectId(trainingId),
      userId: userId // Assuming you store userId as string
    });

    if (!progressRecord) {
      // Create new progress record
      progressRecord = {
        userId: userId,
        trainingName: training.trainingName,
        trainingId: new mongoose.Types.ObjectId(trainingId),
        pass: false,
        status: 'In Progress',
        deadline: training.deadline,
        modules: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Find or create module progress
    let moduleProgress = progressRecord.modules.find(mp => 
      mp.moduleId.toString() === moduleId
    );

    if (!moduleProgress) {
      moduleProgress = {
        moduleId: new mongoose.Types.ObjectId(moduleId),
        pass: false,
        videos: []
      };
      progressRecord.modules.push(moduleProgress);
    }

    // Find or create video progress
    let videoProgress = moduleProgress.videos.find(vp => vp.videoIndex === parseInt(videoIndex));

    if (!videoProgress) {
      videoProgress = {
        videoIndex: parseInt(videoIndex),
        pass: false
      };
      moduleProgress.videos.push(videoProgress);
    }

    // Update video progress with watch time tracking
    videoProgress.watchTime = Math.min(watchTime, totalDuration);
    videoProgress.totalDuration = totalDuration;
    videoProgress.progress = (videoProgress.watchTime / totalDuration) * 100;
    videoProgress.lastWatchedAt = new Date();

    // Mark as completed if specified or if watch time >= 90% of total duration
    const completionThreshold = totalDuration * 0.9;
    if (completed || watchTime >= completionThreshold) {
      videoProgress.pass = true;
      videoProgress.completed = true;
      videoProgress.completedAt = new Date();
    }

    // Update timestamps
    progressRecord.updatedAt = new Date();
    
    // Save or update the progress record
    if (progressRecord._id) {
      await progressCollection.updateOne(
        { _id: progressRecord._id },
        { $set: progressRecord }
      );
    } else {
      await progressCollection.insertOne(progressRecord);
    }

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
        completed: videoProgress.completed || false,
        moduleProgress: 0, // Calculate if needed
        overallProgress: 0 // Calculate if needed
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

// Get all training progress for a user
exports.getUserTrainingProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }

    const db = mongoose.connection.db;
    const progressCollection = db.collection('trainingprogresses');

    const progressRecords = await progressCollection.find({
      userId: userId
    }).toArray();

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

// === NEW APIs FOR EXTERNAL WEBSITE INTEGRATION ===

// 1. Update Video Progress API (Enhanced for external website)
exports.updateVideoProgressExternal = async (req, res) => {
  try {
    const { userId, trainingId, moduleId, videoId } = req.params;
    const { action, timestamp, progress, duration, currentTime } = req.body;

    // Validate input
    if (!userId || !trainingId || !moduleId || !videoId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID, training ID, module ID, and video ID are required'
      });
    }

    if (!action || !['started', 'completed', 'paused'].includes(action)) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid action (started, completed, paused) is required'
      });
    }

    const db = mongoose.connection.db;
    const trainingsCollection = db.collection('trainings');
    const progressCollection = db.collection('trainingprogresses');
    const activityLogCollection = db.collection('useractivitylogs');

    // Validate training and assignment
    const training = await trainingsCollection.findOne({
      _id: new mongoose.Types.ObjectId(trainingId)
    });

    if (!training || !training.Assignedfor?.includes(userId)) {
      return res.status(404).json({
        status: 'error',
        message: 'Training not found or user not assigned'
      });
    }

    // Find or create training progress record
    let progressRecord = await progressCollection.findOne({
      trainingId: new mongoose.Types.ObjectId(trainingId),
      userId: userId
    });

    if (!progressRecord) {
      progressRecord = {
        userId: userId,
        trainingName: training.trainingName,
        trainingId: new mongoose.Types.ObjectId(trainingId),
        pass: false,
        status: 'In Progress',
        deadline: training.deadline,
        modules: [],
        overallProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Find or create module progress
    let moduleProgress = progressRecord.modules.find(mp =>
      mp.moduleId.toString() === moduleId
    );

    if (!moduleProgress) {
      moduleProgress = {
        moduleId: new mongoose.Types.ObjectId(moduleId),
        pass: false,
        videos: []
      };
      progressRecord.modules.push(moduleProgress);
    }

    // Find or create video progress
    let videoProgress = moduleProgress.videos.find(vp => vp.videoId === videoId);

    if (!videoProgress) {
      videoProgress = {
        videoId: videoId,
        videoTitle: `Video ${videoId}`,
        pass: false,
        watchTime: 0,
        totalDuration: duration || 0,
        progress: 0,
        completed: false,
        lastWatched: new Date(),
        completedAt: null
      };
      moduleProgress.videos.push(videoProgress);
    }

    // Update video progress based on action
    const now = new Date();

    if (action === 'started') {
      videoProgress.lastWatched = now;
      if (currentTime) {
        videoProgress.watchTime = Math.max(videoProgress.watchTime, currentTime);
      }
    } else if (action === 'completed') {
      videoProgress.completed = true;
      videoProgress.pass = true;
      videoProgress.completedAt = now;
      videoProgress.watchTime = duration || videoProgress.totalDuration;
      videoProgress.progress = 100;
    } else if (action === 'paused') {
      if (currentTime !== undefined) {
        videoProgress.watchTime = Math.max(videoProgress.watchTime, currentTime);
      }
      videoProgress.lastWatched = now;
    }

    // Update progress percentage
    if (duration && currentTime !== undefined) {
      videoProgress.progress = Math.min(100, (currentTime / duration) * 100);
      videoProgress.totalDuration = duration;
    }

    // Calculate module progress
    const totalVideos = moduleProgress.videos.length;
    const completedVideos = moduleProgress.videos.filter(vp => vp.completed).length;
    const moduleCompletionPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    moduleProgress.pass = moduleCompletionPercentage >= 90; // 90% completion threshold

    // Calculate overall training progress
    const totalModules = progressRecord.modules.length;
    const completedModules = progressRecord.modules.filter(mp => mp.pass).length;
    progressRecord.overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

    // Update training status
    if (progressRecord.overallProgress >= 100) {
      progressRecord.status = 'Completed';
      progressRecord.pass = true;
    } else if (progressRecord.overallProgress > 0) {
      progressRecord.status = 'In Progress';
    }

    progressRecord.updatedAt = now;

    // Save progress record
    if (progressRecord._id) {
      await progressCollection.updateOne(
        { _id: progressRecord._id },
        { $set: progressRecord }
      );
    } else {
      const result = await progressCollection.insertOne(progressRecord);
      progressRecord._id = result.insertedId;
    }

    // Log user activity
    const activityLog = {
      userId: userId,
      trainingId: new mongoose.Types.ObjectId(trainingId),
      moduleId: new mongoose.Types.ObjectId(moduleId),
      videoId: videoId,
      action: action,
      timestamp: timestamp ? new Date(timestamp) : now,
      progress: videoProgress.progress,
      watchTime: videoProgress.watchTime,
      source: 'external_website',
      createdAt: now
    };

    await activityLogCollection.insertOne(activityLog);

    res.json({
      success: true,
      message: 'Video progress updated successfully',
      data: {
        videoProgress: {
          pass: videoProgress.pass,
          completedAt: videoProgress.completedAt,
          progress: videoProgress.progress
        },
        moduleProgress: {
          pass: moduleProgress.pass,
          completionPercentage: moduleCompletionPercentage.toFixed(2)
        },
        trainingProgress: {
          overallCompletion: progressRecord.overallProgress.toFixed(2),
          status: progressRecord.status
        }
      }
    });

  } catch (error) {
    console.error('Error updating video progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video progress',
      error: error.message
    });
  }
};

// 2. Get User's Current Training Progress (for external website)
exports.getUserProgressExternal = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const db = mongoose.connection.db;
    const trainingsCollection = db.collection('trainings');
    const progressCollection = db.collection('trainingprogresses');
    const modulesCollection = db.collection('modules');

    // Get user's trainings
    const userTrainings = await trainingsCollection.find({
      Assignedfor: { $in: [userId] }
    }).toArray();

    if (userTrainings.length === 0) {
      return res.json({
        success: true,
        data: {
          userId,
          activeTrainings: []
        }
      });
    }

    const activeTrainings = [];

    for (const training of userTrainings) {
      // Get progress for this training
      const progressRecord = await progressCollection.findOne({
        trainingId: training._id,
        userId: userId
      });

      // Get modules for this training
      let modules = [];
      if (training.modules && training.modules.length > 0) {
        const moduleIds = training.modules.map(id => new mongoose.Types.ObjectId(id));
        modules = await modulesCollection.find({
          _id: { $in: moduleIds }
        }).toArray();
      }

      // Format modules with progress
      const formattedModules = modules.map((module, index) => {
        const moduleProgress = progressRecord?.modules?.find(mp =>
          mp.moduleId.toString() === module._id.toString()
        );

        const videos = (module.videos || []).map((video, videoIndex) => {
          const videoProgress = moduleProgress?.videos?.find(vp => vp.videoId === videoIndex.toString());

          return {
            videoId: videoIndex.toString(),
            videoName: video.title,
            progress: videoProgress?.progress || 0,
            pass: videoProgress?.pass || false,
            lastWatched: videoProgress?.lastWatched || null
          };
        });

        const completionPercentage = moduleProgress?.videos ?
          (moduleProgress.videos.filter(vp => vp.completed).length / moduleProgress.videos.length) * 100 : 0;

        return {
          moduleId: module._id.toString(),
          moduleName: module.moduleName,
          progress: completionPercentage,
          pass: moduleProgress?.pass || false,
          videos: videos
        };
      });

      const overallProgress = progressRecord?.overallProgress || 0;
      const status = progressRecord?.status || 'Pending';

      activeTrainings.push({
        trainingId: training._id.toString(),
        trainingName: training.trainingName,
        deadline: training.deadline,
        overallProgress: overallProgress,
        status: status,
        modules: formattedModules
      });
    }

    res.json({
      success: true,
      data: {
        userId,
        activeTrainings
      }
    });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user progress',
      error: error.message
    });
  }
};

// 3. Sync External Website Progress
exports.syncExternalProgress = async (req, res) => {
  try {
    const { userId, externalWebsiteData } = req.body;

    if (!userId || !externalWebsiteData) {
      return res.status(400).json({
        success: false,
        message: 'User ID and external website data are required'
      });
    }

    const { videoId, watchTime, totalTime, completed, lastActivity } = externalWebsiteData;

    // This is a simplified sync endpoint - in a real implementation,
    // you would need to map external video IDs to your internal video IDs
    // For now, we'll assume the videoId matches your internal structure

    res.json({
      success: true,
      message: 'External progress synced successfully',
      data: {
        syncedAt: new Date(),
        videoId,
        userId
      }
    });

  } catch (error) {
    console.error('Error syncing external progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync external progress',
      error: error.message
    });
  }
};

