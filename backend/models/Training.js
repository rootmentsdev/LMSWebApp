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
    moduleId: String,
    moduleName: String,
    moduleOrder: Number
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
    // New: Module progress tracking
    moduleProgress: [{
      moduleId: String,
      moduleName: String,
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
      videos: [{
        videoId: String,
        videoTitle: String,
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
        watchTime: Number, // in seconds
        totalDuration: Number, // in seconds
        lastUpdated: {
          type: Date,
          default: Date.now
        }
      }],
      lastUpdated: {
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
