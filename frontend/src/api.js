import axios from 'axios';
import { config, buildEndpoint, getApiHeaders } from './config';

// Axios instance for all requests
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: getApiHeaders(),
});

// Health check - test connection to your existing system
export const testAPIConnection = async () => {
  try {
    // Try to test with a simple endpoint since health might not exist
    const res = await api.get(config.ENDPOINTS.GET_ALL_USER_TRAININGS);
    return res.status === 200;
  } catch (error) {
    console.error('❌ API health check failed:', error);
    return false;
  }
};

// Get all user trainings (your main endpoint)
export const getUserAssignedTrainings = async (userId = null) => {
  try {
    if (config.LOG_API_CALLS) {
      console.log('🔍 Fetching all user trainings...');
    }
    
    // Use your main endpoint that returns all user trainings
    const res = await api.get(config.ENDPOINTS.GET_USER_TRAININGS_WITH_COMPLETION);
    
    if (config.LOG_API_CALLS) {
      console.log('📡 API Response:', res.data);
    }
    
    // Handle your data structure: { data: [...] }
    if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data.data;
    } else if (res.data && Array.isArray(res.data)) {
      return res.data;
    } else {
      console.warn('⚠️ Unexpected API response format:', res.data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching user trainings:', error);
    return [];
  }
};

// Get mandatory trainings specifically
export const getUserMandatoryTrainings = async (userId = null) => {
  try {
    if (config.LOG_API_CALLS) {
      console.log('🔍 Fetching mandatory trainings...');
    }
    
    const res = await api.get(config.ENDPOINTS.GET_MANDATORY_TRAININGS);
    
    if (config.LOG_API_CALLS) {
      console.log('📡 Mandatory trainings response:', res.data);
    }
    
    // Handle your data structure: { data: [...] }
    if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data.data;
    } else if (res.data && Array.isArray(res.data)) {
      return res.data;
    } else {
      console.warn('⚠️ Unexpected mandatory trainings response format:', res.data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching mandatory trainings:', error);
    
    // Fallback: try to get mandatory trainings from all trainings
    try {
      const allTrainings = await getUserAssignedTrainings();
      return allTrainings.filter(training => 
        training.Trainingtype === 'Mandatory' || training.Trainingtype === 'mandatory'
      );
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      return [];
    }
  }
};

// Get all modules for training details
export const getAllModules = async () => {
  try {
    const res = await api.get(config.ENDPOINTS.GET_ALL_MODULES);
    return res.data || [];
  } catch (error) {
    console.error('❌ Error fetching modules:', error);
    return [];
  }
};

// Get all assessments
export const getAllAssessments = async () => {
  try {
    const res = await api.get(config.ENDPOINTS.GET_ALL_ASSESSMENTS);
    return res.data || [];
  } catch (error) {
    console.error('❌ Error fetching assessments:', error);
    return [];
  }
};

// Get assessment details by ID
export const getAssessmentDetails = async (assessmentId) => {
  try {
    const res = await api.get(buildEndpoint(config.ENDPOINTS.GET_ASSESSMENT_DETAILS, { id: assessmentId }));
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching assessment details:', error);
    return null;
  }
};

// Update training progress (if endpoint exists)
export const updateTrainingProgress = async (trainingId, progress) => {
  try {
    if (config.LOG_API_CALLS) {
      console.log(`📊 Updating progress for training ${trainingId}: ${progress}%`);
    }
    
    const res = await api.put(buildEndpoint(config.ENDPOINTS.UPDATE_TRAINING_PROGRESS, { trainingId }), { progress });
    return res.data;
  } catch (error) {
    console.error('❌ Error updating training progress:', error);
    throw error;
  }
};

// Mark training as completed (if endpoint exists)
export const completeTraining = async (trainingId) => {
  try {
    if (config.LOG_API_CALLS) {
      console.log(`✅ Marking training ${trainingId} as completed`);
    }
    
    const res = await api.put(buildEndpoint(config.ENDPOINTS.COMPLETE_TRAINING, { trainingId }));
    return res.data;
  } catch (error) {
    console.error('❌ Error marking training as completed:', error);
    throw error;
  }
};

// Helper function to test different API endpoints
export const testEndpoints = async () => {
  const endpoints = [
    config.ENDPOINTS.GET_ALL_USER_TRAININGS,
    config.ENDPOINTS.GET_USER_TRAININGS_WITH_COMPLETION,
    config.ENDPOINTS.GET_MANDATORY_TRAININGS,
    config.ENDPOINTS.GET_ALL_ASSESSMENTS,
    config.ENDPOINTS.GET_ALL_MODULES
  ];
  
  console.log('🧪 Testing available endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const res = await api.get(endpoint);
      console.log(`✅ ${endpoint} - Status: ${res.status}, Data count:`, res.data?.data?.length || res.data?.length || 'N/A');
    } catch (error) {
      console.log(`❌ ${endpoint} - Failed:`, error.response?.status || error.message);
    }
  }
};

// Data transformation helper to match your frontend expectations
export const transformTrainingData = (training) => {
  return {
    id: training._id,
    title: training.trainingName,
    description: training.description,
    type: training.Trainingtype?.toLowerCase() || 'regular',
    progress: training.averageCompletionPercentage || 0,
    status: (training.averageCompletionPercentage >= 100) ? 'completed' : 'in_progress',
    deadline: training.deadline ? new Date(training.deadline * 1000) : null,
    assignedDate: training.createdDate ? new Date(training.createdDate) : null,
    completedDate: (training.averageCompletionPercentage >= 100) ? new Date() : null,
    modules: training.modules || [],
    numberOfModules: training.numberOfModules || 0,
    assignedFor: training.Assignedfor || [],
    createdBy: training.createdBY,
    createdAt: training.createdDate,
    updatedAt: training.editedDate
  };
};

// Get all trainings (admin view) - if you need this
export const getAllTrainings = async () => {
  try {
    const res = await api.get(config.ENDPOINTS.GET_ALL_USER_TRAININGS);
    return res.data?.data || [];
  } catch (error) {
    console.error('❌ Error fetching all trainings:', error);
    return [];
  }
};

// Admin APIs for creating training (if you need these)
export const createTraining = async (trainingData) => {
  try {
    const res = await api.post(config.ENDPOINTS.GET_TRAINING_BY_ID.replace('/:id', ''), trainingData);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating training:', error);
    throw error;
  }
};

export const createMandatoryTraining = async (trainingData) => {
  try {
    const res = await api.post('/api/mandatorytrainings', trainingData);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating mandatory training:', error);
    throw error;
  }
};

// Legacy functions for backward compatibility
export const reassignTraining = async (reassignData) => {
  try {
    const res = await api.post('/api/user/reassign/training', reassignData);
    return res.data;
  } catch (error) {
    console.error('❌ Error reassigning training:', error);
    throw error;
  }
};

export const assignModuleToUser = async (moduleData) => {
  try {
    const res = await api.post('/api/user/assign-module', moduleData);
    return res.data;
  } catch (error) {
    console.error('❌ Error assigning module:', error);
    throw error;
  }
};

export const assignAssessmentToUser = async (assessmentData) => {
  try {
    const res = await api.post('/api/user/assign-assessment', assessmentData);
    return res.data;
  } catch (error) {
    console.error('❌ Error assigning assessment:', error);
    throw error;
  }
};
