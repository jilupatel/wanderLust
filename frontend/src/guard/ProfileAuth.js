import React from "react";
import { Navigate } from "react-router-dom";

const ProfileAuth = ({ children }) => {
  const token = localStorage.getItem("token"); // Check for authentication token
  return token ? children : <Navigate to="/login" />;
};

export default ProfileAuth;