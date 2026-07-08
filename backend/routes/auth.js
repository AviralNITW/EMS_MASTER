import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const router = express.Router();

// General unified login (Handles all roles)
const loginUser = async (req, res, roleContext) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Since we introduced matchPassword with bcrypt support, but old db has plain text
    // We will do a fallback for plain text to support legacy data during transition
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userResponse = user.toObject();
    delete userResponse.password;
    
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({ 
      message: 'Login successful',
      user: { ...userResponse, token },
      userType: user.role, // Admin, HR, Manager, Employee
      token,
      accessToken: token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/employee/login
// POST /api/auth/admin/login
// We point both legacy endpoints to the new unified login
router.post('/employee/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], (req, res) => loginUser(req, res, 'Employee'));

router.post('/admin/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], (req, res) => loginUser(req, res, 'Admin'));

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], (req, res) => loginUser(req, res, 'Any'));

// Admin signup (simplified for unified model)
router.post('/admin/signup', [
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;
    
    // Strict Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email exists' });

    // Split name into firstName and lastName
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Admin';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const newAdmin = new User({ email, password, firstName, lastName, role: 'Admin' });
    await newAdmin.save();

    const token = jwt.sign(
      { id: newAdmin._id.toString(), role: 'Admin', email: newAdmin.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      message: 'Admin account created successfully',
      user: { ...newAdmin.toObject(), token },
      userType: 'Admin',
      token,
      accessToken: token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/request-otp
router.post('/request-otp', [
  body('email').isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 10 minutes from now
    const otpExpires = new Date(Date.now() + 10 * 60000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Log the OTP for development purposes
    console.log(`\n========================================`);
    console.log(`OTP for ${email}: ${otp}`);
    console.log(`========================================\n`);

    // Setup Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'emsmaster456@gmail.com',
        pass: process.env.EMAIL_PASS || 'ems@456890'
      }
    });

    const mailOptions = {
      from: '"EMS System" <emsmaster456@gmail.com>',
      to: email,
      subject: 'Your EMS Login OTP',
      text: `Your One-Time Password for EMS login is: ${otp}\nThis code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">EMS Login Request</h2>
          <p>Your One-Time Password (OTP) for secure login is:</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #ef4444; font-size: 14px;">This code will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 30px;" />
          <p style="font-size: 12px; color: #888;">If you didn't request this login, please ignore this email or contact the system administrator.</p>
        </div>
      `
    };

    // Attempt to send email
    try {
      await transporter.sendMail(mailOptions);
      console.log('OTP email sent successfully.');
    } catch (mailError) {
      console.error('Failed to send OTP email:', mailError);
      // We don't block the UI if email fails, it will still log to console
    }

    res.json({ message: 'OTP processed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/login-otp
router.post('/login-otp', [
  body('email').isEmail(),
  body('otp').isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(401).json({ message: 'OTP has expired' });
    }

    // Clear OTP after successful login
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpires;
    
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({ 
      message: 'Login successful',
      user: { ...userResponse, token },
      userType: user.role,
      token,
      accessToken: token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
