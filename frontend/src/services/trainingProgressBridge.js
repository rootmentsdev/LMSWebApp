// Training Progress Bridge Service
// This service connects your training app with the LMS system to sync progress

import { config } from '../config';

const BRIDGE_BASE_URL = 'http://localhost:5000/api/bridge';

// Update training progress in both local DB and LMS system
export const updateTrainingProgress = async (progressData) => {
  try {
    console.log('🔄 Updating training progress via bridge:', progressData);
    
    const response = await fetch(`${BRIDGE_BASE_URL}/update-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progressData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Progress updated successfully:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error updating training progress:', error);
    throw error;
  }
};

// Handle video completion event
export const handleVideoCompletion = async (videoData) => {
  try {
    console.log('🎬 Recording video completion via bridge:', videoData);
    
    const response = await fetch(`${BRIDGE_BASE_URL}/video-completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Video completion recorded successfully:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error recording video completion:', error);
    throw error;
  }
};

// Get training progress from both systems
export const getTrainingProgress = async (userId, trainingId) => {
  try {
    console.log('🔍 Fetching training progress via bridge:', { userId, trainingId });
    
    const response = await fetch(`${BRIDGE_BASE_URL}/progress/${userId}/${trainingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Progress fetched successfully:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error fetching training progress:', error);
    throw error;
  }
};

// Sync all training progress between systems
export const syncAllProgress = async () => {
  try {
    console.log('🔄 Starting full progress sync via bridge...');
    
    const response = await fetch(`${BRIDGE_BASE_URL}/sync-all-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Progress sync completed:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error syncing progress:', error);
    throw error;
  }
};

// Enhanced video progress tracking with bridge integration
export const trackVideoProgress = async (videoData) => {
  try {
    const { userId, trainingId, moduleId, videoId, currentTime, duration, action } = videoData;
    
    // Calculate progress percentage
    const progress = Math.round((currentTime / duration) * 100);
    
    // Determine status based on progress
    let status = 'in_progress';
    if (progress >= 90) {
      status = 'completed';
    } else if (progress <= 0) {
      status = 'pending';
    }

    const progressData = {
      userId,
      trainingId,
      moduleId,
      videoId,
      progress,
      status,
      action: action || 'video_progress',
      watchTime: Math.round(currentTime),
      totalDuration: Math.round(duration)
    };

    console.log('📊 Tracking video progress:', progressData);

    // Update progress via bridge
    const result = await updateTrainingProgress(progressData);
    
    return result;
  } catch (error) {
    console.error('❌ Error tracking video progress:', error);
    throw error;
  }
};

// Complete video and update LMS
export const completeVideo = async (videoData) => {
  try {
    const { userId, trainingId, moduleId, videoId, duration } = videoData;
    
    const completionData = {
      userId,
      trainingId,
      moduleId,
      videoId,
      duration,
      watchTime: duration, // Full duration watched
      action: 'video_completed'
    };

    console.log('✅ Completing video:', completionData);

    // Record video completion via bridge
    const result = await handleVideoCompletion(completionData);
    
    return result;
  } catch (error) {
    console.error('❌ Error completing video:', error);
    throw error;
  }
};

// Get overall training completion status
export const getTrainingCompletionStatus = async (userId, trainingId) => {
  try {
    const progress = await getTrainingProgress(userId, trainingId);
    
    if (progress && progress.data && progress.data.localProgress) {
      const localProgress = progress.data.localProgress;
      
      return {
        overallProgress: localProgress.progress || 0,
        status: localProgress.status || 'pending',
        moduleProgress: localProgress.moduleProgress || [],
        lastUpdated: localProgress.lastUpdated || new Date().toISOString()
      };
    }
    
    return {
      overallProgress: 0,
      status: 'pending',
      moduleProgress: [],
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error getting training completion status:', error);
    return {
      overallProgress: 0,
      status: 'pending',
      moduleProgress: [],
      lastUpdated: new Date().toISOString()
    };
  }
};

// Update module progress
export const updateModuleProgress = async (moduleData) => {
  try {
    const { userId, trainingId, moduleId, moduleName, progress, status } = moduleData;
    
    const progressData = {
      userId,
      trainingId,
      moduleId,
      videoId: null, // No specific video
      progress,
      status,
      action: 'module_progress'
    };

    console.log('📚 Updating module progress:', progressData);

    // Update progress via bridge
    const result = await updateTrainingProgress(progressData);
    
    return result;
  } catch (error) {
    console.error('❌ Error updating module progress:', error);
    throw error;
  }
};

// Complete module and update LMS
export const completeModule = async (moduleData) => {
  try {
    const { userId, trainingId, moduleId, moduleName } = moduleData;
    
    const progressData = {
      userId,
      trainingId,
      moduleId,
      videoId: null, // No specific video
      progress: 100,
      status: 'completed',
      action: 'module_completed'
    };

    console.log('🎯 Completing module:', progressData);

    // Update progress via bridge
    const result = await updateTrainingProgress(progressData);
    
    return result;
  } catch (error) {
    console.error('❌ Error completing module:', error);
    throw error;
  }
};

// Complete training and update LMS
export const completeTraining = async (trainingData) => {
  try {
    const { userId, trainingId } = trainingData;
    
    const progressData = {
      userId,
      trainingId,
      moduleId: null, // No specific module
      videoId: null, // No specific video
      progress: 100,
      status: 'completed',
      action: 'training_completed'
    };

    console.log('🎉 Completing training:', progressData);

    // Update progress via bridge
    const result = await updateTrainingProgress(progressData);
    
    return result;
  } catch (error) {
    console.error('❌ Error completing training:', error);
    throw error;
  }
};

// Export all functions
export default {
  updateTrainingProgress,
  handleVideoCompletion,
  getTrainingProgress,
  syncAllProgress,
  trackVideoProgress,
  completeVideo,
  getTrainingCompletionStatus,
  updateModuleProgress,
  completeModule,
  completeTraining
};
