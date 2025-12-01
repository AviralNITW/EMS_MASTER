import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: false  // Fixed: New tasks should NOT be active by default
  },
  newTask: {
    type: Boolean,
    default: true   // Correct: New tasks should be newTask by default
  },
  completed: {
    type: Boolean,
    default: false
  },
  failed: {
    type: Boolean,
    default: false
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
    enum: ['Design', 'Development', 'Meeting', 'QA', 'Documentation', 'DevOps', 'Presentation', 'Support']
  },
  submittedDocuments: [{
    fileName: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
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
  taskCounts: {
    active: {
      type: Number,
      default: 0
    },
    newTask: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    }
  },
  tasks: [taskSchema]
}, {
  timestamps: true
});

// Method to update task counts using EXCLUSIVE state principle
// Only ONE of the four states should be true at any time
employeeSchema.methods.updateTaskCounts = function() {
  // EXCLUSIVE COUNTING: Priority order - completed > failed > active > newTask
  // Each task is counted in only ONE category based on highest priority state
  
  this.taskCounts.completed = this.tasks.filter(task => task.completed === true).length;
  
  this.taskCounts.failed = this.tasks.filter(task => 
    task.failed === true && task.completed !== true
  ).length;
  
  this.taskCounts.active = this.tasks.filter(task => 
    task.active === true && 
    task.completed !== true && 
    task.failed !== true
  ).length;
  
  this.taskCounts.newTask = this.tasks.filter(task => 
    task.newTask === true && 
    task.active !== true && 
    task.completed !== true && 
    task.failed !== true
  ).length;
  
  console.log('Task counts updated (EXCLUSIVE):', {
    newTask: this.taskCounts.newTask,
    active: this.taskCounts.active,
    completed: this.taskCounts.completed,
    failed: this.taskCounts.failed,
    total: this.tasks.length
  });
};

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
