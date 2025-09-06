import React from 'react';
import { Link } from 'react-router-dom';
import { useDeployments } from '../context/DeploymentContext';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

function Dashboard() {
  const { deployments, loading, error, refreshDeployments } = useDeployments();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deployments</h1>
        <div className="flex space-x-2">
          <button
            onClick={refreshDeployments}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </button>
          <Link
            to="/new"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Deployment
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading deployments...</p>
        </div>
      ) : deployments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No deployments yet. Create your first one!</p>
          <Link
            to="/new"
            className="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Deployment
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {deployments.map((deployment) => (
            <div key={deployment.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium">{deployment.appName}</h3>
              <p className="text-sm text-gray-500 mt-1">{deployment.status}</p>
              <Link
                to={`/deployments/${deployment.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;