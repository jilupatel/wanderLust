import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ReservationProvider } from "./Admin/ReservationContext"

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ReservationProvider>
      <App />
    </ReservationProvider>
  </React.StrictMode>
);
