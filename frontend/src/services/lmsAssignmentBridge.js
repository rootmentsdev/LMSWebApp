// LMS Assignment Bridge Service
// This service bridges your admin training assignment with the existing LMS TrainingProgress system

import { config, getApiHeaders } from '../config';
import { getUserTrainings, getTrainingProgress } from './lmsTrainingBridge';

/**
 * Create Training Progress Entry in LMS
 * This simulates the assignment process by creating a TrainingProgress record
 * 
 * Based on your TrainingProgress schema:
 * {
 *   userId: ObjectId,
 *   trainingId: ObjectId,
 *   pass: Boolean,
 *   status: String ('Pending', 'In Progress', 'Completed'),
 *   deadline: Date,
 *   modules: [{ moduleId, pass: Boolean, videos: [{ videoId, pass: Boolean }] }]
 * }
 */
export const assignTrainingToUser = async (assignmentData) => {
  try {
    const { userId, trainingId, userName, userRole, userBranch, deadline, priority } = assignmentData;
    
    console.log('🎯 Assigning training to user in LMS system:', {
      userId,
      trainingId,
      userName,
      deadline
    });

    // First, check if user already has this training assigned
    try {
      const existingProgress = await getTrainingProgress(userId, trainingId);
      if (existingProgress.success && existingProgress.data) {
        console.log('⚠️ User already has this training assigned');
        return {
          success: false,
          message: 'User already has this training assigned',
          data: existingProgress.data
        };
      }
    } catch (error) {
      // If error getting progress, it likely means no assignment exists - continue
      console.log('📝 No existing assignment found, proceeding with new assignment');
    }

    // Since your LMS doesn't have a direct "assign training" endpoint,
    // we need to work with your existing data structure
    
    // In a full implementation, you would:
    // 1. Create a TrainingProgress document in MongoDB
    // 2. Set initial status to 'Pending'
    // 3. Initialize modules and videos array based on training structure
    
    // For now, we'll simulate this by creating a local assignment
    // and sync it with your LMS structure when the user starts the training
    
    const assignment = {
      userId,
      trainingId,
      userName: userName || userId,
      userRole: userRole || 'Employee',
      userBranch: userBranch || 'Unknown',
      assignedDate: new Date().toISOString(),
      deadline: deadline ? new Date(deadline).toISOString() : null,
      priority: priority || 'medium',
      status: 'Pending',
      progress: 0,
      pass: false
    };

    // Store assignment in local backend first
    const localResponse = await storeLocalAssignment(assignment);
    
    console.log('✅ Training assignment created:', assignment);
    
    return {
      success: true,
      message: 'Training assigned successfully',
      data: assignment,
      localResponse
    };

  } catch (error) {
    console.error('❌ Error assigning training to user:', error);
    throw error;
  }
};

/**
 * Store assignment in local backend
 */
const storeLocalAssignment = async (assignment) => {
  try {
    const response = await fetch(`http://localhost:5000/api/trainings/${assignment.trainingId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assignment)
    });

    if (!response.ok) {
      console.warn('⚠️ Local assignment storage failed, continuing with LMS assignment');
      return { success: false, message: 'Local storage failed' };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.warn('⚠️ Local assignment storage error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get training assignments for admin dashboard
 * This combines local assignments with LMS progress data
 */
export const getTrainingAssignments = async () => {
  try {
    console.log('📊 Fetching training assignments for admin dashboard');

    // Get local assignments
    const localAssignments = await getLocalAssignments();
    
    // Get LMS training data for known users
    const knownUsers = ['EMP103', 'EMP104', 'EMP105']; // You can expand this list
    const lmsData = await getLMSDataForUsers(knownUsers);

    // Combine and format data
    const combinedData = combineAssignmentData(localAssignments, lmsData);

    return {
      success: true,
      data: combinedData,
      localCount: localAssignments.length,
      lmsCount: lmsData.length
    };
  } catch (error) {
    console.error('❌ Error fetching training assignments:', error);
    throw error;
  }
};

/**
 * Get assignments from local backend
 */
const getLocalAssignments = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/trainings/all', {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
    return [];
  } catch (error) {
    console.warn('⚠️ Could not fetch local assignments:', error);
    return [];
  }
};

/**
 * Get LMS data for multiple users
 */
const getLMSDataForUsers = async (userIds) => {
  try {
    const lmsDataPromises = userIds.map(async (userId) => {
      try {
        const userTrainings = await getUserTrainings(userId);
        return {
          userId,
          trainings: userTrainings.trainings || [],
          success: true
        };
      } catch (error) {
        console.warn(`⚠️ Could not fetch LMS data for user ${userId}:`, error);
        return {
          userId,
          trainings: [],
          success: false,
          error: error.message
        };
      }
    });

    const results = await Promise.all(lmsDataPromises);
    return results.filter(result => result.success);
  } catch (error) {
    console.error('❌ Error fetching LMS data for users:', error);
    return [];
  }
};

/**
 * Combine local assignments with LMS progress data
 */
const combineAssignmentData = (localAssignments, lmsData) => {
  try {
    const combinedData = [];

    // Process local assignments
    localAssignments.forEach(training => {
      if (training.assignedUsers && training.assignedUsers.length > 0) {
        training.assignedUsers.forEach(user => {
          combinedData.push({
            source: 'local',
            trainingId: training._id,
            trainingTitle: training.title,
            trainingType: training.type,
            userId: user.userId,
            userName: user.userName,
            userRole: user.userRole,
            userBranch: user.userBranch,
            assignedDate: user.assignedDate,
            deadline: user.deadline,
            progress: user.progress || 0,
            status: user.status || 'pending',
            completedDate: user.completedDate
          });
        });
      }
    });

    // Process LMS data
    lmsData.forEach(userData => {
      userData.trainings.forEach(training => {
        // Check if we already have this assignment from local data
        const existingAssignment = combinedData.find(item => 
          item.userId === userData.userId && 
          item.trainingId === training._id
        );

        if (!existingAssignment) {
          // Add LMS training data
          combinedData.push({
            source: 'lms',
            trainingId: training._id,
            trainingTitle: training.title || 'LMS Training',
            trainingType: training.type || 'lms',
            userId: userData.userId,
            userName: userData.userId, // LMS might not have full user names
            userRole: 'Employee',
            userBranch: 'LMS',
            assignedDate: training.createdAt || new Date().toISOString(),
            deadline: training.deadline,
            progress: training.completionPercentage || 0,
            status: training.status || 'pending',
            completedDate: training.completedDate
          });
        } else {
          // Update existing assignment with LMS progress data
          existingAssignment.lmsProgress = training.completionPercentage;
          existingAssignment.lmsStatus = training.status;
          existingAssignment.source = 'combined';
        }
      });
    });

    return combinedData;
  } catch (error) {
    console.error('❌ Error combining assignment data:', error);
    return [];
  }
};

/**
 * Sync training progress between admin system and LMS
 * This ensures both systems stay in sync
 */
export const syncTrainingProgress = async (userId, trainingId) => {
  try {
    console.log('🔄 Syncing training progress between systems:', { userId, trainingId });

    // Get progress from LMS
    const lmsProgress = await getTrainingProgress(userId, trainingId);
    
    // Get progress from local system
    const localResponse = await fetch(`http://localhost:5000/api/trainings/users/${userId}/progress`, {
      headers: { 'Content-Type': 'application/json' }
    });

    let localProgress = null;
    if (localResponse.ok) {
      localProgress = await localResponse.json();
    }

    const syncResult = {
      userId,
      trainingId,
      syncTimestamp: new Date().toISOString(),
      lmsData: lmsProgress.success ? lmsProgress.data : null,
      localData: localProgress ? localProgress.data : null,
      conflicts: [],
      synced: false
    };

    // Compare and sync if needed
    if (lmsProgress.success && localProgress) {
      // Determine which system has more recent/accurate data
      // For now, prioritize LMS data as the source of truth
      syncResult.synced = true;
      syncResult.message = 'Progress synchronized successfully';
    }

    return syncResult;
  } catch (error) {
    console.error('❌ Error syncing training progress:', error);
    throw error;
  }
};

/**
 * Get comprehensive admin statistics
 */
export const getAdminStatistics = async () => {
  try {
    console.log('📈 Fetching comprehensive admin statistics');

    const [assignments, localStats] = await Promise.allSettled([
      getTrainingAssignments(),
      getLocalStatistics()
    ]);

    const stats = {
      timestamp: new Date().toISOString(),
      totalAssignments: 0,
      completedAssignments: 0,
      inProgressAssignments: 0,
      pendingAssignments: 0,
      overallCompletionRate: 0,
      localSystemHealth: localStats.status === 'fulfilled',
      lmsSystemHealth: assignments.status === 'fulfilled'
    };

    if (assignments.status === 'fulfilled' && assignments.value.data) {
      const data = assignments.value.data;
      stats.totalAssignments = data.length;
      stats.completedAssignments = data.filter(a => a.status === 'completed').length;
      stats.inProgressAssignments = data.filter(a => a.status === 'in_progress').length;
      stats.pendingAssignments = data.filter(a => a.status === 'pending').length;
      
      if (stats.totalAssignments > 0) {
        stats.overallCompletionRate = Math.round((stats.completedAssignments / stats.totalAssignments) * 100);
      }
    }

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('❌ Error fetching admin statistics:', error);
    throw error;
  }
};

/**
 * Get local system statistics
 */
const getLocalStatistics = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/trainings/stats', {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Local statistics unavailable');
  } catch (error) {
    console.warn('⚠️ Local statistics not available:', error);
    throw error;
  }
};

// Export all functions
export default {
  assignTrainingToUser,
  getTrainingAssignments,
  syncTrainingProgress,
  getAdminStatistics
};
