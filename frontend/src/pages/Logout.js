import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MainNavbar from '../components/layout/MainNavbar';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user session or token here
    localStorage.removeItem('token');
    // Optionally, you can call the server-side logout endpoint
    fetch('/api/logout', {
      method: 'POST',
    }).then(() => {
      // Redirect to login page
      navigate('/login');
    });
  }, [navigate]);

  return (
    <div>
      <h2>Logging out...</h2>
    </div>
  );
};

export default Logout;