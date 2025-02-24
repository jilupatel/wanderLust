import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainBoilerplate from "../../components/layout/MainBoilerplate.js";
import AuthGuard from "../../guard/AuthGuard.js";
import axios from "axios";
import "../styles/ListingPage.css";
import "../styles/ListDetail.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ReservationForm from "../../pages/ReservationForm.js";
import Footer from "../../components/layout/Footer.js";

const ListingDetail = () => {
  const [userInfo, setUserInfo] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [editingRating, setEditingRating] = useState(null);
  const [editRatingValue, setEditRatingValue] = useState(0);
  const [editRatingDescription, setEditRatingDescription] = useState("");
  const [listing, setListing] = useState(null);
  const [currentUser, setCurrentUser] = useState("");
  const [reservations, setReservations] = useState([]);
  const [features, setFeatures] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [newFeature, setNewFeature] = useState({
    mainTitle: "",
    name: "",
    description: "",
  });
  const [showFormFor, setShowFormFor] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [images, setImages] = useState([]);
  const [imageDescriptions, setImageDescriptions] = useState([]);
  const [showAllImages, setShowAllImages] = useState(false);

  const username = localStorage.getItem("username");

  useEffect(() => {
    // Fetch user information from the backend when the component mounts
    const fetchUserInfo = async () => {
      if (!username) {
        alert("No username found. Please log in.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8080/api/user/${username}`
        );
        if (response.status === 200) {
          setUserInfo(response.data); // Assuming the backend returns user data as JSON
        }
      } catch (error) {
        console.error("Error fetching user information:", error);
        alert("Failed to fetch user information. Please try again.");
      }
    };

    fetchUserInfo();
  }, [username]);

  console.log("current mailid:", userInfo.email);
  // Start editing a rating
  const startEditRating = (rating) => {
    setEditingRating(rating._id);
    setEditRatingValue(rating.rating);
    setEditRatingDescription(rating.description);
  };

  const handleGalleryImages = async () => {
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
        `http://localhost:8080/api/listings/${id}/gallery`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        alert("Images uploaded successfully!");
        setImages([]);
        setImageDescriptions([]);
        fetchListing(); // Refresh the listing data to show the new images
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images.");
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
        `http://localhost:8080/api/listings/${id}/images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        alert("Images uploaded successfully!");
        setImages([]);
        setImageDescriptions([]);
        fetchListing(); // Refresh the listing data to show the new images
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images.");
    }
  };

  const handleNext = () => {
    const nextIndex = (currentImageIndex + 1) % listing.images.length;
    setCurrentImageIndex(nextIndex);

    // Disable next button if the last image is in the 3rd position
    setIsNextDisabled(nextIndex + 3 >= listing.images.length);
    // Enable previous button when moving forward
    setIsPrevDisabled(false);
  };

  const handlePrev = () => {
    const prevIndex =
      currentImageIndex === 0
        ? listing.images.length - 1
        : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);

    // Disable previous button if the first image is in the 1st position
    setIsPrevDisabled(prevIndex === 0);
    // Enable next button when moving backward
    setIsNextDisabled(false);
  };

  // Edit Rating
  const saveEditRating = async () => {
    if (editRatingValue === 0) {
      alert("Please select a rating.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/listings/${id}/ratings/${editingRating}`, // Updated endpoint
        {
          rating: editRatingValue,
          description: editRatingDescription,
        }
      );

      // Update the listing state with the edited rating
      setListing((prev) => ({
        ...prev,
        ratings: prev.ratings.map((rating) =>
          rating._id === editingRating
            ? {
                ...rating,
                rating: editRatingValue,
                description: editRatingDescription,
              }
            : rating
        ),
      }));

      // Reset editing state
      setEditingRating(null);
      setEditRatingValue(0);
      setEditRatingDescription("");
      alert("Rating updated successfully!");
    } catch (err) {
      console.error("Error updating rating:", err.message);
      alert("Failed to update rating.");
    }
  };

  // Delete Rating
  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm("Are you sure you want to delete this rating?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8080/listings/${id}/ratings/${ratingId}` // Updated endpoint
      );

      // Update the listing state by removing the deleted rating
      setListing((prev) => ({
        ...prev,
        ratings: prev.ratings.filter((rating) => rating._id !== ratingId),
      }));

      alert("Rating deleted successfully!");
    } catch (err) {
      console.error("Error deleting rating:", err.message);
      alert("Failed to delete rating.");
    }
  };

  // Rating state
  const [rating, setRating] = useState(0);
  const [ratingDescription, setRatingDescription] = useState("");

  // Handle rating change
  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  // Handle adding a rating
  const handleAddRating = async () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/listings/${id}/ratings`,
        {
          username: currentUser,
          rating,
          description: ratingDescription,
        }
      );

      // Update the listing state to include the new rating
      setListing((prev) => ({
        ...prev,
        ratings: [...(prev.ratings || []), response.data],
      }));

      // Reset the rating and description fields
      setRating(0);
      setRatingDescription("");
      alert("Rating added successfully!");
    } catch (err) {
      console.error("Error adding rating:", err.message);
      alert("Failed to add rating. Please try again.");
    }
  };

  const groupedFeatures = listing?.features?.reduce((acc, feature) => {
    if (!acc[feature.mainTitle]) {
      acc[feature.mainTitle] = [];
    }
    acc[feature.mainTitle].push(feature); // Add the feature to the corresponding mainTitle group
    return acc;
  }, {});
  const handleAddMainFeature = async () => {
    if (
      !newFeature.mainTitle.trim() ||
      !newFeature.name.trim() ||
      !newFeature.description.trim()
    )
      return;

    try {
      // Make API call to add the feature to the database
      const response = await axios.post(
        `http://localhost:8080/api/listings/${id}/features`,
        {
          mainTitle: newFeature.mainTitle,
          name: newFeature.name,
          description: newFeature.description,
        }
      );

      // On success, update the UI to reflect the new feature
      setFeatures([
        ...features,
        {
          mainTitle: newFeature.mainTitle,
          subFeatures: [
            { name: newFeature.name, description: newFeature.description },
          ],
        },
      ]);
      setNewFeature({ mainTitle: "", name: "", description: "" });

      alert("Feature added successfully!");
    } catch (err) {
      console.error("Error adding feature:", err.message);
      alert("Failed to add feature.");
    }
  };

  const handleAddSubFeature = async (mainTitle) => {
    if (!newFeature.name.trim() || !newFeature.description.trim()) return;

    try {
      // Make the API request to add the sub-feature
      const response = await axios.post(
        `http://localhost:8080/api/listings/${id}/features`,
        {
          mainTitle: mainTitle,
          name: newFeature.name,
          description: newFeature.description,
        }
      );

      setFeatures(
        features.map((feature) =>
          feature.mainTitle === mainTitle
            ? {
                ...feature,
                subFeatures: [
                  ...feature.subFeatures,
                  {
                    name: newFeature.name,
                    description: newFeature.description,
                  },
                ],
              }
            : feature
        )
      );
      setNewFeature({ mainTitle: "", name: "", description: "" });
      setShowFormFor(null);
      alert("Sub-feature added successfully!");
    } catch (err) {
      console.error("Error adding sub-feature:", err.message);
      alert("Failed to add sub-feature.");
    }
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/current-user"
      );
      setCurrentUser(response.data.username); // Assuming the API returns { username: 'user1' }
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  // Fetch listing details
  const fetchListing = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/listings/${id}`
      );
      // console.log("API Response:", response.data);
      setListing(response.data); // Update state with fetched data
    } catch (err) {
      console.error(
        "Error fetching listing details:",
        err.response?.data || err.message
      );
    }
  };

  // Render ratings
  const renderRatings = () => {
    if (!listing?.ratings || listing.ratings.length === 0) {
      return <p>No ratings yet.</p>;
    }

    //   return (
    //     <ul>
    //       {listing.ratings.map((rating, index) => (
    //         <li key={index}>
    //           <strong>{rating.username}:</strong> {rating.rating} stars
    //           <p>{rating.description}</p>
    //         </li>
    //       ))}
    //     </ul>
    //   );
    // };

    // const renderRatings = () => {
    //   if (!listing?.ratings || listing.ratings.length === 0) {
    //     return <p>No ratings yet.</p>;
    //   }

    return (
      <ul className="ratings-list">
        {listing.ratings.map((rating, index) => (
          <li key={index} className="rating-box">
            {editingRating === rating._id ? (
              <div className="edit-rating-form">
                <StarRating
                  rating={editRatingValue}
                  onRatingChange={setEditRatingValue}
                />
                <textarea
                  placeholder="Edit description"
                  value={editRatingDescription}
                  onChange={(e) => setEditRatingDescription(e.target.value)}
                  className="edit-rating-description"
                />
                <div className="edit-rating-actions">
                  <button onClick={saveEditRating} className="save-button">
                    Save
                  </button>
                  <button
                    onClick={() => setEditingRating(null)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="rating-header">
                  <i className="fa-solid fa-user-plus"></i>
                  <span className="username">{rating.username}</span>
                  {rating.username === currentUser && (
                    <div className="rating-actions">
                      <button
                        onClick={() => startEditRating(rating)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRating(rating._id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="star-rating">
                  {[...Array(5)].map((_, starIndex) => (
                    <span
                      key={starIndex}
                      className={`star ${
                        starIndex < rating.rating ? "filled" : ""
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="rating-description">{rating.description}</p>
              </>
            )}
          </li>
        ))}
      </ul>
    );
  };

  const handleDeleteReservation = async (reservationId) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) {
      return;
    }

    try {
      // Send delete request to the server
      const response = await axios.delete(
        `http://localhost:8080/api/reservations/${reservationId}`
      );

      // Check if the reservation was successfully deleted
      if (response.status === 200) {
        // Update the state to remove the deleted reservation
        setReservations((prevReservations) =>
          prevReservations.filter((res) => res._id !== reservationId)
        );
        alert("Reservation deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting reservation:", err.message);
      alert("Failed to delete reservation.");
    }
  };

  //edit reservation
  const handleEditReservation = (reservationId) => {
    navigate(`/reservations/${reservationId}/edit`);
  };

  // Fetch all data on mount
  useEffect(() => {
    fetchCurrentUser();
    fetchListing();
    fetchReservations();
  }, [id]);

  // Handle deleting
  const handleDelete = async (e) => {
    e.preventDefault();
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing?"
    );
    if (!confirmDelete) return;
    try {
      await axios.delete(`http://localhost:8080/api/listings/${id}`);
      navigate("/listings"); // Redirect to listings page
    } catch (err) {
      console.error("Error deleting listing:", err);
    }
  };

  const handleReserve = async () => {
    navigate(`/reserve/${id}`); // Navigate to the reservation form page;
  };

  useEffect(() => {
    if (id) {
      fetchListing(); // Fetch data only if ID is present
      const username = localStorage.getItem("username");
      setCurrentUser(username);
    }
  }, [id]);

  // Fetch reservations for this listing
  const fetchReservations = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/reservations?listingId=${id}`
      );
      setReservations(response.data);
    } catch (err) {
      console.error("Error fetching reservations:", err.message);
    }
  };

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (listing && listing.location) {
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${listing.location}`
          );

          if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);

            if (!isNaN(latitude) && !isNaN(longitude)) {
              // Remove existing map if it exists
              if (mapRef.current) {
                mapRef.current.remove(); // Clean up old map instance
              }

              // Initialize a new map
              const map = L.map("map").setView([latitude, longitude], 13);
              L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                  maxZoom: 19,
                }
              ).addTo(map);

              // Add marker to map
              L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup(listing.location)
                .openPopup();

              // Save map instance to ref
              mapRef.current = map;
            } else {
              console.error("Invalid coordinates:", latitude, longitude);
              alert("Location not found on the map.");
            }
          } else {
            console.error("No results found for this location.");
            alert("No results found for this location.");
          }
        } catch (err) {
          console.error("Error fetching coordinates:", err.message);
          alert("Failed to load map. Please check location or network.");
        }
      }
    };

    fetchCoordinates();
  }, [listing]); // Runs when 'listing' is updated

  if (!listing) {
    return <p>Loading...</p>; // Show loading while data is being fetched
  }

  const startEdit = (reservation) => {
    setEditingReservation(reservation);
  };

  // Save edited reservation
  const saveEdit = async () => {
    try {
      // Send the updated reservation data to the backend
      const updatedReservationData = {
        username: editingReservation.username,
        checkInDate: editingReservation.checkInDate,
        checkOutDate: editingReservation.checkOutDate,
        suggestion: editingReservation.suggestion,
      };

      const response = await axios.put(
        `http://localhost:8080/api/reservations/${editingReservation._id}`,
        updatedReservationData
      );

      // On success, update the state and reset the editing state
      const updatedReservation = response.data.reservation;
      setReservations((prevReservations) =>
        prevReservations.map((res) =>
          res._id === updatedReservation._id ? updatedReservation : res
        )
      );
      setEditingReservation(null); // Reset the editing form
      alert("Reservation updated successfully!");
    } catch (err) {
      console.error("Error updating reservation:", err.message);
      alert("Failed to update reservation.");
    }
  };

  const userReservations = reservations.filter(
    (reservation) => reservation.username === currentUser
  );

  const handleDeleteFeature = async (featureId, mainTitle) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this feature?")) {
      return;
    }

    try {
      // Send delete request to the backend API
      const response = await axios.delete(
        `http://localhost:8080/api/listings/${id}/features/${featureId}`
      );

      // Check if the deletion was successful
      if (response.status === 200) {
        // Update local state by removing the feature from the features array
        setFeatures((prevFeatures) =>
          prevFeatures.map((feature) =>
            feature.mainTitle === mainTitle
              ? {
                  ...feature,
                  subFeatures: feature.subFeatures.filter(
                    (subFeature) => subFeature._id !== featureId
                  ),
                }
              : feature
          )
        );
        alert("Feature deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting feature:", err.message);
      alert("Failed to delete feature.");
    }
  };

  const StarRating = ({ rating, onRatingChange }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <span
              key={starValue}
              className={`star ${
                starValue <= (hoverRating || rating) ? "filled" : ""
              }`}
              onClick={() => onRatingChange(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                cursor: "pointer",
                fontSize: "24px",
                color: starValue <= (hoverRating || rating) ? "gold" : "gray",
              }}
            >
              ★
            </span>
          );
        })}
      </div>
    );
  };

  const handleShowAllImages = () => {
    navigate(`/listings/${id}/gallery`, { state: { images: listing.gallery } });
  };

  const isOwner = currentUser === listing.username;

  return (
    <div className="listing-detail-page">
      <MainBoilerplate>
        {/* <AuthGuard> */}
        <div>
          <h3>Listing Details</h3>
          <ul>
            <li>
              {listing?.image && (
                <div style={{ display: "flex" }}>
                  <div className="image-container">
                    {listing.image.slice(0, 5).map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={listing.title}
                        style={{
                          position: "flex",
                          width: "650px",
                          height: "550px",
                          margin: "5px",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    {listing?.gallery && listing.gallery.length > 0 && (
                      <div className="gallery-section">
                        {/* <h4>Gallery</h4> */}
                        <div
                          className="gallery-container"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                          }}
                        >
                          {listing.gallery
                            .slice(
                              0,
                              showAllImages ? listing.gallery.length : 4
                            )
                            .map((img, index) => (
                              <img
                                key={index}
                                src={img.url}
                                alt={`Gallery ${index}`}
                                style={{
                                  width: "260px",
                                  height: "270px",
                                  margin: "5px",
                                  gap: "0px",
                                }}
                              />
                            ))}
                        </div>
                      </div>
                    )} 
                  </div>
                  <div style={{marginTop:"500px"}}>
                  {listing.gallery.length > 4 && (
                      <button
                      style={{
                        marginTop: "500px",
                        // marginLeft: "-180px",
                        margin: "0px",
                        backgroundColor: "white",
                        border: "1px solid black",
                        color: "black",
                        height:"40px"
                      }}
                        onClick={handleShowAllImages}
                        
                      >
                        {/* <i
                          class="fa-solid fa-grip-dots"
                          style={{ color: "black" }}
                        ></i>{" "} */}
                        Show All Images
                      </button>
                    )}
                    </div>
                </div>
              )}
              
            </li>

            {isOwner && (
              <div className="image-upload-section">
                <p style={{marginTop: "-200px ", marginLeft: "0px", alignItems: "left", justifyContent: "left", position: "flex"}}></p>
                <input
                  type="file"
                  multiple
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
                <button className="upload_gallery" onClick={handleGalleryImages}>Upload Images</button>
              </div>
            )}
            <div className="listing-container">
              <div className="listing-details">
                <li>
                  <strong>
                    <i class="fa-sharp fa-solid fa-user"></i> Ownered By :
                  </strong>{" "}
                  {listing.username} {/* Display the username */}
                </li>
                {/* <hr style={{border: "1px solid #000", width: "100%"}} /> */}
                <hr />
                <li>
                  <strong>
                    <i class="fa-solid fa-house"></i> Place:
                  </strong>{" "}
                  {listing.title}
                </li>
                <hr />
                <li>
                  <strong>
                    <i class="fa-solid fa-users"></i> Total Guests Allow:
                  </strong>{" "}
                  {listing.guests}
                </li>

                <hr />
                <li>
                  <strong>
                    <i class="fa-sharp fa-solid fa-briefcase"></i> About This
                    Place:
                  </strong>{" "}
                  {listing.description}
                </li>

                <hr />
                <li>
                  <strong>
                    <i class="fa-sharp fa-solid fa-hand-holding-dollar"></i>{" "}
                    Price:
                  </strong>{" "}
                  &#8377; {listing.price}
                </li>

                <hr />
                <li>
                  <strong>
                    <i class="fa-solid fa-location-crosshairs"></i> Location:
                  </strong>{" "}
                  {listing.location}
                </li>

                <hr />
                <li>
                  <strong>
                    <i class="fa-solid fa-globe"></i> Country:
                  </strong>{" "}
                  {listing.country}
                </li>
                <hr />

                {isOwner && ( // Show buttons only if usernames match
                  <div
                    style={{
                      display: "flex",
                      marginTop: "0px",
                      marginBottom: "10px",
                      gap: "30px",
                      alignItems: "center",
                    }}
                  >
                    <Link to={`/listings/${id}/edit`}>
                      <button type="button">Edit Info.</button>
                    </Link>
                    <form onSubmit={handleDelete}>
                      <button type="submit">Delete List</button>
                    </form>
                  </div>
                )}
              </div>

              {!isOwner && (
                <div className="reservation-form-container">
                  <ReservationForm />
                </div>
              )}
            </div>
          </ul>
          {(isOwner || (listing?.images && listing.images.length > 0)) && (
            <hr />
          )}
          {isOwner && (
            <div className="image-upload-section">
              <h4>Upload Images</h4>
              <input
                type="file"
                style={{
                  paddingLeft: "500px",
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setImages(files);
                  setImageDescriptions(new Array(files.length).fill("")); // Initialize descriptions
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
          )}
          <br />
          <br />
          {listing?.images && listing.images.length > 0 && (
            <div className="image-carousel">
              <h4>Where you'll sleep</h4>
              <div className="carousel-container">
                {/* Left Arrow */}
                {listing.images.length > 3 && (
                  <button
                    onClick={handlePrev}
                    className="carousel-arrow left"
                    style={{ color: "black" }}
                    disabled={isPrevDisabled}
                  >
                    <i class="fa-solid fa-less-than"></i>
                  </button>
                )}

                {/* Display 3 Images */}
                <div className="image-row">
                  {listing.images
                    .slice(currentImageIndex, currentImageIndex + 3)
                    .map((image, index) => (
                      <div key={index} className="image-item">
                        <img
                          src={image.url}
                          alt={`Listing ${index}`}
                          style={{ width: "300px", height: "200px" }}
                        />
                        <p style={{ textAlign: "center", marginTop: "-10px" }}>
                          {image.description}
                        </p>
                      </div>
                    ))}
                </div>

                {/* Right Arrow */}
                {listing.images.length > 3 && (
                  <button
                    onClick={handleNext}
                    className="carousel-arrow right"
                    style={{ color: "black" }}
                    disabled={isNextDisabled}
                  >
                    <i class="fa-solid fa-greater-than"></i>
                  </button>
                )}
              </div>
            </div>
          )}
          {(isOwner || (listing?.images && listing.images.length > 0)) && (
            <hr />
          )}
          {/* Feature List */}
          <h4>What this place offers</h4>
          {listing?.features && listing.features.length > 0 ? (
            Object.keys(groupedFeatures).map((mainTitle) => (
              <div key={mainTitle}>
                <strong>{mainTitle}:</strong>
                <ul>
                  {groupedFeatures[mainTitle].map((feature, index) => (
                    <li key={index}>
                      {feature.name}: {feature.description}
                      {isOwner && (
                        <i
                          className="fa-solid fa-delete-left"
                          style={{
                            cursor: "pointer",
                            color: "red",
                            marginLeft: "10px",
                          }}
                          onClick={() =>
                            handleDeleteFeature(feature._id, mainTitle)
                          }
                        ></i>
                      )}
                      <hr />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>No features added yet.</p>
          )}
          {/* Feature Adding Form (Only for Owner) */}
          {isOwner && (
            <div
              className="flex flex-col items-center justify-center border rounded shadow-md w-96"
              style={{ padding: "0px" }}
            >
              <h2
                className="justify-center text-xl font-bold mb-2"
                style={{
                  padding: "0px",
                  marginTop: "20px",
                  textAlign: "center",
                }}
              >
                Feature Manager
              </h2>

              {/* Toggle button to open/close the form */}

              <button
                style={{ background: "#dc3545", marginLeft: "500px" }}
                onClick={() =>
                  setShowFormFor(showFormFor === "new" ? null : "new")
                }
                className="bg-blue-500 text-white px-4 py-2 rounded block"
              >
                Add Feature
              </button>

              {showFormFor === "new" && (
                <div className="mt-4 border p-2 rounded">
                  <input
                    type="text"
                    placeholder="Main Title"
                    value={newFeature.mainTitle}
                    onChange={(e) =>
                      setNewFeature({
                        ...newFeature,
                        mainTitle: e.target.value,
                      })
                    }
                    className="block w-full p-2 border rounded mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Feature Name"
                    value={newFeature.name}
                    onChange={(e) =>
                      setNewFeature({ ...newFeature, name: e.target.value })
                    }
                    className="block w-full p-2 border rounded mb-2"
                  />
                  <textarea
                    placeholder="Feature Description"
                    value={newFeature.description}
                    onChange={(e) =>
                      setNewFeature({
                        ...newFeature,
                        description: e.target.value,
                      })
                    }
                    className="block w-full p-2 border rounded mb-2"
                  ></textarea>

                  <div className="flex justify-between">
                    <button
                      onClick={handleAddMainFeature}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowFormFor(null)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <ul className="mt-4">
                {features.map((feature, index) => (
                  <li key={index} className="border p-2 rounded mb-2">
                    <div className="flex justify-between items-center">
                      <strong>{feature.mainTitle}</strong>
                      <button
                        onClick={() => setShowFormFor(feature.mainTitle)}
                        className="bg-gray-300 px-2 py-1 rounded"
                      >
                        +
                      </button>
                    </div>
                    <ul className="ml-4 mt-2">
                      {feature.subFeatures.map((sub, idx) => (
                        <li key={idx} className="text-sm">
                          <strong>{sub.name}</strong>: {sub.description}
                        </li>
                      ))}
                    </ul>
                    {showFormFor === feature.mainTitle && (
                      <div className="mt-2 p-2 border rounded">
                        <input
                          type="text"
                          placeholder="Feature Name"
                          value={newFeature.name}
                          onChange={(e) =>
                            setNewFeature({
                              ...newFeature,
                              name: e.target.value,
                            })
                          }
                          className="block w-full p-2 border rounded mb-2"
                        />
                        <textarea
                          placeholder="Feature Description"
                          value={newFeature.description}
                          onChange={(e) =>
                            setNewFeature({
                              ...newFeature,
                              description: e.target.value,
                            })
                          }
                          className="block w-full p-2 border rounded mb-2"
                        ></textarea>

                        <div className="flex justify-between">
                          <button
                            onClick={() =>
                              handleAddSubFeature(feature.mainTitle)
                            }
                            className="bg-green-500 text-white px-4 py-2 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setShowFormFor(null)}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Rating Section */}
          {!isOwner && (
            <div className="rating-section">
              <h4>Rate this listing</h4>
              <StarRating rating={rating} onRatingChange={handleRatingChange} />
              <textarea
                placeholder="Add a description (optional)"
                value={ratingDescription}
                onChange={(e) => setRatingDescription(e.target.value)}
                className="rating-description"
              />
              <button
                onClick={handleAddRating}
                className="add-rating-button"
                style={{ backgroundColor: "green" }}
              >
                Add Rating
              </button>
            </div>
          )}
          <div id="map" style={{ height: "400px" }}></div> {/* Map container */}
          <br />
          <h4>Reservations Status</h4>
          {userReservations.length === 0 ? (
            <p>No reservations yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Check-In Date</th>
                  <th>Check-Out Date</th>
                  {/* <th>Suggestion</th> */}
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {userReservations.map((reservation) => (
                  <tr key={reservation._id}>
                    {editingReservation?._id === reservation._id ? (
                      <>
                        <td>
                          <input
                            value={editingReservation.username}
                            onChange={(e) =>
                              setEditingReservation({
                                ...editingReservation,
                                username: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            style={{ onClick: "2px solid black" }}
                            value={editingReservation.checkInDate}
                            onChange={(e) =>
                              setEditingReservation({
                                ...editingReservation,
                                checkInDate: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            style={{ onClick: "2px solid black" }}
                            value={editingReservation.checkOutDate}
                            onChange={(e) =>
                              setEditingReservation({
                                ...editingReservation,
                                checkOutDate: e.target.value,
                              })
                            }
                          />
                        </td>
                        {/* <td>
                        <input
                          value={editingReservation.suggestion || ""}
                          onChange={(e) =>
                            setEditingReservation({
                              ...editingReservation,
                              suggestion: e.target.value,
                            })
                          }
                        />
                      </td> */}
                        <td>
                          <button onClick={saveEdit}>Save</button>
                          <button onClick={() => setEditingReservation(null)}>
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{reservation.username}</td>
                        <td>{reservation.checkInDate}</td>
                        <td>{reservation.checkOutDate}</td>
                        <td>{reservation.status || "pending"}</td>

                        {/* <td>{reservation.suggestion || "-"}</td>  */}

                        {/* Conditional rendering of Edit/Delete buttons based on status */}
                        <td>
                          {reservation.status === "pending" ? (
                            <>
                              <button
                                onClick={() => startEdit(reservation)}
                                style={{ backgroundColor: "red" }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteReservation(reservation._id)
                                }
                                style={{ backgroundColor: "green" }}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(reservation)}
                                disabled
                                className="disabled-button"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteReservation(reservation._id)
                                }
                                disabled
                                className="disabled-button"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <br />
          <br />
          {/* Display Ratings */}
          <h4>Ratings</h4>
          {renderRatings()}
        </div>
        <div>
          <ul>
            {/* </AuthGuard> */}
            <div className="listing-container">
              <div
                className="listing-details"
                style={{
                  paddingLeft: "350px",
                  paddingRight: "350px",
                  paddingTop: "50px",
                }}
              >
                <hr />
                {/* Host Profile Section */}
                <h4>Meet Your Host</h4>
                <div className="host-profile-card">
                  {listing.username === currentUser ? (
                    <div className="host-profile-container">
                      <div className="host-left">
                        <Link
                          to={`/host-profile/${listing.username}/${listing._id}`}
                        >
                          <button
                            className="host-profile-button"
                            // style={{ maxWidth: "200px" }}
                          >
                            {listing.hostProfile?.profilePicture ? (
                              <img
                                src={listing.hostProfile.profilePicture}
                                alt="Host"
                                className="host-profile-picture"
                                style={{ width: "100px", height: "100px" }}
                              />
                            ) : (
                              <div className="default-profile-icon">
                                <i className="fas fa-user-circle"></i>
                              </div>
                            )}
                            <span
                              className="host-profile-name"
                              // style={{
                              //   width: "100px",
                              //   height: "100px",
                              //   whiteSpace: "nowrap",
                              // }}
                            >
                              Hosted by{" "}
                              {listing.hostProfile?.name ||
                                "Setup Your Profile"}
                            </span>
                          </button>
                        </Link>
                        <div className="host-profile-bio">
                          {listing.hostProfile?.bio || "Setup Your Profile"}
                        </div>
                      </div>

                      <div className="host-info">
                        <div className="host-contact">
                          <div
                            className="host-profile-email"
                            style={{ marginRight: "500px", marginTop: "70px" }}
                          >
                            {/* <b>Email:</b> */}
                            <i className="fas fa-envelope"></i>{" "}
                            {listing.hostProfile?.email || "Setup Your Profile"}
                          </div>
                          <div className="host-profile-address">
                            <i className="fas fa-map-marker-alt"></i>{" "}
                            {/* <b>Address:</b> */}
                            {listing.hostProfile?.address ||
                              "Setup Your Profile"}
                          </div>
                        </div>
                        <div className="host-stats">
                          <div className="superhost-badge">
                            <i className="fas fa-star"></i>{" "}
                            <b style={{ color: "#000" }}>
                              {listing.hostProfile?.name || "Host"} is a
                              Superhost{" "}
                            </b>
                            <p className="superhost-description">
                              Superhosts are experienced, highly rated hosts who
                              are committed to providing great stays for guests.
                            </p>
                          </div>

                          <button
                            className="message-host-button"
                            disabled={!userInfo.email}
                            onClick={() => {
                              const toEmail = listing.hostProfile?.email || "";
                              const fromEmail = userInfo.email || "";
                              const fromUsername = userInfo.username || "";

                              const subject = encodeURIComponent(
                                "Inquiry about your hosting"
                              );
                              const body = encodeURIComponent(
                                `Hello ${listing.hostProfile?.name},\n\nI am interested in your listing. Please provide more details.\n\nBest regards,\n${fromUsername}`
                              );

                              if (toEmail) {
                                window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
                              } else {
                                alert("Host email not available.");
                              }
                            }}
                          >
                            <i className="fas fa-envelope"></i> Message Host
                          </button>

                          <div className="response-info">
                            <div className="response-rate">
                              <strong>Response rate:</strong> 100%
                            </div>
                            <div className="response-time">
                              <strong>Response time:</strong> Responds within an
                              hour
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="host-profile-container">
                      {/* Left Side - Profile Picture & Bio */}
                      <div className="host-left">
                        <button className="host-profile-button">
                          {listing.hostProfile?.profilePicture ? (
                            <img
                              src={listing.hostProfile.profilePicture}
                              alt="Host"
                              className="host-profile-picture"
                            />
                          ) : (
                            <div className="default-profile-icon">
                              <i className="fas fa-user-circle"></i>
                            </div>
                          )}
                          <span className="host-profile-name">
                            Hosted by{" "}
                            {listing.hostProfile?.name || "Setup Your Profile"}
                          </span>
                        </button>
                        <div className="host-profile-bio">
                          {listing.hostProfile?.bio || "Setup Your Profile"}
                        </div>
                      </div>

                      {/* Right Side - Contact Details */}
                      <div className="host-info">
                        <div className="host-contact">
                          <div
                            className="host-profile-address"
                            style={{ marginRight: "500px", marginTop: "70px" }}
                          >
                            <i className="fas fa-map-marker-alt"></i>{" "}
                            {listing.hostProfile?.address}
                          </div>
                          <div
                            className="host-profile-email"
                            // style={{ marginRight: "500px", marginTop: "70px" }}
                          >
                            <i className="fas fa-envelope"></i>{" "}
                            {listing.hostProfile?.email}
                          </div>
                          <div className="host-stats">
                            <div className="superhost-badge">
                              <i className="fas fa-star"></i>{" "}
                              <b style={{ color: "#000" }}>
                                {listing.hostProfile?.name || "Host"} is a
                                Superhost
                              </b>
                              <p className="superhost-description">
                                Superhosts are experienced, highly rated hosts
                                who are committed to providing great stays for
                                guests.
                              </p>
                            </div>
                            <button
                              className="message-host-button"
                              disabled={!userInfo.email}
                              onClick={() => {
                                const toEmail =
                                  listing.hostProfile?.email || "";
                                const fromEmail = userInfo.email || "";
                                const fromUsername = userInfo.username || "";

                                const subject = encodeURIComponent(
                                  "Inquiry about your hosting"
                                );
                                const body = encodeURIComponent(
                                  `Hello ${listing.hostProfile?.name},\n\nI am interested in your listing. Please provide more details.\n\nBest regards,\n${fromUsername}`
                                );

                                if (toEmail) {
                                  window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
                                } else {
                                  alert("Host email not available.");
                                }
                              }}
                            >
                              <i className="fas fa-envelope"></i> Message Host
                            </button>

                            <div className="response-info">
                              <div className="response-rate">
                                <strong>Response rate:</strong> 100%
                              </div>
                              <div className="response-time">
                                <strong>Response time:</strong> Responds within
                                an hour
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* </div> */}
                </div>
                {/* </div> */}
              </div>
            </div>
          </ul>
        </div>
        <Footer />
      </MainBoilerplate>
    </div>
  );
};

export default ListingDetail;
