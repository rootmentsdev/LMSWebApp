// External LMS Integration Service
// This service directly updates your external LMS with training progress

import { config, getApiHeaders } from '../config';

// Update training progress directly in your external LMS
export const updateExternalLMSProgress = async (progressData) => {
  try {
    console.log('🔄 Updating external LMS progress:', progressData);
    
    const { userId, trainingId, moduleId, videoId, progress, status, action } = progressData;
    
    // Build query parameters for your LMS API
    const queryParams = new URLSearchParams({
      userId: userId,
      trainingId: trainingId,
      status: status || 'in_progress',
      action: action || 'progress_update',
      timestamp: new Date().toISOString()
    });

    // Add optional parameters if provided
    if (moduleId) queryParams.append('moduleId', moduleId);
    if (videoId) queryParams.append('videoId', videoId);
    if (progress !== undefined) queryParams.append('progress', progress);

    // Call your external LMS API using PATCH method
    const response = await fetch(`${config.API_BASE_URL}/api/user/update/trainingprocess?${queryParams}`, {
      method: 'PATCH',
      headers: getApiHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`LMS API error: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ External LMS progress updated successfully:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error updating external LMS progress:', error);
    throw error;
  }
};

// Handle video completion in external LMS
export const completeVideoInExternalLMS = async (videoData) => {
  try {
    console.log('🎬 Completing video in external LMS:', videoData);
    
    const { userId, trainingId, moduleId, videoId, duration, watchTime } = videoData;
    
    // Calculate completion percentage
    const completionPercentage = Math.round((watchTime / duration) * 100);
    const isCompleted = completionPercentage >= 90; // 90% threshold
    
    const progressData = {
      userId,
      trainingId,
      moduleId,
      videoId,
      progress: completionPercentage,
      status: isCompleted ? 'completed' : 'in_progress',
      action: 'video_completed',
      watchTime,
      totalDuration: duration
    };

    // Update progress in external LMS
    const result = await updateExternalLMSProgress(progressData);
    
    return result;
  } catch (error) {
    console.error('❌ Error completing video in external LMS:', error);
    throw error;
  }
};

// Track video progress in real-time
export const trackVideoProgressInExternalLMS = async (videoData) => {
  try {
    const { userId, trainingId, moduleId, videoId, currentTime, duration } = videoData;
    
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
      action: 'video_progress',
      watchTime: Math.round(currentTime),
      totalDuration: Math.round(duration)
    };

    console.log('📊 Tracking video progress in external LMS:', progressData);

    // Update progress in external LMS
    const result = await updateExternalLMSProgress(progressData);
    
    return result;
  } catch (error) {
    console.error('❌ Error tracking video progress in external LMS:', error);
    throw error;
  }
};

// Complete module in external LMS
export const completeModuleInExternalLMS = async (moduleData) => {
  try {
    const { userId, trainingId, moduleId, moduleName } = moduleData;
    
    const progressData = {
      userId,
      trainingId,
      moduleId,
      progress: 100,
      status: 'completed',
      action: 'module_completed'
    };

    console.log('🎯 Completing module in external LMS:', progressData);

    // Update progress in external LMS
    const result = await updateExternalLMSProgress(progressData);
    
    return result;
  } catch (error) {
    console.error('❌ Error completing module in external LMS:', error);
    throw error;
  }
};

// Complete training in external LMS
export const completeTrainingInExternalLMS = async (trainingData) => {
  try {
    const { userId, trainingId } = trainingData;
    
    const progressData = {
      userId,
      trainingId,
      progress: 100,
      status: 'completed',
      action: 'training_completed'
    };

    console.log('🎉 Completing training in external LMS:', progressData);

    // Update progress in external LMS
    const result = await updateExternalLMSProgress(progressData);
    
    return result;
  } catch (error) {
    console.error('❌ Error completing training in external LMS:', error);
    throw error;
  }
};

// Get training progress from external LMS
export const getTrainingProgressFromExternalLMS = async (userId, trainingId) => {
  try {
    console.log('🔍 Fetching training progress from external LMS:', { userId, trainingId });
    
    // Use your existing endpoint to get training data
    const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.GET_USER_TRAININGS_WITH_COMPLETION}`, {
      method: 'GET',
      headers: getApiHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch training data: ${response.status}`);
    }

    const result = await response.json();
    
    // Find the specific training and user
    if (result.data && Array.isArray(result.data)) {
      const training = result.data.find(t => 
        t.trainingId === trainingId || t._id === trainingId
      );
      
      if (training && training.userProgress) {
        const userProgress = training.userProgress.find(u => u.userId === userId);
        if (userProgress) {
          return {
            trainingId,
            userId,
            progress: userProgress.averageCompletionPercentage || 0,
            status: (userProgress.averageCompletionPercentage >= 100) ? 'completed' : 'in_progress',
            modules: userProgress.modules || []
          };
        }
      }
    }
    
    return {
      trainingId,
      userId,
      progress: 0,
      status: 'pending',
      modules: []
    };
    
  } catch (error) {
    console.error('❌ Error fetching training progress from external LMS:', error);
    return {
      trainingId,
      userId,
      progress: 0,
      status: 'pending',
      modules: []
    };
  }
};

// Export all functions
export default {
  updateExternalLMSProgress,
  completeVideoInExternalLMS,
  trackVideoProgressInExternalLMS,
  completeModuleInExternalLMS,
  completeTrainingInExternalLMS,
  getTrainingProgressFromExternalLMS
};
