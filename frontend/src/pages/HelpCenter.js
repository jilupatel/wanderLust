import React, { useState } from "react";
import axios from "axios";
import MainBoilerplate from "../components/layout/MainBoilerplate.js";

const HelpCenter = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query) {
      setError("Please enter a question.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/help-center/search", { query });
      setResults(response.data);
      setError("");
    } catch (err) {
      setError("No results found. Please try another question.");
      setResults([]);
    }
  };

  return (
    <MainBoilerplate>
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{fontWeight: "1000"}}>Hi, How can we help you today?</h1>
      <p>Please, tell me if any questions regarding wanderlust</p>

      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for questions..."
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        {results.map((item, index) => (
          <div
            key={index}
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          >
            {/* <h3>{item.question}</h3> */}
            <p>{item.answer}</p>
          </div>
        ))}
      </div>
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
    </MainBoilerplate>
  );
};

export default HelpCenter;