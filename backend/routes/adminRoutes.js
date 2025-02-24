const express = require('express');
const adminController = require('../controller/adminController.js'); // Adjust the path if needed

const router = express.Router();

// Create Admin
router.post('/create', adminController.createAdmin);

// Read all Admins
router.get('/create', adminController.getAllAdmins);

// Admin Login
router.post('/login', adminController.getAdminById);

module.exports = router;
