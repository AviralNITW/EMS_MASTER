import React, { useState, useEffect } from 'react';
import { X, UserPlus, Building2, Shield, Mail, Lock } from 'lucide-react';
import { userAPI, departmentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const UserFormModal = ({ isOpen, onClose, onSuccess, currentRole }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Employee',
    department: '',
    managerId: '' // We will keep this optional for now
  });
  
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Apply default role constraints based on currentRole when modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentRole === 'Admin') {
        setFormData(prev => ({ ...prev, role: 'HR', department: 'HR' }));
      } else if (currentRole === 'HR') {
        setFormData(prev => ({ ...prev, role: 'Employee', department: '' }));
      }
    }
  }, [isOpen, currentRole]);

  useEffect(() => {
    if (isOpen) {
      // Fetch potential managers and departments for the dropdowns
      const fetchData = async () => {
        try {
          const [users, depts] = await Promise.all([
            userAPI.getAll(),
            departmentAPI.getAll().catch(() => []) // Gracefully handle if no depts exist
          ]);
          const mgrs = users.filter(u => u.role === 'Manager' || u.role === 'HR');
          setManagers(mgrs);
          setDepartments(depts || []);
        } catch (error) {
          console.error("Failed to fetch data", error);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error('Password does not meet the security criteria');
      return;
    }

    try {
      setLoading(true);
      await userAPI.create(formData);
      toast.success('User created successfully');
      setFormData({
        firstName: '', lastName: '', email: '', password: '', role: 'Employee', department: '', managerId: ''
      });
      onSuccess(); // Refresh the parent's data
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D14]/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus size={18} className="text-primary" />
            Create New User
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">First Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Jim"
                  className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Last Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Halpert"
                  className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jim@example.com"
                className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Initial password"
                className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-2 ml-1 leading-tight">
              Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white appearance-none"
                >
                  {currentRole === 'Admin' ? (
                    <option value="HR">HR</option>
                  ) : currentRole === 'HR' ? (
                    <>
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                    </>
                  ) : (
                    <option value="Employee">Employee</option>
                  )}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                {currentRole === 'Admin' ? (
                  <input 
                    type="text" 
                    name="department"
                    value={formData.department || 'Not Assignable (Admin Scope)'}
                    disabled
                    className="w-full bg-[#090D14]/50 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                  />
                ) : (
                  <select 
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white appearance-none"
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept.name}>{dept.name}</option>
                    ))}
                    {departments.length === 0 && <option value="" disabled>No departments exist yet</option>}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Assign Manager (Optional)</label>
            <div className="relative">
              <select 
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
              >
                <option value="">No Manager Assigned</option>
                {managers.map(mgr => (
                  <option key={mgr._id} value={mgr._id}>{mgr.firstName} {mgr.lastName} - {mgr.role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
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
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
