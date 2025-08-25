import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrainingDashboard from '../components/TrainingConsumption/TrainingDashboard';
import { getUserAssignedTrainings, getUserMandatoryTrainings, verifyEmployee } from '../api/trainingApi';

const TrainingConsumption = () => {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({
    employeeId: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('consumptionUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setShowLogin(false);
      loadUserTrainings(userData.employeeId);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError(null);

    try {
      const response = await verifyEmployee(loginForm.employeeId, loginForm.password);
      
      if (response.status === 'success') {
        const userData = {
          employeeId: loginForm.employeeId,
          ...response.data
        };
        
        setUser(userData);
        localStorage.setItem('consumptionUser', JSON.stringify(userData));
        setShowLogin(false);
        loadUserTrainings(loginForm.employeeId);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  const loadUserTrainings = async (userId) => {
    try {
      setLoading(true);
      const [assignedResponse, mandatoryResponse] = await Promise.all([
        getUserAssignedTrainings(userId),
        getUserMandatoryTrainings(userId)
      ]);

      const allTrainings = [
        ...(assignedResponse.data || []),
        ...(mandatoryResponse.data || [])
      ];

      setTrainings(allTrainings);
    } catch (err) {
      setError('Failed to load trainings');
      console.error('Error loading trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('consumptionUser');
    setUser(null);
    setTrainings([]);
    setShowLogin(true);
    navigate('/training-consumption');
  };

  const handleInputChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Training Portal</h1>
            <p className="text-gray-600 mt-2">Sign in to access your training materials</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={loginForm.employeeId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your employee ID"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginForm.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If specific training is requested, show the training dashboard
  if (trainingId && user) {
    return (
      <div>
        {/* Header with logout */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/training-consumption')}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back to Trainings
              </button>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Welcome, {user.name || user.employeeId}</span>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <TrainingDashboard trainingId={trainingId} userId={user.employeeId} />
      </div>
    );
  }

  // Show training list
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Training Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name || user?.employeeId}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {trainings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">No trainings assigned yet.</div>
            <p className="text-gray-400 mt-2">Check back later for new training assignments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((training) => (
              <div
                key={training.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/training-consumption/${training.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{training.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      training.type === 'mandatory' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {training.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {training.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{training.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${training.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      training.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : training.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {training.status.replace('_', ' ')}
                    </span>
                    
                    {training.deadline && (
                      <span className="text-gray-500">
                        Due: {new Date(training.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingConsumption;

