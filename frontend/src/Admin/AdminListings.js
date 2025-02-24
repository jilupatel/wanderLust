import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/layout/Sidebar";
import "../components/styles/AdminListings.css";
import "../components/styles/Admin.css";
import MainNavbar from "../components/layout/MainNavbar";

const AdminListings = () => {
  const [listings, setListings] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editId, setEditId] = useState(null); // Tracks which row is being edited
  const [editableListing, setEditableListing] = useState({}); // Editable data
  const navigate = useNavigate();
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    price: "",
    guests: "",
    image: "",
    location: "",
    country: "",
    category: "",
    username: "",
  });

  // State to handle form visibility
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch listings data
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/listings", {
          withCredentials: true,
        });
        setListings(response.data);
      } catch (err) {
        console.error("Error fetching listings:", err);
      }
    };
    fetchListings();
  }, []);

  // Show Add Listing Form
  const handleOpenAddForm = () => {
    setIsAddFormVisible(true);
  };

  // Hide Add Listing Form
  const handleCloseAddForm = () => {
    setIsAddFormVisible(false);
    setNewListing({
      title: "",
      description: "",
      price: "",
      image: "",
      location: "",
      guests: "",
      country: "",
      category: "",
      username: "",
    });
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "http://localhost:8080/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const imageUrl = response.data.imageUrl; // Should be something like 'https://res.cloudinary.com/your-cloud-name/...'
  
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Image upload failed");
    }
  };

  // const handleAddNewListing = async () => {
  //   try {
  //     // Log the newListing object to ensure it has valid data
  //     console.log("Sending new listing:", newListing);

  //     // Make a POST request to the API
  //     const response = await axios.post(
  //       "http://localhost:8080/api/listings",
  //       newListing
  //     );

  //     // Ensure format consistency with existing listings
  //     const addedListing = {
  //       ...response.data,
  //       image: { url: newListing.image }, // Treat image as an object
  //     };

  //     // Update listings with the new listing
  //     setListings([...listings, addedListing]);

  //     // Display success message
  //     alert("New listing added successfully!");

  //     // Reset form fields and hide the form
  //     handleCloseAddForm();
  //   } catch (err) {
  //     // Log the error response for debugging
  //     console.error("Error adding new listing:", err);

  //     // Display an appropriate error message
  //     if (err.response) {
  //       alert(`Failed to add new listing: ${err.response.data.message}`);
  //     } else {
  //       alert(
  //         "Failed to add new listing. Please check the server or your network connection."
  //       );
  //     }
  //   }
  // };

  
  const handleAddNewListing = async () => {
    try {
      // Prepare form data
      const { title, description, image, price, guests, category, location, country, username } = newListing;
  
      const lowercaseCategory = category.toLowerCase();
      const imageUrl = await handleFileUpload(image);

      // If the image is provided, append it as well
      await axios.post("http://localhost:8080/api/listings", {
        title,
        description,
        price,
        location,
        country,
        guests,
        username,
        category: lowercaseCategory,
        imageUrl, // Use imageUrl here
      });
  
      // Add the new listing to the state
      // setListings([...listings, response.data]);
  
      // Display success message
      alert("New listing added successfully!");
      handleCloseAddForm(); // Close the form after successful submission
    } catch (err) {
      console.error("Error adding listing:", err);
      alert("Failed to add listing.");
    }
  };
  
  

  // Handle Input Change for New Listing
  const handleNewListingChange = (e) => {
    const { name, value, files  } = e.target;
    if (files) {
      setNewListing({ ...newListing, [name]: files[0] });
    } else {
      setNewListing({ ...newListing, [name]: value });
    }
  };

  // Handle Edit Button Click
  const handleEdit = (listing) => {
    setEditId(listing._id); // Set the row being edited
    setEditableListing({ ...listing }); // Load the row data into editable form
  };

  // Handle Save Button Click
  const handleSave = async (id) => {
    try {
      let imageUrl  = editableListing.image;

      if (editableListing.image instanceof File) {
        imageUrl = await handleFileUpload(editableListing.image);
      }

      const updatedListing = { ...editableListing, imageUrl };

      await axios.put(
        `http://localhost:8080/api/listings/${id}`,
        updatedListing,
        {
          withCredentials: true, // Include cookies for authentication if required
        }
      );
      alert("Listing updated successfully!");

      const updatedListings = listings.map((item) =>
        item._id === id ? updatedListing : item
      );
      setListings(updatedListings);

      setEditId(null);
    } catch (err) {
      console.error("Error updating listing:", err);
      alert("Failed to update listing.");
    }
  };

  // Handle Input Change
  // const handleChange = (e) => {
  //   const { name, value, files } = e.target;
  //   if (files) {
  //     setEditableListing({ ...editableListing, [name]: files[0] });
  //     setNewListing((prevListing) => ({
  //       ...prevListing,
  //       [name]: files[0], // Store the file object
  //     }));
  //   } else {
  //     setEditableListing({ ...editableListing, [name]: value });
  //     setNewListing((prevListing) => ({
  //       ...prevListing,
  //       [name]: value,
  //     }));
  //   }
  // };

  const handleChange = (e) => {
  const { name, value, files } = e.target;
  if (files && files.length > 0) {
    setEditableListing({ ...editableListing, [name]: files[0] });
  } else {
    setEditableListing({ ...editableListing, [name]: value });
  }
};


  // Handle delete
  const handleDelete = async (id) => {
    try {
      // Send DELETE request to server
      await axios.delete(`http://localhost:8080/api/listings/${id}`);
      alert("Listing deleted successfully!");

      // Update listings state to remove the deleted item
      const updatedListings = listings.filter((item) => item._id !== id);
      setListings(updatedListings); // Update state to reflect changes
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Failed to delete listing.");
    }
  };

  return (
    <div>
      <MainNavbar />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Add New Listing Button */}
      <div className="container" style={{ marginTop: "20px" }}>
        <button className="btn btn-primary mb-3" onClick={handleOpenAddForm}>
          Add New Home
        </button>

        {/* Add New Listing Form - Conditionally Rendered */}
        {isAddFormVisible && (
          <div className="form-overlay">
            <div className="form-container" style={{ marginTop: "0px" }}>
          <div className="add-listing-form">
            <h3>Add Your Home Details</h3>
            <div className="row">
            <div class="mb-3">
                <label for="Input1" class="form-label">
                  Username
                </label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={newListing.username}
                onChange={handleNewListingChange}
                // className="form-control mb-2"
                 class="form-control"
                  id="Input1"
                  style={{ width: "500px" }}
                  required
              />
              <div class="valid-feedback">Title should be good!</div>
              </div>
              <div class="mb-3">
                <label for="Input1" class="form-label">
                  Title
                </label>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={newListing.title}
                onChange={handleNewListingChange}
                class="form-control"
                id="Input1"
                style={{ width: "500px" }}
                required
              />
              <div class="valid-feedback">Title should be good!</div>
              </div>
              <div class="mb-3">
                <label for="Textarea1" class="form-label">
                  Description
                </label>
              <textarea 
                name="description"
                placeholder="Description"
                value={newListing.description}
                onChange={handleNewListingChange}
                class="form-control"
                id="Input1"
                style={{ width: "500px" }}
                required
              />
              <div class="invalid-feedback">
                  Please enter short description!
                </div>
              </div>
              <div class="mb-3">
                <label for="Input1" class="form-label">
                  Price
                </label>
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={newListing.price}
                onChange={handleNewListingChange}
                class="form-control"
                id="Input1"
                style={{ width: "500px" }}
                required
              />
              <div class="invalid-feedback">Please enter price!</div>
              </div>
              <div class="mb-3">
                <label for="Input1" class="form-label">
                  Upload House Image
                </label>
              <input
                type="file"
                name="image"
                placeholder="Image"
                // value={newListing.image}
                onChange={handleNewListingChange}
                class="form-control"
                id="Input1"
                style={{ width: "500px" }}
                required
              />
              </div>
              <div class="mb-3">
                <label for="Input1" class="form-label">
                  Location
                </label>
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={newListing.location}
                onChange={handleNewListingChange}
                class="form-control"
                id="Input1"
                style={{ width: "500px" }}
                required
              />
              <div class="mb-3">
                <label for="options" class="form-label">
                  Property category
                </label>
                <select
                  class="form-select"
                  id="form-select"
                  style={{ width: "500px" }}
                  name="category"
                  value={newListing.category} // Bind the value to the state
                  onChange={handleNewListingChange} // Update the state when the value changes
                  aria-label="Default select example"
                  required
                >
                  <option value="trending" selected>
                    Trending
                  </option>
                  <option value="home">Home</option>
                  <option value="desert">Desert</option>
                  <option value="lake">Lake</option>
                  <option value="camping">Camping</option>
                  <option value="nationalPark">NationalPark</option>
                  <option value="lakeFort">LakeFort</option>
                  <option value="farms">Farms</option>
                  <option value="island">Island</option>
                  <option value="treeHouse">TreeHouse</option>
                  <option value="beach">Beach</option>
                  <option value="beschFront">BeschFront</option>
                  <option value="tropical">Tropical</option>
                  <option value="cave">Cave</option>
                  <option value="domes">Domes</option>
                  <option value="towers">Towers</option>
                  <option value="houseboat">Houseboat</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="Input1" class="form-label">
                  Guests
                </label>
              <input
                type="number"
                name="guests"
                placeholder="guests"
                value={newListing.guests}
                onChange={handleNewListingChange}
                class="form-control"
                id="Input1"
                style={{ width: "500px" }}
                required
              />
              <div class="invalid-feedback">Please enter guests!</div>
              </div>
              </div>
              <div class="mb-3">
                <label for="Input1" class="form-label">
                  Country
                </label>
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={newListing.country}
                onChange={handleNewListingChange}
                class="form-control"
                id="Input1"
                style={{ width: "500px" }}
                required
              />
              <div class="invalid-feedback">Please enter country name!</div>
              </div>
            </div>
            <div>
              <button
                className="btn btn-success me-2"
                onClick={handleAddNewListing}
              >
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCloseAddForm}
              >
                Cancel
              </button>
            </div>
          </div>
          </div>
          </div>
        )}

        {/* Sidebar Toggle Button */}
        {/* <button className="menu-btn" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button> */}

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Listings Table */}
        <div className="container">
  <h2 style={{marginTop: "0px"}}>Listings</h2>
  <table className="table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Description</th>
        <th>Price</th>
        <th>Image</th>
        <th>category</th>
        <th>Guests</th>
        <th>Location</th>
        <th>Country</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {listings.map((listing) => (
        <tr key={listing._id}>
          {/* Title */}
          <td>
            {editId === listing._id ? (
              <input
                type="text"
                name="title"
                value={editableListing.title}
                onChange={handleChange}
              />
            ) : (
              listing.title
            )}
          </td>
          {/* Description */}
          <td>
            {editId === listing._id ? (
              <textarea
                name="description"
                value={editableListing.description}
                onChange={handleChange}
                className="description"
              />
            ) : (
              listing.description
            )}
          </td>
          {/* Price */}
          <td>
            {editId === listing._id ? (
              <input
                type="number"
                name="price"
                value={editableListing.price}
                onChange={handleChange}
              />
            ) : (
              `${listing.price} / day`
            )}
          </td>
          {/* Image */}
          <td>
            {editId === listing._id ? (
              <input
                type="file"
                name="image"
                onChange={handleChange}
              />
            ) : (
              <img src={listing.image} alt="Listing" width="50" />
            )}
          </td>
            {/* Category */}
          <td>
            {editId === listing._id ? (
              <input
                type="text"
                name="category"
                value={editableListing.category}
                onChange={handleChange}
              />
            ) : (
              listing.category
            )}
          </td>

          <td>
            {editId === listing._id ? (
              <input
                type="number"
                name="guests"
                value={editableListing.guests}
                onChange={handleChange}
              />
            ) : (
              listing.guests
            )}
          </td>
          {/* Location */}
          <td>
            {editId === listing._id ? (
              <input
                type="text"
                name="location"
                value={editableListing.location}
                onChange={handleChange}
              />
            ) : (
              listing.location
            )}
          </td>
          {/* Country */}
          <td>
            {editId === listing._id ? (
              <input
                type="text"
                name="country"
                value={editableListing.country}
                onChange={handleChange}
              />
            ) : (
              listing.country
            )}
          </td>
          {/* Actions */}
          <td>
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
                  onClick={() => handleDelete(listing._id)}
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
    
  );
};

export default AdminListings;
