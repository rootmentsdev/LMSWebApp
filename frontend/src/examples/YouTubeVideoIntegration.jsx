// Example: How to integrate training progress with YouTube videos
// This handles the YouTube video completion tracking for your LMS

import React, { useState, useRef, useEffect } from 'react';
import { markVideoCompleted } from '../services/trainingProgressService';

const YouTubeVideoWithProgressTracking = ({ 
  userId, 
  trainingId, 
  moduleId, 
  videoId,
  youtubeVideoId, // Extract from URL like "OIdHtUuL-_Q" from "https://youtu.be/OIdHtUuL-_Q"
  onTrainingComplete 
}) => {
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const playerRef = useRef(null);

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Handle video completion
  const handleVideoComplete = async () => {
    if (videoCompleted || isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log('🎬 YouTube video finished - marking as completed...');
      
      const result = await markVideoCompleted(userId, trainingId, moduleId, videoId);
      
      setVideoCompleted(true);
      setShowSuccessMessage(true);
      
      // Check if entire training is now completed
      if (result.data?.trainingProgress?.pass) {
        console.log('🎉 Entire training completed!');
        if (onTrainingComplete) {
          onTrainingComplete(result.data.trainingProgress);
        }
      }
      
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('❌ Failed to mark video as completed:', error);
      alert('Failed to save progress. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // YouTube iframe API integration
  useEffect(() => {
    // Load YouTube IFrame API
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      const player = new window.YT.Player('youtube-player', {
        height: '400',
        width: '100%',
        videoId: youtubeVideoId,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
      playerRef.current = player;
    };

    const onPlayerReady = (event) => {
      console.log('YouTube player ready');
    };

    const onPlayerStateChange = (event) => {
      if (event.data === window.YT.PlayerState.ENDED) {
        console.log('YouTube video ended');
        handleVideoComplete();
      }
    };

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [youtubeVideoId]);

  // Track video progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        
        if (duration > 0) {
          const percentage = (currentTime / duration) * 100;
          setWatchedPercentage(Math.round(percentage));
          
          // Auto-complete at 90%
          if (percentage >= 90 && !videoCompleted && !isLoading) {
            console.log('📊 90% watched - auto-completing YouTube video...');
            handleVideoComplete();
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [videoCompleted, isLoading]);

  return (
    <div className="youtube-video-container">
      {/* YouTube Player */}
      <div className="video-wrapper">
        <div id="youtube-player"></div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="progress">
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: `${watchedPercentage}%` }}
            aria-valuenow={watchedPercentage} 
            aria-valuemin="0" 
            aria-valuemax="100"
          >
            {watchedPercentage}%
          </div>
        </div>
        <small className="text-muted">Watch 90% to complete</small>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="alert alert-success mt-3">
          <strong>✅ Video Completed!</strong> Your training progress has been updated in the LMS.
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Updating LMS...</span>
          </div>
          <p>Updating your training progress...</p>
        </div>
      )}

      {/* Completion Status */}
      {videoCompleted && (
        <div className="mt-3">
          <span className="badge bg-success">
            ✅ Video Completed - Progress Saved to LMS
          </span>
        </div>
      )}

      {/* Manual Complete Button (backup) */}
      {!videoCompleted && watchedPercentage >= 90 && (
        <div className="mt-3">
          <button 
            className="btn btn-success"
            onClick={handleVideoComplete}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Mark as Completed'}
          </button>
        </div>
      )}
    </div>
  );
};

export default YouTubeVideoWithProgressTracking;
