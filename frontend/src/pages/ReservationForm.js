import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ReservationContext } from "../Admin/ReservationContext";
import MainBoilerplate from "../components/layout/MainBoilerplate.js";

const ReservationForm = () => {
  const { id } = useParams(); // Get the listing ID
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [showGuests, setShowGuests] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(0);
  const [username, setUsername] = useState(""); // Username for reservation
  const { fetchReservations } = useContext(ReservationContext);
  const totalGuests = adults + children + pets;
  const [totalPrice, setTotalPrice] = useState(0);
  const [errorMessage, setErrorMessage] = useState(""); 
  const [leftGuests, setLeftGuests] = useState(null);

  // Fetch listing details to display information
  const fetchListing = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/listings/${id}`
      );
      setListing(response.data);
    } catch (err) {
      console.error("Error fetching listing:", err);
    }
  };
  const fetchReservationsData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/reservations");
      const allReservations = response.data;
  
      // Filter reservations for the current listing
      const listingReservations = allReservations.filter(reservation => reservation.listingId === id);
  
      let occupiedGuests = 0;
  
      listingReservations.forEach(reservation => {
        const existingCheckIn = new Date(reservation.checkInDate);
        const existingCheckOut = new Date(reservation.checkOutDate);
        const selectedCheckIn = new Date(checkInDate);
        const selectedCheckOut = new Date(checkOutDate);
  
        // Check if selected dates overlap with an existing reservation
        if (
          (selectedCheckIn >= existingCheckIn && selectedCheckIn <= existingCheckOut) ||
          (selectedCheckOut >= existingCheckIn && selectedCheckOut <= existingCheckOut)
        ) {
          occupiedGuests += reservation.guests.total; // Sum occupied guests
        }
      });

      // Calculate left guests by subtracting occupied guests from total listing guests
    const availableGuests = listing ? listing.guests - occupiedGuests : 0;
    setLeftGuests(availableGuests > 0 ? availableGuests : 0);
  } catch (err) {
    console.error("Error fetching reservations:", err);
  }
};

useEffect(() => {
  if (checkInDate && checkOutDate) {
    fetchReservationsData();
  }
}, [checkInDate, checkOutDate]);


  // Fetch username from localStorage and initialize it
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername); // Set username from localStorage
    }
    if (id) {
      fetchListing(); // Fetch listing details if ID is present
    }
  }, [id]);

  useEffect(() => {
    if (checkInDate && checkOutDate && listing?.price) {
      setTotalPrice(calculateTotalPrice(checkInDate, checkOutDate, listing.price, totalGuests));
    }
  }, [checkInDate, checkOutDate, listing?.price, totalGuests]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if total guests exceed the allowed guests
    if (totalGuests > leftGuests) {
      setErrorMessage(`Only ${leftGuests} guests are available for the selected dates.`);
      return;
    }

    const reservationData = {
        username,
        checkInDate,
        checkOutDate,
        guests: { // Send guests as an object
            adults,
            children,
            pets,
            total: totalGuests
        },
        listingId: id,
        listingTitle: listing?.title,
        listingLocation: listing?.location,
        totalPrice,
    };

    try {
        await axios.post(
            "http://localhost:8080/api/reservations",
            reservationData
        );
        navigate(`/reservation-confirmation`, { state: reservationData });
    } catch (err) {
        console.error("Error making reservation:", err.response?.data || err);
        alert("Failed to make reservation. Please try again.");
    }
};


// Helper function to calculate total price
const calculateTotalPrice = (checkIn, checkOut, pricePerNight, guests) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const days = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
  );
  return days * pricePerNight * guests; // Multiply by total guests
};


  return (
    // <MainBoilerplate>
    <div>
      <h3>Booking price: ₹ {listing ? listing.price : "Loading..."} /day</h3>
      {listing && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={username} // Populate with the username state
              onChange={(e) => setUsername(e.target.value)} // Allow editing
              placeholder="Username"
              required
            />
          </div>
          <table style={{ border: "1px solid black" }}>
            <td>
              <label>Check-in Date:</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </td>

            <td>
              <label>Check-out Date:</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </td>
          </table>
          <br></br>
          {leftGuests !== null && (
  <div style={{ fontWeight: "bold", color: "green", marginBottom: "10px" }}>
    Available Guests: {leftGuests}
  </div>
)}

          <div>
            <label>Guests:</label>
            <br></br>
            <button
              type="button"
              className="guests-btn"
              onClick={() => setShowGuests(!showGuests)}
              style={{
                padding: "8px",
                margin: "5px 0",
                width: "100%",
                border:"1px solid black",
                borderRadius: "5px", 
                background: "transparent",
                color: "black",
                // width: "180px",
                // marginLeft: "6px",
                // marginRight: "6px",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f2f2f2")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
            >
              Guests: {totalGuests}
            </button>
            {showGuests && (
              <div
                className="guests-dropdown"
                style={{
                  position: "relative",
                  top: "0 px",
                  left: "50px",
                  width: "250px",
                  backgroundColor: "#fff",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  padding: "10px",
                  zIndex: "1000",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label style={{ color: "black" }}>Adults</label>
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        background: "transparent",
                        border: "1px solid black",
                        color: "black",
                        padding: "px 10px",
                      }}
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                    >
                      -
                    </button>
                    <span style={{ color: "black" }}>{adults}</span>
                    <button
                      type="button"
                      style={{
                        background: "transparent",
                        border: "1px solid black",
                        color: "black",
                        padding: "px 10px",
                      }}
                      onClick={() => setAdults(adults + 1)}
                    >
                      +
                    </button>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label style={{ color: "black" }}>Children</label>
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        background: "transparent",
                        border: "1px solid black",
                        color: "black",
                        padding: "px 10px",
                      }}
                      onClick={() => setChildren(Math.max(0, children - 1))}
                    >
                      -
                    </button>
                    <span style={{ color: "black" }}>{children}</span>
                    <button
                      type="button"
                      style={{
                        background: "transparent",
                        border: "1px solid black",
                        color: "black",
                        padding: "px 10px",
                      }}
                      onClick={() => setChildren(children + 1)}
                    >
                      +
                    </button>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label style={{ color: "black" }}>Pets</label>
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        background: "transparent",
                        border: "1px solid black",
                        color: "black",
                        padding: "px 10px",
                      }}
                      onClick={() => setPets(Math.max(0, pets - 1))}
                    >
                      -
                    </button>
                    <span style={{ color: "black" }}>{pets}</span>
                    <button
                      type="button"
                      style={{
                        background: "transparent",
                        border: "1px solid black",
                        color: "black",
                        padding: "px 10px",
                      }}
                      onClick={() => setPets(pets + 1)}
                    >
                      +
                    </button>
                  </span>
                </div>
              </div>
            )}
            {errorMessage && (
              <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
            )}
          </div>

          {/* <div>
            <label>Suggestion (Optional):</label>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
            />
          </div> */}
          <button type="submit">Reserve Now</button>
        </form>
      )}
    </div>
    // </MainBoilerplate>
  );
};

export default ReservationForm;
