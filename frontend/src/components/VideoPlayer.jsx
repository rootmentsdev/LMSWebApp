import React, { useState, useEffect, useRef } from 'react';
import './VideoComponents.css';
import { 
  Modal, 
  Button, 
  Alert, 
  ProgressBar, 
  Badge,
  Row,
  Col,
  Card
} from 'react-bootstrap';
import { 
  PlayFill, 
  PauseFill, 
  VolumeUp, 
  VolumeMute, 
  Fullscreen,
  SkipBackward,
  SkipForward,
  Clock,
  Eye
} from 'react-bootstrap-icons';
import { config } from '../config';
import { createProgressTracker } from '../services/realTimeProgressTracker';
import { markVideoCompleted, trackVideoProgress } from '../services/trainingProgressService';

const VideoPlayer = ({ show, onHide, video, onVideoComplete }) => {
  const [videoError, setVideoError] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoType, setVideoType] = useState('unknown');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef(null);
  const progressInterval = useRef(null);
  const progressTracker = useRef(null);

  useEffect(() => {
    console.log('🎬 VideoPlayer received video data:', video);
    if (video && video.videoUri) {
      console.log('✅ Video has URI:', video.videoUri);
      setVideoError(false);
      setLoading(true);
      const processedUrl = processVideoUrl(video.videoUri);
      
      if (processedUrl) {
        setVideoUrl(processedUrl);
        const detectedType = detectVideoType(processedUrl);
        setVideoType(detectedType);
        console.log('🔍 Processed URL:', processedUrl, 'Type:', detectedType);
      } else {
        console.log('❌ Failed to process video URL');
        setVideoError(true);
        setLoading(false);
        setVideoType('unknown');
      }
    } else {
      console.log('❌ Video missing URI:', video);
      setVideoUrl('');
      setVideoError(false);
      setVideoType('unknown');
    }
  }, [video]);

  // Initialize real-time progress tracker
  useEffect(() => {
    if (video && show) {
      // Get user and training data
      const employeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');
      const userId = employeeData.employeeId || 'user123';
      
      // Extract training ID and module ID from URL or video data
      const urlParams = new URLSearchParams(window.location.search);
      const trainingId = video.trainingId || urlParams.get('trainingId') || 
                        window.location.pathname.split('/').pop() || 'default-training';
      const moduleId = video.moduleId || urlParams.get('moduleId') || 'default-module';
      
      console.log('🎯 Initializing progress tracker:', {
        userId,
        trainingId,
        videoTitle: video.title
      });

      // Create progress tracker with module information
      if (!progressTracker.current) {
        progressTracker.current = createProgressTracker(userId, trainingId, video.title || 'Video Training');
        // Store module ID for progress updates
        progressTracker.current.moduleId = moduleId;
        progressTracker.current.startTracking();
      }

      return () => {
        if (progressTracker.current) {
          progressTracker.current.stopTracking();
          progressTracker.current = null;
        }
      };
    }
  }, [video, show]);

  useEffect(() => {
    if (show && videoUrl) {
      // Set a timeout for YouTube videos to detect loading issues
      if (videoType === 'youtube') {
        const timeoutId = setTimeout(() => {
          if (loading) {
            console.log('⏰ YouTube video loading timeout - showing fallback');
            setVideoError(true);
            setLoading(false);
          }
        }, 8000); // 8 second timeout
        
        // Also check if the iframe is actually showing content
        const contentCheckId = setTimeout(() => {
          if (loading) {
            console.log('🔍 Checking if YouTube iframe actually loaded content...');
            // This will help detect if the iframe loaded but the video content didn't
            setLoading(false);
          }
        }, 5000); // 5 second content check
        
        // Additional check for iframe content visibility
        const visibilityCheckId = setTimeout(() => {
          try {
            const iframe = document.querySelector('iframe[src*="youtube.com"]');
            if (iframe && !loading) {
              // Check if the iframe is visible and has content
              const iframeRect = iframe.getBoundingClientRect();
              const isVisible = iframeRect.width > 0 && iframeRect.height > 0;
              console.log('🔍 Iframe visibility check:', isVisible, 'Dimensions:', iframeRect.width, 'x', iframeRect.height);
              
              if (!isVisible || iframeRect.width < 200 || iframeRect.height < 150) {
                console.log('⚠️ Iframe appears to be not properly loaded, showing fallback');
                setVideoError(true);
              }
            }
          } catch (e) {
            console.log('🔍 Error in visibility check:', e.message);
          }
        }, 6000); // 6 second visibility check
        
        return () => {
          clearTimeout(timeoutId);
          clearTimeout(contentCheckId);
          clearTimeout(visibilityCheckId);
        };
      } else {
        setLoading(false);
      }
    }
  }, [show, videoUrl, videoType, loading]);

  // Process video URL to handle different formats - Using the working logic from Training.jsx
  const processVideoUrl = (url) => {
    if (!url) return null;
    
    console.log('🔍 Processing video URL:', url);
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
      }
      
      // Fix: videoId is an array, we need the first element
      if (Array.isArray(videoId)) {
        videoId = videoId[0];
      }
      
      if (videoId.includes('&')) {
        videoId = videoId.split('&')[0];
      }
      if (videoId.includes('?')) {
        videoId = videoId.split('?')[0];
      }
      
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&disablekb=1&fs=0`;
      console.log('🔍 Generated embed URL:', embedUrl);
      return embedUrl;
    }
    
    if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      return url;
    }
    
    return url;
  };

  // Detect video type based on URL
  const detectVideoType = (url) => {
    console.log('🔍 Detecting video type for URL:', url);
    
    if (url.includes('youtube.com/embed/') || url.includes('youtu.be/') || url.includes('youtube.com/watch')) {
      console.log('✅ Detected as YouTube video');
      return 'youtube';
    } else if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
      console.log('✅ Detected as direct video file');
      return 'direct';
    } else if (url.includes('vimeo.com')) {
      console.log('✅ Detected as Vimeo video');
      return 'vimeo';
    } else if (url.includes('dailymotion.com')) {
      console.log('✅ Detected as Dailymotion video');
      return 'dailymotion';
    } else {
      console.log('⚠️ Detected as external video');
      return 'external';
    }
  };

  // Handle video errors
  const handleVideoError = () => {
    setVideoError(true);
    setLoading(false);
  };

  // Handle video load
  const handleVideoLoad = () => {
    setLoading(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  // Handle video progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
      
      // Update real-time progress tracker
      if (progressTracker.current && total > 0) {
        progressTracker.current.trackVideoProgress(video._id || 'video', current, total);
      }
      
      // 🚀 NEW: Auto-complete at 90% watched (better UX)
      const watchPercentage = (current / total) * 100;
      if (watchPercentage >= 90 && !video.completed && total > 0) {
        console.log(`📊 Video ${watchPercentage.toFixed(1)}% watched - auto-completing...`);
        handleVideoComplete();
        // Mark as completed to prevent multiple calls
        video.completed = true;
      }
      
      // Check if video is complete (100%)
      if (current >= total && total > 0) {
        handleVideoComplete();
      }
    }
  };

  // Handle video completion
  const handleVideoComplete = async () => {
    setIsPlaying(false);
    
    // Update real-time progress tracker
    if (progressTracker.current && videoRef.current) {
      await progressTracker.current.onVideoComplete(
        video._id || 'video',
        videoRef.current.duration || 0
      );
    }
    
    // 🚀 NEW: Update LMS with video completion
    try {
      const employeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');
      const userId = employeeData.employeeId || 'test-user';
      
      // For demo purposes, use the test IDs that worked
      // In real app, these would come from your training data
      const trainingId = video.trainingId || '68aae52917665863bf7979df'; // Your working training ID
      const moduleId = video.moduleId || '68173662b95f4caae809067e';   // Your working module ID
      const videoId = video.videoId || '68173662b95f4caae809067f';     // Your working video ID
      
      console.log('🎯 Marking video as completed in LMS:', {
        userId,
        trainingId,
        moduleId,
        videoId,
        videoTitle: video.title
      });
      
      // Mark video as completed in your LMS
      const result = await markVideoCompleted(userId, trainingId, moduleId, videoId);
      
      console.log('✅ LMS Progress Updated Successfully:', result);
      
      // Check if training is now completed
      if (result.data?.trainingProgress?.pass) {
        console.log('🎉 ENTIRE TRAINING COMPLETED!');
        alert(`🎉 Congratulations! 
Video "${video.title}" completed!
✅ Training "${result.data.trainingProgress.trainingName}" is now 100% complete!
Check your LMS dashboard to see the updated progress.`);
      } else {
        alert(`✅ Video "${video.title}" completed!
Progress has been saved to your LMS system.
Check your training dashboard for updated completion status.`);
      }
      
    } catch (error) {
      console.error('❌ Failed to update LMS progress:', error);
      alert(`⚠️ Video completed locally, but failed to sync with LMS.
Please check your internet connection and try again.
Error: ${error.message}`);
    }
    
    // If we have a custom completion handler from parent, use it
    if (onVideoComplete) {
      // Pass additional context if available
      const videoData = {
        ...video,
        moduleIndex: video.moduleIndex,
        videoIndex: video.videoIndex
      };
      onVideoComplete(videoData);
    } else {
      // Handle completion directly in the video player
      console.log('🎬 Video completed in VideoPlayer:', video.title);
    }
  };

  // Play/Pause toggle
  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        // Notify progress tracker of pause
        if (progressTracker.current) {
          await progressTracker.current.onVideoPause(
            video._id || 'video',
            videoRef.current.currentTime,
            videoRef.current.duration
          );
        }
      } else {
        videoRef.current.play();
        // Notify progress tracker of play/resume
        if (progressTracker.current) {
          if (videoRef.current.currentTime > 0) {
            await progressTracker.current.onVideoResume(
              video._id || 'video',
              videoRef.current.currentTime
            );
          } else {
            await progressTracker.current.onVideoStart(video._id || 'video');
          }
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Seek to specific time
  const seekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Skip forward/backward
  const skipTime = (seconds) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.duration, currentTime + seconds));
      seekTo(newTime);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render different video content based on type
  const renderVideoContent = () => {
    if (!video) {
      return (
        <div className="text-center p-4">
          <Alert variant="warning">
            <h6>⚠️ No Video Selected</h6>
            <p className="mb-0">Please select a video to watch.</p>
          </Alert>
        </div>
      );
    }

    if (!video.videoUri) {
      return (
        <div className="text-center p-4">
          <Alert variant="warning">
            <h6>⚠️ Video URL Missing</h6>
            <p className="mb-0">This video doesn't have a valid URL.</p>
            <small className="text-muted">Video ID: {video._id || 'Unknown'}</small>
          </Alert>
        </div>
      );
    }

    if (videoError) {
      return (
        <div className="text-center p-4">
          <Alert variant="danger">
            <h6>❌ Video Playback Error</h6>
            <p className="mb-2">Unable to play this video. This could be because:</p>
            <ul className="text-start small">
              <li>The video is unlisted or private</li>
              <li>The video URL is incorrect</li>
              <li>The video has embedding disabled</li>
              <li>Network connectivity issues</li>
            </ul>
            <div className="mt-3">
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={() => window.open(video.videoUri, '_blank')}
                className="me-2"
              >
                Open Video in New Tab
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={() => {
                  setVideoError(false);
                  setLoading(true);
                }}
              >
                Retry
              </Button>
            </div>
          </Alert>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading video...</p>
        </div>
      );
    }

              // YouTube videos
     if (videoType === 'youtube') {
       console.log('🎬 Rendering YouTube iframe with URL:', videoUrl);
       
       if (videoError) {
         return (
           <div className="text-center p-4">
             <Alert variant="warning">
               <h6>⚠️ YouTube Video Failed to Load</h6>
               <p className="mb-3">The embedded video couldn't be loaded. This could be due to:</p>
               <ul className="text-start small mb-3">
                 <li>Browser security restrictions</li>
                 <li>Network connectivity issues</li>
                 <li>Video embedding being disabled</li>
               </ul>
               <div className="d-flex gap-2 justify-content-center">
                 <Button 
                   variant="primary" 
                   onClick={() => window.open(video.videoUri, '_blank')}
                   className="me-2"
                 >
                   🎬 Watch on YouTube
                 </Button>
                 <Button 
                   variant="outline-secondary" 
                   onClick={() => {
                     setVideoError(false);
                     setLoading(true);
                   }}
                 >
                   🔄 Retry
                 </Button>
               </div>
             </Alert>
           </div>
         );
       }
       
       return (
         <div className="ratio ratio-16x9">
                       {/* Loading state */}
            {loading && (
              <div className="d-flex align-items-center justify-content-center bg-dark text-white rounded">
                <div className="text-center">
                  <div className="spinner-border text-light mb-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div>Loading YouTube video...</div>
                  <small className="text-muted">This may take a few seconds</small>
                </div>
              </div>
            )}
            
            {/* YouTube iframe */}
            <iframe
              src={videoUrl}
              title={video.title || 'Video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded"
              style={{ border: 'none', display: loading ? 'none' : 'block' }}
              onLoad={() => {
                console.log('✅ YouTube iframe loaded successfully');
                setLoading(false);
                setVideoError(false);
                
                // Additional check to see if the video actually loaded
                setTimeout(() => {
                  try {
                    const iframe = document.querySelector('iframe[src*="youtube.com"]');
                    if (iframe) {
                      // Check if the iframe has any content
                      const iframeRect = iframe.getBoundingClientRect();
                      console.log('🔍 Iframe dimensions:', iframeRect.width, 'x', iframeRect.height);
                      
                      // If the iframe is very small or has no content, it might not have loaded properly
                      if (iframeRect.width < 100 || iframeRect.height < 100) {
                        console.log('⚠️ Iframe appears to be too small, might not have loaded properly');
                        setVideoError(true);
                      }
                    }
                  } catch (e) {
                    console.log('🔍 Error checking iframe content:', e.message);
                  }
                }, 3000);
              }}
              onError={() => {
                console.error('❌ YouTube iframe failed to load');
                setVideoError(true);
                setLoading(false);
              }}
              ref={(iframe) => {
                if (iframe) {
                  console.log('🔍 Iframe element created:', iframe);
                  // Add a message listener to detect if YouTube is actually working
                  const handleMessage = (event) => {
                    if (event.origin === 'https://www.youtube.com') {
                      console.log('📡 YouTube message received:', event.data);
                    }
                  };
                  window.addEventListener('message', handleMessage);
                  
                  // Check if iframe content is actually loaded
                  setTimeout(() => {
                    try {
                      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                      console.log('🔍 Iframe document accessible:', !!iframeDoc);
                    } catch (e) {
                      console.log('🔍 Iframe document not accessible (expected for cross-origin):', e.message);
                    }
                  }, 2000);
                }
              }}
            ></iframe>
            
            {/* Fallback message if iframe appears empty */}
            {!loading && !videoError && (
              <div className="mt-2 text-center">
                <Alert variant="info" className="mb-2">
                  <small>
                    <strong>💡 Tip:</strong> If you only see a YouTube logo and play button, 
                    the video might not be loading properly. Try the "Watch on YouTube" button below.
                  </small>
                </Alert>
              </div>
            )}
           
           <div className="mt-2 text-center">
             <small className="text-muted">
               If the video doesn't load, try{' '}
               <Button 
                 variant="link" 
                 size="sm" 
                 className="p-0"
                 onClick={() => window.open(video.videoUri, '_blank')}
               >
                 opening in YouTube
               </Button>
             </small>
           </div>
           
           {/* Prominent fallback button */}
           <div className="mt-3 text-center">
             <Button 
               variant="primary" 
               size="lg"
               onClick={() => {
                 console.log('🎬 Opening video directly in YouTube:', video.videoUri);
                 window.open(video.videoUri, '_blank');
               }}
               className="me-2"
             >
               🎬 Watch on YouTube
             </Button>
             <Button 
               variant="outline-secondary" 
               size="lg"
               onClick={() => {
                 console.log('📋 Copying video URL to clipboard');
                 navigator.clipboard.writeText(video.videoUri);
                 alert('Video URL copied to clipboard!');
               }}
               className="me-2"
             >
               📋 Copy URL
             </Button>
             <Button 
               variant="warning" 
               size="lg"
               onClick={() => {
                 console.log('🔄 Trying alternative video loading method');
                 // Try to reload the iframe with different parameters
                 setLoading(true);
                 setVideoError(false);
                 // Force a re-render by updating the URL slightly
                 const newUrl = `${videoUrl}&t=${Date.now()}`;
                 setVideoUrl(newUrl);
               }}
             >
               🔄 Reload Video
             </Button>
           </div>
           
           {/* Debug info for YouTube videos */}
           {config?.ENABLE_DEBUG && (
             <div className="mt-2 p-2 bg-light rounded small">
               <strong>Debug Info:</strong>
               <div>Original URL: {video.videoUri}</div>
               <div>Processed URL: {videoUrl}</div>
               <div>Video Type: {videoType}</div>
               <div>Loading State: {loading ? 'Yes' : 'No'}</div>
               <div>Error State: {videoError ? 'Yes' : 'No'}</div>
               <div>Video Object: {JSON.stringify(video, null, 2)}</div>
             </div>
           )}
           
           {/* Quick test link */}
           <div className="mt-2 text-center">
             <Button 
               variant="outline-info" 
               size="sm"
               onClick={() => {
                 console.log('🔍 Testing video URL:', video.videoUri);
                 console.log('🔍 Processed URL:', videoUrl);
                 window.open(video.videoUri, '_blank');
               }}
               className="me-2"
             >
               🔍 Test Video URL
             </Button>
             
             <Button 
               variant="outline-warning" 
               size="sm"
               onClick={() => {
                 console.log('🔍 Testing processed embed URL:', videoUrl);
                 // Try to open the processed embed URL directly
                 if (videoUrl && videoUrl.includes('youtube.com/embed/')) {
                   window.open(videoUrl, '_blank');
                 } else {
                   alert('No valid embed URL available');
                 }
               }}
             >
               🔍 Test Embed URL
             </Button>
           </div>
         </div>
       );
     }

    // Direct video files
    if (videoType === 'direct') {
      return (
        <div className="video-container position-relative">
          <video
            ref={videoRef}
            className="w-100 rounded"
            controls
            onError={handleVideoError}
            onLoadedMetadata={handleVideoLoad}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoComplete}
            onPlay={async () => {
              setIsPlaying(true);
              if (progressTracker.current) {
                await progressTracker.current.onVideoStart(video._id || 'video');
              }
            }}
            onPause={async () => {
              setIsPlaying(false);
              if (progressTracker.current && videoRef.current) {
                await progressTracker.current.onVideoPause(
                  video._id || 'video',
                  videoRef.current.currentTime,
                  videoRef.current.duration
                );
              }
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
          
          {/* Custom Video Controls */}
          <div className="video-controls bg-dark bg-opacity-75 p-2 rounded-bottom">
            <Row className="align-items-center g-2">
              <Col xs="auto">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-white p-1"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <PauseFill /> : <PlayFill />}
                </Button>
              </Col>
              
              <Col xs="auto">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-white p-1"
                  onClick={() => skipTime(-10)}
                >
                  <SkipBackward />
                </Button>
              </Col>
              
              <Col xs="auto">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-white p-1"
                  onClick={() => skipTime(10)}
                >
                  <SkipForward />
                </Button>
              </Col>
              
              <Col>
                <ProgressBar 
                  now={progress} 
                  className="bg-secondary"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = (clickX / rect.width) * 100;
                    const newTime = (percentage / 100) * duration;
                    seekTo(newTime);
                  }}
                />
              </Col>
              
              <Col xs="auto">
                <small className="text-white">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </small>
              </Col>
              
              <Col xs="auto">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-white p-1"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeMute /> : <VolumeUp />}
                </Button>
              </Col>
              
              <Col xs="auto">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="form-range"
                  style={{ width: '60px' }}
                />
              </Col>
              
              <Col xs="auto">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-white p-1"
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.requestFullscreen) {
                        videoRef.current.requestFullscreen();
                      }
                    }
                  }}
                >
                  <Fullscreen />
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      );
    }

    // External video links
    if (videoType === 'external') {
      return (
        <div className="text-center p-4">
          <Alert variant="info">
            <h6>📹 External Video</h6>
            <p className="mb-3">This video is hosted on an external platform:</p>
            <div className="mb-3">
              <code className="small">{videoUrl}</code>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <Button 
                variant="primary" 
                onClick={() => window.open(videoUrl, '_blank')}
              >
                <Eye className="me-2" />
                Watch Video
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigator.clipboard.writeText(videoUrl)}
              >
                Copy Link
              </Button>
            </div>
          </Alert>
        </div>
      );
    }

    // Unknown video type
    return (
      <div className="text-center p-4">
        <Alert variant="secondary">
          <h6>❓ Unknown Video Format</h6>
          <p className="mb-2">Video URL format not recognized.</p>
          <small className="text-muted">URL: {video.videoUri || 'Not provided'}</small>
        </Alert>
      </div>
    );
  };

  // Don't render the modal if video is null
  if (!video) {
    return null;
  }

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      centered
      className="video-player-modal"
      backdrop="static"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold d-flex align-items-center">
          <span className="me-2">🎬</span>
          {video?.title || 'Video Player'}
        </Modal.Title>
        {videoType !== 'unknown' && (
          <Badge bg="info" className="ms-2">
            {videoType.toUpperCase()}
          </Badge>
        )}
      </Modal.Header>
      
      <Modal.Body className="pt-0">
        {renderVideoContent()}
        
        {/* Video Information */}
        {video?.description && (
          <div className="mt-3">
            <h6 className="fw-bold">Description:</h6>
            <p className="text-muted mb-0">{video.description}</p>
          </div>
        )}
        
        {/* Video Metadata */}
        <div className="mt-3 p-3 bg-light rounded">
          <Row>
            <Col md={6}>
              <small className="text-muted">
                <strong>Type:</strong> {videoType}
              </small>
            </Col>
            <Col md={6}>
              <small className="text-muted">
                <strong>Duration:</strong> {duration > 0 ? formatTime(duration) : 'Unknown'}
              </small>
            </Col>
          </Row>
          {video?.questions && video.questions.length > 0 && (
            <div className="mt-2">
              <small className="text-muted">
                <strong>Quiz Questions:</strong> {video.questions.length}
              </small>
            </div>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer className="border-0">
        <div className="d-flex gap-2">
          {videoType === 'direct' && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={togglePlayPause}
            >
              {isPlaying ? <PauseFill className="me-1" /> : <PlayFill className="me-1" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          )}
          <Button variant="outline-secondary" onClick={onHide}>
            Close
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default VideoPlayer;
