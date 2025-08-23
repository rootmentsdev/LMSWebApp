import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import VideoPlayer from '../components/VideoPlayer';
import ProgressTracker from '../components/ProgressTracker';

const VideoTest = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [userProgress, setUserProgress] = useState({
    completedVideos: [],
    completedModules: []
  });

  // Sample data for testing
  const sampleModules = [
    {
      _id: 'module1',
      title: 'Module 1: Introduction',
      videos: [
        {
          _id: 'video1',
          title: 'Welcome to the Course',
          videoUri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: 180
        },
        {
          _id: 'video2',
          title: 'Getting Started',
          videoUri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: 240
        }
      ]
    },
    {
      _id: 'module2',
      title: 'Module 2: Advanced Topics',
      videos: [
        {
          _id: 'video3',
          title: 'Advanced Concepts',
          videoUri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: 300
        }
      ]
    }
  ];

  const handleVideoComplete = (video, moduleIndex, videoIndex) => {
    console.log('🎯 Video completed:', video);
    
    const newProgress = {
      ...userProgress,
      completedVideos: [...userProgress.completedVideos, video._id]
    };
    
    setUserProgress(newProgress);
    setShowVideoPlayer(false);
    
    alert(`🎉 Congratulations! You've completed "${video.title}"`);
  };

  const handleModuleComplete = (moduleId, moduleIndex) => {
    console.log('🏆 Module completed:', moduleId);
    
    const newProgress = {
      ...userProgress,
      completedModules: [...userProgress.completedModules, moduleId]
    };
    
    setUserProgress(newProgress);
    alert(`🎊 Module completed! You can now access the next module.`);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">🎬 Video System Test Page</h2>
      
      <Alert variant="info" className="mb-4">
        <strong>Test Instructions:</strong>
        <ul className="mb-0 mt-2">
          <li>Click on any unlocked video to test the video player</li>
          <li>Complete videos to unlock the next ones</li>
          <li>Complete all videos in a module to unlock the next module</li>
          <li>Watch the progress tracker update in real-time</li>
        </ul>
      </Alert>

      <Row>
        <Col lg={8}>
          {/* Progress Tracker */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">📊 Learning Progress</h5>
            </Card.Header>
            <Card.Body>
              <ProgressTracker
                modules={sampleModules}
                userProgress={userProgress}
                onVideoComplete={handleVideoComplete}
                onModuleComplete={handleModuleComplete}
                currentUserId="test-user"
              />
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          {/* Quick Actions */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">🔧 Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <Button 
                variant="outline-primary" 
                className="w-100 mb-2"
                onClick={() => {
                  setUserProgress({
                    completedVideos: [],
                    completedModules: []
                  });
                }}
              >
                Reset Progress
              </Button>
              
              <Button 
                variant="outline-success" 
                className="w-100 mb-2"
                onClick={() => {
                  setUserProgress({
                    completedVideos: ['video1', 'video2'],
                    completedModules: ['module1']
                  });
                }}
              >
                Complete Module 1
              </Button>
              
              <Button 
                variant="outline-warning" 
                className="w-100"
                onClick={() => {
                  setUserProgress({
                    completedVideos: ['video1', 'video2', 'video3'],
                    completedModules: ['module1', 'module2']
                  });
                }}
              >
                Complete All
              </Button>
            </Card.Body>
          </Card>

          {/* Current Progress */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">📈 Current Status</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Videos Completed:</strong> {userProgress.completedVideos.length}
              </div>
              <div className="mb-2">
                <strong>Modules Completed:</strong> {userProgress.completedModules.length}
              </div>
              <div>
                <strong>Overall Progress:</strong> {
                  Math.round((userProgress.completedVideos.length / 
                    sampleModules.reduce((total, m) => total + m.videos.length, 0)) * 100)
                }%
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Video Player Modal */}
      <VideoPlayer
        show={showVideoPlayer}
        onHide={() => setShowVideoPlayer(false)}
        video={selectedVideo}
        onVideoComplete={handleVideoComplete}
      />
    </Container>
  );
};

export default VideoTest;
