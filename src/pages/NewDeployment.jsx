import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeployment } from '../services/api';
import { AlertCircle } from 'lucide-react';

function NewDeployment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ repoUrl: '', appName: '' ,type:'frontend'});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const deployment = await createDeployment(formData);
      navigate(`/deployments/${deployment.id}`);
    } catch (err) {
      setError('Failed to create deployment');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Deployment</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700">
              Repository URL
            </label>
            <input
              type="text"
              id="repoUrl"
              value={formData.repoUrl}
              onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://github.com/username/repo"
              required
            />
          </div>

          <div>
            <label htmlFor="appName" className="block text-sm font-medium text-gray-700">
              Application Name
            </label>
            <input
              type="text"
              id="appName"
              value={formData.appName}
              onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="my-app"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating...' : 'Create Deployment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewDeployment;