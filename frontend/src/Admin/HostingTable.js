import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/layout/Sidebar";
import MainNavbar from "../components/layout/MainNavbar";
import HostingForm from "./HostingForm";

const HostingTable = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editableProfile, setEditableProfile] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/listings");
        setListings(response.data.filter((listing) => listing.hostProfile));
        // setListings(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load listings. Please try again later.");
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleEdit = (listing) => {
    setEditId(listing._id);
    setEditableProfile({ ...listing.hostProfile });
    setSelectedImage(null);
  };

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) setSelectedImage(file);
  // };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSave = async (id) => {
    const formData = new FormData();
    formData.append("address", editableProfile.address);
    formData.append("bio", editableProfile.bio);
    formData.append("email", editableProfile.email);
    formData.append("name", editableProfile.name);

    // Append the new profile picture if a new image is selected
    if (selectedImage) {
      formData.append("profilePicture", selectedImage);
    }

    try {
      await axios.patch(
        `http://localhost:8080/api/listings/${id}/host-profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Profile updated successfully!");
      setListings(
        listings.map((item) =>
          item._id === id ? { ...item, hostProfile: editableProfile } : item
        )
      );
      setEditId(null);
      setSelectedImage(null); // Reset the selected image after save
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  // const handleDeleteHostProfile = async (id) => {
  //   try {
  //     await axios.delete(`http://localhost:8080/api/listings/${id}/host-profile`);
  //     alert("Host profile deleted successfully!");
  //     setListings(listings.map((item) => (item._id === id ? { ...item, hostProfile: undefined } : item)));
  //   } catch (error) {
  //     console.error("Error deleting host profile:", error);
  //     alert("Failed to delete host profile.");
  //   }
  // };

  const handleDeleteHostProfile = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/listings/${id}/host-profile`
      );
      alert("Host profile deleted successfully!");

      // Remove the listing from the state
      setListings(listings.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting host profile:", error);
      alert("Failed to delete host profile.");
    }
  };

  if (loading) return <p>Loading listings...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <MainNavbar />
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="container mt-5">
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? "Hide Form" : "Add Hosting"}
        </button>

        {showForm && <HostingForm onClose={() => setShowForm(false)} />}
        <h2>Listings Data</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Username</th>
              <th>Profile Picture</th>
              <th>Address</th>
              <th>Bio</th>
              <th>Email</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing._id}>
                <td
                  style={{
                    maxWidth: "150px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {listing.title}
                </td>
                <td
                  style={{
                    maxWidth: "150px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {listing.category}
                </td>
                <td
                  style={{
                    maxWidth: "150px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {listing.username}
                </td>
                <td
                  style={{
                    maxWidth: "150px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {editId === listing._id ? (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e)}
                      />
                      {selectedImage && (
                        <div>
                          <p>Selected Image: {selectedImage.name}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <img
                      src={listing.hostProfile?.profilePicture}
                      alt="Profile"
                      width="50"
                      height="50"
                      style={{ borderRadius: "50%" }}
                    />
                  )}
                </td>

                <td
                  style={{
                    maxWidth: "150px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {editId === listing._id ? (
                    <input
                      type="text"
                      value={editableProfile.address}
                      onChange={(e) =>
                        setEditableProfile({
                          ...editableProfile,
                          address: e.target.value,
                        })
                      }
                    />
                  ) : (
                    listing.hostProfile?.address
                  )}
                </td>
                <td
                  style={{
                    maxWidth: "150px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {editId === listing._id ? (
                    <textarea
                      value={editableProfile.bio}
                      onChange={(e) =>
                        setEditableProfile({
                          ...editableProfile,
                          bio: e.target.value,
                        })
                      }
                    />
                  ) : (
                    listing.hostProfile?.bio
                  )}
                </td>
                <td
                  style={{
                    maxWidth: "150px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {editId === listing._id ? (
                    <input
                      type="email"
                      value={editableProfile.email}
                      onChange={(e) =>
                        setEditableProfile({
                          ...editableProfile,
                          email: e.target.value,
                        })
                      }
                    />
                  ) : (
                    listing.hostProfile?.email
                  )}
                </td>
                <td
                  style={{
                    maxWidth: "150px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {editId === listing._id ? (
                    <input
                      type="text"
                      value={editableProfile.name}
                      onChange={(e) =>
                        setEditableProfile({
                          ...editableProfile,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    listing.hostProfile?.name
                  )}
                </td>

                <td
                  style={{
                    maxWidth: "150px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {editId === listing._id ? (
                    <button
                      className="btn btn-success"
                      onClick={() => handleSave(listing._id)}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEdit(listing)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger ms-2"
                        onClick={() => handleDeleteHostProfile(listing._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HostingTable;
