import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

const VideoModal = ({ show, onHide, video }) => {
  const [videoError, setVideoError] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (video && video.videoUri) {
      setVideoError(false);
      setVideoUrl(getEmbedUrl(video.videoUri));
    } else {
      setVideoUrl('');
      setVideoError(false);
    }
  }, [video]);

  // Convert various video URL formats to embed format
  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    let videoId = '';
    
    // Handle different YouTube URL formats
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('youtube.com/watch?v=')[1];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1];
    } else if (url.includes('youtube.com/v/')) {
      videoId = url.split('youtube.com/v/')[1];
    }
    
    // Remove any additional parameters
    if (videoId.includes('&')) {
      videoId = videoId.split('&')[0];
    }
    
    // Check if it looks like a valid YouTube video ID (11 characters)
    if (videoId && videoId.length === 11) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // If not a valid YouTube ID, return the original URL
    return url;
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  const isYouTubeUrl = (url) => {
    return url.includes('youtube.com/embed/') || url.includes('youtu.be/') || url.includes('youtube.com/watch');
  };

  const renderVideoContent = () => {
    // Check if video exists and has required properties
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
          <Alert variant="warning">
            <h6>⚠️ Video Playback Error</h6>
            <p className="mb-2">Unable to play this video. This could be because:</p>
            <ul className="text-start small">
              <li>The video is unlisted or private</li>
              <li>The video URL is incorrect</li>
              <li>The video has embedding disabled</li>
            </ul>
            <div className="mt-3">
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={() => window.open(video.videoUri, '_blank')}
              >
                Open Video in New Tab
              </Button>
            </div>
          </Alert>
        </div>
      );
    }

    if (videoUrl && isYouTubeUrl(videoUrl)) {
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
          ></iframe>
        </div>
      );
    }

    if (videoUrl && videoUrl.includes('http')) {
      return (
        <div className="text-center p-4">
          <Alert variant="info">
            <h6>📹 Video Link Available</h6>
            <p className="mb-3">This video is available at the following link:</p>
            <div className="mb-3">
              <code className="small">{videoUrl}</code>
            </div>
            <Button 
              variant="primary" 
              onClick={() => window.open(videoUrl, '_blank')}
            >
              Open Video
            </Button>
          </Alert>
        </div>
      );
    }

    return (
      <div className="text-center p-4">
        <Alert variant="secondary">
          <h6>❓ Video Information</h6>
          <p className="mb-2">Video URL not available or in unsupported format.</p>
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
      size="lg" 
      centered
      className="video-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">{video?.title || 'Video'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        {renderVideoContent()}
        
        {video?.description && (
          <div className="mt-3">
            <h6 className="fw-bold">Description:</h6>
            <p className="text-muted mb-0">{video.description}</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VideoModal;
