const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
  },
  description: String,

  // Store up to 5 images in the main `image` field
  image: {
    type: [String], // Array of strings for image URLs
    default: [
      "https://plus.unsplash.com/premium_photo-1682091872078-46c5ed6a006d?w=500&auto=format&fit=crop&q=60",
    ],
  },

// Store all images here
gallery: [{
  url: String, // Cloudinary URL or base64 encoded image
  description: String, // Description of the image
}],

  guests: Number,
  price: Number,
  location: String,
  category: {
    type: String,
    lowercase: true,
    enum: [
      "home",
      "desert",
      "lake",
      "camping",
      "nationalpark",
      "trending",
      "lakefort",
      "farms",
      "island",
      "treehouse",
      "beach",
      "beschfront",
      "tropical",
      "cave",
      "domes",
      "towers",
      "houseboat",
    ],
    // default: "trending",
    required: true,
  },

  features: [
    {
      mainTitle: String,
      name: String,
      description: String,
    }
  ],
  ratings: [
    {
      username: String, // Username of the user who rated
      rating: Number, // Rating value (e.g., 1 to 5)
      description: String, // Optional description
    },
  ],
  country: String,
  username: {
    type: String,
    required: true,
  },

  hostProfile: {
    name: String,
    bio: String,
    address: String,
    email: String,
    profilePicture: String,
    profilePicturePublicId: String, // Add this line
  },

  images: [
    {
      url: String, // Cloudinary URL
      description: String, // Description of the image
    },
  ],
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
