import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DeleteListing = ({ listingId }) => {
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.preventDefault();

    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`http://localhost:8080/api/listings/${listingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 200) {
        alert('Item deleted successfully.');
        navigate('/listings');
      } else {
        alert('Failed to delete item.');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('An error occurred while deleting the item.');
    }
  };

  return (
    <form onSubmit={handleDelete}>
      <button type="submit">Delete</button>
    </form>
  );
};

export default DeleteListing;