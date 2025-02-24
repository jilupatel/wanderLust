import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const username = localStorage.getItem("username") || "User";
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("adminLoggedIn") === "true";
    setIsLoggedIn(loggedInStatus);
  }, []);

  const toggleUsersMenu = () => {
    setIsUsersMenuOpen(!isUsersMenuOpen);
  };

  const handleNavigation = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      alert("Please log in as an admin to access this page.");
      navigate("/admin/login");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const closeSidebar = () => {
    setIsOpen(false); // Close the sidebar
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Close Button */}
      <button className="close-btn" onClick={closeSidebar}>
        &times;
      </button>
      <div className="sidebar-header">
        <h2>
          <Link to="/profile">
            <i
              className="fa-regular fa-circle-user"
              style={{ color: "white", cursor: "pointer" }}
              onClick={closeSidebar}
            ></i>
            <span style={{ marginLeft: "15px" }}>{username}</span>
          </Link>
        </h2>
      </div>

      <ul className="sidebar-menu">
        <li>
        <button className="menu-btn" onClick={toggleUsersMenu}>
        <i
              className="fa-solid fa-lock"
              style={{ color: "white", cursor: "pointer" }}
              onClick={closeSidebar} 
            ></i>
            <span className="admin-text">Admin</span>{" "}
            {isUsersMenuOpen ? (
              <i className="fa-solid fa-chevron-up" style={{color:"white"}}></i>
            ) : (
              <i className="fa-solid fa-chevron-down" style={{color:"white"}}></i>
            )}
          </button>

          {isUsersMenuOpen && (
            <ul className="submenu">
              <li>
                <button style={{backgroundColor:"transparent"}} onClick={() => handleNavigation("/admin/listings")}>
                  Products
                </button>
              </li>
              <li>
                <button style={{backgroundColor:"transparent"}} onClick={() => handleNavigation("/admin/reservations")}>
                  Reservations
                </button>
              </li>
              <li>
                <button style={{backgroundColor:"transparent"}} onClick={() => handleNavigation("/admin/user/login")}>
                  Users
                </button>
              </li>
              <li>
                <button style={{backgroundColor:"transparent"}} onClick={() => handleNavigation("/admin/upload/image")}>
                  Upload Images
                </button>
              </li>
              <li>
                <button style={{backgroundColor:"transparent"}} onClick={() => handleNavigation("/admin/feature/authentication")}>
                  Features
                </button>
              </li>
              <li>
                <button style={{backgroundColor:"transparent"}} onClick={() => handleNavigation("/admin/host-table")}>
                  Hosting
                </button>
              </li>
              {isLoggedIn ? (
                <li>
                  <button style={{backgroundColor:"transparent"}} onClick={handleLogout}>Logout</button>
                </li>
              ) : (
                <li>
                  <Link to="/admin/login" onClick={closeSidebar}>
                    Admin Login
                  </Link>
                </li>
              )}
            </ul>
          )}
        </li>
        <li style={{ padding: "20px" }}>
          <Link to="/user/login" onClick={closeSidebar}>
            <i
              className="fa-solid fa-user"
              style={{ color: "white", cursor: "pointer" }}
              onClick={closeSidebar}
            ></i>{" "}
            Owner
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
