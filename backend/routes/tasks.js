import express from 'express';
import Task from '../models/Task.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();
router.use(protect);

// GET /api/tasks - Get tasks based on role
router.get('/', async (req, res) => {
  try {
    const { role, _id } = req.user;
    let tasks;

    if (role === 'Admin') {
      tasks = await Task.find({}).populate('assignedTo assignedBy', 'firstName lastName email');
    } else if (role === 'HR') {
      tasks = await Task.find({}).populate('assignedTo assignedBy', 'firstName lastName email');
    } else if (role === 'Manager') {
      const employees = await User.find({ managerId: _id }).select('_id');
      const employeeIds = employees.map(emp => emp._id);
      employeeIds.push(_id);
      tasks = await Task.find({ 
        $or: [
          { assignedTo: { $in: employeeIds } },
          { assignedBy: _id }
        ]
      }).populate('assignedTo assignedBy', 'firstName lastName email');
    } else {
      // Employee tasks
      tasks = await Task.find({ assignedTo: _id }).populate('assignedBy', 'firstName lastName email');
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// POST /api/tasks - Assign a task (Manager or Admin)
router.post('/', authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const { title, description, assignedTo, category, dueDate } = req.body;
    
    // If Manager, ensure they are assigning to their own report
    if (req.user.role === 'Manager') {
      const employee = await User.findById(assignedTo);
      if (!employee || employee.managerId?.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Can only assign tasks to your direct reports' });
      }
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      category,
      dueDate
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PUT /api/tasks/:id/status - Employee updates status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Only the assigned employee, manager, or admin can update status
    if (task.assignedTo.toString() !== req.user.id && !['Admin', 'Manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.status = status;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
