// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const HostingForm = () => {
//   const navigate = useNavigate();
//   const [listings, setListings] = useState([]);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [profile, setProfile] = useState({
//     username: "",
//     category: "",
//     title: "",
//     name: "",
//     bio: "",
//     address: "",
//     email: "",
//     profilePicture: null,
//   });

// //   useEffect(() => {
// //     const fetchListings = async () => {
// //       try {
// //         const response = await axios.get("http://localhost:8080/api/listings");
// //         if (response.data.hostProfile) {
// //             setProfile(response.data.hostProfile);
// //           } 
// //       } catch (error) {
// //         console.error("Error fetching listings:", error);
// //       }
// //     };
// //     fetchListings();
// //   }, []);

// useEffect(() => {
//     const fetchListings = async () => {
//       try {
//         const response = await axios.get("http://localhost:8080/api/listings");
//         console.log("Fetched Listings:", response.data); // Debugging line
//         setListings(response.data);
//       } catch (error) {
//         console.error("Error fetching listings:", error);
//       }
//     };
//     fetchListings();
//   }, []);
  

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedImage(file);
//       setProfile({ ...profile, profilePicture: file }); // Store actual file, not URL
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     console.log("Checking listings for match...", listings);
  
//     // Ensure we have listings before proceeding
//     if (!listings || listings.length === 0) {
//       alert("No listings found. Please check if the server is running.");
//       return;
//     }
  
//     // Find the listing that matches username, category, and title exactly
//     const matchedListing = listings.find(
//       (listing) =>
//         listing.username.trim().toLowerCase() === profile.username.trim().toLowerCase() &&
//         listing.category.trim().toLowerCase() === profile.category.trim().toLowerCase() &&
//         listing.title.trim().toLowerCase() === profile.title.trim().toLowerCase()
//     );
  
//     console.log("Matched Listing:", matchedListing);
  
//     if (!matchedListing) {
//       alert("Entered details do not match any existing listing.");
//       return;
//     }
  
//     // Ensure we have a valid _id
//     if (!matchedListing._id) {
//       console.error("Error: Matched listing does not contain a valid _id", matchedListing);
//       alert("Error: Unable to update profile. Please try again.");
//       return;
//     }
  
//     const formData = new FormData();
//     formData.append("name", profile.name);
//     formData.append("bio", profile.bio);
//     formData.append("address", profile.address);
//     formData.append("email", profile.email);
//     if (selectedImage) {
//       formData.append("profilePicture", selectedImage);
//     }
  
//     try {
//       const response = await axios.patch(
//         `http://localhost:8080/api/listings/${matchedListing._id}/host-profile`,
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );
  
//       if (response.status === 200) {
//         alert("Profile updated successfully!");
//         // navigate(`/listings/${matchedListing._id}`);
//         navigate(`/admin/host-table`);
//       }
//     } catch (error) {
//       console.error("Error updating host profile:", error);
//       alert("Failed to update profile. Please try again.");
//     }
//   };  
  

//   return (
//     <div className="host-profile-form">
//       <h2>Enter Host Profile Information</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label>Username</label>
//           <input
//             type="text"
//             value={profile.username}
//             onChange={(e) => setProfile({ ...profile, username: e.target.value })}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Category</label>
//           <input
//             type="text"
//             value={profile.category}
//             onChange={(e) => setProfile({ ...profile, category: e.target.value })}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Title</label>
//           <input
//             type="text"
//             value={profile.title}
//             onChange={(e) => setProfile({ ...profile, title: e.target.value })}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Name</label>
//           <input
//             type="text"
//             value={profile.name}
//             onChange={(e) => setProfile({ ...profile, name: e.target.value })}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Bio</label>
//           <textarea
//             value={profile.bio}
//             onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Address</label>
//           <input
//             type="text"
//             value={profile.address}
//             onChange={(e) => setProfile({ ...profile, address: e.target.value })}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Email</label>
//           <input
//             type="email"
//             value={profile.email}
//             onChange={(e) => setProfile({ ...profile, email: e.target.value })}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Profile Picture</label>
//           <input type="file" accept="image/*" onChange={handleImageChange} />
//           {selectedImage && (
//             <img src={URL.createObjectURL(selectedImage)} alt="Preview" width="100" />
//           )}
//         </div>
//         <button type="submit">Save Profile</button>
//       </form>
//     </div>
//   );
// };

// export default HostingForm;

import React, { useState, useEffect } from "react";
import axios from "axios";

const HostingForm = ({ onClose }) => {
  const [listings, setListings] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [profile, setProfile] = useState({
    username: "",
    category: "",
    title: "",
    name: "",
    bio: "",
    address: "",
    email: "",
    profilePicture: null,
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/listings");
        setListings(response.data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };
    fetchListings();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setProfile({ ...profile, profilePicture: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const matchedListing = listings.find(
      (listing) =>
        listing.username.trim().toLowerCase() === profile.username.trim().toLowerCase() &&
        listing.category.trim().toLowerCase() === profile.category.trim().toLowerCase() &&
        listing.title.trim().toLowerCase() === profile.title.trim().toLowerCase()
    );

    if (!matchedListing) {
      alert("Entered details do not match any existing listing.");
      return;
    }

    if (!matchedListing._id) {
      alert("Error: Unable to update profile. Please try again.");
      return;
    }

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
        `http://localhost:8080/api/listings/${matchedListing._id}/host-profile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        alert("Profile updated successfully!");
        onClose(); // Close the form after successful submission
      }
    } catch (error) {
      console.error("Error updating host profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="host-profile-form">
      <h2 style={{marginTop: "0px"}}>Enter Host Profile Information</h2>
      <form onSubmit={handleSubmit}>
        <div class="mb-3">
          <label for="Input1" class="form-label">Username</label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            className="form-control"
                placeholder="Username"
                id="Input1"
                style={{ width: "500px", marginLeft: "0px", borderColor: " #dee2e6" }}
                required
          />
        </div>
        <div className="mb-3">
          <label for="Textarea1" class="form-label">Category</label>
          <input
            type="text"
            value={profile.category}
            onChange={(e) => setProfile({ ...profile, category: e.target.value })}
            className="form-control"
                placeholder="Category"
                id="Input1"
                style={{ width: "500px", borderColor: " #dee2e6" }}
                required
          />
        </div>
        <div class="mb-3">
          <label for="Textarea1" class="form-label">Title</label>
          <input
            type="text"
            value={profile.title}
            onChange={(e) => setProfile({ ...profile, title: e.target.value })}
            className="form-control"
                placeholder="Title"
                id="Input1"
                style={{ width: "500px", borderColor: " #dee2e6" }}
                required
          />
        </div>
        <div class="mb-3">
          <label for="Textarea1" class="form-label">Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="form-control"
                placeholder="Name"
                id="Input1"
                style={{ width: "500px", borderColor: " #dee2e6" }}
                required
          />
        </div>
        <div class="mb-3">
          <label for="Textarea1" class="form-label">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="form-control"
                placeholder="Bio"
                id="Input1"
                style={{ width: "500px", borderColor: " #dee2e6" }}
          />
        </div>
        <div class="mb-3">
          <label for="Textarea1" class="form-label">Address</label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="form-control"
                placeholder="Address"
                id="Input1"
                style={{ width: "500px", borderColor: " #dee2e6" }}
                required
          />
        </div>
        <div class="mb-3">
          <label for="Textarea1" class="form-label">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="form-control"
                placeholder="Email"
                id="Input1"
                style={{ width: "500px", borderColor: " #dee2e6" }}
                required
          />
        </div>
        <div class="mb-3">
          <label for="Textarea1" class="form-label">Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="form-control"
                placeholder="Image"
                id="Input1"
                style={{ width: "500px", borderColor: " #dee2e6" }}
                required/>
          {selectedImage && (
            <img src={URL.createObjectURL(selectedImage)} alt="Preview" width="100" />
          )}
        </div>
        <button type="submit">Save Profile</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default HostingForm;
