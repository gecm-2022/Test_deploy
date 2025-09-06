import express from 'express';
import { handleDeployment } from './deployment.js';
import { getDeployments, getDeploymentById, deleteDeployment } from './db.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = express.Router();

// Get all deployments
router.get('/deployments', (req, res) => {
  res.json(getDeployments());
});

// Get a specific deployment
router.get('/deployments/:id', (req, res) => {
  const deployment = getDeploymentById(req.params.id);
  
  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }
  
  res.json(deployment);
});

// Create a new deployment
router.post('/deployments', async (req, res) => {
  try {
    const { repoUrl, appName } = req.body;
    
    // Validate input
    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }
    
    if (!appName) {
      return res.status(400).json({ error: 'Application name is required' });
    }
    
    // Create deployment
    const deployment = await handleDeployment(repoUrl, appName);
    
    res.status(201).json(deployment);
  } catch (error) {
    console.error('Error creating deployment:', error);
    res.status(500).json({ error: 'Failed to create deployment' });
  }
});

// Delete a deployment
router.delete('/deployments/:id', async (req, res) => {
  try {
    const deployment = getDeploymentById(req.params.id);
    
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    // Stop and remove Docker container
    const containerName = `app-${deployment.id.slice(0, 8)}`;
    try {
      await execAsync(`docker stop ${containerName}`);
      await execAsync(`docker rm ${containerName}`);
    } catch (err) {
      console.error(`Error stopping container: ${err.message}`);
      // Continue with deletion even if container cleanup fails
    }
    
    // Remove deployment from database
    deleteDeployment(req.params.id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting deployment:', error);
    res.status(500).json({ error: 'Failed to delete deployment' });
  }
});

export const deploymentRoutes = router;