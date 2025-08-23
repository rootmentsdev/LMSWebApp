import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchUserTrainings();
  }, []);

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
      
      // Fetch both assigned and mandatory trainings
      const [assignedData, mandatoryData] = await Promise.all([
        getUserAssignedTrainings(),
        getUserMandatoryTrainings()
      ]);
      
      console.log('📚 Raw assigned trainings:', assignedData);
      console.log('📚 Raw mandatory trainings:', mandatoryData);
      
      // Transform the data to match frontend expectations
      const transformedAssigned = assignedData.map(transformTrainingData);
      const transformedMandatory = mandatoryData.map(transformTrainingData);
      
      console.log('🔄 Transformed assigned trainings:', transformedAssigned);
      console.log('🔄 Transformed mandatory trainings:', transformedMandatory);
      
      // Fetch full module details for each training
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
        // Use transformed data without enhancement if enhancement fails
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
      
      // Set empty arrays to prevent blank screen
      setAssignedTrainings([]);
      setMandatoryTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartVideo = async (video) => {
    console.log('🎬 Starting video with object:', video);
    console.log('🎬 Video properties:', {
      _id: video._id,
      title: video.title,
      videoUri: video.videoUri,
      url: video.url,
      moduleName: video.moduleName,
      hasVideoUri: !!video.videoUri,
      hasUrl: !!video.url
    });
    
    if (!video) {
      console.error('❌ Invalid video object:', video);
      setError('Invalid video data. Please try again.');
      return;
    }
    
    if (video.videoUri) {
      console.log('✅ Video has URL, opening modal:', video.videoUri);
      setSelectedVideo(video);
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

  const handleStartTraining = async (training) => {
    try {
      console.log('Starting training:', training.title);
      // You can implement navigation to training content here
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

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: 'white' }}>
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="text-muted">Fetching your trainings...</p>
      </div>
    );
  }

  // Fallback UI if no trainings and no error
  if (!loading && assignedTrainings.length === 0 && mandatoryTrainings.length === 0 && !error) {
    return (
      <div className="bg-white text-dark min-vh-100">
        <div className="d-flex align-items-center p-4 border-bottom bg-white">
          <h4 className="mb-0 fw-bold text-dark">My Trainings</h4>
        </div>
        <div className="p-4 text-center">
          <div className="mb-4">
            <h5 className="text-muted">No Trainings Found</h5>
            <p className="text-muted">It looks like no trainings have been assigned to you yet.</p>
          </div>
          <div className="mb-4 p-3 bg-light border rounded">
            <h6 className="fw-bold mb-2">🔧 Debug & Testing</h6>
            <div className="row g-2 align-items-center">
              <div className="col-md-4">
                <Form.Control
                  type="text"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  placeholder="Test User ID"
                  size="sm"
                />
              </div>
              <div className="col-md-8 d-flex gap-2">
                <Button variant="outline-secondary" size="sm" onClick={() => fetchUserTrainings()}>
                  Test User
                </Button>
                <Button variant="outline-info" size="sm" onClick={testAllEndpoints}>
                  Test Endpoints
                </Button>
                <Button variant="outline-warning" size="sm" onClick={async () => {
                  setDebugInfo('Testing module endpoint...');
                  const result = await testModuleEndpoint();
                  setDebugInfo(`Module test: ${result ? 'Success' : 'Failed'}`);
                }}>
                  Test Modules
                </Button>
              </div>
            </div>
            {debugInfo && (
              <div className="mt-2 small text-muted">
                <strong>Debug:</strong> {debugInfo}
              </div>
            )}
          </div>
          <Button variant="primary" onClick={fetchUserTrainings} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Trainings'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-dark min-vh-100">
      {/* Header */}
      <div className="d-flex align-items-center p-4 border-bottom bg-white">
        <h4 className="mb-0 fw-bold text-dark">My Trainings</h4>
      </div>

      {/* Tabs */}
      <div className="d-flex border-bottom bg-white">
        <Button
          variant="link"
          className={`text-decoration-none flex-fill py-3 ${
            activeTab === 'assigned' ? 'border-bottom border-primary border-3 fw-bold text-primary' : 'text-muted'
          }`}
          onClick={() => setActiveTab('assigned')}
        >
          Assigned ({assignedTrainings.length})
        </Button>
        <Button
          variant="link"
          className={`text-decoration-none flex-fill py-3 ${
            activeTab === 'mandatory' ? 'border-bottom border-primary border-3 fw-bold text-primary' : 'text-muted'
          }`}
          onClick={() => setActiveTab('mandatory')}
        >
          Mandatory ({mandatoryTrainings.length})
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        {/* Debug Interface - Simplified */}
        <div className="mb-4 p-3 bg-light border rounded">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <Form.Control
                type="text"
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="Test User ID"
                size="sm"
              />
            </div>
            <div className="col-md-8 d-flex gap-2">
              <Button variant="outline-secondary" size="sm" onClick={() => fetchUserTrainings()}>
                Test User
              </Button>
              <Button variant="outline-info" size="sm" onClick={testAllEndpoints}>
                Test Endpoints
              </Button>
              <Button variant="outline-warning" size="sm" onClick={async () => {
                setDebugInfo('Testing module endpoint...');
                const result = await testModuleEndpoint();
                setDebugInfo(`Module test: ${result ? 'Success' : 'Failed'}`);
              }}>
                Test Modules
              </Button>
            </div>
          </div>
          {debugInfo && (
            <div className="mt-2 small text-muted">
              <strong>Debug:</strong> {debugInfo}
            </div>
          )}
        </div>

        {/* API Status */}
        <div className="mb-4 p-3 bg-light border rounded">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold">Connection Status</span>
            <Button variant="outline-info" size="sm" onClick={testConnection}>
              {apiStatus === 'testing' ? 'Testing...' : 'Refresh'}
            </Button>
          </div>
          <div className="d-flex align-items-center mt-2">
            <div 
              className={`me-2 rounded-circle ${
                apiStatus === 'connected' ? 'bg-success' : 
                apiStatus === 'failed' ? 'bg-danger' : 'bg-secondary'
              }`} 
              style={{ width: '12px', height: '12px' }}
            ></div>
            <small className="text-muted">
              {apiStatus === 'connected' ? 'Connected to LMS' : 
               apiStatus === 'failed' ? 'Connection Failed' : 'Checking...'}
            </small>
          </div>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {/* Pending Trainings */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3 text-dark">
            Pending Trainings ({getPendingTrainings().length})
          </h5>
          {getPendingTrainings().length === 0 ? (
            <Alert variant="info">
              <p className="mb-0">No pending trainings found.</p>
              <small>
                {getCurrentTrainings().length === 0 
                  ? 'No trainings have been assigned to you yet.' 
                  : 'All your trainings are completed!'
                }
              </small>
            </Alert>
          ) : (
            <Row>
              {getPendingTrainings().map((training) => {
                const deadlineStatus = getDeadlineStatus(training.deadline);
                return (
                  <Col key={training.id} lg={6} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h6 className="fw-bold text-dark mb-1">{training.title}</h6>
                          <Badge bg={deadlineStatus.color} className="fs-6">
                            {deadlineStatus.text}
                          </Badge>
                        </div>
                        
                        {training.description && (
                          <p className="text-muted small mb-3">{training.description}</p>
                        )}
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">Progress</small>
                            <small className="fw-bold">{training.progress}%</small>
                          </div>
                          <ProgressBar 
                            now={training.progress} 
                            className="mb-2"
                            style={{ height: '8px' }}
                            variant={training.progress > 75 ? 'success' : training.progress > 25 ? 'warning' : 'info'}
                          />
                        </div>

                                                                          {/* Videos Section - Enhanced Debug */}
                         {training.videos && training.videos.length > 0 ? (
                           <div className="mb-3">
                             <h6 className="fw-bold mb-2 text-dark">📹 Videos ({training.videos.length})</h6>
                             <div className="row g-2">
                               {training.videos.slice(0, 3).map((video, index) => {
                                 console.log(`🎬 Video ${index}:`, video);
                                 console.log(`🎬 Video ${index} properties:`, {
                                   _id: video._id,
                                   title: video.title,
                                   videoUri: video.videoUri,
                                   url: video.url,
                                   moduleName: video.moduleName,
                                   hasVideoUri: !!video.videoUri,
                                   hasUrl: !!video.url
                                 });
                                 return (
                                   <div key={index} className="col-12">
                                     <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded">
                                       <div className="d-flex align-items-center">
                                         <span className="text-primary me-2">▶️</span>
                                         <span className="small fw-bold">{video.title || `Video ${index + 1}`}</span>
                                       </div>
                                       <div className="d-flex align-items-center gap-2">
                                         <small className="text-muted">
                                           {video.videoUri ? '✅ Has URL' : '❌ No URL'}
                                         </small>
                                         <Button 
                                           variant="outline-primary" 
                                           size="sm"
                                           onClick={() => handleStartVideo(video)}
                                         >
                                           Watch
                                         </Button>
                                       </div>
                                     </div>
                                   </div>
                                 );
                               })}
                               {training.videos.length > 3 && (
                                 <div className="col-12">
                                   <small className="text-muted">
                                     +{training.videos.length - 3} more videos
                                   </small>
                                 </div>
                               )}
                             </div>
                           </div>
                         ) : (
                           <div className="mb-3">
                             <div className="p-2 bg-light rounded">
                               <small className="text-muted">
                                 🔍 Debug: training.videos = {JSON.stringify(training.videos)}
                               </small>
                               <br />
                               <small className="text-muted">
                                 🔍 Debug: training.moduleDetails = {training.moduleDetails ? `${training.moduleDetails.length} modules` : 'undefined'}
                               </small>
                               <br />
                               <small className="text-muted">
                                 🔍 Debug: training.userProgress = {training.userProgress ? `${training.userProgress.length} entries` : 'undefined'}
                               </small>
                             </div>
                           </div>
                         )}

                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-2">
                            {training.numberOfModules > 0 && (
                              <small className="text-muted">
                                {training.numberOfModules} modules
                              </small>
                            )}
                            <Badge 
                              bg={training.type === 'mandatory' ? 'danger' : 'primary'} 
                              className="small"
                            >
                              {training.type}
                            </Badge>
                          </div>
                          <Button 
                            variant={training.progress > 0 ? 'outline-primary' : 'primary'}
                            size="sm"
                            onClick={() => handleStartTraining(training)}
                          >
                            {training.progress > 0 ? 'Continue' : 'Start'}
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
          <h5 className="fw-bold mb-3 text-dark">
            Completed Trainings ({getCompletedTrainings().length})
          </h5>
          {getCompletedTrainings().length === 0 ? (
            <p className="text-muted text-center">No completed trainings yet</p>
          ) : (
            <Row>
              {getCompletedTrainings().map((training) => (
                <Col key={training.id} lg={6} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm bg-light">
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h6 className="fw-bold text-dark mb-1">{training.title}</h6>
                        <Badge bg="success">100%</Badge>
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">Progress</small>
                          <small className="fw-bold">100%</small>
                        </div>
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
                        <Button variant="outline-secondary" size="sm">
                          Review
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Action Buttons */}
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
      </div>

      {/* Video Player */}
      <VideoPlayer
        show={showVideoModal}
        onHide={handleCloseVideoModal}
        video={selectedVideo}
        onVideoComplete={(video) => {
          console.log('Video completed:', video);
          // You can add logic here to mark video as complete
          // or update training progress
        }}
      />
    </div>
  );
};

export default Training;
