import express from 'express';
import User from '../models/User.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// GET /api/users - Get users based on role
router.get('/', async (req, res) => {
  try {
    const { role } = req.user;
    let users;

    if (role === 'Admin') {
      // Admin sees everyone
      users = await User.find({}).select('-password').populate('managerId', 'firstName lastName email');
    } else if (role === 'HR') {
      // HR sees everyone except Admins
      users = await User.find({ role: { $ne: 'Admin' } }).select('-password').populate('managerId', 'firstName lastName email');
    } else if (role === 'Manager') {
      // Manager sees their direct reports AND themselves
      users = await User.find({ 
        $or: [
          { managerId: req.user._id },
          { _id: req.user._id }
        ]
      }).select('-password');
    } else {
      // Employee sees themselves
      users = await User.find({ _id: req.user._id }).select('-password');
    }
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// POST /api/users - Create a new user (Admin/HR only)
router.post('/', authorizeRoles('Admin', 'HR'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, managerId } = req.body;
    
    // Prevent HR from creating Admins
    if (req.user.role === 'HR' && role === 'Admin') {
      return res.status(403).json({ message: 'HR cannot create Admin accounts' });
    }

    // Strict Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const user = new User({
      firstName, lastName, email, password, role, department, managerId
    });

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// GET /api/users/:id - Get specific user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Check permissions
    if (req.user.role === 'Employee' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'Manager' && user.managerId?.toString() !== req.user.id && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to view this employee' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
