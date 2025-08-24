import React, { useState } from 'react';
import { Container, Card, Button, Alert, Form, Row, Col } from 'react-bootstrap';
import { 
  syncVideoCompletionToLMS, 
  testLMSConnection, 
  getPendingLMSSyncData, 
  clearPendingLMSSyncData,
  batchSyncToLMS 
} from '../api';
import { config } from '../config';

const LMSSyncTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Load employee data
  React.useEffect(() => {
    const storedEmployeeData = localStorage.getItem("employeeData");
    if (storedEmployeeData) {
      try {
        setCurrentEmployee(JSON.parse(storedEmployeeData));
      } catch (err) {
        console.error('Error parsing employee data:', err);
      }
    }
  }, []);

  const addResult = (result) => {
    setResults(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      ...result
    }, ...prev]);
  };

  const testConnection = async () => {
    setLoading(true);
    addResult({ type: 'info', message: 'Testing LMS connection...' });
    
    try {
      const result = await testLMSConnection();
      addResult({
        type: result.success ? 'success' : 'danger',
        message: `Connection test: ${result.success ? 'SUCCESS' : 'FAILED'}`,
        details: result
      });
    } catch (error) {
      addResult({
        type: 'danger',
        message: 'Connection test error',
        details: error.message
      });
    }
    
    setLoading(false);
  };

  const testSync = async () => {
    if (!currentEmployee) {
      addResult({
        type: 'danger',
        message: 'No employee data found. Please login first.'
      });
      return;
    }

    setLoading(true);
    addResult({ type: 'info', message: 'Testing video completion sync...' });
    
    try {
      const testData = {
        employeeId: currentEmployee.employeeId,
        trainingId: 'test-training-123',
        moduleId: 'test-module-456',
        videoId: 'test-video-789',
        videoTitle: 'Test Video Completion',
        completedAt: new Date().toISOString(),
        watchDuration: 120,
        employeeName: currentEmployee.name,
        trainingTitle: 'Test Training'
      };

      addResult({
        type: 'info',
        message: 'Sending test data to LMS...',
        details: testData
      });

      const result = await syncVideoCompletionToLMS(testData);
      
      addResult({
        type: result.success ? 'success' : 'warning',
        message: `Sync test: ${result.success ? 'SUCCESS' : 'FAILED'}`,
        details: result
      });

      if (result.corsIssue) {
        addResult({
          type: 'info',
          message: 'CORS issue detected - this is normal in development. Check production deployment.'
        });
      }

    } catch (error) {
      addResult({
        type: 'danger',
        message: 'Sync test error',
        details: error.message
      });
    }
    
    setLoading(false);
  };

  const viewPendingSync = () => {
    const pending = getPendingLMSSyncData();
    addResult({
      type: 'info',
      message: `Found ${pending.length} pending sync items`,
      details: pending
    });
  };

  const clearPending = () => {
    clearPendingLMSSyncData();
    addResult({
      type: 'success',
      message: 'Cleared all pending sync data'
    });
  };

  const runBatchSync = async () => {
    setLoading(true);
    addResult({ type: 'info', message: 'Running batch sync...' });
    
    try {
      const result = await batchSyncToLMS();
      addResult({
        type: result.synced > 0 ? 'success' : 'info',
        message: `Batch sync complete: ${result.synced}/${result.total} items synced`,
        details: result
      });
    } catch (error) {
      addResult({
        type: 'danger',
        message: 'Batch sync error',
        details: error.message
      });
    }
    
    setLoading(false);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">LMS Sync Testing Tool</h2>
      
      {/* Current Configuration */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Current Configuration</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="mb-2">
                <strong>LMS Environment:</strong> {config.LMS_ENVIRONMENT}
              </div>
              <div className="mb-2">
                <strong>Sync Enabled:</strong> {config.LMS_SYNC_ENABLED ? 'Yes' : 'No'}
              </div>
              <div className="mb-2">
                <strong>Current Employee:</strong> {currentEmployee ? currentEmployee.name : 'Not logged in'}
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-2">
                <strong>Employee ID:</strong> {currentEmployee ? currentEmployee.employeeId : 'N/A'}
              </div>
              <div className="mb-2">
                <strong>LMS URL:</strong> 
                <small className="d-block text-muted">
                  {config.LMS_ENVIRONMENT === 'production' && config.LMS_SYNC_BASE_URL}
                  {config.LMS_ENVIRONMENT === 'test' && config.LMS_SYNC_TEST_URL}
                  {config.LMS_ENVIRONMENT === 'local' && config.LMS_SYNC_LOCAL_URL}
                  {config.LMS_SYNC_ENDPOINT}
                </small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Test Controls */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Test Controls</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-wrap gap-2">
            <Button 
              variant="primary" 
              onClick={testConnection}
              disabled={loading}
            >
              Test Connection
            </Button>
            <Button 
              variant="success" 
              onClick={testSync}
              disabled={loading || !currentEmployee}
            >
              Test Video Sync
            </Button>
            <Button 
              variant="info" 
              onClick={viewPendingSync}
              disabled={loading}
            >
              View Pending
            </Button>
            <Button 
              variant="warning" 
              onClick={runBatchSync}
              disabled={loading}
            >
              Run Batch Sync
            </Button>
            <Button 
              variant="outline-danger" 
              onClick={clearPending}
              disabled={loading}
            >
              Clear Pending
            </Button>
          </div>
          
          {!currentEmployee && (
            <Alert variant="warning" className="mt-3 mb-0">
              <strong>Note:</strong> Please login first to test with real employee data.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Results */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Test Results</h5>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setResults([])}
          >
            Clear Results
          </Button>
        </Card.Header>
        <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div className="text-muted text-center py-3">
              No test results yet. Run a test above to see results.
            </div>
          ) : (
            results.map((result, index) => (
              <Alert 
                key={index} 
                variant={result.type} 
                className="mb-2"
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{result.message}</strong>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-muted small">
                          View Details
                        </summary>
                        <pre className="small mt-2 mb-0" style={{ fontSize: '11px' }}>
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <small className="text-muted">{result.timestamp}</small>
                </div>
              </Alert>
            ))
          )}
        </Card.Body>
      </Card>

      {/* Instructions */}
      <Card className="mt-4">
        <Card.Header>
          <h6 className="mb-0">How to Use This Tool</h6>
        </Card.Header>
        <Card.Body>
          <ol className="mb-0">
            <li><strong>Test Connection:</strong> Verify if the LMS endpoint is reachable</li>
            <li><strong>Test Video Sync:</strong> Send a test video completion to LMS</li>
            <li><strong>View Pending:</strong> See any sync requests that failed and are waiting to retry</li>
            <li><strong>Run Batch Sync:</strong> Retry all pending sync requests</li>
            <li><strong>Clear Pending:</strong> Remove all pending sync data</li>
          </ol>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LMSSyncTest;
