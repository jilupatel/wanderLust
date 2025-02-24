import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  // Retrieve the token from localStorage
  const token = localStorage.getItem('token');
  
  // Check if token exists
  if (!token) {
    // Redirect to login page if no token found
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if the token exists
  return children;
};

export default AuthGuard;
