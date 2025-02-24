// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import MainBoilerplate from "../components/layout/MainBoilerplate.js";
// import NoAuth from "../guard/RequireAuth.js";

// const Signup = () => {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await axios.post("http://localhost:8080/api/signup", {
//       username,
//       password,
//       email,
//     });
//     navigate("/listings");
//   };

//   return (
//     <MainBoilerplate>
//       <NoAuth>
//         <div className="form-container">
//           <h1>User Signup</h1>
//           <form
//             onSubmit={handleSubmit}
//             class="offset-0 needs-validation"
//             novalidate
//           >
//             <div class="mb-3">
//               <label for="Input1" class="form-label">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 className="form-control"
//                 id="Input1"
//                 style={{ width: "500px", marginLeft: "0px"  }}
//                 placeholder="Username"
//                 required
//               />
//               </div>
//             <div class="mb-3">
//               <label for="Textarea1" class="form-label">
//                 Email
//               </label>
//               <input
//                 type="text"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="form-control"
//                 id="Input1"
//                 style={{ width: "500px"}}
//                 placeholder="Email"
//                 required
//               />
//               </div>
//             <div class="mb-3">
//               <label for="Input1" class="form-label">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 value={password}
//                 className="form-control"
//                 id="Input1"
//                 style={{ width: "500px" }}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Password"
//                 required
//               />
//               </div>
//             <button className="btn btn-secondary mb-3" type="submit">Signup</button>
//           </form>
//         </div>
//       </NoAuth>
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

// export default Signup;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";
import MainBoilerplate from "../components/layout/MainBoilerplate.js";
import NoAuth from "../guard/RequireAuth.js";
import "../components/styles/signup.css";

const clientId = process.env.REACT_APP_CLIENT_ID;
const Signup = () => {
  const [signupMethod, setSignupMethod] = useState("email"); // "email" or "phone"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle Google Login Success
  const handleGoogleLoginSuccess = async (response) => {
    const token = response.credential;

    try {
      // Decode user info (optional)
      const decoded = jwtDecode(token);
      console.log("Google User Info:", decoded);

      // Send token to backend
      const res = await axios.post("http://localhost:8080/api/google-login", {
        token,
      });

      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("email", res.data.email);
        localStorage.setItem("loginMethod", "google");
        navigate("/listings");
      } else {
        setError("Failed to login with Google.");
      }
    } catch (err) {
      console.error("Google login failed:", err);
      setError("An error occurred while logging in with Google.");
    }
  };

  // Handle OTP Sending
  const sendOTP = async () => {
    await axios.post("http://localhost:8080/api/send-otp", { phoneNumber });
    setOtpSent(true);
  };

  // Handle Signup Submission
  const handleSignup = async (e) => {
    e.preventDefault();

    if (signupMethod === "email") {
      await axios.post("http://localhost:8080/api/signup", {
        username,
        email,
        password,
      });
      navigate("/listings");
    } else if (signupMethod === "phone" && otp) {
      await axios.post("http://localhost:8080/api/verify-otp", {
        username,
        phoneNumber,
        otp,
      });
      navigate("/listings");
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <MainBoilerplate>
        <NoAuth>
          <div
            className="form-container"
            style={{
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
              padding: "20px",
              borderRadius: "10px",
              backgroundColor: "#fff",
            }}
          >
            <h1>User Signup</h1>

            {/* Toggle Signup Method */}
            {/* <div>
            <button onClick={() => setSignupMethod("email")}>Signup with Email</button>
            <button onClick={() => setSignupMethod("phone")}>Signup with Phone</button>
          </div> */}

            <form
              onSubmit={handleSignup}
              className="needs-validation"
              noValidate
            >
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              {signupMethod === "email" && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                      style={{ borderColor: "black" }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-control"
                      style={{ borderColor: "black" }}
                      required
                    />
                  </div>
                </>
              )}

              {signupMethod === "phone" && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="form-control"
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
                  style={{
                    backgroundColor: "rgb(220, 53, 69)",
                    color: "white",
                  }}
                >
                  Continue
                </button>
              </div>
              {/* Divider with OR */}
              <div className="d-flex align-items-center my-3">
                <hr className="flex-grow-1" />
                <span className="mx-2">OR</span>
                <hr className="flex-grow-1" />
              </div>
              {/* Toggle Signup Method Button */}
              {signupMethod === "email" ? (
                <button
                  type="button"
                  onClick={() => setSignupMethod("phone")}
                  className="google-btn w-100"
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                    border: "1px solid black",
                  }}
                >
                  <i class="fa-solid fa-phone"></i>Signup with Phone
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSignupMethod("email")}
                  className="google-btn w-100"
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                    border: "1px solid black",
                  }}
                >
                  <i class="fa-solid fa-envelope"></i>Signup with Email
                </button>
              )}

              {/* Google Sign-In Button */}
              <div className="mb-3" style={{
                  backgroundColor: "transparent",
                  color: "black",
                  border: "1px solid black",
                  fontWeight:"bold",
                  borderRadius:"5px"
                }}>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => setError("Google Login Failed")}
                />
              </div>
            </form>
            {error && (
              <p
                style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}
              >
                {error}
              </p>
              )}
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
        </NoAuth>
      </MainBoilerplate>
    </GoogleOAuthProvider>
  );
};

export default Signup;
