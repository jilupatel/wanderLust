import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainBoilerplate from "../components/layout/MainBoilerplate.js";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Retrieve the email from localStorage
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setEmail(storedEmail); // Automatically set the email if available
    }
  }, []);

  const handleRequestReset = async (e) => {
    e.preventDefault();
  
    const emailFromLocalStorage = localStorage.getItem("email"); // Get the email from localStorage
  
    try {
      // If email is not found in localStorage, set it manually or display an error
      if (!emailFromLocalStorage) {
        setMessage('Email not found. Please log in again.');
        return;
      }
  
      // Send email to backend for password reset
      await axios.post('http://localhost:8080/api/request-password-reset', { email: emailFromLocalStorage });
      setMessage('Password reset link sent to your email.');
    } catch (err) {
      console.error('Error:', err); // Log error to help debug
      setMessage('Error requesting password reset.');
    }
  };

  return (
    <MainBoilerplate>
    <div>
            
      <h2>Request Password Reset</h2>
      <form onSubmit={handleRequestReset}>
        {email ? (
          <p>Email: {email}</p> // Display the email from localStorage
        ) : (
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <button type="submit" style={{marginLeft: "100px"}}>Password Reset</button>
      </form>
      {message && <p>{message}</p>}
      <footer className="fixed-footer">
      <div className="footer">
      <div className="f-info">
        <div className="f-info-socials">
          <a href="#"><i className="fa-brands fa-square-facebook"></i></a>
          <a href="#"><i className="fa-brands fa-square-twitter"></i></a>
          <a href="#"><i className="fa-brands fa-square-instagram"></i></a>
          <a href="#"><i className="fa-brands fa-linkedin"></i></a>
        </div>
        <div>&copy; WanderLust Private Limited</div>
        <div className="f-info-links">
          <a href="/privacy">Privacy</a>
          <a href="/term">Term</a>
        </div>
      </div>
      </div>
    </footer>
    </div>
    </MainBoilerplate>
  );
};

export default ResetPasswordRequest;
