



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
  
//   // UPDATED: Simplified video tracking - only track if video is fully watched
//   const [videoWatchedTime, setVideoWatchedTime] = useState({});
//   const [videoStartTime, setVideoStartTime] = useState({});
//   const [videoCompleted, setVideoCompleted] = useState({}); // Track fully watched videos
//   const [youtubeProgressTimer, setYoutubeProgressTimer] = useState({});

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
//         localStorage.removeItem("employeeData");
//         navigate('/login');
//       }
//     } else {
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

//   const fetchUserTrainings = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       setDebugInfo('Fetching trainings from your API...');
      
//       if (!currentEmployee) {
//         setError('Employee data not available. Please login again.');
//         setLoading(false);
//         return;
//       }
      
//       const isLoggedIn = localStorage.getItem("employeeData");
//       if (!isLoggedIn) {
//         setError('Please login to view your trainings.');
//         setLoading(false);
//         return;
//       }
      
//       console.log('🔍 Fetching trainings for employee:', currentEmployee.employeeId);
      
//       const [assignedData, mandatoryData] = await Promise.all([
//         getUserAssignedTrainings(),
//         getUserMandatoryTrainings()
//       ]);
      
//       console.log('📚 Raw assigned trainings:', assignedData);
//       console.log('📚 Raw mandatory trainings:', mandatoryData);
      
//       // Filter trainings based on current employee's criteria
//       const filterTrainingsByEmployee = (trainings) => {
//         if (!Array.isArray(trainings)) return [];
        
//         const filtered = trainings.filter(training => {
//           const isAssignedToEmployee = (
//             (training.assignedTo && 
//              (training.assignedTo === currentEmployee.employeeId ||
//               (Array.isArray(training.assignedTo) && training.assignedTo.includes(currentEmployee.employeeId)))) ||
//             (training.assignedFor && Array.isArray(training.assignedFor) && 
//              training.assignedFor.some(assignment => {
//                if (typeof assignment === 'string' && assignment.startsWith('Emp')) {
//                  return assignment === currentEmployee.employeeId;
//                }
//                if (typeof assignment === 'string') {
//                  return assignment.toLowerCase() === currentEmployee.role.toLowerCase();
//                }
//                if (typeof assignment === 'object' && assignment !== null) {
//                  return (assignment.employeeId === currentEmployee.employeeId) ||
//                         (assignment.role && assignment.role.toLowerCase() === currentEmployee.role.toLowerCase());
//                }
//                return false;
//              })) ||
//             (training.assignedUsers && Array.isArray(training.assignedUsers) &&
//              training.assignedUsers.some(user => 
//                user.userId === currentEmployee.employeeId ||
//                user.employeeId === currentEmployee.employeeId
//              ))
//           );
          
//           const matchesDesignation = (
//             (training.designation && 
//              (training.designation === currentEmployee.role ||
//               (Array.isArray(training.designation) && training.designation.includes(currentEmployee.role)))) ||
//             (training.role && 
//              (training.role === currentEmployee.role ||
//               (Array.isArray(training.role) && training.role.includes(currentEmployee.role)))) ||
//             (training.assignedFor && Array.isArray(training.assignedFor) &&
//              training.assignedFor.some(assignment => {
//                if (typeof assignment === 'string') {
//                  return assignment.toLowerCase() === currentEmployee.role.toLowerCase();
//                }
//                if (typeof assignment === 'object' && assignment !== null) {
//                  return assignment.role === currentEmployee.role ||
//                         assignment.designation === currentEmployee.role;
//                }
//                return false;
//              }))
//           );
          
//           const matchesBranch = (
//             (training.branch && 
//              (training.branch === currentEmployee.Store ||
//               (Array.isArray(training.branch) && training.branch.includes(currentEmployee.Store)))) ||
//             (training.store && 
//              (training.store === currentEmployee.Store ||
//               (Array.isArray(training.store) && training.store.includes(currentEmployee.Store)))) ||
//             (training.Store && 
//              (training.Store === currentEmployee.Store ||
//               (Array.isArray(training.Store) && training.Store.includes(currentEmployee.Store))))
//           );
          
//           return isAssignedToEmployee || matchesDesignation || matchesBranch;
//         });
        
//         return filtered;
//       };
      
//       const transformedAssignedData = await Promise.all(assignedData.map(t => transformTrainingData(t)));
//       const transformedMandatoryData = await Promise.all(mandatoryData.map(t => transformTrainingData(t)));
      
//       const filteredAssigned = filterTrainingsByEmployee(transformedAssignedData);
//       const filteredMandatory = filterTrainingsByEmployee(transformedMandatoryData);
      
//       setAssignedTrainings(filteredAssigned);
//       setMandatoryTrainings(filteredMandatory);
      
//       try {
//         const enhancedAssigned = await Promise.all(
//           filteredAssigned.map(training => getTrainingWithModules(training))
//         );
        
//         const enhancedMandatory = await Promise.all(
//           filteredMandatory.map(training => getTrainingWithModules(training))
//         );
        
//         setAssignedTrainings(enhancedAssigned || []);
//         setMandatoryTrainings(enhancedMandatory || []);
//       } catch (enhancementError) {
//         console.error('❌ Error enhancing trainings:', enhancementError);
//         setAssignedTrainings(filteredAssigned || []);
//         setMandatoryTrainings(filteredMandatory || []);
//         setDebugInfo('Videos may not display due to enhancement error.');
//       }
      
//       setApiStatus('connected');
//       const totalFiltered = (filteredAssigned?.length || 0) + (filteredMandatory?.length || 0);
//       setDebugInfo(`✅ Fetched ${totalFiltered} trainings for ${currentEmployee.employeeId}`);
      
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

//   const handleVideoComplete = (video, moduleIndex, videoIndex) => {
//     console.log('🎯 Video completed:', video, 'Module:', moduleIndex, 'Video:', videoIndex);
    
//     let currentTraining = null;
//     if (inlineVideo && inlineVideo.trainingId) {
//       currentTraining = inlineVideo.trainingId;
//     } else if (selectedVideo && selectedVideo.trainingId) {
//       currentTraining = selectedVideo.trainingId;
//     }
    
//     if (currentTraining) {
//       const trainingProgressKey = `training_${currentTraining}`;
//       const currentTrainingProgress = userProgress[trainingProgressKey] || {};
      
//       const newTrainingProgress = {
//         ...currentTrainingProgress,
//         completedVideos: [...(currentTrainingProgress.completedVideos || []), video._id],
//         lastCompletedVideo: video._id,
//         lastCompletedAt: new Date().toISOString()
//       };
      
//       const training = [...assignedTrainings, ...mandatoryTrainings].find(t => 
//         (t._id || t.id) === currentTraining
//       );
      
//       if (training && training.moduleDetails) {
//         const totalVideos = training.moduleDetails.reduce((total, module) => 
//           total + (module.videos ? module.videos.length : 0), 0
//         );
        
//         if (newTrainingProgress.completedVideos.length >= totalVideos) {
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
      
//       // REMOVED: fetchUserTrainings() call that was causing page refresh
//       // Instead, just update the local state immediately
//       setAssignedTrainings(prev => 
//         prev.map(t => {
//           if ((t._id || t.id) === currentTraining) {
//             return {
//               ...t,
//               moduleDetails: t.moduleDetails?.map(module => ({
//                 ...module,
//                 videos: module.videos?.map(v => 
//                   v._id === video._id ? { ...v, completed: true } : v
//                 )
//               }))
//             };
//           }
//           return t;
//         })
//       );
      
//       setMandatoryTrainings(prev => 
//         prev.map(t => {
//           if ((t._id || t.id) === currentTraining) {
//             return {
//               ...t,
//               moduleDetails: t.moduleDetails?.map(module => ({
//                 ...module,
//                 videos: module.videos?.map(v => 
//                   v._id === video._id ? { ...v, completed: true } : v
//                 )
//               }))
//             };
//           }
//           return t;
//         })
//       );
//     }
    
//     // Show success message without page refresh
//     alert(`🎉 Congratulations! You've completed "${video.title}"`);
//     closeInlineVideo();
//   };

//   const handleInlineVideo = (video, moduleIndex, videoIndex) => {
//     console.log('🎬 Playing inline video:', video);
    
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
//     setVideoCompleted(prev => ({
//       ...prev,
//       [videoKey]: false
//     }));
    
//     setInlineVideo({
//       ...video,
//       moduleIndex,
//       videoIndex,
//       trainingId: selectedTraining?._id || selectedTraining?.id
//     });
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
//       setVideoCompleted(prev => {
//         const newState = { ...prev };
//         delete newState[videoKey];
//         return newState;
//       });
//     }
    
//     setInlineVideo(null);
//   };

//   // Start YouTube progress simulation with timer-based logic
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
      
//       // Mark as completed after required watch time
//       if (watchedSeconds >= requiredWatchTime) {
//         setVideoCompleted(prev => ({
//           ...prev,
//           [videoId]: true
//         }));
//         console.log('🎯 YouTube video ready for completion:', videoId);
        
//         // STOP THE TIMER when video is completed
//         clearInterval(timer);
//         setYoutubeProgressTimer(prev => {
//           const newTimers = { ...prev };
//           delete newTimers[videoId];
//           return newTimers;
//         });
//       }
      
//       console.log('📊 YouTube Progress:', {
//         watchedSeconds,
//         progress: Math.min((watchedSeconds / requiredWatchTime) * 100, 100),
//         completed: watchedSeconds >= requiredWatchTime,
//         videoId
//       });
//     }, 1000);
    
//     setYoutubeProgressTimer(prev => ({
//       ...prev,
//       [videoId]: timer
//     }));
//   };

//   // Timer-based video completion check
//   const canMarkVideoComplete = (video) => {
//     if (!video || !video._id) return false;
    
//     const videoKey = video._id;
//     const completed = videoCompleted[videoKey] || false;
//     const startTime = videoStartTime[videoKey];
//     const watchedTime = videoWatchedTime[videoKey] || 0;
    
//     console.log('🔍 Checking completion for video:', videoKey);
//     console.log('🔍 Completed:', completed);
//     console.log('🔍 Watched time:', watchedTime);
//     console.log('🔍 Start time:', startTime);
    
//     // For YouTube videos, use time-based approach
//     if (video.videoUri && (video.videoUri.includes('youtube.com') || video.videoUri.includes('youtu.be'))) {
//       if (!startTime) {
//         console.log('❌ No start time for YouTube video');
//         return false;
//       }
      
//       const totalWatchDuration = Date.now() - startTime;
//       const minimumRealTime = 90000; // 90 seconds minimum real time
//       const minimumWatchedTime = 90; // 90 seconds minimum tracked time
      
//       const canComplete = totalWatchDuration >= minimumRealTime && watchedTime >= minimumWatchedTime;
      
//       console.log('🔍 YouTube video validation:', {
//         totalWatchDuration,
//         minimumRealTime,
//         watchedTime,
//         minimumWatchedTime,
//         canComplete
//       });
      
//       return canComplete;
//     }
    
//     // For regular videos, check if video ended
//     return completed;
//   };

//   // UPDATED: Process video URL - disable all controls for YouTube
//   const processVideoUrl = (url) => {
//     if (!url) return null;
    
//     console.log('🔗 Processing video URL:', url);
    
//     if (url.includes('youtube.com') || url.includes('youtu.be')) {
//       let videoId = '';
      
//       try {
//       if (url.includes('youtube.com/watch?v=')) {
//         videoId = url.split('v=')[1];
//           if (videoId && videoId.includes('&')) {
//             videoId = videoId.split('&')[0];
//           }
//       } else if (url.includes('youtu.be/')) {
//         videoId = url.split('youtu.be/')[1];
//           if (videoId && videoId.includes('?')) {
//             videoId = videoId.split('?')[0];
//           }
//         } else if (url.includes('youtube.com/embed/')) {
//           videoId = url.split('youtube.com/embed/')[1];
//         } else if (url.includes('youtube.com/v/')) {
//           videoId = url.split('youtube.com/v/')[1];
//         }
        
//         // Clean video ID
//       if (videoId.includes('&')) {
//         videoId = videoId.split('&')[0];
//       }
//       if (videoId.includes('?')) {
//         videoId = videoId.split('?')[0];
//       }
      
//         if (videoId && videoId.length === 11) {
//           // UPDATED: Completely disable controls, seeking, and keyboard shortcuts
//           const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&fs=0&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
//           console.log('🔍 Generated YouTube embed URL (no controls):', embedUrl);
//           return embedUrl;
//         }
        
//         console.log('⚠️ Invalid YouTube ID, returning original URL');
//         return url;
//       } catch (urlError) {
//         console.error('❌ Error processing YouTube URL:', urlError);
//         return null;
//       }
//     }
    
//     if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
//       return url;
//     }
    
//     return url;
//   };

//   // Handle video ended event for regular videos
//   const handleVideoEnded = (videoKey) => {
//     console.log('🎯 Video ended:', videoKey);
//     setVideoCompleted(prev => ({
//       ...prev,
//       [videoKey]: true
//     }));
//   };

//   const isVideoUnlocked = (moduleIndex, videoIndex, training) => {
//     if (videoIndex === 0) return true;
    
//     if (!training || !training.moduleDetails || !training.moduleDetails[moduleIndex]) return false;
    
//     const module = training.moduleDetails[moduleIndex];
//     if (!module.videos || videoIndex === 0) return true;
    
//     const previousVideo = module.videos[videoIndex - 1];
//     if (!previousVideo) return false;
    
//     const trainingProgressKey = `training_${training._id || training.id}`;
//     const trainingProgress = userProgress[trainingProgressKey] || {};
//     return trainingProgress.completedVideos?.includes(previousVideo._id) || false;
//   };

//   const isModuleUnlocked = (moduleIndex, training) => {
//     if (moduleIndex === 0) return true;
    
//     if (!training || !training.moduleDetails || !training.moduleDetails[moduleIndex - 1]) return false;
    
//     const previousModule = training.moduleDetails[moduleIndex - 1];
//     if (!previousModule.videos) return false;
    
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

//   const getCurrentTrainings = () => {
//     return activeTab === 'assigned' ? assignedTrainings : mandatoryTrainings;
//   };

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

//   const isTrainingCompleted = (training) => {
//     if (!training || !training._id && !training.id) return false;
    
//     const trainingId = training._id || training.id;
//     const trainingProgressKey = `training_${trainingId}`;
//     const trainingProgress = userProgress[trainingProgressKey] || {};
    
//     if (trainingProgress.trainingCompleted) return true;
    
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

//   const handleBackToTrainings = () => {
//     setShowModulesView(false);
//     setSelectedTraining(null);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("employeeData");
//     localStorage.removeItem("loginStatus");
    
//     if (currentUserId) {
//       localStorage.removeItem(`userProgress_${currentUserId}`);
//     }
    
//     setCurrentEmployee(null);
//     setAssignedTrainings([]);
//     setMandatoryTrainings([]);
//     setUserProgress({});
    
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
//                                             const completedVideos = module.videos ? module.videos.filter(video => {
//                                 const trainingProgressKey = `training_${selectedTraining._id || selectedTraining.id}`;
//                                 const trainingProgress = userProgress[trainingProgressKey] || {};
//                                 return trainingProgress.completedVideos?.includes(video._id);
//                               }).length : 0;
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
//                                               Duration: {video.duration || '15'} min | 🚫 Must Watch Complete Video
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

//         {/* UPDATED: Video Player with NO CONTROLS and completion tracking */}
//         {inlineVideo && (
//           <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
//             <div className="bg-white rounded shadow" style={{ width: '90%', maxWidth: '800px' }}>
//                              <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
//                  <h5 className="mb-0">🎬 {inlineVideo.title || 'Video'}</h5>
//                  <Button 
//                    variant="light" 
//                    size="sm" 
//                    onClick={closeInlineVideo}
//                  >
//                    <X />
//                  </Button>
//                </div>
              
//               {/* Warning Banner */}
//               <div className="px-3 py-2 bg-warning bg-opacity-10 border-bottom">
//                 <div className="d-flex align-items-center">
//                   <span className="me-2">⚠️</span>
//                   <small className="fw-bold text-warning">
//                     You must watch the complete video. No skipping or fast forwarding allowed.
//                   </small>
//                 </div>
//               </div>

//               {/* Watch Progress Info */}
//                <div className="px-3 py-2 bg-light border-bottom small">
//                  <div className="row">
//                    <div className="col-md-6">
//                     <strong>Watched Time:</strong> {Math.round(videoWatchedTime[inlineVideo._id] || 0)}s
//                    </div>
//                    <div className="col-md-6">
//                     <strong>Status:</strong> {videoCompleted[inlineVideo._id] ? '✅ Ready to Complete' : '⏳ Watching...'}
//                    </div>
//                  </div>
//                    </div>

//                              <div className="ratio ratio-16x9">
//                  {inlineVideo.videoUri && (
//                    inlineVideo.videoUri.includes('youtube.com') || inlineVideo.videoUri.includes('youtu.be') ? (
//                                            <iframe
//                         src={processVideoUrl(inlineVideo.videoUri)}
//                         title={inlineVideo.title || 'Video'}
//                         frameBorder="0"
//                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                       allowFullScreen={false}
//                         style={{ border: 'none' }}
//                         onLoad={() => {
//                           const videoKey = inlineVideo._id;
//                           setVideoStartTime(prev => ({
//                             ...prev,
//                             [videoKey]: Date.now()
//                           }));
//                           startYoutubeProgressSimulation(videoKey);
//                         console.log('🎬 YouTube video loaded - no controls enabled');
//                         }}
//                         onError={(e) => {
//                           console.error('YouTube iframe error:', e);
//                           setError('Failed to load YouTube video. Please check the URL.');
//                         }}
//                       />
//                    ) : (
//                      <video
//                       controls={false} // NO CONTROLS AT ALL
//                        autoPlay
//                        className="w-100 h-100"
//                        style={{ objectFit: 'contain' }}
//                       controlsList="nodownload nofullscreen noremoteplayback"
//                       disablePictureInPicture
//                        onLoadStart={() => {
//                          const videoKey = inlineVideo._id;
//                          setVideoStartTime(prev => ({
//                            ...prev,
//                            [videoKey]: Date.now()
//                          }));
//                          setVideoWatchedTime(prev => ({
//                            ...prev,
//                            [videoKey]: 1 // Mark as started
//                          }));
//                         console.log('🎬 Regular video loading started - no controls');
//                       }}
//                       onEnded={() => {
//                         console.log('🎯 Regular video ended:', inlineVideo._id);
//                         handleVideoEnded(inlineVideo._id);
//                       }}
//                        onError={(e) => {
//                          console.error('Video playback error:', e);
//                          setError('Failed to load video. Please check the video file.');
//                        }}
//                       onContextMenu={(e) => e.preventDefault()} // Disable right-click
//                      >
//                        <source src={inlineVideo.videoUri} type="video/mp4" />
//                        <source src={inlineVideo.videoUri} type="video/webm" />
//                        <source src={inlineVideo.videoUri} type="video/ogg" />
//                        Your browser does not support the video tag.
//                      </video>
//                    )
//                  )}
//                  {!inlineVideo.videoUri && (
//                    <div className="d-flex align-items-center justify-content-center bg-light">
//                      <div className="text-center p-4">
//                        <div className="text-muted mb-2">🎬</div>
//                        <p className="text-muted mb-0">Video URL not available</p>
//                        <small className="text-muted">Please check with your administrator</small>
//                      </div>
//                    </div>
//                  )}
//                </div>
              
//               <div className="p-3 border-top">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <small className="text-muted">
//                       Module {inlineVideo.moduleIndex + 1}, Video {inlineVideo.videoIndex + 1}
//                     </small>
//                     <br />
//                     <small className="text-muted">
//                       📺 URL: {inlineVideo.videoUri ? inlineVideo.videoUri.substring(0, 50) + '...' : 'N/A'}
//                     </small>
//                   </div>
//                                      <div className="d-flex align-items-center gap-2">
//                                            {canMarkVideoComplete(inlineVideo) ? (
//                         <Button 
//                           variant="success" 
//                           size="sm"
//                           onClick={() => {
//                             handleVideoComplete(inlineVideo, inlineVideo.moduleIndex, inlineVideo.videoIndex);
//                           }}
//                         >
//                           <CheckCircleFill className="me-1" />
//                           Mark Complete
//                         </Button>
//                                              ) : (
//                          <div className="text-center">
//                            <div className="text-muted small mb-1">
//                              ⏱️ Watch the complete video to unlock completion
//                            </div>
//                            <div className="text-muted small">
//                              Watched: {Math.round(videoWatchedTime[inlineVideo._id] || 0)}s
//                            </div>
//                            <div className="text-muted small mt-1">
//                              <small>
//                                {inlineVideo.videoUri && (inlineVideo.videoUri.includes('youtube.com') || inlineVideo.videoUri.includes('youtu.be')) 
//                                  ? 'Minimum watch time: 90 seconds' 
//                                  : 'Must watch complete video'
//                                }
//                              </small>
//                            </div>
//                          </div>
//                        )}
//                    </div>
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
                        
//                                                  {/* Progress */}
//                          <div className="mb-3">
//                            <div className="d-flex justify-content-between align-items-center mb-1">
//                             <small className="text-muted">🚫 Complete Video Watch Required - No Skipping Allowed</small>
//                              <small className="fw-bold">
//                                {isTrainingCompleted(training) ? '100% Completed' : `${getTrainingProgress(training)}% Completed`}
//                              </small>
//                            </div>
//                            <ProgressBar 
//                              now={isTrainingCompleted(training) ? 100 : getTrainingProgress(training)} 
//                              className="mb-2"
//                              style={{ height: '8px' }}
//                              variant={isTrainingCompleted(training) ? 'success' : getTrainingProgress(training) > 75 ? 'success' : getTrainingProgress(training) > 25 ? 'warning' : 'info'}
//                            />
//                          </div>

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

//                                                  {/* Action Button */}
//                          <div className="d-grid">
//                            {isTrainingCompleted(training) ? (
//                              <Button 
//                                variant="outline-success"
//                                onClick={() => handleStartTraining(training)}
//                              >
//                                <CheckCircleFill className="me-1" />
//                                Review Training
//                              </Button>
//                            ) : (
//                              <Button 
//                                variant={training.progress > 0 ? 'outline-success' : 'success'}
//                                onClick={() => handleStartTraining(training)}
//                              >
//                                {training.progress > 0 ? 'Continue Training' : 'Start Training'}
//                              </Button>
//                            )}
//                          </div>
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
//         onHide={() => setShowVideoModal(false)}
//         video={selectedVideo}
//         onVideoComplete={handleVideoComplete}
//       />
//     </div>
//   );
// };

// export default Training;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge,
  Spinner,
  Alert
} from 'react-bootstrap';
import { 
  CheckCircleFill, 
  LockFill,
  X,
  ArrowLeft
} from 'react-bootstrap-icons';
import { 
  getUserAssignedTrainings, 
  getUserMandatoryTrainings,
  transformTrainingData,
  getTrainingWithModules,
  syncVideoCompletionToLMS,
  batchSyncToLMS,
  testLMSConnection,
  testLMSSyncWithSampleData,
  getPendingLMSSyncData,
  clearPendingLMSSyncData
} from '../api';

const Training = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assigned');
  const [assignedTrainings, setAssignedTrainings] = useState([]);
  const [mandatoryTrainings, setMandatoryTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProgress, setUserProgress] = useState({});
  const [currentUserId] = useState('user123');
  const [inlineVideo, setInlineVideo] = useState(null);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showModulesView, setShowModulesView] = useState(false);
  const [videoWatchedTime, setVideoWatchedTime] = useState({});
  const [videoStartTime, setVideoStartTime] = useState({});
  const [videoCompleted, setVideoCompleted] = useState({});
  const [youtubeProgressTimer, setYoutubeProgressTimer] = useState({});
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Load current employee data from localStorage
  useEffect(() => {
    const storedEmployeeData = localStorage.getItem("employeeData");
    if (storedEmployeeData) {
      try {
        const employeeData = JSON.parse(storedEmployeeData);
        setCurrentEmployee(employeeData);
      } catch (err) {
        console.error('Error parsing employee data:', err);
        localStorage.removeItem("employeeData");
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (currentEmployee && currentEmployee.employeeId) {
      fetchUserTrainings();
      // Test LMS connection on startup
      testLMSConnection().then(result => {
        if (result.success) {
          console.log('✅ LMS sync is ready');
        } else {
          console.warn('⚠️ LMS sync may not be available:', result.error);
        }
      });
      
      // Add debugging functions to global scope for easy testing
      window.testLMSSync = testLMSSyncWithSampleData;
      window.getPendingSync = getPendingLMSSyncData;
      window.clearPendingSync = clearPendingLMSSyncData;
      window.testLMSConnection = testLMSConnection;
      
      console.log('🛠️ Debug functions available:', {
        'testLMSSync()': 'Test LMS sync with sample data',
        'getPendingSync()': 'View pending sync data',
        'clearPendingSync()': 'Clear pending sync data',
        'testLMSConnection()': 'Test LMS connection'
      });
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
      } catch (err) {
        console.error('Error parsing saved progress:', err);
      }
    }
  }, [currentUserId]);

  // NEW: Setup batch sync for LMS (runs every 5 minutes)
  useEffect(() => {
    const batchSyncInterval = setInterval(async () => {
      try {
        console.log('🔄 Running batch LMS sync...');
        const result = await batchSyncToLMS();
        if (result.synced > 0) {
          console.log(`✅ Batch sync completed: ${result.synced} items synced`);
        }
      } catch (error) {
        console.error('❌ Batch sync error:', error);
      }
    }, 300000); // 5 minutes

    // Cleanup on unmount
    return () => clearInterval(batchSyncInterval);
  }, []);

  const fetchUserTrainings = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!currentEmployee) {
        setError('Employee data not available. Please login again.');
        setLoading(false);
        return;
      }
      
      const [assignedData, mandatoryData] = await Promise.all([
        getUserAssignedTrainings(),
        getUserMandatoryTrainings()
      ]);
      
      // Filter trainings based on current employee's criteria
      const filterTrainingsByEmployee = (trainings) => {
        if (!Array.isArray(trainings)) return [];
        
        return trainings.filter(training => {
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
             }))
          );
          
          const matchesDesignation = (
            (training.designation && 
             (training.designation === currentEmployee.role ||
              (Array.isArray(training.designation) && training.designation.includes(currentEmployee.role)))) ||
            (training.role && 
             (training.role === currentEmployee.role ||
              (Array.isArray(training.role) && training.role.includes(currentEmployee.role))))
          );
          
          const matchesBranch = (
            (training.branch && 
             (training.branch === currentEmployee.Store ||
              (Array.isArray(training.branch) && training.branch.includes(currentEmployee.Store)))) ||
            (training.store && 
             (training.store === currentEmployee.Store ||
              (Array.isArray(training.store) && training.store.includes(currentEmployee.Store))))
          );
          
          return isAssignedToEmployee || matchesDesignation || matchesBranch;
        });
      };
      
      const transformedAssignedData = await Promise.all(assignedData.map(t => transformTrainingData(t)));
      const transformedMandatoryData = await Promise.all(mandatoryData.map(t => transformTrainingData(t)));
      
      const filteredAssigned = filterTrainingsByEmployee(transformedAssignedData);
      const filteredMandatory = filterTrainingsByEmployee(transformedMandatoryData);
      
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
      }
      
    } catch (err) {
      console.error('❌ Error fetching trainings:', err);
      setError(`Failed to fetch trainings: ${err.message}`);
      setAssignedTrainings([]);
      setMandatoryTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoComplete = async (video, moduleIndex, videoIndex) => {
    let currentTraining = null;
    if (inlineVideo && inlineVideo.trainingId) {
      currentTraining = inlineVideo.trainingId;
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
      
      // NEW: Sync video completion to LMS assignment website
      try {
        const completionData = {
          employeeId: currentEmployee?.employeeId || currentUserId,
          trainingId: currentTraining,
          moduleId: inlineVideo?.moduleIndex || 'unknown',
          videoId: video._id,
          videoTitle: video.title || 'Untitled Video',
          completedAt: new Date().toISOString(),
          watchDuration: videoWatchedTime[video._id] || 0,
          employeeName: currentEmployee?.name || 'Unknown',
          trainingTitle: training?.title || 'Unknown Training'
        };
        
        console.log('🔄 DETAILED SYNC INFO:', {
          completionData,
          currentEmployee,
          currentTraining,
          inlineVideo: inlineVideo ? {
            id: inlineVideo._id,
            title: inlineVideo.title,
            moduleIndex: inlineVideo.moduleIndex,
            trainingId: inlineVideo.trainingId
          } : null,
          video: {
            id: video._id,
            title: video.title
          },
          watchedTime: videoWatchedTime[video._id]
        });
        
        const syncResult = await syncVideoCompletionToLMS(completionData);
        
        if (syncResult.success) {
          console.log('✅ LMS SYNC SUCCESSFUL:', syncResult);
        } else {
          console.log('⚠️ LMS SYNC FAILED:', {
            error: syncResult.error,
            corsIssue: syncResult.corsIssue,
            result: syncResult
          });
        }
      } catch (syncError) {
        console.error('❌ LMS SYNC ERROR:', syncError);
      }
    }
    
    alert(`🎉 Video completed: "${video.title}"`);
    closeInlineVideo();
  };

  const handleInlineVideo = (video, moduleIndex, videoIndex) => {
    if (!video.videoUri && !video.url) {
      setError('No video URL available.');
      return;
    }
    
    const videoKey = video._id;
    setVideoWatchedTime(prev => ({ ...prev, [videoKey]: 0 }));
    setVideoCompleted(prev => ({ ...prev, [videoKey]: false }));
    
    setInlineVideo({
      ...video,
      moduleIndex,
      videoIndex,
      trainingId: selectedTraining?._id || selectedTraining?.id
    });
  };

  const closeInlineVideo = () => {
    if (inlineVideo && inlineVideo._id && youtubeProgressTimer[inlineVideo._id]) {
      clearInterval(youtubeProgressTimer[inlineVideo._id]);
      setYoutubeProgressTimer(prev => {
        const newTimers = { ...prev };
        delete newTimers[inlineVideo._id];
        return newTimers;
      });
    }
    
    setInlineVideo(null);
  };

  const startYoutubeProgressSimulation = (videoId) => {
    if (youtubeProgressTimer[videoId]) {
      clearInterval(youtubeProgressTimer[videoId]);
    }
    
    let watchedSeconds = 0;
    const requiredWatchTime = 90;
    
    const timer = setInterval(() => {
      watchedSeconds += 1;
      
      setVideoWatchedTime(prev => ({ ...prev, [videoId]: watchedSeconds }));
      
      if (watchedSeconds >= requiredWatchTime) {
        setVideoCompleted(prev => ({ ...prev, [videoId]: true }));
        clearInterval(timer);
        setYoutubeProgressTimer(prev => {
          const newTimers = { ...prev };
          delete newTimers[videoId];
          return newTimers;
        });
      }
    }, 1000);
    
    setYoutubeProgressTimer(prev => ({ ...prev, [videoId]: timer }));
  };

  const canMarkVideoComplete = (video) => {
    if (!video || !video._id) return false;
    
    const videoKey = video._id;
    const completed = videoCompleted[videoKey] || false;
    const startTime = videoStartTime[videoKey];
    const watchedTime = videoWatchedTime[videoKey] || 0;
    
    if (video.videoUri && (video.videoUri.includes('youtube.com') || video.videoUri.includes('youtu.be'))) {
      if (!startTime) return false;
      const totalWatchDuration = Date.now() - startTime;
      const minimumRealTime = 90000;
      const minimumWatchedTime = 90;
      return totalWatchDuration >= minimumRealTime && watchedTime >= minimumWatchedTime;
    }
    
    return completed;
  };

  const processVideoUrl = (url) => {
    if (!url) return null;
    
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
        }
        
        if (videoId && videoId.length === 11) {
          const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&fs=0&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
          return embedUrl;
        }
        
        return url;
      } catch (urlError) {
        return null;
      }
    }
    
    return url;
  };

  const handleVideoEnded = (videoKey) => {
    setVideoCompleted(prev => ({ ...prev, [videoKey]: true }));
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
    setSelectedTraining(training);
    setShowModulesView(true);
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
    return getCurrentTrainings().filter(training => !isTrainingCompleted(training));
  };

  const getCompletedTrainings = () => {
    return getCurrentTrainings().filter(training => isTrainingCompleted(training));
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

  // Check if user is authenticated
  if (!currentEmployee) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <h5 className="text-muted">Authentication Required</h5>
          <p className="text-muted">Please login to view your trainings.</p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="text-muted">Loading trainings...</p>
      </div>
    );
  }

  // Show module details view when training is selected
  if (showModulesView && selectedTraining) {
    return (
      <div className="bg-light min-vh-100">
        {/* Clean Header */}
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
              <h5 className="mb-0 fw-bold">{selectedTraining.title}</h5>
            </div>
          </Container>
        </div>

        {/* Clean Module Cards */}
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
                      {/* Simple Module Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="fw-bold mb-1">Module {moduleIndex + 1}</h6>
                          <p className="text-muted small mb-0">{module.title || `Module ${moduleIndex + 1}`}</p>
                        </div>
                        <Badge bg={moduleProgress === 100 ? 'success' : moduleUnlocked ? 'warning' : 'secondary'}>
                          {moduleProgress === 100 ? 'Completed' : moduleUnlocked ? `${Math.round(moduleProgress)}%` : 'Locked'}
                        </Badge>
                      </div>

                      {/* Module Content */}
                      {moduleUnlocked ? (
                        <>
                          {/* Clean Topic List */}
                          {module.videos && module.videos.length > 0 && (
                            <div className="mb-3">
                              <div className="d-grid gap-2">
                                {module.videos.map((video, videoIndex) => {
                                  const videoUnlocked = isVideoUnlocked(moduleIndex, videoIndex, selectedTraining);
                                  const isVideoCompleted = (() => {
                                    const trainingProgressKey = `training_${selectedTraining._id || selectedTraining.id}`;
                                    const trainingProgress = userProgress[trainingProgressKey] || {};
                                    return trainingProgress.completedVideos?.includes(video._id);
                                  })();

                                  return (
                                    <div key={`topic-${videoIndex}`} className="d-flex justify-content-between align-items-center p-3 border rounded">
                                      <span className="fw-semibold">{video.title || `Topic ${videoIndex + 1}`}</span>
                                      <div>
                                        {isVideoCompleted ? (
                                          <Badge bg="success">
                                            <CheckCircleFill className="me-1" />
                                            Done
                                          </Badge>
                                        ) : videoUnlocked ? (
                                          <Button 
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleInlineVideo(video, moduleIndex, videoIndex)}
                                          >
                                            Watch
                                          </Button>
                                        ) : (
                                          <Badge bg="secondary">
                                            <LockFill className="me-1" />
                                            Locked
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Start Button */}
                          <div className="mt-3">
                            <Button 
                              variant={moduleProgress > 0 ? 'outline-primary' : 'primary'}
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
                              {moduleProgress > 0 ? 'Continue' : 'Start'}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <LockFill size={32} className="text-muted mb-2" />
                          <p className="text-muted mb-0">Complete the previous module first</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>

        {/* Clean Video Player */}
        {inlineVideo && (
          <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
            <div className="bg-white rounded shadow" style={{ width: '90%', maxWidth: '800px' }}>
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h5 className="mb-0">{inlineVideo.title || 'Video'}</h5>
                <Button variant="light" size="sm" onClick={closeInlineVideo}>
                  <X />
                </Button>
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
                        setVideoStartTime(prev => ({ ...prev, [videoKey]: Date.now() }));
                        startYoutubeProgressSimulation(videoKey);
                      }}
                    />
                  ) : (
                    <video
                      controls={false}
                      autoPlay
                      className="w-100 h-100"
                      style={{ objectFit: 'contain' }}
                      onLoadStart={() => {
                        const videoKey = inlineVideo._id;
                        setVideoStartTime(prev => ({ ...prev, [videoKey]: Date.now() }));
                      }}
                      onEnded={() => handleVideoEnded(inlineVideo._id)}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <source src={inlineVideo.videoUri} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )
                )}
              </div>
              
              <div className="p-3 border-top text-center">
                {canMarkVideoComplete(inlineVideo) ? (
                  <Button 
                    variant="success" 
                    onClick={() => handleVideoComplete(inlineVideo, inlineVideo.moduleIndex, inlineVideo.videoIndex)}
                  >
                    <CheckCircleFill className="me-1" />
                    Mark Complete
                  </Button>
                ) : (
                  <div className="text-muted small">
                    Watch the complete video to continue
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Clean Main training list view
  return (
    <div className="bg-light min-vh-100">
      {/* Simple Header */}
      <div className="bg-white shadow-sm">
        <Container fluid>
          <div className="py-3 d-flex justify-content-between align-items-center">
            <h4 className="mb-0 fw-bold">My Trainings</h4>
            <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Container>
      </div>

      {/* Simple Tabs */}
      <div className="bg-white border-bottom">
        <Container fluid>
          <div className="d-flex">
            <Button
              variant="link"
              className={`text-decoration-none flex-fill py-3 border-0 ${
                activeTab === 'assigned' ? 'border-bottom border-primary border-3 fw-bold text-primary' : 'text-muted'
              }`}
              onClick={() => setActiveTab('assigned')}
            >
              Assigned ({assignedTrainings.length})
            </Button>
            <Button
              variant="link"
              className={`text-decoration-none flex-fill py-3 border-0 ${
                activeTab === 'mandatory' ? 'border-bottom border-primary border-3 fw-bold text-primary' : 'text-muted'
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
            {error}
          </Alert>
        )}

        {/* Pending Trainings */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3">Pending ({getPendingTrainings().length})</h5>
          {getPendingTrainings().length === 0 ? (
            <Alert variant="info" className="text-center">
              <p className="mb-0">No pending trainings found.</p>
            </Alert>
          ) : (
            <Row className="g-4">
              {getPendingTrainings().map((training, trainingIndex) => {
                const uniqueTrainingId = training.id || training._id || `training-${trainingIndex}`;
                
                return (
                  <Col key={`training-${uniqueTrainingId}-${trainingIndex}`} xs={12} md={6} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="p-4">
                        <h6 className="fw-bold mb-2">{training.title}</h6>
                        {training.description && (
                          <p className="text-muted small mb-3">{training.description}</p>
                        )}
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <Badge bg={training.type === 'mandatory' ? 'danger' : 'primary'}>
                            {training.type}
                          </Badge>
                          <Button 
                            variant="primary"
                            size="sm"
                            onClick={() => handleStartTraining(training)}
                          >
                            {getTrainingProgress(training) > 0 ? 'Continue' : 'Start'}
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

        {/* Completed Trainings */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3">Completed ({getCompletedTrainings().length})</h5>
          {getCompletedTrainings().length === 0 ? (
            <p className="text-muted text-center">No completed trainings yet</p>
          ) : (
            <Row className="g-4">
              {getCompletedTrainings().map((training, trainingIndex) => {
                const uniqueCompletedTrainingId = training.id || training._id || `completed-training-${trainingIndex}`;
                return (
                  <Col key={`completed-training-${uniqueCompletedTrainingId}-${trainingIndex}`} xs={12} md={6} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm bg-light">
                      <Card.Body className="p-4">
                        <h6 className="fw-bold mb-2">{training.title}</h6>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <Badge bg="success">Completed</Badge>
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
      </Container>
    </div>
  );
};

export default Training;
