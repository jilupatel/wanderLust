import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar"; // Import Sidebar component
import "../../components/styles/Admin.css"; // Import styles
import "../../components/styles/MainNavbar.css";
import "../../components/styles/DropdownMenu.css"; // Importing CSS file
import { FaBars, FaUserCircle } from "react-icons/fa"; // React Icons

const MainNavbar = () => {
  const [activeIcon, setActiveIcon] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to manage sidebar visibility
  const [searchType, setSearchType] = useState("title");
  const [searchValue, setSearchValue] = useState("");
  const token = localStorage.getItem("token");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const username = localStorage.getItem("username") || "User";
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [showGuests, setShowGuests] = useState(false);
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(0);
  const [activeTab, setActiveTab] = useState("Homes");
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const totalGuests = adults + children + pets;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown if clicked outside
  const closeDropdown = (e) => {
    if (!e.target.closest(".dropdown-container")) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".guests-dropdown") &&
        !event.target.closest(".guests-btn")
      ) {
        setShowGuests(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Attach event listener for clicking outside
  React.useEffect(() => {
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  // Toggle Sidebar Visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchValue.trim() || checkInDate || checkOutDate || totalGuests > 0) {
      const queryParams = new URLSearchParams();

      // Add search type and value
      if (searchValue.trim()) {
        queryParams.append("searchType", searchType);
        queryParams.append("searchValue", encodeURIComponent(searchValue));
      }

      // Add guests
      if (totalGuests > 0) {
        queryParams.append("guests", totalGuests);
      }

      // Add check-in and check-out dates
      if (checkInDate) {
        queryParams.append("checkInDate", checkInDate);
      }
      if (checkOutDate) {
        queryParams.append("checkOutDate", checkOutDate);
      }

      // Navigate to ListingList.js with all query parameters
      navigate(`/listings?${queryParams.toString()}`);
    }
  };

  return (
    <>
      <div className="floating-menu">
        <button
          className={`menu-icon ${activeIcon === "user" ? "active" : ""}`}
          onClick={() => toggleSidebar("user")}
          title="User Profile"
        >
          <i className="fa-regular fa-circle-user"></i>
        </button>
        <button className="menu-icon" onClick={toggleSidebar} title="Admin">
          <i className="fa-solid fa-lock"></i>
        </button>
        <button className="menu-icon" onClick={toggleSidebar} title="User">
          <i className="fa-solid fa-user"></i>
        </button>
      </div>
      <nav
        className="navbar navbar-expand-md bg-body-light border-bottom sticky-top"
        style={{ backgroundColor: "#ebebeb", height: "150px" }}
      >
        <div className="container-fluid" style={{ backgroundColor: "#ebebeb" }}>
          <div
            className="collapse navbar-collapse"
            id="navbarNavAltMarkup"
            style={{ backgroundColor: "#ebebeb" }}
          >
            {/* Navbar Logo */}
            <Link
              className="navbar-brand"
              to="/"
              style={{ marginTop: "-30px" }}
            >
              <i className="fa-regular fa-compass"></i>
            </Link>
            <div className="navbar-collapse">
              {/* Left-aligned Links */}
              <div className="navbar-nav" style={{ marginTop: "-40px" }}>
                <Link className="nav-link" to="/">
                  Explore
                </Link>
              </div>

              <div className="navbar-nav ms-auto">
                <div
                  className="search-container-wrapper"
                  style={{ position: "relative", width: "100%" }}
                >
                  <div style={{ marginTop: "0px", marginBottom: "10px" }}>
                    <span
                      style={{
                        marginRight: "20px",
                        color: activeTab === "Homes" ? "#0d0d0d" : "#626262",
                        fontSize: "20px",
                        cursor: "pointer",
                      }}
                      onClick={() => setActiveTab("Homes")}
                    >
                      Homes
                    </span>
                    <span
                      style={{
                        marginLeft: "20px",
                        color:
                          activeTab === "Experiences" ? "#0d0d0d" : "#626262",
                        fontSize: "20px",
                        cursor: "pointer",
                      }}
                      onClick={() => setActiveTab("Experiences")}
                    >
                      Experiences
                    </span>
                  </div>
                  <form
                    className="search-container"
                    style={{
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                      backgroundColor: "#fff",
                    }}
                    onSubmit={handleSearch}
                  >
                    <select
                      style={{ width: "180px" }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f2f2f2")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#fff")
                      }
                      className="form-select selectopt"
                      name="select"
                      aria-label="Default select example"
                      onChange={(e) => setSearchType(e.target.value)}
                    >
                      <option value="title" selected>
                        Title
                      </option>
                      <option value="price">Price</option>
                      <option value="location">Location</option>
                      <option value="country">Country</option>
                      <option value="category">Category</option>
                    </select>
                    <div className="separator"></div>
                    <input
                      id="search"
                      style={{
                        width: "180px",
                        marginLeft: "6px",
                        marginRight: "6px",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f2f2f2")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#fff")
                      }
                      className="form-control search"
                      placeholder="Search Destination"
                      name="search"
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <div className="separator"></div>
                    <input
                      style={{
                        width: "120px",
                        marginLeft: "0px",
                        marginRight: "0px",
                        border: "none",
                        paddingLeft: "0px",
                        paddingRight: "0px",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f2f2f2")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#fff")
                      }
                      type="date"
                      value={checkInDate}
                      placeholder="Check-in Date"
                      onChange={(e) => setCheckInDate(e.target.value)}
                      name="search"
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {activeTab === "Homes" && (
                      <>
                        <div className="separator"></div>
                        <input
                          style={{
                            width: "120px",
                            marginLeft: "0px",
                            marginRight: "0px",
                            border: "none",
                            paddingLeft: "0px",
                            paddingRight: "0px",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#f2f2f2")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "#fff")
                          }
                          type="date"
                          value={checkOutDate}
                          placeholder="Check-Out Date"
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          name="search"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </>
                    )}
                    <div className="separator"></div>
                    <button
                      type="button"
                      className="guests-btn"
                      onClick={() => setShowGuests(!showGuests)}
                      style={{
                        background: "transparent",
                        color: "black",
                        width: "180px",
                        marginLeft: "6px",
                        marginRight: "6px",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f2f2f2")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#fff")
                      }
                    >
                      Guests: {totalGuests}
                    </button>
                    {showGuests && (
                      <div
                        className="guests-dropdown"
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "700px",
                          width: "250px",
                          backgroundColor: "#fff",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                          padding: "10px",
                          zIndex: "1000",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-around",
                            alignItems: "center",
                            marginBottom: "5px",
                          }}
                        >
                          <label style={{ color: "black" }}>Adults</label>
                          <span
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <button
                              type="button"
                              style={{
                                background: "transparent",
                                border: "1px solid black",
                                color: "black",
                                padding: "px 10px",
                              }}
                              onClick={() => setAdults(Math.max(1, adults - 1))}
                            >
                              -
                            </button>
                            <span style={{ color: "black" }}>{adults}</span>
                            <button
                              type="button"
                              style={{
                                background: "transparent",
                                border: "1px solid black",
                                color: "black",
                                padding: "px 10px",
                              }}
                              onClick={() => setAdults(adults + 1)}
                            >
                              +
                            </button>
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-around",
                            alignItems: "center",
                            marginBottom: "5px",
                          }}
                        >
                          <label style={{ color: "black" }}>Children</label>
                          <span
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <button
                              type="button"
                              style={{
                                background: "transparent",
                                border: "1px solid black",
                                color: "black",
                                padding: "px 10px",
                              }}
                              onClick={() =>
                                setChildren(Math.max(0, children - 1))
                              }
                            >
                              -
                            </button>
                            <span style={{ color: "black" }}>{children}</span>
                            <button
                              type="button"
                              style={{
                                background: "transparent",
                                border: "1px solid black",
                                color: "black",
                                padding: "px 10px",
                              }}
                              onClick={() => setChildren(children + 1)}
                            >
                              +
                            </button>
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-around",
                            alignItems: "center",
                            marginBottom: "5px",
                          }}
                        >
                          <label style={{ color: "black" }}>Pets</label>
                          <span
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <button
                              type="button"
                              style={{
                                background: "transparent",
                                border: "1px solid black",
                                color: "black",
                                padding: "px 10px",
                              }}
                              onClick={() => setPets(Math.max(0, pets - 1))}
                            >
                              -
                            </button>
                            <span style={{ color: "black" }}>{pets}</span>
                            <button
                              type="button"
                              style={{
                                background: "transparent",
                                border: "1px solid black",
                                color: "black",
                                padding: "px 10px",
                              }}
                              onClick={() => setPets(pets + 1)}
                            >
                              +
                            </button>
                          </span>
                        </div>
                      </div>
                    )}
                    <button type="submit">
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </button>
                  </form>
                </div>
              </div>

              <div className="navbar-nav ms-auto">
                <div className="dropdown-container">
                  {/* Dropdown Button */}
                  <button
                    style={{
                      marginRight: "80px",
                      marginTop: "-40px",
                      backgroundColor: "transparent",
                      border: "1px solid #a1a1a1",
                      borderRadius: " 50px 50px 50px 50px",
                    }}
                    className="dropdown-button"
                    onClick={toggleDropdown}
                  >
                    <FaBars className="icon" style={{ color: "#313131" }} />
                    <FaUserCircle
                      className="icon"
                      style={{ color: "#454545" }}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <ul className="dropdown-menu">
                      {!token ? (
                        <>
                          <li>
                            <a
                              href="/login"
                              className="dropdown-item"
                              style={{ color: "black", textDecoration: "none" }}
                            >
                              Login
                            </a>
                          </li>
                          <li>
                            <a
                              href="/signup"
                              className="dropdown-item"
                              style={{ color: "black", textDecoration: "none" }}
                            >
                              SignUp
                            </a>
                          </li>
                          <hr />
                          <li>
                            <Link
                              to="/user/login"
                              className="dropdown-item"
                              style={{ color: "black", textDecoration: "none" }}
                            >
                              Owner
                            </Link>
                          </li>
                          <hr />
                          <li>
                            <Link
                              to="/help-center"
                              className="dropdown-item"
                              style={{ color: "black", textDecoration: "none" }}
                            >
                              Help Center
                            </Link>
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <Link
                              to="/profile"
                              className="dropdown-item"
                              style={{ color: "black", textDecoration: "none" }}
                            >
                              <i
                                class="fa-sharp fa-solid fa-circle-user"
                                style={{ color: "black", cursor: "pointer" }}
                              ></i>
                              <span style={{ marginLeft: "15px" }}>
                                {username}
                              </span>
                            </Link>
                          </li>
                          <li>
                            <a
                              href="/listings/new"
                              className="dropdown-item"
                              style={{ color: "black", textDecoration: "none" }}
                            >
                              <i
                                class="fa-sharp fa-solid fa-house"
                                style={{
                                  color: "black",
                                  cursor: "pointer",
                                  marginRight: "15px",
                                }}
                              ></i>
                              Add Your Home
                            </a>
                          </li>

                          <li>
                            <Link
                              to="/user/login"
                              className="dropdown-item"
                              style={{ color: "black", textDecoration: "none" }}
                            >
                              <i
                                className="fa-solid fa-user"
                                style={{
                                  color: "black",
                                  cursor: "pointer",
                                  marginRight: "15px",
                                }}
                              ></i>{" "}
                              Owner
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/help-center"
                              className="dropdown-item"
                              style={{ color: "black", textDecoration: "none" }}
                            >
                              <i
                                className="fa-solid fa-question-circle"
                                style={{
                                  color: "black",
                                  cursor: "pointer",
                                  marginRight: "15px",
                                }}
                              ></i>
                              Help Center
                            </Link>
                          </li>
                          <li>
                            <a
                              href="/logout"
                              className="dropdown-item"
                              style={{ color: "black", textDecoration: "none" }}
                            >
                              <i
                                class="fa-solid fa-right-from-bracket"
                                style={{
                                  color: "black",
                                  cursor: "pointer",
                                  marginRight: "15px",
                                }}
                              ></i>
                              Logout
                            </a>
                          </li>
                        </>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
    </>
  );
};

export default MainNavbar;
