// Debug script for video completion issues
// Run this in browser console when the video completion error occurs

console.log('🔧 DEBUG: Video Completion Error Investigation');
console.log('===============================================');

// Function to test video completion with detailed debugging
async function debugVideoCompletion() {
  console.log('🎯 Starting video completion debug...');
  
  try {
    // Check if we have employee data
    const employeeData = localStorage.getItem('employeeData');
    console.log('👤 Employee data exists:', !!employeeData);
    
    if (employeeData) {
      const parsed = JSON.parse(employeeData);
      console.log('👤 Parsed employee data:', parsed);
      console.log('👤 Employee ID:', parsed.employeeId);
    } else {
      console.log('❌ No employee data found - this might be the issue!');
      return;
    }
    
    // Check current page context
    console.log('🌍 Current URL:', window.location.href);
    console.log('🌍 Current pathname:', window.location.pathname);
    
    // Check if Training component is mounted and has state
    const reactFiber = document.querySelector('[data-reactroot]');
    console.log('⚛️ React root found:', !!reactFiber);
    
    // Test the markVideoCompleted function directly
    console.log('🧪 Testing markVideoCompleted function...');
    
    // Import the function (this might not work in console, but try)
    if (window.markVideoCompleted) {
      console.log('✅ markVideoCompleted function is available globally');
    } else {
      console.log('❌ markVideoCompleted function not available globally');
      console.log('💡 You can make it available by adding: window.markVideoCompleted = markVideoCompleted; in the component');
    }
    
    // Test with mock data
    const testUserId = JSON.parse(localStorage.getItem('employeeData') || '{}').employeeId || '68aab7310e17c845daa50352';
    const testTrainingId = '68aaf9559782e8652d5a8ba1';
    const testModuleId = 'test-module';
    const testVideoId = 'test-video';
    
    console.log('🧪 Test parameters:', {
      testUserId,
      testTrainingId,
      testModuleId,
      testVideoId
    });
    
    // If we have access to the function, test it
    if (typeof markVideoCompleted !== 'undefined') {
      console.log('🚀 Calling markVideoCompleted with test data...');
      try {
        const result = await markVideoCompleted(testUserId, testTrainingId, testModuleId, testVideoId);
        console.log('✅ markVideoCompleted succeeded:', result);
      } catch (error) {
        console.log('❌ markVideoCompleted failed:', error);
        console.log('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Debug function failed:', error);
  }
}

// Function to check current training state
function checkTrainingState() {
  console.log('📋 Checking current training state...');
  
  // Check localStorage for training data
  const keys = Object.keys(localStorage);
  const trainingKeys = keys.filter(key => key.includes('training') || key.includes('progress') || key.includes('video'));
  
  console.log('🗄️ Training-related localStorage keys:', trainingKeys);
  trainingKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      console.log(`📦 ${key}:`, value ? JSON.parse(value) : value);
    } catch (e) {
      console.log(`📦 ${key}:`, value);
    }
  });
  
  // Check if we can find any training components in the DOM
  const trainingButtons = document.querySelectorAll('button');
  const videoButtons = Array.from(trainingButtons).filter(btn => 
    btn.textContent.includes('Complete') || 
    btn.textContent.includes('Mark') ||
    btn.textContent.includes('Play')
  );
  
  console.log('🔘 Video/completion buttons found:', videoButtons.length);
  videoButtons.forEach((btn, index) => {
    console.log(`🔘 Button ${index}:`, btn.textContent, btn);
  });
}

// Function to simulate the exact error scenario
function simulateVideoCompletion() {
  console.log('🎭 Simulating video completion scenario...');
  
  // Try to find and click a completion button
  const buttons = document.querySelectorAll('button');
  const completeButton = Array.from(buttons).find(btn => 
    btn.textContent.includes('Mark Complete') || 
    btn.textContent.includes('Complete')
  );
  
  if (completeButton) {
    console.log('🔘 Found completion button:', completeButton.textContent);
    console.log('🔘 Button onclick:', completeButton.onclick);
    console.log('🔘 About to click button...');
    
    // Add event listener to catch errors
    window.addEventListener('error', (e) => {
      console.log('🚨 Window error caught:', e.error);
    });
    
    completeButton.click();
  } else {
    console.log('❌ No completion button found on page');
  }
}

// Instructions
console.log('\n📝 HOW TO USE:');
console.log('1. debugVideoCompletion() - Check overall system state');
console.log('2. checkTrainingState() - Check training data in localStorage');
console.log('3. simulateVideoCompletion() - Try to trigger the error');
console.log('\n🎯 Run these in order to debug the video completion issue');

// Make functions available globally
window.debugVideoCompletion = debugVideoCompletion;
window.checkTrainingState = checkTrainingState;
window.simulateVideoCompletion = simulateVideoCompletion;

console.log('\n🚀 Debug functions loaded! Start with: debugVideoCompletion()');

