import express from 'express';
import { body, validationResult } from 'express-validator';
import Employee from '../models/Employee.js';
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/employee/login - Employee login (search across all admin documents)
router.post('/employee/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log('🔍 Looking for employee with email:', email);

    // Find admin that contains this employee
    const admin = await Admin.findOne({ 'employees.email': email });
    if (!admin) {
      console.log('❌ Employee not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Find the specific employee within the admin's employees array
    const employee = admin.employees.find(emp => emp.email === email);
    if (!employee) {
      console.log('❌ Employee not found in admin document');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    console.log('🔐 Comparing passwords...');
    console.log('- Stored password:', employee.password);
    console.log('- Provided password:', password);
    console.log('- Passwords match:', employee.password === password);
    
    if (employee.password !== password) {
      console.log('❌ Password mismatch!');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return employee data without password
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;
    
    // Also include admin ID for reference
    employeeResponse.adminId = admin._id;
    
    console.log('✅ Employee login successful:', employee.firstName);
    
    res.json({ 
      message: 'Login successful',
      user: employeeResponse,
      userType: 'employee',
      adminId: admin._id
    });
  } catch (error) {
    console.error('❌ Employee login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/admin/login - Admin login
router.post('/admin/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password (in production, use bcrypt)
    if (admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return admin without password
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    // Sign JWT with admin id
    const token = jwt.sign(
      { id: admin._id.toString(), role: 'admin', email: admin.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ 
      message: 'Login successful',
      user: { ...adminResponse, token },
      userType: 'admin',
      token,              // direct token field
      accessToken: token  // alternative key for compatibility
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/admin/signup - Admin signup
router.post('/admin/signup', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters'),
  body('name').notEmpty().withMessage('Name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Create new admin
    const newAdmin = new Admin({
      email,
      password, // In production, hash this with bcrypt
      name
    });

    await newAdmin.save();
    console.log('✅ New admin created:', email);

    // Return admin without password
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    // Sign JWT so a newly created admin can access protected routes immediately
    const token = jwt.sign(
      { id: newAdmin._id.toString(), role: 'admin', email: newAdmin.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.status(201).json({ 
      message: 'Admin account created successfully',
      user: { ...adminResponse, token },
      userType: 'admin',
      token,
      accessToken: token
    });
  } catch (error) {
    console.error('❌ Admin signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
