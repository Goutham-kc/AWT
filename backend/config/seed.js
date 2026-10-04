import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Listing from '../models/Listing.js';

export const seedInitialData = async () => {
  try {
    const listingCount = await Listing.countDocuments();
    if (listingCount > 0) {
      return;
    }

    console.log('[SEED] No listings found. Seeding initial TKMCE campus equipment...');

    // 1. Ensure verified TKMCE campus equipment pool account exists
    let campusUser = await User.findOne({ email: 'campus.store@tkmce.ac.in' });
    if (!campusUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('tkmce123', salt);
      campusUser = await User.create({
        name: 'TKMCE Campus Equipment Hub',
        email: 'campus.store@tkmce.ac.in',
        passwordHash,
        institution: 'TKM College of Engineering',
        homeCampus: 'TKMCE Kollam',
        isVerified: true,
        referralCode: 'TKMCE-100',
        referralCredits: 200
      });
      console.log('[SEED] Created campus demo account: campus.store@tkmce.ac.in (pw: tkmce123)');
    }

    // 2. Create standard TKMCE student rental listings
    const sampleListings = [
      {
        title: 'Mini Drafter & Engineering Graphics Drawing Set',
        description: 'Heavy-duty steel-arm mini drafter with clamp, T-square, and set squares. In excellent condition, essential for 1st & 2nd semester Engineering Graphics.',
        category: 'utilities',
        condition: 'Like New',
        pricePerDay: 10,
        deposit: 50,
        imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
        location: 'Mechanical Dept, Ground Floor',
        campus: 'TKMCE Kollam',
        lister: campusUser._id,
        allowDirectBooking: true,
        availabilityStatus: 'available'
      },
      {
        title: 'Casio fx-991EX ClassWiz Scientific Calculator',
        description: 'High-resolution LCD display with matrix calculation, equation solvers, and numerical integration. Allowed in University end-semester examinations.',
        category: 'electronics',
        condition: 'Good',
        pricePerDay: 15,
        deposit: 80,
        imageUrl: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=600&q=80',
        location: 'Hostel Block A, Common Room',
        campus: 'TKMCE Kollam',
        lister: campusUser._id,
        allowDirectBooking: true,
        availabilityStatus: 'available'
      },
      {
        title: 'Hero Sprint Pro 21-Speed Gear Bicycle',
        description: 'Smooth alloy-frame bicycle with front suspension and dual disc brakes. Perfect for campus commuting between hostels, library, and the main gate.',
        category: 'cycles',
        condition: 'Good',
        pricePerDay: 25,
        deposit: 150,
        imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
        location: 'Main Gate Cycle Stand',
        campus: 'TKMCE Kollam',
        lister: campusUser._id,
        allowDirectBooking: true,
        availabilityStatus: 'available'
      },
      {
        title: 'Higher Engineering Mathematics (44th Ed) - B.S. Grewal',
        description: 'Standard textbook for multivariable calculus, linear algebra, Laplace transforms, and complex analysis. Clean pages with zero markings.',
        category: 'textbooks',
        condition: 'Like New',
        pricePerDay: 8,
        deposit: 40,
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        location: 'Central Library Steps',
        campus: 'TKMCE Kollam',
        lister: campusUser._id,
        allowDirectBooking: true,
        availabilityStatus: 'available'
      },
      {
        title: 'Arduino Uno R3 & IoT Sensor Development Kit',
        description: 'Includes Arduino Uno board, breadboard, jumper wires, ultrasonic sensors, relay module, and LCD display. Ideal for mini-projects & lab experiments.',
        category: 'electronics',
        condition: 'Like New',
        pricePerDay: 30,
        deposit: 200,
        imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80',
        location: 'ECE / Robotics Club Room',
        campus: 'TKMCE Kollam',
        lister: campusUser._id,
        allowDirectBooking: true,
        availabilityStatus: 'available'
      },
      {
        title: 'Compact Foldable Study Table & Mesh Office Chair',
        description: 'Sturdy wooden top foldable desk with cup holder and breathable mesh swivel chair. Ideal for hostel rooms during exam prep.',
        category: 'furniture',
        condition: 'Good',
        pricePerDay: 20,
        deposit: 120,
        imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
        location: 'Hostel Block B, 1st Floor',
        campus: 'TKMCE Kollam',
        lister: campusUser._id,
        allowDirectBooking: true,
        availabilityStatus: 'available'
      }
    ];

    await Listing.insertMany(sampleListings);
    console.log(`[SEED] Successfully seeded ${sampleListings.length} initial TKMCE rental listings!`);
  } catch (error) {
    console.warn(`[SEED WARNING] Failed to seed initial data: ${error.message}`);
  }
};
