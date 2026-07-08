import React from 'react';
import { Plus, UserCog, Trash2, Mail } from 'lucide-react';
import DataGrid from '../UI/DataGrid';
import SkeletonLoader from '../UI/SkeletonLoader';

const EmployeeManagementView = ({ users, loading, onAddClick, onDeleteClick, role }) => {

  const columns = [
    {
      header: 'Employee',
      accessor: 'firstName',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {row.firstName?.charAt(0)}{row.lastName?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{row.firstName} {row.lastName}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{row._id?.substring(row._id.length - 6).toUpperCase()}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => (
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs">
          <Mail size={12} className="text-gray-500" />
          {row.email}
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => {
        const colors = {
          Admin: 'bg-red-500/10 text-red-500 border-red-500/20',
          HR: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
          Manager: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          Employee: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[row.role] || colors.Employee}`}>
            {row.role}
          </span>
        );
      }
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => (
        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{row.department || 'N/A'}</span>
      )
    },
    {
      header: 'Joining Date',
      accessor: 'joiningDate',
      render: (row) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {row.joiningDate ? new Date(row.joiningDate).toLocaleDateString() : 'Unknown'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors" title="Edit User">
            <UserCog size={14} />
          </button>
          {role === 'Admin' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteClick && onDeleteClick(row._id); }}
              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors" 
              title="Delete User"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Employee Management</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">View and manage system users, roles, and departments.</p>
        </div>
        
        {/* Only Admin/HR can add employees */}
        {(role === 'Admin' || role === 'HR') && (
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(124,92,255,0.3)]"
          >
            <Plus size={16} /> Add Employee
          </button>
        )}
      </div>

      <div className="flex-1 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-2xl flex flex-col">
        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : (
          <DataGrid 
            columns={columns} 
            data={users} 
            onRowClick={(row) => console.log('Row clicked', row)}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeManagementView;
