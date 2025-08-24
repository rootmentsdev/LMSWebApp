import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Assessment from './pages/Assessment';
import Training from './pages/Training';
import TrainingModules from './pages/TrainingModules';
import LMSTest from './pages/LMSTest';
import LMSSyncTest from './pages/LMSSyncTest';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/assessment" element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            } />
            <Route path="/training" element={
              <ProtectedRoute>
                <Training />
              </ProtectedRoute>
            } />
            <Route path="/training/:trainingId" element={
              <ProtectedRoute>
                <TrainingModules />
              </ProtectedRoute>
            } />
            <Route path="/lms-test" element={
              <ProtectedRoute>
                <LMSTest />
              </ProtectedRoute>
            } />
            <Route path="/lms-sync-test" element={
              <ProtectedRoute>
                <LMSSyncTest />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// 404 Component
const NotFound = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="text-center">
      <h2 className="text-success">404 - Page Not Found</h2>
      <p className="text-muted">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-success">Go Home</a>
    </div>
  </div>
);

export default App;
