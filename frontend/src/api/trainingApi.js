import baseUrl from './api';

// API functions for training consumption site

// Get user's assigned trainings
export const getUserAssignedTrainings = async (userId) => {
  try {
    const response = await fetch(`${baseUrl.baseUrl}api/trainings/user/${userId}/assigned-trainings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user assigned trainings:', error);
    throw error;
  }
};

// Get user's mandatory trainings
export const getUserMandatoryTrainings = async (userId) => {
  try {
    const response = await fetch(`${baseUrl.baseUrl}api/trainings/user/${userId}/mandatory-trainings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user mandatory trainings:', error);
    throw error;
  }
};

// Get detailed training information with progress
export const getUserTrainingDetails = async (userId, trainingId) => {
  try {
    const response = await fetch(`${baseUrl.baseUrl}api/trainings/user/${userId}/training/${trainingId}/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching training details:', error);
    throw error;
  }
};

// Update video progress
export const updateVideoProgress = async (userId, trainingId, moduleId, videoId, progressData) => {
  try {
    const response = await fetch(
      `${baseUrl.baseUrl}api/trainings/user/${userId}/training/${trainingId}/module/${moduleId}/video/${videoId}/progress`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating video progress:', error);
    throw error;
  }
};

// Update overall training progress
export const updateTrainingProgress = async (userId, trainingId, progress) => {
  try {
    const response = await fetch(
      `${baseUrl.baseUrl}api/trainings/user/${userId}/training/${trainingId}/progress`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating training progress:', error);
    throw error;
  }
};

// Mark training as completed
export const completeTraining = async (userId, trainingId) => {
  try {
    const response = await fetch(
      `${baseUrl.baseUrl}api/trainings/user/${userId}/training/${trainingId}/complete`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error completing training:', error);
    throw error;
  }
};

// Verify employee credentials
export const verifyEmployee = async (employeeId, password) => {
  try {
    const response = await fetch(`${baseUrl.baseUrl}api/verify-employee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying employee:', error);
    throw error;
  }
};

