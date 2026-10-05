import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';
import { sendVerificationEmail } from '../utils/emailService.js';

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
    if (!name || !email || !password || !institution) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!isValidCollegeEmail(email)) {
      return res.status(400).json({ message: 'Only @tkmce.ac.in email addresses are allowed to register.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const finalHomeCampus = homeCampus || institution || 'Main Campus';

    // Use Mongoose findOne to check for existing email
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      // If user is already verified, block duplicate registration
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'An account with this email already exists' });
      }

      // If user registered previously but never completed OTP verification:
      // Refresh OTP and update details so they can complete verification
      const salt = await bcrypt.genSalt(10);
      userExists.passwordHash = await bcrypt.hash(password, salt);
      userExists.name = name;
      userExists.institution = institution;
      userExists.homeCampus = finalHomeCampus;
      userExists.verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
      userExists.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
      userExists.referredBy = referredBy || null;
      await userExists.save();

      // Send verification email via Nodemailer asynchronously in background
      sendVerificationEmail(normalizedEmail, userExists.verificationOTP, userExists.name)
        .catch(err => console.error('[EMAIL BACKGROUND ERROR]:', err.message));

      return res.status(200).json({
        message: 'A new verification OTP has been sent to your email.',
        email: userExists.email
      });
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
      email: normalizedEmail,
      passwordHash,
      institution,
      homeCampus: finalHomeCampus,
      verificationOTP: otp,
      otpExpiresAt,
      referredBy: referredBy || null,
      isVerified: false
    });

    // Send verification email via Nodemailer asynchronously in background
    sendVerificationEmail(normalizedEmail, otp, name)
      .catch(err => console.error('[EMAIL BACKGROUND ERROR]:', err.message));

    res.status(201).json({
      message: 'Signup successful. A verification OTP has been sent to your email.',
      email: user.email
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
        referralCredits: user.referralCredits,
        bio: user.bio || '',
        phone: user.phone || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified. Please log in.' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    sendVerificationEmail(user.email, otp, user.name)
      .catch(err => console.error('[EMAIL BACKGROUND ERROR]:', err.message));

    res.json({
      message: 'A new verification OTP has been sent to your email.'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
        referralCredits: user.referralCredits,
        bio: user.bio || '',
        phone: user.phone || ''
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
    bio: user.bio || '',
    phone: user.phone || '',
    isVerified: user.isVerified
  });
});

// @desc    Update user profile & password
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { name, bio, phone, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (phone !== undefined) user.phone = phone.trim();

    // Password change verification if requested
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }
      if (currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password does not match' });
        }
      }
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        institution: user.institution,
        homeCampus: user.homeCampus,
        referralCode: user.referralCode,
        referralCredits: user.referralCredits,
        bio: user.bio || '',
        phone: user.phone || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Clean all accounts and related records (strictly via Mongoose)
// @route   GET & POST /api/auth/clean-accounts
// @access  Public
router.all('/clean-accounts', async (req, res) => {
  try {
    const u = await User.deleteMany({});
    const l = await Listing.deleteMany({});
    const b = await Booking.deleteMany({});
    const c = await Conversation.deleteMany({});
    const m = await Message.deleteMany({});

    res.json({
      message: 'All accounts and related data cleaned successfully',
      deleted: {
        users: u.deletedCount,
        listings: l.deletedCount,
        bookings: b.deletedCount,
        conversations: c.deletedCount,
        messages: m.deletedCount
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
