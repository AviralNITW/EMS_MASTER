import express from 'express';
import { body, validationResult } from 'express-validator';
import Admin from '../models/Admin.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/admin/employee/:employeeId - Get admin by employee ID
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Validate employee ID
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }
    
    // Find admin that has this employee
    const admin = await Admin.findOne(
      { 'employees._id': employeeId },
      { 'employees.$': 1 } // Only return the matching employee
    );
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found for this employee' });
    }
    
    // Return the admin ID and the employee data
    res.json({
      adminId: admin._id,
      employee: admin.employees[0]
    });
  } catch (error) {
    console.error('Error finding admin by employee ID:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// GET /api/admin/tasks/pending-verification - Get all tasks pending verification
router.get('/tasks/pending-verification', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const adminId = req.query.adminId || req.admin?._id;
    
    if (!adminId) {
      console.error('No admin ID found in request');
      return res.status(400).json({ message: 'Admin ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: 'Invalid admin ID format' });
    }

    // Get the admin document
    const adminDoc = await Admin.findById(adminId).lean();
    if (!adminDoc) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // First, get all pending tasks for the admin's employees
    const pendingTasks = [];
    let totalPendingTasks = 0;
    
    adminDoc.employees.forEach(employee => {
      if (employee.tasks) {
        const employeePendingTasks = employee.tasks.filter(
          task => task.verificationStatus === 'pending' && 
                 (task.completed || (task.submittedDocuments && task.submittedDocuments.length > 0))
        );
        
        totalPendingTasks += employeePendingTasks.length;
        
        employeePendingTasks.forEach(task => {
          pendingTasks.push({
            taskId: task._id,
            title: task.title || 'Untitled Task',
            description: task.description,
            dueDate: task.dueDate,
            status: task.status,
            verificationStatus: task.verificationStatus,
            employee: {
              id: employee._id,
              name: `${employee.firstName} ${employee.lastName}`,
              email: employee.email
            },
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          });
        });
      }
    });
    
    // Apply pagination
    const totalPages = Math.ceil(totalPendingTasks / limit);
    const paginatedTasks = pendingTasks.slice(skip, skip + limit);

    res.json({
      success: true,
      data: paginatedTasks,
      pagination: {
        page,
        limit,
        total: totalPendingTasks,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error in /tasks/pending-verification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Debug route to check tasks with more detailed information
router.get('/debug/verification-tasks', async (req, res) => {
  try {
    const admins = await Admin.find({}, { 'employees.tasks': 1, 'employees.email': 1, 'employees.firstName': 1, 'employees.lastName': 1 });
    
    const allTasks = [];
    
    admins.forEach(admin => {
      admin.employees.forEach(employee => {
        (employee.tasks || []).forEach(task => {
          const taskData = {
            taskId: task._id,
            taskTitle: task.taskTitle,
            verificationStatus: task.verificationStatus,
            status: task.status,
            completed: task.completed,
            active: task.active,
            newTask: task.newTask,
            failed: task.failed,
            hasDocuments: (task.submittedDocuments?.length || 0) > 0,
            documentCount: task.submittedDocuments?.length || 0,
            employee: {
              id: employee._id,
              email: employee.email,
              name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
            },
            adminId: admin._id,
            taskDate: task.taskDate,
            endDate: task.endDate,
            category: task.category,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          };
          
          // Log tasks that should appear in verification
          if (task.verificationStatus === 'pending' && (task.completed || task.submittedDocuments?.length > 0)) {
            console.log('Task eligible for verification:', {
              taskId: task._id,
              title: task.taskTitle,
              status: task.status,
              verificationStatus: task.verificationStatus,
              completed: task.completed,
              hasDocuments: task.submittedDocuments?.length > 0,
              documentCount: task.submittedDocuments?.length || 0
            });
          }
          
          allTasks.push(taskData);
        });
      });
    });

    const pendingVerificationTasks = allTasks.filter(t => t.verificationStatus === 'pending');
    const eligibleForVerification = allTasks.filter(t => 
      t.verificationStatus === 'pending' && 
      (t.completed || t.hasDocuments)
    );

    res.json({
      totalTasks: allTasks.length,
      pendingVerificationCount: pendingVerificationTasks.length,
      eligibleForVerificationCount: eligibleForVerification.length,
      eligibleForVerification: eligibleForVerification,
      tasks: allTasks
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ 
      message: 'Debug error', 
      error: error.message,
      stack: error.stack
    });
  }
});

// In backend/routes/admin.js
router.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    memoryUsage: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    },
    uptime: process.uptime()
  });
});

// GET /api/admin - Get all admins
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/:id - Get admin by ID with pagination
router.get('/:id', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Only select necessary fields and populate employees with pagination
    const admin = await Admin.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $project: {
          _id: 1,  // Ensure _id is always included
          email: 1,
          name: 1,
          createdAt: 1,
          updatedAt: 1,
          employees: {
            $slice: [
              {
                $map: {
                  input: { $ifNull: ['$employees', []] },
                  as: 'emp',
                  in: {
                    _id: '$$emp._id',
                    firstName: '$$emp.firstName',
                    lastName: '$$emp.lastName',
                    email: '$$emp.email',
                    position: '$$emp.position',
                    department: '$$emp.department',
                    taskCounts: '$$emp.taskCounts',
                    tasks: {
                      $filter: {
                        input: { $ifNull: ['$$emp.tasks', []] },
                        as: 'task',
                        cond: { 
                          $in: ['$$task.status', ['active', 'pendingVerification']]
                        }
                      }
                    },
                    taskCount: { $size: { $ifNull: ['$$emp.tasks', []] } }
                  }
                }
              },
              skip,
              limit
            ]
          }
        }
      }
    ]);

    if (!admin || admin.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Get total count of employees for pagination
    const totalEmployees = await Admin.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      { $project: { count: { $size: { $ifNull: ['$employees', []] } } } }
    ]);

    const total = totalEmployees[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    const result = {
      ...admin[0],
      pagination: {
        currentPage: page,
        totalPages,
        totalEmployees: total,
        employeesPerPage: limit
      }
    };

    // Ensure essential fields are present
    if (!result._id) {
      console.error('Admin aggregation missing _id field:', result);
      result._id = req.params.id;
    }

    // Ensure employees array exists
    if (!result.employees) {
      result.employees = [];
    }

    console.log('Admin GET response for ID:', req.params.id, 'has _id:', !!result._id, 'employees count:', result.employees?.length || 0);

    res.json(result);
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// POST /api/admin - Create new admin
router.post('/', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const admin = new Admin({
      email,
      password
    });

    // Save only validating modified paths to avoid failing on unrelated legacy fields
    await admin.save({ validateModifiedOnly: true });
    
    // Return admin without password
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    
    res.status(201).json(adminResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/admin/login - Admin login
router.post('/login', [
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
    
    res.json({ 
      message: 'Login successful',
      admin: adminResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/:id - Update admin
router.put('/:id', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (email) admin.email = email;
    if (password) admin.password = password;

    // Ensure Mongoose tracks subdocument changes properly
    admin.markModified('employees');
    await admin.save({ validateModifiedOnly: true });
    
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    
    res.json(adminResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/admin/:id - Delete admin
router.delete('/:id', async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/admin/:adminId/employees/:employeeId/tasks - Create a new task for an employee
router.post('/:adminId/employees/:employeeId/tasks', async (req, res) => {
  try {
    const { adminId, employeeId } = req.params;
    const taskData = req.body;
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adminId) || 
        !mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    // Validate required fields (taskDate is set by server, so not required from client)
    if (!taskData.taskTitle || !taskData.taskDescription || !taskData.endDate || !taskData.category) {
      return res.status(400).json({ message: 'Missing required task fields' });
    }
    
    // Optional: ensure the requester matches the admin in path (defense in depth)
    if (req.user && req.user.role === 'admin' && req.user.id && req.user.id.toString() !== adminId.toString()) {
      return res.status(403).json({ message: 'Forbidden: cannot modify other admin data' });
    }

    // Validate dates
    // Set task start time on server to avoid client clock/timezone issues
    const parsedTaskDate = new Date();
    const parsedEndDate = new Date(taskData.endDate);
    if (isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ message: 'Invalid endDate format. Expect ISO string.' });
    }
    // Allow a small grace (30 seconds) so endDate on the same minute is accepted
    const GRACE_MS = 30 * 1000;
    if (parsedEndDate.getTime() <= parsedTaskDate.getTime() + GRACE_MS) {
      return res.status(400).json({ message: 'End date/time must be slightly after current time' });
    }

    // Create new task object with default values
    const newTask = {
      _id: new mongoose.Types.ObjectId(),
      taskTitle: taskData.taskTitle,
      taskDescription: taskData.taskDescription,
      taskDate: parsedTaskDate,
      endDate: parsedEndDate,
      category: taskData.category,
      active: false,
      newTask: true,
      completed: false,
      failed: false,
      verificationStatus: '',
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Atomically push the new task to avoid full-document validation side effects
    const adminObjectId = new mongoose.Types.ObjectId(adminId);
    const employeeObjectId = new mongoose.Types.ObjectId(employeeId);
    const pushResult = await Admin.updateOne(
      { _id: adminObjectId, 'employees._id': employeeObjectId },
      { $push: { 'employees.$.tasks': newTask } },
      { runValidators: false }
    );
    if (!pushResult || pushResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Admin or employee not found' });
    }

    // Recompute taskCounts in memory and persist via a focused $set
    const adminDoc = await Admin.findById(adminId).lean();
    if (!adminDoc) {
      return res.status(404).json({ message: 'Admin not found after push' });
    }
    const emp = (adminDoc.employees || []).find(e => e._id.toString() === employeeId.toString());
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found after push' });
    }
    const tasks = Array.isArray(emp.tasks) ? emp.tasks : [];
    const taskCounts = {
      completed: tasks.filter(t => t.completed === true).length,
      failed: tasks.filter(t => t.failed === true && t.completed !== true).length,
      active: tasks.filter(t => t.active === true && t.completed !== true && t.failed !== true).length,
      newTask: tasks.filter(t => t.newTask === true && t.active !== true && t.completed !== true && t.failed !== true).length,
    };

    await Admin.updateOne(
      { _id: adminObjectId, 'employees._id': employeeObjectId },
      { $set: { 'employees.$.taskCounts': taskCounts } },
      { runValidators: false }
    );

    // Respond with the newly created task
    res.status(201).json(newTask);
  } catch (error) {
    const payload = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
    // Include validation errors if present
    if (error.name === 'ValidationError' && error.errors) {
      payload.validationErrors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key]?.message || String(error.errors[key]);
        return acc;
      }, {});
    }
    console.error('Error creating task:', payload);
    if (process.env.NODE_ENV === 'development') {
      console.error('Request body:', req.body);
      console.error('Params:', req.params);
    }
    const status = payload.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ 
      message: 'Error creating task', 
      error: payload
    });
  }
});

// PUT /api/admin/:adminId/employees/:employeeId/tasks/:taskId - Update a task for an employee
router.put('/:adminId/employees/:employeeId/tasks/:taskId', async (req, res) => {
  try {
    const { adminId, employeeId, taskId } = req.params;
    const updateData = req.body;
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adminId) || 
        !mongoose.Types.ObjectId.isValid(employeeId) || 
        !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    // Find the admin and update the task in one operation
    const result = await Admin.findOneAndUpdate(
      { 
        _id: adminId,
        'employees._id': employeeId,
        'employees.tasks._id': taskId
      },
      { 
        $set: {
          'employees.$.tasks.$[task]': {
            ...updateData,
            _id: taskId, // Preserve the task ID
            updatedAt: new Date()
          }
        }
      },
      {
        arrayFilters: [{ 'task._id': taskId }],
        new: true
      }
    );
    
    if (!result) {
      return res.status(404).json({ message: 'Admin, employee, or task not found' });
    }
    
    // Find the updated task to return it
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found after update' });
    }
    
    const employee = admin.employees.id(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found after update' });
    }
    
    const updatedTask = employee.tasks.id(taskId);
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found after update' });
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ 
      message: 'Failed to update task', 
      error: error.message 
    });
  }
});

export default router;
