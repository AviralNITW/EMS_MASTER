import mongoose from 'mongoose';

// Task schema for embedded tasks within employees
const taskSchema = new mongoose.Schema({
  // Overall task workflow status used by routes/UI
  status: {
    type: String,
    enum: ['new', 'active', 'completed', 'failed', 'pendingVerification', 'expired'],
    default: 'new'
  },
  taskTitle: {
    type: String,
    required: true,
    trim: true
  },
  taskDescription: {
    type: String,
    required: true,
    trim: true
  },
  taskDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: false
  },
  newTask: {
    type: Boolean,
    default: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  failed: {
    type: Boolean,
    default: false
  },
  // Task-level verification status
  verificationStatus: {
    type: String,
    // Include all values referenced by routes and utilities
    enum: ['pending', 'verified', 'approved', 'rejected', 'expired', 'none', ''],
    default: ''
  },
  verificationNote: {
    type: String,
    default: ''
  },
  verificationDate: {
    type: Date,
    default: null
  },
  // Document uploads for this task
  documents: [{
    filename: String,
    originalName: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationDate: {
      type: Date,
    },
    verificationNote: {
      type: String,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'approved', 'rejected', 'expired', 'none', ''],
      default: ''
    }
  }],
  // Documents submitted by employee for verification (used across routes)
  submittedDocuments: [{
    fileName: String,
    originalName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: false,
    default: '',
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 3
  },
  tasks: [taskSchema],
  taskCounts: {
    newTask: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Method to update task counts for an employee
employeeSchema.methods.updateTaskCounts = function() {
  this.taskCounts.completed = this.tasks.filter(task => task.completed === true).length;
  this.taskCounts.failed = this.tasks.filter(task => task.failed === true && task.completed !== true).length;
  this.taskCounts.active = this.tasks.filter(task => task.active === true && task.completed !== true && task.failed !== true).length;
  this.taskCounts.newTask = this.tasks.filter(task => task.newTask === true && task.active !== true && task.completed !== true && task.failed !== true).length;
};

// Admin schema with embedded employees
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: 'Admin',
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 3
  },
  employees: {
    type: [employeeSchema],
    default: []
  }
}, {
  timestamps: true
});

// Helper methods for admin to manage embedded employees
adminSchema.methods.findEmployeeById = function(employeeId) {
  return this.employees.id(employeeId);
};

adminSchema.methods.findEmployeeByEmail = function(email) {
  return this.employees.find(emp => emp.email === email);
};

adminSchema.methods.addEmployee = function(employeeData) {
  this.employees.push(employeeData);
  return this.employees[this.employees.length - 1];
};

adminSchema.methods.removeEmployee = function(employeeId) {
  return this.employees.id(employeeId).deleteOne();
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
