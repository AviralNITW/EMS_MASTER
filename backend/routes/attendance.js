import express from 'express';
import Attendance from '../models/Attendance.js';
import { protect as auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee' || req.user.role === 'Manager') {
      query.employee = req.user._id;
    }
    const attendance = await Attendance.find(query).populate('employee', 'firstName lastName role').sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/clock-in', auth, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ employee: req.user._id, date: { $gte: startOfDay } });
    if (attendance && attendance.clockIn) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }

    if (!attendance) {
      attendance = new Attendance({ employee: req.user._id, date: new Date() });
    }
    
    attendance.clockIn = new Date();
    attendance.status = 'Present';
    await attendance.save();
    
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/clock-out', auth, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ employee: req.user._id, date: { $gte: startOfDay } });
    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({ message: 'No clock-in found for today' });
    }
    if (attendance.clockOut) {
      return res.status(400).json({ message: 'Already clocked out today' });
    }

    attendance.clockOut = new Date();
    const hours = Math.abs(attendance.clockOut - attendance.clockIn) / 36e5;
    attendance.totalHours = parseFloat(hours.toFixed(2));
    
    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
