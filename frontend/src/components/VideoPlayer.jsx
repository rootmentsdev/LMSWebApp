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

  useEffect(() => {
    if (video && video.videoUri) {
      setVideoError(false);
      setLoading(true);
      const processedUrl = processVideoUrl(video.videoUri);
      setVideoUrl(processedUrl);
      setVideoType(detectVideoType(processedUrl));
    } else {
      setVideoUrl('');
      setVideoError(false);
      setVideoType('unknown');
    }
  }, [video]);

  useEffect(() => {
    if (show && videoUrl) {
      setLoading(false);
    }
  }, [show, videoUrl]);

  // Process video URL to handle different formats
  const processVideoUrl = (url) => {
    if (!url) return '';
    
    console.log('🔍 Processing video URL:', url);
    
    let videoId = '';
    
    // Handle different YouTube URL formats
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
      console.log('🔍 Extracted from youtu.be:', videoId);
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('youtube.com/watch?v=')[1];
      console.log('🔍 Extracted from youtube.com/watch:', videoId);
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1];
      console.log('🔍 Extracted from youtube.com/embed:', videoId);
    } else if (url.includes('youtube.com/v/')) {
      videoId = url.split('youtube.com/v/')[1];
      console.log('🔍 Extracted from youtube.com/v:', videoId);
    }
    
    // Remove any additional parameters (including ?si=...)
    if (videoId.includes('&')) {
      videoId = videoId.split('&')[0];
      console.log('🔍 Removed & parameters:', videoId);
    }
    if (videoId.includes('?')) {
      videoId = videoId.split('?')[0];
      console.log('🔍 Removed ? parameters:', videoId);
    }
    
    console.log('🔍 Final video ID:', videoId);
    
    // Check if it looks like a valid YouTube video ID (11 characters)
    if (videoId && videoId.length === 11) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      console.log('🔍 Generated embed URL:', embedUrl);
      return embedUrl;
    }
    
    console.log('⚠️ Invalid YouTube ID, returning original URL');
    // If not a valid YouTube ID, return the original URL
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
      
      // Check if video is complete
      if (current >= total && total > 0) {
        handleVideoComplete();
      }
    }
  };

  // Handle video completion
  const handleVideoComplete = () => {
    setIsPlaying(false);
    if (onVideoComplete) {
      onVideoComplete(video);
    }
  };

  // Play/Pause toggle
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
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
      return (
        <div className="ratio ratio-16x9">
          <iframe
            src={videoUrl}
            title={video.title || 'Video'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded"
            onError={handleVideoError}
            onLoad={handleVideoLoad}
          ></iframe>
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
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
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
