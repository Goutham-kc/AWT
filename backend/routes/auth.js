import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Only @tkmce.ac.in emails are allowed to register
const isValidCollegeEmail = (email) => {
  return email.toLowerCase().trim().endsWith('@tkmce.ac.in');
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
  const { name, email, password, institution, homeCampus, referredBy } = req.body;

  try {
    if (!name || !email || !password || !institution || !homeCampus) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!isValidCollegeEmail(email)) {
      return res.status(400).json({ message: 'Only @tkmce.ac.in email addresses are allowed to register.' });
    }

    // Use Mongoose findOne to check for duplicate email
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP and set expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Create and save user document via Mongoose
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      institution,
      homeCampus,
      verificationOTP: otp,
      otpExpiresAt,
      referredBy: referredBy || null,
      isVerified: false
    });

    console.log(`[MOCK EMAIL SERVICE] OTP for ${email}: ${otp}`);

    res.status(201).json({
      message: 'Signup successful. A verification OTP has been sent to your email.',
      email: user.email,
      otp // Return OTP in response for mock/test convenience
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify OTP and auto-login
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Use Mongoose findOne to find the pending user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified. Please log in.' });
    }

    if (user.verificationOTP !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Generate a unique referral code for this verified user
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const baseCode = user.name.replace(/\s+/g, '').toUpperCase().slice(0, 5);
    const referralCode = `${baseCode}-${randomSuffix}`;

    // Apply referral credits if user signed up with a referral code
    let creditAppliedMessage = '';
    if (user.referredBy) {
      const inviter = await User.findOne({ referralCode: user.referredBy });
      if (inviter) {
        inviter.referralCredits += 50;
        await inviter.save();
        user.referralCredits += 50;
        creditAppliedMessage = ' Referral credit applied! You both earned 50 credits.';
      }
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.verificationOTP = null;
    user.otpExpiresAt = null;
    user.referralCode = referralCode;
    await user.save();

    // Issue a JWT token so user is automatically logged in after verification
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'supersecretjwtkeyforstudentrentalhubdev',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: `Account verified successfully.${creditAppliedMessage}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        institution: user.institution,
        homeCampus: user.homeCampus,
        referralCode: user.referralCode,
        referralCredits: user.referralCredits
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Use Mongoose findOne to look up user by email (normalize to lowercase)
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your account before logging in.' });
    }

    // Use bcrypt to compare the provided password against the stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'supersecretjwtkeyforstudentrentalhubdev',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        institution: user.institution,
        homeCampus: user.homeCampus,
        referralCode: user.referralCode,
        referralCredits: user.referralCredits
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  // req.user is the Mongoose document (minus passwordHash) populated by protect middleware
  const user = req.user;
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    institution: user.institution,
    homeCampus: user.homeCampus,
    referralCode: user.referralCode,
    referralCredits: user.referralCredits,
    isVerified: user.isVerified
  });
});

export default router;
