/**
 * LMS Progress Integration Script
 * This script provides easy integration for external websites to track video progress
 * and sync it with the main LMS system.
 *
 * Usage:
 * 1. Include this script in your external website
 * 2. Initialize with user and training details
 * 3. Call trackProgress() when video events occur
 */

class LMSProgressTracker {
  constructor(config) {
    this.config = {
      apiUrl: config.apiUrl || 'http://localhost:7000/api',
      userId: config.userId,
      trainingId: config.trainingId,
      moduleId: config.moduleId,
      autoTrack: config.autoTrack !== false,
      updateInterval: config.updateInterval || 5000, // 5 seconds
      ...config
    };

    this.currentVideo = null;
    this.isTracking = false;
    this.lastUpdate = 0;
    this.progressCache = {};

    if (this.config.autoTrack) {
      this.initializeAutoTracking();
    }
  }

  /**
   * Initialize automatic progress tracking for video elements
   */
  initializeAutoTracking() {
    // Track all video elements on the page
    const videos = document.querySelectorAll('video');

    videos.forEach(video => {
      this.attachVideoListeners(video);
    });

    // Also watch for dynamically added videos
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'VIDEO') {
            this.attachVideoListeners(node);
          } else if (node.querySelectorAll) {
            node.querySelectorAll('video').forEach(video => {
              this.attachVideoListeners(video);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Attach event listeners to a video element
   */
  attachVideoListeners(video) {
    if (video.hasAttribute('data-lms-tracked')) return;

    video.setAttribute('data-lms-tracked', 'true');

    // Extract video ID from various sources
    const videoId = video.getAttribute('data-video-id') ||
                   video.getAttribute('data-id') ||
                   video.src.split('/').pop().split('.')[0] ||
                   `video_${Date.now()}`;

    video.addEventListener('play', () => {
      this.currentVideo = { element: video, id: videoId };
      this.trackProgress('started', video.currentTime, video.duration);
    });

    video.addEventListener('pause', () => {
      this.trackProgress('paused', video.currentTime, video.duration);
    });

    video.addEventListener('ended', () => {
      this.trackProgress('completed', video.duration, video.duration);
    });

    video.addEventListener('timeupdate', () => {
      // Throttle updates to avoid too many API calls
      const now = Date.now();
      if (now - this.lastUpdate > this.config.updateInterval) {
        this.trackProgress('playing', video.currentTime, video.duration);
        this.lastUpdate = now;
      }
    });
  }

  /**
   * Track video progress manually
   */
  async trackProgress(action, currentTime, duration, videoId = null) {
    const videoToTrack = videoId || (this.currentVideo ? this.currentVideo.id : null);

    if (!videoToTrack) {
      console.warn('LMS Progress Tracker: No video ID available');
      return;
    }

    const progressData = {
      userId: this.config.userId,
      trainingId: this.config.trainingId,
      moduleId: this.config.moduleId,
      videoId: videoToTrack,
      action: action,
      timestamp: new Date().toISOString(),
      progress: duration > 0 ? (currentTime / duration) * 100 : 0,
      duration: duration,
      currentTime: currentTime
    };

    // Check cache to avoid duplicate requests
    const cacheKey = `${action}-${Math.floor(currentTime)}-${videoToTrack}`;
    if (this.progressCache[cacheKey]) {
      return; // Skip duplicate
    }
    this.progressCache[cacheKey] = true;

    // Clean old cache entries
    setTimeout(() => {
      delete this.progressCache[cacheKey];
    }, 10000);

    try {
      const response = await fetch(`${this.config.apiUrl}/training/update-video-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData)
      });

      const data = await response.json();

      if (data.success) {
        console.log('LMS Progress Updated:', data.data);
        this.emit('progressUpdated', data.data);
      } else {
        console.error('LMS Progress Update Failed:', data.message);
        this.emit('progressError', data.message);
      }
    } catch (error) {
      console.error('LMS Progress Update Error:', error);
      this.emit('progressError', error.message);
    }
  }

  /**
   * Get current progress for user
   */
  async getProgress() {
    try {
      const response = await fetch(`${this.config.apiUrl}/training/user-progress/${this.config.userId}`);
      const data = await response.json();

      if (data.success) {
        this.emit('progressFetched', data.data);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('LMS Progress Fetch Error:', error);
      this.emit('progressError', error.message);
      throw error;
    }
  }

  /**
   * Sync external website progress
   */
  async syncExternalProgress(externalData) {
    try {
      const response = await fetch(`${this.config.apiUrl}/training/sync-external-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.config.userId,
          externalWebsiteData: externalData
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('LMS External Progress Synced:', data.data);
        this.emit('externalSynced', data.data);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('LMS External Sync Error:', error);
      this.emit('progressError', error.message);
      throw error;
    }
  }

  /**
   * Event system for external integrations
   */
  on(event, callback) {
    if (!this.listeners) this.listeners = {};
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Global initialization function for easy integration
window.initializeLMSProgressTracker = function(config) {
  return new LMSProgressTracker(config);
};

// Auto-initialize if configuration is provided via data attributes
document.addEventListener('DOMContentLoaded', function() {
  const script = document.querySelector('script[data-lms-user-id]');
  if (script) {
    const config = {
      userId: script.getAttribute('data-lms-user-id'),
      trainingId: script.getAttribute('data-lms-training-id'),
      moduleId: script.getAttribute('data-lms-module-id'),
      apiUrl: script.getAttribute('data-lms-api-url') || 'http://localhost:7000/api'
    };

    window.lmsTracker = new LMSProgressTracker(config);
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LMSProgressTracker;
}
