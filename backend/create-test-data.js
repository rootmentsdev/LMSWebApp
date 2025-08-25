const mongoose = require('mongoose');
const { TrainingLMS, ModuleLMS, TrainingProgressLMS } = require('./models/TrainingLMS');

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/lms_database');
    console.log('✅ Connected to MongoDB');

    // Create test module with videos
    const testModule = new ModuleLMS({
      moduleName: 'Safety Training Module',
      description: 'Comprehensive safety training for employees',
      videos: [
        {
          title: 'Introduction to Workplace Safety',
          videoUri: 'https://example.com/safety-intro.mp4',
          questions: [
            {
              questionText: 'What is the most important safety rule?',
              options: ['Wear safety gear', 'Run in hallways', 'Ignore warnings'],
              correctAnswer: 'Wear safety gear'
            }
          ]
        },
        {
          title: 'Emergency Procedures',
          videoUri: 'https://example.com/emergency.mp4',
          questions: [
            {
              questionText: 'What should you do in case of fire?',
              options: ['Call emergency services', 'Panic', 'Hide'],
              correctAnswer: 'Call emergency services'
            }
          ]
        }
      ]
    });

    await testModule.save();
    console.log('✅ Created test module:', testModule._id);

    // Create test training
    const testTraining = new TrainingLMS({
      trainingName: 'Complete Safety Training Program',
      description: 'Full safety training program for all employees',
      modules: [testModule._id],
      numberOfModules: 1,
      deadline: 30, // 30 days
      Trainingtype: 'Mandatory',
      Assignedfor: ['Emp257', 'Emp001', 'Emp002'], // Including the test user
      createdBy: 'admin',
      createdDate: new Date(),
      editedDate: new Date()
    });

    await testTraining.save();
    console.log('✅ Created test training:', testTraining._id);

    // Create initial progress record for Emp257
    const progress = new TrainingProgressLMS({
      userId: 'Emp257', // String user ID to match the LMS controller expectations
      trainingName: testTraining.trainingName,
      trainingId: testTraining._id,
      deadline: testTraining.deadline,
      modules: [],
      overallProgress: 0,
      status: 'Pending'
    });

    await progress.save();
    console.log('✅ Created progress record for Emp257');

    console.log('\n🎉 Test data created successfully!');
    console.log('📊 Test Training ID:', testTraining._id);
    console.log('📖 Test Module ID:', testModule._id);
    console.log('👤 Test User: Emp257');

    // Show what we created
    console.log('\n📋 Created Data Summary:');
    console.log('Training:', {
      id: testTraining._id,
      name: testTraining.trainingName,
      type: testTraining.Trainingtype,
      assignedTo: testTraining.Assignedfor,
      modules: testTraining.modules.length
    });

    console.log('Module:', {
      id: testModule._id,
      name: testModule.moduleName,
      videos: testModule.videos.length
    });

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔄 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createTestData();
}

module.exports = { createTestData };
