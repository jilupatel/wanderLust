import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainBoilerplate from "../components/layout/MainBoilerplate.js";

const AdminLogin = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("token", data.token);
        setIsAuthenticated(true);
        navigate("/admin/listings"); // Navigate to the admin listings page
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || "Invalid credentials!");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <MainBoilerplate>
    <div className="form-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
        <div class="mb-3">
              <label for="Input1" class="form-label">
                Username
              </label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control"
            id="Input1"
            style={{ width: "500px", borderColor: " #dee2e6" }}
            required
          />
          </div>
          <div class="mb-3">
              <label for="Input1" class="form-label">
                Password
              </label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
                id="Input1"
                style={{ width: "500px", borderColor: " #dee2e6" }}
            required
          />
          </div>
        </div>
        <div class="col-auto">
        <button className="btn btn-secondary mb-3" type="submit">
          Login
        </button>
        </div>
      </form>
    </div>
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
    </MainBoilerplate>
  );
};

export default AdminLogin;
