import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // AuthProvider now handles all token validation during initialization
  // We can rely on the isAuthenticated state
  if (!isAuthenticated) {
    return <Navigate to="/api/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
