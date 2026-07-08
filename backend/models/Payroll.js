import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Pending_Verification', 'Verified', 'Paid'],
    default: 'Pending'
  },
  month: { type: String, required: true }, // e.g., 'July 2026'
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

payrollSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
