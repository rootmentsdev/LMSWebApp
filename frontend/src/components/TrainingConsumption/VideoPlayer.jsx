import React, { useEffect, useRef, useState, useCallback } from 'react';
import { updateVideoProgress } from '../../api/trainingApi';

const VideoPlayer = ({ 
  video, 
  moduleId, 
  trainingId, 
  userId, 
  onProgressUpdate,
  onVideoComplete 
}) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastProgressUpdate = useRef(0);
  const progressUpdateInterval = useRef(null);

  // Initialize video progress from props
  useEffect(() => {
    if (video.watchTime && video.videoDuration) {
      setCurrentTime(video.watchTime);
      setDuration(video.videoDuration);
      setProgress((video.watchTime / video.videoDuration) * 100);
    }
  }, [video]);

  // Update progress to server
  const updateProgress = useCallback(async (watchTime, totalDuration, completed = false) => {
    try {
      const response = await updateVideoProgress(
        userId,
        trainingId,
        moduleId,
        video.videoId,
        {
          watchTime: Math.floor(watchTime),
          totalDuration: Math.floor(totalDuration),
          completed
        }
      );

      if (response.status === 'success') {
        onProgressUpdate && onProgressUpdate(response.data);
        
        if (completed) {
          onVideoComplete && onVideoComplete(video.videoId);
        }
      }
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  }, [userId, trainingId, moduleId, video.videoId, onProgressUpdate, onVideoComplete]);

  // Handle video time updates
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      
      setCurrentTime(current);
      setDuration(total);
      
      const progressPercent = (current / total) * 100;
      setProgress(progressPercent);

      // Update progress every 10 seconds or when video ends
      if (current - lastProgressUpdate.current >= 10 || current >= total * 0.9) {
        lastProgressUpdate.current = current;
        updateProgress(current, total, current >= total * 0.9);
      }
    }
  }, [updateProgress]);

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const total = videoRef.current.duration;
      setDuration(total);
      
      // Resume from last watched position
      if (video.watchTime && video.watchTime > 0) {
        videoRef.current.currentTime = video.watchTime;
      }
    }
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video ended
  const handleVideoEnd = () => {
    setIsPlaying(false);
    updateProgress(duration, duration, true);
  };

  // Start progress tracking when video plays
  useEffect(() => {
    if (isPlaying) {
      progressUpdateInterval.current = setInterval(() => {
        handleTimeUpdate();
      }, 1000);
    } else {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    }

    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, [isPlaying, handleTimeUpdate]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-player-container bg-black rounded-lg overflow-hidden">
      <div className="relative">
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-auto"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleVideoEnd}
          controls={false}
        />
        
        {/* Custom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              <div className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {video.completed && (
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                  ✓ Completed
                </span>
              )}
              <span className="text-sm">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Info */}
      <div className="p-4 bg-gray-50">
        <h3 className="font-semibold text-lg mb-2">{video.videoTitle}</h3>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Duration: {formatTime(video.videoDuration || duration)}</span>
          <span>Last watched: {video.lastWatchedAt ? new Date(video.lastWatchedAt).toLocaleDateString() : 'Never'}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

