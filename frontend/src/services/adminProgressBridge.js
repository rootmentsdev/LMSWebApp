// Admin Progress Bridge Service
// This service bridges the admin dashboard with external LMS for real-time progress tracking

import { config, getApiHeaders } from '../config';
import { markVideoCompleted, getTrainingProgress } from './trainingProgressService';

// Enhanced progress tracking that updates both local and external systems
export const trackProgressForAdmin = async (videoData) => {
  try {
    const { userId, trainingId, moduleId, videoId, currentTime, duration } = videoData;
    
    console.log('🔄 Admin Progress Bridge: Tracking video progress for admin oversight:', {
      userId,
      trainingId,
      moduleId,
      videoId,
      progressPercentage: ((currentTime / duration) * 100).toFixed(1)
    });

    // Calculate watch percentage
    const watchPercentage = (currentTime / duration) * 100;

    // 1. Update local backend for admin dashboard
    const localUpdatePromise = updateLocalTrainingProgress(userId, trainingId, Math.round(watchPercentage));

    // 2. Update external LMS if significant progress threshold reached
    let externalUpdatePromise = Promise.resolve({ success: true, source: 'no_external_update' });
    
    if (watchPercentage >= 90) {
      console.log('🎯 90% threshold reached - updating external LMS');
      externalUpdatePromise = markVideoCompleted(userId, trainingId, moduleId, videoId, watchPercentage);
    }

    // Execute both updates in parallel
    const [localResult, externalResult] = await Promise.all([
      localUpdatePromise,
      externalUpdatePromise
    ]);

    console.log('✅ Admin Progress Bridge: Both systems updated successfully');

    return {
      success: true,
      watchPercentage: watchPercentage.toFixed(1),
      localUpdate: localResult,
      externalUpdate: externalResult,
      videoCompleted: watchPercentage >= 90
    };

  } catch (error) {
    console.error('❌ Admin Progress Bridge Error:', error);
    
    // Try to update at least one system if the other fails
    try {
      const { userId, trainingId, currentTime, duration } = videoData;
      const watchPercentage = (currentTime / duration) * 100;
      
      const fallbackResult = await updateLocalTrainingProgress(userId, trainingId, Math.round(watchPercentage));
      console.log('⚠️ Fallback: Local system updated despite bridge error');
      
      return {
        success: true,
        watchPercentage: watchPercentage.toFixed(1),
        localUpdate: fallbackResult,
        externalUpdate: { error: error.message },
        warning: 'External LMS update failed, but local progress saved'
      };
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      throw new Error(`Progress bridge failed: ${error.message}`);
    }
  }
};

// Update local backend training progress
export const updateLocalTrainingProgress = async (userId, trainingId, progressPercentage) => {
  try {
    const response = await fetch(`http://localhost:5000/api/trainings/user/${userId}/training/${trainingId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ progress: progressPercentage })
    });

    if (!response.ok) {
      throw new Error(`Local update failed: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📊 Local training progress updated:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error updating local training progress:', error);
    throw error;
  }
};

// Get comprehensive progress data for admin dashboard
export const getComprehensiveProgress = async (userId, trainingId) => {
  try {
    console.log('📋 Fetching comprehensive progress data for admin dashboard');

    // Fetch from both local and external sources
    const [localProgress, externalProgress] = await Promise.allSettled([
      getLocalUserProgress(userId),
      getTrainingProgress(userId, trainingId)
    ]);

    const result = {
      userId,
      trainingId,
      timestamp: new Date().toISOString()
    };

    // Process local progress
    if (localProgress.status === 'fulfilled') {
      result.localProgress = localProgress.value;
      console.log('✅ Local progress data retrieved');
    } else {
      result.localProgress = { error: localProgress.reason?.message };
      console.warn('⚠️ Local progress fetch failed:', localProgress.reason);
    }

    // Process external progress
    if (externalProgress.status === 'fulfilled') {
      result.externalProgress = externalProgress.value;
      console.log('✅ External LMS progress data retrieved');
    } else {
      result.externalProgress = { error: externalProgress.reason?.message };
      console.warn('⚠️ External LMS progress fetch failed:', externalProgress.reason);
    }

    return result;
  } catch (error) {
    console.error('❌ Error getting comprehensive progress:', error);
    throw error;
  }
};

// Get local user progress from backend
export const getLocalUserProgress = async (userId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/trainings/users/${userId}/progress`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch local user progress: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error fetching local user progress:', error);
    throw error;
  }
};

// Sync progress between local and external systems (admin utility)
export const syncProgressSystems = async (userId, trainingId) => {
  try {
    console.log('🔄 Starting progress sync between systems');

    // Get data from both systems
    const comprehensiveData = await getComprehensiveProgress(userId, trainingId);

    const syncResult = {
      userId,
      trainingId,
      syncTimestamp: new Date().toISOString(),
      conflicts: [],
      resolutions: []
    };

    // Compare and resolve conflicts
    if (comprehensiveData.localProgress?.data && comprehensiveData.externalProgress?.data) {
      const localData = comprehensiveData.localProgress.data;
      const externalData = comprehensiveData.externalProgress.data;

      // Check for progress discrepancies
      if (localData.summary && externalData.trainingProgress) {
        const localCompletion = localData.summary.completionRate;
        const externalCompletion = calculateExternalCompletion(externalData);

        if (Math.abs(localCompletion - externalCompletion) > 10) {
          syncResult.conflicts.push({
            type: 'completion_rate_mismatch',
            local: localCompletion,
            external: externalCompletion,
            difference: Math.abs(localCompletion - externalCompletion)
          });
        }
      }
    }

    syncResult.comprehensiveData = comprehensiveData;
    console.log('✅ Progress sync completed');
    
    return syncResult;
  } catch (error) {
    console.error('❌ Error syncing progress systems:', error);
    throw error;
  }
};

// Calculate completion percentage from external LMS data
const calculateExternalCompletion = (externalData) => {
  try {
    if (externalData.trainingId && externalData.trainingId.modules) {
      const modules = externalData.trainingId.modules;
      let totalVideos = 0;
      let completedVideos = 0;

      modules.forEach(module => {
        if (module.videos) {
          totalVideos += module.videos.length;
          // Check completed videos in progress data
          if (externalData.modules) {
            const progressModule = externalData.modules.find(m => m.moduleId === module._id);
            if (progressModule && progressModule.videos) {
              completedVideos += progressModule.videos.filter(v => v.pass).length;
            }
          }
        }
      });

      return totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
    }
    return 0;
  } catch (error) {
    console.error('Error calculating external completion:', error);
    return 0;
  }
};

// Real-time progress broadcaster for admin dashboard
export const broadcastProgressUpdate = (progressData) => {
  try {
    // Create custom event for admin dashboard to listen to
    const event = new CustomEvent('training-progress-update', {
      detail: {
        ...progressData,
        timestamp: new Date().toISOString()
      }
    });

    // Dispatch to document for global listening
    document.dispatchEvent(event);
    
    console.log('📡 Progress update broadcasted for admin dashboard:', progressData);
  } catch (error) {
    console.error('❌ Error broadcasting progress update:', error);
  }
};

// Admin dashboard helper to get all users' progress
export const getAllUsersProgress = async () => {
  try {
    console.log('📊 Fetching progress for all users (admin view)');

    const [statsResponse, trainingsResponse] = await Promise.all([
      fetch('http://localhost:5000/api/trainings/stats', {
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch('http://localhost:5000/api/trainings/all', {
        headers: { 'Content-Type': 'application/json' }
      })
    ]);

    const stats = await statsResponse.json();
    const trainings = await trainingsResponse.json();

    return {
      statistics: stats.data,
      trainings: trainings.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error fetching all users progress:', error);
    throw error;
  }
};

// Export all functions
export default {
  trackProgressForAdmin,
  updateLocalTrainingProgress,
  getComprehensiveProgress,
  getLocalUserProgress,
  syncProgressSystems,
  broadcastProgressUpdate,
  getAllUsersProgress
};
