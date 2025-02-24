const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Ensure you have a User model
const SECRET_KEY = "jilu1234"; // Move this to environment variables in production

// ✅ Verify username and phone number
const verifyUsernamePhone = async (req, res) => {
    const { username, phoneNumber } = req.body;

    try {
        const user = await User.findOne({ username, phoneNumber });

        if (!user) {
            return res.status(400).json({ message: "Username or Phone Number is not found." });
        }

        res.status(200).json({ message: "User verified!" });
    } catch (error) {
        res.status(500).json({ message: "Server error, please try again." });
    }
};

// ✅ Login with email
const loginWithEmail = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const user = await User.findOne({ username, email });

        if (!user) {
            return res.status(400).json({ message: "Invalid username or email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { username: user.username, userId: user._id },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.json({ token, username: user.username, email: user.email });
    } catch (error) {
        res.status(500).json({ message: "Server error, please try again." });
    }
};

// ✅ Login with OTP
const loginWithOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    // Implement actual OTP verification logic here
    const isValidOtp = true; // Replace with actual OTP verification logic

    if (!isValidOtp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    try {
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(400).json({ message: "Phone number not found" });
        }

        const token = jwt.sign(
            { username: user.username, userId: user._id },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.json({ token, username: user.username, email: user.email });
    } catch (error) {
        res.status(500).json({ message: "Server error, please try again." });
    }
};

module.exports = {
    verifyUsernamePhone,
    loginWithEmail,
    loginWithOtp
};
