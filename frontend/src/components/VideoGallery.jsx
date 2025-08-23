import React, { useState, useMemo } from 'react';
import { 
  Row, 
  Col, 
  Form, 
  InputGroup, 
  Button, 
  Badge,
  Dropdown,
  ButtonGroup,
  Alert,
  Spinner
} from 'react-bootstrap';
import { 
  Search, 
  Filter, 
  Grid3x3Gap, 
  List,
  SortDown,
  PlayFill
} from 'react-bootstrap-icons';
import VideoThumbnail from './VideoThumbnail';

const VideoGallery = ({ 
  videos = [], 
  onVideoPlay, 
  onVideoComplete,
  loading = false,
  error = null,
  title = 'Video Gallery',
  showFilters = true,
  showSearch = true,
  layout = 'grid', // grid, list
  size = 'medium' // small, medium, large
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [sortBy, setSortBy] = useState('title'); // title, duration, date, progress
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [viewMode, setViewMode] = useState(layout);

  // Get unique video types and modules for filtering
  const videoTypes = useMemo(() => {
    const types = [...new Set(videos.map(video => video.videoType).filter(Boolean))];
    return ['all', ...types];
  }, [videos]);

  const modules = useMemo(() => {
    const moduleNames = [...new Set(videos.map(video => video.moduleName).filter(Boolean))];
    return ['all', ...moduleNames];
  }, [videos]);

  // Filter and sort videos
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videos.filter(video => {
      const matchesSearch = !searchTerm || 
        video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'all' || video.videoType === selectedType;
      const matchesModule = selectedModule === 'all' || video.moduleName === selectedModule;
      
      return matchesSearch && matchesType && matchesModule;
    });

    // Sort videos
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case 'date':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'progress':
          aValue = a.progress || 0;
          bValue = b.progress || 0;
          break;
        default:
          aValue = a.title || '';
          bValue = b.title || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [videos, searchTerm, selectedType, selectedModule, sortBy, sortOrder]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const handleModuleChange = (module) => {
    setSelectedModule(module);
  };

  // Handle sort changes
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedModule('all');
    setSortBy('title');
    setSortOrder('asc');
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortDown /> : <SortDown className="rotate-180" />;
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="text-muted">Loading videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <h6>Error Loading Videos</h6>
        <p className="mb-0">{error}</p>
      </Alert>
    );
  }

  return (
    <div className="video-gallery">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">{title}</h4>
          <p className="text-muted mb-0">
            {filteredAndSortedVideos.length} of {videos.length} videos
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <ButtonGroup size="sm">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
            onClick={() => handleViewModeChange('grid')}
          >
            <Grid3x3Gap />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
            onClick={() => handleViewModeChange('list')}
          >
            <List />
          </Button>
        </ButtonGroup>
      </div>

      {/* Filters and Search */}
      {(showFilters || showSearch) && (
        <div className="mb-4 p-3 bg-light rounded">
          <Row className="g-3">
            {/* Search */}
            {showSearch && (
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search videos..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </InputGroup>
              </Col>
            )}
            
            {/* Type Filter */}
            {showFilters && (
              <Col md={3}>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm" className="w-100">
                    <Filter className="me-2" />
                    Type: {selectedType === 'all' ? 'All Types' : selectedType}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {videoTypes.map(type => (
                      <Dropdown.Item
                        key={type}
                        active={selectedType === type}
                        onClick={() => handleTypeChange(type)}
                      >
                        {type === 'all' ? 'All Types' : type}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            )}
            
            {/* Module Filter */}
            {showFilters && (
              <Col md={3}>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm" className="w-100">
                    <Filter className="me-2" />
                    Module: {selectedModule === 'all' ? 'All Modules' : selectedModule}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {modules.map(module => (
                      <Dropdown.Item
                        key={module}
                        active={selectedModule === module}
                        onClick={() => handleModuleChange(module)}
                      >
                        {module === 'all' ? 'All Modules' : module}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            )}
          </Row>
          
          {/* Sort Options */}
          {showFilters && (
            <div className="mt-3 pt-3 border-top">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2 align-items-center">
                  <small className="text-muted">Sort by:</small>
                  <ButtonGroup size="sm">
                    {[
                      { key: 'title', label: 'Title' },
                      { key: 'duration', label: 'Duration' },
                      { key: 'date', label: 'Date' },
                      { key: 'progress', label: 'Progress' }
                    ].map(({ key, label }) => (
                      <Button
                        key={key}
                        variant={sortBy === key ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => handleSortChange(key)}
                      >
                        {label} {getSortIcon(key)}
                      </Button>
                    ))}
                  </ButtonGroup>
                </div>
                
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Grid/List */}
      {filteredAndSortedVideos.length === 0 ? (
        <Alert variant="info">
          <div className="text-center p-4">
            <div className="display-6 mb-3">🎬</div>
            <h6>No Videos Found</h6>
            <p className="mb-2">
              {searchTerm || selectedType !== 'all' || selectedModule !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'No videos are available at the moment.'
              }
            </p>
            {(searchTerm || selectedType !== 'all' || selectedModule !== 'all') && (
              <Button variant="outline-primary" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        </Alert>
      ) : (
        <Row className="g-4">
          {filteredAndSortedVideos.map((video, index) => (
            <Col
              key={video._id || index}
              xs={12}
              sm={viewMode === 'list' ? 12 : 6}
              md={viewMode === 'list' ? 12 : 4}
              lg={viewMode === 'list' ? 12 : 3}
              xl={viewMode === 'list' ? 12 : 2}
            >
              <VideoThumbnail
                video={video}
                onPlay={onVideoPlay}
                onComplete={onVideoComplete}
                size={size}
                showProgress={true}
                showStatus={true}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Footer Stats */}
      {filteredAndSortedVideos.length > 0 && (
        <div className="mt-4 p-3 bg-light rounded text-center">
          <div className="row text-muted small">
            <div className="col-md-3">
              <strong>Total Videos:</strong> {videos.length}
            </div>
            <div className="col-md-3">
              <strong>Showing:</strong> {filteredAndSortedVideos.length}
            </div>
            <div className="col-md-3">
              <strong>Completed:</strong> {videos.filter(v => v.completed).length}
            </div>
            <div className="col-md-3">
              <strong>In Progress:</strong> {videos.filter(v => v.inProgress).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
