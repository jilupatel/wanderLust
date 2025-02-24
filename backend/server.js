if(process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const path = require("path");
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const Owner = require("./models/owner");
const Listing = require("./models/listing");
const Admin = require("./models/admin.js")
const methodOverride = require("method-override");
// const ejsMate = require('ejs-mate');
const cors = require("cors");
const Reservation = require("./models/reservation");
const authenticateToken = require("./middleware/auth");
// const user = require('../backend/models/user.js');
const { sampleListings } = require("./data");
const multer = require("multer");
const {storage} = require("../backend/cloudConfig.js")
const upload = multer({ storage });
const twilio = require('twilio');
const axios = require("axios");
const adminRoutes = require('./routes/adminRoutes'); 
const loginRoutes = require('./routes/loginRoutes');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.CLIENT_ID);
// const cohere = require("cohere-ai");
// const storage = multer.memoryStorage()

const app = express();
const PORT = process.env.PORT || 8080;

const bodyParser = require('body-parser');
const { clearScreenDown } = require("readline");

// Increase the limit of the JSON body
app.use(bodyParser.json({ limit: '10mb' })); // Set the limit according to your needs

const MONGO_URL = "mongodb://127.0.0.1:27017/new_wanderlust";

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "build")));
app.use("/Images", express.static(path.join(__dirname, "Images")));

const SECRET_KEY = process.env.SECRET_KEY;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// all routers here
app.use('/admin', adminRoutes);
app.use('/api', loginRoutes);

app.post("/api/google-login", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create Google user without password
      user = new User({
        email,
        username: name,
        isGoogleUser: true, // Mark as Google user
      });
      await user.save();
    }

    // Generate JWT token
    const appToken = jwt.sign({ id: user._id, email: user.email }, "secretKey", {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Google login successful",
      token: appToken,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google login failed", error: err.message });
  }
});

app.post("/api/listings/:id/gallery", upload.array("images", 10), async (req, res) => {
  const { id } = req.params;
  const { descriptions } = req.body; // Descriptions should be an array of strings

  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Assuming descriptions are sent as a JSON array
    const imageDescriptions = JSON.parse(descriptions);

    // Map through the uploaded files and add them to the gallery
    const images = req.files.map((file, index) => ({
      url: file.path, // Cloudinary URL or base64 encoded image
      description: imageDescriptions[index] || "", // Use the corresponding description
    }));

    // Add the new images to the gallery
    listing.gallery = listing.gallery.concat(images);
    await listing.save();

    res.status(201).json({ message: "Images uploaded successfully", images });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to handle multiple image uploads with descriptions
app.post("/api/listings/:id/images", upload.array("images", 10), async (req, res) => {
  const { id } = req.params;
  const { descriptions } = req.body; // Descriptions should be an array of strings

  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Assuming descriptions are sent as a JSON array
    const imageDescriptions = JSON.parse(descriptions);

    // Map through the uploaded files and add them to the listing
    const images = req.files.map((file, index) => ({
      url: file.path, // Cloudinary URL
      description: imageDescriptions[index] || "", // Use the corresponding description
    }));

    // Add the new images to the listing
    listing.images = listing.images.concat(images);
    await listing.save();

    res.status(201).json({ message: "Images uploaded successfully", images });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// // Route to fetch images for a specific listing
// app.get("/api/listings/:id/images", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const listing = await Listing.findById(id);
//     if (!listing) {
//       return res.status(404).json({ message: "Listing not found" });
//     }

//     res.status(200).json(listing.images);
//   } catch (error) {
//     console.error("Error fetching images:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // Amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id });
  } catch (error) {
    res.status(500).send({ error: "Failed to create order" });
  }
});

app.post("/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.json({ success: true, message: "Payment successful" });
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
});

const helpCenterData = require("../backend/helpCenterData.json");

// Help Center Search Endpoint
app.post("/api/help-center/search", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }

  try {
    // Filter questions that match the query (case-insensitive)
    const results = helpCenterData.filter((item) =>
      item.question.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error searching help center:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// // Verify username and phone number endpoint
// app.post("/api/verify-username-phone", async (req, res) => {
//   const { username, phoneNumber } = req.body;
  
//   try {
//     // Check if user exists with both username and phoneNumber
//     const user = await User.findOne({ username, phoneNumber });
    
//     if (!user) {
//       return res.status(400).json({ message: "Username or Phone Number is not found." });
//     }
    
//     // If valid, return success response
//     res.status(200).json({ message: "User verified!" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error, please try again." });
//   }
// });

// // Login with email
// app.post("/api/login", async (req, res) => {
//   const { username, password, email } = req.body;
  
//   try {
//     const user = await User.findOne({ username, email });
    
//     if (!user) {
//       return res.status(400).json({ message: "Invalid username or email" });
//     }
    
//     const isMatch = await bcrypt.compare(password, user.password);
    
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid username or password" });
//     }
    
//     const token = jwt.sign(
//       { username: user.username, userId: user._id },
//       SECRET_KEY,
//       { expiresIn: "1h" }
//     );

//     res.json({ token, username: user.username, email: user.email });
//   } catch (error) {
//     res.status(500).json({ message: "Server error, please try again." });
//   }
// });

// // Login with OTP
// app.post("/api/login/otp", async (req, res) => {
//   const { phoneNumber, otp } = req.body;
  
//   // Implement OTP verification logic here
//   const isValidOtp = true; // Replace with actual OTP verification logic
  
//   if (!isValidOtp) {
//     return res.status(400).json({ message: "Invalid OTP" });
//   }

//   try {
//     const user = await User.findOne({ phoneNumber });

//     if (!user) {
//       return res.status(400).json({ message: "Phone number not found" });
//     }

//     const token = jwt.sign(
//       { username: user.username, userId: user._id },
//       SECRET_KEY,
//       { expiresIn: "1h" }
//     );

//     res.json({ token, username: user.username, email: user.email });
//   } catch (error) {
//     res.status(500).json({ message: "Server error, please try again." });
//   }
// });

app.put("/updateProfile/:id", async (req, res) => {
  const { profilePicture, address, bio, email, name } = req.body;
  
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "hostProfile.profilePicture": profilePicture,
          "hostProfile.address": address,
          "hostProfile.bio": bio,
          "hostProfile.email": email,
          "hostProfile.name": name
        }
      },
      { new: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(updatedListing);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update host profile API
app.patch(
  "/api/listings/:listingId/host-profile",
  upload.single("profilePicture"),
  async (req, res) => {
    const { listingId } = req.params;
    const { name, bio, address, email } = req.body;

    try {
      // Find the listing by ID
      const listing = await Listing.findById(listingId);

      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // Update profile fields
      if (name) listing.hostProfile.name = name;
      if (bio) listing.hostProfile.bio = bio;
      if (address) listing.hostProfile.address = address;
      if (email) listing.hostProfile.email = email;

      // If an image is uploaded, update Cloudinary URL
      if (req.file) {
        listing.hostProfile.profilePicture = req.file.path; // Cloudinary URL
      }

      // Save the updated listing
      await listing.save();

      return res.status(200).json({
        message: "Profile updated successfully",
        profile: listing.hostProfile,
      });
    } catch (error) {
      console.error("Error updating host profile:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.delete("/api/listings/:id/host-profile", async (req, res) => {
  try {
    const { id } = req.params;
    await Listing.updateOne({ _id: id }, { $unset: { hostProfile: "" } });
    res.status(200).json({ message: "Host profile deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting host profile", error });
  }
});



// Serve static files (e.g., images)
app.use('/uploads', express.static('uploads'));
// Existing rating-related routes
app.post("/listings/:id/ratings", async (req, res) => {
  const { id } = req.params;
  const { username, rating, description } = req.body;

  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Add the new rating
    listing.ratings.push({ username, rating, description });
    await listing.save();

    res.status(201).json(listing.ratings[listing.ratings.length - 1]); // Return the newly added rating
  } catch (err) {
    res.status(500).json({ message: "Error adding rating", error: err.message });
  }
});

// Update a specific rating
app.put("/listings/:listingId/ratings/:ratingId", async (req, res) => {
  const { listingId, ratingId } = req.params;
  const { rating, description } = req.body;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const ratingToUpdate = listing.ratings.id(ratingId);
    if (!ratingToUpdate) {
      return res.status(404).json({ message: "Rating not found" });
    }

    ratingToUpdate.rating = rating;
    ratingToUpdate.description = description;

    await listing.save();

    res.status(200).json(ratingToUpdate);
  } catch (err) {
    res.status(500).json({ message: "Error updating rating", error: err.message });
  }
});

// Delete a specific rating
app.delete("/listings/:listingId/ratings/:ratingId", async (req, res) => {
  const { listingId, ratingId } = req.params;

  console.log("Deleting rating with ID:", ratingId); // Debugging

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Use pull to remove the rating from the ratings array
    listing.ratings.pull({ _id: ratingId });
    await listing.save(); // Save the updated listing

    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (err) {
    console.error("Error deleting rating:", err); // Debugging
    res.status(500).json({ message: "Error deleting rating", error: err.message });
  }
});

app.get("/upload", (req, res) => {
  res.render("upload");
});

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Ensure you return only the Cloudinary URL
  res.json({ imageUrl: `https://res.cloudinary.com/dqwbqxrmu/image/upload/v1737027989/${req.file.filename}` });
});


// const upload = multer({storage: storage})

// seed the data
app.get("/seed", async (req, res) => {
  try {
    // Remove all existing listings before seeding
    await Listing.deleteMany({});
    // Insert seed data
    await Listing.insertMany(sampleListings);
    res.status(201).send("Seed data added successfully!");
  } catch (error) {
    res.status(500).send("Error seeding data: " + error);
  }
});

// Route to fetch reservations by listingId
app.get("/api/reservations/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const reservations = await Reservation.find({ listingId });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});


//login time using phone number and otp
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Mock in-memory data (In a real app, you'd use a database)
const otpStore = {}; // Store OTP for phone verification

// Endpoint to send OTP to the phone
app.post("/api/send-otp", (req, res) => {
  const { phoneNumber } = req.body;

  // Generate a random OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Save OTP for verification (In real apps, store in DB with expiration time)
  otpStore[phoneNumber] = otp;

  // Send OTP via SMS (Twilio)
  client.messages
    .create({
      body: `Your OTP code is ${otp}`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    })
    .then(() => {
      res.status(200).json({ message: "OTP sent successfully" });
    })
    .catch((error) => {
      res.status(500).json({ message: "Failed to send OTP", error });
    });
});

// Endpoint to verify OTP and login the user
app.post("/api/login/otp", (req, res) => {
  const { phoneNumber, otp } = req.body;

  // Verify OTP
  if (otpStore[phoneNumber] === parseInt(otp, 10)) {
    // OTP is correct, proceed with login (mock response)
    const token = "jilupatel1234"; // In a real app, create a JWT token
    res.status(200).json({ token });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
});

// **Signup via Email & Password**
app.post("/api/signup", async (req, res) => {
  const { username, password, email, phoneNumber } = req.body;

  try {
    if (email) {
      // Email-based signup
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword });
      await user.save();
      return res.json({ message: "User registered successfully with email!" });
    } else if (phoneNumber) {
      // Phone-based signup
      const user = new User({ username, phoneNumber });
      await user.save();
      return res.json({ message: "User registered successfully with phone number!" });
    } else {
      return res.status(400).json({ message: "Either email or phone number is required" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});


// **Verify OTP & Complete Signup**
app.post("/api/verify-otp", async (req, res) => {
  const { phoneNumber, otp, username } = req.body;

  if (otpStore[phoneNumber] === parseInt(otp, 10)) {
    const user = new User({ username, phoneNumber });
    await user.save();
    return res.status(200).json({ message: "OTP verified! Signup successful!" });
  } else {
    return res.status(400).json({ message: "Invalid OTP" });
  }
});

// Routes
app.get("/api/user/login", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post("/api/user/login", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

app.put("/api/user/update", async (req, res) => {
  const { username, ...updatedData } = req.body;
  
  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  try {
    const user = await User.findOneAndUpdate(
      { username },
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User information updated successfully.", user });
  } catch (error) {
    console.error("Error updating user information:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// New route to fetch user data by username
app.get('/api/user/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user); // Send back user data as JSON
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.put("/api/user/login/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, req.body, { new: true });
  res.json(user);
});

app.delete("/api/user/login/:id", async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.json({ message: "User deleted successfully!" });
});

// Verify username and phone number endpoint
app.post("/api/verify-username-phone", async (req, res) => {
  const { username, phoneNumber } = req.body;
  
  try {
    // Check if user exists with both username and phoneNumber
    const user = await User.findOne({ username, phoneNumber });
    
    if (!user) {
      return res.status(400).json({ message: "Username or Phone Number is not found." });
    }
    
    // If valid, return success response
    res.status(200).json({ message: "User verified!" });
  } catch (error) {
    res.status(500).json({ message: "Server error, please try again." });
  }
});

// app.post("/api/login", async (req, res) => {
//   const { username, password } = req.body;
//   const user = await User.findOne({ username });
//   if (!user) {
//     return res.status(400).json({ message: "Invalid username or password" });
//   }
//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     return res.status(400).json({ message: "Invalid username or password" });
//   }
//   const token = jwt.sign(
//     { username: user.username, userId: user._id },
//     SECRET_KEY,
//     { expiresIn: "1h" }
//   );

//   // Send username along with token
//   res.json({ token, username: user.username,
//     email: user.email });
// });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password (or app password)
  },
});

app.post('/api/request-password-reset', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }
  
    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
  
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Click the link to reset your password: ${resetLink}`,
    };
  
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset link sent to email' });
  } catch (err) {
    console.error('Error occurred:', err); // Log error details
    res.status(500).json({ message: 'Error sending email', error: err.message });
  }  
});


app.post('/api/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token or user not found' });
    }

    // Hash the new password and save it to the user document
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// assume
// user?._id , token  , expire time
// tokenModal.create({userId: user._id, token, expireAt: new Date(Date.now() + 3600000)});
//  res.cookie('token', token, { httpOnly: true });

// Logout Route
app.post("/api/logout", (req, res) => {
  // Invalidate the token or simply respond with a success message
  // res.clearCookie('token');
  res.json({ message: "User logged out successfully" });
});

// Current User Route
app.get("/api/current-user", (req, res) => {
  try {
    const token = req.cookies.token; // Read token from cookies
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, SECRET_KEY); // Verify token
    res.json({ username: decoded.username }); // Send username
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Add feature to listing
app.post("/api/listings/:id/features", async (req, res) => {
  try {
    const { id } = req.params;
    const { mainTitle, name, description } = req.body;

    if (!mainTitle || !name || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Add the new feature to the listing
    listing.features.push({ mainTitle, name, description });
    await listing.save();

    res.status(201).json({ mainTitle, name, description });
  } catch (error) {
    console.error("Error adding feature:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete a feature
app.delete("/api/listings/:listingId/features/:featureId", async (req, res) => {
  try {
    const { listingId, featureId } = req.params;

    // Find the listing and remove the feature
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    listing.features = listing.features.filter(
      (feature) => feature._id.toString() !== featureId
    );

    await listing.save();
    res.status(200).json({ message: "Feature deleted successfully" });
  } catch (err) {
    console.error("Error deleting feature:", err);
    res.status(500).json({ message: "Failed to delete feature" });
  }
});

// Route to fetch features for a specific listing
app.get("/api/listings/:id/features", async (req, res) => {
  const { id } = req.params;

  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json(listing.features); // Return the features array
  } catch (err) {
    res.status(500).json({ message: "Error fetching features", error: err.message });
  }
});

// app.post("/listings/:id/ratings", async (req, res) => {
//   const { id } = req.params;
//   const { username, rating, description } = req.body;

//   try {
//     const listing = await Listing.findById(id);
//     if (!listing) {
//       return res.status(404).json({ message: "Listing not found" });
//     }

//     // Add the new rating
//     listing.ratings.push({ username, rating, description });
//     await listing.save();

//     res.status(201).json(listing.ratings[listing.ratings.length - 1]); // Return the newly added rating
//   } catch (err) {
//     res.status(500).json({ message: "Error adding rating", error: err.message });
//   }
// });

app.get("/api/listings", async (req, res) => {
  const { location, title, price, country, category, guests } = req.query;
  let query = {};

  if (location) {
    query.location = new RegExp(location, "i"); // Case-insensitive search
  }
  if (title) {
    query.title = new RegExp(title, "i");
  }
  if (country) {
    query.country = new RegExp(country, "i");
  }
  if (category) {
    query.category = new RegExp(category, "i");
  }
  if (price) {
    query.price = { $lte: Number(price) }; // Assuming price is a number and filtering by max price
  }
  if (guests) {
    query.guests = { $gte: Number(guests) }; // Filtering by minimum number of guests
  }

  // console.log("Query:", query); // Debugging

  try {
    const listings = await Listing.find(query);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Index Route
app.get("/api/listings", async (req, res) => {
  const listings = await Listing.find({});

  // console.log("listings", listings);
  res.json(listings);
});


// Show Route
app.get("/api/listings/:id", async (req, res) => {
  const { id } = req.params;
  // console.log("jgbjhg",id)
  const listing = await Listing.findById(id);
  res.json(listing);
});

// Create Route
app.post("/api/listings", async (req, res) => {
  try {
    const { title, description, price, guests, location,category, country, username, imageUrl } = req.body;

    // Ensure all required fields are provided
    if (!title || !description || !price || !location || !category || !guests || !country || !username || !imageUrl) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newListing = new Listing({
      title,
      description,
      price,
      location,
      category,
      guests,
      country,
      username,
      image: imageUrl,  // Store the image URL in the database
    });

    await newListing.save();
    res.status(201).json({ message: "Listing added successfully", listing: newListing });
  } catch (error) {
    console.error("Error creating listing:", error.message);
    res.status(500).json({ message: "Failed to add listing", error: error.message });
  }
});

// app.get("/api/reservations", async (req, res) => {
//   const { checkInDate } = req.query;
//   try {
//     const reservations = await Reservation.find({ checkInDate });
//     res.status(200).json(reservations);
//   } catch (error) {
//     console.error("Error fetching reservations:", error);
//     res.status(500).json({ error: "Failed to fetch reservations" });
//   }
// });

// Endpoint to fetch reservations with filtering
app.get("/api/reservations", async (req, res) => {
  const { username, checkInDate, checkOutDate, guests, listingId, listingTitle, listingLocation, status, totalPrice } = req.query;
  let query = {};

  if (username) query.username = username;
  if (checkInDate) query.checkInDate = checkInDate;
  if (checkOutDate) query.checkOutDate = checkOutDate;
  // if (suggestion) query.suggestion = suggestion;
  if (listingId) query.listingId = listingId;
  if (listingTitle) query.listingTitle = listingTitle;
  if (listingLocation) query.listingLocation = listingLocation;
  if (status) query.status = status;
  if (totalPrice) query.totalPrice = totalPrice;

  if (guests) {
    try {
      const parsedGuests = JSON.parse(guests);
      if (parsedGuests.adults !== undefined) query["guests.adults"] = parsedGuests.adults;
      if (parsedGuests.children !== undefined) query["guests.children"] = parsedGuests.children;
      if (parsedGuests.pets !== undefined) query["guests.pets"] = parsedGuests.pets;
      if (parsedGuests.total !== undefined) query["guests.total"] = parsedGuests.total;
    } catch (err) {
      return res.status(400).json({ error: "Invalid guests format. It should be a JSON object." });
    }
  }

  try {
    const reservations = await Reservation.find(query);
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

app.get("/api/listings", async (req, res) => {
  try {
    const listings = await Listing.find({});
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//on go to that listing id total reservation
app.get("/api/reservations/:listingId", (req, res) => {
  const { listingId } = req.params;
  // Fetch reservations for the given listingId from your database
  const reservations = reservationsData.filter(
    (reservation) => reservation.listingId === listingId
  );
  res.json(reservations);
});

// app.put('/api/listings/:id', async (req, res) => {
//   const { id } = req.params;
//   const { title, description, price, location, country, username, image } = req.body;

//   try {
//     const updatedListing = await Listing.findByIdAndUpdate(
//       id,
//       { title, description, price, location, country, username, image },
//       { new: true } // Return the updated document
//     );

//     res.status(200).json(updatedListing);
//   } catch (err) {
//     res.status(500).json({ message: "Error updating listing", error: err.message });
//   }
// });

// Update Route
app.put("/api/listings/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, price, guests, location, country, imageUrl } = req.body;
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { title, description, price, guests, location, country, image: imageUrl },
      { new: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json({
      message: "Listing updated successfully",
      listing: updatedListing,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating listing", error: err.message });
  }
});

// Delete Route
app.delete("/api/listings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting listing", error: err.message });
  }
});

// Reservation API Routes
app.post("/api/reservations", async (req, res) => {
  try {
    const { username, checkInDate, checkOutDate, guests, listingId, listingTitle, listingLocation, totalPrice } = req.body;
    
     // Ensure guests data structure is correct
     if (!guests || typeof guests !== "object" || !("adults" in guests) || !("children" in guests) || !("pets" in guests) || !("total" in guests)) {
      return res.status(400).json({ error: "Invalid guests data. Ensure it includes adults, children, pets, and total." });
    }

    const newReservation = new Reservation({
      username,
      checkInDate,
      checkOutDate,
      guests,
      listingId,
      listingTitle,
      listingLocation,
      totalPrice,
      status: "pending", // Initial status when reservation is created
    });
    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/reservations", async (req, res) => {
  const { listingId } = req.query;
  try {
    const reservations = await Reservation.find(listingId ? { listingId } : {});
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

// Update Reservation Route
app.put("/api/reservations/:id", async (req, res) => {
  const { id } = req.params;
  const { username, checkInDate, checkOutDate, suggestion } = req.body;

  try {
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      {
        username,
        checkInDate,
        checkOutDate,
        suggestion,
      },
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.json({
      message: "Reservation updated successfully",
      reservation: updatedReservation,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating reservation", error: err.message });
  }
});

// Delete Reservation Route
app.delete("/api/reservations/:reservationId", async (req, res) => {
  const { reservationId } = req.params;
  try {
    const deletedReservation = await Reservation.findByIdAndDelete(
      reservationId
    );
    if (!deletedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json({ message: "Reservation deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting reservation", error: err.message });
  }
});

//get reservation status
app.get("/api/reservations", async (req, res) => {
  const { listingId } = req.query;
  try {
    const reservations = await Reservation.find(listingId ? { listingId } : {});
    res.status(200).json(reservations); // Include status field in response
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

//accept reservation
app.put("/api/reservations/:id/accept", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { status: "accepted" },
      { new: true }
    );
    if (!updatedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json({
      message: "Reservation accepted successfully",
      reservation: updatedReservation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error accepting reservation", error: error.message });
  }
});

//discard reservation
app.put("/api/reservations/:id/discard", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { status: "discarded" },
      { new: true }
    );
    if (!updatedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json({
      message: "Reservation discarded successfully",
      reservation: updatedReservation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error discarding reservation", error: error.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

// key secret: 42DnDLiz3pHFRatksDLseqZV
//key id: rzp_test_mjBF6NtFNfuTl7