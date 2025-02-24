// filepath: /d:/internship/project/frontend/src/components/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode"; // To decode JWT token
import MainBoilerplate from "../components/layout/MainBoilerplate.js";
import NoAuth from "../guard/RequireAuth.js";
import "../components/styles/login.css";
// import Footer from "../components/layout/Footer.js";

const clientId = process.env.REACT_APP_CLIENT_ID;

const UserLogin = () => {
  const [loginMethod, setLoginMethod] = useState("email");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Google Login Success Handler
  const handleGoogleLoginSuccess = async (response) => {
    const token = response.credential;
    const decoded = jwtDecode(token);

    console.log("Google User Info:", decoded); // Optional: Log user info

    try {
      const res = await axios.post("http://localhost:8080/api/google-login", {
        token,
      });

      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("email", res.data.email);
        localStorage.setItem("loginMethod", "google");
        navigate("/user/listings");
      } else {
        setError("Failed to login with Google.");
      }
    } catch (err) {
      console.error("Google login failed:", err);
      setError("An error occurred while logging in with Google.");
    }
  };

  // Google Login Error Handler
  const handleGoogleLoginError = () => {
    setError("Google login failed. Please try again.");
  };

  // Handle OTP Sending
  const sendOTP = async () => {
    try {
      // Verify if username and phone number exist in the database
      const verifyResponse = await axios.post(
        "http://localhost:8080/api/verify-username-phone",
        {
          username,
          phoneNumber,
        }
      );

      if (verifyResponse.status === 200) {
        // If verified, send OTP
        const response = await axios.post(
          "http://localhost:8080/api/send-otp",
          {
            phoneNumber,
          }
        );
        if (response.status === 200) {
          setOtpSent(true);
          alert("OTP sent to your phone number");
        } else {
          setError("Failed to send OTP. Please try again.");
        }
      } else {
        setError("Username or Phone Number is not found.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loginMethod === "email") {
      try {
        const response = await fetch("http://localhost:8080/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, email }),
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("token", data.token); // Store token
          localStorage.setItem("username", data.username); // Store username
          localStorage.setItem("email", data.email);
          localStorage.setItem("loginMethod", "email");
          navigate("/user/listings"); // Redirect to listings page
        } else {
          setError(data.message); // Display error message
        }
      } catch (error) {
        setError("An error occurred. Please try again."); // Handle any network errors
      }
    } else if (loginMethod === "phone") {
      try {
        // Properly format the phone login request
        const response = await axios.post(
          "http://localhost:8080/api/login/otp",
          { phoneNumber, otp } // Send data directly in the request body
        );

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("username", response.data.username);
          localStorage.setItem("loginMethod", "phone");
          navigate("/user/listings");
        } else {
          setError(response.data.message || "Login failed");
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "An error occurred. Please try again."
        );
      }
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <MainBoilerplate>
        {/* <NoAuth> */}
        <div
          className="form-container"
          style={{
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <h1>Owner Login</h1>
          <form
            onSubmit={handleSubmit}
            class="offset-0 needs-validation"
            novalidate
          >
            <div class="mb-3">
              <label for="Input1" class="form-label">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
                id="Input1"
                // style={{ borderColor:"#000", width: "500px", marginLeft: "0px"}}
                placeholder="Username"
                required
              />
            </div>

            {loginMethod === "email" && (
              <>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    style={{ borderColor: "black" }}
                    placeholder="Email"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="Textarea1" class="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    id="Input1"
                    // style={{ width: "500px" }}
                    placeholder="Password"
                    required
                  />
                </div>
              </>
            )}

            {loginMethod === "phone" && (
              <>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="form-control"
                    placeholder="Phone Number"
                    required
                  />
                </div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={sendOTP}
                    className="btn btn-primary"
                  >
                    Send OTP
                  </button>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Enter OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="form-control"
                        style={{ borderColor: "black" }}
                        placeholder="OTP"
                        required
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div class="col-auto">
              <button
                type="submit"
                className="google-btn w-100"
                style={{ backgroundColor: "rgb(220, 53, 69)", color: "white" }}
              >
                Login
              </button>
            </div>
            {/* Divider with OR */}
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="mx-2">OR</span>
              <hr className="flex-grow-1" />
            </div>
            <div>
              {loginMethod === "email" ? (
                <button
                  type="button"
                  onClick={() => setLoginMethod("phone")}
                  className="google-btn w-100"
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                    border: "1px solid black",
                  }}
                >
                  <i class="fa-solid fa-phone"></i>
                  Login with Phone Number
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
                  className="google-btn w-100"
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                    border: "1px solid black",
                  }}
                >
                  <i class="fa-solid fa-envelope"></i>
                  Login with Email
                </button>
              )}

              {/* Google Sign-In Button */}
              <div
              // className="google-btn w-100"
                className="mb-3"
                style={{
                  backgroundColor: "transparent",
                  color: "black",
                  border: "1px solid black",
                  fontWeight:"bold",
                  borderRadius:"5px"
                }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                />
              </div>

              {error && (
                <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
              )}
            </div>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
        {/* <Footer/> */}
        {/* </NoAuth> */}
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
      </MainBoilerplate>
    </GoogleOAuthProvider>
  );
};

export default UserLogin;

// // filepath: /d:/internship/project/frontend/src/components/Login.js
// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import MainBoilerplate from "../components/layout/MainBoilerplate.js";
// import NoAuth from "../guard/RequireAuth.js";
// import "../components/styles/login.css"
// // import Footer from "../components/layout/Footer.js";

// const UserLogin = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('http://localhost:8080/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         localStorage.setItem('token', data.token); // Store token
//         localStorage.setItem('username', data.username); // Store username
//         navigate('/user/listings'); // Redirect to listings page
//       } else {
//         setError(data.message); // Display error message
//       }
//     } catch (error) {
//       setError('An error occurred. Please try again.'); // Handle any network errors
//     }
//   };

//   return (
//     <MainBoilerplate>
//       {/* <NoAuth> */}
//         <div className="form-container">
//           <h1>Owner Login</h1>
//           <form onSubmit={handleSubmit}  class="offset-0 needs-validation"
//             novalidate>

//             <div class="mb-3">
//               <label for="Input1" class="form-label">
//                 Username
//               </label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="form-control"
//               id="Input1"
//               style={{ borderColor:"#000", width: "500px", marginLeft: "0px"}}
//               placeholder="Username"
//               required
//             />
//             </div>

//             <div class="mb-3">
//               <label for="Textarea1" class="form-label">
//                 Password
//               </label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="form-control"
//                 id="Input1"
//                 style={{ width: "500px" }}
//               placeholder="Password"
//               required
//             />
//             </div>
//             <button className="button btn btn-secondary mb-3" type="submit">Login</button>
//           </form>
//           {error && <p style={{ color: "red" }}>{error}</p>}
//         </div>
//         {/* <Footer/> */}
//       {/* </NoAuth> */}
//       <footer className="fixed-footer">
//       <div className="footer">
//       <div className="f-info">
//         <div className="f-info-socials">
//           <a href="#"><i className="fa-brands fa-square-facebook"></i></a>
//           <a href="#"><i className="fa-brands fa-square-twitter"></i></a>
//           <a href="#"><i className="fa-brands fa-square-instagram"></i></a>
//           <a href="#"><i className="fa-brands fa-linkedin"></i></a>
//         </div>
//         <div>&copy; WanderLust Private Limited</div>
//         <div className="f-info-links">
//           <a href="/privacy">Privacy</a>
//           <a href="/term">Term</a>
//         </div>
//       </div>
//       </div>
//     </footer>
//     </MainBoilerplate>
//   );
// };

// export default UserLogin;
