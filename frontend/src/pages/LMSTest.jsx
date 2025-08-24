import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { testAPIConnection, getUserAssignedTrainings, getUserMandatoryTrainings } from '../api';

const LMSTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [trainings, setTrainings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const isConnected = await testAPIConnection();
      if (isConnected) {
        setConnectionStatus('connected');
        setSuccess('✅ Successfully connected to LMS API!');
      } else {
        setConnectionStatus('failed');
        setError('❌ Failed to connect to LMS API');
      }
    } catch (err) {
      setConnectionStatus('failed');
      setError(`❌ Connection error: ${err.message}`);
    }
    
    setLoading(false);
  };

  const fetchTrainings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const [assigned, mandatory] = await Promise.all([
        getUserAssignedTrainings(),
        getUserMandatoryTrainings()
      ]);
      
      setTrainings([...assigned, ...mandatory]);
      setSuccess(`✅ Fetched ${assigned.length + mandatory.length} trainings successfully!`);
      
    } catch (err) {
      setError(`❌ Failed to fetch trainings: ${err.message}`);
    }
    
    setLoading(false);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">LMS API Test</h2>
      
      {/* Connection Status */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Connection Status</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <span className="me-3">Status:</span>
            <span className={`badge ${
              connectionStatus === 'connected' ? 'bg-success' : 
              connectionStatus === 'failed' ? 'bg-danger' : 'bg-secondary'
            }`}>
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'failed' ? 'Failed' : 'Unknown'}
            </span>
          </div>
          
          <Button 
            variant="primary" 
            onClick={testConnection}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            Test Connection
          </Button>
        </Card.Body>
      </Card>

      {/* Fetch Trainings */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Training Data Test</h5>
        </Card.Header>
        <Card.Body>
          <Button 
            variant="success" 
            onClick={fetchTrainings}
            disabled={loading}
            className="mb-3"
          >
            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            Fetch Trainings
          </Button>
          
          {trainings.length > 0 && (
            <div>
              <h6>Found Trainings:</h6>
              <Row>
                {trainings.slice(0, 6).map((training, index) => (
                  <Col md={6} key={index} className="mb-2">
                    <Card className="border-left-primary">
                      <Card.Body className="p-3">
                        <h6 className="mb-1">{training.title || training.trainingName}</h6>
                        <small className="text-muted">
                          Type: {training.type || training.Trainingtype || 'Unknown'}
                        </small>
                        <br />
                        <small className="text-muted">
                          Progress: {training.progress || training.averageCompletionPercentage || 0}%
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              {trainings.length > 6 && (
                <small className="text-muted">...and {trainings.length - 6} more</small>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Messages */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Quick Navigation */}
      <Card>
        <Card.Header>
          <h6 className="mb-0">Quick Navigation</h6>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => window.location.href = '/training'}
            >
              Go to Training
            </Button>
            <Button 
              variant="outline-success" 
              size="sm"
              onClick={() => window.location.href = '/lms-sync-test'}
            >
              Go to LMS Sync Test
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => window.location.href = '/'}
            >
              Go to Home
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LMSTest;
