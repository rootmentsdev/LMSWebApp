import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Modal, 
  Form, 
  Alert, 
  Badge,
  Table
} from 'react-bootstrap';
import { assignAssessmentToUser } from '../api';

const Assessment = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  
  // Form states
  const [assignForm, setAssignForm] = useState({
    userId: '',
    assessmentId: '',
    deadline: ''
  });

  // Mock assessments data (since API doesn't provide listing)
  useEffect(() => {
    // Simulate loading mock data
    setLoading(true);
    setTimeout(() => {
      const mockAssessments = [
        {
          id: 'assess_001',
          title: 'JavaScript Fundamentals',
          type: 'quiz',
          duration: '30 minutes',
          questions: 25,
          passingScore: 70,
          status: 'active'
        },
        {
          id: 'assess_002',
          title: 'React Development',
          type: 'practical',
          duration: '2 hours',
          questions: 15,
          passingScore: 80,
          status: 'active'
        },
        {
          id: 'assess_003',
          title: 'Database Management',
          type: 'quiz',
          duration: '45 minutes',
          questions: 30,
          passingScore: 75,
          status: 'active'
        },
        {
          id: 'assess_004',
          title: 'API Integration',
          type: 'practical',
          duration: '3 hours',
          questions: 20,
          passingScore: 85,
          status: 'active'
        }
      ];
      setAssessments(mockAssessments);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAssignAssessment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await assignAssessmentToUser(assignForm);
      setSuccess('Assessment assigned successfully!');
      setShowAssignModal(false);
      setAssignForm({ userId: '', assessmentId: '', deadline: '' });
    } catch (err) {
      setError('Failed to assign assessment. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = (assessment) => {
    setSelectedAssessment(assessment);
    setAssignForm({
      userId: '',
      assessmentId: assessment.id,
      deadline: ''
    });
    setShowAssignModal(true);
  };

  const closeModal = () => {
    setShowAssignModal(false);
    setSelectedAssessment(null);
    setError('');
    setSuccess('');
  };

  if (loading && assessments.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading assessments...</p>
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
        <h5 className="mb-0 fw-bold">Assessment Management</h5>
      </div>

      {/* Content */}
      <div className="p-3 bg-light">
        {/* Alerts */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            <strong>Error:</strong> {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')}>
            <strong>Success:</strong> {success}
          </Alert>
        )}

        {/* Assessments List */}
        <div className="mb-4">
          <h6 className="text-dark fw-bold mb-3">Available Assessments ({assessments.length})</h6>
          {assessments.length === 0 ? (
            <Alert variant="info">
              <p className="mb-0">No assessments available.</p>
              <small>Assessments will appear here once they are created.</small>
            </Alert>
          ) : (
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <Table responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 px-3 py-3">Title</th>
                      <th className="border-0 px-3 py-3">Type</th>
                      <th className="border-0 px-3 py-3">Duration</th>
                      <th className="border-0 px-3 py-3">Questions</th>
                      <th className="border-0 px-3 py-3">Passing Score</th>
                      <th className="border-0 px-3 py-3">Status</th>
                      <th className="border-0 px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((assessment) => (
                      <tr key={assessment.id} className="border-bottom">
                        <td className="px-3 py-3">
                          <strong className="text-dark">{assessment.title}</strong>
                        </td>
                        <td className="px-3 py-3">
                          <Badge 
                            bg={assessment.type === 'practical' ? 'warning' : 'info'}
                            text="dark"
                          >
                            {assessment.type === 'practical' ? 'Practical' : 'Quiz'}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-muted">{assessment.duration}</td>
                        <td className="px-3 py-3 text-muted">{assessment.questions}</td>
                        <td className="px-3 py-3 text-muted">{assessment.passingScore}%</td>
                        <td className="px-3 py-3">
                          <Badge 
                            bg={assessment.status === 'active' ? 'success' : 'secondary'}
                          >
                            {assessment.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openAssignModal(assessment)}
                            disabled={loading}
                          >
                            Assign Assessment
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>

      {/* Assign Assessment Modal */}
      <Modal show={showAssignModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Assessment to User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAssignAssessment}>
          <Modal.Body>
            {selectedAssessment && (
              <Alert variant="info">
                <strong>Assessment:</strong> {selectedAssessment.title}
                <br />
                <strong>Type:</strong> {selectedAssessment.type === 'practical' ? 'Practical' : 'Quiz'}
                <br />
                <strong>Duration:</strong> {selectedAssessment.duration}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>User ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter user ID"
                value={assignForm.userId}
                onChange={(e) => setAssignForm({...assignForm, userId: e.target.value})}
                required
              />
              <Form.Text className="text-muted">
                Enter the unique identifier for the user
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Deadline</Form.Label>
              <Form.Control
                type="datetime-local"
                value={assignForm.deadline}
                onChange={(e) => setAssignForm({...assignForm, deadline: e.target.value})}
                required
              />
              <Form.Text className="text-muted">
                Set the deadline for completing this assessment
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Assessment'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Bottom Navigation */}
      <div className="position-fixed bottom-0 start-0 w-100 bg-white border-top border-light shadow-sm">
        <div className="d-flex justify-content-around py-2">
          <Button variant="link" className="text-muted text-decoration-none p-2">
            <span style={{ fontSize: '20px' }}>🏠</span>
          </Button>
          <Button variant="link" className="text-muted text-decoration-none p-2">
            <span style={{ fontSize: '20px' }}>📚</span>
          </Button>
          <Button variant="link" className="text-success text-decoration-none p-2 border-bottom border-success border-2 fw-bold">
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

export default Assessment;
