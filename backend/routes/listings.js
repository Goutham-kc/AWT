import express from 'express';
import Listing from '../models/Listing.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all listings with search, category, and campus filters
// @route   GET /api/listings
// @access  Public
router.get('/', async (req, res) => {
  const { campus, category, search, minPrice, maxPrice, availability } = req.query;

  try {
    let query = {};

    // 1. Campus Filter
    if (campus) {
      query.campus = { $regex: campus, $options: 'i' };
    }

    // 2. Category Filter
    if (category) {
      query.category = category;
    }

    // 3. Search text (Title/Description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 4. Price range
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    // 5. Availability Status (e.g., 'available')
    if (availability) {
      query.availabilityStatus = availability;
    } else {
      // By default, exclude paused listings in search feeds
      query.availabilityStatus = { $ne: 'paused' };
    }

    const listings = await Listing.find(query)
      .populate('lister', 'name institution homeCampus isVerified')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single listing details
// @route   GET /api/listings/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('lister', 'name institution homeCampus isVerified');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description, category, condition, pricePerDay, deposit, imageUrl, location, campus, allowDirectBooking } = req.body;

  try {
    if (!title || !description || !category || !condition || pricePerDay === undefined || deposit === undefined || !location || !campus) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const listing = await Listing.create({
      title,
      description,
      category,
      condition,
      pricePerDay: Number(pricePerDay),
      deposit: Number(deposit),
      imageUrl,
      location,
      campus,
      allowDirectBooking,
      lister: req.user._id
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update listing details or block dates
// @route   PUT /api/listings/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check ownership
    if (listing.lister.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this listing' });
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete/Archive a listing
// @route   DELETE /api/listings/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check ownership
    if (listing.lister.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this listing' });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
