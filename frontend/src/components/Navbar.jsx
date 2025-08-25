import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn");
      const storedEmployeeData = localStorage.getItem("employeeData");
      
      setIsLoggedIn(loginStatus === "true");
      if (storedEmployeeData) {
        setEmployeeData(JSON.parse(storedEmployeeData));
      }
    };

    checkAuthStatus();
    // Listen for storage changes (when login/logout happens in other tabs)
    window.addEventListener('storage', checkAuthStatus);
    
    return () => window.removeEventListener('storage', checkAuthStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("employeeData");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setEmployeeData(null);
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!isLoggedIn) {
    return null; // Don't show navbar on login page
  }

  return (
    <Navbar 
      expand="lg" 
      className="shadow-sm border-0"
      style={{ backgroundColor: "#ffffff" }}
    >
      <Container>
        <Navbar.Brand 
          href="/" 
          className="fw-bold fs-4"
          style={{ color: "#198754" }}
        >
          <i className="fas fa-graduation-cap me-2"></i>
          LMS Portal
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              href="/" 
              className={`fw-semibold me-3 ${isActive('/') ? 'text-success' : 'text-muted'}`}
              style={{ 
                borderBottom: isActive('/') ? '2px solid #198754' : 'none',
                paddingBottom: '0.5rem'
              }}
            >
              <i className="fas fa-home me-1"></i>
              Dashboard
            </Nav.Link>
            
            <Nav.Link 
              href="/training" 
              className={`fw-semibold me-3 ${isActive('/training') ? 'text-success' : 'text-muted'}`}
              style={{ 
                borderBottom: isActive('/training') ? '2px solid #198754' : 'none',
                paddingBottom: '0.5rem'
              }}
            >
              <i className="fas fa-graduation-cap me-1"></i>
              Training
            </Nav.Link>
            
            <Nav.Link 
              href="/assessment" 
              className={`fw-semibold me-3 ${isActive('/assessment') ? 'text-success' : 'text-muted'}`}
              style={{ 
                borderBottom: isActive('/assessment') ? '2px solid #198754' : 'none',
                paddingBottom: '0.5rem'
              }}
            >
              <i className="fas fa-clipboard-check me-1"></i>
              Assessment
            </Nav.Link>
            
            {/* Admin Link - Only show for admin users */}
            {employeeData && (employeeData.role === 'Manager' || employeeData.role === 'Admin' || employeeData.role === 'super_admin') && (
              <Nav.Link 
                href="/admin" 
                className={`fw-semibold me-3 ${isActive('/admin') ? 'text-success' : 'text-muted'}`}
                style={{ 
                  borderBottom: isActive('/admin') ? '2px solid #198754' : 'none',
                  paddingBottom: '0.5rem'
                }}
              >
                <i className="fas fa-cogs me-1"></i>
                Admin
              </Nav.Link>
            )}
          </Nav>
          
          <div className="d-flex align-items-center">
            {employeeData && (
              <Dropdown className="me-3">
                <Dropdown.Toggle 
                  variant="outline-success" 
                  id="dropdown-basic"
                  className="border-0 bg-transparent"
                  style={{ color: "#198754" }}
                >
                  <i className="fas fa-user-circle me-2"></i>
                  {employeeData.name}
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-sm border-0">
                  <Dropdown.Header className="text-success fw-semibold">
                    <i className="fas fa-user me-2"></i>
                    Profile
                  </Dropdown.Header>
                  <Dropdown.Item className="py-2">
                    <i className="fas fa-id-badge me-2 text-muted"></i>
                    {employeeData.employeeId}
                  </Dropdown.Item>
                  <Dropdown.Item className="py-2">
                    <i className="fas fa-briefcase me-2 text-muted"></i>
                    {employeeData.role}
                  </Dropdown.Item>
                  <Dropdown.Item className="py-2">
                    <i className="fas fa-store me-2 text-muted"></i>
                    {employeeData.Store}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item 
                    className="text-danger py-2"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
            
            <Button 
              variant="outline-success" 
              size="sm"
              onClick={handleLogout}
              className="d-lg-none"
            >
              <i className="fas fa-sign-out-alt me-1"></i>
              Logout
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
