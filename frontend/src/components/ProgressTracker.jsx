import React, { useState, useEffect } from 'react';
import { 
  Card, 
  ProgressBar, 
  Badge, 
  Button, 
  Alert,
  Row,
  Col,
  ListGroup
} from 'react-bootstrap';
import { 
  CheckCircleFill, 
  LockFill, 
  PlayFill, 
  Clock,
  Trophy
} from 'react-bootstrap-icons';

const ProgressTracker = ({ 
  modules = [], 
  userProgress = {}, 
  onVideoComplete, 
  onModuleComplete,
  currentUserId 
}) => {
  const [progress, setProgress] = useState({});
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [completedModules, setCompletedModules] = useState(new Set());

  useEffect(() => {
    // Initialize progress from user's saved progress
    if (userProgress && currentUserId) {
      setProgress(userProgress);
      setCompletedVideos(new Set(userProgress.completedVideos || []));
      setCompletedModules(new Set(userProgress.completedModules || []));
    }
  }, [userProgress, currentUserId]);

  // Check if a video is unlocked (previous video completed)
  const isVideoUnlocked = (moduleIndex, videoIndex) => {
    if (videoIndex === 0) return true; // First video is always unlocked
    
    const module = modules[moduleIndex];
    if (!module || !module.videos) return false;
    
    // Check if previous video is completed
    const previousVideo = module.videos[videoIndex - 1];
    if (!previousVideo) return false;
    
    return completedVideos.has(previousVideo._id);
  };

  // Check if a module is unlocked (previous module completed)
  const isModuleUnlocked = (moduleIndex) => {
    if (moduleIndex === 0) return true; // First module is always unlocked
    
    const previousModule = modules[moduleIndex - 1];
    if (!previousModule) return false;
    
    // Check if previous module has all videos completed
    if (!previousModule.videos || previousModule.videos.length === 0) return false;
    
    const allVideosCompleted = previousModule.videos.every(video => 
      completedVideos.has(video._id)
    );
    
    return allVideosCompleted;
  };

  // Handle video completion
  const handleVideoComplete = (videoId, moduleIndex, videoIndex) => {
    const newCompletedVideos = new Set(completedVideos);
    newCompletedVideos.add(videoId);
    setCompletedVideos(newCompletedVideos);
    
    // Update progress
    const newProgress = {
      ...progress,
      completedVideos: Array.from(newCompletedVideos),
      lastCompletedVideo: videoId,
      lastCompletedAt: new Date().toISOString()
    };
    
    setProgress(newProgress);
    
    // Save to localStorage (in real app, save to database)
    localStorage.setItem(`userProgress_${currentUserId}`, JSON.stringify(newProgress));
    
    // Call parent callback
    if (onVideoComplete) {
      onVideoComplete(videoId, moduleIndex, videoIndex);
    }
    
    // Check if module is complete
    const module = modules[moduleIndex];
    if (module && module.videos) {
      const allVideosInModuleCompleted = module.videos.every(video => 
        newCompletedVideos.has(video._id)
      );
      
      if (allVideosInModuleCompleted) {
        handleModuleComplete(module._id, moduleIndex);
      }
    }
  };

  // Handle module completion
  const handleModuleComplete = (moduleId, moduleIndex) => {
    const newCompletedModules = new Set(completedModules);
    newCompletedModules.add(moduleId);
    setCompletedModules(newCompletedModules);
    
    // Update progress
    const newProgress = {
      ...progress,
      completedModules: Array.from(newCompletedModules),
      lastCompletedModule: moduleId,
      lastCompletedAt: new Date().toISOString()
    };
    
    setProgress(newProgress);
    
    // Save to localStorage
    localStorage.setItem(`userProgress_${currentUserId}`, JSON.stringify(newProgress));
    
    // Call parent callback
    if (onModuleComplete) {
      onModuleComplete(moduleId, moduleIndex);
    }
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    let totalVideos = 0;
    let completedVideosCount = 0;
    
    modules.forEach(module => {
      if (module.videos) {
        totalVideos += module.videos.length;
        module.videos.forEach(video => {
          if (completedVideos.has(video._id)) {
            completedVideosCount++;
          }
        });
      }
    });
    
    return totalVideos > 0 ? (completedVideosCount / totalVideos) * 100 : 0;
  };

  // Get module progress
  const getModuleProgress = (module) => {
    if (!module.videos || module.videos.length === 0) return 0;
    
    let completedCount = 0;
    module.videos.forEach(video => {
      if (completedVideos.has(video._id)) {
        completedCount++;
      }
    });
    
    return (completedCount / module.videos.length) * 100;
  };

  // Get next available video
  const getNextAvailableVideo = () => {
    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
      const module = modules[moduleIndex];
      if (!isModuleUnlocked(moduleIndex)) continue;
      
      if (module.videos) {
        for (let videoIndex = 0; videoIndex < module.videos.length; videoIndex++) {
          if (isVideoUnlocked(moduleIndex, videoIndex) && 
              !completedVideos.has(module.videos[videoIndex]._id)) {
            return { moduleIndex, videoIndex, video: module.videos[videoIndex] };
          }
        }
      }
    }
    return null;
  };

  const overallProgress = calculateOverallProgress();
  const nextVideo = getNextAvailableVideo();

  return (
    <div className="progress-tracker">
      {/* Overall Progress */}
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <Trophy className="me-2" />
            Learning Progress
          </h5>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold">Overall Progress</span>
                <span className="text-muted">{Math.round(overallProgress)}%</span>
              </div>
              <ProgressBar 
                now={overallProgress} 
                variant="success" 
                className="mb-2"
              />
              <small className="text-muted">
                {completedVideos.size} of {modules.reduce((total, m) => total + (m.videos?.length || 0), 0)} videos completed
              </small>
            </Col>
            <Col xs="auto">
              {nextVideo && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    // This would typically navigate to the next video
                    console.log('Next video:', nextVideo);
                  }}
                >
                  <PlayFill className="me-1" />
                  Continue Learning
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Module Progress */}
      <div className="modules-progress">
        {modules.map((module, moduleIndex) => {
          const isUnlocked = isModuleUnlocked(moduleIndex);
          const moduleProgress = getModuleProgress(module);
          const isCompleted = moduleProgress === 100;
          
          return (
                         <Card 
               key={`progress-module-${currentUserId}-${moduleIndex}-${module._id || moduleIndex}`} 
               className={`mb-3 ${!isUnlocked ? 'opacity-50' : ''}`}
             >
              <Card.Header className={`d-flex justify-content-between align-items-center ${
                isCompleted ? 'bg-success text-white' : 
                isUnlocked ? 'bg-primary text-white' : 'bg-secondary text-white'
              }`}>
                <div className="d-flex align-items-center">
                  {isCompleted ? (
                    <CheckCircleFill className="me-2" />
                  ) : !isUnlocked ? (
                    <LockFill className="me-2" />
                  ) : (
                    <PlayFill className="me-2" />
                  )}
                  <span className="fw-bold">
                    {module.title || `Module ${moduleIndex + 1}`}
                  </span>
                </div>
                <Badge bg={isCompleted ? 'light' : 'secondary'}>
                  {isCompleted ? 'Completed' : 
                   !isUnlocked ? 'Locked' : `${Math.round(moduleProgress)}%`}
                </Badge>
              </Card.Header>
              
              {isUnlocked && (
                <Card.Body>
                  <ProgressBar 
                    now={moduleProgress} 
                    variant={isCompleted ? 'success' : 'primary'}
                    className="mb-3"
                  />
                  
                  {module.videos && module.videos.length > 0 && (
                    <ListGroup variant="flush">
                      {module.videos.map((video, videoIndex) => {
                        const videoUnlocked = isVideoUnlocked(moduleIndex, videoIndex);
                        const isVideoCompleted = completedVideos.has(video._id);
                        
                                                 return (
                           <ListGroup.Item 
                             key={`progress-video-${currentUserId}-${moduleIndex}-${videoIndex}-${video._id || videoIndex}`}
                             className={`d-flex justify-content-between align-items-center ${
                               !videoUnlocked ? 'text-muted' : ''
                             }`}
                           >
                            <div className="d-flex align-items-center">
                              {isVideoCompleted ? (
                                <CheckCircleFill className="text-success me-2" />
                              ) : !videoUnlocked ? (
                                <LockFill className="text-muted me-2" />
                              ) : (
                                <PlayFill className="text-primary me-2" />
                              )}
                              <span className={!videoUnlocked ? 'text-muted' : ''}>
                                {video.title || `Video ${videoIndex + 1}`}
                              </span>
                            </div>
                            
                            <div className="d-flex align-items-center">
                              {video.duration && (
                                <small className="text-muted me-2">
                                  <Clock className="me-1" />
                                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                </small>
                              )}
                              
                              {videoUnlocked && !isVideoCompleted && (
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => {
                                    // This would open the video player
                                    console.log('Open video:', video);
                                  }}
                                >
                                  <PlayFill className="me-1" />
                                  Watch
                                </Button>
                              )}
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  )}
                </Card.Body>
              )}
            </Card>
          );
        })}
      </div>

      {/* Progress Summary */}
      <Card className="mt-4">
        <Card.Body>
          <Row>
            <Col md={4} className="text-center">
              <h4 className="text-primary">{completedVideos.size}</h4>
              <small className="text-muted">Videos Completed</small>
            </Col>
            <Col md={4} className="text-center">
              <h4 className="text-success">{completedModules.size}</h4>
              <small className="text-muted">Modules Completed</small>
            </Col>
            <Col md={4} className="text-center">
              <h4 className="text-info">{Math.round(overallProgress)}%</h4>
              <small className="text-muted">Overall Progress</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProgressTracker;
