import express from 'express';
import Department from '../models/Department.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all departments
router.get('/', protect, async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching departments' });
  }
});

// Create a department (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if exists
    let dept = await Department.findOne({ name });
    if (dept) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    dept = new Department({ name, description });
    await dept.save();

    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating department' });
  }
});

export default router;
