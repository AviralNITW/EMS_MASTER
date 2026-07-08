import React from 'react';
import { CalendarDays, Check, X, FileText, Plus } from 'lucide-react';
import DataGrid from '../UI/DataGrid';
import SkeletonLoader from '../UI/SkeletonLoader';

const LeaveManagementView = ({ leaves, loading, onLeaveAction, role, onAddClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
      case 'Manager_Approved':
      case 'HR_Approved':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Pending':
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const formatStatus = (status) => {
    if (status === 'Manager_Approved') return 'Mgr Approved';
    if (status === 'HR_Approved') return 'HR Approved';
    return status;
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employeeId',
      render: (row) => {
        if (!row.employeeId) return <span className="text-gray-500 dark:text-gray-400">Unknown</span>;
        // In case it's populated or just an ID string
        const name = typeof row.employeeId === 'object' 
          ? `${row.employeeId.firstName || ''} ${row.employeeId.lastName || ''}`
          : 'User ' + row.employeeId.substring(row.employeeId.length - 4);
          
        return <span className="font-semibold text-gray-900 dark:text-white">{name}</span>;
      }
    },
    {
      header: 'Leave Type',
      accessor: 'type',
      render: (row) => (
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-gray-500 dark:text-gray-400" />
          <span className="text-gray-200 text-xs">{row.type}</span>
        </div>
      )
    },
    {
      header: 'Duration',
      accessor: 'startDate',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (row) => (
        <span className="text-[11px] text-gray-500 dark:text-gray-400 max-w-[200px] truncate block" title={row.reason}>
          {row.reason}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(row.status)}`}>
          {formatStatus(row.status)}
        </span>
      )
    }
  ];

  if (role !== 'Employee') {
    columns.push({
      header: 'Action',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Pending' || (role === 'Admin') || (role === 'HR' && row.status === 'Manager_Approved') ? (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onLeaveAction && onLeaveAction(row._id, role === 'Manager' ? 'Manager_Approved' : 'Approved'); }}
                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors" 
                title="Approve"
              >
                <Check size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onLeaveAction && onLeaveAction(row._id, 'Rejected'); }}
                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors" 
                title="Reject"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <span className="text-[10px] text-gray-500 italic">Reviewed</span>
          )}
        </div>
      )
    });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{role === 'Employee' ? 'My Leave Requests' : 'Leave Management'}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {role === 'Employee' ? 'View and manage your leave requests and balances.' : 'Review and approve employee leave applications.'}
          </p>
        </div>
        
        {role === 'Employee' && (
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(124,92,255,0.3)]"
          >
            <Plus size={16} /> Request Leave
          </button>
        )}
      </div>

      <div className="flex-1 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-2xl flex flex-col">
        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : (
          <DataGrid 
            columns={columns} 
            data={leaves} 
          />
        )}
      </div>
    </div>
  );
};

export default LeaveManagementView;
