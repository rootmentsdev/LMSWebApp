// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Card, Button, Alert, Badge } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";

// const HomePage = () => {
//   const [employeeData, setEmployeeData] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedEmployeeData = localStorage.getItem("employeeData");
//     const storedLoginStatus = localStorage.getItem("isLoggedIn");
    
//     if (storedEmployeeData && storedLoginStatus === "true") {
//       setEmployeeData(JSON.parse(storedEmployeeData));
//       setIsLoggedIn(true);
//     } else {
//       navigate("/login");
//     }
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("employeeData");
//     localStorage.removeItem("isLoggedIn");
//     navigate("/login");
//   };

//   if (!isLoggedIn || !employeeData) {
//     return (
//       <Container className="d-flex justify-content-center align-items-center vh-100">
//         <div className="text-center">
//           <div className="spinner-border text-success" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       </Container>
//     );
//   }

//   return (
//     <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <h1 className="fw-bold mb-0" style={{ color: "#198754" }}>
//                 Welcome Back, {employeeData.name}! 👋
//               </h1>
//               <p className="text-muted mb-0">Employee Dashboard</p>
//             </div>
//             <Button 
//               variant="outline-success" 
//               onClick={handleLogout}
//               className="px-4 py-2"
//             >
//               <i className="fas fa-sign-out-alt me-2"></i>
//               Logout
//             </Button>
//           </div>
//         </Col>
//       </Row>

//       {/* Employee Info Card */}
//       <Row className="mb-4">
//         <Col lg={8}>
//           <Card className="border-0 shadow-sm">
//             <Card.Header className="bg-success text-white border-0">
//               <h5 className="mb-0">
//                 <i className="fas fa-user me-2"></i>
//                 Employee Information
//               </h5>
//             </Card.Header>
//             <Card.Body className="p-4">
//               <Row>
//                 <Col md={6} className="mb-3">
//                   <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
//                     <div className="me-3">
//                       <i className="fas fa-id-badge fa-2x" style={{ color: "#198754" }}></i>
//                     </div>
//                     <div>
//                       <small className="text-muted d-block">Employee ID</small>
//                       <strong className="fs-6">{employeeData.employeeId}</strong>
//                     </div>
//                   </div>
//                 </Col>
//                 <Col md={6} className="mb-3">
//                   <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
//                     <div className="me-3">
//                       <i className="fas fa-user-tie fa-2x" style={{ color: "#198754" }}></i>
//                     </div>
//                     <div>
//                       <small className="text-muted d-block">Full Name</small>
//                       <strong className="fs-6">{employeeData.name}</strong>
//                     </div>
//                   </div>
//                 </Col>
//                 <Col md={6} className="mb-3">
//                   <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
//                     <div className="me-3">
//                       <i className="fas fa-briefcase fa-2x" style={{ color: "#198754" }}></i>
//                     </div>
//                     <div>
//                       <small className="text-muted d-block">Role</small>
//                       <strong className="fs-6">{employeeData.role}</strong>
//                     </div>
//                   </div>
//                 </Col>
//                 <Col md={6} className="mb-3">
//                   <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
//                     <div className="me-3">
//                       <i className="fas fa-store fa-2x" style={{ color: "#198754" }}></i>
//                     </div>
//                     <div>
//                       <small className="text-muted d-block">Store</small>
//                       <strong className="fs-6">{employeeData.Store}</strong>
//                     </div>
//                   </div>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         </Col>

//         {/* Quick Actions */}
//         <Col lg={4}>
//           <Card className="border-0 shadow-sm h-100">
//             <Card.Header className="bg-success text-white border-0">
//               <h5 className="mb-0">
//                 <i className="fas fa-bolt me-2"></i>
//                 Quick Actions
//               </h5>
//             </Card.Header>
//             <Card.Body className="p-4">
//               <div className="d-grid gap-3">
//                 <Button 
//                   variant="outline-success" 
//                   className="text-start p-3"
//                   onClick={() => navigate("/training")}
//                 >
//                   <i className="fas fa-graduation-cap me-3"></i>
//                   <div>
//                     <strong>Training Modules</strong>
//                     <small className="d-block text-muted">Access learning materials</small>
//                   </div>
//                 </Button>
                
//                 <Button 
//                   variant="outline-success" 
//                   className="text-start p-3"
//                   onClick={() => navigate("/assessment")}
//                 >
//                   <i className="fas fa-clipboard-check me-3"></i>
//                   <div>
//                     <strong>Assessments</strong>
//                     <small className="d-block text-muted">Take tests & quizzes</small>
//                   </div>
//                 </Button>
                
//                 <Button 
//                   variant="outline-success" 
//                   className="text-start p-3"
//                 >
//                   <i className="fas fa-chart-line me-3"></i>
//                   <div>
//                     <strong>Progress Report</strong>
//                     <small className="d-block text-muted">View your performance</small>
//                   </div>
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Status Cards */}
//       <Row>
//         <Col md={4} className="mb-3">
//           <Card className="border-0 shadow-sm text-center">
//             <Card.Body className="p-4">
//               <div className="mb-3">
//                 <i className="fas fa-check-circle fa-3x" style={{ color: "#198754" }}></i>
//               </div>
//               <h5 className="fw-bold" style={{ color: "#198754" }}>Active</h5>
//               <p className="text-muted mb-0">Account Status</p>
//             </Card.Body>
//           </Card>
//         </Col>
        
//         <Col md={4} className="mb-3">
//           <Card className="border-0 shadow-sm text-center">
//             <Card.Body className="p-4">
//               <div className="mb-3">
//                 <i className="fas fa-clock fa-3x" style={{ color: "#198754" }}></i>
//               </div>
//               <h5 className="fw-bold" style={{ color: "#198754" }}>Today</h5>
//               <p className="text-muted mb-0">Last Login</p>
//             </Card.Body>
//           </Card>
//         </Col>
        
//         <Col md={4} className="mb-3">
//           <Card className="border-0 shadow-sm text-center">
//             <Card.Body className="p-4">
//               <div className="mb-3">
//                 <i className="fas fa-shield-alt fa-3x" style={{ color: "#198754" }}></i>
//               </div>
//               <h5 className="fw-bold" style={{ color: "#198754" }}>Secure</h5>
//               <p className="text-muted mb-0">Connection</p>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default HomePage;


import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
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
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      <Container className="py-5" style={{ maxWidth: "1000px" }}>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="h2 mb-2" style={{ color: '#1e293b', fontWeight: '700' }}>
              Good morning, {employeeData.name} 👋
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: '16px' }}>
              Welcome to your learning dashboard
            </p>
          </div>
          <Button 
            variant="outline-secondary" 
            onClick={handleLogout}
            className="px-4"
            style={{ borderRadius: '8px' }}
          >
            Sign out
          </Button>
        </div>

        <Row className="g-4">
          {/* Employee Profile Card */}
          <Col lg={5}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: '#ddd6fe',
                      fontSize: '24px'
                    }}
                  >
                    {employeeData.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="mb-1" style={{ color: '#1e293b', fontWeight: '600' }}>
                      {employeeData.name}
                    </h5>
                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                      {employeeData.role}
                    </p>
                  </div>
                </div>
                
                <div className="row g-3">
                  <div className="col-6">
                    <div 
                      className="p-3 rounded-3"
                      style={{ backgroundColor: '#f1f5f9' }}
                    >
                      <div className="text-muted small mb-1">Employee ID</div>
                      <div className="fw-semibold" style={{ color: '#475569' }}>
                        {employeeData.employeeId}
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div 
                      className="p-3 rounded-3"
                      style={{ backgroundColor: '#f1f5f9' }}
                    >
                      <div className="text-muted small mb-1">Store</div>
                      <div className="fw-semibold" style={{ color: '#475569' }}>
                        {employeeData.Store}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="small text-muted">Status</div>
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle me-2"
                          style={{ 
                            width: '8px', 
                            height: '8px', 
                            backgroundColor: '#10b981' 
                          }}
                        ></div>
                        <span className="small fw-semibold text-success">Active</span>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="small text-muted">Last login</div>
                      <div className="small fw-semibold" style={{ color: '#475569' }}>
                        Today
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col lg={7}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h5 className="mb-4" style={{ color: '#1e293b', fontWeight: '600' }}>
                  Quick Actions
                </h5>
                
                <div className="d-grid gap-3">
                  <Button
                    className="d-flex align-items-center p-4 text-start border-0 shadow-sm"
                    style={{ 
                      backgroundColor: '#3b82f6',
                      borderRadius: '12px',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => navigate("/training")}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <div 
                      className="rounded-2 d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>🎓</span>
                    </div>
                    <div className="text-white">
                      <div className="fw-semibold mb-1">Training Modules</div>
                      <div style={{ fontSize: '14px', opacity: '0.9' }}>
                        Access your learning materials and courses
                      </div>
                    </div>
                  </Button>

                  <Button
                    className="d-flex align-items-center p-4 text-start border-0 shadow-sm"
                    style={{ 
                      backgroundColor: '#10b981',
                      borderRadius: '12px',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => navigate("/assessment")}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <div 
                      className="rounded-2 d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>📊</span>
                    </div>
                    <div className="text-white">
                      <div className="fw-semibold mb-1">Assessments</div>
                      <div style={{ fontSize: '14px', opacity: '0.9' }}>
                        Take quizzes and track your progress
                      </div>
                    </div>
                  </Button>

                  <Button
                    className="d-flex align-items-center p-4 text-start border-0 shadow-sm"
                    style={{ 
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      color: '#64748b',
                      cursor: 'not-allowed',
                      opacity: '0.7'
                    }}
                    disabled
                  >
                    <div 
                      className="rounded-2 d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: '#e2e8f0' 
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>📈</span>
                    </div>
                    <div>
                      <div className="fw-semibold mb-1">Progress Reports</div>
                      <div style={{ fontSize: '14px' }}>
                        Coming soon - View detailed analytics
                      </div>
                    </div>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mt-2">
          <Col md={4}>
            <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ 
                    width: '64px', 
                    height: '64px', 
                    backgroundColor: '#dbeafe' 
                  }}
                >
                  <span style={{ fontSize: '24px', color: '#3b82f6' }}>✓</span>
                </div>
                <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Active Account</h6>
                <p className="text-muted small mb-0">Your account is verified and active</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ 
                    width: '64px', 
                    height: '64px', 
                    backgroundColor: '#dcfce7' 
                  }}
                >
                  <span style={{ fontSize: '24px', color: '#10b981' }}>🔒</span>
                </div>
                <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Secure Connection</h6>
                <p className="text-muted small mb-0">Your data is protected and encrypted</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ 
                    width: '64px', 
                    height: '64px', 
                    backgroundColor: '#fef3c7' 
                  }}
                >
                  <span style={{ fontSize: '24px', color: '#f59e0b' }}>⚡</span>
                </div>
                <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Ready to Learn</h6>
                <p className="text-muted small mb-0">Start your training journey today</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
