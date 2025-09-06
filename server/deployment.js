import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { deployments, updateDeployment } from './db.js';
import { DeploymentStatus } from './types.js';

const execAsync = promisify(exec);

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const deployedAppsDir = path.join(__dirname, '../deployed-apps');

export async function handleDeployment(repoUrl, appName) {
  const id = uuidv4();
  const timestamp = Date.now();
  const deploymentPath = `${appName}_${timestamp}`;
  const targetDir = path.join(deployedAppsDir, deploymentPath);
  
  // Create initial deployment record
  const deployment = {
    id,
    appName,
    repoUrl,
    path: `/${deploymentPath}/`,
    status: DeploymentStatus.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSSR: false, // Will be determined during deployment
    publicUrl: `http://localhost:8080/${deploymentPath}/`,
    logs: [`[${new Date().toISOString()}] Deployment initiated`]
  };
  
  deployments.push(deployment);
  
  // Start the deployment process asynchronously
  processDeployment(deployment, targetDir).catch(error => {
    console.error(`Deployment failed for ${appName}:`, error);
    updateDeployment(id, {
      status: DeploymentStatus.FAILED,
      logs: [...deployment.logs, `[${new Date().toISOString()}] Deployment failed: ${error.message}`]
    });
  });
  
  return deployment;
}

async function processDeployment(deployment, targetDir) {
  const { id, repoUrl } = deployment;
  const git = simpleGit();
  
  try {
    // Update status to CLONING
    updateDeployment(id, {
      status: DeploymentStatus.CLONING,
      logs: [...deployment.logs, `[${new Date().toISOString()}] Cloning repository: ${repoUrl}`]
    });
    
    // Clone the repository
    await git.clone(repoUrl, targetDir);
    
    // Update status to BUILDING
    updateDeployment(id, {
      status: DeploymentStatus.BUILDING,
      logs: [...deployment.logs, `[${new Date().toISOString()}] Repository cloned successfully`]
    });
    
    // Check if it's an SSR application
    const isSSR = await detectSSRApp(targetDir);
    
    // Update package.json with correct homepage
    await updatePackageJson(targetDir, deployment.path);
    
    // Install dependencies
    await installDependencies(targetDir, deployment);
    
    // Build the application
    await buildApplication(targetDir, deployment);
    
    // Configure Docker and Nginx
    await configureDeployment(targetDir, deployment, isSSR);
    
    // Update final status
    updateDeployment(id, {
      status: DeploymentStatus.DEPLOYED,
      isSSR,
      logs: [...deployment.logs, `[${new Date().toISOString()}] Deployment completed successfully`]
    });
    
  } catch (error) {
    throw error;
  }
}

async function detectSSRApp(targetDir) {
  // Check for common SSR app indicators
  const hasNextConfig = fs.existsSync(path.join(targetDir, 'next.config.js'));
  const hasServerJs = fs.existsSync(path.join(targetDir, 'server.js'));
  
  return hasNextConfig || hasServerJs;
}

async function updatePackageJson(targetDir, deploymentPath) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    
    // Set the homepage to the deployment path
    packageJson.homepage = deploymentPath;
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
}

async function installDependencies(targetDir, deployment) {
  try {
    updateDeployment(deployment.id, {
      logs: [...deployment.logs, `[${new Date().toISOString()}] Installing dependencies...`]
    });
    
    await execAsync('npm install', { cwd: targetDir });
    
    updateDeployment(deployment.id, {
      logs: [...deployment.logs, `[${new Date().toISOString()}] Dependencies installed successfully`]
    });
  } catch (error) {
    updateDeployment(deployment.id, {
      logs: [...deployment.logs, `[${new Date().toISOString()}] Error installing dependencies: ${error.message}`]
    });
    throw error;
  }
}

async function buildApplication(targetDir, deployment) {
  try {
    updateDeployment(deployment.id, {
      logs: [...deployment.logs, `[${new Date().toISOString()}] Building application...`]
    });
    
    await execAsync('npm run build', { cwd: targetDir });
    
    updateDeployment(deployment.id, {
      logs: [...deployment.logs, `[${new Date().toISOString()}] Application built successfully`]
    });
  } catch (error) {
    updateDeployment(deployment.id, {
      logs: [...deployment.logs, `[${new Date().toISOString()}] Error building application: ${error.message}`]
    });
    throw error;
  }
}

async function configureDeployment(targetDir, deployment, isSSR) {
  try {
    updateDeployment(deployment.id, {
      status: DeploymentStatus.CONFIGURING,
      logs: [...deployment.logs, `[${new Date().toISOString()}] Configuring deployment...`]
    });
    
    // Generate Docker configuration
    await generateDockerConfig(targetDir, deployment, isSSR);
    
    // Generate Nginx configuration
    if (!isSSR) {
      await generateNginxConfig(targetDir, deployment);
    }
    
    // Build and run Docker container
    await buildAndRunContainer(targetDir, deployment);
    
    // Update Nginx reverse proxy configuration
    await updateNginxReverseProxy(deployment);
    
  } catch (error) {
    updateDeployment(deployment.id, {
      logs: [...deployment.logs, `[${new Date().toISOString()}] Error configuring deployment: ${error.message}`]
    });
    throw error;
  }
}

async function generateDockerConfig(targetDir, deployment, isSSR) {
  const containerName = `app-${deployment.id.slice(0, 8)}`;
  const dockerfileContent = isSSR 
    ? `FROM node:18-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production
ENV PUBLIC_URL=${deployment.path}
EXPOSE 3000
CMD ["npm", "start"]`
    : `FROM nginx:alpine
COPY ./build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;
  
  await fs.writeFile(path.join(targetDir, 'Dockerfile'), dockerfileContent);
  
  updateDeployment(deployment.id, {
    logs: [...deployment.logs, `[${new Date().toISOString()}] Generated Dockerfile for ${isSSR ? 'SSR' : 'static'} application`]
  });
}

async function generateNginxConfig(targetDir, deployment) {
  const nginxConfig = `server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}`;
  
  await fs.writeFile(path.join(targetDir, 'nginx.conf'), nginxConfig);
  
  updateDeployment(deployment.id, {
    logs: [...deployment.logs, `[${new Date().toISOString()}] Generated Nginx configuration`]
  });
}

async function buildAndRunContainer(targetDir, deployment) {
  try {
    const containerName = `app-${deployment.id.slice(0, 8)}`;
    
    updateDeployment(deployment.id, {
      status: DeploymentStatus.DEPLOYING,
      logs: [...deployment.logs, `[${new Date().toISOString()}] Building Docker container...`]
    });
    
    // Build Docker image
    await execAsync(`docker build -t ${containerName} .`, { cwd: targetDir });
    
    updateDeployment(deployment.id, {
      logs: [...deployment.logs, `[${new Date().toISOString()}] Docker image built successfully`]
    });
    
    // Run Docker container
    await execAsync(`docker run -d --name ${containerName} --network app-network -p 3000:3000 ${containerName}`);
    
    updateDeployment(deployment.id, {
      logs: [...deployment.logs, `[${new Date().toISOString()}] Docker container started successfully`]
    });
    
  } catch (error) {
    updateDeployment(deployment.id, {
      logs: [...deployment.logs, `[${new Date().toISOString()}] Error with Docker: ${error.message}`]
    });
    throw error;
  }
}

async function updateNginxReverseProxy(deployment) {
  try {
    const containerName = `app-${deployment.id.slice(0, 8)}`;
    const nginxConfigPath = path.join(__dirname, '../nginx/conf.d/reverse-proxy.conf');
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(nginxConfigPath));
    
    // Read existing config or create new one
    let nginxConfig = '';
    if (fs.existsSync(nginxConfigPath)) {
      nginxConfig = await fs.readFile(nginxConfigPath, 'utf8');
    } else {
      nginxConfig = `server {
    listen 80;
    server_name localhost;
    
    # Auto-generated reverse proxy configuration
    
}`;
    }
    
    // Add new location block
    const locationBlock = `
    location ${deployment.path} {
        proxy_pass http://${containerName}/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
`;
    
    // Insert location block before the closing brace
    nginxConfig = nginxConfig.replace(/}(\s*)$/, `${locationBlock}}$1`);
    
    // Write updated config
    await fs.writeFile(nginxConfigPath, nginxConfig);
    
    // Reload Nginx
    await execAsync('docker exec nginx-proxy nginx -s reload');
    
    updateDeployment(deployment.id, {
      logs: [...deployment.logs, `[${new Date().toISOString()}] Updated Nginx reverse proxy configuration`]
    });
    
  } catch (error) {
    updateDeployment(deployment.id, {
      logs: [...deployment.logs, `[${new Date().toISOString()}] Error updating Nginx configuration: ${error.message}`]
    });
    throw error;
  }
}