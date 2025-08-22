const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Import database connection and routes
const connectDB = require('./config/database');
const trainingRoutes = require('./routes/trainingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Token
const API_TOKEN = 'RootX-production-9d17d9485eb772e79df8564004d4a4d4';

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'LMS Backend API is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      employeeVerification: '/api/verify-employee',
      trainings: '/api/trainings',
      mandatoryTrainings: '/api/mandatorytrainings',
      userTrainings: '/api/trainings/user/:userId/assigned-trainings',
      userMandatoryTrainings: '/api/trainings/user/:userId/mandatory-trainings'
    }
  });
});

// Employee verification endpoint
app.post('/api/verify-employee', async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    // Validate input
    if (!employeeId || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID and password are required'
      });
    }

    // Call external API
    const response = await axios.post(
      'https://rootments.in/api/verify_employee',
      { employeeId, password },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      }
    );

    // Forward the response from external API
    res.json(response.data);

  } catch (error) {
    console.error('Employee verification error:', error);

    if (error.response) {
      // External API returned an error
      res.status(error.response.status).json({
        status: 'error',
        message: error.response.data?.message || 'Authentication failed',
        details: error.response.data
      });
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      res.status(408).json({
        status: 'error',
        message: 'Request timeout. Please try again.'
      });
    } else if (error.code === 'ENOTFOUND') {
      // Network error
      res.status(503).json({
        status: 'error',
        message: 'Service temporarily unavailable. Please check your connection.'
      });
    } else {
      // Other errors
      res.status(500).json({
        status: 'error',
        message: 'Internal server error. Please try again later.'
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Training routes - This includes all the missing GET endpoints
app.use('/api/trainings', trainingRoutes);

// Additional training endpoints for backward compatibility
app.get('/api/mandatorytrainings', async (req, res) => {
  // Redirect to the new endpoint
  res.redirect('/api/trainings/mandatorytrainings/all');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/verify-employee',
      'GET /api/trainings/all',
      'GET /api/trainings/mandatorytrainings/all',
      'GET /api/trainings/user/:userId/assigned-trainings',
      'GET /api/trainings/user/:userId/mandatory-trainings',
      'POST /api/trainings',
      'POST /api/trainings/mandatorytrainings',
      'PUT /api/trainings/user/:userId/training/:trainingId/progress',
      'PUT /api/trainings/user/:userId/training/:trainingId/complete'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Employee Verification: http://localhost:${PORT}/api/verify-employee`);
  console.log(`📚 Training Endpoints:`);
  console.log(`   GET /api/trainings/all`);
  console.log(`   GET /api/trainings/mandatorytrainings/all`);
  console.log(`   GET /api/trainings/user/:userId/assigned-trainings`);
  console.log(`   GET /api/trainings/user/:userId/mandatory-trainings`);
  console.log(`   POST /api/trainings`);
  console.log(`   POST /api/trainings/mandatorytrainings`);
});

module.exports = app;
