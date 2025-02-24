import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "../components/styles/ListingPage.css";
import Boilerplate from "../components/layout/Boilerplate.js";

// Skeleton card component for loading state
const SkeletonCard = () => (
  <>
    <div
      className="card skeleton-card"
      style={{ width: "70rem", padding: "10px", marginBottom: "10px" }}
    >
      <div className="skeleton-image" style={{ height: "200px", background: "#ddd", borderRadius: "10px" }}></div>
      <div className="skeleton-text" style={{ height: "20px", width: "60%", background: "#ddd", margin: "10px 0", borderRadius: "5px" }}></div>
      <div className="skeleton-text" style={{ height: "15px", width: "40%", background: "#ddd", margin: "5px 0", borderRadius: "5px" }}></div>
      <div className="skeleton-text" style={{ height: "15px", width: "30%", background: "#ddd", margin: "5px 0", borderRadius: "5px" }}></div>
    </div>
  </>
);

const AdminListingList = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12); // Number of items to load per page
    const [showPrevious, setShowPrevious] = useState(false);
  const location = useLocation();

  // useEffect(() => {
  //   const fetchListings = async () => {
  //     try {
  //       const queryParams = new URLSearchParams(location.search);
  //       const searchType = queryParams.keys().next().value;
  //       const searchValue = queryParams.get(searchType);
  
  //       let url = "http://localhost:8080/api/listings";
  //       if (searchType && searchValue) {
  //         url += `?${searchType}=${encodeURIComponent(searchValue)}`;
  //       }
  
  //       const response = await axios.get(url, {
  //         withCredentials: true,
  //       });
  //       setListings(response.data);
  //       setFilteredListings(response.data);
  //     } catch (err) {
  //       console.error("Error fetching listings:", err);
  //     }
  //   };
  //   fetchListings();
  // }, [location.search]);

  // useEffect(() => {
  //   const fetchListings = async () => {
  //     try {
  //       const response = await axios.get("http://localhost:8080/api/listings", {
  //         withCredentials: true,
  //       });
  //       setListings(response.data);
  //       setFilteredListings(response.data); // Default to show all listings
  //     } catch (err) {
  //       console.error("Error fetching listings:", err);
  //     }
  //   };
  //   fetchListings();
  // }, []);

  useEffect(() => {
    const fetchListingsAndReservations = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(location.search);
        const checkInDate = queryParams.get("checkInDate") || "";
        const checkOutDate = queryParams.get("checkOutDate") || "";
        const searchType = queryParams.get("searchType") || "title";
        const searchValue = queryParams.get("searchValue") || "";
        const selectedGuests = parseInt(queryParams.get("guests") || "0", 10);

        // Fetch all listings
        const listingsResponse = await axios.get("http://localhost:8080/api/listings");
        const allListings = listingsResponse.data;

        let reservedListings = {}; // Object to store total guests booked per listing

        if (checkInDate) {
          const reservationsResponse = await axios.get(
            `http://localhost:8080/api/reservations?checkInDate=${checkInDate}`
          );

          reservationsResponse.data.forEach((reservation) => {
            const { listingId, guests } = reservation;
            if (listingId && guests?.total) {
              reservedListings[listingId] = (reservedListings[listingId] || 0) + guests.total;
            }
          });
        }

        // Fetch reservations for check-out date
        if (checkOutDate) {
          const reservationsResponse = await axios.get(
            `http://localhost:8080/api/reservations?checkOutDate=${checkOutDate}`
          );

          reservationsResponse.data.forEach((reservation) => {
            const { listingId, guests } = reservation;
            if (listingId && guests?.total) {
              reservedListings[listingId] = (reservedListings[listingId] || 0) + guests.total;
            }
          });
        }

        // Filter listings based on search parameters and reservation availability
        const filtered = allListings.filter((listing) => {
          const reservedGuests = reservedListings[listing._id] || 0;
          const availableCapacity = listing.guests - reservedGuests;

          // If selectedGuests is greater than availableCapacity, return false
          if (selectedGuests > availableCapacity) {
            return false;
          }

          // Filter by search type and value
          if (searchValue) {
            if (searchType === "price") {
              if (listing.price > parseFloat(searchValue)) {
                return false;
              }
            } else if (searchType === "category") {
              if (listing.category.toLowerCase() !== searchValue.toLowerCase()) {
                return false;
              }
            } else {
              if (!listing[searchType].toLowerCase().includes(searchValue.toLowerCase())) {
                return false;
              }
            }
          }

          return true;
        });

        setListings(filtered);
        setFilteredListings(filtered);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListingsAndReservations();
  }, [location.search]);

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    if (category === "all") {
      setFilteredListings(listings); // Show all listings
    } else {
      const filtered = listings.filter(
        (listing) => listing.category === category
      );
      setFilteredListings(filtered);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredListings.slice(indexOfFirstItem, indexOfLastItem);

  const loadMore = () => {
    setCurrentPage(currentPage + 1);
    if (indexOfLastItem >= filteredListings.length - itemsPerPage) {
      setShowPrevious(true);
    }
  };

  const moveBack = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    if (currentPage <= 2) {
      setShowPrevious(false);
    }
  };

  return (
    <Boilerplate>
      <div class="filters" style={{ paddingTop: "0px" }}>
        <div
          className={`filter ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => handleCategorySelect("all")}
        >
          <i class="fa-duotone fa-regular fa-reply-all"></i>
          <p style={{ marginTop: "19px" }}>All</p>
        </div>
        <div
          className={`filter ${activeCategory === "trending" ? "active" : ""}`}
          onClick={() => handleCategorySelect("trending")}
        >
          <i class="fa-solid fa-fire"></i>
          <p style={{ marginTop: "19px" }}>Trending</p>
        </div>
        <div
          className={`filter ${activeCategory === "home" ? "active" : ""}`}
          onClick={() => handleCategorySelect("home")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/18/18625.png"
            alt=""
          />
          <p style={{ marginTop: "0px" }}>Home</p>
        </div>
        <div
          className={`filter ${activeCategory === "desert" ? "active" : ""}`}
          onClick={() => handleCategorySelect("desert")}
        >
          <img
            src="https://a0.muscache.com/pictures/a6dd2bae-5fd0-4b28-b123-206783b5de1d.jpg"
            alt="#"
          />
          <p style={{ marginTop: "0px" }}>Desert</p>
        </div>
        <div
          className={`filter ${activeCategory === "camping" ? "active" : ""}`}
          onClick={() => handleCategorySelect("camping")}
        >
          <img
            src="https://a0.muscache.com/pictures/ca25c7f3-0d1f-432b-9efa-b9f5dc6d8770.jpg"
            alt="#"
          />
          <p style={{ marginTop: "0px" }}>Camping</p>
        </div>
        <div
          className={`filter ${
            activeCategory === "nationalpark" ? "active" : ""
          }`}
          onClick={() => handleCategorySelect("nationalpark")}
        >
          <img
            src="https://a0.muscache.com/pictures/c0a24c04-ce1f-490c-833f-987613930eca.jpg"
            alt="#"
          />
          <p style={{ marginTop: "0px" }}>NationalPark</p>
        </div>
        <div
          className={`filter ${activeCategory === "lakefort" ? "active" : ""}`}
          onClick={() => handleCategorySelect("lakefort")}
        >
          <img
            src="https://a0.muscache.com/pictures/677a041d-7264-4c45-bb72-52bff21eb6e8.jpg"
            alt="#"
          />
          <p style={{ marginTop: "0px" }}>LakeFort</p>
        </div>
        <div
          className={`filter ${activeCategory === "farmhouse" ? "active" : ""}`}
          onClick={() => handleCategorySelect("farmhouse")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3533/3533657.png"
            alt="#"
          />
          <p style={{ marginTop: "0px" }}>FarmHouse</p>
        </div>
        <div
          className={`filter ${activeCategory === "treehouse" ? "active" : ""}`}
          onClick={() => handleCategorySelect("treehouse")}
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4G_0m2AebfuXxy_RY3Xu8k_jzn3iUIU9_vk5hn02RBDs50UbzHgd2QtbNnA562nRFCl0&usqp=CAU"
            alt="#"
          />
          <p style={{ marginTop: "0px" }}>TreeHouse</p>
        </div>
        <div
          className={`filter ${activeCategory === "tropical" ? "active" : ""}`}
          onClick={() => handleCategorySelect("tropical")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/2846/2846841.png"
            alt="#"
          />
          <p style={{ marginTop: "0px" }}>Tropical</p>
        </div>
        <div
          className={`filter ${activeCategory === "cave" ? "active" : ""}`}
          onClick={() => handleCategorySelect("cave")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/2206/2206606.png"
            alt="#"
          />
          <p style={{ marginTop: "0px" }}>Cave</p>
        </div>
        <div
          className={`filter ${activeCategory === "towers" ? "active" : ""}`}
          onClick={() => handleCategorySelect("towers")}
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLj1pQZCZsV-66VUL_Vwo3MGwmGwBsMSXeKpS-zMirNG2RrVcD0n4SGyIkltcuajYuU1s&usqp=CAU"
            alt="#"
          />
          <p style={{ marginTop: "0px" }}>Towers</p>
        </div>
        <div
          className={`filter ${activeCategory === "houseboat" ? "active" : ""}`}
          onClick={() => handleCategorySelect("houseboat")}
        >
          <img
            src="https://static.vecteezy.com/system/resources/previews/008/018/198/non_2x/illustration-of-a-simple-boat-icon-free-vector.jpg"
            alt="#"
          />
          <p style={{ marginTop: "0px" }}>HouseBoat</p>
        </div>
        <div
          className={`filter ${activeCategory === "lake" ? "active" : ""}`}
          onClick={() => handleCategorySelect("lake")}
        >
          <i class="fa-solid fa-water"></i>
          <p style={{ marginTop: "19px" }}>Lake</p>
        </div>
        <div
          className={`filter ${activeCategory === "island" ? "active" : ""}`}
          onClick={() => handleCategorySelect("island")}
        >
          <i class="fa-solid fa-igloo"></i>
          <p style={{ marginTop: "19px" }}>Island</p>
        </div>
        <div
          className={`filter ${activeCategory === "beach" ? "active" : ""}`}
          onClick={() => handleCategorySelect("beach")}
        >
          <i class="fa-solid fa-umbrella-beach"></i>
          <p style={{ marginTop: "19px" }}>Beach</p>
        </div>
        <div
          className={`filter ${activeCategory === "beachfort" ? "active" : ""}`}
          onClick={() => handleCategorySelect("beachfort")}
        >
          <i class="fa-brands fa-fort-awesome"></i>
          <p style={{ marginTop: "19px" }}>BeachFort</p>
        </div>
        <div
          className={`filter ${activeCategory === "domes" ? "active" : ""}`}
          onClick={() => handleCategorySelect("dome")}
        >
          <i class="fa-solid fa-landmark-dome"></i>
          <p style={{ marginTop: "19px" }}>Dome</p>
        </div>
      </div>
      <div className="row" style={{ marginBottom: "10px" }}>
              {loading
                ? Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={index} />)
                : currentItems.map((listing) => (
                    <div
                      key={listing._id}
                      className="card row-col-lg-3 row-col-md-3 row-col-sm-1"
                      style={{ width: "70rem" }}
                    >
                      <Link to={`/listings/${listing._id}`}>
                        <img
                          style={{ marginBottom: "5px" }}
                          src={
                            listing.image ||
                            "https://plus.unsplash.com/premium_photo-1682091872078-46c5ed6a006d?w=500&auto=format&fit=crop&q=60"
                          }
                          className="card-img-top"
                          alt={listing.title || "Listing image"}
                        />
                      </Link>
                      <div className="card-body">
                        <p className="card-text">{listing.title}</p>
                        <p style={{ marginTop: "0px", marginBottom: "0px" }}>{listing.location}</p>
                        <p style={{ marginTop: "0px" }}>
                          ₹{listing.price ? `${listing.price.toLocaleString("en-IN")}  day` : "Price not available"}
                        </p>
                      </div>
                    </div>
                  ))}
            </div>

            <div style={{ textAlign: "center", marginBottom: "50px" }}>
        {showPrevious ? (
          <>
          <p style={{fontSize:"20px", fontWeight: "bold"}}>Move back to Side Of WanderLust homes</p>
          <button
            onClick={moveBack}
            style={{
              padding: "10px 20px",
              backgroundColor: "#222222",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "20px"
            }}
          >
            Move Back
          </button>
          </>
        ) : (
          filteredListings.length > currentItems.length && (
            <>
            <p style={{fontSize:"20px", fontWeight: "bold"}}>Continue exploring WanderLust homes</p>
            <button
              onClick={loadMore}
              style={{
                padding: "10px 20px",
                backgroundColor: "#222222",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginBottom: "20px"
              }}
            >
              Show More
            </button>
            </>
          )
        )}
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
    </Boilerplate>
    
  );
};

export default AdminListingList;
