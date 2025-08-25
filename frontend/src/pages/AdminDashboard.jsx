import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Badge,
  ProgressBar,
  Tab,
  Tabs,
  InputGroup,
  Spinner,
  Dropdown
} from 'react-bootstrap';
import axios from 'axios';
import { config, getApiHeaders } from '../config';
import { 
  getUserTrainings, 
  getTrainingProgress, 
  calculateCompletionPercentages 
} from '../services/lmsTrainingBridge';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [trainings, setTrainings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [assignmentData, setAssignmentData] = useState({
    userIds: [],
    deadline: '',
    priority: 'medium'
  });
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    type: 'regular',
    duration: 7,
    modules: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progressData, setProgressData] = useState({});

  // Check if user is admin
  const employeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');
  const isAdmin = employeeData.role === 'Manager' || employeeData.role === 'Admin' || employeeData.role === 'super_admin';

  useEffect(() => {
    if (isAdmin) {
      fetchTrainings();
      fetchUsers();
      fetchProgressData();
    }
  }, [isAdmin]);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/trainings', {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.data.status === 'success') {
        setTrainings(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
      setError('Failed to fetch trainings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('👥 Fetching users from LMS system...');
      
      // Since your LMS doesn't have a direct "get all users" endpoint,
      // we'll create a default list of common employee IDs
      // In a real system, you'd have an admin endpoint for this
      
      const defaultUsers = [
        { id: 'EMP103', name: 'Test Employee', role: 'Employee', branch: 'Main Office' },
        { id: 'EMP104', name: 'Demo User', role: 'Employee', branch: 'Branch Office' },
        { id: 'EMP105', name: 'Sample Employee', role: 'Employee', branch: 'Remote' }
      ];
      
      // Try to fetch training data to extract real users
      try {
        // We can get users from training assignments if available
        const response = await fetch('http://localhost:5000/api/trainings/all', {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          const extractedUsers = new Set();
          const usersArray = [];
          
          if (data.data) {
            data.data.forEach(training => {
              if (training.assignedUsers) {
                training.assignedUsers.forEach(user => {
                  if (!extractedUsers.has(user.userId)) {
                    extractedUsers.add(user.userId);
                    usersArray.push({
                      id: user.userId,
                      name: user.userName || user.userId,
                      role: user.userRole || 'Employee',
                      branch: user.userBranch || 'Unknown'
                    });
                  }
                });
              }
            });
          }
          
          // Combine default users with extracted users
          const combinedUsers = [...defaultUsers];
          usersArray.forEach(user => {
            if (!combinedUsers.find(u => u.id === user.id)) {
              combinedUsers.push(user);
            }
          });
          
          setUsers(combinedUsers);
          console.log(`✅ Found ${combinedUsers.length} users for assignment`);
        } else {
          setUsers(defaultUsers);
          console.log('⚠️ Using default user list');
        }
      } catch (localError) {
        console.warn('Could not fetch from local backend, using default users:', localError);
        setUsers(defaultUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to default users
      setUsers([
        { id: 'EMP103', name: 'Test Employee', role: 'Employee', branch: 'Main Office' }
      ]);
    }
  };

  const fetchProgressData = async () => {
    try {
      // Fetch overall progress statistics
      const response = await fetch(`${config.API_BASE_URL}/api/get/progress`, {
        method: 'GET',
        headers: getApiHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const handleCreateTraining = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:5000/api/${newTraining.type === 'mandatory' ? 'mandatorytrainings' : 'trainings'}`,
        newTraining,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status === 'success') {
        setSuccess('Training created successfully!');
        setShowCreateModal(false);
        setNewTraining({
          title: '',
          description: '',
          type: 'regular',
          duration: 7,
          modules: []
        });
        fetchTrainings();
      }
    } catch (error) {
      console.error('Error creating training:', error);
      setError('Failed to create training');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTraining = async () => {
    try {
      setLoading(true);
      
      // Assign training to selected users
      const promises = assignmentData.userIds.map(async (userId) => {
        const user = users.find(u => u.id === userId);
        
        return axios.post(
          `http://localhost:5000/api/trainings/${selectedTraining._id}/assign`,
          {
            userId,
            userName: user?.name || userId,
            userRole: user?.role || 'Employee',
            userBranch: user?.branch || 'Unknown',
            deadline: assignmentData.deadline,
            priority: assignmentData.priority
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
      });

      await Promise.all(promises);
      
      setSuccess(`Training assigned to ${assignmentData.userIds.length} users successfully!`);
      setShowAssignModal(false);
      setAssignmentData({ userIds: [], deadline: '', priority: 'medium' });
      fetchTrainings();
    } catch (error) {
      console.error('Error assigning training:', error);
      setError('Failed to assign training');
    } finally {
      setLoading(false);
    }
  };

  const getProgressStats = (training) => {
    if (!training.assignedUsers || training.assignedUsers.length === 0) {
      return { total: 0, completed: 0, inProgress: 0, pending: 0 };
    }

    const total = training.assignedUsers.length;
    const completed = training.assignedUsers.filter(user => user.status === 'completed').length;
    const inProgress = training.assignedUsers.filter(user => user.status === 'in_progress').length;
    const pending = training.assignedUsers.filter(user => user.status === 'pending').length;

    return { total, completed, inProgress, pending };
  };

  const getStatusBadge = (status) => {
    const variants = {
      'completed': 'success',
      'in_progress': 'warning',
      'pending': 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
  };

  if (!isAdmin) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <h4>Access Denied</h4>
          <p>You don't have admin privileges to access this dashboard.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Admin Dashboard</h2>
          <p className="text-muted">Manage training assignments and track progress</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="overview" title="Overview">
          <Row>
            <Col md={3}>
              <Card className="text-center mb-3">
                <Card.Body>
                  <h3>{trainings.length}</h3>
                  <p className="text-muted">Total Trainings</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center mb-3">
                <Card.Body>
                  <h3>{users.length}</h3>
                  <p className="text-muted">Total Users</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center mb-3">
                <Card.Body>
                  <h3>{trainings.filter(t => t.type === 'mandatory').length}</h3>
                  <p className="text-muted">Mandatory Trainings</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center mb-3">
                <Card.Body>
                  <h3>
                    {trainings.reduce((total, training) => {
                      const stats = getProgressStats(training);
                      return total + stats.completed;
                    }, 0)}
                  </h3>
                  <p className="text-muted">Completed Assignments</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header>
              <h5>Recent Training Progress</h5>
            </Card.Header>
            <Card.Body>
              {trainings.slice(0, 5).map(training => {
                const stats = getProgressStats(training);
                const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                
                return (
                  <div key={training._id} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold">{training.title}</span>
                      <span className="text-muted">{stats.completed}/{stats.total} completed</span>
                    </div>
                    <ProgressBar now={completionRate} label={`${completionRate.toFixed(0)}%`} />
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="trainings" title="Manage Trainings">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Training Management</h4>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create New Training
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Training Name</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Assigned Users</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainings.map(training => {
                  const stats = getProgressStats(training);
                  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

                  return (
                    <tr key={training._id}>
                      <td>
                        <div>
                          <strong>{training.title}</strong>
                          <br />
                          <small className="text-muted">{training.description}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg={training.type === 'mandatory' ? 'danger' : 'info'}>
                          {training.type}
                        </Badge>
                      </td>
                      <td>{training.duration} days</td>
                      <td>{stats.total} users</td>
                      <td>
                        <div style={{ minWidth: '150px' }}>
                          <div className="small text-muted mb-1">
                            {stats.completed} completed, {stats.inProgress} in progress
                          </div>
                          <ProgressBar now={completionRate} size="sm" />
                        </div>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => {
                            setSelectedTraining(training);
                            setShowAssignModal(true);
                          }}
                        >
                          Assign Users
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => setActiveTab('progress')}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Tab>

        <Tab eventKey="progress" title="Progress Tracking">
          <h4>Training Progress Overview</h4>
          <p className="text-muted">Real-time progress tracking from the training viewing website</p>

          {trainings.map(training => {
            const stats = getProgressStats(training);
            
            return (
              <Card key={training._id} className="mb-4">
                <Card.Header>
                  <Row className="align-items-center">
                    <Col>
                      <h6 className="mb-0">{training.title}</h6>
                      <Badge bg={training.type === 'mandatory' ? 'danger' : 'info'} className="me-2">
                        {training.type}
                      </Badge>
                    </Col>
                    <Col xs="auto">
                      <small className="text-muted">
                        {stats.completed}/{stats.total} completed
                      </small>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body>
                  {training.assignedUsers && training.assignedUsers.length > 0 ? (
                    <Table size="sm" responsive>
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Branch</th>
                          <th>Status</th>
                          <th>Progress</th>
                          <th>Assigned Date</th>
                          <th>Deadline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {training.assignedUsers.map((user, index) => (
                          <tr key={index}>
                            <td>{user.userName || user.userId}</td>
                            <td>{user.userRole}</td>
                            <td>{user.userBranch}</td>
                            <td>{getStatusBadge(user.status)}</td>
                            <td>
                              <div style={{ minWidth: '100px' }}>
                                <ProgressBar now={user.progress} size="sm" />
                                <small>{user.progress}%</small>
                              </div>
                            </td>
                            <td>
                              {user.assignedDate ? 
                                new Date(user.assignedDate).toLocaleDateString() : 
                                'N/A'
                              }
                            </td>
                            <td>
                              {user.deadline ? 
                                new Date(user.deadline).toLocaleDateString() : 
                                'No deadline'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted">No users assigned to this training.</p>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </Tab>
      </Tabs>

      {/* Create Training Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Training</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Training Title</Form.Label>
              <Form.Control
                type="text"
                value={newTraining.title}
                onChange={(e) => setNewTraining({...newTraining, title: e.target.value})}
                placeholder="Enter training title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTraining.description}
                onChange={(e) => setNewTraining({...newTraining, description: e.target.value})}
                placeholder="Enter training description"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Training Type</Form.Label>
                  <Form.Select
                    value={newTraining.type}
                    onChange={(e) => setNewTraining({...newTraining, type: e.target.value})}
                  >
                    <option value="regular">Regular Training</option>
                    <option value="mandatory">Mandatory Training</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (days)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newTraining.duration}
                    onChange={(e) => setNewTraining({...newTraining, duration: parseInt(e.target.value)})}
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateTraining} disabled={loading}>
            {loading ? 'Creating...' : 'Create Training'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Assign Training Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Training: {selectedTraining?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Users</Form.Label>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', padding: '10px' }}>
                {users.map(user => (
                  <Form.Check
                    key={user.id}
                    type="checkbox"
                    id={`user-${user.id}`}
                    label={`${user.name} (${user.role} - ${user.branch})`}
                    checked={assignmentData.userIds.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAssignmentData({
                          ...assignmentData,
                          userIds: [...assignmentData.userIds, user.id]
                        });
                      } else {
                        setAssignmentData({
                          ...assignmentData,
                          userIds: assignmentData.userIds.filter(id => id !== user.id)
                        });
                      }
                    }}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Deadline</Form.Label>
              <Form.Control
                type="date"
                value={assignmentData.deadline}
                onChange={(e) => setAssignmentData({...assignmentData, deadline: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={assignmentData.priority}
                onChange={(e) => setAssignmentData({...assignmentData, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAssignTraining} 
            disabled={loading || assignmentData.userIds.length === 0}
          >
            {loading ? 'Assigning...' : `Assign to ${assignmentData.userIds.length} Users`}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
