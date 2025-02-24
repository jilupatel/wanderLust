import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/layout/Sidebar";
import MainNavbar from "../components/layout/MainNavbar";
import { ReservationContext } from "../Admin/ReservationContext";

const ReservationTable = () => {
  const { reservations, fetchReservations } = useContext(ReservationContext);
  // const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Error state
  const [sidebarOpen, setSidebarOpen] = useState(false);

     // State to handle form visibility
     const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  
    // Toggle sidebar visibility
    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };


    useEffect(() => {
      const fetchData = async () => {
        try {
          await fetchReservations(); // Fetch reservations using the context function
          setLoading(false); // Stop loading
        } catch (err) {
          setError("Failed to load reservations. Please try again later."); // Set error message
          setLoading(false); // Stop loading even on error
        }
      };
  
      fetchData();
    }, [fetchReservations]);

    // Handle Accept action
    const handleAccept = async (id) => {
      try {
          const response = await axios.put(`http://localhost:8080/api/reservations/${id}/accept`);
          alert(response.data.message);
          await fetchReservations(); // Refresh the reservations
      } catch (error) {
          console.error('Error accepting reservation:', error);
      }
  };
  
  //handle descard action
  const handleDiscard = async (id) => {
      try {
          const response = await axios.put(`http://localhost:8080/api/reservations/${id}/discard`);
          alert(response.data.message);
          await fetchReservations(); // Refresh the reservations
      } catch (error) {
          console.error('Error discarding reservation:', error);
      }
  };

  if (loading) return <p>Loading reservations...</p>; // Show loading message
  if (error) return <p>{error}</p>; // Show error message

  return (
    <div>
      <MainNavbar />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="container mt-5">
        <h2>Reservation Data</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Username</th>
              <th>Check-In Date</th>
              <th>Check-Out Date</th>
              {/* <th>Suggestion</th> */}
              {/* <th>Listing ID</th> */}
              <th>Place</th>
              <th>Location</th>
              <th>Status</th> {/* New column for status */}
              <th>Actions</th> {/* New column for actions */}
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation._id}>
                <td>{reservation.username}</td>
                <td>{reservation.checkInDate}</td>
                <td>{reservation.checkOutDate}</td>
                {/* <td>{reservation.suggestion || "N/A"}</td> */}
                <td>{reservation.listingTitle}</td>
                <td>{reservation.listingLocation}</td>
                <td>{reservation.status}</td> {/* Display current status */}
                <td>
                  {/* Accept and Discard buttons */}
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleAccept(reservation._id)}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDiscard(reservation._id)}
                  >
                    Discard
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default ReservationTable;