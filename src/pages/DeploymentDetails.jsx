import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeployment, deleteDeployment } from '../services/api';
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react';

function DeploymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deployment, setDeployment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeployment = async () => {
      try {
        const data = await getDeployment(id);
        setDeployment(data);
      } catch (err) {
        setError('Failed to fetch deployment');
      } finally {
        setLoading(false);
      }
    };

    fetchDeployment();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this deployment?')) {
      try {
        await deleteDeployment(id);
        navigate('/');
      } catch (err) {
        setError('Failed to delete deployment');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading deployment details...</p>
      </div>
    );
  }

  if (error || !deployment) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-800">{error || 'Deployment not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{deployment.appName}</h1>
        
        <div className="grid gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Status</h2>
            <p className="mt-1 text-sm text-gray-900">{deployment.status}</p>
          </div>
          
          <div>
            <h2 className="text-sm font-medium text-gray-500">Repository URL</h2>
            <p className="mt-1 text-sm text-gray-900">{deployment.repoUrl}</p>
          </div>
          
          <div>
            <h2 className="text-sm font-medium text-gray-500">Created At</h2>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(deployment.createdAt).toLocaleString()}
            </p>
          </div>

          {deployment.logs && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">Deployment Logs</h2>
              <pre className="mt-1 p-4 bg-gray-50 rounded-md text-sm font-mono whitespace-pre-wrap">
                {deployment.logs.join('\n')}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeploymentDetails;