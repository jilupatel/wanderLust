const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function () {
      // Require password only if it's not a Google user
      return this.email && !this.isGoogleUser;
    },
  },
  isGoogleUser: { type: Boolean, default: false }, 
  // password: { type: String, required: false },
  email: {
    type: String,
    unique: true,
    sparse: true,
    // required: true
},
phoneNumber: { 
  type: String, 
  unique: true, 
  sparse: true 
},
  fullName: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v); // Adjust this regex based on the desired phone number format
      },
      message: props => `${props.value} is not a valid phone number!`,
    },
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  address: {
    type: String,
    trim: true,
  },
  occupation: {
    type: String,
    trim: true,
  },
  theme: {
    type: String,
    enum: ['Light', 'Dark'],
  },
  language: {
    type: String,
  },
  profilePicture: {
    type: String, // Store base64 string or URL to the image
  },
},

{
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;