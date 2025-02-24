import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainBoilerplate from "../../components/layout/MainBoilerplate.js";

const GalleryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const images = location.state?.images || [];

  return (
    <MainBoilerplate>
    <div>
      <h2>All Images</h2>
      <button onClick={() => navigate(-1)}>Back</button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {images.length > 0 ? (
          images.map((img, index) => (
            <div key={index} style={{ margin: "10px" }}>
              <img
                src={img.url}
                alt={`Gallery ${index}`}
                style={{ width: "300px", height: "200px" }}
              />
              <p>{img.description}</p>
            </div>
          ))
        ) : (
          <p>No images available</p>
        )}
      </div>
    </div>
    </MainBoilerplate>
  );
};

export default GalleryPage;
