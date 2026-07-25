import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { taskAPI, userAPI } from '../../services/api';
import { toast } from 'react-toastify';

const TaskFormModal = ({ isOpen, onClose, onSuccess, currentRole }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const allUsers = await userAPI.getAll();
          let filteredUsers = allUsers;
          
          if (currentRole === 'Admin') {
            filteredUsers = allUsers.filter(u => u.role === 'Manager' || u.role === 'HR');
          } else if (currentRole === 'Manager') {
             // In a real app we would filter by department. For now we filter to Employees.
            filteredUsers = allUsers.filter(u => u.role === 'Employee');
          }
          // HR can assign to anyone or maybe we can limit it too, but rules didn't strictly say.

          setUsers(filteredUsers);
        } catch (error) {
          console.error("Failed to fetch users", error);
        }
      };
      fetchUsers();
    }
  }, [isOpen, currentRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await taskAPI.create(formData);
      toast.success('Task assigned successfully');
      setFormData({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'Medium' });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-[#090D14]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up" style={{ position: 'fixed' }}>
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Plus size={20} className="text-primary" /> Assign New Task
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Create a new task and assign it to a member.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Task Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none text-gray-900 dark:text-white" placeholder="e.g. Q4 Marketing Strategy" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none text-gray-900 dark:text-white" rows="3" placeholder="Task details..."></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Assign To</label>
              <select required value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none text-gray-900 dark:text-white">
                <option value="">Select Member</option>
                {users.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Due Date</label>
              <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none text-gray-900 dark:text-white" style={{ colorScheme: 'dark' }} />
            </div>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-gray-900 dark:text-white font-semibold py-3 rounded-xl shadow-[0_0_20px_rgba(124,92,255,0.3)] transition-colors disabled:opacity-50">
              {loading ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
