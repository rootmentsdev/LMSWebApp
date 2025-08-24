// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { config } from '../config';
// import { 
//   Container, 
//   Row, 
//   Col, 
//   Card, 
//   Button, 
//   Badge,
//   ProgressBar,
//   Spinner,
//   Alert,
//   Form,
//   Modal
// } from 'react-bootstrap';
// import { 
//   PlayFill, 
//   CheckCircleFill, 
//   LockFill,
//   X,
//   JournalText,
//   ArrowLeft
// } from 'react-bootstrap-icons';
// import { 
//   getUserAssignedTrainings, 
//   getUserMandatoryTrainings,
//   testAPIConnection,
//   updateTrainingProgress,
//   completeTraining,
//   testEndpoints,
//   transformTrainingData,
//   getTrainingWithModules,
//   testModuleEndpoint,
//   getModuleVideoUrls
// } from '../api';
// import VideoPlayer from '../components/VideoPlayer';

// const Training = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState('assigned');
//   const [assignedTrainings, setAssignedTrainings] = useState([]);
//   const [mandatoryTrainings, setMandatoryTrainings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [apiStatus, setApiStatus] = useState('unknown');
//   const [testUserId, setTestUserId] = useState('user123');
//   const [debugInfo, setDebugInfo] = useState('');
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [showVideoModal, setShowVideoModal] = useState(false);
//   const [userProgress, setUserProgress] = useState({});
//   const [currentUserId] = useState('user123');
//   const [inlineVideo, setInlineVideo] = useState(null);
//   const [selectedTraining, setSelectedTraining] = useState(null);
//   const [showModulesView, setShowModulesView] = useState(false);
//   const [videoProgress, setVideoProgress] = useState({}); // Track video watch progress
//   const [videoStartTime, setVideoStartTime] = useState({}); // Track when video started
//   const [youtubeProgressTimer, setYoutubeProgressTimer] = useState({}); // Timer for YouTube progress simulation
//   const [videoWatchedTime, setVideoWatchedTime] = useState({}); // Track actual watched time
//   const [lastValidTime, setLastValidTime] = useState({}); // Track last valid playback time
//   const [videoSkipAttempts, setVideoSkipAttempts] = useState({}); // Track skip attempts

//   // Get current employee data for filtering trainings
//   const [currentEmployee, setCurrentEmployee] = useState(null);

//   // Load current employee data from localStorage
//   useEffect(() => {
//     const storedEmployeeData = localStorage.getItem("employeeData");
//     if (storedEmployeeData) {
//       try {
//         const employeeData = JSON.parse(storedEmployeeData);
//         setCurrentEmployee(employeeData);
//         console.log('👤 Current employee loaded:', employeeData);
//       } catch (err) {
//         console.error('Error parsing employee data:', err);
//         // Clear invalid data and redirect to login
//         localStorage.removeItem("employeeData");
//         navigate('/login');
//       }
//     } else {
//       // Redirect to login if no employee data found
//       console.log('❌ No employee data found, redirecting to login...');
//       navigate('/login');
//     }
//   }, [navigate]);

//   useEffect(() => {
//     if (currentEmployee && currentEmployee.employeeId) {
//       console.log('👤 Employee data loaded, fetching trainings...');
//     fetchUserTrainings();
//     } else if (currentEmployee === null) {
//       console.log('❌ No employee data, not fetching trainings');
//     }
//   }, [currentEmployee]);

//   // Cleanup timers on unmount
//   useEffect(() => {
//     return () => {
//       // Clear all YouTube progress timers
//       Object.values(youtubeProgressTimer).forEach(timer => {
//         if (timer) clearInterval(timer);
//       });
//     };
//   }, [youtubeProgressTimer]);

//   // Load user progress from localStorage
//   useEffect(() => {
//     const savedProgress = localStorage.getItem(`userProgress_${currentUserId}`);
//     if (savedProgress) {
//       try {
//         const parsedProgress = JSON.parse(savedProgress);
//         setUserProgress(parsedProgress);
//         console.log('📊 Loaded user progress:', parsedProgress);
//       } catch (err) {
//         console.error('Error parsing saved progress:', err);
//       }
//     }
//   }, [currentUserId]);

//   const testConnection = async () => {
//     try {
//       setApiStatus('testing');
//       setDebugInfo('Testing API connection...');
      
//       const isConnected = await testAPIConnection();
//       setApiStatus(isConnected ? 'connected' : 'failed');
      
//       if (isConnected) {
//         setDebugInfo('API connection successful! Fetching trainings...');
//         await fetchUserTrainings();
//       } else {
//         setDebugInfo('API connection failed. Check the URL and authentication.');
//       }
//     } catch (err) {
//       setApiStatus('failed');
//       setDebugInfo(`Connection test failed: ${err.message}`);
//       console.error('Connection test failed:', err);
//     }
//   };

//   const testAllEndpoints = async () => {
//     try {
//       setDebugInfo('Testing all available endpoints...');
//       await testEndpoints();
//       setDebugInfo('Endpoint testing completed. Check console for results.');
//     } catch (err) {
//       setDebugInfo(`Endpoint testing failed: ${err.message}`);
//       console.error('Endpoint testing failed:', err);
//     }
//   };

//   const fetchUserTrainings = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       setDebugInfo('Fetching trainings from your API...');
      
//         if (!currentEmployee) {
//     setError('Employee data not available. Please login again.');
//     setLoading(false);
//     return;
//   }
  
//   // Check if user is logged in
//   const isLoggedIn = localStorage.getItem("employeeData");
//   if (!isLoggedIn) {
//     setError('Please login to view your trainings.');
//     setLoading(false);
//     return;
//   }
      
//       console.log('🔍 Fetching trainings for employee:', currentEmployee.employeeId);
//       console.log('👤 Employee details:', {
//         employeeId: currentEmployee.employeeId,
//         designation: currentEmployee.role,
//         branch: currentEmployee.Store
//       });
      
//       const [assignedData, mandatoryData] = await Promise.all([
//         getUserAssignedTrainings(),
//         getUserMandatoryTrainings()
//       ]);
      
//       console.log('📚 Raw assigned trainings:', assignedData);
//       console.log('📚 Raw mandatory trainings:', mandatoryData);
      
//       // Filter trainings based on current employee's criteria
//       const filterTrainingsByEmployee = (trainings) => {
//         if (!Array.isArray(trainings)) return [];
        
//         console.log('🔍 Starting to filter trainings for employee:', currentEmployee.employeeId);
//         console.log('🔍 Total trainings to filter:', trainings.length);
        
//         // Log current employee data structure
//         console.log('🔍 Current Employee Data Structure:', {
//           employeeId: currentEmployee.employeeId,
//           role: currentEmployee.role,
//           Store: currentEmployee.Store,
//           name: currentEmployee.name,
//           // Log all available properties
//           allProperties: Object.keys(currentEmployee),
//           fullEmployeeData: currentEmployee
//         });
        
//         const filtered = trainings.filter(training => {
//           // Log the *transformed* training structure to debug
//           console.log('🔍 FILTERING TRANSFORMED DATA:', {
//             id: training.id,
//             title: training.title,
//             assignedFor: training.assignedFor, // This will now be consistently present
//             designation: training.designation, // This will now be consistently present
//             branch: training.branch,           // This will now be consistently present
//             // Show the actual values to confirm transformation worked
//             rawAssignedFor: training.assignedFor,
//             rawDesignation: training.designation,
//             rawBranch: training.branch
//           });
          
//           // Check if training is assigned to this specific employee
//           // Try multiple possible field names for assignment
//           const isAssignedToEmployee = (
//             // Check assignedTo field
//             (training.assignedTo && 
//              (training.assignedTo === currentEmployee.employeeId ||
//               (Array.isArray(training.assignedTo) && training.assignedTo.includes(currentEmployee.employeeId)))) ||
//             // Check assignedFor field (from the transformed data) - this can contain employee IDs, roles, or other criteria
//             (training.assignedFor && Array.isArray(training.assignedFor) && 
//              training.assignedFor.some(assignment => {
//                // Check if it's an employee ID assignment
//                if (typeof assignment === 'string' && assignment.startsWith('Emp')) {
//                  return assignment === currentEmployee.employeeId;
//                }
//                // Check if it's a role/designation assignment (case-insensitive)
//                if (typeof assignment === 'string') {
//                  return assignment.toLowerCase() === currentEmployee.role.toLowerCase();
//                }
//                // Check if it's an object assignment with employeeId or role
//                if (typeof assignment === 'object' && assignment !== null) {
//                  return (assignment.employeeId === currentEmployee.employeeId) ||
//                         (assignment.role && assignment.role.toLowerCase() === currentEmployee.role.toLowerCase());
//                }
//                return false;
//              })) ||
//             // Check assignedUsers field (from your backend model)
//             (training.assignedUsers && Array.isArray(training.assignedUsers) &&
//              training.assignedUsers.some(user => 
//                user.userId === currentEmployee.employeeId ||
//                user.employeeId === currentEmployee.employeeId
//              ))
//           );
          
//           // Check if training matches employee's designation/role
//           // Try multiple possible field names for role/designation
//           const matchesDesignation = (
//             // Check designation field
//             (training.designation && 
//              (training.designation === currentEmployee.role ||
//               (Array.isArray(training.designation) && training.designation.includes(currentEmployee.role)))) ||
//             // Check role field
//             (training.role && 
//              (training.role === currentEmployee.role ||
//               (Array.isArray(training.role) && training.role.includes(currentEmployee.role)))) ||
//             // Check if assignedFor contains role-based assignment (this is the key fix!)
//             (training.assignedFor && Array.isArray(training.assignedFor) &&
//              training.assignedFor.some(assignment => {
//                // Check if it's a string role assignment
//                if (typeof assignment === 'string') {
//                  return assignment.toLowerCase() === currentEmployee.role.toLowerCase();
//                }
//                // Check if it's an object assignment with role/designation
//                if (typeof assignment === 'object' && assignment !== null) {
//                  return assignment.role === currentEmployee.role ||
//                         assignment.designation === currentEmployee.role;
//                }
//                return false;
//              }))
//           );
          
//           // Check if training matches employee's branch/store
//           // Try multiple possible field names for branch/store
//           const matchesBranch = (
//             // Check branch field
//             (training.branch && 
//              (training.branch === currentEmployee.Store ||
//               (Array.isArray(training.branch) && training.branch.includes(currentEmployee.Store)))) ||
//             // Check store field
//             (training.store && 
//              (training.store === currentEmployee.Store ||
//               (Array.isArray(training.store) && training.store.includes(currentEmployee.Store)))) ||
//             // Check Store field (capitalized)
//             (training.Store && 
//              (training.Store === currentEmployee.Store ||
//               (Array.isArray(training.Store) && training.Store.includes(currentEmployee.Store)))) ||
//             // Check if assignedFor contains branch-based assignment
//             (training.assignedFor && Array.isArray(training.assignedFor) &&
//              training.assignedFor.some(assignment => {
//                // Check if it's a string branch assignment
//                if (typeof assignment === 'string') {
//                  return assignment.toLowerCase() === currentEmployee.Store.toLowerCase();
//                }
//                // Check if it's an object assignment with branch/store
//                if (typeof assignment === 'object' && assignment !== null) {
//                  return assignment.branch === currentEmployee.Store ||
//                         assignment.store === currentEmployee.Store ||
//                         assignment.Store === currentEmployee.Store;
//                }
//                return false;
//              }))
//           );
          
//           // Training should match at least one of these criteria
//           const isRelevant = isAssignedToEmployee || matchesDesignation || matchesBranch;
          
//           console.log(`🔍 Training "${training.title || 'Untitled'}" filter results:`, {
//             trainingId: training.id, // Use transformed 'id'
//             assignedFor: training.assignedFor, // Use transformed 'assignedFor'
//             designation: training.designation, // Use transformed 'designation'
//             branch: training.branch,           // Use transformed 'branch'
//             employeeId: currentEmployee.employeeId,
//             employeeRole: currentEmployee.role,
//             employeeBranch: currentEmployee.Store,
//             isAssignedToEmployee,
//             matchesDesignation,
//             matchesBranch,
//             isRelevant
//           });
          
//           return isRelevant;
//         });
        
//         console.log('🔍 Filtering complete. Original count:', trainings.length, 'Filtered count:', filtered.length);
//         return filtered;
//       };
      
//       // --- Apply transformation BEFORE filtering ---
//       const transformedAssignedData = await Promise.all(assignedData.map(t => transformTrainingData(t)));
//       const transformedMandatoryData = await Promise.all(mandatoryData.map(t => transformTrainingData(t)));
      
//       console.log('🔄 TRANSFORMATION COMPLETE - Sample of transformed data:');
//       console.log('🔄 First transformed assigned training:', transformedAssignedData[0]);
//       console.log('🔄 First transformed mandatory training:', transformedMandatoryData[0]);
      
//       // Now filter the *transformed* data
//       const filteredAssigned = filterTrainingsByEmployee(transformedAssignedData);
//       const filteredMandatory = filterTrainingsByEmployee(transformedMandatoryData);
      
//       console.log('🔍 Filtered assigned trainings (after transformation):', filteredAssigned);
//       console.log('🔍 Filtered mandatory trainings (after transformation):', filteredMandatory);
      
//       // These are already transformed and filtered, so no further transformation needed
//       setAssignedTrainings(filteredAssigned);
//       setMandatoryTrainings(filteredMandatory);
      
//       // Enhance with video data (if applicable)
//       try {
//         const enhancedAssigned = await Promise.all(
//           filteredAssigned.map(training => getTrainingWithModules(training))
//         );
        
//         const enhancedMandatory = await Promise.all(
//           filteredMandatory.map(training => getTrainingWithModules(training))
//         );
        
//         console.log('🎥 Enhanced assigned trainings with videos:', enhancedAssigned);
//         console.log('🎥 Enhanced mandatory trainings with videos:', enhancedMandatory);
        
//         setAssignedTrainings(enhancedAssigned || []);
//         setMandatoryTrainings(enhancedMandatory || []);
//       } catch (enhancementError) {
//         console.error('❌ Error enhancing trainings:', enhancementError);
//         setAssignedTrainings(filteredAssigned || []);
//         setMandatoryTrainings(filteredMandatory || []);
//         setDebugInfo('Videos may not display due to enhancement error. Check console for details.');
//       }
      
//       setApiStatus('connected');
//       const totalOriginal = (assignedData?.length || 0) + (mandatoryData?.length || 0);
//       const totalFiltered = (filteredAssigned?.length || 0) + (filteredMandatory?.length || 0);
      
//       if (totalOriginal > totalFiltered) {
//         setDebugInfo(`✅ Fetched ${totalOriginal} total trainings, filtered to ${totalFiltered} relevant trainings for ${currentEmployee.employeeId} (${currentEmployee.role} at ${currentEmployee.Store})`);
//       } else {
//         setDebugInfo(`✅ Fetched ${totalFiltered} trainings for ${currentEmployee.employeeId} (${currentEmployee.role} at ${currentEmployee.Store})`);
//       }
      
//     } catch (err) {
//       console.error('❌ Error fetching trainings:', err);
//       setError(`Failed to fetch trainings: ${err.message}`);
//       setApiStatus('failed');
//       setDebugInfo(`Error: ${err.message}`);
      
//       setAssignedTrainings([]);
//       setMandatoryTrainings([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStartVideo = async (video) => {
//     console.log('🎬 Starting video with object:', video);
    
//     if (!video) {
//       console.error('❌ Invalid video object:', video);
//       setError('Invalid video data. Please try again.');
//       return;
//     }
    
//     if (video.videoUri) {
//       console.log('✅ Video has URL, opening modal:', video.videoUri);
//       setSelectedVideo({
//         ...video,
//         trainingId: selectedTraining?._id || selectedTraining?.id
//       });
//       setShowVideoModal(true);
//     } else {
//       console.error('❌ No video URL available for:', video._id);
//       setError('Video URL not available. Please check with your administrator.');
//     }
//   };

//   const handleCloseVideoModal = () => {
//     setShowVideoModal(false);
//     setSelectedVideo(null);
//   };

//   const handleVideoComplete = (video, moduleIndex, videoIndex) => {
//     console.log('🎯 Video completed:', video, 'Module:', moduleIndex, 'Video:', videoIndex);
    
//     // Get the current training context (we need to find which training this video belongs to)
//     let currentTraining = null;
//     if (inlineVideo && inlineVideo.trainingId) {
//       currentTraining = inlineVideo.trainingId;
//     } else if (selectedVideo && selectedVideo.trainingId) {
//       currentTraining = selectedVideo.trainingId;
//     }
    
//     if (currentTraining) {
//       // Create training-specific progress tracking
//       const trainingProgressKey = `training_${currentTraining}`;
//       const currentTrainingProgress = userProgress[trainingProgressKey] || {};
      
//       const newTrainingProgress = {
//         ...currentTrainingProgress,
//         completedVideos: [...(currentTrainingProgress.completedVideos || []), video._id],
//         lastCompletedVideo: video._id,
//         lastCompletedAt: new Date().toISOString()
//       };
      
//       // Check if this training is now complete
//       const training = [...assignedTrainings, ...mandatoryTrainings].find(t => 
//         (t._id || t.id) === currentTraining
//       );
      
//       if (training && training.moduleDetails) {
//         const totalVideos = training.moduleDetails.reduce((total, module) => 
//           total + (module.videos ? module.videos.length : 0), 0
//         );
        
//         if (newTrainingProgress.completedVideos.length >= totalVideos) {
//           // Mark training as completed
//           newTrainingProgress.trainingCompleted = true;
//           newTrainingProgress.completedAt = new Date().toISOString();
//           console.log('🎉 Training completed:', training.title);
//         }
//       }
      
//       const newProgress = {
//         ...userProgress,
//         [trainingProgressKey]: newTrainingProgress,
//         lastCompletedVideo: video._id,
//         lastCompletedAt: new Date().toISOString()
//       };
      
//       setUserProgress(newProgress);
//       localStorage.setItem(`userProgress_${currentUserId}`, JSON.stringify(newProgress));
      
//       // Refresh trainings to update UI
//       setTimeout(() => {
//         fetchUserTrainings();
//       }, 100);
//     } else {
//       // Fallback to global progress if no training context
//       const newProgress = {
//         ...userProgress,
//         completedVideos: [...(userProgress.completedVideos || []), video._id],
//         lastCompletedAt: new Date().toISOString()
//       };
      
//       setUserProgress(newProgress);
//       localStorage.setItem(`userProgress_${currentUserId}`, JSON.stringify(newProgress));
//     }
    
//     // Show success message
//     alert(`🎉 Congratulations! You've completed "${video.title}"`);
    
//     // Close video modal
//     handleCloseVideoModal();
//   };

//   const handleInlineVideo = (video, moduleIndex, videoIndex) => {
//     console.log('🎬 Playing inline video:', video);
//     console.log('🎬 Video details:', {
//       title: video.title,
//       videoUri: video.videoUri,
//       url: video.url,
//       _id: video._id,
//       moduleIndex,
//       videoIndex
//     });
    
//     // Check if video has a valid URL
//     if (!video.videoUri && !video.url) {
//       setError('No video URL available. Please check the video configuration.');
//       return;
//     }
    
//     // Initialize tracking for this video
//     const videoKey = video._id;
//     setVideoWatchedTime(prev => ({
//       ...prev,
//       [videoKey]: 0
//     }));
//     setLastValidTime(prev => ({
//       ...prev,
//       [videoKey]: 0
//     }));
//     setVideoSkipAttempts(prev => ({
//       ...prev,
//       [videoKey]: 0
//     }));
    
//     setInlineVideo({
//       ...video,
//       moduleIndex,
//       videoIndex,
//       trainingId: selectedTraining?._id || selectedTraining?.id
//     });
//     setShowVideoModal(false);
//     setSelectedVideo(null);
//   };

//   const closeInlineVideo = () => {
//     // Clean up YouTube progress timer if exists
//     if (inlineVideo && inlineVideo._id && youtubeProgressTimer[inlineVideo._id]) {
//       clearInterval(youtubeProgressTimer[inlineVideo._id]);
//       setYoutubeProgressTimer(prev => {
//         const newTimers = { ...prev };
//         delete newTimers[inlineVideo._id];
//         return newTimers;
//       });
//     }
    
//     // Clean up video tracking
//     if (inlineVideo && inlineVideo._id) {
//       const videoKey = inlineVideo._id;
//       setVideoWatchedTime(prev => {
//         const newState = { ...prev };
//         delete newState[videoKey];
//         return newState;
//       });
//       setLastValidTime(prev => {
//         const newState = { ...prev };
//         delete newState[videoKey];
//         return newState;
//       });
//       setVideoSkipAttempts(prev => {
//         const newState = { ...prev };
//         delete newState[videoKey];
//         return newState;
//       });
//     }
    
//     setInlineVideo(null);
//   };

//   // Handle video seeking prevention
//   const handleVideoSeeking = (e, videoKey) => {
//     const video = e.target;
//     const lastValid = lastValidTime[videoKey] || 0;
    
//     console.log('🚫 Seeking attempt detected:', {
//       currentTime: video.currentTime,
//       lastValidTime: lastValid,
//       difference: video.currentTime - lastValid
//     });
    
//     // If user tries to seek forward more than 2 seconds, reset to last valid time
//     if (video.currentTime > lastValid + 2) {
//       console.log('🚫 Preventing forward seeking, resetting to:', lastValid);
//       video.currentTime = lastValid;
      
//       // Track skip attempts
//       setVideoSkipAttempts(prev => ({
//         ...prev,
//         [videoKey]: (prev[videoKey] || 0) + 1
//       }));
      
//       // Show warning after multiple attempts
//       const attempts = videoSkipAttempts[videoKey] || 0;
//       if (attempts >= 2) {
//         alert('⚠️ Please watch the complete video without skipping. Fast forwarding is not allowed.');
//       }
      
//       return;
//     }
    
//     // Allow backward seeking (replay)
//     if (video.currentTime < lastValid) {
//       console.log('✅ Allowing backward seeking (replay)');
//       setLastValidTime(prev => ({
//         ...prev,
//         [videoKey]: video.currentTime
//       }));
//     }
//   };

//   // Handle video time update with anti-skip logic
//   const handleVideoTimeUpdate = (e, videoKey) => {
//     const video = e.target;
//     const currentTime = video.currentTime;
//     const lastValid = lastValidTime[videoKey] || 0;
    
//     // Only update if the time difference is reasonable (not a big jump)
//     if (currentTime >= lastValid && currentTime - lastValid <= 2) {
//       setLastValidTime(prev => ({
//         ...prev,
//         [videoKey]: currentTime
//       }));
      
//       // Update watched time
//       setVideoWatchedTime(prev => ({
//         ...prev,
//         [videoKey]: Math.max(prev[videoKey] || 0, currentTime)
//       }));
      
//       // Update progress
//       const progress = (currentTime / video.duration) * 100;
//       setVideoProgress(prev => ({
//         ...prev,
//         [videoKey]: progress
//       }));
//     }
//   };

//   // Start YouTube progress simulation with anti-skip logic
//   const startYoutubeProgressSimulation = (videoId) => {
//     // Clear any existing timer
//     if (youtubeProgressTimer[videoId]) {
//       clearInterval(youtubeProgressTimer[videoId]);
//     }
    
//     let watchedSeconds = 0;
//     const requiredWatchTime = 90; // Minimum 90 seconds for YouTube videos
    
//     // Start a timer that simulates progress every second
//     const timer = setInterval(() => {
//       watchedSeconds += 1;
      
//       setVideoWatchedTime(prev => ({
//         ...prev,
//         [videoId]: watchedSeconds
//       }));
      
//       // Simulate progress based on watched time (not total duration)
//       // We'll assume a minimum video length and calculate progress
//       const simulatedProgress = Math.min((watchedSeconds / requiredWatchTime) * 100, 100);
      
//       setVideoProgress(prev => ({
//         ...prev,
//         [videoId]: simulatedProgress
//       }));
      
//       console.log('📊 YouTube Progress:', {
//         watchedSeconds,
//         progress: simulatedProgress,
//         videoId
//       });
//     }, 1000);
    
//     setYoutubeProgressTimer(prev => ({
//       ...prev,
//       [videoId]: timer
//     }));
//   };

//   // Enhanced video completion check with anti-skip validation
//   const canMarkVideoComplete = (video) => {
//     if (!video || !video._id) return false;
    
//     const videoKey = video._id;
//     const progress = videoProgress[videoKey] || 0;
//     const startTime = videoStartTime[videoKey];
//     const watchedTime = videoWatchedTime[videoKey] || 0;
//     const skipAttempts = videoSkipAttempts[videoKey] || 0;
    
//     console.log('🔍 Checking completion for video:', videoKey);
//     console.log('🔍 Progress:', progress);
//     console.log('🔍 Watched time:', watchedTime);
//     console.log('🔍 Start time:', startTime);
//     console.log('🔍 Skip attempts:', skipAttempts);
    
//     // For YouTube videos, use time-based approach with stricter validation
//     if (video.videoUri && (video.videoUri.includes('youtube.com') || video.videoUri.includes('youtu.be'))) {
//       if (!startTime) {
//         console.log('❌ No start time for YouTube video');
//         return false;
//       }
      
//       const totalWatchDuration = Date.now() - startTime;
//       const minimumRealTime = 90000; // 90 seconds minimum real time
//       const minimumWatchedTime = 90; // 90 seconds minimum tracked time
      
//       // Check for too many skip attempts
//       if (skipAttempts > 5) {
//         console.log('❌ Too many skip attempts detected');
//         return false;
//       }
      
//       const canComplete = totalWatchDuration >= minimumRealTime && watchedTime >= minimumWatchedTime;
      
//       console.log('🔍 YouTube video validation:', {
//         totalWatchDuration,
//         minimumRealTime,
//         watchedTime,
//         minimumWatchedTime,
//         skipAttempts,
//         canComplete
//       });
      
//       return canComplete;
//     }
    
//     // For regular videos, use enhanced progress and time validation
//     if (!progress || !startTime) {
//       console.log('❌ Missing progress or start time for regular video');
//       return false;
//     }
    
//     const totalWatchDuration = Date.now() - startTime;
//     const minimumWatchTime = 45000; // 45 seconds minimum
//     const minimumProgress = 90; // 90% progress required
    
//     // Check for excessive skip attempts
//     if (skipAttempts > 5) {
//       console.log('❌ Too many skip attempts detected for regular video');
//       return false;
//     }
    
//     // Ensure watched time is reasonable compared to progress
//     const expectedWatchTime = (progress / 100) * 60; // Assume 60 second video
//     const watchTimeValid = watchedTime >= (expectedWatchTime * 0.8); // Allow some tolerance
    
//     const canComplete = progress >= minimumProgress && 
//                        totalWatchDuration >= minimumWatchTime && 
//                        watchTimeValid;
    
//     console.log('🔍 Regular video validation:', {
//       progress,
//       minimumProgress,
//       totalWatchDuration,
//       minimumWatchTime,
//       watchedTime,
//       expectedWatchTime,
//       watchTimeValid,
//       skipAttempts,
//       canComplete
//     });
    
//     return canComplete;
//   };

//   const processVideoUrl = (url) => {
//     if (!url) return null;
    
//     if (url.includes('youtube.com') || url.includes('youtu.be')) {
//       let videoId = '';
//       if (url.includes('youtube.com/watch?v=')) {
//         videoId = url.split('v=')[1];
//       } else if (url.includes('youtu.be/')) {
//         videoId = url.split('youtu.be/')[1];
//       } else if (url.includes('youtube.com/embed/')) {
//         videoId = url.split('youtube.com/embed/')[1];
//       } else if (url.includes('youtube.com/v/')) {
//         videoId = url.split('youtube.com/v/')[1];
//       }
      
//       // Clean video ID - remove any additional parameters
//       if (videoId.includes('&')) {
//         videoId = videoId.split('&')[0];
//       }
//       if (videoId.includes('?')) {
//         videoId = videoId.split('?')[0];
//       }
      
//       // Check if it looks like a valid YouTube video ID (11 characters)
//       if (videoId && videoId.length === 11) {
//         const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&disablekb=1&fs=0`;
//         console.log('🔍 Generated YouTube embed URL:', embedUrl);
//         return embedUrl;
//       }
      
//       console.log('⚠️ Invalid YouTube ID, returning original URL');
//       return url;
//     }
    
//     if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
//       return url;
//     }
    
//     return url;
//   };

//   const handleModuleComplete = (moduleId, moduleIndex) => {
//     console.log('🏆 Module completed:', moduleId, 'Index:', moduleIndex);
    
//     const newProgress = {
//       ...userProgress,
//       completedModules: [...(userProgress.completedModules || []), moduleId],
//       lastCompletedModule: moduleId,
//       lastCompletedAt: new Date().toISOString()
//     };
    
//     setUserProgress(newProgress);
//     localStorage.setItem(`userProgress_${currentUserId}`, JSON.stringify(newProgress));
    
//     alert(`🎊 Module completed! You can now access the next module.`);
//   };

//   const isVideoUnlocked = (moduleIndex, videoIndex, training) => {
//     if (videoIndex === 0) return true;
    
//     if (!training || !training.moduleDetails || !training.moduleDetails[moduleIndex]) return false;
    
//     const module = training.moduleDetails[moduleIndex];
//     if (!module.videos || videoIndex === 0) return true;
    
//     const previousVideo = module.videos[videoIndex - 1];
//     if (!previousVideo) return false;
    
//     // Use training-specific progress
//     const trainingProgressKey = `training_${training._id || training.id}`;
//     const trainingProgress = userProgress[trainingProgressKey] || {};
//     return trainingProgress.completedVideos?.includes(previousVideo._id) || false;
//   };

//   const isModuleUnlocked = (moduleIndex, training) => {
//     if (moduleIndex === 0) return true;
    
//     if (!training || !training.moduleDetails || !training.moduleDetails[moduleIndex - 1]) return false;
    
//     const previousModule = training.moduleDetails[moduleIndex - 1];
//     if (!previousModule.videos) return false;
    
//     // Check if all videos in previous module are completed
//     // Use training-specific progress
//     const trainingProgressKey = `training_${training._id || training.id}`;
//     const trainingProgress = userProgress[trainingProgressKey] || {};
//     return previousModule.videos.every(video => 
//       trainingProgress.completedVideos?.includes(video._id)
//     );
//   };

//   const handleStartTraining = async (training) => {
//     try {
//       console.log('Starting training:', training.title);
//       setSelectedTraining(training);
//       setShowModulesView(true);
//     } catch (error) {
//       console.error('Error starting training:', error);
//     }
//   };

//   const handleViewModule = async (module) => {
//     try {
//       console.log('Viewing module:', module.moduleName);
//       console.log('Module videos:', module.videos);
//     } catch (error) {
//       console.error('Error viewing module:', error);
//     }
//   };

//   const handleUpdateProgress = async (trainingId, newProgress) => {
//     try {
//       await updateTrainingProgress(trainingId, newProgress);
//       await fetchUserTrainings();
//     } catch (error) {
//       console.error('Error updating progress:', error);
//       setError('Failed to update training progress');
//     }
//   };

//   const getCurrentTrainings = () => {
//     return activeTab === 'assigned' ? assignedTrainings : mandatoryTrainings;
//   };

//   // Calculate training progress based on completed videos
//   const getTrainingProgress = (training) => {
//     if (!training || !training._id && !training.id) return 0;
    
//     const trainingId = training._id || training.id;
//     const trainingProgressKey = `training_${trainingId}`;
//     const trainingProgress = userProgress[trainingProgressKey] || {};
    
//     if (training.moduleDetails) {
//       const totalVideos = training.moduleDetails.reduce((total, module) => 
//         total + (module.videos ? module.videos.length : 0), 0
//       );
      
//       if (totalVideos > 0) {
//         const completedVideos = trainingProgress.completedVideos?.length || 0;
//         return Math.round((completedVideos / totalVideos) * 100);
//       }
//     }
    
//     return 0;
//   };

//   // Check if a training is completed based on user progress
//   const isTrainingCompleted = (training) => {
//     if (!training || !training._id && !training.id) return false;
    
//     const trainingId = training._id || training.id;
//     const trainingProgressKey = `training_${trainingId}`;
//     const trainingProgress = userProgress[trainingProgressKey] || {};
    
//     // Check if training was explicitly marked as completed
//     if (trainingProgress.trainingCompleted) return true;
    
//     // Check if all videos are completed
//     if (training.moduleDetails) {
//       const totalVideos = training.moduleDetails.reduce((total, module) => 
//         total + (module.videos ? module.videos.length : 0), 0
//       );
      
//       if (totalVideos > 0) {
//         const completedVideos = trainingProgress.completedVideos?.length || 0;
//         return completedVideos >= totalVideos;
//       }
//     }
    
//     return false;
//   };

//   const getPendingTrainings = () => {
//     return getCurrentTrainings().filter(training => 
//       !isTrainingCompleted(training)
//     );
//   };

//   const getCompletedTrainings = () => {
//     return getCurrentTrainings().filter(training => 
//       isTrainingCompleted(training)
//     );
//   };

//   const getDeadlineStatus = (deadline) => {
//     if (!deadline) return { color: 'secondary', text: 'No deadline' };
    
//     const deadlineDate = new Date(deadline);
//     const now = new Date();
//     const diffTime = deadlineDate - now;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays < 0) {
//       return { color: 'danger', text: 'Overdue' };
//     } else if (diffDays <= 2) {
//       return { color: 'danger', text: `${diffDays} days left` };
//     } else if (diffDays <= 5) {
//       return { color: 'warning', text: `${diffDays} days left` };
//     } else {
//       return { color: 'success', text: `${diffDays} days left` };
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString();
//   };

//   const handleBackToTrainings = () => {
//     setShowModulesView(false);
//     setSelectedTraining(null);
//   };

//   const handleLogout = () => {
//     // Clear all local storage data
//     localStorage.removeItem("employeeData");
//     localStorage.removeItem("loginStatus");
    
//     // Clear user progress
//     if (currentUserId) {
//       localStorage.removeItem(`userProgress_${currentUserId}`);
//     }
    
//     // Reset component state
//     setCurrentEmployee(null);
//     setAssignedTrainings([]);
//     setMandatoryTrainings([]);
//     setUserProgress({});
    
//     // Navigate to login
//     navigate('/login');
//   };

//   const handleRefreshEmployeeData = () => {
//     console.log('🔄 Refreshing employee data...');
//     const storedEmployeeData = localStorage.getItem("employeeData");
//     if (storedEmployeeData) {
//       try {
//         const employeeData = JSON.parse(storedEmployeeData);
//         setCurrentEmployee(employeeData);
//         console.log('👤 Employee data refreshed:', employeeData);
//         // Fetch trainings again
//         fetchUserTrainings();
//       } catch (err) {
//         console.error('Error parsing refreshed employee data:', err);
//         setError('Failed to refresh employee data. Please login again.');
//       }
//     } else {
//       setError('No employee data found. Please login again.');
//     }
//   };

//   // Check if user is authenticated
//   if (!currentEmployee) {
//     return (
//       <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
//         <div className="text-center">
//           <div className="text-muted mb-3">🔒</div>
//           <h5 className="text-muted">Authentication Required</h5>
//           <p className="text-muted">Please login to view your trainings.</p>
//           <div className="d-flex gap-2 justify-content-center">
//             <Button variant="primary" onClick={() => navigate('/login')}>
//               Go to Login
//             </Button>
//             <Button variant="outline-secondary" onClick={handleRefreshEmployeeData}>
//               🔄 Refresh Session
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
//         <Spinner animation="border" role="status" className="mb-3" style={{ color: '#20c997' }}>
//           <span className="visually-hidden">Loading...</span>
//         </Spinner>
//         <p className="text-muted">Fetching your trainings...</p>
//       </div>
//     );
//   }

//   // Show module details view when training is selected
//   if (showModulesView && selectedTraining) {
//     return (
//       <div className="bg-light min-vh-100">
//         {/* Header */}
//         <div className="bg-white shadow-sm">
//           <Container fluid>
//             <div className="d-flex align-items-center py-3">
//               <Button 
//                 variant="link" 
//                 className="text-decoration-none p-0 me-3"
//                 onClick={handleBackToTrainings}
//               >
//                 <ArrowLeft size={24} />
//               </Button>
//               <div>
//                 <h5 className="mb-0 fw-bold">{selectedTraining.title}</h5>
//                 <small className="text-muted">Training Modules</small>
//               </div>
//             </div>
//           </Container>
//         </div>

//         {/* Module Cards */}
//         <Container className="py-4">
//           <Row className="g-4">
//             {selectedTraining.moduleDetails && selectedTraining.moduleDetails.map((module, moduleIndex) => {
//               const moduleUnlocked = isModuleUnlocked(moduleIndex, selectedTraining);
//               const completedVideos = module.videos ? module.videos.filter(video => {
//                 // Use training-specific progress
//                 const trainingProgressKey = `training_${selectedTraining._id || selectedTraining.id}`;
//                 const trainingProgress = userProgress[trainingProgressKey] || {};
//                 return trainingProgress.completedVideos?.includes(video._id);
//               }).length : 0;
//               const totalVideos = module.videos ? module.videos.length : 0;
//               const moduleProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

//               return (
//                 <Col key={`module-${moduleIndex}`} xs={12}>
//                   <Card className={`h-100 border-0 shadow-sm ${!moduleUnlocked ? 'opacity-75' : ''}`}>
//                     <Card.Body className="p-4">
//                       {/* Module Header */}
//                       <div className="d-flex justify-content-between align-items-start mb-3">
//                         <div>
//                           <h6 className="fw-bold mb-1">
//                             Module {String(moduleIndex + 1).padStart(2, '0')}
//                           </h6>
//                           <p className="text-muted small mb-0">
//                             {module.title || `Module ${moduleIndex + 1}`}
//                           </p>
//                           {module.description && (
//                             <p className="text-muted small mt-1 mb-0">{module.description}</p>
//                           )}
//                         </div>
//                         <div className="text-end">
//                           <Badge 
//                             bg={moduleProgress === 100 ? 'success' : moduleProgress > 0 ? 'warning' : 'secondary'}
//                             className="mb-2"
//                           >
//                             {moduleProgress === 100 ? 'Completed' : moduleUnlocked ? `${Math.round(moduleProgress)}%` : 'Locked'}
//                           </Badge>
//                         </div>
//                       </div>

//                       {/* Progress Bar */}
//                       <div className="mb-3">
//                         <div className="d-flex justify-content-between align-items-center mb-1">
//                           <small className="text-muted">Progress</small>
//                           <small className="fw-bold">{Math.round(moduleProgress)}% Completed</small>
//                         </div>
//                         <ProgressBar 
//                           now={moduleProgress} 
//                           className="mb-2"
//                           style={{ height: '6px' }}
//                           variant={moduleProgress === 100 ? 'success' : moduleProgress > 0 ? 'info' : 'secondary'}
//                         />
//                       </div>

//                       {/* Module Content */}
//                       {moduleUnlocked ? (
//                         <>
//                           {/* Topic List */}
//                           {module.videos && module.videos.length > 0 && (
//                             <div className="mb-3">
//                               <h6 className="fw-semibold mb-2 small text-uppercase text-muted">
//                                 Topics ({totalVideos})
//                               </h6>
//                               <div className="d-grid gap-2">
//                                 {module.videos.map((video, videoIndex) => {
//                                   const videoUnlocked = isVideoUnlocked(moduleIndex, videoIndex, selectedTraining);
//                                   const isVideoCompleted = (() => {
//                                     // Use training-specific progress
//                                     const trainingProgressKey = `training_${selectedTraining._id || selectedTraining.id}`;
//                                     const trainingProgress = userProgress[trainingProgressKey] || {};
//                                     return trainingProgress.completedVideos?.includes(video._id);
//                                   })();

//                                   return (
//                                     <Card key={`topic-${videoIndex}`} className="border">
//                                       <Card.Body className="p-3">
//                                         <div className="d-flex justify-content-between align-items-center">
//                                           <div className="flex-grow-1">
//                                             <h6 className="mb-1 fw-semibold">
//                                               {video.title || `Topic ${videoIndex + 1}`}
//                                             </h6>
//                                             <small className="text-muted">
//                                               Duration: {video.duration || '15'} min | 🚫 No Fast Forward
//                                             </small>
//                                           </div>
//                                           <div>
//                                             {isVideoCompleted ? (
//                                               <Badge bg="success">
//                                                 <CheckCircleFill className="me-1" />
//                                                 Completed
//                                               </Badge>
//                                             ) : videoUnlocked ? (
//                                               <Button 
//                                                 variant="success"
//                                                 size="sm"
//                                                 onClick={() => handleInlineVideo(video, moduleIndex, videoIndex)}
//                                               >
//                                                 Watch Now
//                                               </Button>
//                                             ) : (
//                                               <Badge bg="secondary">
//                                                 <LockFill className="me-1" />
//                                                 Locked
//                                               </Badge>
//                                             )}
//                                           </div>
//                                         </div>
//                                       </Card.Body>
//                                     </Card>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           )}

//                           {/* Action Buttons */}
//                           <div className="mt-4 d-flex gap-2">
//                             <Button 
//                               variant={moduleProgress > 0 ? 'outline-success' : 'success'}
//                               className="flex-grow-1"
//                               onClick={() => {
//                                 if (module.videos && module.videos.length > 0) {
//                                   const firstUncompletedVideo = module.videos.find(video => {
//                                     const trainingProgressKey = `training_${selectedTraining._id || selectedTraining.id}`;
//                                     const trainingProgress = userProgress[trainingProgressKey] || {};
//                                     return !trainingProgress.completedVideos?.includes(video._id);
//                                   });
//                                   if (firstUncompletedVideo) {
//                                     const videoIndex = module.videos.findIndex(v => v._id === firstUncompletedVideo._id);
//                                     handleInlineVideo(firstUncompletedVideo, moduleIndex, videoIndex);
//                                   }
//                                 }
//                               }}
//                             >
//                               {moduleProgress > 0 ? 'Continue Training' : 'Start Training'}
//                             </Button>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="text-center py-4">
//                           <LockFill size={32} className="text-muted mb-2" />
//                           <p className="text-muted mb-0">
//                             Complete the previous module to unlock this content
//                           </p>
//                         </div>
//                       )}
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               );
//             })}
//           </Row>
//         </Container>

//         {/* Inline Video Player with Anti-Skip Protection */}
//         {inlineVideo && (
//           <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
//             <div className="bg-white rounded shadow" style={{ width: '90%', maxWidth: '800px' }}>
//               <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
//                 <h5 className="mb-0">🎬 {inlineVideo.title || 'Video'}</h5>
//                 <Button 
//                   variant="light" 
//                   size="sm" 
//                   onClick={closeInlineVideo}
//                 >
//                   <X />
//                 </Button>
//               </div>
              
//               {/* Warning Banner */}
//               <div className="px-3 py-2 bg-warning bg-opacity-10 border-bottom">
//                 <div className="d-flex align-items-center">
//                   <span className="me-2">⚠️</span>
//                   <small className="fw-bold text-warning">
//                     Anti-Skip Protection Active: You must watch the complete video without fast forwarding
//                   </small>
//                 </div>
//               </div>

//               {/* Debug Info */}
//               <div className="px-3 py-2 bg-light border-bottom small">
//                 <div className="row">
//                   <div className="col-md-6">
//                     <strong>Watched Time:</strong> {Math.round(videoWatchedTime[inlineVideo._id] || 0)}s
//                   </div>
//                   <div className="col-md-6">
//                     <strong>Skip Attempts:</strong> {videoSkipAttempts[inlineVideo._id] || 0}
//                   </div>
//                 </div>
//               </div>

//               <div className="ratio ratio-16x9">
//                 {inlineVideo.videoUri && (
//                   inlineVideo.videoUri.includes('youtube.com') || inlineVideo.videoUri.includes('youtu.be') ? (
//                     <iframe
//                       src={processVideoUrl(inlineVideo.videoUri)}
//                       title={inlineVideo.title || 'Video'}
//                       frameBorder="0"
//                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                       style={{ border: 'none', pointerEvents: 'none' }} // Disable interaction
//                       onLoad={() => {
//                         // Track when YouTube video starts
//                         const videoKey = inlineVideo._id;
//                         setVideoStartTime(prev => ({
//                           ...prev,
//                           [videoKey]: Date.now()
//                         }));
//                         // Start progress simulation for YouTube
//                         startYoutubeProgressSimulation(videoKey);
//                       }}
//                       onError={(e) => {
//                         console.error('YouTube iframe error:', e);
//                         setError('Failed to load YouTube video. Please check the URL.');
//                       }}
//                     />
//                   ) : (
//                     <video
//                       controls={false} // Disable controls to prevent seeking
//                       autoPlay
//                       className="w-100 h-100"
//                       style={{ objectFit: 'contain' }}
//                       controlsList="nodownload nofullscreen noremoteplayback" // Additional restrictions
//                       disablePictureInPicture
//                       onLoadStart={() => {
//                         // Track when video starts
//                         const videoKey = inlineVideo._id;
//                         setVideoStartTime(prev => ({
//                           ...prev,
//                           [videoKey]: Date.now()
//                         }));
//                         setLastValidTime(prev => ({
//                           ...prev,
//                           [videoKey]: 0
//                         }));
//                       }}
//                       onTimeUpdate={(e) => handleVideoTimeUpdate(e, inlineVideo._id)}
//                       onSeeking={(e) => handleVideoSeeking(e, inlineVideo._id)}
//                       onSeeked={(e) => handleVideoSeeking(e, inlineVideo._id)}
//                       onError={(e) => {
//                         console.error('Video playback error:', e);
//                         setError('Failed to load video. Please check the video file.');
//                       }}
//                       // Prevent right-click context menu
//                       onContextMenu={(e) => e.preventDefault()}
//                     >
//                       <source src={inlineVideo.videoUri} type="video/mp4" />
//                       <source src={inlineVideo.videoUri} type="video/webm" />
//                       <source src={inlineVideo.videoUri} type="video/ogg" />
//                       Your browser does not support the video tag.
//                     </video>
//                   )
//                 )}
//                 {!inlineVideo.videoUri && (
//                   <div className="d-flex align-items-center justify-content-center bg-light">
//                     <div className="text-center p-4">
//                       <div className="text-muted mb-2">🎬</div>
//                       <p className="text-muted mb-0">Video URL not available</p>
//                       <small className="text-muted">Please check with your administrator</small>
//                     </div>
//                   </div>
//                 )}
//               </div>
              
//               <div className="p-3 border-top">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <small className="text-muted">
//                       Module {inlineVideo.moduleIndex + 1}, Video {inlineVideo.videoIndex + 1}
//                     </small>
//                   </div>
//                   <div className="d-flex align-items-center gap-2">
//                     {canMarkVideoComplete(inlineVideo) ? (
//                       <Button 
//                         variant="success" 
//                         size="sm"
//                         onClick={() => {
//                           handleVideoComplete(inlineVideo, inlineVideo.moduleIndex, inlineVideo.videoIndex);
//                           closeInlineVideo();
//                         }}
//                       >
//                         <CheckCircleFill className="me-1" />
//                         Mark Complete
//                       </Button>
//                     ) : (
//                       <div className="text-center">
//                         <div className="text-muted small mb-1">
//                           ⏱️ Watch the complete video to unlock completion
//                         </div>
//                         <div className="text-muted small">
//                           Progress: {Math.round(videoProgress[inlineVideo._id] || 0)}% | 
//                           Watched: {Math.round(videoWatchedTime[inlineVideo._id] || 0)}s
//                         </div>
//                         <div className="text-muted small mt-1">
//                           <small>
//                             {inlineVideo.videoUri && (inlineVideo.videoUri.includes('youtube.com') || inlineVideo.videoUri.includes('youtu.be')) 
//                               ? 'Minimum watch time: 90 seconds' 
//                               : 'Complete video required (90% + 45s minimum)'
//                             }
//                           </small>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // Main training list view
//   if (!loading && assignedTrainings.length === 0 && mandatoryTrainings.length === 0 && !error) {
//     return (
//       <div className="bg-light min-vh-100">
//         <div className="bg-white shadow-sm">
//           <Container fluid>
//             <div className="py-3">
//               <h4 className="mb-0 fw-bold">Trainings</h4>
//             </div>
//           </Container>
//         </div>
//         <Container className="py-4 text-center">
//           <div className="mb-4">
//             <h5 className="text-muted">No Trainings Found</h5>
//             <p className="text-muted">
//               It looks like no trainings have been assigned to you yet.
//             </p>
//             {currentEmployee && (
//               <div className="mt-3 p-3 bg-light rounded">
//                 <h6 className="text-muted mb-2">Current Employee Criteria:</h6>
//                 <div className="row text-center">
//                   <div className="col-md-3">
//                     <small className="text-muted d-block">Employee ID</small>
//                     <strong>{currentEmployee.employeeId}</strong>
//                   </div>
//                   <div className="col-md-3">
//                     <small className="text-muted d-block">Designation</small>
//                     <strong>{currentEmployee.role}</strong>
//                   </div>
//                   <div className="col-md-3">
//                     <small className="text-muted d-block">Branch</small>
//                     <strong>{currentEmployee.Store}</strong>
//                   </div>
//                   <div className="col-md-3">
//                     <small className="text-muted d-block">Status</small>
//                     <span className="badge bg-warning">No trainings match</span>
//                   </div>
//                 </div>
//                 <p className="text-muted small mt-2 mb-0">
//                   Trainings are filtered based on your employee ID, designation, and branch.
//                   Contact your administrator if you believe trainings should be assigned to you.
//                 </p>
//               </div>
//             )}
//           </div>
//           <Button variant="primary" onClick={fetchUserTrainings} disabled={loading}>
//             {loading ? 'Refreshing...' : 'Refresh Trainings'}
//           </Button>
//         </Container>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-light min-vh-100">
//       {/* Header */}
//       <div className="bg-white shadow-sm">
//         <Container fluid>
//           <div className="py-3">
//             <div className="d-flex justify-content-between align-items-start">
//               <div>
//             <h4 className="mb-0 fw-bold">Trainings</h4>
//                 {currentEmployee && (
//                   <div className="mt-2">
//                     <small className="text-muted">
//                       👤 <strong>{currentEmployee.name}</strong> | 
//                       🆔 <strong>{currentEmployee.employeeId}</strong> | 
//                       💼 <strong>{currentEmployee.role}</strong> | 
//                       🏢 <strong>{currentEmployee.Store}</strong>
//                     </small>
//                   </div>
//                 )}
//               </div>
//               <div className="d-flex gap-2">
//                 <Button 
//                   variant="outline-primary" 
//                   size="sm"
//                   onClick={handleRefreshEmployeeData}
//                   disabled={loading}
//                 >
//                   🔄 Refresh
//                 </Button>
//                 <Button 
//                   variant="outline-secondary" 
//                   size="sm"
//                   onClick={handleLogout}
//                 >
//                   🔓 Logout
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </Container>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white border-bottom">
//         <Container fluid>
//           <div className="d-flex">
//             <Button
//               variant="link"
//               className={`text-decoration-none flex-fill py-3 border-0 ${
//                 activeTab === 'assigned' ? 'border-bottom border-success border-3 fw-bold text-success' : 'text-muted'
//               }`}
//               onClick={() => setActiveTab('assigned')}
//             >
//               Assigned ({assignedTrainings.length})
//             </Button>
//             <Button
//               variant="link"
//               className={`text-decoration-none flex-fill py-3 border-0 ${
//                 activeTab === 'mandatory' ? 'border-bottom border-success border-3 fw-bold text-success' : 'text-muted'
//               }`}
//               onClick={() => setActiveTab('mandatory')}
//             >
//               Mandatory ({mandatoryTrainings.length})
//             </Button>
//           </div>
//         </Container>
//       </div>

//       {/* Content */}
//       <Container className="py-4">
//         {error && (
//           <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
//             <strong>Error:</strong> {error}
//           </Alert>
//         )}

//         {/* Debug Info */}
//         {debugInfo && (
//           <Alert variant="info" className="mb-4">
//             <strong>Debug Info:</strong> {debugInfo}
//           </Alert>
//         )}

//         {/* Raw API Response Debug */}
//         {config.ENABLE_DEBUG && (assignedTrainings.length > 0 || mandatoryTrainings.length > 0) && (
//           <Alert variant="warning" className="mb-4">
//             <div className="d-flex justify-content-between align-items-start">
//               <div>
//                 <h6 className="mb-2">🔍 Raw API Response Debug</h6>
//                 <small className="text-muted">Click to expand and see the actual data structure</small>
//               </div>
//             </div>
            
//             <div className="mt-3">
//               <details>
//                 <summary className="fw-bold">📊 Raw API Response Data (Click to expand)</summary>
//                 <div className="mt-2 p-3 bg-light rounded small">
//                   <div><strong>Assigned Trainings Raw Data (First 2):</strong></div>
//                   <pre className="mt-2 mb-3" style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
//                     {JSON.stringify(assignedTrainings.slice(0, 2), null, 2)}
//                   </pre>
//                   <div><strong>Mandatory Trainings Raw Data (First 2):</strong></div>
//                   <pre className="mt-2" style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
//                     {JSON.stringify(mandatoryTrainings.slice(0, 2), null, 2)}
//                   </pre>
//                 </div>
//               </details>
//             </div>
//           </Alert>
//         )}

//         {/* Employee Filter Info */}
//         {currentEmployee && (
//           <Alert variant="secondary" className="mb-4">
//             <strong>🔍 Training Filter Applied:</strong>
//             <div className="mt-2">
//               <small>
//                 <strong>Employee ID:</strong> {currentEmployee.employeeId} | 
//                 <strong>Designation:</strong> {currentEmployee.role} | 
//                 <strong>Branch:</strong> {currentEmployee.Store}
//               </small>
//             </div>
//             <div className="mt-1">
//               <small className="text-muted">
//                 Showing only trainings assigned to you, matching your designation, or matching your branch.
//               </small>
//             </div>
//             {assignedTrainings.length > 0 || mandatoryTrainings.length > 0 ? (
//               <div className="mt-2">
//                 <small className="text-success">
//                   ✅ Found {assignedTrainings.length + mandatoryTrainings.length} relevant trainings
//                 </small>
//               </div>
//             ) : (
//               <div className="mt-2">
//                 <small className="text-warning">
//                   ⚠️ No trainings match your criteria. Contact your administrator.
//                 </small>
//               </div>
//             )}
//           </Alert>
//         )}

//         {/* Temporary Debug: Show All Trainings When Filtering Fails */}
//         {config.ENABLE_DEBUG && currentEmployee && (assignedTrainings.length === 0 && mandatoryTrainings.length === 0) && (
//           <Alert variant="danger" className="mb-4">
//             <div className="d-flex justify-content-between align-items-start">
//               <div>
//                 <h6 className="mb-2">🚨 FILTERING ISSUE DETECTED</h6>
//                 <p className="mb-2">No trainings match your filter criteria. This could mean:</p>
//                 <ul className="mb-2 small">
//                   <li>The training data structure doesn't match expected field names</li>
//                   <li>The assigned training has different field values than expected</li>
//                   <li>The API response format has changed</li>
//                 </ul>
//                 <small className="text-muted">Check the console logs above for detailed filtering information</small>
//               </div>
//             </div>
            
//             <div className="mt-3">
//               <details>
//                 <summary className="fw-bold">🔍 Show All Available Trainings (Debug Mode)</summary>
//                 <div className="mt-2 p-3 bg-light rounded small">
//                   <div className="mb-2">
//                     <strong>⚠️ WARNING:</strong> This shows ALL trainings from the API (not filtered)
//                   </div>
//                   <div><strong>All Available Trainings:</strong></div>
//                   <pre className="mt-2" style={{ fontSize: '11px', maxHeight: '300px', overflow: 'auto' }}>
//                     {JSON.stringify([...assignedTrainings, ...mandatoryTrainings], null, 2)}
//                   </pre>
//                 </div>
//               </details>
              
//               {/* Temporary Debug Button */}
//               <div className="mt-3">
//                 <Button 
//                   variant="warning" 
//                   size="sm" 
//                   onClick={() => {
//                     console.log('🔍 DEBUG: Bypassing filtering to show all trainings');
//                     console.log('🔍 All assigned trainings from API:', assignedTrainings);
//                     console.log('🔍 All mandatory trainings from API:', mandatoryTrainings);
//                     alert('Check console for all available trainings data');
//                   }}
//                 >
//                   🔍 Debug: Show All Trainings in Console
//                 </Button>
//               </div>
//             </div>
//           </Alert>
//         )}

//         {/* Pending Trainings */}
//         <div className="mb-4">
//           <h5 className="fw-bold mb-3">
//             Pending Trainings ({getPendingTrainings().length})
//           </h5>
//           {getPendingTrainings().length === 0 ? (
//             <Alert variant="info" className="text-center">
//               <p className="mb-0">No pending trainings found.</p>
//               <small>
//                 {getCurrentTrainings().length === 0 
//                   ? 'No trainings have been assigned to you yet.' 
//                   : 'All your trainings are completed!'
//                 }
//               </small>
//             </Alert>
//           ) : (
//             <Row className="g-4">
//               {getPendingTrainings().map((training, trainingIndex) => {
//                 const deadlineStatus = getDeadlineStatus(training.deadline);
//                 const uniqueTrainingId = training.id || training._id || `training-${trainingIndex}`;
                
//                 return (
//                   <Col key={`training-${uniqueTrainingId}-${trainingIndex}`} xs={12} className="mb-3">
//                     <Card className="h-100 border-0 shadow-sm">
//                       <Card.Body className="p-4">
//                         {/* Training Header */}
//                         <div className="d-flex justify-content-between align-items-start mb-3">
//                           <div>
//                             <h6 className="fw-bold mb-1">{training.title}</h6>
//                             {training.description && (
//                               <p className="text-muted small mb-0">{training.description}</p>
//                             )}
//                           </div>
//                           <Badge bg={deadlineStatus.color} className="ms-2">
//                             {deadlineStatus.text}
//                           </Badge>
//                         </div>
                        
//                         {/* Progress */}
//                         <div className="mb-3">
//                           <div className="d-flex justify-content-between align-items-center mb-1">
//                             <small className="text-muted">🚫 Anti-Skip Protection Enabled - Complete each training module without fast forwarding</small>
//                             <small className="fw-bold">
//                               {isTrainingCompleted(training) ? '100% Completed' : `${getTrainingProgress(training)}% Completed`}
//                             </small>
//                           </div>
//                           <ProgressBar 
//                             now={isTrainingCompleted(training) ? 100 : getTrainingProgress(training)} 
//                             className="mb-2"
//                             style={{ height: '8px' }}
//                             variant={isTrainingCompleted(training) ? 'success' : getTrainingProgress(training) > 75 ? 'success' : getTrainingProgress(training) > 25 ? 'warning' : 'info'}
//                           />
//                         </div>

//                         {/* Module Count and Type */}
//                         <div className="d-flex justify-content-between align-items-center mb-3">
//                           <div className="d-flex align-items-center gap-2">
//                             {training.moduleDetails && (
//                               <small className="text-muted">
//                                 📚 {training.moduleDetails.length} modules
//                               </small>
//                             )}
//                             <Badge 
//                               bg={training.type === 'mandatory' ? 'danger' : 'primary'} 
//                               className="small"
//                             >
//                               {training.type}
//                             </Badge>
//                           </div>
//                         </div>

//                         {/* Action Button */}
//                         <div className="d-grid">
//                           {isTrainingCompleted(training) ? (
//                             <Button 
//                               variant="outline-success"
//                               onClick={() => handleStartTraining(training)}
//                             >
//                               <CheckCircleFill className="me-1" />
//                               Review Training
//                             </Button>
//                           ) : (
//                             <Button 
//                               variant={training.progress > 0 ? 'outline-success' : 'success'}
//                               onClick={() => handleStartTraining(training)}
//                             >
//                               {training.progress > 0 ? 'Continue Training' : 'Start Training'}
//                             </Button>
//                           )}
//                         </div>
//                       </Card.Body>
//                     </Card>
//                   </Col>
//                 );
//               })}
//             </Row>
//           )}
//         </div>

//         {/* Completed Trainings */}
//         <div className="mb-4">
//           <h5 className="fw-bold mb-3">
//             Completed Trainings ({getCompletedTrainings().length})
//           </h5>
//           {getCompletedTrainings().length === 0 ? (
//             <p className="text-muted text-center">No completed trainings yet</p>
//           ) : (
//             <Row className="g-4">
//               {getCompletedTrainings().map((training, trainingIndex) => {
//                 const uniqueCompletedTrainingId = training.id || training._id || `completed-training-${trainingIndex}`;
//                 return (
//                   <Col key={`completed-training-${uniqueCompletedTrainingId}-${trainingIndex}`} xs={12} className="mb-3">
//                     <Card className="h-100 border-0 shadow-sm bg-light">
//                       <Card.Body className="p-4">
//                         <div className="d-flex justify-content-between align-items-start mb-3">
//                           <div>
//                             <h6 className="fw-bold mb-1">{training.title}</h6>
//                             {training.description && (
//                               <p className="text-muted small mb-0">{training.description}</p>
//                             )}
//                           </div>
//                           <Badge bg="success">Completed</Badge>
//                         </div>
                        
//                         <div className="mb-3">
//                           <ProgressBar 
//                             now={100} 
//                             variant="success"
//                             style={{ height: '8px' }}
//                           />
//                         </div>
                        
//                         <div className="d-flex justify-content-between align-items-center">
//                           <Badge 
//                             bg={training.type === 'mandatory' ? 'danger' : 'primary'} 
//                             className="small"
//                           >
//                             {training.type}
//                           </Badge>
//                           <Button 
//                             variant="outline-secondary" 
//                             size="sm"
//                             onClick={() => handleStartTraining(training)}
//                           >
//                             Review
//                           </Button>
//                         </div>
//                       </Card.Body>
//                     </Card>
//                   </Col>
//                 );
//               })}
//             </Row>
//           )}
//         </div>

//         {/* Refresh Button */}
//         <div className="text-center">
//           <Button 
//             variant="outline-primary" 
//             onClick={fetchUserTrainings}
//             disabled={loading}
//             size="lg"
//           >
//             {loading ? 'Refreshing...' : 'Refresh Trainings'}
//           </Button>
//         </div>
//       </Container>

//       {/* Video Player Modal */}
//       <VideoPlayer
//         show={showVideoModal}
//         onHide={handleCloseVideoModal}
//         video={selectedVideo}
//         onVideoComplete={handleVideoComplete}
//       />
//     </div>
//   );
// };

// export default Training;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge,
  ProgressBar,
  Spinner,
  Alert,
  Form,
  Modal
} from 'react-bootstrap';
import { 
  PlayFill, 
  CheckCircleFill, 
  LockFill,
  X,
  JournalText,
  ArrowLeft
} from 'react-bootstrap-icons';
import { 
  getUserAssignedTrainings, 
  getUserMandatoryTrainings,
  testAPIConnection,
  updateTrainingProgress,
  completeTraining,
  testEndpoints,
  transformTrainingData,
  getTrainingWithModules,
  testModuleEndpoint,
  getModuleVideoUrls
} from '../api';
import VideoPlayer from '../components/VideoPlayer';

const Training = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assigned');
  const [assignedTrainings, setAssignedTrainings] = useState([]);
  const [mandatoryTrainings, setMandatoryTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('unknown');
  const [testUserId, setTestUserId] = useState('user123');
  const [debugInfo, setDebugInfo] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [userProgress, setUserProgress] = useState({});
  const [currentUserId] = useState('user123');
  const [inlineVideo, setInlineVideo] = useState(null);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showModulesView, setShowModulesView] = useState(false);
  
  // UPDATED: Simplified video tracking - only track if video is fully watched
  const [videoWatchedTime, setVideoWatchedTime] = useState({});
  const [videoStartTime, setVideoStartTime] = useState({});
  const [videoCompleted, setVideoCompleted] = useState({}); // Track fully watched videos
  const [youtubeProgressTimer, setYoutubeProgressTimer] = useState({});

  // Get current employee data for filtering trainings
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Load current employee data from localStorage
  useEffect(() => {
    const storedEmployeeData = localStorage.getItem("employeeData");
    if (storedEmployeeData) {
      try {
        const employeeData = JSON.parse(storedEmployeeData);
        setCurrentEmployee(employeeData);
        console.log('👤 Current employee loaded:', employeeData);
      } catch (err) {
        console.error('Error parsing employee data:', err);
        localStorage.removeItem("employeeData");
        navigate('/login');
      }
    } else {
      console.log('❌ No employee data found, redirecting to login...');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (currentEmployee && currentEmployee.employeeId) {
      console.log('👤 Employee data loaded, fetching trainings...');
      fetchUserTrainings();
    } else if (currentEmployee === null) {
      console.log('❌ No employee data, not fetching trainings');
    }
  }, [currentEmployee]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(youtubeProgressTimer).forEach(timer => {
        if (timer) clearInterval(timer);
      });
    };
  }, [youtubeProgressTimer]);

  // Load user progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`userProgress_${currentUserId}`);
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        setUserProgress(parsedProgress);
        console.log('📊 Loaded user progress:', parsedProgress);
      } catch (err) {
        console.error('Error parsing saved progress:', err);
      }
    }
  }, [currentUserId]);

  const fetchUserTrainings = async () => {
    try {
      setLoading(true);
      setError('');
      setDebugInfo('Fetching trainings from your API...');
      
      if (!currentEmployee) {
        setError('Employee data not available. Please login again.');
        setLoading(false);
        return;
      }
      
      const isLoggedIn = localStorage.getItem("employeeData");
      if (!isLoggedIn) {
        setError('Please login to view your trainings.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching trainings for employee:', currentEmployee.employeeId);
      
      const [assignedData, mandatoryData] = await Promise.all([
        getUserAssignedTrainings(),
        getUserMandatoryTrainings()
      ]);
      
      console.log('📚 Raw assigned trainings:', assignedData);
      console.log('📚 Raw mandatory trainings:', mandatoryData);
      
      // Filter trainings based on current employee's criteria
      const filterTrainingsByEmployee = (trainings) => {
        if (!Array.isArray(trainings)) return [];
        
        const filtered = trainings.filter(training => {
          const isAssignedToEmployee = (
            (training.assignedTo && 
             (training.assignedTo === currentEmployee.employeeId ||
              (Array.isArray(training.assignedTo) && training.assignedTo.includes(currentEmployee.employeeId)))) ||
            (training.assignedFor && Array.isArray(training.assignedFor) && 
             training.assignedFor.some(assignment => {
               if (typeof assignment === 'string' && assignment.startsWith('Emp')) {
                 return assignment === currentEmployee.employeeId;
               }
               if (typeof assignment === 'string') {
                 return assignment.toLowerCase() === currentEmployee.role.toLowerCase();
               }
               if (typeof assignment === 'object' && assignment !== null) {
                 return (assignment.employeeId === currentEmployee.employeeId) ||
                        (assignment.role && assignment.role.toLowerCase() === currentEmployee.role.toLowerCase());
               }
               return false;
             })) ||
            (training.assignedUsers && Array.isArray(training.assignedUsers) &&
             training.assignedUsers.some(user => 
               user.userId === currentEmployee.employeeId ||
               user.employeeId === currentEmployee.employeeId
             ))
          );
          
          const matchesDesignation = (
            (training.designation && 
             (training.designation === currentEmployee.role ||
              (Array.isArray(training.designation) && training.designation.includes(currentEmployee.role)))) ||
            (training.role && 
             (training.role === currentEmployee.role ||
              (Array.isArray(training.role) && training.role.includes(currentEmployee.role)))) ||
            (training.assignedFor && Array.isArray(training.assignedFor) &&
             training.assignedFor.some(assignment => {
               if (typeof assignment === 'string') {
                 return assignment.toLowerCase() === currentEmployee.role.toLowerCase();
               }
               if (typeof assignment === 'object' && assignment !== null) {
                 return assignment.role === currentEmployee.role ||
                        assignment.designation === currentEmployee.role;
               }
               return false;
             }))
          );
          
          const matchesBranch = (
            (training.branch && 
             (training.branch === currentEmployee.Store ||
              (Array.isArray(training.branch) && training.branch.includes(currentEmployee.Store)))) ||
            (training.store && 
             (training.store === currentEmployee.Store ||
              (Array.isArray(training.store) && training.store.includes(currentEmployee.Store)))) ||
            (training.Store && 
             (training.Store === currentEmployee.Store ||
              (Array.isArray(training.Store) && training.Store.includes(currentEmployee.Store))))
          );
          
          return isAssignedToEmployee || matchesDesignation || matchesBranch;
        });
        
        return filtered;
      };
      
      const transformedAssignedData = await Promise.all(assignedData.map(t => transformTrainingData(t)));
      const transformedMandatoryData = await Promise.all(mandatoryData.map(t => transformTrainingData(t)));
      
      const filteredAssigned = filterTrainingsByEmployee(transformedAssignedData);
      const filteredMandatory = filterTrainingsByEmployee(transformedMandatoryData);
      
      setAssignedTrainings(filteredAssigned);
      setMandatoryTrainings(filteredMandatory);
      
      try {
        const enhancedAssigned = await Promise.all(
          filteredAssigned.map(training => getTrainingWithModules(training))
        );
        
        const enhancedMandatory = await Promise.all(
          filteredMandatory.map(training => getTrainingWithModules(training))
        );
        
        setAssignedTrainings(enhancedAssigned || []);
        setMandatoryTrainings(enhancedMandatory || []);
      } catch (enhancementError) {
        console.error('❌ Error enhancing trainings:', enhancementError);
        setAssignedTrainings(filteredAssigned || []);
        setMandatoryTrainings(filteredMandatory || []);
        setDebugInfo('Videos may not display due to enhancement error.');
      }
      
      setApiStatus('connected');
      const totalFiltered = (filteredAssigned?.length || 0) + (filteredMandatory?.length || 0);
      setDebugInfo(`✅ Fetched ${totalFiltered} trainings for ${currentEmployee.employeeId}`);
      
    } catch (err) {
      console.error('❌ Error fetching trainings:', err);
      setError(`Failed to fetch trainings: ${err.message}`);
      setApiStatus('failed');
      setDebugInfo(`Error: ${err.message}`);
      
      setAssignedTrainings([]);
      setMandatoryTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoComplete = (video, moduleIndex, videoIndex) => {
    console.log('🎯 Video completed:', video, 'Module:', moduleIndex, 'Video:', videoIndex);
    
    let currentTraining = null;
    if (inlineVideo && inlineVideo.trainingId) {
      currentTraining = inlineVideo.trainingId;
    } else if (selectedVideo && selectedVideo.trainingId) {
      currentTraining = selectedVideo.trainingId;
    }
    
    if (currentTraining) {
      const trainingProgressKey = `training_${currentTraining}`;
      const currentTrainingProgress = userProgress[trainingProgressKey] || {};
      
      const newTrainingProgress = {
        ...currentTrainingProgress,
        completedVideos: [...(currentTrainingProgress.completedVideos || []), video._id],
        lastCompletedVideo: video._id,
        lastCompletedAt: new Date().toISOString()
      };
      
      const training = [...assignedTrainings, ...mandatoryTrainings].find(t => 
        (t._id || t.id) === currentTraining
      );
      
      if (training && training.moduleDetails) {
        const totalVideos = training.moduleDetails.reduce((total, module) => 
          total + (module.videos ? module.videos.length : 0), 0
        );
        
        if (newTrainingProgress.completedVideos.length >= totalVideos) {
          newTrainingProgress.trainingCompleted = true;
          newTrainingProgress.completedAt = new Date().toISOString();
          console.log('🎉 Training completed:', training.title);
        }
      }
      
      const newProgress = {
        ...userProgress,
        [trainingProgressKey]: newTrainingProgress,
        lastCompletedVideo: video._id,
        lastCompletedAt: new Date().toISOString()
      };
      
      setUserProgress(newProgress);
      localStorage.setItem(`userProgress_${currentUserId}`, JSON.stringify(newProgress));
      
      setTimeout(() => {
        fetchUserTrainings();
      }, 100);
    }
    
    alert(`🎉 Congratulations! You've completed "${video.title}"`);
    closeInlineVideo();
  };

  const handleInlineVideo = (video, moduleIndex, videoIndex) => {
    console.log('🎬 Playing inline video:', video);
    
    if (!video.videoUri && !video.url) {
      setError('No video URL available. Please check the video configuration.');
      return;
    }
    
    // Initialize tracking for this video
    const videoKey = video._id;
    setVideoWatchedTime(prev => ({
      ...prev,
      [videoKey]: 0
    }));
    setVideoCompleted(prev => ({
      ...prev,
      [videoKey]: false
    }));
    
    setInlineVideo({
      ...video,
      moduleIndex,
      videoIndex,
      trainingId: selectedTraining?._id || selectedTraining?.id
    });
  };

  const closeInlineVideo = () => {
    // Clean up YouTube progress timer if exists
    if (inlineVideo && inlineVideo._id && youtubeProgressTimer[inlineVideo._id]) {
      clearInterval(youtubeProgressTimer[inlineVideo._id]);
      setYoutubeProgressTimer(prev => {
        const newTimers = { ...prev };
        delete newTimers[inlineVideo._id];
        return newTimers;
      });
    }
    
    // Clean up video tracking
    if (inlineVideo && inlineVideo._id) {
      const videoKey = inlineVideo._id;
      setVideoWatchedTime(prev => {
        const newState = { ...prev };
        delete newState[videoKey];
        return newState;
      });
      setVideoCompleted(prev => {
        const newState = { ...prev };
        delete newState[videoKey];
        return newState;
      });
    }
    
    setInlineVideo(null);
  };

  // UPDATED: Simplified YouTube progress tracking - only for completion
  const startYoutubeProgressSimulation = (videoId) => {
    if (youtubeProgressTimer[videoId]) {
      clearInterval(youtubeProgressTimer[videoId]);
    }
    
    let watchedSeconds = 0;
    const requiredWatchTime = 90; // Minimum 90 seconds for completion
    
    const timer = setInterval(() => {
      watchedSeconds += 1;
      
      setVideoWatchedTime(prev => ({
        ...prev,
        [videoId]: watchedSeconds
      }));
      
      // Mark as completed after required watch time
      if (watchedSeconds >= requiredWatchTime) {
        setVideoCompleted(prev => ({
          ...prev,
          [videoId]: true
        }));
        console.log('🎯 YouTube video ready for completion:', videoId);
      }
      
      console.log('📊 YouTube Progress:', {
        watchedSeconds,
        completed: watchedSeconds >= requiredWatchTime,
        videoId
      });
    }, 1000);
    
    setYoutubeProgressTimer(prev => ({
      ...prev,
      [videoId]: timer
    }));
  };

  // UPDATED: Simplified video completion check - only after full watch
  const canMarkVideoComplete = (video) => {
    if (!video || !video._id) return false;
    
    const videoKey = video._id;
    const completed = videoCompleted[videoKey] || false;
    const startTime = videoStartTime[videoKey];
    const watchedTime = videoWatchedTime[videoKey] || 0;
    
    console.log('🔍 Checking completion for video:', videoKey);
    console.log('🔍 Completed:', completed);
    console.log('🔍 Watched time:', watchedTime);
    
    // For YouTube videos, check if minimum watch time is met
    if (video.videoUri && (video.videoUri.includes('youtube.com') || video.videoUri.includes('youtu.be'))) {
      return completed && watchedTime >= 90; // Must watch at least 90 seconds
    }
    
    // For regular videos, check if video ended
    return completed;
  };

  // UPDATED: Process video URL - disable all controls for YouTube
  const processVideoUrl = (url) => {
    if (!url) return null;
    
    console.log('🔗 Processing video URL:', url);
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      
      try {
        if (url.includes('youtube.com/watch?v=')) {
          videoId = url.split('v=')[1];
          if (videoId && videoId.includes('&')) {
            videoId = videoId.split('&')[0];
          }
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1];
          if (videoId && videoId.includes('?')) {
            videoId = videoId.split('?')[0];
          }
        } else if (url.includes('youtube.com/embed/')) {
          videoId = url.split('youtube.com/embed/')[1];
        } else if (url.includes('youtube.com/v/')) {
          videoId = url.split('youtube.com/v/')[1];
        }
        
        // Clean video ID
        if (videoId.includes('&')) {
          videoId = videoId.split('&')[0];
        }
        if (videoId.includes('?')) {
          videoId = videoId.split('?')[0];
        }
        
        if (videoId && videoId.length === 11) {
          // UPDATED: Completely disable controls, seeking, and keyboard shortcuts
          const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&fs=0&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
          console.log('🔍 Generated YouTube embed URL (no controls):', embedUrl);
          return embedUrl;
        }
        
        console.log('⚠️ Invalid YouTube ID, returning original URL');
        return url;
      } catch (urlError) {
        console.error('❌ Error processing YouTube URL:', urlError);
        return null;
      }
    }
    
    if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      return url;
    }
    
    return url;
  };

  // Handle video ended event for regular videos
  const handleVideoEnded = (videoKey) => {
    console.log('🎯 Video ended:', videoKey);
    setVideoCompleted(prev => ({
      ...prev,
      [videoKey]: true
    }));
  };

  const isVideoUnlocked = (moduleIndex, videoIndex, training) => {
    if (videoIndex === 0) return true;
    
    if (!training || !training.moduleDetails || !training.moduleDetails[moduleIndex]) return false;
    
    const module = training.moduleDetails[moduleIndex];
    if (!module.videos || videoIndex === 0) return true;
    
    const previousVideo = module.videos[videoIndex - 1];
    if (!previousVideo) return false;
    
    const trainingProgressKey = `training_${training._id || training.id}`;
    const trainingProgress = userProgress[trainingProgressKey] || {};
    return trainingProgress.completedVideos?.includes(previousVideo._id) || false;
  };

  const isModuleUnlocked = (moduleIndex, training) => {
    if (moduleIndex === 0) return true;
    
    if (!training || !training.moduleDetails || !training.moduleDetails[moduleIndex - 1]) return false;
    
    const previousModule = training.moduleDetails[moduleIndex - 1];
    if (!previousModule.videos) return false;
    
    const trainingProgressKey = `training_${training._id || training.id}`;
    const trainingProgress = userProgress[trainingProgressKey] || {};
    return previousModule.videos.every(video => 
      trainingProgress.completedVideos?.includes(video._id)
    );
  };

  const handleStartTraining = async (training) => {
    try {
      console.log('Starting training:', training.title);
      setSelectedTraining(training);
      setShowModulesView(true);
    } catch (error) {
      console.error('Error starting training:', error);
    }
  };

  const getCurrentTrainings = () => {
    return activeTab === 'assigned' ? assignedTrainings : mandatoryTrainings;
  };

  const getTrainingProgress = (training) => {
    if (!training || !training._id && !training.id) return 0;
    
    const trainingId = training._id || training.id;
    const trainingProgressKey = `training_${trainingId}`;
    const trainingProgress = userProgress[trainingProgressKey] || {};
    
    if (training.moduleDetails) {
      const totalVideos = training.moduleDetails.reduce((total, module) => 
        total + (module.videos ? module.videos.length : 0), 0
      );
      
      if (totalVideos > 0) {
        const completedVideos = trainingProgress.completedVideos?.length || 0;
        return Math.round((completedVideos / totalVideos) * 100);
      }
    }
    
    return 0;
  };

  const isTrainingCompleted = (training) => {
    if (!training || !training._id && !training.id) return false;
    
    const trainingId = training._id || training.id;
    const trainingProgressKey = `training_${trainingId}`;
    const trainingProgress = userProgress[trainingProgressKey] || {};
    
    if (trainingProgress.trainingCompleted) return true;
    
    if (training.moduleDetails) {
      const totalVideos = training.moduleDetails.reduce((total, module) => 
        total + (module.videos ? module.videos.length : 0), 0
      );
      
      if (totalVideos > 0) {
        const completedVideos = trainingProgress.completedVideos?.length || 0;
        return completedVideos >= totalVideos;
      }
    }
    
    return false;
  };

  const getPendingTrainings = () => {
    return getCurrentTrainings().filter(training => 
      !isTrainingCompleted(training)
    );
  };

  const getCompletedTrainings = () => {
    return getCurrentTrainings().filter(training => 
      isTrainingCompleted(training)
    );
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return { color: 'secondary', text: 'No deadline' };
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { color: 'danger', text: 'Overdue' };
    } else if (diffDays <= 2) {
      return { color: 'danger', text: `${diffDays} days left` };
    } else if (diffDays <= 5) {
      return { color: 'warning', text: `${diffDays} days left` };
    } else {
      return { color: 'success', text: `${diffDays} days left` };
    }
  };

  const handleBackToTrainings = () => {
    setShowModulesView(false);
    setSelectedTraining(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("employeeData");
    localStorage.removeItem("loginStatus");
    
    if (currentUserId) {
      localStorage.removeItem(`userProgress_${currentUserId}`);
    }
    
    setCurrentEmployee(null);
    setAssignedTrainings([]);
    setMandatoryTrainings([]);
    setUserProgress({});
    
    navigate('/login');
  };

  const handleRefreshEmployeeData = () => {
    console.log('🔄 Refreshing employee data...');
    const storedEmployeeData = localStorage.getItem("employeeData");
    if (storedEmployeeData) {
      try {
        const employeeData = JSON.parse(storedEmployeeData);
        setCurrentEmployee(employeeData);
        console.log('👤 Employee data refreshed:', employeeData);
        fetchUserTrainings();
      } catch (err) {
        console.error('Error parsing refreshed employee data:', err);
        setError('Failed to refresh employee data. Please login again.');
      }
    } else {
      setError('No employee data found. Please login again.');
    }
  };

  // Check if user is authenticated
  if (!currentEmployee) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="text-muted mb-3">🔒</div>
          <h5 className="text-muted">Authentication Required</h5>
          <p className="text-muted">Please login to view your trainings.</p>
          <div className="d-flex gap-2 justify-content-center">
            <Button variant="primary" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
            <Button variant="outline-secondary" onClick={handleRefreshEmployeeData}>
              🔄 Refresh Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="border" role="status" className="mb-3" style={{ color: '#20c997' }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="text-muted">Fetching your trainings...</p>
      </div>
    );
  }

  // Show module details view when training is selected
  if (showModulesView && selectedTraining) {
    return (
      <div className="bg-light min-vh-100">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <Container fluid>
            <div className="d-flex align-items-center py-3">
              <Button 
                variant="link" 
                className="text-decoration-none p-0 me-3"
                onClick={handleBackToTrainings}
              >
                <ArrowLeft size={24} />
              </Button>
              <div>
                <h5 className="mb-0 fw-bold">{selectedTraining.title}</h5>
                <small className="text-muted">Training Modules</small>
              </div>
            </div>
          </Container>
        </div>

        {/* Module Cards */}
        <Container className="py-4">
          <Row className="g-4">
            {selectedTraining.moduleDetails && selectedTraining.moduleDetails.map((module, moduleIndex) => {
              const moduleUnlocked = isModuleUnlocked(moduleIndex, selectedTraining);
              const completedVideos = module.videos ? module.videos.filter(video => {
                const trainingProgressKey = `training_${selectedTraining._id || selectedTraining.id}`;
                const trainingProgress = userProgress[trainingProgressKey] || {};
                return trainingProgress.completedVideos?.includes(video._id);
              }).length : 0;
              const totalVideos = module.videos ? module.videos.length : 0;
              const moduleProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

              return (
                <Col key={`module-${moduleIndex}`} xs={12}>
                  <Card className={`h-100 border-0 shadow-sm ${!moduleUnlocked ? 'opacity-75' : ''}`}>
                    <Card.Body className="p-4">
                      {/* Module Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="fw-bold mb-1">
                            Module {String(moduleIndex + 1).padStart(2, '0')}
                          </h6>
                          <p className="text-muted small mb-0">
                            {module.title || `Module ${moduleIndex + 1}`}
                          </p>
                          {module.description && (
                            <p className="text-muted small mt-1 mb-0">{module.description}</p>
                          )}
                        </div>
                        <div className="text-end">
                          <Badge 
                            bg={moduleProgress === 100 ? 'success' : moduleProgress > 0 ? 'warning' : 'secondary'}
                            className="mb-2"
                          >
                            {moduleProgress === 100 ? 'Completed' : moduleUnlocked ? `${Math.round(moduleProgress)}%` : 'Locked'}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">Progress</small>
                          <small className="fw-bold">{Math.round(moduleProgress)}% Completed</small>
                        </div>
                        <ProgressBar 
                          now={moduleProgress} 
                          className="mb-2"
                          style={{ height: '6px' }}
                          variant={moduleProgress === 100 ? 'success' : moduleProgress > 0 ? 'info' : 'secondary'}
                        />
                      </div>

                      {/* Module Content */}
                      {moduleUnlocked ? (
                        <>
                          {/* Topic List */}
                          {module.videos && module.videos.length > 0 && (
                            <div className="mb-3">
                              <h6 className="fw-semibold mb-2 small text-uppercase text-muted">
                                Topics ({totalVideos})
                              </h6>
                              <div className="d-grid gap-2">
                                {module.videos.map((video, videoIndex) => {
                                  const videoUnlocked = isVideoUnlocked(moduleIndex, videoIndex, selectedTraining);
                                  const isVideoCompleted = (() => {
                                    const trainingProgressKey = `training_${selectedTraining._id || selectedTraining.id}`;
                                    const trainingProgress = userProgress[trainingProgressKey] || {};
                                    return trainingProgress.completedVideos?.includes(video._id);
                                  })();

                                  return (
                                    <Card key={`topic-${videoIndex}`} className="border">
                                      <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div className="flex-grow-1">
                                            <h6 className="mb-1 fw-semibold">
                                              {video.title || `Topic ${videoIndex + 1}`}
                                            </h6>
                                            <small className="text-muted">
                                              Duration: {video.duration || '15'} min | 🚫 Must Watch Complete Video
                                            </small>
                                          </div>
                                          <div>
                                            {isVideoCompleted ? (
                                              <Badge bg="success">
                                                <CheckCircleFill className="me-1" />
                                                Completed
                                              </Badge>
                                            ) : videoUnlocked ? (
                                              <Button 
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleInlineVideo(video, moduleIndex, videoIndex)}
                                              >
                                                Watch Now
                                              </Button>
                                            ) : (
                                              <Badge bg="secondary">
                                                <LockFill className="me-1" />
                                                Locked
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="mt-4 d-flex gap-2">
                            <Button 
                              variant={moduleProgress > 0 ? 'outline-success' : 'success'}
                              className="flex-grow-1"
                              onClick={() => {
                                if (module.videos && module.videos.length > 0) {
                                  const firstUncompletedVideo = module.videos.find(video => {
                                    const trainingProgressKey = `training_${selectedTraining._id || selectedTraining.id}`;
                                    const trainingProgress = userProgress[trainingProgressKey] || {};
                                    return !trainingProgress.completedVideos?.includes(video._id);
                                  });
                                  if (firstUncompletedVideo) {
                                    const videoIndex = module.videos.findIndex(v => v._id === firstUncompletedVideo._id);
                                    handleInlineVideo(firstUncompletedVideo, moduleIndex, videoIndex);
                                  }
                                }
                              }}
                            >
                              {moduleProgress > 0 ? 'Continue Training' : 'Start Training'}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <LockFill size={32} className="text-muted mb-2" />
                          <p className="text-muted mb-0">
                            Complete the previous module to unlock this content
                          </p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>

        {/* UPDATED: Video Player with NO CONTROLS and completion tracking */}
        {inlineVideo && (
          <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
            <div className="bg-white rounded shadow" style={{ width: '90%', maxWidth: '800px' }}>
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h5 className="mb-0">🎬 {inlineVideo.title || 'Video'}</h5>
                <Button 
                  variant="light" 
                  size="sm" 
                  onClick={closeInlineVideo}
                >
                  <X />
                </Button>
              </div>
              
              {/* Warning Banner */}
              <div className="px-3 py-2 bg-warning bg-opacity-10 border-bottom">
                <div className="d-flex align-items-center">
                  <span className="me-2">⚠️</span>
                  <small className="fw-bold text-warning">
                    You must watch the complete video. No skipping or fast forwarding allowed.
                  </small>
                </div>
              </div>

              {/* Watch Progress Info */}
              <div className="px-3 py-2 bg-light border-bottom small">
                <div className="row">
                  <div className="col-md-6">
                    <strong>Watched Time:</strong> {Math.round(videoWatchedTime[inlineVideo._id] || 0)}s
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong> {videoCompleted[inlineVideo._id] ? '✅ Ready to Complete' : '⏳ Watching...'}
                  </div>
                </div>
              </div>

              <div className="ratio ratio-16x9">
                {inlineVideo.videoUri && (
                  inlineVideo.videoUri.includes('youtube.com') || inlineVideo.videoUri.includes('youtu.be') ? (
                    <iframe
                      src={processVideoUrl(inlineVideo.videoUri)}
                      title={inlineVideo.title || 'Video'}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen={false}
                      style={{ border: 'none' }}
                      onLoad={() => {
                        const videoKey = inlineVideo._id;
                        setVideoStartTime(prev => ({
                          ...prev,
                          [videoKey]: Date.now()
                        }));
                        startYoutubeProgressSimulation(videoKey);
                        console.log('🎬 YouTube video loaded - no controls enabled');
                      }}
                      onError={(e) => {
                        console.error('YouTube iframe error:', e);
                        setError('Failed to load YouTube video. Please check the URL.');
                      }}
                    />
                  ) : (
                    <video
                      controls={false} // NO CONTROLS AT ALL
                      autoPlay
                      className="w-100 h-100"
                      style={{ objectFit: 'contain' }}
                      controlsList="nodownload nofullscreen noremoteplayback"
                      disablePictureInPicture
                      onLoadStart={() => {
                        const videoKey = inlineVideo._id;
                        setVideoStartTime(prev => ({
                          ...prev,
                          [videoKey]: Date.now()
                        }));
                        console.log('🎬 Regular video loading started - no controls');
                      }}
                      onEnded={() => handleVideoEnded(inlineVideo._id)}
                      onError={(e) => {
                        console.error('Video playback error:', e);
                        setError('Failed to load video. Please check the video file.');
                      }}
                      onContextMenu={(e) => e.preventDefault()} // Disable right-click
                    >
                      <source src={inlineVideo.videoUri} type="video/mp4" />
                      <source src={inlineVideo.videoUri} type="video/webm" />
                      <source src={inlineVideo.videoUri} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                  )
                )}
                {!inlineVideo.videoUri && (
                  <div className="d-flex align-items-center justify-content-center bg-light">
                    <div className="text-center p-4">
                      <div className="text-muted mb-2">🎬</div>
                      <p className="text-muted mb-0">Video URL not available</p>
                      <small className="text-muted">Please check with your administrator</small>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">
                      Module {inlineVideo.moduleIndex + 1}, Video {inlineVideo.videoIndex + 1}
                    </small>
                    <br />
                    <small className="text-muted">
                      📺 URL: {inlineVideo.videoUri ? inlineVideo.videoUri.substring(0, 50) + '...' : 'N/A'}
                    </small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {canMarkVideoComplete(inlineVideo) ? (
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => {
                          handleVideoComplete(inlineVideo, inlineVideo.moduleIndex, inlineVideo.videoIndex);
                        }}
                      >
                        <CheckCircleFill className="me-1" />
                        Mark Complete
                      </Button>
                    ) : (
                      <div className="text-center">
                        <div className="text-muted small mb-1">
                          ⏱️ Watch the complete video to enable completion
                        </div>
                        <div className="text-muted small">
                          Watched: {Math.round(videoWatchedTime[inlineVideo._id] || 0)}s
                        </div>
                        <div className="text-muted small mt-1">
                          <small>
                            {inlineVideo.videoUri && (inlineVideo.videoUri.includes('youtube.com') || inlineVideo.videoUri.includes('youtu.be')) 
                              ? 'Minimum watch time: 90 seconds' 
                              : 'Must watch complete video'
                            }
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main training list view
  if (!loading && assignedTrainings.length === 0 && mandatoryTrainings.length === 0 && !error) {
    return (
      <div className="bg-light min-vh-100">
        <div className="bg-white shadow-sm">
          <Container fluid>
            <div className="py-3">
              <h4 className="mb-0 fw-bold">Trainings</h4>
            </div>
          </Container>
        </div>
        <Container className="py-4 text-center">
          <div className="mb-4">
            <h5 className="text-muted">No Trainings Found</h5>
            <p className="text-muted">
              It looks like no trainings have been assigned to you yet.
            </p>
            {currentEmployee && (
              <div className="mt-3 p-3 bg-light rounded">
                <h6 className="text-muted mb-2">Current Employee Criteria:</h6>
                <div className="row text-center">
                  <div className="col-md-3">
                    <small className="text-muted d-block">Employee ID</small>
                    <strong>{currentEmployee.employeeId}</strong>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted d-block">Designation</small>
                    <strong>{currentEmployee.role}</strong>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted d-block">Branch</small>
                    <strong>{currentEmployee.Store}</strong>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted d-block">Status</small>
                    <span className="badge bg-warning">No trainings match</span>
                  </div>
                </div>
                <p className="text-muted small mt-2 mb-0">
                  Contact your administrator if you believe trainings should be assigned to you.
                </p>
              </div>
            )}
          </div>
          <Button variant="primary" onClick={fetchUserTrainings} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Trainings'}
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <Container fluid>
          <div className="py-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h4 className="mb-0 fw-bold">Trainings</h4>
                {currentEmployee && (
                  <div className="mt-2">
                    <small className="text-muted">
                      👤 <strong>{currentEmployee.name}</strong> | 
                      🆔 <strong>{currentEmployee.employeeId}</strong> | 
                      💼 <strong>{currentEmployee.role}</strong> | 
                      🏢 <strong>{currentEmployee.Store}</strong>
                    </small>
                  </div>
                )}
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={handleRefreshEmployeeData}
                  disabled={loading}
                >
                  🔄 Refresh
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={handleLogout}
                >
                  🔓 Logout
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Tabs */}
      <div className="bg-white border-bottom">
        <Container fluid>
          <div className="d-flex">
            <Button
              variant="link"
              className={`text-decoration-none flex-fill py-3 border-0 ${
                activeTab === 'assigned' ? 'border-bottom border-success border-3 fw-bold text-success' : 'text-muted'
              }`}
              onClick={() => setActiveTab('assigned')}
            >
              Assigned ({assignedTrainings.length})
            </Button>
            <Button
              variant="link"
              className={`text-decoration-none flex-fill py-3 border-0 ${
                activeTab === 'mandatory' ? 'border-bottom border-success border-3 fw-bold text-success' : 'text-muted'
              }`}
              onClick={() => setActiveTab('mandatory')}
            >
              Mandatory ({mandatoryTrainings.length})
            </Button>
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container className="py-4">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <Alert variant="info" className="mb-4">
            <strong>Debug Info:</strong> {debugInfo}
          </Alert>
        )}

        {/* Employee Filter Info */}
        {currentEmployee && (
          <Alert variant="secondary" className="mb-4">
            <strong>🔍 Training Filter Applied:</strong>
            <div className="mt-2">
              <small>
                <strong>Employee ID:</strong> {currentEmployee.employeeId} | 
                <strong>Designation:</strong> {currentEmployee.role} | 
                <strong>Branch:</strong> {currentEmployee.Store}
              </small>
            </div>
            <div className="mt-1">
              <small className="text-muted">
                Showing only trainings assigned to you, matching your designation, or matching your branch.
              </small>
            </div>
            {assignedTrainings.length > 0 || mandatoryTrainings.length > 0 ? (
              <div className="mt-2">
                <small className="text-success">
                  ✅ Found {assignedTrainings.length + mandatoryTrainings.length} relevant trainings
                </small>
              </div>
            ) : (
              <div className="mt-2">
                <small className="text-warning">
                  ⚠️ No trainings match your criteria. Contact your administrator.
                </small>
              </div>
            )}
          </Alert>
        )}

        {/* Pending Trainings */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3">
            Pending Trainings ({getPendingTrainings().length})
          </h5>
          {getPendingTrainings().length === 0 ? (
            <Alert variant="info" className="text-center">
              <p className="mb-0">No pending trainings found.</p>
              <small>
                {getCurrentTrainings().length === 0 
                  ? 'No trainings have been assigned to you yet.' 
                  : 'All your trainings are completed!'
                }
              </small>
            </Alert>
          ) : (
            <Row className="g-4">
              {getPendingTrainings().map((training, trainingIndex) => {
                const deadlineStatus = getDeadlineStatus(training.deadline);
                const uniqueTrainingId = training.id || training._id || `training-${trainingIndex}`;
                
                return (
                  <Col key={`training-${uniqueTrainingId}-${trainingIndex}`} xs={12} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="p-4">
                        {/* Training Header */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 className="fw-bold mb-1">{training.title}</h6>
                            {training.description && (
                              <p className="text-muted small mb-0">{training.description}</p>
                            )}
                          </div>
                          <Badge bg={deadlineStatus.color} className="ms-2">
                            {deadlineStatus.text}
                          </Badge>
                        </div>
                        
                        {/* Progress */}
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">🚫 Complete Video Watch Required - No Skipping Allowed</small>
                            <small className="fw-bold">
                              {isTrainingCompleted(training) ? '100% Completed' : `${getTrainingProgress(training)}% Completed`}
                            </small>
                          </div>
                          <ProgressBar 
                            now={isTrainingCompleted(training) ? 100 : getTrainingProgress(training)} 
                            className="mb-2"
                            style={{ height: '8px' }}
                            variant={isTrainingCompleted(training) ? 'success' : getTrainingProgress(training) > 75 ? 'success' : getTrainingProgress(training) > 25 ? 'warning' : 'info'}
                          />
                        </div>

                        {/* Module Count and Type */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center gap-2">
                            {training.moduleDetails && (
                              <small className="text-muted">
                                📚 {training.moduleDetails.length} modules
                              </small>
                            )}
                            <Badge 
                              bg={training.type === 'mandatory' ? 'danger' : 'primary'} 
                              className="small"
                            >
                              {training.type}
                            </Badge>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="d-grid">
                          {isTrainingCompleted(training) ? (
                            <Button 
                              variant="outline-success"
                              onClick={() => handleStartTraining(training)}
                            >
                              <CheckCircleFill className="me-1" />
                              Review Training
                            </Button>
                          ) : (
                            <Button 
                              variant={training.progress > 0 ? 'outline-success' : 'success'}
                              onClick={() => handleStartTraining(training)}
                            >
                              {training.progress > 0 ? 'Continue Training' : 'Start Training'}
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>

        {/* Completed Trainings */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3">
            Completed Trainings ({getCompletedTrainings().length})
          </h5>
          {getCompletedTrainings().length === 0 ? (
            <p className="text-muted text-center">No completed trainings yet</p>
          ) : (
            <Row className="g-4">
              {getCompletedTrainings().map((training, trainingIndex) => {
                const uniqueCompletedTrainingId = training.id || training._id || `completed-training-${trainingIndex}`;
                return (
                  <Col key={`completed-training-${uniqueCompletedTrainingId}-${trainingIndex}`} xs={12} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm bg-light">
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 className="fw-bold mb-1">{training.title}</h6>
                            {training.description && (
                              <p className="text-muted small mb-0">{training.description}</p>
                            )}
                          </div>
                          <Badge bg="success">Completed</Badge>
                        </div>
                        
                        <div className="mb-3">
                          <ProgressBar 
                            now={100} 
                            variant="success"
                            style={{ height: '8px' }}
                          />
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <Badge 
                            bg={training.type === 'mandatory' ? 'danger' : 'primary'} 
                            className="small"
                          >
                            {training.type}
                          </Badge>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleStartTraining(training)}
                          >
                            Review
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <Button 
            variant="outline-primary" 
            onClick={fetchUserTrainings}
            disabled={loading}
            size="lg"
          >
            {loading ? 'Refreshing...' : 'Refresh Trainings'}
          </Button>
        </div>
      </Container>

      {/* Video Player Modal */}
      <VideoPlayer
        show={showVideoModal}
        onHide={() => setShowVideoModal(false)}
        video={selectedVideo}
        onVideoComplete={handleVideoComplete}
      />
    </div>
  );
};

export default Training;
