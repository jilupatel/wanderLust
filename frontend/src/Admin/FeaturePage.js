import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/layout/MainNavbar";

const FeaturePage = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [listingId, setListingId] = useState(null);
  const [mainTitle, setMainTitle] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [features, setFeatures] = useState([]);
  const navigate = useNavigate();

  // Fetch features for the listing
  const fetchFeatures = async (listingId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/listings/${listingId}/features`
      );
      if (response.ok) {
        const data = await response.json();
        // console.log("Fetched features:", data);
        setFeatures(data); // Set the fetched features
      } else {
        console.error("Failed to fetch features");
      }
    } catch (error) {
      console.error("Error fetching features:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/listings");
      const listings = await response.json();

      const existingListing = listings.find(
        (listing) =>
          listing.title === title &&
          listing.location === location &&
          listing.category === category &&
          listing.country === country
      );

      if (existingListing) {
        setMessage("Home is present");
        setListingId(existingListing._id);
        fetchFeatures(existingListing._id);
      } else {
        setMessage("No matching listing found");
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const handleAddFeature = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:8080/api/listings/${listingId}/features`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mainTitle, name, description }),
        }
      );

      if (response.ok) {
        alert("Feature added successfully");
        // Clear the form fields but keep the form open
        setMainTitle("");
        setName("");
        setDescription("");
        fetchFeatures(listingId); // Refresh the features list
      } else {
        alert("Failed to add feature");
      }
    } catch (error) {
      console.error("Error adding feature:", error);
    }
  };

  const handleDeleteFeature = async (featureId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/listings/${listingId}/features/${featureId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Feature deleted successfully");
        setFeatures(features.filter((feature) => feature._id !== featureId)); // Remove feature from state
      } else {
        alert("Failed to delete feature");
      }
    } catch (error) {
      console.error("Error deleting feature:", error);
    }
  };

  const handleCancel = () => {
    // Reset form fields and hide the form
    setMainTitle("");
    setName("");
    setDescription("");
    setShowForm(false);
  };

  // Group features by mainTitle
  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.mainTitle]) {
      acc[feature.mainTitle] = [];
    }
    acc[feature.mainTitle].push(feature);
    return acc;
  }, {});

  return (
    <div>
      <MainNavbar />
      <div style={{ marginBottom: "200px" }}>
        <div style={{ marginTop: "30px" }} className="form-container">
          <h1>Add Feature</h1>
          <form onSubmit={handleSubmit}>
            <div class="mb-3">
              <label for="Input1" class="form-label">
                Title:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-control"
                placeholder="Title"
                id="Input1"
                style={{ width: "500px", marginLeft: "0px" }}
                required
              />
            </div>
            <div class="mb-3">
              <label for="Input1" class="form-label">
                Location:
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-control"
                placeholder="Location"
                id="Input1"
                style={{ width: "500px", marginLeft: "0px" }}
                required
              />
            </div>
            <div class="mb-3">
              <label for="Input1" class="form-label">
                Category:
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-control"
                placeholder="category"
                id="Input1"
                style={{ width: "500px", marginLeft: "0px" }}
                required
              />
            </div>
            <div class="mb-3">
              <label for="Input1" class="form-label">
                Country:
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="form-control"
                placeholder="Country"
                id="Input1"
                style={{ width: "500px", marginLeft: "0px" }}
                required
              />
            </div>
            <div class="col-auto">
              <button
                style={{ background: "green" }}
                className="btn btn-secondary mb-3"
                type="submit"
              >
                Check Listing
              </button>
            </div>
          </form>
        </div>

        {message && <p>{message}</p>}

        {listingId && (
          <div
            className="flex flex-col items-center justify-center border rounded shadow-md w-96"
            style={{ padding: "0px" }}
          >
            <h2
              className="justify-center text-xl font-bold mb-2"
              style={{ padding: "0px", marginTop: "20px", textAlign: "center" }}
            >
              Feature Manager
            </h2>

            <button
              onClick={() => setShowForm(!showForm)} // Toggle form visibility
              style={{ background: "#dc3545", marginLeft: "900px", marginBottom: "80px" }}
            >
              {showForm ? "Add Feature" : "Add Feature"}
            </button>

            {showForm && (
              <div style={{ marginTop: "10px" }} className="form-container">
                <form onSubmit={handleAddFeature}>
                  <div class="mb-3">
                    <label for="Input1" class="form-label">
                      Main Title:
                    </label>
                    <input
                      type="text"
                      value={mainTitle}
                      onChange={(e) => setMainTitle(e.target.value)}
                      className="form-control"
                      placeholder="Main Title"
                      id="Input1"
                      style={{ width: "500px", marginLeft: "0px" }}
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="Textarea1" class="form-label">
                      Name:
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name"
                      id="Input1"
                      style={{ width: "500px" }}
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="Input1" class="form-label">
                      Description:
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      // required
                      className="form-control"
                      placeholder="Description"
                      id="Input1"
                      style={{ width: "500px" }}
                    />
                  </div>
                  <div>
                    <button type="submit">Save</button>
                    <button
                      type="button" // Ensure it doesn't submit the form
                      onClick={handleCancel}
                      style={{ marginLeft: "10px", background: "#6c757d" }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Display grouped features */}
        <h4 style={{ marginLeft: "80px" }}>What this place offers</h4>
        {Object.keys(groupedFeatures).length > 0 ? (
          Object.entries(groupedFeatures).map(([mainTitle, features]) => (
            <div key={mainTitle} style={{ marginLeft: "80px" }}>
              <strong>{mainTitle}:</strong>
              {/* <ul>
        {features.map((feature, index) => (
          <li key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
            {feature.name}: {feature.description}
            <i
              className="fa-sharp fa-solid fa-trash"
              style={{ color: "red", cursor: "pointer", marginLeft: "10px" }}
              onClick={() => handleDeleteFeature(feature._id)} // Call delete function
            ></i>          
          </li>

        ))}
      </ul> */}
              <ul>
                {features.map((feature, index) => (
                  <React.Fragment key={index}>
                    <li
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 0",
                      }}
                    >
                      {feature.name}: {feature.description}
                      <i
                        className="fa-sharp fa-solid fa-trash"
                        style={{
                          color: "red",
                          cursor: "pointer",
                          marginLeft: "10px",
                        }}
                        onClick={() => handleDeleteFeature(feature._id)}
                      ></i>
                    </li>
                    <hr style={{ width: "100%", border: "1px solid #ccc" }} />
                  </React.Fragment>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No features added yet.</p>
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
    </div>
  );
};

export default FeaturePage;
