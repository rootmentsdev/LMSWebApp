import axios from 'axios';

const API_BASE_URL = 'https://lms-testenv.onrender.com';

// Axios instance for all requests
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
export const testAPIConnection = async () => {
  try {
    const res = await api.get('/api/health');
    return res.data.status === 'success';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Get trainings assigned to a user
export const getUserAssignedTrainings = async (userId) => {
  try {
    const res = await api.get(`/api/trainings/user/${userId}/assigned-trainings`);
    // API returns { status, data, count }
    return res.data.data || [];
  } catch (error) {
    console.error('Error fetching assigned trainings:', error);
    return [];
  }
};

// Get mandatory trainings assigned to a user
export const getUserMandatoryTrainings = async (userId) => {
  try {
    const res = await api.get(`/api/trainings/user/${userId}/mandatory-trainings`);
    return res.data.data || [];
  } catch (error) {
    console.error('Error fetching mandatory trainings:', error);
    return [];
  }
};

// Update training progress for a user
export const updateTrainingProgress = async (userId, trainingId, progress) => {
  try {
    const res = await api.put(`/api/trainings/user/${userId}/training/${trainingId}/progress`, { progress });
    return res.data;
  } catch (error) {
    console.error('Error updating training progress:', error);
    throw error;
  }
};

// Mark training as completed
export const completeTraining = async (userId, trainingId) => {
  try {
    const res = await api.put(`/api/trainings/user/${userId}/training/${trainingId}/complete`);
    return res.data;
  } catch (error) {
    console.error('Error marking training as completed:', error);
    throw error;
  }
};

// Get all trainings (admin view)
export const getAllTrainings = async () => {
  try {
    const res = await api.get('/api/trainings/all');
    return res.data.data || [];
  } catch (error) {
    console.error('Error fetching all trainings:', error);
    return [];
  }
};

// Get all mandatory trainings (admin view)
export const getAllMandatoryTrainings = async () => {
  try {
    const res = await api.get('/api/trainings/mandatorytrainings/all');
    return res.data.data || [];
  } catch (error) {
    console.error('Error fetching mandatory trainings:', error);
    return [];
  }
};

// Admin APIs for creating training
export const createTraining = async (trainingData) => {
  try {
    const res = await api.post('/api/trainings', trainingData);
    return res.data;
  } catch (error) {
    console.error('Error creating training:', error);
    throw error;
  }
};

export const createMandatoryTraining = async (trainingData) => {
  try {
    const res = await api.post('/api/trainings/mandatorytrainings', trainingData);
    return res.data;
  } catch (error) {
    console.error('Error creating mandatory training:', error);
    throw error;
  }
};

// Reassign training (admin)
export const reassignTraining = async (reassignData) => {
  try {
    const res = await api.post('/api/user/reassign/training', reassignData);
    return res.data;
  } catch (error) {
    console.error('Error reassigning training:', error);
    throw error;
  }
};

// Assign module to user
export const assignModuleToUser = async (moduleData) => {
  try {
    const res = await api.post('/api/user/assign-module', moduleData);
    return res.data;
  } catch (error) {
    console.error('Error assigning module:', error);
    throw error;
  }
};

// Assign assessment to user
export const assignAssessmentToUser = async (assessmentData) => {
  try {
    const res = await api.post('/api/user/assign-assessment', assessmentData);
    return res.data;
  } catch (error) {
    console.error('Error assigning assessment:', error);
    throw error;
  }
};
