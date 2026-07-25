import React from 'react';
import { CheckSquare, Check, X, Clock, Play, Plus } from 'lucide-react';
import DataGrid from '../UI/DataGrid';
import SkeletonLoader from '../UI/SkeletonLoader';

const TaskManagementView = ({ tasks, loading, onTaskAction, role, onAddClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Verified':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'In_Progress':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'To_Do':
      case 'Assigned':
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ');
  };

  const columns = [
    {
      header: 'Task Title',
      accessor: 'title',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{row.title}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={row.description}>{row.description}</p>
        </div>
      )
    }
  ];

  if (role !== 'Employee') {
    columns.push({
      header: 'Assigned To',
      accessor: 'assignedTo',
      render: (row) => {
        if (!row.assignedTo) return <span className="text-gray-500 dark:text-gray-400">Unassigned</span>;
        const name = typeof row.assignedTo === 'object'
          ? `${row.assignedTo.firstName || ''} ${row.assignedTo.lastName || ''}`
          : 'User ' + row.assignedTo.substring(row.assignedTo.length - 4);
        return <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">{name}</span>;
      }
    });
  }

  columns.push(
    {
      header: 'Due Date',
      accessor: 'dueDate',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-500 dark:text-gray-400" />
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'No date'}
          </span>
        </div>
      )
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => {
        const colors = {
          High: 'text-red-400 bg-red-400/10',
          Medium: 'text-yellow-400 bg-yellow-400/10',
          Low: 'text-blue-400 bg-blue-400/10'
        };
        return (
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${colors[row.priority] || colors.Medium}`}>
            {row.priority || 'Medium'}
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(row.status)}`}>
          {formatStatus(row.status)}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: 'actions',
      render: (row) => {
        if (role === 'Employee') {
          return (
            <div className="flex items-center gap-2">
              {row.status === 'Assigned' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onTaskAction && onTaskAction(row._id, 'In_Progress'); }}
                  className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg transition-colors" 
                  title="Start Task"
                >
                  <Play size={14} />
                </button>
              )}
              {row.status === 'In_Progress' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onTaskAction && onTaskAction(row._id, 'Completed'); }}
                  className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors" 
                  title="Mark Completed"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          );
        } else {
          // Manager or Admin
          return (
            <div className="flex items-center gap-2">
              {row.status === 'Completed' ? (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onTaskAction && onTaskAction(row._id, 'Verified'); }}
                    className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors" 
                    title="Verify Task"
                  >
                    <Check size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onTaskAction && onTaskAction(row._id, 'Rejected'); }}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors" 
                    title="Reject Task"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                 <span className="text-[10px] text-gray-500 italic">No action</span>
              )}
            </div>
          );
        }
      }
    }
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{role === 'Employee' ? 'My Tasks' : 'Task Management'}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {role === 'Employee' ? 'View and update the status of your assigned tasks.' : 'Create, assign, and verify team tasks.'}
          </p>
        </div>
        
        {role !== 'Employee' && (
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(124,92,255,0.3)]"
          >
            <Plus size={16} /> Assign Task
          </button>
        )}
      </div>

      <div className="flex-1 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-2xl flex flex-col">
        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : (
          <DataGrid 
            columns={columns} 
            data={tasks} 
          />
        )}
      </div>
    </div>
  );
};

export default TaskManagementView;
