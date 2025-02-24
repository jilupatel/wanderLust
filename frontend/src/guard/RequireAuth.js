import React from 'react';
import { Navigate } from 'react-router-dom';

const NoAuth = ({ children }) => {
  const token = localStorage.getItem('token');

  if (token) {
    // alert('Please login first');
    return <Navigate to="/"  />;

    // return <Navigate to="/listings/login" />;
  }

  return children;
};

export default NoAuth;