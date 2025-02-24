import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MainBoilerplate from "../components/layout/MainBoilerplate.js";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`http://localhost:8080/api/reset-password/${token}`, { newPassword });
      setMessage('Password reset successfully!');
    } catch (err) {
      setMessage('Error resetting password.');
    }
  };

  return (
    <MainBoilerplate>
    <div>
      <h2>Reset Your Password</h2>
      <form onSubmit={handleResetPassword}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button type="submit">Reset Password</button>
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

export default ResetPassword;
