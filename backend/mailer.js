// mailer.js
const nodemailer = require('nodemailer');

// Create and configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Your email
    pass: process.env.EMAIL_PASS,  // Your email password or app password
  },
});

module.exports = transporter;
