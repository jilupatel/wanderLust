import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MainBoilerplate from "../components/layout/MainBoilerplate.js";
// require("dotenv").config();

const UpdateInformation = () => {
  const navigate = useNavigate();
  const storedUserInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    occupation: "",
    theme: "Light",
    language: "English",
    profilePicture: "",
    username: localStorage.getItem("username"),
  });
  
  useEffect(() => {
    if (storedUserInfo) {
      setFormData(storedUserInfo);
    }
  }, []);

  // const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const CLOUD_NAME = process.env.CLOUD_NAME;
  const UPLOAD_PRESET = process.env.UPLOAD_PRESET;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formDataForCloudinary = new FormData();
      formDataForCloudinary.append("file", file);
      formDataForCloudinary.append("upload_preset", UPLOAD_PRESET);

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          formDataForCloudinary
        );

        const imageUrl = response.data.secure_url;
        setFormData({ ...formData, profilePicture: imageUrl });
      } catch (error) {
        console.error("Error uploading image to Cloudinary", error);
      }
    }
  };
  console.log("Cloud Name:", process.env.REACT_APP_CLOUD_NAME);
  console.log("Upload Preset:", process.env.REACT_APP_UPLOAD_PRESET);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username) {
      alert("Username is not available in localStorage. Please log in.");
      return;
    }

    try {
      // Make a PUT request to update the user data in the backend
      const response = await axios.put(
        "http://localhost:8080/api/user/update",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("Information updated successfully!");
        localStorage.setItem("userInfo", JSON.stringify(formData)); // Save updated data locally
        navigate("/profile"); // Redirect to profile page
      }
    } catch (error) {
      console.error("Error updating information:", error);
      alert("Failed to update information. Please try again.");
    }
  };

  return (
    <MainBoilerplate>
    <div>  
    <div className="form-container" style={{marginTop: "0px"}}>
      <h1>Update Your Information</h1>
      <form onSubmit={handleSubmit}>
        <div class="mb-3">
          <label for="Input1" class="form-label">
            Full Name:
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="form-control"
            placeholder="Full Name"
            id="Input1"
            style={{ width: "500px", marginLeft: "0px", borderColor: "#000" }}
           
          />
        </div>
        <div class="mb-3">
          <label for="Input1" class="form-label">
            Contact Number:
          </label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="form-control"
            placeholder="Contact Number"
            id="Input1"
            style={{ width: "500px", marginLeft: "0px", borderColor: "#000" }}
            
          />
        </div>
        <div class="mb-3">
          <label for="Input1" class="form-label">
            Date of Birth:
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="form-control"
            placeholder="Date of Birth"
            id="Input1"
            style={{ width: "500px", marginLeft: "0px", borderColor: "#000" }}
            
          />
        </div>
        <div class="mb-3">
          <label for="Input1" class="form-label">
            Gender:
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="form-control"
            id="Input1"
            style={{ width: "500px", marginLeft: "0px", borderColor: "#000" }}
            
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="Input1" class="form-label">Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-control"
                placeholder="Address"
                id="Input1"
                style={{ width: "500px", marginLeft: "0px", borderColor: "#000" }}
              
          />
        </div>
        <div class="mb-3">
          <label for="Input1" class="form-label">Occupation:</label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className="form-control"
                placeholder="Username"
                id="Input1"
                style={{ width: "500px", marginLeft: "0px", borderColor: "#000" }}
               
          />
        </div>
        <div class="mb-3">
          <label for="Input1" class="form-label">Theme:</label>
          <select name="theme" value={formData.theme} onChange={handleChange} className="form-control" id="Input1" style={{ width: "500px", marginLeft: "0px", borderColor: "#000" }}>
            <option value="Light">Light</option>
            <option value="Dark">Dark</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="Input1" class="form-label">Language Preferences:</label>
          <input
            type="text"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="form-control"
                placeholder="Language"
                id="Input1"
                style={{ width: "500px", marginLeft: "0px", borderColor: "#000" }}
                required
          />
        </div>
        <div className="mb-3">
          <label for="Input1" class="form-label">Profile Picture:</label>
          <input type="file" name="profilePicture" onChange={handleFileChange} className="form-control" id="Input1"
                style={{ width: "500px", marginLeft: "0px", borderColor: "#000" }} />
        </div>
        {formData.profilePicture && <img src={formData.profilePicture} alt="Profile" width="100" />}
        <div class="col-auto">
        <button className="btn btn-secondary mb-9" type="submit">Update</button>
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
    </div>
    </MainBoilerplate>
  );
};

export default UpdateInformation;
