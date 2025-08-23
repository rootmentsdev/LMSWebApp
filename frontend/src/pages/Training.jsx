import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge,
  ProgressBar,
  Spinner,
  Alert,
  Form,
  Modal
} from 'react-bootstrap';
import { 
  PlayFill, 
  CheckCircleFill, 
  LockFill,
  X,
  JournalText,
  ArrowLeft
} from 'react-bootstrap-icons';
import { 
  getUserAssignedTrainings, 
  getUserMandatoryTrainings,
  testAPIConnection,
  updateTrainingProgress,
  completeTraining,
  testEndpoints,
  transformTrainingData,
  getTrainingWithModules,
  testModuleEndpoint,
  getModuleVideoUrls
} from '../api';
import VideoPlayer from '../components/VideoPlayer';


const Training = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assigned');
  const [assignedTrainings, setAssignedTrainings] = useState([]);
  const [mandatoryTrainings, setMandatoryTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('unknown');
  const [testUserId, setTestUserId] = useState('user123');
  const [debugInfo, setDebugInfo] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [userProgress, setUserProgress] = useState({});
  const [currentUserId] = useState('user123');
  const [inlineVideo, setInlineVideo] = useState(null);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showModulesView, setShowModulesView] = useState(false);

  useEffect(() => {
    fetchUserTrainings();
  }, []);

  // Load user progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`userProgress_${currentUserId}`);
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        setUserProgress(parsedProgress);
        console.log('📊 Loaded user progress:', parsedProgress);
      } catch (err) {
        console.error('Error parsing saved progress:', err);
      }
    }
  }, [currentUserId]);

  const testConnection = async () => {
    try {
      setApiStatus('testing');
      setDebugInfo('Testing API connection...');
      
      const isConnected = await testAPIConnection();
      setApiStatus(isConnected ? 'connected' : 'failed');
      
      if (isConnected) {
        setDebugInfo('API connection successful! Fetching trainings...');
        await fetchUserTrainings();
      } else {
        setDebugInfo('API connection failed. Check the URL and authentication.');
      }
    } catch (err) {
      setApiStatus('failed');
      setDebugInfo(`Connection test failed: ${err.message}`);
      console.error('Connection test failed:', err);
    }
  };

  const testAllEndpoints = async () => {
    try {
      setDebugInfo('Testing all available endpoints...');
      await testEndpoints();
      setDebugInfo('Endpoint testing completed. Check console for results.');
    } catch (err) {
      setDebugInfo(`Endpoint testing failed: ${err.message}`);
      console.error('Endpoint testing failed:', err);
    }
  };

  const fetchUserTrainings = async () => {
    try {
      setLoading(true);
      setError('');
      setDebugInfo('Fetching trainings from your API...');
      
      console.log('🔍 Fetching trainings...');
      
      const [assignedData, mandatoryData] = await Promise.all([
        getUserAssignedTrainings(),
        getUserMandatoryTrainings()
      ]);
      
      console.log('📚 Raw assigned trainings:', assignedData);
      console.log('📚 Raw mandatory trainings:', mandatoryData);
      
      const transformedAssigned = assignedData.map(transformTrainingData);
      const transformedMandatory = mandatoryData.map(transformTrainingData);
      
      console.log('🔄 Transformed assigned trainings:', transformedAssigned);
      console.log('🔄 Transformed mandatory trainings:', transformedMandatory);
      
      try {
        const enhancedAssigned = await Promise.all(
          transformedAssigned.map(training => getTrainingWithModules(training))
        );
        
        const enhancedMandatory = await Promise.all(
          transformedMandatory.map(training => getTrainingWithModules(training))
        );
        
        console.log('🎥 Enhanced assigned trainings with videos:', enhancedAssigned);
        console.log('🎥 Enhanced mandatory trainings with videos:', enhancedMandatory);
        
        setAssignedTrainings(enhancedAssigned || []);
        setMandatoryTrainings(enhancedMandatory || []);
      } catch (enhancementError) {
        console.error('❌ Error enhancing trainings:', enhancementError);
        setAssignedTrainings(transformedAssigned || []);
        setMandatoryTrainings(transformedMandatory || []);
        setDebugInfo('Videos may not display due to enhancement error. Check console for details.');
      }
      
      setApiStatus('connected');
      setDebugInfo(`Successfully fetched ${transformedAssigned?.length || 0} assigned and ${transformedMandatory?.length || 0} mandatory trainings`);
      
    } catch (err) {
      console.error('❌ Error fetching trainings:', err);
      setError(`Failed to fetch trainings: ${err.message}`);
      setApiStatus('failed');
      setDebugInfo(`Error: ${err.message}`);
      
      setAssignedTrainings([]);
      setMandatoryTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartVideo = async (video) => {
    console.log('🎬 Starting video with object:', video);
    
    if (!video) {
      console.error('❌ Invalid video object:', video);
      setError('Invalid video data. Please try again.');
      return;
    }
    
    if (video.videoUri) {
      console.log('✅ Video has URL, opening modal:', video.videoUri);
      setSelectedVideo({
        ...video,
        trainingId: selectedTraining?._id || selectedTraining?.id
      });
      setShowVideoModal(true);
    } else {
      console.error('❌ No video URL available for:', video._id);
      setError('Video URL not available. Please check with your administrator.');
    }
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const handleVideoComplete = (video, moduleIndex, videoIndex) => {
    console.log('🎯 Video completed:', video, 'Module:', moduleIndex, 'Video:', videoIndex);
    
    // Get the current training context (we need to find which training this video belongs to)
    let currentTraining = null;
    if (inlineVideo && inlineVideo.trainingId) {
      currentTraining = inlineVideo.trainingId;
    } else if (selectedVideo && selectedVideo.trainingId) {
      currentTraining = selectedVideo.trainingId;
    }
    
    if (currentTraining) {
      // Create training-specific progress tracking
      const trainingProgressKey = `training_${currentTraining}`;
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
    } else {
      // Fallback to global progress if no training context
      const newProgress = {
        ...userProgress,
        completedVideos: [...(userProgress.completedVideos || []), video._id],
        lastCompletedAt: new Date().toISOString()
      };
      
      setUserProgress(newProgress);
      localStorage.setItem(`userProgress_${currentUserId}`, JSON.stringify(newProgress));
    }
    
    // Show success message
    alert(`🎉 Congratulations! You've completed "${video.title}"`);
    
    // Close video modal
    handleCloseVideoModal();
  };

  const handleInlineVideo = (video, moduleIndex, videoIndex) => {
    console.log('🎬 Playing inline video:', video);
    console.log('🎬 Video details:', {
      title: video.title,
      videoUri: video.videoUri,
      url: video.url,
      _id: video._id,
      moduleIndex,
      videoIndex
    });
    
    // Check if video has a valid URL
    if (!video.videoUri && !video.url) {
      setError('No video URL available. Please check the video configuration.');
      return;
    }
    
    setInlineVideo({
      ...video,
      moduleIndex,
      videoIndex,
      trainingId: selectedTraining?._id || selectedTraining?.id
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
      
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`;
    }
    
    if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      return url;
    }
    
    return url;
  };

  const handleModuleComplete = (moduleId, moduleIndex) => {
    console.log('🏆 Module completed:', moduleId, 'Index:', moduleIndex);
    
    const newProgress = {
      ...userProgress,
      completedModules: [...(userProgress.completedModules || []), moduleId],
      lastCompletedModule: moduleId,
      lastCompletedAt: new Date().toISOString()
    };
    
    setUserProgress(newProgress);
    localStorage.setItem(`userProgress_${currentUserId}`, JSON.stringify(newProgress));
    
    alert(`🎊 Module completed! You can now access the next module.`);
  };

  const isVideoUnlocked = (moduleIndex, videoIndex, training) => {
    if (videoIndex === 0) return true;
    
    if (!training || !training.moduleDetails || !training.moduleDetails[moduleIndex]) return false;
    
    const module = training.moduleDetails[moduleIndex];
    if (!module.videos || videoIndex === 0) return true;
    
    const previousVideo = module.videos[videoIndex - 1];
    if (!previousVideo) return false;
    
    // Use training-specific progress
    const trainingProgressKey = `training_${training._id || training.id}`;
    const trainingProgress = userProgress[trainingProgressKey] || {};
    return trainingProgress.completedVideos?.includes(previousVideo._id) || false;
  };

  const isModuleUnlocked = (moduleIndex, training) => {
    if (moduleIndex === 0) return true;
    
    if (!training || !training.moduleDetails || !training.moduleDetails[moduleIndex - 1]) return false;
    
    const previousModule = training.moduleDetails[moduleIndex - 1];
    if (!previousModule.videos) return false;
    
    // Check if all videos in previous module are completed
    // Use training-specific progress
    const trainingProgressKey = `training_${training._id || training.id}`;
    const trainingProgress = userProgress[trainingProgressKey] || {};
    return previousModule.videos.every(video => 
      trainingProgress.completedVideos?.includes(video._id)
    );
  };

  const handleStartTraining = async (training) => {
    try {
      console.log('Starting training:', training.title);
      setSelectedTraining(training);
      setShowModulesView(true);
    } catch (error) {
      console.error('Error starting training:', error);
    }
  };

  const handleViewModule = async (module) => {
    try {
      console.log('Viewing module:', module.moduleName);
      console.log('Module videos:', module.videos);
    } catch (error) {
      console.error('Error viewing module:', error);
    }
  };

  const handleUpdateProgress = async (trainingId, newProgress) => {
    try {
      await updateTrainingProgress(trainingId, newProgress);
      await fetchUserTrainings();
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to update training progress');
    }
  };

  const getCurrentTrainings = () => {
    return activeTab === 'assigned' ? assignedTrainings : mandatoryTrainings;
  };

  const getPendingTrainings = () => {
    return getCurrentTrainings().filter(training => 
      training.status !== 'completed' && training.progress < 100
    );
  };

  const getCompletedTrainings = () => {
    return getCurrentTrainings().filter(training => 
      training.status === 'completed' || training.progress >= 100
    );
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return { color: 'secondary', text: 'No deadline' };
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { color: 'danger', text: 'Overdue' };
    } else if (diffDays <= 2) {
      return { color: 'danger', text: `${diffDays} days left` };
    } else if (diffDays <= 5) {
      return { color: 'warning', text: `${diffDays} days left` };
    } else {
      return { color: 'success', text: `${diffDays} days left` };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleBackToTrainings = () => {
    setShowModulesView(false);
    setSelectedTraining(null);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="border" role="status" className="mb-3" style={{ color: '#20c997' }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="text-muted">Fetching your trainings...</p>
      </div>
    );
  }

  // Show module details view when training is selected
  if (showModulesView && selectedTraining) {
    return (
      <div className="bg-light min-vh-100">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <Container fluid>
            <div className="d-flex align-items-center py-3">
              <Button 
                variant="link" 
                className="text-decoration-none p-0 me-3"
                onClick={handleBackToTrainings}
              >
                <ArrowLeft size={24} />
              </Button>
              <div>
                <h5 className="mb-0 fw-bold">{selectedTraining.title}</h5>
                <small className="text-muted">Training Modules</small>
              </div>
            </div>
          </Container>
        </div>

        {/* Module Cards */}
        <Container className="py-4">
          <Row className="g-4">
            {selectedTraining.moduleDetails && selectedTraining.moduleDetails.map((module, moduleIndex) => {
              const moduleUnlocked = isModuleUnlocked(moduleIndex, selectedTraining);
                                            const completedVideos = module.videos ? module.videos.filter(video => {
                                // Use training-specific progress
                                const trainingProgressKey = `training_${selectedTraining._id || selectedTraining.id}`;
                                const trainingProgress = userProgress[trainingProgressKey] || {};
                                return trainingProgress.completedVideos?.includes(video._id);
                              }).length : 0;
              const totalVideos = module.videos ? module.videos.length : 0;
              const moduleProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

              return (
                <Col key={`module-${moduleIndex}`} xs={12}>
                  <Card className={`h-100 border-0 shadow-sm ${!moduleUnlocked ? 'opacity-75' : ''}`}>
                    <Card.Body className="p-4">
                      {/* Module Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="fw-bold mb-1">
                            Module {String(moduleIndex + 1).padStart(2, '0')}
                          </h6>
                          <p className="text-muted small mb-0">
                            {module.title || `Module ${moduleIndex + 1}`}
                          </p>
                          {module.description && (
                            <p className="text-muted small mt-1 mb-0">{module.description}</p>
                          )}
                        </div>
                        <div className="text-end">
                          <Badge 
                            bg={moduleProgress === 100 ? 'success' : moduleProgress > 0 ? 'warning' : 'secondary'}
                            className="mb-2"
                          >
                            {moduleProgress === 100 ? 'Completed' : moduleUnlocked ? `${Math.round(moduleProgress)}%` : 'Locked'}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">Progress</small>
                          <small className="fw-bold">{Math.round(moduleProgress)}% Completed</small>
                        </div>
                        <ProgressBar 
                          now={moduleProgress} 
                          className="mb-2"
                          style={{ height: '6px' }}
                          variant={moduleProgress === 100 ? 'success' : moduleProgress > 0 ? 'info' : 'secondary'}
                        />
                      </div>

                      {/* Module Content */}
                      {moduleUnlocked ? (
                        <>
                          {/* Topic List */}
                          {module.videos && module.videos.length > 0 && (
                            <div className="mb-3">
                              <h6 className="fw-semibold mb-2 small text-uppercase text-muted">
                                Topics ({totalVideos})
                              </h6>
                              <div className="d-grid gap-2">
                                {module.videos.map((video, videoIndex) => {
                                  const videoUnlocked = isVideoUnlocked(moduleIndex, videoIndex, selectedTraining);
                                  const isVideoCompleted = (() => {
                                    // Use training-specific progress
                                    const trainingProgressKey = `training_${selectedTraining._id || selectedTraining.id}`;
                                    const trainingProgress = userProgress[trainingProgressKey] || {};
                                    return trainingProgress.completedVideos?.includes(video._id);
                                  })();

                                  return (
                                    <Card key={`topic-${videoIndex}`} className="border">
                                      <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div className="flex-grow-1">
                                            <h6 className="mb-1 fw-semibold">
                                              {video.title || `Topic ${videoIndex + 1}`}
                                            </h6>
                                            <small className="text-muted">
                                              Duration: {video.duration || '15'} min
                                            </small>
                                          </div>
                                          <div>
                                            {isVideoCompleted ? (
                                              <Badge bg="success">
                                                <CheckCircleFill className="me-1" />
                                                Resume
                                              </Badge>
                                            ) : videoUnlocked ? (
                                              <Button 
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleInlineVideo(video, moduleIndex, videoIndex)}
                                              >
                                                Watch Now
                                              </Button>
                                            ) : (
                                              <Badge bg="secondary">
                                                <LockFill className="me-1" />
                                                Locked
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="mt-4 d-flex gap-2">
                            <Button 
                              variant={moduleProgress > 0 ? 'outline-success' : 'success'}
                              className="flex-grow-1"
                              onClick={() => {
                                if (module.videos && module.videos.length > 0) {
                                  const firstUncompletedVideo = module.videos.find(video => 
                                    !userProgress.completedVideos?.includes(video._id)
                                  );
                                  if (firstUncompletedVideo) {
                                    handleInlineVideo(firstUncompletedVideo, moduleIndex, 0);
                                  }
                                }
                              }}
                            >
                              {moduleProgress > 0 ? 'Continue Training' : 'Start Training'}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <LockFill size={32} className="text-muted mb-2" />
                          <p className="text-muted mb-0">
                            Complete the previous module to unlock this content
                          </p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>

        {/* Inline Video Player */}
        {inlineVideo && (
          <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
            <div className="bg-white rounded shadow" style={{ width: '90%', maxWidth: '800px' }}>
                             <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                 <h5 className="mb-0">🎬 {inlineVideo.title || 'Video'}</h5>
                 <Button 
                   variant="light" 
                   size="sm" 
                   onClick={closeInlineVideo}
                 >
                   <X />
                 </Button>
               </div>
               {/* Debug Info */}
               <div className="px-3 py-2 bg-light border-bottom small">
                 <div className="row">
                   <div className="col-md-6">
                     <strong>Video URI:</strong> {inlineVideo.videoUri || 'Not available'}
                   </div>
                   <div className="col-md-6">
                     <strong>URL:</strong> {inlineVideo.url || 'Not available'}
                   </div>
                 </div>
                 <div className="row mt-1">
                   <div className="col-md-6">
                     <strong>Module:</strong> {inlineVideo.moduleIndex + 1}
                   </div>
                   <div className="col-md-6">
                     <strong>Video:</strong> {inlineVideo.videoIndex + 1}
                   </div>
                 </div>
               </div>
                             <div className="ratio ratio-16x9">
                 {inlineVideo.videoUri && (
                   inlineVideo.videoUri.includes('youtube.com') || inlineVideo.videoUri.includes('youtu.be') ? (
                     <iframe
                       src={processVideoUrl(inlineVideo.videoUri)}
                       title={inlineVideo.title || 'Video'}
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
                       <div className="mt-2">
                         <Button 
                           variant="outline-primary" 
                           size="sm"
                           onClick={() => {
                             console.log('Video debug info:', inlineVideo);
                             alert(`Video Debug Info:\nTitle: ${inlineVideo.title}\nURI: ${inlineVideo.videoUri}\nURL: ${inlineVideo.url}`);
                           }}
                         >
                           Debug Info
                         </Button>
                       </div>
                     </div>
                   </div>
                 )}
               </div>
              <div className="p-3 border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">
                      Module {inlineVideo.moduleIndex + 1}, Video {inlineVideo.videoIndex + 1}
                    </small>
                  </div>
                                     <div className="d-flex align-items-center gap-2">
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
                     <small className="text-muted">
                       ⚠️ Make sure you've watched the video before marking as complete
                     </small>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main training list view
  if (!loading && assignedTrainings.length === 0 && mandatoryTrainings.length === 0 && !error) {
    return (
      <div className="bg-light min-vh-100">
        <div className="bg-white shadow-sm">
          <Container fluid>
            <div className="py-3">
              <h4 className="mb-0 fw-bold">Trainings</h4>
            </div>
          </Container>
        </div>
        <Container className="py-4 text-center">
          <div className="mb-4">
            <h5 className="text-muted">No Trainings Found</h5>
            <p className="text-muted">It looks like no trainings have been assigned to you yet.</p>
          </div>
          <Button variant="primary" onClick={fetchUserTrainings} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Trainings'}
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <Container fluid>
          <div className="py-3">
            <h4 className="mb-0 fw-bold">Trainings</h4>
          </div>
        </Container>
      </div>

      {/* Tabs */}
      <div className="bg-white border-bottom">
        <Container fluid>
          <div className="d-flex">
            <Button
              variant="link"
              className={`text-decoration-none flex-fill py-3 border-0 ${
                activeTab === 'assigned' ? 'border-bottom border-success border-3 fw-bold text-success' : 'text-muted'
              }`}
              onClick={() => setActiveTab('assigned')}
            >
              Assigned ({assignedTrainings.length})
            </Button>
            <Button
              variant="link"
              className={`text-decoration-none flex-fill py-3 border-0 ${
                activeTab === 'mandatory' ? 'border-bottom border-success border-3 fw-bold text-success' : 'text-muted'
              }`}
              onClick={() => setActiveTab('mandatory')}
            >
              Mandatory ({mandatoryTrainings.length})
            </Button>
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container className="py-4">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {/* Pending Trainings */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3">
            Pending Trainings ({getPendingTrainings().length})
          </h5>
          {getPendingTrainings().length === 0 ? (
            <Alert variant="info" className="text-center">
              <p className="mb-0">No pending trainings found.</p>
              <small>
                {getCurrentTrainings().length === 0 
                  ? 'No trainings have been assigned to you yet.' 
                  : 'All your trainings are completed!'
                }
              </small>
            </Alert>
          ) : (
            <Row className="g-4">
              {getPendingTrainings().map((training, trainingIndex) => {
                const deadlineStatus = getDeadlineStatus(training.deadline);
                const uniqueTrainingId = training.id || training._id || `training-${trainingIndex}`;
                
                return (
                  <Col key={`training-${uniqueTrainingId}-${trainingIndex}`} xs={12} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="p-4">
                        {/* Training Header */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 className="fw-bold mb-1">{training.title}</h6>
                            {training.description && (
                              <p className="text-muted small mb-0">{training.description}</p>
                            )}
                          </div>
                          <Badge bg={deadlineStatus.color} className="ms-2">
                            {deadlineStatus.text}
                          </Badge>
                        </div>
                        
                        {/* Progress */}
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">Complete each training module and its assessment to test your understanding. Go to track!</small>
                            <small className="fw-bold">{training.progress}% Completed</small>
                          </div>
                          <ProgressBar 
                            now={training.progress} 
                            className="mb-2"
                            style={{ height: '8px' }}
                            variant={training.progress > 75 ? 'success' : training.progress > 25 ? 'warning' : 'info'}
                          />
                        </div>

                        {/* Module Count and Type */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center gap-2">
                            {training.moduleDetails && (
                              <small className="text-muted">
                                📚 {training.moduleDetails.length} modules
                              </small>
                            )}
                            <Badge 
                              bg={training.type === 'mandatory' ? 'danger' : 'primary'} 
                              className="small"
                            >
                              {training.type}
                            </Badge>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="d-grid">
                          <Button 
                            variant={training.progress > 0 ? 'outline-success' : 'success'}
                            onClick={() => handleStartTraining(training)}
                          >
                            {training.progress > 0 ? 'Continue Training' : 'Start Training'}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>

        {/* Completed Trainings */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3">
            Completed Trainings ({getCompletedTrainings().length})
          </h5>
          {getCompletedTrainings().length === 0 ? (
            <p className="text-muted text-center">No completed trainings yet</p>
          ) : (
            <Row className="g-4">
              {getCompletedTrainings().map((training, trainingIndex) => {
                const uniqueCompletedTrainingId = training.id || training._id || `completed-training-${trainingIndex}`;
                return (
                  <Col key={`completed-training-${uniqueCompletedTrainingId}-${trainingIndex}`} xs={12} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm bg-light">
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 className="fw-bold mb-1">{training.title}</h6>
                            {training.description && (
                              <p className="text-muted small mb-0">{training.description}</p>
                            )}
                          </div>
                          <Badge bg="success">Completed</Badge>
                        </div>
                        
                        <div className="mb-3">
                          <ProgressBar 
                            now={100} 
                            variant="success"
                            style={{ height: '8px' }}
                          />
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <Badge 
                            bg={training.type === 'mandatory' ? 'danger' : 'primary'} 
                            className="small"
                          >
                            {training.type}
                          </Badge>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleStartTraining(training)}
                          >
                            Review
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <Button 
            variant="outline-primary" 
            onClick={fetchUserTrainings}
            disabled={loading}
            size="lg"
          >
            {loading ? 'Refreshing...' : 'Refresh Trainings'}
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

export default Training;
