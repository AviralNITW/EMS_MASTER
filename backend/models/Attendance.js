import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  clockIn: { type: Date },
  clockOut: { type: Date },
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Late', 'Half-day'],
    default: 'Absent'
  },
  totalHours: { type: Number, default: 0 }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
