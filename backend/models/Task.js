import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Assigned', 'In_Progress', 'Completed', 'Verified', 'Rejected'],
    default: 'Assigned'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  // Task-level verification status for manager review
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'approved', 'rejected', 'none'],
    default: 'none'
  },
  verificationNote: {
    type: String,
    default: ''
  },
  // Documents submitted by employee for this task
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

const Task = mongoose.model('Task', taskSchema);

export default Task;
