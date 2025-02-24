import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ListingForm from './pages/ListingForm.js';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState({
    title: '',
    description: '',
    image: { filename: '', url: '' },
    price: '',
    location: '',
    country: ''
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/listings/${id}`);
        setListing(response.data);
      } catch (err) {
        console.error('Error fetching listing:', err);
      }
    };
    fetchListing();
  }, [id]);

  const handleEdit = async (updatedListing) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/listings/${id}`, updatedListing, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.status === 200) {
        alert('Listing updated successfully!');
        navigate('/listings');
      }
    } catch (err) {
      console.error('Error updating listing:', err);
      alert('Failed to update listing.');
    }
  }; 

  return (
    <div>
      <h1>Edit Listing</h1>
      <ListingForm listing={listing} setListing={setListing} isEdit={true}  handleSave={handleEdit} />
    </div>
  );
};

export default EditListing;