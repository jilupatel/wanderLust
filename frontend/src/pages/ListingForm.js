import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MainBoilerplate from "../components/layout/MainBoilerplate.js";
import AuthGuard from "../guard/AuthGuard.js";

const ListingForm = ({ isEdit }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState({
    title: "",
    description: "",
    image: "",
    price: "",
    location: "",
    country: "",
    category: "",
    guests: "",
    username: localStorage.getItem("username") || "",
  });
  console.log(listing);
  useEffect(() => {
    if (isEdit) {
      const fetchListing = async () => {
        const response = await axios.get(
          `http://localhost:8080/api/listings/${id}`
        );
        setListing(response.data);
      };
      fetchListing();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setListing((prev) => ({
        ...prev,
        image: files[0], // Store the file object
      }));
    } else {
      setListing((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "http://localhost:8080/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Make sure the image URL is directly from Cloudinary
      const imageUrl = response.data.imageUrl; // Should be something like 'https://res.cloudinary.com/your-cloud-name/...'

      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Image upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      title,
      description,
      image,
      price,
      location,
      category,
      guests,
      country,
      username,
    } = listing;

    // Upload the image first
    const imageUrl = await handleFileUpload(image); // This gets the image URL from Cloudinary

    // Add the imageUrl to the data sent to the backend
    try {
      if (isEdit) {
        await axios.put(`http://localhost:8080/api/listings/${id}`, {
          ...listing,
          imageUrl,
        });
      } else {
        await axios.post("http://localhost:8080/api/listings", {
          title,
          description,
          price,
          location,
          category,
          guests,
          country,
          username,
          imageUrl, // Use imageUrl here
        });
      }
      navigate("/listings");
    } catch (err) {
      console.error("Error saving listing:", err);
    }
  };

  return (
    <MainBoilerplate>
      <AuthGuard>
        <div>
          <h1>{isEdit ? "Edit Listing" : "Create a New Listing"}</h1>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div class="addnew">
              <div class="mb-3">
                <label for="Input1" class="form-label">
                  Title
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="Input1"
                  name="title"
                  className="form-control"
                  value={listing.title}
                  onChange={handleChange}
                  placeholder="Title"
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
                  class="form-control"
                  id="Textarea1"
                  rows="3"
                  value={listing.description}
                  onChange={handleChange}
                  placeholder="Description"
                  style={{ borderColor: "#000", width: "500px" }}
                  required
                ></textarea>
                <div class="invalid-feedback">
                  Please enter short description!
                </div>
              </div>
              <div class="mb-3">
                <label for="Input1" class="form-label">
                  Upload House Image
                </label>
                <input
                  type="file"
                  name="image"
                  class="form-control"
                  id="Input1"
                  style={{ width: "500px" }}
                  onChange={handleChange}
                  placeholder="Upload Listing Image"
                  required
                />
              </div>
        {/* <img src={formData.profilePicture} alt="Profile" width="100" /> */}
              <div class="mb-3">
                <label for="Input1" class="form-label">
                  Price
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="Input1"
                  style={{ width: "500px" }}
                  name="price"
                  value={listing.price}
                  onChange={handleChange}
                  placeholder="Price"
                  required
                />
                <div class="invalid-feedback">Please enter price!</div>
              </div>
              <div class="mb-3">
                <label for="options" class="form-label">
                  Property category
                </label>
                <select
                  class="form-select"
                  id="form-select"
                  style={{ width: "500px" }}
                  name="category"
                  value={listing.category} // Bind the value to the state
                  onChange={handleChange} // Update the state when the value changes
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
                Number of Guests Allowed
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="Input1"
                  style={{ width: "500px" }}
                  name="guests"
                  value={listing.guests}
                  onChange={handleChange}
                  placeholder="number of guests"
                  required
                />
                </div>
              <div class="mb-3">
                <label for="Input1" class="form-label">
                  Location
                </label>
                <input
                  type="text"
                  style={{ width: "500px" }}
                  className="form-control"
                  name="location"
                  value={listing.location}
                  onChange={handleChange}
                  placeholder="Location"
                  required
                />
                <div class="invalid-feedback">Please enter Location!</div>
              </div>
              <div class="mb-3">
                <label for="Input1" class="form-label">
                  Country
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="country"
                  style={{ width: "500px" }}
                  value={listing.country}
                  onChange={handleChange}
                  placeholder="Country"
                  required
                />
                <div class="invalid-feedback">Please enter country name!</div>
              </div>
              <div class="col-auto">
                <button class="btn btn-secondary mb-3" type="submit">
                  {isEdit ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </AuthGuard>
    </MainBoilerplate>
  );
};

export default ListingForm;
