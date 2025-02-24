// AddFeaturePage.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AddFeaturePage = () => {
  const { listingId } = useParams();
  const [mainTitle, setMainTitle] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8080/api/listings/${listingId}/features`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mainTitle, name, description }),
      });

      if (response.ok) {
        alert("Feature added successfully");
        navigate("/admin/listings");
      } else {
        alert("Failed to add feature");
      }
    } catch (error) {
      console.error("Error adding feature:", error);
    }
  };

  return (
    <div>
      <h1>Add Feature to Listing</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Main Title:</label>
          <input
            type="text"
            value={mainTitle}
            onChange={(e) => setMainTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Feature</button>
      </form>
    </div>
  );
};

export default AddFeaturePage;