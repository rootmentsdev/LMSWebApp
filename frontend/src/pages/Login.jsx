import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import axios from "axios";

const LoginPage = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setEmployeeData(null);
    setLoading(true);

    try {
      // Use deployed backend API
      const response = await axios.post(
        "https://lms-1-lavs.onrender.com/api/verify-employee",
        { employeeId, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setSuccess(true);
        setEmployeeData(response.data.data);
        // Store employee data in localStorage for future use
        localStorage.setItem("employeeData", JSON.stringify(response.data.data));
        localStorage.setItem("isLoggedIn", "true");
        
        // Redirect to home page after successful login
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Please check if the backend is running.");
      } else {
        setError("Login failed. Please check Employee ID and Password.");
      }
    }

    setLoading(false);
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <Row className="w-100 justify-content-center">
        <Col md={5} lg={4}>
          <Card className="p-4 shadow-lg rounded-4 border-0">
            <div className="text-center mb-4">
              <h2 className="fw-bold" style={{ color: "#198754" }}>
                Employee Login
              </h2>
              <p className="text-muted">Enter your credentials to continue</p>
            </div>
            
            {error && (
              <Alert variant="danger" className="border-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}
            
            {success && employeeData && (
              <Alert variant="success" className="border-0">
                <i className="fas fa-check-circle me-2"></i>
                Login Successful! Welcome back, {employeeData.name} 🎉
                <br />
                <small>Redirecting to dashboard...</small>
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formEmployeeId">
                <Form.Label className="fw-semibold" style={{ color: "#198754" }}>
                  Employee ID
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Employee ID (e.g., EMP103)"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  className="border-2"
                  style={{ 
                    borderColor: "#dee2e6",
                    "&:focus": { borderColor: "#198754", boxShadow: "0 0 0 0.2rem rgba(25, 135, 84, 0.25)" }
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formPassword">
                <Form.Label className="fw-semibold" style={{ color: "#198754" }}>
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-2"
                  style={{ 
                    borderColor: "#dee2e6",
                    "&:focus": { borderColor: "#198754", boxShadow: "0 0 0 0.2rem rgba(25, 135, 84, 0.25)" }
                  }}
                />
              </Form.Group>

              <Button
                variant="success"
                type="submit"
                className="w-100 py-2 fw-semibold border-0"
                disabled={loading}
                style={{ 
                  backgroundColor: "#198754",
                  "&:hover": { backgroundColor: "#157347" },
                  "&:active": { backgroundColor: "#146c43" }
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </Form>

            {success && employeeData && (
              <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                <h6 className="fw-semibold mb-3" style={{ color: "#198754" }}>Employee Details:</h6>
                <div className="row">
                  <div className="col-6">
                    <small className="text-muted">Employee ID:</small>
                    <p className="mb-1 fw-semibold">{employeeData.employeeId}</p>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Name:</small>
                    <p className="mb-1 fw-semibold">{employeeData.name}</p>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Role:</small>
                    <p className="mb-1 fw-semibold">{employeeData.role}</p>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Store:</small>
                    <p className="mb-1 fw-semibold">{employeeData.Store}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Demo Credentials */}
            <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: "#e8f5e8", border: "1px solid #198754" }}>
              <h6 className="fw-semibold mb-2" style={{ color: "#198754" }}>
                <i className="fas fa-info-circle me-2"></i>
                Demo Credentials
              </h6>
              <small className="text-muted d-block">Employee ID: <strong>EMP103</strong></small>
              <small className="text-muted">Password: <strong>123456</strong></small>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
