import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge,
  ProgressBar,
  Spinner,
  Alert
} from 'react-bootstrap';
import { 
  PlayFill, 
  CheckCircleFill, 
  LockFill,
  ArrowLeft,
  JournalText
} from 'react-bootstrap-icons';
import { 
  getTrainingWithModules,
  updateTrainingProgress
} from '../api';
import VideoPlayer from '../components/VideoPlayer';

const TrainingModules = () => {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [userProgress, setUserProgress] = useState({});
  const [currentUserId] = useState('user123');
  const [inlineVideo, setInlineVideo] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState({}); // Track which videos have been watched
  const [videoWatchTime, setVideoWatchTime] = useState({}); // Track how long each video has been watched

  useEffect(() => {
    if (trainingId) {
      fetchTrainingDetails();
    }
  }, [trainingId]);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`userProgress_${currentUserId}`);
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        setUserProgress(parsedProgress);
      } catch (err) {
        console.error('Error parsing saved progress:', err);
      }
    }
  }, [currentUserId]);

  const fetchTrainingDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const mockTraining = {
        _id: trainingId,
        title: 'Customer Service Excellence',
        description: 'Complete each training module and its assessment to test your understanding. The deadline for completion is 20-12-2024 Stay on track!',
        progress: 0,
        numberOfModules: 0
      };
      
      const enhancedTraining = await getTrainingWithModules(mockTraining);
      setTraining(enhancedTraining);
      
    } catch (err) {
      console.error('Error fetching training details:', err);
      setError(`Failed to fetch training details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartVideo = (video, moduleIndex, videoIndex) => {
    if (!video) {
      setError('Invalid video data. Please try again.');
      return;
    }
    
    if (video.videoUri) {
      // Mark video as watched when it starts playing
      const videoKey = `${video._id || videoIndex}`;
      setWatchedVideos(prev => ({
        ...prev,
        [videoKey]: true
      }));
      
      setSelectedVideo({
        ...video,
        moduleIndex,
        videoIndex
      });
      setShowVideoModal(true);
    } else {
      setError('Video URL not available. Please check with your administrator.');
    }
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const handleVideoComplete = (video, moduleIndex, videoIndex) => {
    // Create training-specific progress tracking
    const trainingProgressKey = `training_${trainingId}`;
    const currentTrainingProgress = userProgress[trainingProgressKey] || {};
    
    const newTrainingProgress = {
      ...currentTrainingProgress,
      completedVideos: [...(currentTrainingProgress.completedVideos || []), video._id],
      lastCompletedVideo: video._id,
      lastCompletedAt: new Date().toISOString()
    };
    
    const newProgress = {
      ...userProgress,
      [trainingProgressKey]: newTrainingProgress,
      lastCompletedVideo: video._id,
      lastCompletedAt: new Date().toISOString()
    };
    
    setUserProgress(newProgress);
    localStorage.setItem(`userProgress_${currentUserId}`, JSON.stringify(newProgress));
    
    alert(`🎉 Congratulations! You've completed "${video.title}" in this training!`);
    handleCloseVideoModal();
  };

  const handleInlineVideo = (video, moduleIndex, videoIndex) => {
    // Mark video as watched when it starts playing
    const videoKey = `${video._id || videoIndex}`;
    setWatchedVideos(prev => ({
      ...prev,
      [videoKey]: true
    }));
    
    // Start tracking watch time
    const startTime = Date.now();
    setVideoWatchTime(prev => ({
      ...prev,
      [videoKey]: startTime
    }));
    
    setInlineVideo({
      ...video,
      moduleIndex,
      videoIndex
    });
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const closeInlineVideo = () => {
    setInlineVideo(null);
  };

  const processVideoUrl = (url) => {
    if (!url) return null;
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
      }
      
      if (videoId.includes('&')) {
        videoId = videoId.split('&')[0];
      }
      if (videoId.includes('?')) {
        videoId = videoId.split('?')[0];
      }
      
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`;
    }
    
    if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      return url;
    }
    
    return url;
  };

  const isVideoUnlocked = (moduleIndex, videoIndex, training) => {
    if (videoIndex === 0) return true;
    
    if (!training || !training.moduleDetails || !training.moduleDetails[moduleIndex]) return false;
    
    const module = training.moduleDetails[moduleIndex];
    if (!module.videos || videoIndex === 0) return true;
    
    const previousVideo = module.videos[videoIndex - 1];
    if (!previousVideo) return false;
    
    // Use training-specific progress
    const trainingProgressKey = `training_${trainingId}`;
    const trainingProgress = userProgress[trainingProgressKey] || {};
    return trainingProgress.completedVideos?.includes(previousVideo._id) || false;
  };

  const isModuleUnlocked = (moduleIndex, training) => {
    if (moduleIndex === 0) return true;
    
    if (!training || !training.moduleDetails || !training.moduleDetails[moduleIndex - 1]) return false;
    
    const previousModule = training.moduleDetails[moduleIndex - 1];
    if (!previousModule.videos) return false;
    
    // Use training-specific progress
    const trainingProgressKey = `training_${trainingId}`;
    const trainingProgress = userProgress[trainingProgressKey] || {};
    return previousModule.videos.every(video => 
      trainingProgress.completedVideos?.includes(video._id)
    );
  };

  const getModuleProgress = (module) => {
    if (!module.videos || module.videos.length === 0) return 0;
    
    // Use training-specific progress
    const trainingProgressKey = `training_${trainingId}`;
    const trainingProgress = userProgress[trainingProgressKey] || {};
    
    const completedVideos = module.videos.filter(video => 
      trainingProgress.completedVideos?.includes(video._id)
    ).length;
    
    return Math.round((completedVideos / module.videos.length) * 100);
  };

  const getOverallProgress = () => {
    if (!training || !training.moduleDetails) return 0;
    
    const totalVideos = training.moduleDetails.reduce((total, module) => 
      total + (module.videos ? module.videos.length : 0), 0
    );
    
    if (totalVideos === 0) return 0;
    
    // Use training-specific progress
    const trainingProgressKey = `training_${trainingId}`;
    const trainingProgress = userProgress[trainingProgressKey] || {};
    const completedVideos = trainingProgress.completedVideos?.length || 0;
    return Math.round((completedVideos / totalVideos) * 100);
  };

  // Check if video can be completed (minimum 30 seconds watch time)
  const canCompleteVideo = (video, videoIndex) => {
    const videoKey = `${video._id || videoIndex}`;
    const startTime = videoWatchTime[videoKey];
    
    if (!startTime) return false;
    
    const watchDuration = Date.now() - startTime;
    const minimumWatchTime = 30000; // 30 seconds in milliseconds
    
    return watchDuration >= minimumWatchTime;
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#f8f9fa' }}>
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="text-muted">Loading training modules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white text-dark min-vh-100">
        <Container className="py-4">
          <Alert variant="danger">
            <h5>Error Loading Training</h5>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={() => navigate('/training')}>
              <ArrowLeft className="me-2" />
              Back to Trainings
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="bg-white text-dark min-vh-100">
        <Container className="py-4">
          <Alert variant="warning">
            <h5>Training Not Found</h5>
            <p>The requested training could not be found.</p>
            <Button variant="outline-warning" onClick={() => navigate('/training')}>
              <ArrowLeft className="me-2" />
              Back to Trainings
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-light text-dark min-vh-100">
      {/* Header - Mobile Style */}
      <div className="bg-white border-bottom shadow-sm">
        <Container className="py-3">
          <div className="d-flex align-items-center">
            <Button 
              variant="link" 
              size="sm"
              onClick={() => navigate('/training')}
              className="me-3 p-0 text-dark"
              style={{ border: 'none', background: 'none' }}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h5 className="mb-0 fw-bold text-dark">Training</h5>
              <h4 className="mb-0 fw-bold text-dark">{training.title}</h4>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {/* Training Description */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <p className="text-muted mb-0">
              {training.description}
              <span className="text-primary fw-bold"> 20-12-2024</span>
            </p>
          </Card.Body>
        </Card>

        {/* Inline Video Player */}
        {inlineVideo && (
          <Card className="border-0 shadow mb-4">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">🎬 Now Playing: {inlineVideo.title}</h6>
              <Button 
                variant="light" 
                size="sm" 
                onClick={closeInlineVideo}
                className="text-dark"
              >
                ✕
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
                                 <div className="ratio ratio-16x9">
                     {inlineVideo.videoUri && (
                       inlineVideo.videoUri.includes('youtube.com') || inlineVideo.videoUri.includes('youtu.be') ? (
                         <iframe
                           src={processVideoUrl(inlineVideo.videoUri)}
                           title={inlineVideo.title}
                           frameBorder="0"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                           allowFullScreen
                           style={{ border: 'none' }}
                           onError={(e) => {
                             console.error('YouTube iframe error:', e);
                             setError('Failed to load YouTube video. Please check the URL.');
                           }}
                         />
                       ) : (
                         <video
                           controls
                           autoPlay
                           className="w-100 h-100"
                           style={{ objectFit: 'contain' }}
                           onError={(e) => {
                             console.error('Video playback error:', e);
                             setError('Failed to load video. Please check the video file.');
                           }}
                         >
                           <source src={inlineVideo.videoUri} type="video/mp4" />
                           <source src={inlineVideo.videoUri} type="video/webm" />
                           <source src={inlineVideo.videoUri} type="video/ogg" />
                           Your browser does not support the video tag.
                         </video>
                       )
                     )}
                     {!inlineVideo.videoUri && (
                       <div className="d-flex align-items-center justify-content-center bg-light">
                         <div className="text-center p-4">
                           <div className="text-muted mb-2">🎬</div>
                           <p className="text-muted mb-0">Video URL not available</p>
                           <small className="text-muted">Please check with your administrator</small>
                         </div>
                       </div>
                     )}
                   </div>
              <div className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">{inlineVideo.title}</h6>
                    <small className="text-muted">
                      Module {inlineVideo.moduleIndex + 1}, Video {inlineVideo.videoIndex + 1}
                    </small>
                  </div>
                  {canCompleteVideo(inlineVideo, inlineVideo.videoIndex) ? (
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => {
                        handleVideoComplete(inlineVideo, inlineVideo.moduleIndex, inlineVideo.videoIndex);
                        closeInlineVideo();
                      }}
                    >
                      <CheckCircleFill className="me-1" />
                      Mark Complete
                    </Button>
                  ) : (
                    <div className="text-muted small">
                      ⏱️ Watch for 30 seconds to complete
                    </div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Modules List - Mobile Style */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3 text-dark">Learning Modules</h5>
          
          {training.moduleDetails && training.moduleDetails.length > 0 ? (
            <div>
              {training.moduleDetails.map((module, moduleIndex) => {
                const moduleUnlocked = isModuleUnlocked(moduleIndex, training);
                const moduleProgress = getModuleProgress(module);
                
                return (
                  <Card key={`module-${module._id || moduleIndex}`} className={`mb-3 ${!moduleUnlocked ? 'opacity-75' : ''}`}>
                    <Card.Header className={`d-flex justify-content-between align-items-center ${
                      moduleUnlocked ? 'bg-primary text-white' : 'bg-secondary text-white'
                    }`}>
                      <div className="d-flex align-items-center">
                        {moduleUnlocked ? (
                          <PlayFill className="me-2" />
                        ) : (
                          <LockFill className="me-2" />
                        )}
                        <span className="fw-bold">
                          {module.moduleName || `Module ${moduleIndex + 1}`}
                        </span>
                      </div>
                      <Badge bg={moduleUnlocked ? 'light' : 'secondary'} className="text-dark">
                        {module.videos ? module.videos.length : 0} videos
                      </Badge>
                    </Card.Header>
                    
                    <Card.Body className="p-3">
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">Progress</small>
                          <small className="fw-bold text-primary">{moduleProgress}%</small>
                        </div>
                        <ProgressBar 
                          now={moduleProgress} 
                          style={{ height: '8px' }}
                          variant={moduleProgress > 75 ? 'success' : moduleProgress > 25 ? 'warning' : 'info'}
                        />
                      </div>
                      
                      {/* Video List - Mobile Style */}
                      {moduleUnlocked && module.videos && module.videos.length > 0 ? (
                        <div>
                          {module.videos.map((video, videoIndex) => {
                                                           const videoUnlocked = isVideoUnlocked(moduleIndex, videoIndex, training);
                               // Use training-specific progress
                               const trainingProgressKey = `training_${trainingId}`;
                               const trainingProgress = userProgress[trainingProgressKey] || {};
                               const isVideoCompleted = trainingProgress.completedVideos?.includes(video._id);
                               const videoKey = `${video._id || videoIndex}`;
                            
                            return (
                              <div key={`video-${video._id || videoIndex}`} className="mb-3 p-3 border rounded bg-white">
                                <div className="d-flex align-items-center justify-content-between">
                                  <div className="d-flex align-items-center">
                                    {/* Video Icon */}
                                    <div className="bg-light rounded d-flex align-items-center justify-content-center me-3" 
                                         style={{ width: '50px', height: '50px' }}>
                                      {isVideoCompleted ? (
                                        <CheckCircleFill size={24} className="text-success" />
                                      ) : videoUnlocked ? (
                                        <PlayFill size={24} className="text-primary" />
                                      ) : (
                                        <LockFill size={24} className="text-muted" />
                                      )}
                                    </div>
                                    
                                    {/* Video Info */}
                                    <div>
                                      <h6 className="mb-1 fw-bold">{video.title || `Topic ${videoIndex + 1}`}</h6>
                                      <small className="text-muted">Duration: 30:24</small>
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div>
                                    {videoUnlocked && !isVideoCompleted ? (
                                      <div className="d-flex gap-2">
                                        <Button 
                                          variant="success" 
                                          size="sm"
                                          onClick={() => handleInlineVideo(video, moduleIndex, videoIndex)}
                                        >
                                          {watchedVideos[videoKey] ? 'Resume' : 'Watch Now'}
                                        </Button>
                                        
                                        {/* Only show Complete button if video has been watched for minimum time */}
                                        {watchedVideos[videoKey] && canCompleteVideo(video, videoIndex) && (
                                          <Button 
                                            variant="primary" 
                                            size="sm"
                                            onClick={() => handleVideoComplete(video, moduleIndex, videoIndex)}
                                          >
                                            <CheckCircleFill className="me-1" />
                                            Complete
                                          </Button>
                                        )}
                                        
                                        {/* Show watching message if video started but not enough time */}
                                        {watchedVideos[videoKey] && !canCompleteVideo(video, videoIndex) && (
                                          <div className="text-muted small text-center">
                                            ⏱️ Watching...
                                          </div>
                                        )}
                                      </div>
                                    ) : isVideoCompleted ? (
                                      <Badge bg="success" className="fs-6">
                                        <CheckCircleFill className="me-1" />
                                        Completed
                                      </Badge>
                                    ) : (
                                      <Badge bg="secondary" className="fs-6">
                                        <LockFill className="me-1" />
                                        Locked
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <LockFill size={32} className="text-muted mb-2" />
                          <p className="text-muted small mb-0">
                            {!moduleUnlocked 
                              ? 'Complete the previous module to unlock this content.'
                              : 'No videos available for this module.'
                            }
                          </p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Alert variant="info">
              <div className="text-center py-4">
                <JournalText size={48} className="text-muted mb-3" />
                <h5>No Modules Available</h5>
                <p className="mb-0">This training doesn't have any modules yet.</p>
              </div>
            </Alert>
          )}
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/training')}
            size="lg"
            className="me-3"
          >
            <ArrowLeft className="me-2" />
            Back to Trainings
          </Button>
          <Button 
            variant="primary" 
            onClick={fetchTrainingDetails}
            size="lg"
          >
            Refresh
          </Button>
        </div>
      </Container>

      {/* Video Player Modal */}
      <VideoPlayer
        show={showVideoModal}
        onHide={handleCloseVideoModal}
        video={selectedVideo}
        onVideoComplete={handleVideoComplete}
      />
    </div>
  );
};

export default TrainingModules;
