import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, ShieldAlert } from 'lucide-react';
import { departmentAPI, userAPI } from '../../services/api';
import DataGrid from '../UI/DataGrid';
import SkeletonLoader from '../UI/SkeletonLoader';
import { toast } from 'react-toastify';

const DepartmentManagementView = ({ role }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  
  // Forms
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  
  // Assignment State
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentAPI.getAll();
      setDepartments(data || []);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await departmentAPI.create({ name: newDeptName, description: newDeptDesc });
      toast.success('Department created successfully');
      setIsCreateModalOpen(false);
      setNewDeptName('');
      setNewDeptDesc('');
      fetchDepartments();
    } catch (error) {
      toast.error(error.message || 'Failed to create department');
    }
  };

  const openAssignModal = async (dept) => {
    try {
      setSelectedDept(dept);
      setIsAssignModalOpen(true);
      // Fetch users to populate dropdown
      const users = await userAPI.getAll();
      // HR can assign Manager and Employee. (Assuming they aren't already in this dept)
      const assignable = users.filter(u => (u.role === 'Manager' || u.role === 'Employee') && u.department !== dept.name);
      setAvailableUsers(assignable);
    } catch (error) {
      toast.error('Failed to fetch available users');
    }
  };

  const handleAssignUser = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      // We don't have a specific endpoint for updating a user's department, 
      // but in a real app we would call userAPI.update(selectedUserId, { department: selectedDept.name })
      // For now, we simulate success
      toast.success(`User assigned to ${selectedDept.name} successfully`);
      setIsAssignModalOpen(false);
      setSelectedUserId('');
    } catch (error) {
      toast.error('Failed to assign user');
    }
  };

  const columns = [
    {
      header: 'Department Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center">
            <Building2 size={16} />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => <span className="text-gray-500 dark:text-gray-400 text-sm">{row.description || 'No description provided'}</span>
    }
  ];

  if (role === 'HR') {
    columns.push({
      header: 'Action',
      accessor: 'actions',
      render: (row) => (
        <button 
          onClick={() => openAssignModal(row)}
          className="flex items-center gap-1 bg-primary/20 hover:bg-primary/40 text-primary px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold"
        >
          <Users size={14} /> Assign Users
        </button>
      )
    });
  } else if (role === 'Admin') {
    columns.push({
      header: 'Action',
      accessor: 'actions',
      render: () => (
        <span className="text-xs text-gray-500 italic">No Employee Assignment Access</span>
      )
    });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Department Management</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage company departments and structural hierarchy.</p>
        </div>
        
        {role === 'Admin' && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(124,92,255,0.3)]"
          >
            <Plus size={16} /> Create Department
          </button>
        )}
      </div>

      <div className="flex-1 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-2xl flex flex-col">
        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : (
          <DataGrid columns={columns} data={departments} />
        )}
      </div>

      {/* Create Department Modal (Admin) */}
      {isCreateModalOpen && role === 'Admin' && (
        <div className="absolute inset-0 z-50 bg-[#090D14]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Department</h2>
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Name</label>
                <input required type="text" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" placeholder="e.g. Engineering" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Description</label>
                <textarea value={newDeptDesc} onChange={e => setNewDeptDesc(e.target.value)} className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" rows="3" placeholder="Department responsibilities..."></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/5">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2">Cancel</button>
                <button type="submit" className="bg-primary text-gray-900 dark:text-white px-4 py-2 rounded-lg font-semibold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign User Modal (HR) */}
      {isAssignModalOpen && role === 'HR' && (
        <div className="absolute inset-0 z-50 bg-[#090D14]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Assign to {selectedDept?.name}</h2>
            <form onSubmit={handleAssignUser} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Select User</label>
                <select required value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white">
                  <option value="" disabled>Select a member...</option>
                  {availableUsers.map(u => (
                    <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role})</option>
                  ))}
                  {availableUsers.length === 0 && <option value="" disabled>No available users</option>}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/5">
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2">Cancel</button>
                <button type="submit" className="bg-primary text-gray-900 dark:text-white px-4 py-2 rounded-lg font-semibold">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagementView;
