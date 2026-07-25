import React, { useState } from 'react';
import { X, CalendarDays, FileText } from 'lucide-react';
import { leaveAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthProvider';

const LeaveFormModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'vacation',
    reason: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }

    try {
      setLoading(true);
      await leaveAPI.create({ ...formData, employeeId: currentUser._id });
      toast.success('Leave request submitted successfully');
      setFormData({
        startDate: '', endDate: '', type: 'vacation', reason: ''
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D14]/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays size={18} className="text-primary" />
            Request Leave
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Start Date</label>
              <input 
                type="date" 
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">End Date</label>
              <input 
                type="date" 
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Leave Type</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white appearance-none"
            >
              <option value="vacation">Vacation</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="other">Comp Off / Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Reason</label>
            <div className="relative">
              <textarea 
                name="reason"
                required
                rows={3}
                value={formData.reason}
                onChange={handleChange}
                placeholder="Briefly explain your reason for taking leave..."
                className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white resize-none"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/5">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-gray-900 dark:text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveFormModal;
