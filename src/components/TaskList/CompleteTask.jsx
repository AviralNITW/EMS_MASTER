import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { employeeAPI } from '../../services/api';

const CompleteTask = ({ data, onTaskUpdate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  let interval = null;

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return dateString ? format(new Date(dateString), 'MMM dd, yyyy hh:mm a') : 'N/A';
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  // Handle task reopen
  const handleReopenTask = async () => {
    if (!data?._id) {
      setError(new Error('Task ID is missing'));
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      // Update task status back to 'active' via employeeAPI
      // Note: We need the employee ID to update the task
      const employeeId = data.employeeId; // Make sure this is available in the data prop
      if (!employeeId) {
        throw new Error('Employee ID is required to reopen task');
      }
      
      await employeeAPI.updateTask(employeeId, data._id, { status: 'active' });
      
      // Notify parent component to refresh task list
      if (onTaskUpdate) {
        await onTaskUpdate();
      }
    } catch (err) {
      console.error('Error reopening task:', err);
      setError(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Timer effect for countdown (for reference)
  useEffect(() => {
    if (!data?.endDate) return;

    const updateTimer = () => {
      try {
        const end = new Date(data.endDate);
        const now = new Date();
        const diff = end - now;

        if (diff <= 0) {
          setTimeLeft('Expired');
          if (interval) clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } catch (err) {
        console.error('Error in timer update:', err);
        setTimeLeft('--');
      }
    };

    // Initial update
    updateTimer();
    
    // Set up interval for updates
    interval = setInterval(updateTimer, 1000);
    
    // Clean up interval on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [data?.endDate]);

  // Show error state
  if (error) {
    return (
      <div className="flex-shrink-0 min-h-[300px] w-[300px] p-5 bg-red-100 border-l-4 border-red-500 rounded-xl">
        <h3 className="text-red-700 font-bold">Error</h3>
        <p className="text-red-600 text-sm mt-2">
          {error.message || 'Failed to load task details'}
        </p>
        <button 
          onClick={() => setError(null)}
          className="mt-4 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Dismiss
        </button>
      </div>
    );
  }

  // Show loading state
  if (isUpdating) {
    return (
      <div className="flex-shrink-0 min-h-[300px] w-[300px] p-5 bg-white bg-opacity-70 rounded-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className='flex-shrink-0 min-h-[300px] w-[300px] p-5 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200'>
      <div className='flex justify-between items-start'>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          data.priority === 'high' ? 'bg-red-100 text-red-800' :
          data.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {data.priority || 'Normal'} Priority
        </span>
        <div className='text-right'>
          <div className='text-xs text-gray-500'>Completed: {formatDate(data.completedAt)}</div>
          <div className='text-xs text-gray-500 mt-1'>Due: {formatDate(data.endDate)}</div>
        </div>
      </div>
      
      <div className='mt-4'>
        <h3 className='bg-green-600 text-white text-sm px-3 py-1 rounded-full inline-block'>
          {data.category || 'Uncategorized'}
        </h3>
      </div>
      
      <h2 className='mt-3 text-lg font-semibold text-gray-800'>
        {data.taskTitle || 'Untitled Task'}
      </h2>
      
      <p className='mt-2 text-sm text-gray-600 line-clamp-3'>
        {data.taskDescription || 'No description provided.'}
      </p>
      
      <div className='mt-6 pt-3 border-t border-gray-100'>
        <div className='flex justify-between items-center'>
          <span className='text-xs text-green-600 font-medium'>
            ✓ Completed
          </span>
          <button
            onClick={handleReopenTask}
            disabled={isUpdating}
            className='text-xs text-blue-600 hover:text-blue-800 font-medium'
          >
            {isUpdating ? 'Reopening...' : 'Reopen Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

CompleteTask.propTypes = {
  data: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    taskTitle: PropTypes.string,
    taskDescription: PropTypes.string,
    category: PropTypes.string,
    priority: PropTypes.oneOf(['low', 'medium', 'high']),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    completedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    status: PropTypes.oneOf(['new', 'active', 'completed', 'failed']),
  }).isRequired,
  onTaskUpdate: PropTypes.func,
};

export default CompleteTask;