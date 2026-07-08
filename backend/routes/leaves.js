import express from 'express';
import LeaveRequest from '../models/LeaveRequest.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();
router.use(protect);

// GET /api/leaves
router.get('/', async (req, res) => {
  try {
    const { role, _id } = req.user;
    let leaves;

    if (role === 'Admin') {
      leaves = await LeaveRequest.find({}).populate('employeeId', 'firstName lastName email');
    } else if (role === 'HR') {
      // HR sees all approved by manager, or all leaves? Usually HR needs to see all leaves to manage them.
      leaves = await LeaveRequest.find({}).populate('employeeId', 'firstName lastName email');
    } else if (role === 'Manager') {
      // Find employees reporting to this manager
      const employees = await User.find({ managerId: _id }).select('_id');
      const employeeIds = employees.map(emp => emp._id);
      employeeIds.push(_id); // Include Manager's own leaves
      
      leaves = await LeaveRequest.find({ employeeId: { $in: employeeIds } }).populate('employeeId', 'firstName lastName email');
    } else {
      // Employee sees only their own leaves
      leaves = await LeaveRequest.find({ employeeId: _id }).populate('employeeId', 'firstName lastName email');
    }
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// POST /api/leaves - Employee requests leave
router.post('/', async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const leave = new LeaveRequest({
      employeeId: req.user._id,
      type,
      startDate,
      endDate,
      reason
    });
    
    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PUT /api/leaves/:id/status - Manager or HR updates status
router.put('/:id/status', authorizeRoles('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const { status, note } = req.body;
    const leave = await LeaveRequest.findById(req.params.id);
    
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    
    if (req.user.role === 'Manager') {
      leave.managerNote = note || leave.managerNote;
      // Manager can only approve to 'Manager_Approved' or 'Rejected'
      if (status === 'Approved') {
        leave.status = 'Manager_Approved';
      } else {
        leave.status = status;
      }
    } else {
      leave.hrNote = note || leave.hrNote;
      leave.status = status;
    }
    
    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
