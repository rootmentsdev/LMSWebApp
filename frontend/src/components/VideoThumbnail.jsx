import React, { useState } from 'react';
import './VideoComponents.css';
import { 
  Card, 
  Button, 
  Badge, 
  OverlayTrigger, 
  Tooltip,
  ProgressBar
} from 'react-bootstrap';
import { 
  PlayFill, 
  Clock, 
  Eye,
  CheckCircleFill,
  ExclamationCircleFill
} from 'react-bootstrap-icons';

const VideoThumbnail = ({ 
  video, 
  onPlay, 
  onComplete, 
  showProgress = true,
  showStatus = true,
  size = 'medium' // small, medium, large
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Generate thumbnail URL for different video types
  const getThumbnailUrl = (videoUri) => {
    if (!videoUri) return null;
    
    // YouTube thumbnail
    if (videoUri.includes('youtube.com') || videoUri.includes('youtu.be')) {
      let videoId = '';
      if (videoUri.includes('youtu.be/')) {
        videoId = videoUri.split('youtu.be/')[1];
      } else if (videoUri.includes('youtube.com/watch?v=')) {
        videoId = videoUri.split('youtube.com/watch?v=')[1];
      } else if (videoUri.includes('youtube.com/embed/')) {
        videoId = videoUri.split('youtube.com/embed/')[1];
      }
      
      if (videoId && videoId.length === 11) {
        // Remove additional parameters
        if (videoId.includes('&')) {
          videoId = videoId.split('&')[0];
        }
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    // Vimeo thumbnail
    if (videoUri.includes('vimeo.com')) {
      const videoId = videoUri.split('vimeo.com/')[1]?.split('/')[0];
      if (videoId) {
        return `https://vumbnail.com/${videoId}.jpg`;
      }
    }
    
    // Default thumbnail or custom thumbnail
    return video.thumbnailUrl || video.thumbnail || null;
  };

  // Get video duration display
  const getDurationDisplay = (duration) => {
    if (!duration) return null;
    
    if (typeof duration === 'number') {
      const mins = Math.floor(duration / 60);
      const secs = Math.floor(duration % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    if (typeof duration === 'string') {
      return duration;
    }
    
    return null;
  };

  // Get video status
  const getVideoStatus = (video) => {
    if (video.completed) return { status: 'completed', icon: <CheckCircleFill className="text-success" />, text: 'Completed' };
    if (video.inProgress) return { status: 'in-progress', icon: <ExclamationCircleFill className="text-warning" />, text: 'In Progress' };
    if (video.watched) return { status: 'watched', icon: <Eye className="text-info" />, text: 'Watched' };
    return { status: 'not-started', icon: null, text: 'Not Started' };
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          cardClass: 'video-thumbnail-small',
          imageClass: 'video-thumbnail-img-small',
          titleClass: 'h6 mb-1',
          descriptionClass: 'small text-muted'
        };
      case 'large':
        return {
          cardClass: 'video-thumbnail-large',
          imageClass: 'video-thumbnail-img-large',
          titleClass: 'h5 mb-2',
          descriptionClass: 'mb-2'
        };
      default: // medium
        return {
          cardClass: 'video-thumbnail-medium',
          imageClass: 'video-thumbnail-img-medium',
          titleClass: 'h6 mb-1',
          descriptionClass: 'small text-muted mb-2'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const thumbnailUrl = getThumbnailUrl(video.videoUri);
  const durationDisplay = getDurationDisplay(video.duration);
  const videoStatus = getVideoStatus(video);
  const hasVideoUrl = !!video.videoUri;

  const handlePlayClick = () => {
    if (hasVideoUrl && onPlay) {
      onPlay(video);
    }
  };

  const handleCompleteClick = () => {
    if (onComplete) {
      onComplete(video);
    }
  };

  return (
    <Card className={`video-thumbnail ${sizeClasses.cardClass} h-100 border-0 shadow-sm`}>
      <div className="position-relative">
        {/* Video Thumbnail Image */}
        <div className={`${sizeClasses.imageClass} position-relative bg-light`}>
          {thumbnailUrl && !imageError ? (
            <img
              src={thumbnailUrl}
              alt={video.title || 'Video thumbnail'}
              className="w-100 h-100 object-fit-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary bg-opacity-25">
              <div className="text-center text-muted">
                <div className="display-6">🎬</div>
                <small>No Preview</small>
              </div>
            </div>
          )}
          
          {/* Play Button Overlay */}
          {hasVideoUrl && (
            <div className="play-button-overlay d-flex align-items-center justify-content-center">
              <Button
                variant="primary"
                size="lg"
                className="rounded-circle play-btn"
                onClick={handlePlayClick}
                disabled={!hasVideoUrl}
              >
                <PlayFill />
              </Button>
            </div>
          )}
          
          {/* Duration Badge */}
          {durationDisplay && (
            <Badge 
              bg="dark" 
              className="position-absolute top-0 end-0 m-2 opacity-75"
            >
              <Clock className="me-1" />
              {durationDisplay}
            </Badge>
          )}
          
          {/* Status Badge */}
          {showStatus && videoStatus.status !== 'not-started' && (
            <Badge 
              bg={videoStatus.status === 'completed' ? 'success' : 'warning'}
              className="position-absolute top-0 start-0 m-2"
            >
              {videoStatus.icon}
              <span className="ms-1">{videoStatus.text}</span>
            </Badge>
          )}
        </div>
        
        {/* Progress Bar */}
        {showProgress && video.progress !== undefined && (
          <div className="position-absolute bottom-0 start-0 end-0">
            <ProgressBar 
              now={video.progress || 0} 
              className="rounded-0"
              style={{ height: '4px' }}
              variant={video.progress >= 100 ? 'success' : 'primary'}
            />
          </div>
        )}
      </div>
      
      <Card.Body className="p-3">
        {/* Video Title */}
        <h6 className={sizeClasses.titleClass}>
          {video.title || 'Untitled Video'}
        </h6>
        
        {/* Video Description */}
        {video.description && (
          <p className={`${sizeClasses.descriptionClass} text-truncate`}>
            {video.description}
          </p>
        )}
        
        {/* Video Metadata */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2 align-items-center">
            {/* Video Type Badge */}
            {video.videoType && (
              <Badge bg="info" className="small">
                {video.videoType}
              </Badge>
            )}
            
            {/* Module Badge */}
            {video.moduleName && (
              <Badge bg="secondary" className="small">
                {video.moduleName}
              </Badge>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="d-flex gap-1">
            {hasVideoUrl ? (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Watch Video</Tooltip>}
              >
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handlePlayClick}
                >
                  <PlayFill className="me-1" />
                  Watch
                </Button>
              </OverlayTrigger>
            ) : (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>No video URL available</Tooltip>}
              >
                <span>
                  <Button variant="outline-secondary" size="sm" disabled>
                    <ExclamationCircleFill className="me-1" />
                    No URL
                  </Button>
                </span>
              </OverlayTrigger>
            )}
            
            {/* Complete Button */}
            {videoStatus.status === 'in-progress' && onComplete && (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Mark as Complete</Tooltip>}
              >
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={handleCompleteClick}
                >
                  <CheckCircleFill className="me-1" />
                  Complete
                </Button>
              </OverlayTrigger>
            )}
          </div>
        </div>
        
        {/* Additional Info */}
        {size === 'large' && (
          <div className="mt-2 pt-2 border-top">
            <div className="row text-muted small">
              <div className="col-6">
                <strong>Created:</strong> {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
              <div className="col-6">
                <strong>Questions:</strong> {video.questions?.length || 0}
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default VideoThumbnail;
