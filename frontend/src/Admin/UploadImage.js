import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/layout/MainNavbar";
import axios from "axios";

const UploadImage = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [listingId, setListingId] = useState(null);
  const [images, setImages] = useState([]);
  const [imageDescriptions, setImageDescriptions] = useState([]);
  const [fetchedImages, setFetchedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const navigate = useNavigate();

  // Fetch images for the listingId when it is set
  useEffect(() => {
    if (listingId) {
      fetchImages(listingId);
    }
  }, [listingId]);

  const fetchImages = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/listings/${id}/images`);
      if (response.status === 200) {
        setFetchedImages(response.data); // Set the fetched images
      } else {
        console.error("Failed to fetch images.");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get("http://localhost:8080/api/listings");
      const listings = response.data;

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
        fetchImages(existingListing._id); // Fetch images for the found listing
      } else {
        setMessage("No matching listing found");
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const handleUploadImages = async () => {
    if (images.length === 0) {
      alert("Please select at least one image to upload.");
      return;
    }

    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });
    formData.append("descriptions", JSON.stringify(imageDescriptions));

    try {
      const response = await axios.post(
        `http://localhost:8080/api/listings/${listingId}/images`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 201) {
        alert("Images uploaded successfully!");
        setImages([]);
        setImageDescriptions([]);
        fetchImages(listingId); // Refresh images after upload
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images.");
    }
  };

  const handleNext = () => {
    const nextIndex = (currentImageIndex + 1) % fetchedImages.length;
    setCurrentImageIndex(nextIndex);
  
    // Disable next button if the last image is in the 3rd position
    setIsNextDisabled(nextIndex + 3 >= fetchedImages.length);
    // Enable previous button when moving forward
    setIsPrevDisabled(false);
  };
  
  const handlePrev = () => {
    const prevIndex = currentImageIndex === 0 ? fetchedImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
  
    // Disable previous button if the first image is in the 1st position
    setIsPrevDisabled(prevIndex === 0);
    // Enable next button when moving backward
    setIsNextDisabled(false);
  };

  return (
    <div>
      <MainNavbar />
      <div style={{ marginBottom: "200px" }}>
        <div style={{ marginTop: "30px" }} className="form-container">
          <h1>Upload Images</h1>
          <form onSubmit={handleSubmit}>
            {["Title", "Location", "Category", "Country"].map((field) => (
              <div className="mb-3" key={field}>
                <label htmlFor={`Input-${field}`} className="form-label">{`${field}:`}</label>
                <input
                  type="text"
                  value={eval(field.toLowerCase())}
                  onChange={(e) => eval(`set${field}(e.target.value)`)}
                  className="form-control"
                  placeholder={field}
                  id={`Input-${field}`}
                  style={{ width: "500px", marginLeft: "0px" }}
                  required
                />
              </div>
            ))}
            <div className="col-auto">
              <button className="btn btn-secondary mb-3" type="submit" style={{ background: "green" }}>
                Check Listing
              </button>
            </div>
          </form>
        </div>

        {message && <p>{message}</p>}

        {listingId && (
          <div>
            <div className="image-upload-section">
              <h4>Upload Images</h4>
              <input
                type="file"
                multiple
                style={{ display: "flex", justifyContent: "center", width: "100%"}}
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setImages(files);
                  setImageDescriptions(new Array(files.length).fill(""));
                }}
              />
              {images.map((image, index) => (
                <div key={index} className="image-upload-item">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Uploaded ${index}`}
                    style={{ width: "100px", height: "100px" }}
                  />
                  <textarea
                    placeholder="Image description"
                    value={imageDescriptions[index]}
                    onChange={(e) => {
                      const newDescriptions = [...imageDescriptions];
                      newDescriptions[index] = e.target.value;
                      setImageDescriptions(newDescriptions);
                    }}
                  />
                </div>
              ))}
              <button
                onClick={handleUploadImages}
                style={{
                  backgroundColor: "teal",
                  color: "white",
                  padding: "10px",
                  marginTop: "10px",
                }}
              >
                Upload Images
              </button>
            </div>

            {fetchedImages.length > 0 && (
              <div className="image-carousel" style={{ marginTop: "30px" }}>
                <h4 style={{display: "flex",alignItems: "center", justifyContent: "center"}}>Existing Images for this Listing</h4>
                <div className="carousel-container">
                  {fetchedImages.length > 3 && (
                    <button
                      onClick={handlePrev}
                      className="carousel-arrow left"
                      disabled={isPrevDisabled}
                      style={{color:"black", marginLeft:"400px"}}
                    >
                     <i class="fa-solid fa-less-than" style={{color:"black"}}></i>
                    </button>
                  )}
                  <div className="image-row" style={{ display: "flex", gap: "10px" }}>
                    {fetchedImages
                      .slice(currentImageIndex, currentImageIndex + 3)
                      .map((image, index) => (
                        <div key={index} className="image-item">
                          <img
                            src={image.url}
                            alt={`Listing ${index}`}
                            style={{ width: "300px", height: "200px" }}
                          />
                          <p style={{ textAlign: "center", marginTop: "10px" }}>
                            {image.description || "No description"}
                          </p>
                        </div>
                      ))}
                  </div>
                  {fetchedImages.length > 3 && (
                    <button
                      onClick={handleNext}
                      className="carousel-arrow right"
                      disabled={isNextDisabled}
                      style={{color:"black", marginRight:"400px"}}
                    >
                      <i class="fa-solid fa-greater-than" style={{color:"black"}}></i>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="fixed-footer">
        <div className="footer">
          <div className="f-info">
            <div className="f-info-socials">
              {["facebook", "twitter", "instagram", "linkedin"].map((platform) => (
                <a href="#" key={platform}>
                  <i className={`fa-brands fa-square-${platform}`}></i>
                </a>
              ))}
            </div>
            <div>&copy; WanderLust Private Limited</div>
            <div className="f-info-links">
              <a href="/privacy">Privacy</a>
              <a href="/term">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UploadImage;
