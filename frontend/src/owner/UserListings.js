import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import "../components/styles/AdminListings.css";
import MainBoilerplate from "../components/layout/MainBoilerplate.js";
import "../components/styles/Admin.css";
// import "../components/styles/ListDetail.css";

const UserListings = () => {
  const [listings, setListings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListingsAndReservations = async () => {
      try {
        // Fetch listings
        const listingsResponse = await fetch("http://localhost:8080/api/listings");
        const listingsData = await listingsResponse.json();

        // Fetch reservations
        const reservationsResponse = await fetch("http://localhost:8080/api/reservations");
        const reservationsData = await reservationsResponse.json();

        if (listingsResponse.ok && reservationsResponse.ok) {
          // Filter listings by username
          const userListings = listingsData.filter((listing) => listing.username === username);

          // Set state for listings and reservations
          setListings(userListings);
          setReservations(reservationsData);
        } else {
          setError("Failed to fetch data. Please try again.");
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      }
    };

    fetchListingsAndReservations();
  }, [username]);

  const handleGoClick = (listingId) => {
    // Navigate to the reservation details page for the matched listingId
    navigate(`/user/listings/${listingId}`);
  };

  return (
    <MainBoilerplate>
    <div className="container mt-4">
      <h1>Your Listings</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {listings.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing._id}>
                <td>{listing.title}</td>
                <td>{listing.location}</td>
                <td>{listing.price}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGoClick(listing._id)}
                  >
                    Go
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No listings found for your account.</p>
      )}
    </div>
    </MainBoilerplate>
  );
};

export default UserListings;
