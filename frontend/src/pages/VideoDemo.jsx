import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import VideoPlayer from '../components/VideoPlayer';
import VideoThumbnail from '../components/VideoThumbnail';
import VideoGallery from '../components/VideoGallery';

const VideoDemo = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Sample video data for demonstration
  const sampleVideos = [
    {
      _id: '1',
      title: 'Introduction to React',
      description: 'Learn the basics of React framework and component-based architecture.',
      videoUri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoType: 'youtube',
      moduleName: 'React Basics',
      duration: 1200, // 20 minutes in seconds
      progress: 75,
      completed: false,
      inProgress: true,
      questions: ['What is React?', 'How do components work?'],
      createdAt: '2024-01-15'
    },
    {
      _id: '2',
      title: 'Advanced JavaScript Concepts',
      description: 'Deep dive into closures, promises, and async/await patterns.',
      videoUri: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
      videoType: 'youtube',
      moduleName: 'JavaScript Advanced',
      duration: 1800, // 30 minutes
      progress: 100,
      completed: true,
      inProgress: false,
      questions: ['Explain closures', 'What are promises?'],
      createdAt: '2024-01-10'
    },
    {
      _id: '3',
      title: 'CSS Grid Layout',
      description: 'Master CSS Grid for modern responsive layouts.',
      videoUri: 'https://www.youtube.com/watch?v=9zBsdzdE4sM',
      videoType: 'youtube',
      moduleName: 'CSS Layouts',
      duration: 900, // 15 minutes
      progress: 0,
      completed: false,
      inProgress: false,
      questions: ['What is CSS Grid?', 'How to create responsive layouts?'],
      createdAt: '2024-01-20'
    },
    {
      _id: '4',
      title: 'Node.js Backend Development',
      description: 'Build scalable backend services with Node.js and Express.',
      videoUri: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      videoType: 'youtube',
      moduleName: 'Backend Development',
      duration: 2400, // 40 minutes
      progress: 45,
      completed: false,
      inProgress: true,
      questions: ['What is Node.js?', 'How to create REST APIs?'],
      createdAt: '2024-01-05'
    },
    {
      _id: '5',
      title: 'Database Design Principles',
      description: 'Learn database normalization and design best practices.',
      videoUri: 'https://www.youtube.com/watch?v=ztHopE5WnPA',
      videoType: 'youtube',
      moduleName: 'Database Design',
      duration: 1500, // 25 minutes
      progress: 0,
      completed: false,
      inProgress: false,
      questions: ['What is normalization?', 'How to design relationships?'],
      createdAt: '2024-01-25'
    },
    {
      _id: '6',
      title: 'DevOps Fundamentals',
      description: 'Introduction to CI/CD, Docker, and cloud deployment.',
      videoUri: 'https://www.youtube.com/watch?v=k9Z1El_3-1s',
      videoType: 'youtube',
      moduleName: 'DevOps',
      duration: 2100, // 35 minutes
      progress: 90,
      completed: false,
      inProgress: true,
      questions: ['What is CI/CD?', 'How does Docker work?'],
      createdAt: '2024-01-12'
    }
  ];

  const handleVideoPlay = (video) => {
    setSelectedVideo(video);
    setShowVideoPlayer(true);
  };

  const handleVideoComplete = (video) => {
    console.log('Video completed:', video);
    // ✅ LMS Integration is now ACTIVE in VideoPlayer component!
    // When videos complete, they automatically update your LMS system
    // showing real completion percentages instead of 0.00%
    alert(`🎉 Video "${video.title}" completed!\n✅ Progress automatically saved to LMS system!`);
  };

  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer(false);
    setSelectedVideo(null);
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="mb-4">
            <h1 className="display-5 fw-bold text-center mb-3">🎬 Video Components Demo</h1>
            <p className="text-center text-muted lead">
              Explore the comprehensive video player system for the LMS application
            </p>
          </div>

          {/* Component Overview */}
          <Row className="mb-5">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h4 className="fw-bold mb-3">🚀 Available Components</h4>
                  <Row>
                    <Col md={4}>
                      <div className="text-center p-3">
                        <div className="display-6 mb-2">▶️</div>
                        <h6>VideoPlayer</h6>
                        <p className="small text-muted">
                          Full-featured video player with support for YouTube, direct files, and external links
                        </p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center p-3">
                        <div className="display-6 mb-2">🖼️</div>
                        <h6>VideoThumbnail</h6>
                        <p className="small text-muted">
                          Interactive video preview cards with play buttons and progress indicators
                        </p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center p-3">
                        <div className="display-6 mb-2">📚</div>
                        <h6>VideoGallery</h6>
                        <p className="small text-muted">
                          Advanced video grid with search, filtering, and sorting capabilities
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Video Player Demo */}
          <Row className="mb-5">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">🎥 Video Player Demo</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <p className="text-muted mb-3">
                    Click on any video below to test the video player functionality.
                  </p>
                  
                  <Row className="g-3">
                    {sampleVideos.slice(0, 3).map((video) => (
                      <Col key={video._id} md={4}>
                        <VideoThumbnail
                          video={video}
                          onPlay={handleVideoPlay}
                          onComplete={handleVideoComplete}
                          size="medium"
                        />
                      </Col>
                    ))}
                  </Row>
                  
                  <div className="text-center mt-4">
                    <Button 
                      variant="outline-primary" 
                      size="lg"
                      onClick={() => handleVideoPlay(sampleVideos[0])}
                    >
                      🎬 Try Video Player
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Video Gallery Demo */}
          <Row className="mb-5">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">📚 Video Gallery Demo</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <p className="text-muted mb-3">
                    Experience the full video gallery with search, filters, and different view modes.
                  </p>
                  
                  <VideoGallery
                    videos={sampleVideos}
                    onVideoPlay={handleVideoPlay}
                    onVideoComplete={handleVideoComplete}
                    title="Sample Training Videos"
                    showFilters={true}
                    showSearch={true}
                    layout="grid"
                    size="medium"
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Features Showcase */}
          <Row className="mb-5">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">✨ Features & Capabilities</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row>
                    <Col md={6}>
                      <h6 className="fw-bold mb-3">🎯 Video Support</h6>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          YouTube videos (auto-embed)
                        </li>
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Direct video files (MP4, WebM, OGG)
                        </li>
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          External video links
                        </li>
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Vimeo and Dailymotion
                        </li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h6 className="fw-bold mb-3">🎮 Player Features</h6>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Custom video controls
                        </li>
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Progress tracking
                        </li>
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Volume control
                        </li>
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Fullscreen support
                        </li>
                      </ul>
                    </Col>
                  </Row>
                  
                  <Row className="mt-4">
                    <Col md={6}>
                      <h6 className="fw-bold mb-3">🔍 Gallery Features</h6>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Search and filtering
                        </li>
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Multiple view modes
                        </li>
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Sorting options
                        </li>
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Responsive design
                        </li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h6 className="fw-bold mb-3">📱 User Experience</h6>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Progress indicators
                        </li>
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Status badges
                        </li>
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Thumbnail generation
                        </li>
                        <li className="mb-2">
                          <Badge bg="success" className="me-2">✓</Badge>
                          Accessibility support
                        </li>
                      </ul>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Integration Info */}
          <Row>
            <Col>
              <Alert variant="success" className="border-0">
                <h6 className="fw-bold">✅ LMS Integration ACTIVE</h6>
                <p className="mb-2">
                  <strong>🎉 Great news!</strong> The video player is now connected to your LMS system. 
                  When you complete videos (watch 90% or reach the end), the progress is automatically 
                  saved to your LMS training assignment site.
                </p>
                <p className="mb-2">
                  <strong>What happens when you complete a video:</strong>
                </p>
                <ul className="mb-2">
                  <li>✅ Video marked as completed in LMS database</li>
                  <li>✅ Training completion percentage updated (no more 0.00%!)</li>
                  <li>✅ Training status changed (Pending → In Progress → Completed)</li>
                  <li>✅ Real-time sync between training app and LMS site</li>
                </ul>
                <p className="mb-0">
                  <strong>Test it now:</strong> Play any video above, watch it to 90% completion, 
                  and then check your LMS training assignment site to see the updated progress!
                </p>
              </Alert>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Video Player Modal */}
      <VideoPlayer
        show={showVideoPlayer}
        onHide={handleCloseVideoPlayer}
        video={selectedVideo}
        onVideoComplete={handleVideoComplete}
      />
    </Container>
  );
};

export default VideoDemo;
