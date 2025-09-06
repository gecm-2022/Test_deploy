import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeployment } from '../services/api';
import { GitBranch, Server, AlertCircle } from 'lucide-react';

function DeploymentForm() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [appName, setAppName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!repoUrl.trim()) {
      setError('Repository URL is required');
      return false;
    }

    if (!appName.trim()) {
      setError('Application name is required');
      return false;
    }

    if (!repoUrl.includes('github.com/')) {
      setError('Invalid GitHub repository URL');
      return false;
    }

    if (!/^[a-zA-Z0-9-]+$/.test(appName)) {
      setError('Application name must contain only letters, numbers, and hyphens');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const newDeployment = await createDeployment({ repoUrl, appName });
      navigate(`/deployments/${newDeployment.id}`);
    } catch (err) {
      console.error('Deployment error:', err);
      setError('Failed to create deployment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Deploy a New Application</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700">
              GitHub Repository URL
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GitBranch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://github.com/username/repo"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter the full URL to the GitHub repository you want to deploy.
            </p>
          </div>
          
          <div>
            <label htmlFor="appName" className="block text-sm font-medium text-gray-700">
              Application Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Server className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="my-app"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Choose a unique name for your application (letters, numbers, and hyphens only).
            </p>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Deploying...' : 'Deploy Application'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default DeploymentForm;