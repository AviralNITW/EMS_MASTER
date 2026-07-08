import express from 'express';
import Document from '../models/Document.js';
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
    const documents = await Document.find().populate('uploadedBy', 'firstName lastName').sort({ uploadDate: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const document = new Document({
      ...req.body,
      uploadedBy: req.user._id
    });
    const savedDoc = await document.save();
    const populated = await savedDoc.populate('uploadedBy', 'firstName lastName');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, authorize('Admin', 'HR'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    await document.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
