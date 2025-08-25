import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

const ModuleView = ({ module, trainingId, userId, onModuleComplete }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [moduleProgress, setModuleProgress] = useState(0);
  const [completedVideos, setCompletedVideos] = useState(new Set());

  useEffect(() => {
    // Initialize completed videos from module data
    const completed = new Set();
    module.videos.forEach(video => {
      if (video.completed) {
        completed.add(video.videoId);
      }
    });
    setCompletedVideos(completed);
    
    // Calculate initial progress
    const progress = (completed.size / module.videos.length) * 100;
    setModuleProgress(progress);
  }, [module]);

  const handleVideoProgress = (progressData) => {
    // Update local progress state
    setModuleProgress(progressData.moduleProgress);
  };

  const handleVideoComplete = (videoId) => {
    setCompletedVideos(prev => {
      const newSet = new Set(prev);
      newSet.add(videoId);
      
      const newProgress = (newSet.size / module.videos.length) * 100;
      setModuleProgress(newProgress);
      
      // Check if module is complete
      if (newProgress === 100) {
        onModuleComplete && onModuleComplete(module.moduleId);
      }
      
      return newSet;
    });
  };

  const goToNextVideo = () => {
    if (currentVideoIndex < module.videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const selectVideo = (index) => {
    setCurrentVideoIndex(index);
  };

  const currentVideo = module.videos[currentVideoIndex];

  if (!currentVideo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No videos available in this module.</p>
      </div>
    );
  }

  return (
    <div className="module-view">
      {/* Module Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {module.moduleName}
            </h2>
            <p className="text-gray-600">
              Video {currentVideoIndex + 1} of {module.videos.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Module Progress</div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(moduleProgress)}%
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${moduleProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-3">
          <VideoPlayer
            video={currentVideo}
            moduleId={module.moduleId}
            trainingId={trainingId}
            userId={userId}
            onProgressUpdate={handleVideoProgress}
            onVideoComplete={handleVideoComplete}
          />
          
          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-4 p-4 bg-white rounded-lg shadow">
            <button
              onClick={goToPreviousVideo}
              disabled={currentVideoIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Previous</span>
            </button>
            
            <div className="text-center">
              <span className="text-sm text-gray-600">
                {currentVideoIndex + 1} / {module.videos.length}
              </span>
            </div>
            
            <button
              onClick={goToNextVideo}
              disabled={currentVideoIndex === module.videos.length - 1}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              <span>Next</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Video Playlist Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-lg mb-4">Videos in this Module</h3>
            <div className="space-y-2">
              {module.videos.map((video, index) => (
                <div
                  key={video.videoId}
                  onClick={() => selectVideo(index)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    index === currentVideoIndex
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        index === currentVideoIndex ? 'text-white' : 'text-gray-800'
                      }`}>
                        {video.videoTitle}
                      </p>
                      <p className={`text-xs ${
                        index === currentVideoIndex ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {video.watchTime && video.videoDuration
                          ? `${Math.round((video.watchTime / video.videoDuration) * 100)}% watched`
                          : 'Not started'
                        }
                      </p>
                    </div>
                    <div className="ml-2">
                      {completedVideos.has(video.videoId) ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          index === currentVideoIndex
                            ? 'border-white'
                            : 'border-gray-300'
                        }`} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleView;

