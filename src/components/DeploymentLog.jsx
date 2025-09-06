import React from 'react';
import { Terminal } from 'lucide-react';

function DeploymentLog({ logs }) {
  return (
    <div className="bg-gray-900 rounded-md overflow-hidden">
      <div className="bg-gray-800 py-2 px-4 flex items-center">
        <Terminal className="h-4 w-4 text-gray-400 mr-2" />
        <h3 className="text-sm font-medium text-gray-200">Deployment Logs</h3>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm">No logs available yet.</p>
        ) : (
          <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
            {logs.map((log, index) => (
              <div key={index} className="py-0.5">
                {log}
              </div>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
}

export default DeploymentLog;