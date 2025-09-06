import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Server, Plus, LayoutDashboard } from 'lucide-react';

function Header() {
  const location = useLocation();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Server className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">Deploy<span className="text-blue-600">Hub</span></span>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link 
              to="/" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/new" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/new' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>New Deployment</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;