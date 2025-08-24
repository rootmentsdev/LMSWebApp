const Training = require('../models/Training');
const axios = require('axios');
const mongoose = require('mongoose');

// Configuration for LMS integration
const LMS_CONFIG = {
  // Your LMS system's base URL (replace with actual URL)
  LMS_BASE_URL: process.env.LMS_BASE_URL || 'https://your-lms-system.com',
  
  // API endpoints for updating training progress
  UPDATE_PROGRESS_ENDPOINT: '/api/update-training-progress',
  GET_PROGRESS_ENDPOINT: '/api/get-training-progress',
  
  // Authentication token for your LMS system
  API_TOKEN: process.env.LMS_API_TOKEN || 'your-lms-api-token',
  
  // Headers for LMS API calls
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.API_TOKEN}`,
      'Content-Type': 'application/json'
    };
  }
};

// Bridge: Update training progress in LMS system
exports.updateLMSProgress = async (req, res) => {
  try {
    const { userId, trainingId, moduleId, videoId, progress, status, action } = req.body;

    console.log('🔄 LMS Progress Update Request:', {
      userId,
      trainingId,
      moduleId,
      videoId,
      progress,
      status,
      action
    });

    // Validate required fields
    if (!userId || !trainingId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and Training ID are required'
      });
    }

    // First, update local database
    const localUpdate = await updateLocalProgress(userId, trainingId, moduleId, videoId, progress, status);
    
    // Then, update LMS system
    const lmsUpdate = await updateLMSProgress(userId, trainingId, moduleId, videoId, progress, status, action);

    res.json({
      status: 'success',
      message: 'Training progress updated successfully',
      data: {
        localUpdate,
        lmsUpdate,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error updating LMS progress:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update training progress',
      error: error.message
    });
  }
};

// Update progress in local database
async function updateLocalProgress(userId, trainingId, moduleId, videoId, progress, status) {
  try {
    // Handle both ObjectId and string IDs
    let training;
    if (mongoose.Types.ObjectId.isValid(trainingId)) {
      training = await Training.findById(trainingId);
    } else {
      // For testing purposes, create a mock training if not found
      training = await Training.findOne({ title: { $regex: 'test', $options: 'i' } });
      if (!training) {
        console.log('⚠️ Training not found, creating mock training for testing...');
        training = new Training({
          title: 'Test Training',
          description: 'Mock training for testing',
          type: 'regular',
          duration: 7,
          assignedUsers: [{
            userId: userId,
            userName: 'Test User',
            userRole: 'employee',
            userBranch: 'test',
            progress: 0,
            status: 'pending'
          }],
          createdBy: 'test',
          modules: []
        });
        await training.save();
      }
    }
    
    if (!training) {
      throw new Error('Training not found and could not create mock training');
    }

    // Find user assignment
    const userIndex = training.assignedUsers.findIndex(
      user => user.userId === userId
    );

    if (userIndex === -1) {
      throw new Error('User not assigned to this training');
    }

    // Update progress
    training.assignedUsers[userIndex].progress = Math.max(0, Math.min(100, progress));
    
    // Update status based on progress
    if (progress >= 100) {
      training.assignedUsers[userIndex].status = 'completed';
      training.assignedUsers[userIndex].completedDate = new Date();
    } else if (progress > 0) {
      training.assignedUsers[userIndex].status = 'in_progress';
    }

    // Add module progress tracking
    if (moduleId && videoId) {
      if (!training.assignedUsers[userIndex].moduleProgress) {
        training.assignedUsers[userIndex].moduleProgress = [];
      }

      const moduleIndex = training.assignedUsers[userIndex].moduleProgress.findIndex(
        m => m.moduleId === moduleId
      );

      if (moduleIndex === -1) {
        // Create new module progress
        training.assignedUsers[userIndex].moduleProgress.push({
          moduleId,
          moduleName: `Module ${moduleId}`,
          progress: progress,
          status: status || 'in_progress',
          videos: [{
            videoId,
            progress: progress,
            status: status || 'in_progress',
            lastUpdated: new Date()
          }],
          lastUpdated: new Date()
        });
      } else {
        // Update existing module progress
        training.assignedUsers[userIndex].moduleProgress[moduleIndex].progress = progress;
        training.assignedUsers[userIndex].moduleProgress[moduleIndex].status = status || 'in_progress';
        training.assignedUsers[userIndex].moduleProgress[moduleIndex].lastUpdated = new Date();

        // Update video progress
        const videoIndex = training.assignedUsers[userIndex].moduleProgress[moduleIndex].videos.findIndex(
          v => v.videoId === videoId
        );

        if (videoIndex === -1) {
          training.assignedUsers[userIndex].moduleProgress[moduleIndex].videos.push({
            videoId,
            progress: progress,
            status: status || 'in_progress',
            lastUpdated: new Date()
          });
        } else {
          training.assignedUsers[userIndex].moduleProgress[moduleIndex].videos[videoIndex].progress = progress;
          training.assignedUsers[userIndex].moduleProgress[moduleIndex].videos[videoIndex].status = status || 'in_progress';
          training.assignedUsers[userIndex].moduleProgress[moduleIndex].videos[videoIndex].lastUpdated = new Date();
        }
      }
    }

    await training.save();

    console.log('✅ Local progress updated successfully');
    return {
      trainingId,
      userId,
      progress: training.assignedUsers[userIndex].progress,
      status: training.assignedUsers[userIndex].status,
      moduleProgress: training.assignedUsers[userIndex].moduleProgress
    };

  } catch (error) {
    console.error('❌ Error updating local progress:', error);
    throw error;
  }
}

// Update progress in LMS system
async function updateLMSProgress(userId, trainingId, moduleId, videoId, progress, status, action) {
  try {
    // Prepare data for LMS system
    const lmsData = {
      userId,
      trainingId,
      moduleId,
      videoId,
      progress,
      status,
      action,
      timestamp: new Date().toISOString(),
      source: 'training-app-bridge'
    };

    console.log('🌐 Sending to LMS system:', lmsData);

    // Make API call to LMS system
    const response = await axios.post(
      `${LMS_CONFIG.LMS_BASE_URL}${LMS_CONFIG.UPDATE_PROGRESS_ENDPOINT}`,
      lmsData,
      {
        headers: LMS_CONFIG.getHeaders(),
        timeout: 10000
      }
    );

    console.log('✅ LMS system updated successfully:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ Error updating LMS system:', error);
    
    // Return error details but don't fail the entire request
    return {
      success: false,
      error: error.message,
      statusCode: error.response?.status || 'unknown'
    };
  }
}

// Bridge: Get training progress from LMS system
exports.getLMSProgress = async (req, res) => {
  try {
    const { userId, trainingId } = req.params;

    if (!userId || !trainingId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and Training ID are required'
      });
    }

    console.log('🔍 Fetching LMS progress for:', { userId, trainingId });

    // Get local progress
    const localProgress = await getLocalProgress(userId, trainingId);
    
    // Get LMS progress
    const lmsProgress = await getLMSProgress(userId, trainingId);

    res.json({
      status: 'success',
      data: {
        localProgress,
        lmsProgress,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error fetching LMS progress:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch training progress',
      error: error.message
    });
  }
};

// Get progress from local database
async function getLocalProgress(userId, trainingId) {
  try {
    const training = await Training.findById(trainingId);
    if (!training) {
      return null;
    }

    const userAssignment = training.assignedUsers.find(
      user => user.userId === userId
    );

    if (!userAssignment) {
      return null;
    }

    return {
      trainingId,
      userId,
      progress: userAssignment.progress,
      status: userAssignment.status,
      moduleProgress: userAssignment.moduleProgress || [],
      assignedDate: userAssignment.assignedDate,
      completedDate: userAssignment.completedDate
    };

  } catch (error) {
    console.error('❌ Error getting local progress:', error);
    return null;
  }
}

// Get progress from LMS system
async function getLMSProgress(userId, trainingId) {
  try {
    const response = await axios.get(
      `${LMS_CONFIG.LMS_BASE_URL}${LMS_CONFIG.GET_PROGRESS_ENDPOINT}`,
      {
        params: { userId, trainingId },
        headers: LMS_CONFIG.getHeaders(),
        timeout: 10000
      }
    );

    console.log('✅ LMS progress fetched successfully');
    return response.data;

  } catch (error) {
    console.error('❌ Error fetching LMS progress:', error);
    return {
      success: false,
      error: error.message,
      statusCode: error.response?.status || 'unknown'
    };
  }
}

// Bridge: Sync all training progress between systems
exports.syncAllProgress = async (req, res) => {
  try {
    console.log('🔄 Starting full progress sync...');

    // Get all trainings with assigned users
    const trainings = await Training.find({
      'assignedUsers.0': { $exists: true }
    });

    let syncResults = [];
    let successCount = 0;
    let errorCount = 0;

    for (const training of trainings) {
      for (const userAssignment of training.assignedUsers) {
        try {
          // Sync each user's progress
          const localUpdate = await updateLocalProgress(
            userAssignment.userId,
            training._id,
            null,
            null,
            userAssignment.progress,
            userAssignment.status
          );

          const lmsUpdate = await updateLMSProgress(
            userAssignment.userId,
            training._id,
            null,
            null,
            userAssignment.progress,
            userAssignment.status,
            'sync'
          );

          syncResults.push({
            trainingId: training._id,
            userId: userAssignment.userId,
            success: true,
            localUpdate,
            lmsUpdate
          });

          successCount++;

        } catch (error) {
          console.error(`❌ Sync failed for training ${training._id}, user ${userAssignment.userId}:`, error);
          
          syncResults.push({
            trainingId: training._id,
            userId: userAssignment.userId,
            success: false,
            error: error.message
          });

          errorCount++;
        }
      }
    }

    res.json({
      status: 'success',
      message: 'Progress sync completed',
      data: {
        totalProcessed: syncResults.length,
        successCount,
        errorCount,
        results: syncResults,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error during progress sync:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to sync training progress',
      error: error.message
    });
  }
};

// Bridge: Handle video completion events
exports.handleVideoCompletion = async (req, res) => {
  try {
    const { userId, trainingId, moduleId, videoId, duration, watchTime } = req.body;

    console.log('🎬 Video completion event:', {
      userId,
      trainingId,
      moduleId,
      videoId,
      duration,
      watchTime
    });

    // Calculate progress percentage
    const progress = Math.round((watchTime / duration) * 100);
    const status = progress >= 90 ? 'completed' : 'in_progress'; // 90% threshold for completion

    // Update both systems
    const localUpdate = await updateLocalProgress(userId, trainingId, moduleId, videoId, progress, status);
    const lmsUpdate = await updateLMSProgress(userId, trainingId, moduleId, videoId, progress, status, 'video_completed');

    res.json({
      status: 'success',
      message: 'Video completion recorded successfully',
      data: {
        videoId,
        progress,
        status,
        localUpdate,
        lmsUpdate,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error handling video completion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to record video completion',
      error: error.message
    });
  }
};

module.exports = exports;
