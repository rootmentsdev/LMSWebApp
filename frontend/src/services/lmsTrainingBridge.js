// LMS Training Bridge Service
// This service integrates with your existing LMS training progression API
// Based on your TrainingProgress schema and API endpoints

import { config, getApiHeaders } from '../config';

// LMS API Base URLs
const LMS_API_BASE = config.API_BASE_URL; // https://lms-testenv.onrender.com

/**
 * Get all training assignments for a user (empID)
 * Uses: GET /api/user/getAll/training?empID={empID}
 */
export const getUserTrainings = async (empID) => {
  try {
    console.log('🔍 Fetching user trainings from LMS:', { empID });

    const url = `${LMS_API_BASE}/api/user/getAll/training?empID=${empID}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user trainings: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ User trainings retrieved from LMS:', result);
    
    return {
      success: true,
      data: result,
      trainings: result.data || []
    };
  } catch (error) {
    console.error('❌ Error fetching user trainings:', error);
    throw error;
  }
};

/**
 * Get detailed training progress for a specific training
 * Uses: GET /api/user/getAll/trainingprocess?userId={userId}&trainingId={trainingId}
 */
export const getTrainingProgress = async (userId, trainingId) => {
  try {
    console.log('📊 Fetching detailed training progress:', { userId, trainingId });

    const url = `${LMS_API_BASE}/api/user/getAll/trainingprocess?userId=${userId}&trainingId=${trainingId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch training progress: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Training progress retrieved from LMS:', result);
    
    return {
      success: true,
      data: result.data,
      trainingProgress: result.data?.trainingProgress || null
    };
  } catch (error) {
    console.error('❌ Error fetching training progress:', error);
    throw error;
  }
};

/**
 * Get module progress within a training
 * Uses: GET /api/user/getAll/trainingprocess/module?userId={userId}&trainingId={trainingId}&moduleId={moduleId}
 */
export const getModuleProgress = async (userId, trainingId, moduleId) => {
  try {
    console.log('📋 Fetching module progress:', { userId, trainingId, moduleId });

    const url = `${LMS_API_BASE}/api/user/getAll/trainingprocess/module?userId=${userId}&trainingId=${trainingId}&moduleId=${moduleId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch module progress: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Module progress retrieved from LMS:', result);
    
    return {
      success: true,
      data: result.data,
      moduleProgress: result.data || null
    };
  } catch (error) {
    console.error('❌ Error fetching module progress:', error);
    throw error;
  }
};

/**
 * Update training progress (mark video as completed)
 * Uses: PATCH /api/user/update/trainingprocess?userId={userId}&trainingId={trainingId}&moduleId={moduleId}&videoId={videoId}
 */
export const updateTrainingProgress = async (userId, trainingId, moduleId, videoId) => {
  try {
    console.log('🎯 Updating training progress in LMS:', {
      userId,
      trainingId,
      moduleId,
      videoId
    });

    const url = `${LMS_API_BASE}/api/user/update/trainingprocess?userId=${userId}&trainingId=${trainingId}&moduleId=${moduleId}&videoId=${videoId}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getApiHeaders()
    });

    if (!response.ok) {
      let errorMessage = `Failed to update training progress: ${response.status} - ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          console.error('❌ LMS API Error Response:', errorBody);
          errorMessage += `\nResponse: ${errorBody}`;
        }
      } catch (e) {
        console.error('❌ Could not read error response body:', e);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Training progress updated in LMS:', result);
    
    // Check if training was completed
    if (result.data?.trainingProgress) {
      const trainingProgress = result.data.trainingProgress;
      console.log(`🎯 Training Status: ${trainingProgress.status}`);
      console.log(`🎯 Training Pass: ${trainingProgress.pass}`);
      
      if (trainingProgress.pass && trainingProgress.status === 'Completed') {
        console.log('🎉 TRAINING COMPLETED! User has finished the entire training.');
      }
    }
    
    return {
      success: true,
      data: result.data,
      trainingProgress: result.data?.trainingProgress || null,
      message: 'Video marked as completed successfully'
    };
  } catch (error) {
    console.error('❌ Error updating training progress:', error);
    throw error;
  }
};

/**
 * Calculate completion percentages from LMS data
 * Based on your system's logic: (moduleCompletionPercentage + videoCompletionPercentage) / 2
 */
export const calculateCompletionPercentages = (trainingData) => {
  try {
    if (!trainingData || !trainingData.trainingId || !trainingData.trainingId.modules) {
      return {
        overallCompletion: 0,
        moduleCompletion: 0,
        videoCompletion: 0,
        totalModules: 0,
        completedModules: 0,
        totalVideos: 0,
        completedVideos: 0
      };
    }

    const modules = trainingData.trainingId.modules;
    const progressModules = trainingData.modules || [];
    
    let totalModules = modules.length;
    let completedModules = 0;
    let totalVideos = 0;
    let completedVideos = 0;

    // Calculate module and video completion
    modules.forEach(module => {
      if (module.videos && module.videos.length > 0) {
        totalVideos += module.videos.length;
        
        // Find corresponding progress module
        const progressModule = progressModules.find(pm => pm.moduleId === module._id);
        
        if (progressModule) {
          if (progressModule.pass) {
            completedModules++;
          }
          
          // Count completed videos in this module
          if (progressModule.videos) {
            const moduleCompletedVideos = progressModule.videos.filter(v => v.pass).length;
            completedVideos += moduleCompletedVideos;
          }
        }
      }
    });

    // Calculate percentages using your system's logic
    const moduleCompletion = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    const videoCompletion = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
    const overallCompletion = Math.round((moduleCompletion + videoCompletion) / 2);

    return {
      overallCompletion,
      moduleCompletion,
      videoCompletion,
      totalModules,
      completedModules,
      totalVideos,
      completedVideos
    };
  } catch (error) {
    console.error('❌ Error calculating completion percentages:', error);
    return {
      overallCompletion: 0,
      moduleCompletion: 0,
      videoCompletion: 0,
      totalModules: 0,
      completedModules: 0,
      totalVideos: 0,
      completedVideos: 0
    };
  }
};

/**
 * Enhanced video completion handler with your LMS API
 */
export const handleVideoCompletion = async (videoData) => {
  try {
    const { userId, trainingId, moduleId, videoId, currentTime, duration } = videoData;
    
    console.log('🎬 Handling video completion with LMS API:', {
      userId,
      trainingId,
      moduleId,
      videoId,
      watchPercentage: ((currentTime / duration) * 100).toFixed(1)
    });

    // Only mark as completed if 90% or more watched
    const watchPercentage = (currentTime / duration) * 100;
    
    if (watchPercentage >= 90) {
      console.log(`🎯 Video ${watchPercentage.toFixed(1)}% watched - marking as completed in LMS`);
      
      // Update progress in LMS using your API
      const result = await updateTrainingProgress(userId, trainingId, moduleId, videoId);
      
      // Get updated training progress
      const updatedProgress = await getTrainingProgress(userId, trainingId);
      const completionStats = calculateCompletionPercentages(updatedProgress.data);
      
      return {
        success: true,
        videoCompleted: true,
        lmsResponse: result,
        updatedProgress: completionStats,
        trainingStatus: updatedProgress.data?.trainingProgress?.status || 'In Progress',
        trainingCompleted: updatedProgress.data?.trainingProgress?.pass || false
      };
    } else {
      console.log(`⏸️ Video ${watchPercentage.toFixed(1)}% watched - not marking as completed yet`);
      
      return {
        success: true,
        videoCompleted: false,
        watchPercentage: watchPercentage.toFixed(1),
        message: 'Video needs to be watched 90% to mark as complete'
      };
    }
  } catch (error) {
    console.error('❌ Error handling video completion:', error);
    throw error;
  }
};

/**
 * Get all users' training data for admin dashboard
 * This function aggregates data for admin oversight
 */
export const getAllUsersTrainingData = async () => {
  try {
    console.log('📊 Fetching all users training data for admin dashboard');
    
    // Note: Your LMS might need a specific admin endpoint for this
    // For now, we'll use the general endpoint and aggregate data
    
    // This would typically be an admin-specific endpoint like:
    // GET /api/admin/getAllUsersTraining or similar
    
    // Since we don't have that, we'll need to get this data differently
    // You might need to provide a list of user IDs to fetch data for
    
    console.log('⚠️ Admin endpoint needed: Consider adding an admin API endpoint to your LMS for bulk user data');
    
    return {
      success: true,
      message: 'Admin endpoint integration needed',
      data: []
    };
  } catch (error) {
    console.error('❌ Error fetching all users training data:', error);
    throw error;
  }
};

/**
 * Real-time progress tracker for video watching
 * Integrates with your LMS system
 */
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
      // Check if already completed by getting current progress
      const currentProgress = await getModuleProgress(userId, trainingId, moduleId);
      
      if (currentProgress.data && currentProgress.data.videos) {
        const videoProgress = currentProgress.data.videos.find(v => v.videoId === videoId);
        
        if (!videoProgress || !videoProgress.pass) {
          console.log('🎉 Video watch threshold reached - auto-completing with LMS API...');
          return await handleVideoCompletion(videoData);
        } else {
          console.log('✅ Video already marked as completed in LMS');
        }
      }
    }
    
    return {
      success: true,
      watchPercentage: watchPercentage.toFixed(1),
      autoCompleted: false,
      message: 'Progress tracked locally'
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
  getUserTrainings,
  getTrainingProgress,
  getModuleProgress,
  updateTrainingProgress,
  calculateCompletionPercentages,
  handleVideoCompletion,
  getAllUsersTrainingData,
  trackVideoProgress
};
