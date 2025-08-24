// Script to create a test training record for bridge testing
const mongoose = require('mongoose');
const Training = require('./models/Training');

// Connect to MongoDB
const connectDB = require('./config/database');

async function createTestTraining() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Create test training data
    const testTraining = new Training({
      title: 'Test Training for Bridge',
      description: 'This is a test training to verify the bridge system',
      type: 'regular',
      duration: 7,
      assignedUsers: [{
        userId: 'test-user-123',
        userName: 'Test User',
        userRole: 'employee',
        userBranch: 'test-branch',
        progress: 0,
        status: 'pending'
      }],
      createdBy: 'test-admin',
      modules: [{
        moduleId: '507f1f77bcf86cd799439012',
        moduleName: 'Test Module',
        moduleOrder: 1
      }]
    });

    // Save the training
    const savedTraining = await testTraining.save();
    console.log('✅ Test training created successfully!');
    console.log('📊 Training ID:', savedTraining._id);
    console.log('👤 User ID:', savedTraining.assignedUsers[0].userId);

    // Update test-bridge.js with the real IDs
    console.log('\n📝 Update your test-bridge.js with these IDs:');
    console.log(`trainingId: '${savedTraining._id}'`);
    console.log(`userId: '${savedTraining.assignedUsers[0].userId}'`);

    // Disconnect from database
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error creating test training:', error);
    process.exit(1);
  }
}

// Run the function
if (require.main === module) {
  createTestTraining();
}

module.exports = { createTestTraining };
