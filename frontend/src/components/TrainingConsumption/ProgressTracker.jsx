import React, { useState, useEffect } from 'react';
import './ProgressTracker.css';

const ProgressTracker = ({
  userId,
  trainingId,
  moduleId,
  videoId,
  onProgressUpdate,
  isExternalWebsite = false
}) => {
  const [progress, setProgress] = useState({
    overall: 0,
    module: 0,
    video: 0,
    status: 'Not Started',
    lastWatched: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch progress data
  const fetchProgress = async () => {
    try {
      setIsLoading(true);
      const baseUrl = isExternalWebsite
        ? 'http://localhost:7000/api'
        : process.env.REACT_APP_API_URL || 'http://localhost:7000/api';

      const endpoint = isExternalWebsite
        ? `/training/user-progress/${userId}`
        : `/get/progress?userId=${userId}`;

      const response = await fetch(`${baseUrl}${endpoint}`);
      const data = await response.json();

      if (data.success || data.status === 'success') {
        const userData = isExternalWebsite ? data.data : data;
        const training = userData.activeTrainings?.find(t => t.trainingId === trainingId) ||
                        userData.trainings?.find(t => t.id === trainingId);

        if (training) {
          const module = training.modules?.find(m => m.moduleId === moduleId);
          const video = module?.videos?.find(v => v.videoId === videoId);

          setProgress({
            overall: training.overallProgress || training.progress || 0,
            module: module?.progress || 0,
            video: video?.progress || 0,
            status: training.status || 'Not Started',
            lastWatched: video?.lastWatched || module?.lastWatched || null
          });
        }
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load progress');
    } finally {
      setIsLoading(false);
    }
  };

  // Update video progress (for external website integration)
  const updateVideoProgress = async (action, currentTime, duration) => {
    if (!isExternalWebsite) return;

    try {
      const baseUrl = 'http://localhost:7000/api';
      const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

      const response = await fetch(`${baseUrl}/training/update-video-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          trainingId,
          moduleId,
          videoId,
          action,
          timestamp: new Date().toISOString(),
          progress: progressPercentage,
          duration,
          currentTime
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local progress state
        setProgress(prev => ({
          ...prev,
          video: data.data.videoProgress.progress,
          module: parseFloat(data.data.moduleProgress.completionPercentage),
          overall: parseFloat(data.data.trainingProgress.overallCompletion),
          status: data.data.trainingProgress.status
        }));

        // Notify parent component
        if (onProgressUpdate) {
          onProgressUpdate(data.data);
        }

        // Refetch progress to ensure consistency
        setTimeout(fetchProgress, 1000);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to update progress');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProgress();

      // Set up real-time updates every 30 seconds
      const interval = setInterval(fetchProgress, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, trainingId, moduleId, videoId]);

  // Expose updateVideoProgress method for external website
  useEffect(() => {
    if (isExternalWebsite && window) {
      window.updateVideoProgress = updateVideoProgress;
    }
  }, [isExternalWebsite]);

  if (isLoading) {
    return (
      <div className="progress-tracker loading">
        <div className="progress-spinner"></div>
        <span>Loading progress...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-tracker error">
        <span className="error-message">{error}</span>
        <button onClick={fetchProgress} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h3>Training Progress</h3>
        <span className={`status ${progress.status.toLowerCase().replace(' ', '-')}`}>
          {progress.status}
        </span>
      </div>

      <div className="progress-bars">
        <div className="progress-item">
          <label>Overall Progress</label>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress.overall}%` }}
            ></div>
          </div>
          <span className="progress-text">{progress.overall.toFixed(1)}%</span>
        </div>

        {moduleId && (
          <div className="progress-item">
            <label>Module Progress</label>
            <div className="progress-bar">
              <div
                className="progress-fill module"
                style={{ width: `${progress.module}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress.module.toFixed(1)}%</span>
          </div>
        )}

        {videoId && (
          <div className="progress-item">
            <label>Video Progress</label>
            <div className="progress-bar">
              <div
                className="progress-fill video"
                style={{ width: `${progress.video}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress.video.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {progress.lastWatched && (
        <div className="last-watched">
          <small>
            Last watched: {new Date(progress.lastWatched).toLocaleString()}
          </small>
        </div>
      )}

      {isExternalWebsite && (
        <div className="external-website-notice">
          <small>Progress is automatically synced with your LMS</small>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
