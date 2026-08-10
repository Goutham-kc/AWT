import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to validate whitelisted college domains
const isValidCollegeEmail = (email) => {
  const domains = ['.edu', '.ac.in', '.edu.in', '.edu.co', '.edu.sg'];
  const emailLower = email.toLowerCase();
  return domains.some(domain => emailLower.endsWith(domain));
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
      return res.status(400).json({ message: 'Registration is restricted to whitelisted college email domains (e.g. .edu, .ac.in)' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate 6-digit verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    const user = await User.create({
      name,
      email,
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

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.verificationOTP !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Generate a unique referral code for this user
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 digit code
    const baseCode = user.name.replace(/\s+/g, '').toUpperCase().slice(0, 5);
    const referralCode = `${baseCode}-${randomSuffix}`;

    // Verify and apply referral if present
    let creditAppliedMessage = '';
    if (user.referredBy) {
      const inviter = await User.findOne({ referralCode: user.referredBy });
      if (inviter) {
        inviter.referralCredits += 50; // Give inviter 50 credits
        await inviter.save();
        
        user.referralCredits += 50; // Give invitee 50 credits
        creditAppliedMessage = ' Referral credit applied! You both earned 50 credits.';
      }
    }

    user.isVerified = true;
    user.verificationOTP = null;
    user.otpExpiresAt = null;
    user.referralCode = referralCode;
    await user.save();

    res.status(200).json({
      message: `Account verified successfully.${creditAppliedMessage}`,
      referralCode: user.referralCode
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
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your account first.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
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

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

export default router;
