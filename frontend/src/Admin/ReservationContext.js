import React, { createContext, useState } from "react";
import axios from "axios";

export const ReservationContext = createContext();

export const ReservationProvider = ({ children }) => {
  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/reservations");
      setReservations(response.data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  return (
    <ReservationContext.Provider value={{ reservations, fetchReservations }}>
      {children}
    </ReservationContext.Provider>
  );
};