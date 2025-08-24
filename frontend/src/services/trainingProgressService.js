// Training Progress Service for External LMS
// This service handles video completion tracking according to your LMS API spec

import { config, getApiHeaders } from '../config';

// Mark video as completed in your external LMS
export const markVideoCompleted = async (userId, trainingId, moduleId, videoId) => {
  try {
    console.log('🎬 Marking video as completed in LMS:', {
      userId,
      trainingId,
      moduleId,
      videoId
    });

    // Build the exact URL as per your LMS spec
    const url = `${config.API_BASE_URL}/api/user/update/trainingprocess?userId=${userId}&trainingId=${trainingId}&moduleId=${moduleId}&videoId=${videoId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getApiHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`LMS API error: ${response.status} - ${response.statusText}`);
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
    throw error;
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

// Export all functions
export default {
  markVideoCompleted,
  getTrainingProgress,
  isVideoCompleted,
  getTrainingCompletionPercentage,
  handleVideoCompletion,
  trackVideoProgress
};
