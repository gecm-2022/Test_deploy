import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock, GitBranch, ExternalLink } from 'lucide-react';

function DeploymentCard({ deployment }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'cloning':
      case 'building':
      case 'configuring':
      case 'deploying':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
      case 'cloning':
      case 'building':
      case 'configuring':
      case 'deploying':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 truncate">{deployment.appName}</h3>
          <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deployment.status)}`}
          >
            {getStatusIcon(deployment.status)}
            <span className="ml-1">{deployment.status}</span>
          </span>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <GitBranch className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
          <p className="truncate">{deployment.repoUrl}</p>
        </div>
        
        {deployment.status === 'deployed' && (
          <div className="mt-2">
            <a 
              href={deployment.publicUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <span className="mr-1">{deployment.publicUrl}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-right">
        <Link 
          to={`/deployments/${deployment.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View details
        </Link>
      </div>
    </div>
  );
}

export default DeploymentCard;