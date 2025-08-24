// Real-Time Progress Tracker for LMS Integration
// This service tracks video watching progress and updates LMS database in real-time

import { config, getApiHeaders } from '../config';

export class RealTimeProgressTracker {
  constructor(userId, trainingId, trainingName) {
    this.userId = userId;
    this.trainingId = trainingId;
    this.trainingName = trainingName;
    this.progressId = null;
    this.currentStatus = 'Pending';
    this.lastUpdate = null;
    this.updateInterval = null;
    this.currentVideoId = null;
    this.isTracking = false;
    
    console.log('🎯 RealTimeProgressTracker initialized', {
      userId,
      trainingId,
      trainingName
    });
  }

  // Start tracking when user opens training
  async startTracking() {
    if (this.isTracking) {
      console.log('⚠️ Tracking already started');
      return;
    }

    console.log('🚀 Starting real-time progress tracking...');
    
    try {
      // Create or get progress record
      const response = await this.createOrGetProgressRecord();
      this.progressId = response.progressId;
      this.isTracking = true;
      
      // Update status to "In Progress" when training starts
      await this.updateStatus('In Progress', {
        action: 'training_started'
      });
      
      console.log('✅ Progress tracking started successfully', {
        progressId: this.progressId
      });
    } catch (error) {
      console.error('❌ Failed to start tracking:', error);
    }
  }

  // Update status when video events occur
  async updateStatus(newStatus, additionalData = {}) {
    if (!this.isTracking) {
      console.log('⚠️ Tracking not started, skipping status update');
      return;
    }

    if (this.currentStatus === newStatus && !additionalData.force) {
      console.log(`⚠️ Status already ${newStatus}, skipping update`);
      return;
    }
    
    this.currentStatus = newStatus;
    this.lastUpdate = new Date().toISOString();

    const updateData = {
      userId: this.userId,
      trainingId: this.trainingId,
      progressId: this.progressId,
      status: newStatus,
      timestamp: this.lastUpdate,
      ...additionalData
    };

    console.log('📊 Updating status:', updateData);

    try {
        // Use the real LMS API endpoint for updating training process
  const endpoints = [
    config.ENDPOINTS.UPDATE_TRAINING_PROCESS,
    '/api/user/update/trainingprocess' // Fallback
  ];

  let success = false;
  for (const endpoint of endpoints) {
    try {
      // Your LMS uses GET method with query parameters for updates
      const queryParams = new URLSearchParams({
        userId: this.userId,
        trainingId: this.trainingId,
        status: newStatus,
        action: additionalData.action || 'status_update',
        timestamp: this.lastUpdate,
        // Add more fields that your LMS expects
        moduleId: additionalData.moduleId || '',
        videoId: additionalData.videoId || '',
        progress: additionalData.progress || 0
      });
      
      const response = await fetch(`${config.API_BASE_URL}${endpoint}?${queryParams}`, {
        method: 'PATCH',
        headers: getApiHeaders(),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Status updated to: ${newStatus} via ${endpoint}`, result);
        success = true;
        break;
      } else {
        console.log(`❌ Status update failed via ${endpoint}:`, response.status);
        console.log('Response:', await response.text());
      }
    } catch (endpointError) {
      console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message);
    }
  }

      if (!success) {
        console.error('❌ All status update endpoints failed');
      }
    } catch (error) {
      console.error('❌ Status update error:', error);
    }
  }

  // Track video watching progress in real-time
  async trackVideoProgress(videoId, currentTime, duration) {
    if (!this.isTracking || !this.progressId) {
      return;
    }

    this.currentVideoId = videoId;
    const percentageWatched = Math.round((currentTime / duration) * 100);
    
    const progressData = {
      userId: this.userId,
      trainingId: this.trainingId,
      currentModule: {
        videoId: videoId,
        moduleId: this.moduleId || 'default', // Use stored module ID
        watchTime: Math.round(currentTime),
        totalDuration: Math.round(duration),
        percentageWatched: percentageWatched
      },
      lastActivity: new Date().toISOString()
    };

    // Only log every 10% to avoid spam
    if (percentageWatched % 10 === 0) {
      console.log('📈 Video progress:', {
        videoId,
        percentageWatched,
        currentTime: Math.round(currentTime),
        duration: Math.round(duration)
      });
    }

    try {
      // Use the real LMS API endpoint for updating training process
      const endpoints = [
        config.ENDPOINTS.UPDATE_TRAINING_PROCESS,
        '/api/user/update/trainingprocess' // Fallback
      ];

      for (const endpoint of endpoints) {
        try {
          // Your LMS uses GET method with query parameters for progress updates
          const queryParams = new URLSearchParams({
            userId: this.userId,
            trainingId: this.trainingId,
            videoId: progressData.currentModule.videoId,
            moduleId: progressData.currentModule.moduleId || 'default',
            watchTime: progressData.currentModule.watchTime,
            totalDuration: progressData.currentModule.totalDuration,
            percentageWatched: progressData.currentModule.percentageWatched,
            action: 'video_progress',
            // Add status and progress for better tracking
            status: progressData.currentModule.percentageWatched >= 90 ? 'completed' : 'in_progress',
            progress: progressData.currentModule.percentageWatched
          });
          
          const response = await fetch(`${config.API_BASE_URL}${endpoint}?${queryParams}`, {
            method: 'PATCH',
            headers: getApiHeaders(),
            credentials: 'include'
          });

          if (response.ok) {
            console.log(`✅ Video progress updated via ${endpoint}`);
            // Success, break the loop
            break;
          } else {
            console.log(`❌ Video progress update failed via ${endpoint}:`, response.status);
          }
        } catch (endpointError) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message);
          // Try next endpoint
          continue;
        }
      }
    } catch (error) {
      console.error('❌ Progress update error:', error);
    }
  }

  // Create initial progress record or get existing one
  async createOrGetProgressRecord() {
    console.log('📝 Creating/getting progress record...');

    const recordData = {
      userId: this.userId,
      trainingId: this.trainingId,
      trainingName: this.trainingName,
      status: 'Pending',
      pass: false,
      deadline: null,
      modules: [],
      lastActivity: new Date().toISOString()
    };

    try {
      // Use the real LMS API endpoints for getting training data
      const getEndpoints = [
        config.ENDPOINTS.GET_USER_TRAINING_PROCESS,
        config.ENDPOINTS.GET_ALL_USER_TRAINING,
        '/api/user/trainingprocess' // Fallback
      ];

      // First, try to get existing record
      for (const endpoint of getEndpoints) {
        try {
          const response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getApiHeaders()
          });

          if (response.ok) {
            const result = await response.json();
            if (result.data && result.data._id) {
              console.log('✅ Found existing progress record:', result.data._id);
              return { progressId: result.data._id };
            }
          }
        } catch (error) {
          continue;
        }
      }

      // For your LMS system, we'll use a local progress ID since creation is handled by the system
      console.log('ℹ️ Using local progress tracking for LMS integration');
      return { progressId: `lms_${this.userId}_${this.trainingId}_${Date.now()}` };

      throw new Error('All create/get endpoints failed');
    } catch (error) {
      console.error('❌ Failed to create/get progress record:', error);
      // Return a fallback ID for local tracking
      return { progressId: `local_${Date.now()}` };
    }
  }

  // Handle video start event
  async onVideoStart(videoId) {
    console.log('▶️ Video started:', videoId);
    this.currentVideoId = videoId;
    
    await this.updateStatus('In Progress', {
      action: 'video_started',
      videoId: videoId
    });
  }

  // Handle video pause event
  async onVideoPause(videoId, currentTime, duration) {
    console.log('⏸️ Video paused:', videoId, `at ${Math.round(currentTime)}s`);
    
    await this.updateStatus('In Progress', {
      action: 'video_paused',
      videoId: videoId,
      pausedAt: Math.round(currentTime)
    });
  }

  // Handle video resume event
  async onVideoResume(videoId, currentTime) {
    console.log('▶️ Video resumed:', videoId, `from ${Math.round(currentTime)}s`);
    
    await this.updateStatus('In Progress', {
      action: 'video_resumed',
      videoId: videoId,
      resumedAt: Math.round(currentTime)
    });
  }

  // Handle video completion event
  async onVideoComplete(videoId, duration) {
    console.log('✅ Video completed:', videoId);
    
    // Track final progress
    await this.trackVideoProgress(videoId, duration, duration);
    
    // Update status to completed
    await this.updateStatus('Completed', {
      action: 'video_completed',
      videoId: videoId,
      completedAt: new Date().toISOString()
    });
  }

  // Handle training completion
  async onTrainingComplete() {
    console.log('🎉 Training completed!');
    
    await this.updateStatus('Completed', {
      action: 'training_completed',
      pass: true,
      completedAt: new Date().toISOString(),
      force: true
    });
  }

  // Start periodic progress updates during video watching
  startPeriodicUpdates(videoElement, videoId) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      if (videoElement && videoElement.duration && !videoElement.paused) {
        this.trackVideoProgress(videoId, videoElement.currentTime, videoElement.duration);
      }
    }, 5000); // Update every 5 seconds

    console.log('⏰ Started periodic progress updates');
  }

  // Stop periodic updates
  stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('⏰ Stopped periodic progress updates');
    }
  }

  // Stop tracking (when user leaves or completes)
  async stopTracking(finalStatus = null) {
    if (!this.isTracking) {
      return;
    }

    this.stopPeriodicUpdates();
    
    if (finalStatus && finalStatus !== this.currentStatus) {
      await this.updateStatus(finalStatus, {
        action: 'tracking_stopped',
        stoppedAt: new Date().toISOString()
      });
    }
    
    this.isTracking = false;
    console.log('🛑 Progress tracking stopped');
  }

  // Get current tracking status
  getStatus() {
    return {
      isTracking: this.isTracking,
      currentStatus: this.currentStatus,
      progressId: this.progressId,
      currentVideoId: this.currentVideoId,
      lastUpdate: this.lastUpdate
    };
  }
}

// Export default instance creator
export const createProgressTracker = (userId, trainingId, trainingName) => {
  return new RealTimeProgressTracker(userId, trainingId, trainingName);
};

export default RealTimeProgressTracker;
