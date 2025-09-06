// Simple in-memory database for deployments
export const deployments = [];

export function getDeployments() {
  return deployments;
}

export function getDeploymentById(id) {
  return deployments.find(deployment => deployment.id === id);
}

export function updateDeployment(id, updates) {
  const deployment = getDeploymentById(id);
  
  if (deployment) {
    Object.assign(deployment, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return deployment;
  }
  
  return null;
}

export function deleteDeployment(id) {
  const index = deployments.findIndex(deployment => deployment.id === id);
  
  if (index !== -1) {
    const deployment = deployments[index];
    deployments.splice(index, 1);
    return deployment;
  }
  
  return null;
}