const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const BlacklistedToken = require('../models/BlacklistedToken');
const { protect } = require('../middleware/auth');
require('dotenv').config();

// Generate JWT
const generateAuthToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /auth/registerUser
// @desc    Register a new user
// @access  Public
router.post('/registerUser', async (req, res) => {
  try {
    const { userName, userEmail, userPassword } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ userEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      userName,
      userEmail,
      userPassword
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        token: generateAuthToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /auth/loginUser
// @desc    Authenticate user & get token
// @access  Public
router.post('/loginUser', async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    // Check for user email
    const user = await User.findOne({ userEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(userPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      token: generateAuthToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /auth/forgotUserPassword
// @desc    Send password reset email
// @access  Public
router.post('/forgotUserPassword', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set token and expiration on user account
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create email transport
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Compose email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) requested a password reset. 
      Please click on the following link, or paste it into your browser to complete the process: 
      ${resetUrl}
      If you did not request this, please ignore this email and your password will remain unchanged.`
    };

    // Send email
    await transporter.sendMail(message);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /auth/resetUserPassword/:token
// @desc    Reset password
// @access  Public
router.post('/resetUserPassword/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    // Find user by reset token and check if expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Update password and clear reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /auth/logoutUser
// @desc    Logout user and invalidate token
// @access  Private
router.post('/logoutUser', protect, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    // Get token expiration from JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tokenExpiry = new Date(decoded.exp * 1000); // Convert Unix timestamp to Date object

    // Add token to blacklist
    await BlacklistedToken.create({
      tokenString: token,
      tokenExpiry: tokenExpiry
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;