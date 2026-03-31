const express = require('express');
const router = express.Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const { registerSchema , loginSchema , otpSchema , resendOtpSchema } = require('../validation/userValidator');
const { generateOtp } = require('../utils/generateOtp');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const authMiddleware = require('../MiddleWares/authMiddleWare');
dotenv.config();


// Register a new user
router.post('/register', async (req, res) => {
   try {
    const {value , error } = registerSchema.validate(req.body , {abortEarly : false});
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { name, phone, password } = value;
    // Check if the user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }
    // Hash the password
    const HassedPassword = await bcrypt.hash(password, 10);

    // Generate a otp
    const { otp, otpExpired } = generateOtp();
    // Create a new user
    const newUser = new User({
        name,
        phone,
        password: HassedPassword,
        otp,
        otpExpired

    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
   } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
   }
});

// Login a user
router.post('/login', async (req, res) => {
    try {
        const { value, error } = loginSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { phone, password } = value;
        // Check if the user exists
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: 'Invalid phone or password' });
        }
        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid phone or password' });
        }
        // Check if the user is verified
        if (!user.isVerified) {
            return res.status(400).json({ message: 'User is not verified' });
        }
        // Generate a JWT token
        const token = jwt.sign({ userId: user._id , name : user.name , phone : user.phone }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.status(200).json({ token , name : user.name , phone : user.phone , message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { value, error } = otpSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { phone, otp } = value;
        // Check if the user exists
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: 'Invalid phone or OTP' });
        }
        // Check if the OTP is correct
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid phone or OTP' });
        }
        // Check if the OTP has expired
        if (user.otpExpired < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }
        // Mark the user as verified
        user.isVerified = true;
        user.otp = null;
        user.otpExpired = null;
        await user.save();
        res.status(200).json({ message: 'User verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { value, error } = resendOtpSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { phone } = value;
        // Check if the user exists
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        // Generate a new OTP after 60 seconds
        if (user.otpExpired > Date.now()) {
            return res.status(400).json({ message: 'Please wait before requesting a new OTP' });
        }
        const { otp, otpExpired } = generateOtp();
        user.otp = otp;
        user.otpExpired = otpExpired;
        await user.save();
        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Me 
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ name: user.name, phone: user.phone, isVerified: user.isVerified, otp: user.otp, otpExpired: user.otpExpired });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;