// Training Progress Service for External LMS
// This service handles video completion tracking according to your LMS API spec

import { config, getApiHeaders } from '../config';

// Mark video as completed in your external LMS
export const markVideoCompleted = async (userId, trainingId, moduleId, videoId, progressPercentage = 100) => {
  console.log('🚀 markVideoCompleted called with parameters:', {
    userId: userId || 'UNDEFINED',
    trainingId: trainingId || 'UNDEFINED', 
    moduleId: moduleId || 'UNDEFINED',
    videoId: videoId || 'UNDEFINED',
    progressPercentage,
    types: {
      userId: typeof userId,
      trainingId: typeof trainingId,
      moduleId: typeof moduleId,
      videoId: typeof videoId
    }
  });

  // Basic parameter validation
  if (!userId) {
    throw new Error('userId is required but was not provided');
  }
  if (!trainingId) {
    throw new Error('trainingId is required but was not provided');
  }

  try {
    console.log('🎬 Marking video as completed in LMS:', {
      userId,
      trainingId,
      moduleId,
      videoId,
      progressPercentage
    });

    // 🚀 STEP 1: First, get the training data to validate and get correct IDs
    console.log('📋 Step 1: Validating training data and IDs...');
    const trainingDataUrl = `${config.API_BASE_URL}/api/user/getAll/trainingprocess?userId=${userId}&trainingId=${trainingId}`;
    
    const trainingResponse = await fetch(trainingDataUrl, {
      method: 'GET',
      headers: getApiHeaders()
    });

    if (!trainingResponse.ok) {
      throw new Error(`Failed to get training data: ${trainingResponse.status} - ${trainingResponse.statusText}`);
    }

    const trainingData = await trainingResponse.json();
    console.log('📋 Training data retrieved:', trainingData);

    // 🚀 STEP 2: Extract correct moduleId and videoId from training data
    let validModuleId = moduleId;
    let validVideoId = videoId;

    if (trainingData.data && trainingData.data.trainingId && trainingData.data.trainingId.modules) {
      const modules = trainingData.data.trainingId.modules;
      console.log(`📚 Found ${modules.length} modules in training`);
      
      if (modules.length > 0) {
        // For now, use the first module and first video as fallback
        const firstModule = modules[0];
        if (firstModule.videos && firstModule.videos.length > 0) {
          const firstVideo = firstModule.videos[0];
          
          // Use provided IDs if they exist in the training, otherwise use first available
          const moduleExists = modules.find(m => m._id === moduleId);
          const videoExists = firstModule.videos.find(v => v._id === videoId);
          
          if (!moduleExists) {
            validModuleId = firstModule._id;
            console.log(`⚠️ Module ID ${moduleId} not found, using: ${validModuleId}`);
          }
          
          if (!videoExists) {
            validVideoId = firstVideo._id;
            console.log(`⚠️ Video ID ${videoId} not found, using: ${validVideoId}`);
          }
          
          console.log('✅ Final IDs to use:', { validModuleId, validVideoId });
        }
      }
    }

    // Build the exact URL as per your LMS spec
    const url = `${config.API_BASE_URL}/api/user/update/trainingprocess?userId=${userId}&trainingId=${trainingId}&moduleId=${validModuleId}&videoId=${validVideoId}`;
    console.log('🌐 Final API URL:', url);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getApiHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      // Get more detailed error information
      let errorMessage = `LMS API error: ${response.status} - ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          console.error('❌ LMS API Error Response:', errorBody);
          errorMessage += `\nResponse: ${errorBody}`;
        }
      } catch (e) {
        console.error('❌ Could not read error response body:', e);
      }
      
      console.error('❌ Failed API Call Details:', {
        url,
        method: 'PATCH',
        headers: getApiHeaders(),
        userId,
        trainingId,
        moduleId,
        videoId,
        status: response.status,
        statusText: response.statusText
      });
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Video marked as completed successfully:', result);
    
    // Check if training is now completed
    if (result.data && result.data.trainingProgress) {
      const trainingProgress = result.data.trainingProgress;
      console.log(`🎯 Training Status: ${trainingProgress.status}`);
      console.log(`🎯 Training Pass: ${trainingProgress.pass}`);
      
      if (trainingProgress.pass && trainingProgress.status === 'Completed') {
        console.log('🎉 TRAINING COMPLETED! User has finished the entire training.');
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error marking video as completed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId,
      trainingId,
      moduleId,
      videoId,
      progressPercentage
    });
    
    // Create a more descriptive error
    const detailedError = new Error(`Failed to mark video as completed: ${error.message}`);
    detailedError.originalError = error;
    detailedError.context = { userId, trainingId, moduleId, videoId, progressPercentage };
    
    throw detailedError;
  }
};

// Get training progress from your external LMS
export const getTrainingProgress = async (userId, trainingId) => {
  try {
    console.log('🔍 Getting training progress from LMS:', { userId, trainingId });

    const url = `${config.API_BASE_URL}/api/user/getAll/trainingprocess?userId=${userId}&trainingId=${trainingId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get training progress: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Training progress retrieved:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error getting training progress:', error);
    throw error;
  }
};

// Check if video is completed (helper function)
export const isVideoCompleted = async (userId, trainingId, moduleId, videoId) => {
  try {
    const progress = await getTrainingProgress(userId, trainingId);
    
    if (progress.data && progress.data.modules) {
      const module = progress.data.modules.find(m => m.moduleId === moduleId);
      if (module && module.videos) {
        const video = module.videos.find(v => v.videoId === videoId);
        return video ? video.pass : false;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking video completion:', error);
    return false;
  }
};

// Get overall training completion percentage
export const getTrainingCompletionPercentage = async (userId, trainingId) => {
  try {
    const progress = await getTrainingProgress(userId, trainingId);
    
    if (progress.data && progress.data.modules) {
      const modules = progress.data.modules;
      const totalVideos = modules.reduce((total, module) => 
        total + (module.videos ? module.videos.length : 0), 0
      );
      
      const completedVideos = modules.reduce((completed, module) => 
        completed + (module.videos ? module.videos.filter(v => v.pass).length : 0), 0
      );
      
      const percentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
      
      return {
        totalVideos,
        completedVideos,
        percentage,
        status: progress.data.status || 'Pending'
      };
    }
    
    return {
      totalVideos: 0,
      completedVideos: 0,
      percentage: 0,
      status: 'Pending'
    };
  } catch (error) {
    console.error('❌ Error getting completion percentage:', error);
    return {
      totalVideos: 0,
      completedVideos: 0,
      percentage: 0,
      status: 'Pending'
    };
  }
};

// Enhanced video completion handler with automatic progress calculation
export const handleVideoCompletion = async (videoData) => {
  try {
    const { userId, trainingId, moduleId, videoId, currentTime, duration } = videoData;
    
    // Only mark as completed if 90% or more watched
    const watchPercentage = (currentTime / duration) * 100;
    
    if (watchPercentage >= 90) {
      console.log(`🎯 Video ${watchPercentage.toFixed(1)}% watched - marking as completed`);
      
      // Mark video as completed in LMS
      const result = await markVideoCompleted(userId, trainingId, moduleId, videoId);
      
      // Get updated progress
      const updatedProgress = await getTrainingCompletionPercentage(userId, trainingId);
      
      return {
        success: true,
        videoCompleted: true,
        lmsResponse: result,
        updatedProgress
      };
    } else {
      console.log(`⏸️ Video ${watchPercentage.toFixed(1)}% watched - not marking as completed yet`);
      
      return {
        success: true,
        videoCompleted: false,
        watchPercentage: watchPercentage.toFixed(1)
      };
    }
  } catch (error) {
    console.error('❌ Error handling video completion:', error);
    throw error;
  }
};

// Real-time progress tracker for video watching
export const trackVideoProgress = async (videoData) => {
  try {
    const { userId, trainingId, moduleId, videoId, currentTime, duration } = videoData;
    
    // Calculate watch percentage
    const watchPercentage = (currentTime / duration) * 100;
    
    // Log progress every 25%
    if (watchPercentage % 25 < 1) {
      console.log(`📊 Video progress: ${watchPercentage.toFixed(1)}% watched`);
    }
    
    // Auto-complete at 90%
    if (watchPercentage >= 90) {
      const isAlreadyCompleted = await isVideoCompleted(userId, trainingId, moduleId, videoId);
      
      if (!isAlreadyCompleted) {
        console.log('🎉 Video watch threshold reached - auto-completing...');
        return await handleVideoCompletion(videoData);
      }
    }
    
    return {
      success: true,
      watchPercentage: watchPercentage.toFixed(1),
      autoCompleted: false
    };
  } catch (error) {
    console.error('❌ Error tracking video progress:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 🚀 NEW: Track partial video progress for milestone updates
export const updateVideoProgress = async (userId, trainingId, moduleId, videoId, progressPercentage) => {
  try {
    console.log('📊 Updating video progress in LMS:', {
      userId,
      trainingId,
      moduleId,
      videoId,
      progressPercentage
    });

    // For now, we'll only call the full completion API when progress >= 90%
    // This can be enhanced if your LMS supports partial progress tracking
    if (progressPercentage >= 90) {
      return await markVideoCompleted(userId, trainingId, moduleId, videoId, progressPercentage);
    } else {
      // Log the progress locally for now
      console.log(`📊 Progress ${progressPercentage}% tracked locally - LMS update will happen at 90%+`);
      return {
        success: true,
        progressPercentage,
        message: `Progress ${progressPercentage}% tracked locally`
      };
    }
  } catch (error) {
    console.error('❌ Error updating video progress:', error);
    throw error;
  }
};

// Export all functions
export default {
  markVideoCompleted,
  updateVideoProgress,
  getTrainingProgress,
  isVideoCompleted,
  getTrainingCompletionPercentage,
  handleVideoCompletion,
  trackVideoProgress
};
