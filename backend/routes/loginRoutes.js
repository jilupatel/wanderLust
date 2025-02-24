const express = require('express');
const loginController = require('../controller/loginController'); // Adjust path if needed

const router = express.Router();

// Verify username and phone number
router.post('/verify-username-phone', loginController.verifyUsernamePhone);

// Login with email
router.post('/login', loginController.loginWithEmail);

// Login with OTP
router.post('/login/otp', loginController.loginWithOtp);

module.exports = router;
