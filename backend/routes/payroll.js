import express from 'express';
import Payroll from '../models/Payroll.js';
import { protect as auth, admin as restrictTo } from '../middleware/auth.js';
// The project uses `protect` instead of `auth`. And `admin` instead of `restrictTo`.
// Wait, I should check how `middleware/auth.js` is structured.
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee' || req.user.role === 'Manager') {
      query.employee = req.user._id;
    }
    const payrolls = await Payroll.find(query).populate('employee', 'firstName lastName role email');
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Since `admin` middleware might just check for 'Admin' role, I'll need a custom role checker if I need HR.
// Let's write a simple middleware here for now, or check `auth.js`.
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  }
};

router.post('/', auth, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const payroll = new Payroll(req.body);
    const savedPayroll = await payroll.save();
    res.status(201).json(savedPayroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/status', auth, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const { status } = req.body;
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
    
    payroll.status = status;
    const updatedPayroll = await payroll.save();
    res.json(updatedPayroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
