
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../../App';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Optional: Verify token with backend
        try {
          const response = await axios.get(`${backendUrl}auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          setIsAuthenticated(response.data && response.data.success);
        } catch (error) {
          console.error('Token verification failed:', error);
          // Token might be invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return path
    return <Navigate to="/login" state={{ from: location.pathname, message: "Please login to continue" }} replace />;
  }

  return children;
};

export default ProtectedRoute;
