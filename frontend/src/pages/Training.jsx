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
  Alert
} from 'react-bootstrap';
import { 
  getUserAssignedTrainings, 
  getUserMandatoryTrainings,
  testAPIConnection,
  updateTrainingProgress,
  completeTraining
} from '../api';

const Training = () => {
  const [activeTab, setActiveTab] = useState('assigned');
  const [assignedTrainings, setAssignedTrainings] = useState([]);
  const [mandatoryTrainings, setMandatoryTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('unknown');

  // Get user ID from your authentication context
  // For now using a test user ID - replace with actual authenticated user
  const userId = 'user123'; // Replace with actual user ID from your auth context

  useEffect(() => {
    fetchUserTrainings();
  }, []);

  const testConnection = async () => {
    try {
      setApiStatus('testing');
      const isConnected = await testAPIConnection();
      setApiStatus(isConnected ? 'connected' : 'failed');
      
      if (isConnected) {
        await fetchUserTrainings();
      }
    } catch (err) {
      setApiStatus('failed');
      console.error('Connection test failed:', err);
    }
  };

  const fetchUserTrainings = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching trainings for user:', userId);
      
      // Fetch both assigned and mandatory trainings
      const [assignedData, mandatoryData] = await Promise.all([
        getUserAssignedTrainings(userId),
        getUserMandatoryTrainings(userId)
      ]);
      
      console.log('Assigned trainings:', assignedData);
      console.log('Mandatory trainings:', mandatoryData);
      
      setAssignedTrainings(assignedData || []);
      setMandatoryTrainings(mandatoryData || []);
      
      setApiStatus('connected');
      
    } catch (err) {
      console.error('Error fetching trainings:', err);
      setError(`Failed to fetch trainings: ${err.message}`);
      setApiStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTraining = async (training) => {
    try {
      // You can implement navigation to training content here
      console.log('Starting training:', training.title);
      // Example: navigate(`/training/${training.id}/start`);
    } catch (error) {
      console.error('Error starting training:', error);
    }
  };

  const handleUpdateProgress = async (trainingId, newProgress) => {
    try {
      await updateTrainingProgress(userId, trainingId, newProgress);
      // Refresh trainings to get updated data
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
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Fetching your trainings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-dark min-vh-100">
      {/* Header */}
      <div className="d-flex align-items-center p-3 border-bottom border-light shadow-sm bg-white">
        <Button variant="link" className="text-dark p-0 me-3">
          <span style={{ fontSize: '20px' }}>←</span>
        </Button>
        <h5 className="mb-0 fw-bold">My Trainings</h5>
      </div>

      {/* Tabs */}
      <div className="d-flex border-bottom border-light shadow-sm bg-white">
        <Button
          variant="link"
          className={`text-dark text-decoration-none flex-fill py-3 ${
            activeTab === 'assigned' ? 'border-bottom border-primary border-3 fw-bold' : 'text-muted'
          }`}
          onClick={() => setActiveTab('assigned')}
        >
          Assigned ({assignedTrainings.length})
        </Button>
        <Button
          variant="link"
          className={`text-dark text-decoration-none flex-fill py-3 ${
            activeTab === 'mandatory' ? 'border-bottom border-primary border-3 fw-bold' : 'text-muted'
          }`}
          onClick={() => setActiveTab('mandatory')}
        >
          Mandatory ({mandatoryTrainings.length})
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 bg-light">
        {/* API Status */}
        <div className="mb-3 p-3 bg-white border rounded">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0 fw-bold">Connection Status</h6>
            <Button 
              variant="outline-info" 
              size="sm" 
              onClick={testConnection}
              disabled={apiStatus === 'testing'}
            >
              {apiStatus === 'testing' ? 'Testing...' : 'Refresh'}
            </Button>
          </div>
          <div className="d-flex align-items-center">
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
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {/* Pending Trainings */}
        <div className="mb-4">
          <h6 className="text-dark fw-bold mb-3">
            Pending Trainings ({getPendingTrainings().length})
          </h6>
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
            getPendingTrainings().map((training) => {
              const deadlineStatus = getDeadlineStatus(training.deadline);
              return (
                <Card key={training.id} className="mb-3 border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1 fw-bold text-dark">{training.title}</h6>
                        {training.description && (
                          <p className="text-muted small mb-2">{training.description}</p>
                        )}
                        <small className="text-muted">
                          Assigned: {formatDate(training.assignedDate)}
                        </small>
                      </div>
                      <Badge bg={deadlineStatus.color} className="fs-6">
                        {deadlineStatus.text}
                      </Badge>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <ProgressBar 
                        now={training.progress} 
                        className="flex-grow-1 me-2"
                        style={{ height: '8px' }}
                        variant={training.progress > 75 ? 'success' : training.progress > 25 ? 'warning' : 'info'}
                      />
                      <span className="text-muted fw-bold">{training.progress}%</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-2">
                        {training.modules && training.modules.length > 0 && (
                          <small className="text-muted">
                            {training.modules.length} modules
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
              );
            })
          )}
        </div>

        {/* Completed Trainings */}
        <div className="mb-4">
          <h6 className="text-dark fw-bold mb-3">
            Completed Trainings ({getCompletedTrainings().length})
          </h6>
          {getCompletedTrainings().length === 0 ? (
            <p className="text-muted text-center">No completed trainings yet</p>
          ) : (
            getCompletedTrainings().map((training) => (
              <Card key={training.id} className="mb-3 border-0 shadow-sm bg-light">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-1 fw-bold text-dark">{training.title}</h6>
                      <small className="text-success">
                        ✓ Completed on {formatDate(training.completedDate)}
                      </small>
                    </div>
                    <Badge bg="success">100%</Badge>
                  </div>
                  
                  <ProgressBar 
                    now={100} 
                    variant="success"
                    className="mb-2"
                    style={{ height: '6px' }}
                  />
                  
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
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <Button 
            variant="outline-primary" 
            onClick={fetchUserTrainings}
            disabled={loading}
            className="me-2"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="position-fixed bottom-0 start-0 w-100 bg-white border-top border-light shadow-sm">
        <div className="d-flex justify-content-around py-2">
          <Button variant="link" className="text-muted text-decoration-none p-2">
            <span style={{ fontSize: '20px' }}>🏠</span>
          </Button>
          <Button variant="link" className="text-primary text-decoration-none p-2 border-bottom border-primary border-2 fw-bold">
            <span style={{ fontSize: '20px' }}>📚</span>
          </Button>
          <Button variant="link" className="text-muted text-decoration-none p-2">
            <span style={{ fontSize: '20px' }}>📋</span>
          </Button>
          <Button variant="link" className="text-muted text-decoration-none p-2">
            <span style={{ fontSize: '20px' }}>👤</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Training;
