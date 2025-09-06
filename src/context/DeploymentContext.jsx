import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDeployments } from '../services/api';

const DeploymentContext = createContext(null);

export const useDeployments = () => {
  const context = useContext(DeploymentContext);
  if (!context) {
    throw new Error('useDeployments must be used within a DeploymentProvider');
  }
  return context;
};

export function DeploymentProvider({ children }) {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshDeployments = async () => {
    try {
      setLoading(true);
      const data = await getDeployments();
      setDeployments(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch deployments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDeployments();
  }, []);

  return (
    <DeploymentContext.Provider value={{ deployments, loading, error, refreshDeployments }}>
      {children}
    </DeploymentContext.Provider>
  );
}