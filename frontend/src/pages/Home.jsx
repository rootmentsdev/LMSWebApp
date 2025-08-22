import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Alert, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmployeeData = localStorage.getItem("employeeData");
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    
    if (storedEmployeeData && storedLoginStatus === "true") {
      setEmployeeData(JSON.parse(storedEmployeeData));
      setIsLoggedIn(true);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("employeeData");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  if (!isLoggedIn || !employeeData) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold mb-0" style={{ color: "#198754" }}>
                Welcome Back, {employeeData.name}! 👋
              </h1>
              <p className="text-muted mb-0">Employee Dashboard</p>
            </div>
            <Button 
              variant="outline-success" 
              onClick={handleLogout}
              className="px-4 py-2"
            >
              <i className="fas fa-sign-out-alt me-2"></i>
              Logout
            </Button>
          </div>
        </Col>
      </Row>

      {/* Employee Info Card */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-success text-white border-0">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Employee Information
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
                    <div className="me-3">
                      <i className="fas fa-id-badge fa-2x" style={{ color: "#198754" }}></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Employee ID</small>
                      <strong className="fs-6">{employeeData.employeeId}</strong>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
                    <div className="me-3">
                      <i className="fas fa-user-tie fa-2x" style={{ color: "#198754" }}></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Full Name</small>
                      <strong className="fs-6">{employeeData.name}</strong>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
                    <div className="me-3">
                      <i className="fas fa-briefcase fa-2x" style={{ color: "#198754" }}></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Role</small>
                      <strong className="fs-6">{employeeData.role}</strong>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
                    <div className="me-3">
                      <i className="fas fa-store fa-2x" style={{ color: "#198754" }}></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Store</small>
                      <strong className="fs-6">{employeeData.Store}</strong>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-success text-white border-0">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="d-grid gap-3">
                <Button 
                  variant="outline-success" 
                  className="text-start p-3"
                  onClick={() => navigate("/training")}
                >
                  <i className="fas fa-graduation-cap me-3"></i>
                  <div>
                    <strong>Training Modules</strong>
                    <small className="d-block text-muted">Access learning materials</small>
                  </div>
                </Button>
                
                <Button 
                  variant="outline-success" 
                  className="text-start p-3"
                  onClick={() => navigate("/assessment")}
                >
                  <i className="fas fa-clipboard-check me-3"></i>
                  <div>
                    <strong>Assessments</strong>
                    <small className="d-block text-muted">Take tests & quizzes</small>
                  </div>
                </Button>
                
                <Button 
                  variant="outline-success" 
                  className="text-start p-3"
                >
                  <i className="fas fa-chart-line me-3"></i>
                  <div>
                    <strong>Progress Report</strong>
                    <small className="d-block text-muted">View your performance</small>
                  </div>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Status Cards */}
      <Row>
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="p-4">
              <div className="mb-3">
                <i className="fas fa-check-circle fa-3x" style={{ color: "#198754" }}></i>
              </div>
              <h5 className="fw-bold" style={{ color: "#198754" }}>Active</h5>
              <p className="text-muted mb-0">Account Status</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="p-4">
              <div className="mb-3">
                <i className="fas fa-clock fa-3x" style={{ color: "#198754" }}></i>
              </div>
              <h5 className="fw-bold" style={{ color: "#198754" }}>Today</h5>
              <p className="text-muted mb-0">Last Login</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="p-4">
              <div className="mb-3">
                <i className="fas fa-shield-alt fa-3x" style={{ color: "#198754" }}></i>
              </div>
              <h5 className="fw-bold" style={{ color: "#198754" }}>Secure</h5>
              <p className="text-muted mb-0">Connection</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
