import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const HostProfileForm = () => {
  const { username, listingId } = useParams(); // Extract both username and listingId from the URL
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    address: "",
    email: "",
    profilePicture: "", // Store Cloudinary URL
  });

  const [selectedImage, setSelectedImage] = useState(null); // Store File Object

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/listings/${listingId}`);
        if (response.data.hostProfile) {
          setProfile(response.data.hostProfile);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      }
    };
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setProfile({ ...profile, profilePicture: URL.createObjectURL(file) }); // Preview the image
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("bio", profile.bio);
    formData.append("address", profile.address);
    formData.append("email", profile.email);
    if (selectedImage) {
      formData.append("profilePicture", selectedImage);
    }

    try {
      const response = await axios.patch(
        `http://localhost:8080/api/listings/${listingId}/host-profile`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      navigate(`/listings/${listingId}`);
    } catch (error) {
      console.error("Error updating host profile:", error);
    }
  };

  return (
    <div className="host-profile-form">
      <h2>Edit Host Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {profile.profilePicture && (
            <img src={profile.profilePicture} alt="Profile Preview" width="100" />
          )}
        </div>
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default HostProfileForm;
