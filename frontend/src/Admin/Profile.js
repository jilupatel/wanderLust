import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/styles/Profile.css";
import MainNavbar from "../components/layout/MainNavbar";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Profile = () => {
  const [userInfo, setUserInfo] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const phoneNumber = localStorage.getItem("phoneNumber");
  const loginMethod = localStorage.getItem("loginMethod");
  const navigate = useNavigate();

  const username = localStorage.getItem("username");

  useEffect(() => {
    // Fetch user information from the backend when the component mounts
    const fetchUserInfo = async () => {
      if (!username) {
        alert("No username found. Please log in.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8080/api/user/${username}`
        );
        if (response.status === 200) {
          setUserInfo(response.data); // Assuming the backend returns user data as JSON
        }
      } catch (error) {
        console.error("Error fetching user information:", error);
        alert("Failed to fetch user information. Please try again.");
      }
    };

    fetchUserInfo();
  }, [username]);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleUpdateInformation = () => {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    navigate("/user/update/information");
  };

  const handleResetPassword = () => {
    navigate("/reset-password-request");
  };

  return (
    <div>
      <MainNavbar />
      <div className="profile-container">
        <h1 className="profile-header" style={{ marginBottom: "20px" }}>
          BASIC INFORMATION
        </h1>
        <hr style={{ border: "1px solid #000", width: "100%" }} />
        <div className="profile-card">
          <div className="profile-row">
            {userInfo.profilePicture && (
              <div className="profile-row">
                <img
                  src={userInfo.profilePicture}
                  alt="Profile"
                  style={{
                    marginTop: "180px",
                    marginLeft: "500px",
                    width: "180px", // Set the desired width
                    height: "200px",
                  }}
                  className="profile-picture"
                />
              </div>
            )}
            <strong style={{ marginLeft: "280px", marginTop: "50px" }}>
              Username:
            </strong>{" "}
            <span style={{ marginTop: "50px" }}>{userInfo.username}</span>
          </div>
          <div className="profile-row">
            <strong style={{ marginLeft: "280px" }}>
              {loginMethod === "phone" ? "Phone Number:" : "Email:"}
            </strong>
            <span>
              {loginMethod === "phone" ? userInfo.phoneNumber : userInfo.email}
            </span>
          </div>
          {loginMethod !== "phone" && userInfo.phoneNumber && (
            <div className="profile-row">
              <strong>Contact Number:</strong>
              <span>{userInfo.phoneNumber}</span>
            </div>
          )}
          {loginMethod !== "phone" && (
            <>
          <div className="profile-row">
            <strong style={{ marginLeft: "280px" }}>Password:</strong>
            <span>
              {showPassword ? userInfo.password : "********"}{" "}
              <i
                className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                onClick={togglePasswordVisibility}
                style={{
                  cursor: "pointer",
                  marginLeft: "10px",
                  color: "#555",
                }}
              ></i>
            </span>
          </div>
          <div className="profile-row">
            <Link
              to="/reset-password-request"
              onClick={handleResetPassword}
              style={{
                color: "#007BFF",
                textDecoration: "none",
                marginLeft: "280px",
              }}
            >
              Reset Password
            </Link>
          </div>
          </>
          )}

          {userInfo.fullName && (
            <div className="profile-row">
              <strong style={{ marginTop: "120px" }}>Full Name:</strong>{" "}
              <span style={{ marginTop: "120px" }}>{userInfo.fullName}</span>
            </div>
          )}
          {userInfo.contactNumber && (
            <div className="profile-row">
              <strong>Contact Number:</strong>{" "}
              <span>{userInfo.contactNumber}</span>
            </div>
          )}
          {userInfo.dateOfBirth && (
            <div className="profile-row">
              <strong>Date of Birth:</strong>{" "}
              <span>{userInfo.dateOfBirth}</span>
            </div>
          )}
          {userInfo.gender && (
            <div className="profile-row">
              <strong>Gender:</strong> <span>{userInfo.gender}</span>
            </div>
          )}
          {userInfo.address && (
            <div className="profile-row">
              <strong>Address:</strong> <span>{userInfo.address}</span>
            </div>
          )}
          {userInfo.occupation && (
            <div className="profile-row">
              <strong>Occupation:</strong> <span>{userInfo.occupation}</span>
            </div>
          )}
          {userInfo.theme && (
            <div className="profile-row">
              <strong>Theme:</strong> <span>{userInfo.theme}</span>
            </div>
          )}
          {userInfo.language && (
            <div className="profile-row">
              <strong>Language Preferences:</strong>{" "}
              <span>{userInfo.language}</span>
            </div>
          )}
        </div>
        <div className="profile-row">
          {/* <Link
            to="/user/update/information"
            style={{
              color: "#007BFF",
              textDecoration: "none",
              marginRight: "20px",
            }}
            onClick={handleUpdateInformation}
          >
            Update Your Information
          </Link> */}
          <button
            className="btn"
            style={{
              marginRight: "20px",
              marginBottom: "100px",
              backgroundColor: "#FF385C",
              color: "white",
            }}
            onClick={handleUpdateInformation}
          >
            Update Your Information
          </button>
        </div>
      </div>
      <footer className="fixed-footer">
        <div className="footer">
          <div className="f-info">
            <div className="f-info-socials">
              <a href="#">
                <i className="fa-brands fa-square-facebook"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-square-twitter"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-square-instagram"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-linkedin"></i>
              </a>
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
  );
};

export default Profile;
