const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['regular', 'mandatory'],
    default: 'regular'
  },
  modules: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    moduleId: String,
    moduleName: String,
    moduleOrder: Number,
    videos: [{
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      videoId: String,
      videoName: String,
      videoUrl: String,
      duration: Number,
      order: Number
    }]
  }],
  duration: {
    type: Number, // in days
    required: true
  },
  assignedUsers: [{
    userId: String,
    userName: String,
    userRole: String,
    userBranch: String,
    assignedDate: {
      type: Date,
      default: Date.now
    },
    deadline: Date,
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    completedDate: Date,
    completedVideos: [{
      moduleId: String,
      videoId: String,
      completedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  targetCriteria: {
    branches: [String],
    roles: [String],
    designations: [String]
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Update the updatedAt field before saving
trainingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Training', trainingSchema);
