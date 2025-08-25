import React, { useState, useEffect } from 'react';
import { getUserTrainingDetails } from '../../api/trainingApi';
import ModuleView from './ModuleView';

const TrainingDashboard = ({ trainingId, userId }) => {
  const [training, setTraining] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrainingDetails();
  }, [trainingId, userId]);

  const fetchTrainingDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserTrainingDetails(userId, trainingId);
      
      if (response.status === 'success') {
        setTraining(response.data);
        // Find the first incomplete module or start from the beginning
        const firstIncompleteIndex = response.data.modules.findIndex(
          module => module.status !== 'completed'
        );
        setCurrentModuleIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
      }
    } catch (err) {
      setError('Failed to load training details');
      console.error('Error fetching training details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleComplete = (moduleId) => {
    // Refresh training details to get updated progress
    fetchTrainingDetails();
    
    // Move to next module if available
    if (currentModuleIndex < training.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  const selectModule = (index) => {
    setCurrentModuleIndex(index);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg">{error}</div>
        <button
          onClick={fetchTrainingDetails}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Training not found.</p>
      </div>
    );
  }

  const currentModule = training.modules[currentModuleIndex];
  const completedModules = training.modules.filter(module => module.status === 'completed').length;
  const overallProgress = training.modules.length > 0 ? (completedModules / training.modules.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{training.title}</h1>
              <p className="text-gray-600 mt-1">{training.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Overall Progress</div>
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(overallProgress)}%
              </div>
              <div className="text-sm text-gray-500">
                {completedModules} of {training.modules.length} modules completed
              </div>
            </div>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-6">
              <h3 className="font-semibold text-lg mb-4">Training Modules</h3>
              <div className="space-y-2">
                {training.modules.map((module, index) => (
                  <div
                    key={module.moduleId}
                    onClick={() => selectModule(index)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      index === currentModuleIndex
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`font-medium ${
                          index === currentModuleIndex ? 'text-white' : 'text-gray-800'
                        }`}>
                          Module {index + 1}
                        </p>
                        <p className={`text-sm ${
                          index === currentModuleIndex ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {module.moduleName}
                        </p>
                        <p className={`text-xs ${
                          index === currentModuleIndex ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {Math.round(module.completionPercentage)}% complete
                        </p>
                      </div>
                      <div className="ml-2">
                        {module.status === 'completed' ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : module.status === 'in_progress' ? (
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        ) : (
                          <div className={`w-6 h-6 rounded-full border-2 ${
                            index === currentModuleIndex
                              ? 'border-white'
                              : 'border-gray-300'
                          }`} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Training Info */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="capitalize font-medium">{training.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`capitalize font-medium ${
                      training.status === 'completed' ? 'text-green-600' : 
                      training.status === 'in_progress' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {training.status.replace('_', ' ')}
                    </span>
                  </div>
                  {training.deadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deadline:</span>
                      <span className="font-medium">
                        {new Date(training.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {training.completedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium text-green-600">
                        {new Date(training.completedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {currentModule && (
              <ModuleView
                module={currentModule}
                trainingId={trainingId}
                userId={userId}
                onModuleComplete={handleModuleComplete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDashboard;

