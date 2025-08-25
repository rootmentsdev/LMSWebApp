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
    
    // NEW: Log the first training to see its structure
    if (res.data && res.data.data && res.data.data.length > 0) {
      console.log('🔍 FIRST TRAINING STRUCTURE:', JSON.stringify(res.data.data[0], null, 2));
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

// Get module details by ID
export const getModuleDetails = async (moduleId) => {
  try {
    if (config.LOG_API_CALLS) {
      console.log(`🔍 Fetching module details for: ${moduleId}`);
    }
    
    const endpoint = buildEndpoint(config.ENDPOINTS.GET_MODULE_BY_ID, { id: moduleId });
    console.log(`🌐 Calling endpoint: ${endpoint}`);
    
    const res = await api.get(endpoint);
    
    if (config.LOG_API_CALLS) {
      console.log('📡 Module details response:', res.data);
    }
    
    return res.data || null;
  } catch (error) {
    console.error(`❌ Error fetching module ${moduleId}:`, error.response?.status || error.message);
    return null;
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

// Get video URLs for a specific module
export const getModuleVideoUrls = async (moduleId) => {
  try {
    console.log(`🔍 Fetching video URLs for module: ${moduleId}`);
    
    // Try to get module details from your endpoint
    const moduleDetails = await getModuleDetails(moduleId);
    
    if (moduleDetails && moduleDetails.videos) {
      console.log(`📡 Found module details with videos:`, moduleDetails.videos);
      
      // Map the videos with their URLs
      const videosWithUrls = moduleDetails.videos.map(video => ({
        _id: video._id || video.videoId,
        title: video.title || video.videoTitle || 'Untitled Video',
        videoUri: video.videoUri || video.url || video.videoUrl,
        questions: video.questions || [],
        description: video.description
      }));
      
      console.log(`✅ Videos with URLs:`, videosWithUrls);
      return videosWithUrls;
    }
    
    console.log(`⚠️ No videos found in module ${moduleId}`);
    return [];
  } catch (error) {
    console.error(`❌ Error fetching video URLs for module ${moduleId}:`, error);
    return [];
  }
};

// Fetch training with full module details
export const getTrainingWithModules = async (training) => {
  try {
    console.log(`🔍 Processing training: ${training.title}`);
    
    // Extract videos directly from userProgress structure
    let allVideos = [];
    let allModules = [];
    
    if (training.userProgress && training.userProgress.length > 0) {
      console.log(`👥 Found ${training.userProgress.length} user progress entries`);
      
      // Process each user progress entry
      for (const userProgress of training.userProgress) {
        if (userProgress.modules && userProgress.modules.length > 0) {
          console.log(`📚 User has ${userProgress.modules.length} modules`);
          
          for (const moduleProgress of userProgress.modules) {
            if (moduleProgress.videos && moduleProgress.videos.length > 0) {
              console.log(`🎥 Module has ${moduleProgress.videos.length} videos`);
              
              try {
                // Try to get actual module details with video URLs
                console.log(`🔍 Fetching module details for: ${moduleProgress.moduleId}`);
                const moduleDetails = await getModuleDetails(moduleProgress.moduleId);
                
                if (moduleDetails && moduleDetails.videos) {
                  console.log(`📡 Found module details with videos:`, moduleDetails.videos);
                  
                  // Map videos with real URLs from module
                  const moduleVideos = moduleDetails.videos.map(video => ({
                    _id: video._id || video.videoId,
                    title: video.title || video.videoTitle || 'Untitled Video',
                    videoUri: video.videoUri || video.url || video.videoUrl,
                    questions: video.questions || [],
                    pass: moduleProgress.videos.find(v => v.videoId === video._id)?.pass || false,
                    moduleName: moduleDetails.moduleName || 'Module',
                    moduleId: moduleProgress.moduleId
                  }));
                  
                  allVideos.push(...moduleVideos);
                  
                  const moduleInfo = {
                    _id: moduleProgress.moduleId,
                    moduleName: moduleDetails.moduleName || 'Module',
                    description: moduleDetails.description,
                    videos: moduleVideos
                  };
                  
                  allModules.push(moduleInfo);
                } else {
                  console.log(`⚠️ No videos found in module ${moduleProgress.moduleId}, using progress data`);
                  
                  // Fallback: create basic video structure from progress data
                  const moduleVideos = moduleProgress.videos.map((videoProgress, videoIndex) => ({
                    _id: videoProgress.videoId,
                    title: videoProgress.title || videoProgress.videoTitle || `Video ${videoIndex + 1}`,
                    videoUri: null, // No URL available
                    questions: [],
                    pass: videoProgress.pass || false,
                    moduleName: 'Module',
                    moduleId: moduleProgress.moduleId,
                    progressData: videoProgress
                  }));
                  
                  allVideos.push(...moduleVideos);
                  
                  const moduleInfo = {
                    _id: moduleProgress.moduleId,
                    moduleName: 'Module',
                    videos: moduleVideos
                  };
                  
                  allModules.push(moduleInfo);
                }
              } catch (moduleError) {
                console.error(`❌ Error fetching module ${moduleProgress.moduleId}:`, moduleError);
                
                // Fallback: create basic video structure from progress data
                const moduleVideos = moduleProgress.videos.map((videoProgress, videoIndex) => ({
                  _id: videoProgress.videoId,
                  title: videoProgress.title || videoProgress.videoTitle || `Video ${videoIndex + 1}`,
                  videoUri: null, // No URL available
                  questions: [],
                  pass: videoProgress.pass || false,
                  moduleName: 'Module',
                  moduleId: moduleProgress.moduleId,
                  progressData: videoProgress
                }));
                
                allVideos.push(...moduleVideos);
                
                const moduleInfo = {
                  _id: moduleProgress.moduleId,
                  moduleName: 'Module',
                  videos: moduleVideos
                };
                
                allModules.push(moduleInfo);
              }
            }
          }
        }
      }
    }
    
    console.log(`✅ Total videos extracted: ${allVideos.length}`);
    console.log(`✅ Total modules extracted: ${allModules.length}`);
    
    const enhancedTraining = {
      ...training,
      moduleDetails: allModules,
      videos: allVideos
    };
    
    console.log(`🎯 Enhanced training "${training.title}":`, enhancedTraining);
    
    return enhancedTraining;
  } catch (error) {
    console.error('❌ Error processing training:', error);
    return training;
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

// Test external API connection
export const testExternalAPIConnection = async () => {
  try {
    console.log('🧪 Testing external API connection...');
    
    // Test with dummy parameters to see if the endpoint exists
    const externalApiUrl = `${config.EXTERNAL_API_BASE_URL}/api/user/update/trainingprocess?userId=test&trainingId=test&moduleId=test&videoId=test`;
    
    console.log(`🌐 Testing PATCH request to external API: ${externalApiUrl}`);
    
    const externalApiHeaders = {
      'Content-Type': 'application/json',
    };

    // Add authentication if needed for external API
    if (config.USE_AUTH && config.API_TOKEN) {
      externalApiHeaders['Authorization'] = `Bearer ${config.API_TOKEN}`;
    }

    // Make direct axios call to external API
    await axios.patch(externalApiUrl, {}, {
      headers: externalApiHeaders,
      timeout: 10000, // 10 second timeout for testing
    });
    
    console.log('✅ External API endpoint is accessible');
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('❌ External API endpoint not found (404)');
      return false;
    } else if (error.response?.status === 400) {
      // If we get a 400, it means the endpoint exists but the parameters are invalid (which is expected)
      console.log('✅ External API endpoint exists (got 400 for test parameters)');
      return true;
    } else if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      console.error('❌ External API connection failed - possible CORS or network issue');
      return false;
    } else {
      console.error('❌ External API connection test failed:', error.response?.status || error.message);
      return false;
    }
  }
};

// Debug function to test the exact URL you want to call
export const debugExternalAPICall = async (userId, trainingId, moduleId, videoId) => {
  const externalApiUrl = `${config.EXTERNAL_API_BASE_URL}/api/user/update/trainingprocess?userId=${userId}&trainingId=${trainingId}&moduleId=${moduleId}&videoId=${videoId}`;
  
  console.log('🔍 DEBUG: Full external API URL:', externalApiUrl);
  console.log('🔍 DEBUG: External API Base URL:', config.EXTERNAL_API_BASE_URL);
  console.log('🔍 DEBUG: Parameters:', { userId, trainingId, moduleId, videoId });
  console.log('🔍 DEBUG: API Token:', config.API_TOKEN ? 'Present' : 'Missing');
  
  // Test if URL is reachable with a simple GET request first
  try {
    console.log('🧪 Testing URL accessibility with GET request...');
    await axios.get(config.EXTERNAL_API_BASE_URL, { timeout: 5000 });
    console.log('✅ Base URL is accessible');
  } catch (error) {
    console.error('❌ Base URL not accessible:', error.message);
  }
};

// Update training progress on external system (PATCH API)
// This calls an external API on a different domain/website
export const updateTrainingProgressExternal = async (userId, trainingId, moduleId, videoId) => {
  try {
    if (config.LOG_API_CALLS) {
      console.log(`📊 Updating external training progress - User: ${userId}, Training: ${trainingId}, Module: ${moduleId}, Video: ${videoId}`);
    }

    // Debug the call first
    await debugExternalAPICall(userId, trainingId, moduleId, videoId);

    // Validate required parameters
    if (!userId || !trainingId || !moduleId || !videoId) {
      throw new Error('Missing required parameters: userId, trainingId, moduleId, or videoId');
    }

    // Build the complete external API URL using configured external API base URL
    const externalApiUrl = `${config.EXTERNAL_API_BASE_URL}/api/user/update/trainingprocess?userId=${userId}&trainingId=${trainingId}&moduleId=${moduleId}&videoId=${videoId}`;

    console.log(`🌐 Making direct PATCH request to external API: ${externalApiUrl}`);

    // Create a new axios instance specifically for external API calls
    const externalApiHeaders = {
      'Content-Type': 'application/json',
    };

    // Add authentication if needed for external API
    if (config.USE_AUTH && config.API_TOKEN) {
      externalApiHeaders['Authorization'] = `Bearer ${config.API_TOKEN}`;
    }

    // Make direct axios call to external API (not using the local api instance)
    const res = await axios.patch(externalApiUrl, {}, {
      headers: externalApiHeaders,
      timeout: 30000, // 30 second timeout
      withCredentials: false, // Don't send cookies for cross-origin requests
    });

    if (config.LOG_API_CALLS) {
      console.log('📡 External API response:', res.data);
    }

    return res.data;
  } catch (error) {
    console.error('❌ Error updating external training progress:', error);
    console.error('❌ Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      message: error.message
    });

    // If it's a 404, provide more helpful error message
    if (error.response?.status === 404) {
      throw new Error('External training progress update endpoint not found. Please verify the external API URL and endpoint.');
    }

    // If it's an authentication error
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Authentication failed with external API. Please check your API token and permissions.');
    }

    // If it's a CORS error
    if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      throw new Error('Network error or CORS issue. The external API may not allow requests from this domain.');
    }

    throw error;
  }
};

// Test module endpoint specifically
export const testModuleEndpoint = async () => {
  try {
    console.log('🧪 Testing module endpoint...');
    
    // Test 1: Get all modules
    console.log('📡 Testing GET /api/modules...');
    const allModulesRes = await api.get(config.ENDPOINTS.GET_ALL_MODULES);
    console.log('✅ All modules response:', allModulesRes.data);
    
    // Test 2: If we have modules, test getting a specific one
    if (allModulesRes.data && allModulesRes.data.length > 0) {
      const firstModuleId = allModulesRes.data[0]._id;
      console.log(`🔍 Testing GET /api/modules/${firstModuleId}...`);
      
      try {
        const specificModuleRes = await getModuleDetails(firstModuleId);
        console.log(`✅ Module ${firstModuleId} details:`, specificModuleRes);
        
        if (specificModuleRes && specificModuleRes.videos) {
          console.log(`🎥 Videos in module ${firstModuleId}:`, specificModuleRes.videos);
          console.log(`📹 First video structure:`, specificModuleRes.videos[0]);
        } else {
          console.log(`⚠️ No videos found in module ${firstModuleId}`);
        }
      } catch (specificError) {
        console.error(`❌ Error getting specific module ${firstModuleId}:`, specificError);
      }
    }
    
    return allModulesRes.data;
  } catch (error) {
    console.error('❌ Module endpoint failed:', error);
    return null;
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
  console.log('🔄 Transforming training data:', {
    original: {
      trainingId: training.trainingId,
      trainingName: training.trainingName,
      assignedFor: training.assignedFor,
      Assignedfor: training.Assignedfor
    }
  });
  
  return {
    id: training._id || training.trainingId,
    title: training.trainingName || training.trainingTitle,
    description: training.description,
    type: training.Trainingtype?.toLowerCase() || 'regular',
    progress: parseFloat(training.averageCompletionPercentage) || 0,
    status: (parseFloat(training.averageCompletionPercentage) >= 100) ? 'completed' : 'in_progress',
    deadline: training.deadline ? new Date(training.deadline * 1000) : null,
    assignedDate: training.createdDate ? new Date(training.createdDate) : null,
    completedDate: (parseFloat(training.averageCompletionPercentage) >= 100) ? new Date() : null,
    modules: training.modules || [],
    numberOfModules: training.numberOfModules || 0,
    // Fix: Check both field names to handle API variations
    assignedFor: training.assignedFor || training.Assignedfor || [],
    createdBy: training.createdBY,
    createdAt: training.createdDate,
    updatedAt: training.editedDate,
    // New fields for enhanced data
    totalUsers: training.totalUsers || 0,
    userProgress: training.userProgress || [],
    // Video and module details (will be populated by getTrainingWithModules)
    moduleDetails: training.moduleDetails || [],
    videos: training.videos || []
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

