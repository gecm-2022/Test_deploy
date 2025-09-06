import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NewDeployment from './pages/NewDeployment';
import DeploymentDetails from './pages/DeploymentDetails';
import { DeploymentProvider } from './context/DeploymentContext';

function App() {
  return (
    <DeploymentProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new" element={<NewDeployment />} />
              <Route path="/deployments/:id" element={<DeploymentDetails />} />
            </Routes>
          </main>
        </div>
      </Router>
    </DeploymentProvider>
  );
}

export default App;