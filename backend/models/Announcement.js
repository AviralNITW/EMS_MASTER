import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { 
    type: String, 
    enum: ['All', 'HR', 'Manager', 'Employee'],
    default: 'All'
  },
  type: {
    type: String,
    enum: ['Info', 'Event', 'Update', 'Alert'],
    default: 'Info'
  },
  createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
