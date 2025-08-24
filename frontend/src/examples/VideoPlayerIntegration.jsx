// Example: How to integrate training progress tracking into your video player
// This shows how to mark videos as completed when users finish watching

import React, { useState, useEffect } from 'react';
import { markVideoCompleted, trackVideoProgress } from '../services/trainingProgressService';

const VideoPlayerWithProgressTracking = ({ 
  userId, 
  trainingId, 
  moduleId, 
  videoId, 
  videoUrl,
  onTrainingComplete 
}) => {
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle video completion (when user finishes watching)
  const handleVideoComplete = async () => {
    if (videoCompleted || isLoading) return; // Prevent duplicate calls
    
    setIsLoading(true);
    
    try {
      console.log('🎬 Video finished - marking as completed...');
      
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
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('❌ Failed to mark video as completed:', error);
      alert('Failed to save progress. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video progress tracking (optional - for real-time updates)
  const handleVideoProgress = async (currentTime, duration) => {
    try {
      const watchPercentage = (currentTime / duration) * 100;
      
      // Auto-complete at 90% watched
      if (watchPercentage >= 90 && !videoCompleted && !isLoading) {
        console.log('📊 90% watched - auto-completing video...');
        await handleVideoComplete();
      }
    } catch (error) {
      console.error('❌ Progress tracking failed:', error);
    }
  };

  return (
    <div className="video-player-container">
      {/* Video Player */}
      <div className="video-wrapper">
        <video
          width="100%"
          height="400"
          controls
          onEnded={handleVideoComplete}
          onTimeUpdate={(e) => {
            const video = e.target;
            if (video.duration) {
              handleVideoProgress(video.currentTime, video.duration);
            }
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          {/* For YouTube videos, you'd use an iframe or react-youtube component */}
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="alert alert-success mt-3">
          <strong>✅ Video Completed!</strong> Your progress has been saved.
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center mt-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Saving progress...</span>
          </div>
          <p>Saving your progress...</p>
        </div>
      )}

      {/* Completion Status */}
      {videoCompleted && (
        <div className="mt-3">
          <span className="badge bg-success">
            ✅ Completed
          </span>
        </div>
      )}
    </div>
  );
};

export default VideoPlayerWithProgressTracking;
