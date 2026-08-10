import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get referral summary, invitees, and credits earned
// @route   GET /api/referrals/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const userCode = req.user.referralCode;

    if (!userCode) {
      return res.json({
        referralCode: null,
        referralCredits: req.user.referralCredits,
        inviteesCount: 0,
        invitees: []
      });
    }

    // Find users referred by this user
    const invitees = await User.find({ referredBy: userCode })
      .select('name isVerified createdAt')
      .sort({ createdAt: -1 });

    res.json({
      referralCode: userCode,
      referralCredits: req.user.referralCredits,
      inviteesCount: invitees.length,
      invitees: invitees.map(invitee => ({
        name: invitee.name,
        isVerified: invitee.isVerified,
        joinedAt: invitee.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
