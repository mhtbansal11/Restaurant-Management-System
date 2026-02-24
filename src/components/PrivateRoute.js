import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is logged in but doesn't have permission, redirect to dashboard or a "not authorized" page
    // For now, redirecting to home/dashboard if they try to access a restricted page
    // Note: If the dashboard itself is restricted and they don't have access, this might cause a loop. 
    // We should ensure Dashboard is accessible to everyone or handle it.
    // However, if they are already ON the dashboard (path is /), we shouldn't redirect to /
    
    if (location.pathname !== '/') {
        return <Navigate to="/" replace />;
    }
    // If they are on dashboard and not allowed, maybe show a message or let them stay (assuming dashboard is generic)
  }

  return children;
};

export default PrivateRoute;

