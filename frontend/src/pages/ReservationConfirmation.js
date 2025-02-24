import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import MainBoilerplate from "../components/layout/MainBoilerplate.js";
import "../components/styles/ReservationConformation.css"
// import Razorpay from "razorpay";

const ReservationConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reservation = location.state; // Access passed state

  useEffect(() => {
    if (reservation) {
      initializeRazorpay();
    }
  }, [reservation]);

  const initializeRazorpay = async () => {
    try {
      const { data } = await axios.post("http://localhost:8080/create-order", {
        amount: reservation.totalPrice,
      });

      // Fetch email or phone number from localStorage
      const storedEmail = localStorage.getItem("email") || "";
      const storedPhone = localStorage.getItem("phoneNumber") || "";

      const options = {
        key: process.env.RAZORPAY_KEY_ID, // Use environment variables
        amount: reservation.totalPrice * 100, // Amount in paise
        currency: "INR",
        name: reservation.listingTitle,
        description: "Reservation Payment",
        order_id: data.orderId, // Fetch from backend
        handler: async function (response) {
          try {
            const verifyRes = await axios.post("http://localhost:8080/verify-payment", response);
            if (verifyRes.data.success) {
              alert("Payment Successful!");
              navigate("/success");
            } else {
              alert("Payment Verification Failed. Please try again.");
            }
          } catch (error) {
            alert("Error verifying payment. Please try again.");
          }
        },
        prefill: {
          name: reservation.username,
          email: storedEmail || "user@example.com",
          contact: storedPhone ||"9999999999",
        },
        theme: {
          color: " #F37254",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error initializing Razorpay:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };
  

  if (!reservation) {
    return (
      <div>
        <p>No reservation details found.</p>
        <button onClick={() => navigate("/")}>Go to Home</button>
      </div>
    );
  }

  return (
    <MainBoilerplate>
    <div className="reservation-container">
      {/* Back Icon */}
      <i 
          className="fa-sharp fa-solid fa-angle-left back-icon" 
          style={{fontWeight: "bold", fontSize:"35px", marginTop:"15px"}}
          onClick={() => navigate(`/listings/${reservation.listingId}`)}
        ></i>
      <h1 style={{fontWeight: "bold", fontSize:"35px"}}>Conform And Pay</h1>
      
      {/* <br/>
      <br/> */}
      <h2 style={{fontSize:"25px", marginTop: "50px"}}>Thank you for Reservation at {reservation.listingTitle}</h2>
      <h3 style={{fontSize:"22px",}}>Hello, <b>{reservation.username}!</b> Your reservation details:</h3>
      <p>
        <strong>Property Name:</strong> {reservation.listingTitle}
      </p>
      <p>
        <strong>Property Location:</strong> {reservation.listingLocation}
      </p>
      <p>
        <strong>Date Details:</strong> From {reservation.checkInDate} to {reservation.checkOutDate}
      </p>
      <p>
        <strong>Total Price:</strong> &#8377;{reservation.totalPrice}
      </p>
      {reservation.suggestion && (
        <p>
          <strong>Any Suggestion:</strong> {reservation.suggestion}
        </p>
      )}
      <button style={{width:"500px",backgroundColor:"rgb(255, 56, 92)"}} onClick={() => initializeRazorpay()}>Proceed to Payment</button>
      {/* <button onClick={() => navigate(`/listings/${reservation.listingId}`)}>Back to Listings</button> */}
    </div>
    </MainBoilerplate>
  );
};

export default ReservationConfirmation;
