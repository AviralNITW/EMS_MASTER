import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsDir}`);
  }
  // Ensure the directory is writable
  fs.accessSync(uploadsDir, fs.constants.W_OK);
} catch (error) {
  console.error('Error setting up uploads directory:', error);
  process.exit(1); // Exit if we can't create or write to the uploads directory
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    try {
      // Sanitize filename and generate unique name
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(sanitizedName) || '';
      const baseName = path.basename(sanitizedName, ext);
      const fileName = `${baseName}-${uniqueSuffix}${ext}`;
      console.log('Generated filename:', fileName);
      cb(null, fileName);
    } catch (error) {
      console.error('Error generating filename:', error);
      cb(error);
    }
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, JPG, PNG, GIF, XLS, XLSX files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to update task state based on verification status and timers
function updateTaskState(task, currentTime) {
  if (!task) return;
  
  // If task is completed, it's a terminal state - no further changes
  if (task.completed) {
    return;
  }
  
  // Check for task expiration (endDate has passed)
  if (task.endDate && new Date(task.endDate) < currentTime && !task.failed) {
    task.active = false;
    task.newTask = false;
    task.completed = false;
    task.failed = true;
    task.verificationStatus = 'expired';
    task.updatedAt = currentTime;
    return;
  }
  
  // Handle verification status changes
  if (task.verificationStatus === 'pending') {
    // Task is pending verification - wait for admin action
    task.active = false;
    task.newTask = false;
    task.completed = false;
    task.failed = false;
  } 
  // No need for else-if here as we want to allow other status checks
  
  // If task is active, ensure other flags are correct
  // Ensure task status is consistent with flags
  if (task.failed) {
    task.status = 'expired';
  } else if (task.completed) {
    task.status = 'completed';
  } else if (task.verificationStatus === 'pending') {
    task.status = 'pendingVerification';
  } else if (task.active) {
    task.status = 'active';
  } else if (task.newTask) {
    task.status = 'new';
  } else {
    task.status = 'new'; // Default fallback
  }
}

// Get a single employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Find the admin that contains this employee
    const admin = await Admin.findOne({ 'employees._id': id });
    
    if (!admin) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Find the employee in the admin's employees array
    const employee = admin.employees.id(id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Return the employee data
    res.json({
      ...employee.toObject(),
      _id: employee._id,
      id: employee._id
    });

  } catch (error) {
    console.error('Error fetching employee:', {
      error: error.message,
      stack: error.stack,
      params: req.params
    });
    
    res.status(500).json({ 
      message: 'Error fetching employee',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get a single employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Find the admin that contains this employee
    const admin = await Admin.findOne({ 'employees._id': id });
    
    if (!admin) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Find the employee in the admin's employees array
    const employee = admin.employees.id(id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Return the employee data
    res.json({
      ...employee.toObject(),
      _id: employee._id,
      id: employee._id
    });

  } catch (error) {
    console.error('Error fetching employee:', {
      error: error.message,
      stack: error.stack,
      params: req.params
    });
    
    res.status(500).json({ 
      message: 'Error fetching employee',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Upload document to a task
router.post('/:employeeId/tasks/:taskId/documents', upload.single('document'), async (req, res) => {
  const logContext = {
    timestamp: new Date().toISOString(),
    params: req.params,
    file: req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename
    } : 'No file uploaded',
    headers: req.headers
  };
  
  console.log('Document upload request received:', JSON.stringify(logContext, null, 2));
  
  if (!req.file) {
    console.error('No file was uploaded in the request');
    return res.status(400).json({ 
      success: false,
      message: 'No file was uploaded. Please select a file to upload.'
    });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { employeeId, taskId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Find the admin that contains this employee
    const admin = await Admin.findOne({ 'employees._id': employeeId });
    if (!admin) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Find the employee
    const employee = admin.employees.id(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Find the task
    const task = employee.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Initialize submittedDocuments array if it doesn't exist
    if (!task.submittedDocuments) {
      task.submittedDocuments = [];
    }

    // Create document object with additional metadata
    const document = {
      _id: new mongoose.Types.ObjectId(),
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
      uploadedBy: employeeId,
      status: 'pending',
      taskId: taskId
    };
    
    // Add the document to the task
    if (!task.submittedDocuments) {
      task.submittedDocuments = [];
    }
    task.submittedDocuments.push(document);
    
    // Update task status to indicate document has been submitted
    if (task.status === 'new' || task.status === 'active') {
      task.status = 'pendingVerification';
      task.verificationStatus = 'pending';
    }
    
    // Mark the task as modified to ensure it gets saved
    admin.markModified('employees');

    // Save the admin document
    await admin.save({ session });
    await session.commitTransaction();
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error uploading document:', error);
    res.status(500).json({ 
      message: 'Error uploading document',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  } finally {
    session.endSession();
  }
});

// Get all tasks pending verification
router.get('/tasks/pending-verification', async (req, res) => {
  try {
    // Find all admins with employees who have tasks pending verification
    const admins = await Admin.find({
      'employees.tasks': {
        $elemMatch: {
          'status': 'pendingVerification'
        }
      }
    });

    // Extract tasks with their employee and admin info
    const pendingTasks = [];
    
    admins.forEach(admin => {
      admin.employees.forEach(employee => {
        employee.tasks.forEach(task => {
          if (task.status === 'pendingVerification') {
            pendingTasks.push({
              _id: task._id,
              taskTitle: task.taskTitle,
              description: task.description,
              startDate: task.startDate,
              endDate: task.endDate,
              category: task.category,
              submittedDocuments: task.submittedDocuments || [],
              status: task.status,
              employeeId: employee._id,
              employee: {
                _id: employee._id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                position: employee.position,
                department: employee.department
              },
              adminId: admin._id,
              admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email
              },
              createdAt: task.createdAt,
              updatedAt: task.updatedAt
            });
          }
        });
      });
    });

    res.status(200).json({ tasks: pendingTasks });
  } catch (error) {
    console.error('Error fetching pending verification tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify or reject a completed task
router.post('/:employeeId/tasks/:taskId/verify', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { employeeId, taskId } = req.params;
    const { status, reason } = req.body; // 'completed' or 'rejected'

    // Validate status
    if (!['completed', 'rejected'].includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status. Must be "completed" or "rejected"',
        code: 'INVALID_STATUS'
      });
    }

    // Find the admin that contains this employee
    const admin = await Admin.findOne({ 'employees._id': employeeId }).session(session);
    if (!admin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    // Find the employee
    const employee = admin.employees.id(employeeId);
    if (!employee) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    // Find the task
    const task = employee.tasks.id(taskId);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    // Verify the task is in pending verification
    if (task.verificationStatus !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: 'Task is not pending verification',
        currentVerificationStatus: task.verificationStatus,
        taskStatus: task.status,
        code: 'INVALID_TASK_STATUS'
      });
    }

    const currentTime = new Date();
    const adminId = req.user?.id || 'system';

    // Update task based on verification status
    if (status === 'completed') {
      // Mark as completed and approved
      task.completed = true;
      task.active = false;
      task.newTask = false;
      task.failed = false;
      task.verificationStatus = 'approved';
      task.verifiedAt = currentTime;
      task.verifiedBy = adminId;
      task.updatedAt = currentTime;
      
      // Update task counts for the employee
      employee.taskCounts.completed = (employee.taskCounts.completed || 0) + 1;
      employee.taskCounts.active = Math.max(0, (employee.taskCounts.active || 1) - 1);
      
      // Log the verification
      console.log(`Task ${taskId} approved by admin ${adminId} at ${currentTime.toISOString()}`);
    } else if (status === 'rejected') {
      // Mark as rejected and keep it active for resubmission
      task.completed = false;
      task.active = true;
      task.newTask = false;
      task.failed = false;
      task.verificationStatus = 'rejected';
      task.rejectedAt = currentTime;
      task.rejectedBy = adminId;
      task.rejectionReason = reason || 'No reason provided';
      task.verificationNote = req.body.note || 'Task rejected - please resubmit';
      task.verificationDate = currentTime;
      task.updatedAt = currentTime;
      
      // Update task counts (move from pending back to active)
      employee.taskCounts.active = (employee.taskCounts.active || 0) + 1;
      
      // Log the rejection
      console.log(`Task ${taskId} rejected by admin ${adminId} at ${currentTime.toISOString()}, reason: ${task.rejectionReason}`);
    }

    // Mark the employee as modified to ensure it gets saved
    admin.markModified('employees');

    // Save the admin document
    await admin.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: `Task ${status === 'completed' ? 'verified' : 'rejected'} successfully`,
      task: {
        _id: task._id,
        status: task.status,
        completed: task.completed,
        active: task.active,
        newTask: task.newTask,
        failed: task.failed,
        verifiedAt: task.verifiedAt,
        rejectedAt: task.rejectedAt,
        rejectionReason: task.rejectionReason
      }
    });
  } catch (error) {
    console.error('Error verifying task:', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ 
      message: 'Error verifying task',
      error: error.message 
    });
  }
});

// Update a specific task for an employee
router.put('/:id/tasks/:taskId', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: employeeId, taskId } = req.params;
    
    console.log('Task update request received:', {
      employeeId,
      taskId,
      body: req.body
    });
    
    // Validate input
    if (!employeeId || !taskId) {
      console.error('Missing required parameters');
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Employee ID and Task ID are required' });
    }

    // Find the admin that contains this employee
    const admin = await Admin.findOne({ 'employees._id': employeeId }).session(session);
    if (!admin) {
      console.error('Admin not found for employee ID:', employeeId);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        message: 'Employee not found',
        employeeId
      });
    }

    // Find the employee
    const employee = admin.employees.id(employeeId);
    if (!employee) {
      console.error('Employee not found with ID:', employeeId);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        message: 'Employee not found',
        employeeId
      });
    }

    // Find the task
    const task = employee.tasks.id(taskId);
    if (!task) {
      console.error('Task not found with ID:', taskId);
      console.log('Available task IDs:', employee.tasks.map(t => t._id || t.id));
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        message: 'Task not found',
        taskId,
        availableTaskIds: employee.tasks.map(t => t._id || t.id)
      });
    }

    // Update task fields
    const { status, ...updateData } = req.body;
    const currentTime = new Date();
    
    // Handle document uploads for verification
    if (req.files && req.files.length > 0) {
      // If this is a new submission, update task state
      if (task.verificationStatus !== 'pending') {
        // Reset task state for new submission
        task.active = false;
        task.completed = false;
        task.failed = false;
        task.newTask = false;
        task.verificationStatus = 'pending';
        task.submittedAt = currentTime;
        
        // Update task counts
        if (task.verificationStatus === 'rejected') {
          employee.taskCounts.active = Math.max(0, (employee.taskCounts.active || 0) - 1);
        }
      }

      // Add new documents to the task
      const documents = req.files.map(file => ({
        fileName: file.filename,
        originalName: file.originalname,
        filePath: `/uploads/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: currentTime
      }));

      task.submittedDocuments = task.submittedDocuments || [];
      task.submittedDocuments.push(...documents);
      
      // Update task status to reflect pending verification
      task.status = 'pendingVerification';
    } 
    // Handle status updates
    else if (status) {
      // For status changes, ensure proper workflow is followed
      switch (status) {
        case 'active':
          task.active = true;
          task.completed = false;
          task.failed = false;
          task.newTask = false;
          task.verificationStatus = ''; // Clear verification status when reactivating
          break;
          
        case 'completed':
          // Only allow marking as completed if it's pending verification
          if (task.verificationStatus !== 'pending') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
              message: 'Only tasks pending verification can be marked as completed',
              currentStatus: task.verificationStatus
            });
          }
          task.completed = true;
          task.active = false;
          task.failed = false;
          task.newTask = false;
          task.verificationStatus = 'approved';
          task.verifiedAt = currentTime;
          task.verifiedBy = req.user?.id || 'system';
          
          // Update task counts
          employee.taskCounts.completed = (employee.taskCounts.completed || 0) + 1;
          employee.taskCounts.active = Math.max(0, (employee.taskCounts.active || 1) - 1);
          break;
          
        case 'failed':
          // Only allow marking as failed if it's not completed
          if (task.completed) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
              message: 'Completed tasks cannot be marked as failed',
              currentStatus: task.status
            });
          }
          task.failed = true;
          task.active = false;
          task.completed = false;
          task.newTask = false;
          task.verificationStatus = 'expired';
          
          // Update task counts
          employee.taskCounts.failed = (employee.taskCounts.failed || 0) + 1;
          if (task.status === 'active') {
            employee.taskCounts.active = Math.max(0, (employee.taskCounts.active || 1) - 1);
          }
          task.verificationNote = req.body.note || '';
          task.verificationDate = currentTime;
          break;
          
        case 'pendingVerification':
          // This status is set automatically when documents are uploaded
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ 
            message: 'Cannot directly set status to pendingVerification. Upload documents instead.'
          });
          
        case 'expired':
          // This status is set automatically when endDate is passed
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ 
            message: 'Cannot manually set status to expired. It is set automatically when endDate is passed.'
          });
          
        case 'rejected':
          // This is handled by the verification endpoint
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ 
            message: 'Use the verification endpoint to reject tasks.'
          });
          
        default:
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ 
            message: `Invalid status: ${status}`,
            validStatuses: ['active', 'completed', 'failed']
          });
      }
      
      // Update the task status based on the new state
      if (task.completed) {
        task.status = 'completed';
      } else if (task.failed) {
        task.status = 'failed';
      } else if (task.verificationStatus === 'pending') {
        task.status = 'pendingVerification';
      } else if (task.active) {
        task.status = 'active';
      } else {
        task.status = 'new';
      }
    }

    // Update other fields
    Object.entries(updateData).forEach(([key, value]) => {
      if (key !== '_id' && key !== '__v') {
        task[key] = value;
      }
    });

    // Update task state based on dates
    updateTaskState(task, new Date());

    // Recompute task counts for this employee to keep counters in sync
    if (typeof employee.updateTaskCounts === 'function') {
      employee.updateTaskCounts();
    } else {
      // Fallback in case method is not present
      const tasksArr = Array.isArray(employee.tasks) ? employee.tasks : [];
      employee.taskCounts = {
        completed: tasksArr.filter(t => t.completed === true).length,
        failed: tasksArr.filter(t => t.failed === true && t.completed !== true).length,
        active: tasksArr.filter(t => t.active === true && t.completed !== true && t.failed !== true).length,
        newTask: tasksArr.filter(t => t.newTask === true && t.active !== true && t.completed !== true && t.failed !== true).length,
      };
    }

    // Mark the employee as modified to ensure it gets saved
    admin.markModified('employees');

    // Save the updated admin document
    await admin.save({ session });
    await session.commitTransaction();
    session.endSession();

    console.log('Task updated successfully:', {
      taskId: task._id,
      title: task.taskTitle,
      status: task.status
    });

    // Return the updated task
    res.json({
      ...task.toObject(),
      _id: task._id,
      id: task._id
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating task:', {
      error: error.message,
      stack: error.stack,
      params: req.params,
      body: req.body
    });
    res.status(500).json({ 
      message: 'Error updating task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Check and update expired tasks
router.post('/tasks/check-expired', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const currentTime = new Date();
    let updatedCount = 0;
    
    // Find all admins with employees who have active or pending tasks that are expired
    const admins = await Admin.find({
      'employees.tasks': {
        $elemMatch: {
          $or: [
            { active: true, endDate: { $lt: currentTime } },
            { verificationStatus: 'pending', endDate: { $lt: currentTime } }
          ],
          completed: { $ne: true },
          failed: { $ne: true }
        }
      }
    }).session(session);

    // Process each admin
    for (const admin of admins) {
      let adminModified = false;
      
      // Process each employee
      for (const employee of admin.employees) {
        let employeeModified = false;
        
        // Process each task
        for (const task of employee.tasks) {
          // Skip if task is already completed or failed
          if (task.completed || task.failed) continue;
          
          // Check if task is expired
          if (task.endDate && new Date(task.endDate) < currentTime) {
            // Update task state to failed
            task.active = false;
            task.completed = false;
            task.failed = true;
            task.verificationStatus = 'expired';
            task.updatedAt = currentTime;
            
            // Update task counts
            if (task.status === 'active') {
              employee.taskCounts.active = Math.max(0, (employee.taskCounts.active || 1) - 1);
            } else if (task.verificationStatus === 'pending') {
              // No need to update counts for pending tasks as they were never counted as active
            }
            
            employee.taskCounts.failed = (employee.taskCounts.failed || 0) + 1;
            
            updatedCount++;
            employeeModified = true;
          }
        }
        
        if (employeeModified) {
          adminModified = true;
          admin.markModified('employees');
        }
      }
      
      // Save admin if modified
      if (adminModified) {
        await admin.save({ session });
      }
    }
    
    await session.commitTransaction();
    session.endSession();
    
    console.log(`[${new Date().toISOString()}] Updated ${updatedCount} expired tasks`);
    
    res.json({
      success: true,
      updatedCount,
      message: `Updated ${updatedCount} expired tasks`
    });
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error checking expired tasks:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error checking expired tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
