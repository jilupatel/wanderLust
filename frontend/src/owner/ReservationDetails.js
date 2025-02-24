import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios"; 
import MainBoilerplate from "../components/layout/MainBoilerplate.js";
import "../components/styles/Admin.css";

const ReservationDetails = () => {
  const { listingId } = useParams(); // Get the listing ID from the URL
  const [reservations, setReservations] = useState([]);
  const [listing, setListing] = useState(null);  // State to store the listing data
  const [error, setError] = useState("");

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/listings/${listingId}`);
        if (response.data) {
          setListing(response.data);  // Store the listing details
        } else {
          setError("Listing not found.");
        }
      } catch (err) {
        setError("An error occurred while fetching the listing.");
      }
    };

    fetchListing();
  }, [listingId]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/reservations?listingId=${listingId}`);
        if (response.data) {
          setReservations(response.data);
        } else {
          setError("No reservations found for this listing.");
        }
      } catch (err) {
        setError("An error occurred while fetching reservations.");
      }
    };

    fetchReservations();
  }, [listingId]);

  const handleAccept = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/reservations/${id}/accept`);
      alert(response.data.message); // Notify user about the successful action
      updateReservationStatus(id, "Accepted"); // Update status locally
    } catch (error) {
      console.error('Error accepting reservation:', error);
      setError("Failed to accept reservation.");
    }
  };

  const handleDiscard = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/reservations/${id}/discard`);
      alert(response.data.message); // Notify user about the successful action
      updateReservationStatus(id, "Discarded"); // Update status locally
    } catch (error) {
      console.error('Error discarding reservation:', error);
      setError("Failed to discard reservation.");
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    setReservations((prevReservations) =>
      prevReservations.map((reservation) =>
        reservation._id === reservationId ? { ...reservation, status: newStatus } : reservation
      )
    );
  };

  const calculateTotalPrice = (checkInDate, checkOutDate) => {
    if (!listing) return 0;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)); // Number of days
    return days * listing.price;  // Total price calculation
  };

  return (
    <MainBoilerplate>
      <div className="container mt-4">
        <h1>Reservations for Listing ID: {listingId}</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {reservations.length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Username</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Total Price</th>  {/* Added Total Price column */}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td>{reservation.username}</td>
                  <td>{reservation.checkInDate}</td>
                  <td>{reservation.checkOutDate}</td>
                  <td>{reservation.status || "Pending"}</td>
                  <td>
                    {calculateTotalPrice(reservation.checkInDate, reservation.checkOutDate)} {/* Display total price */}
                  </td>
                  <td>
                    <button
                      className="btn btn-success"
                      onClick={() => handleAccept(reservation._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDiscard(reservation._id)}
                    >
                      Discard
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No reservations found for this listing.</p>
        )}
      </div>
    </MainBoilerplate>
  );
};

export default ReservationDetails;