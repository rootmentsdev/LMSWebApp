import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { 
  handleVideoCompletion, 
  trackVideoProgress,
  updateTrainingProgress 
} from '../services/lmsTrainingBridge';
import { broadcastProgressUpdate } from '../services/adminProgressBridge';

const EnhancedVideoPlayer = ({ 
  videoUrl, 
  title, 
  userId, 
  trainingId, 
  moduleId, 
  videoId,
  onProgress,
  onComplete 
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [watchPercentage, setWatchPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);

  // Progress tracking intervals
  const progressIntervalRef = useRef(null);
  const PROGRESS_UPDATE_INTERVAL = 5000; // Update every 5 seconds
  const COMPLETION_THRESHOLD = 90; // Mark complete at 90%

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      console.log(`📹 Video loaded: ${title} (Duration: ${video.duration}s)`);
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration;
      
      setCurrentTime(current);
      
      if (total > 0) {
        const progressPercent = (current / total) * 100;
        const watchPercent = Math.round(progressPercent);
        
        setProgress(progressPercent);
        setWatchPercentage(watchPercent);
        
        // Call parent progress callback
        if (onProgress) {
          onProgress({
            currentTime: current,
            duration: total,
            progress: progressPercent,
            watchPercentage: watchPercent
          });
        }
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      startProgressTracking();
    };

    const handlePause = () => {
      setIsPlaying(false);
      stopProgressTracking();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      stopProgressTracking();
      handleVideoComplete();
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      stopProgressTracking();
    };
  }, [videoUrl, title]);

  // Start interval-based progress tracking
  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        trackLMSVideoProgress();
      }
    }, PROGRESS_UPDATE_INTERVAL);
  };

  // Stop progress tracking
  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Track video progress in real-time using LMS API
  const trackLMSVideoProgress = async () => {
    if (!videoRef.current || !userId || !trainingId) return;

    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    
    // Only update if significant progress made
    if (Math.abs(current - lastProgressUpdate) < 10) return; // 10 seconds threshold
    
    try {
      const videoData = {
        userId,
        trainingId,
        moduleId,
        videoId,
        currentTime: current,
        duration: total
      };

      console.log('📊 Tracking video progress with LMS API:', {
        userId,
        trainingId,
        moduleId,
        videoId,
        watchPercentage: ((current / total) * 100).toFixed(1)
      });

      // Use your LMS API for progress tracking
      const result = await trackVideoProgress(videoData);
      
      // Broadcast progress update for admin dashboard
      broadcastProgressUpdate({
        userId,
        trainingId,
        moduleId,
        videoId,
        currentTime: current,
        duration: total,
        watchPercentage: result.watchPercentage,
        isPlaying: isPlaying,
        lmsTracked: true
      });

      setLastProgressUpdate(current);
      
      // Check if video was auto-completed by LMS
      if (result.videoCompleted && !isCompleted) {
        setIsCompleted(true);
        setSuccess('🎉 Video completed successfully! Progress updated in LMS system.');
        
        if (onComplete) {
          onComplete(result);
        }
      }

    } catch (error) {
      console.error('❌ Error tracking video progress with LMS:', error);
      setError(`LMS progress tracking error: ${error.message}`);
    }
  };

  // Handle manual video completion
  const handleVideoComplete = async () => {
    if (isCompleted || !userId || !trainingId) return;

    setLoading(true);
    setError('');

    try {
      const videoData = {
        userId,
        trainingId,
        moduleId,
        videoId,
        currentTime: videoRef.current?.currentTime || duration,
        duration: duration
      };

      const result = await handleVideoCompletion(videoData);
      
      if (result.success) {
        setIsCompleted(true);
        setSuccess('🎉 Video completed and progress saved to both systems!');
        
        // Broadcast completion
        broadcastProgressUpdate({
          ...videoData,
          completed: true,
          completionResult: result
        });

        if (onComplete) {
          onComplete(result);
        }
      }
    } catch (error) {
      console.error('❌ Error completing video:', error);
      setError(`Failed to mark video as complete: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Manual completion button handler
  const handleManualComplete = () => {
    if (watchPercentage >= COMPLETION_THRESHOLD) {
      handleVideoComplete();
    } else {
      setError(`You need to watch at least ${COMPLETION_THRESHOLD}% of the video to mark it as complete.`);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress color based on completion status
  const getProgressVariant = () => {
    if (isCompleted) return 'success';
    if (watchPercentage >= COMPLETION_THRESHOLD) return 'warning';
    return 'primary';
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">{title}</h6>
          <div className="d-flex align-items-center gap-2">
            <Badge bg={isCompleted ? 'success' : 'secondary'}>
              {isCompleted ? 'Completed' : 'In Progress'}
            </Badge>
            {watchPercentage >= COMPLETION_THRESHOLD && !isCompleted && (
              <Badge bg="warning">Ready to Complete</Badge>
            )}
          </div>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {/* Error/Success Alerts */}
        {error && (
          <Alert variant="danger" className="m-3 mb-0" onClose={() => setError('')} dismissible>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="m-3 mb-0" onClose={() => setSuccess('')} dismissible>
            <i className="fas fa-check-circle me-2"></i>
            {success}
          </Alert>
        )}

        {/* Video Player */}
        <div className="position-relative">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            width="100%"
            height="400"
            className="w-100"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          >
            Your browser does not support the video tag.
          </video>

          {/* Progress Overlay */}
          {isPlaying && (
            <div 
              className="position-absolute top-0 end-0 m-2 px-2 py-1 rounded"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.8rem' }}
            >
              <i className="fas fa-eye me-1"></i>
              {watchPercentage}% watched
            </div>
          )}
        </div>

        {/* Progress Information */}
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">
              {formatTime(currentTime)} / {formatTime(duration)}
            </small>
            <small className="text-muted">
              {watchPercentage}% completed
            </small>
          </div>

          <ProgressBar 
            now={progress} 
            variant={getProgressVariant()}
            className="mb-3"
            style={{ height: '8px' }}
          />

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            {!isCompleted && watchPercentage >= COMPLETION_THRESHOLD && (
              <Button
                variant="success"
                size="sm"
                onClick={handleManualComplete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Completing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    Mark as Complete
                  </>
                )}
              </Button>
            )}

            {isCompleted && (
              <Button variant="outline-success" size="sm" disabled>
                <i className="fas fa-check-circle me-2"></i>
                Completed
              </Button>
            )}

            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => trackLMSVideoProgress()}
              disabled={loading}
            >
              <i className="fas fa-sync me-2"></i>
              Sync with LMS
            </Button>
          </div>

          {/* Progress Details */}
          <div className="mt-3 p-2 bg-light rounded">
            <small className="text-muted d-block">
              <i className="fas fa-info-circle me-1"></i>
              Progress is automatically synced with the admin dashboard every 5 seconds while playing.
            </small>
            {lastProgressUpdate > 0 && (
              <small className="text-muted d-block mt-1">
                Last synced: {formatTime(lastProgressUpdate)}
              </small>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EnhancedVideoPlayer;
