import express from 'express';
import SystemConfig from '../models/SystemConfig.js';
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

router.get('/', auth, authorize('Admin'), async (req, res) => {
  try {
    const configs = await SystemConfig.find();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, authorize('Admin'), async (req, res) => {
  try {
    const { key, value } = req.body;
    let config = await SystemConfig.findOne({ key });
    
    if (config) {
      config.value = value;
      config.lastUpdatedBy = req.user._id;
      config.updatedAt = Date.now();
      await config.save();
    } else {
      config = new SystemConfig({ key, value, lastUpdatedBy: req.user._id });
      await config.save();
    }
    
    res.status(200).json(config);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
