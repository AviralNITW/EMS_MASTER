import express from 'express';
import Announcement from '../models/Announcement.js';
import { protect as auth } from '../middleware/auth.js';

const router = express.Router();

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  }
};

router.get('/', auth, async (req, res) => {
  try {
    const query = { $or: [{ targetRole: 'All' }, { targetRole: req.user.role }] };
    const announcements = await Announcement.find(query).populate('author', 'firstName lastName').sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const announcement = new Announcement({
      ...req.body,
      author: req.user._id
    });
    const savedAnnouncement = await announcement.save();
    const populated = await savedAnnouncement.populate('author', 'firstName lastName');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
