import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { employeeAPI } from '../../services/api';

const NewTask = ({ data, onTaskUpdate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isHandlingTask, setIsHandlingTask] = useState(false);
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

  // Handle task acceptance
  const handleAcceptTask = async () => {
    if (isUpdating || !data?._id) {
      return;
    }

    // Get employee ID from task data or try to get it from localStorage as fallback
    let employeeId = data.employeeId;
    
    // If employeeId is not in task data, try to get it from localStorage
    if (!employeeId) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?._id) {
          employeeId = user._id;
        }
      } catch (e) {
        console.error('Error getting user from localStorage:', e);
      }
    }

    if (!employeeId) {
      setError(new Error('Unable to determine employee. Please refresh the page and try again.'));
      return;
    }

    setIsHandlingTask(true);
    setIsUpdating(true);
    setError(null);

    try {
      console.log('Attempting to accept task:', { taskId: data._id, employeeId });
      
      // Update task status to 'active' with all necessary fields
      const response = await employeeAPI.updateTask(employeeId, data._id, { 
        status: 'active',
        newTask: false,
        active: true,
        completed: false,
        failed: false,
        verificationStatus: '',
        updatedAt: new Date().toISOString()
      });
      
      if (!response || response.error) {
        throw new Error(response?.error || 'Failed to update task status');
      }
      
      console.log('Task accepted successfully:', response);
      
      // Small delay to ensure UI updates smoothly
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Notify parent component to refresh task list
      if (onTaskUpdate) {
        await onTaskUpdate();
      }
    } catch (err) {
      console.error('Error accepting task:', {
        error: err.message,
        taskId: data?._id,
        employeeId: employeeId,
        fullError: err
      });
      
      // Only show user-friendly error message
      const userFriendlyError = new Error('Failed to accept task. Please refresh the page and try again.');
      setError(userFriendlyError);
    } finally {
      setIsUpdating(false);
      setIsHandlingTask(false);
    }
  };

  // Timer effect for countdown
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
          <div className='text-xs text-gray-500'>Due: {formatDate(data.endDate)}</div>
          <div className='text-xs font-medium text-blue-600 mt-1'>{timeLeft}</div>
        </div>
      </div>
      
      <div className='mt-4'>
        <h3 className='bg-blue-600 text-white text-sm px-3 py-1 rounded-full inline-block'>
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
        <button 
          onClick={handleAcceptTask}
          disabled={isUpdating}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isUpdating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Accepting...
            </>
          ) : 'Accept Task'}
        </button>
      </div>
    </div>
  );
};

NewTask.propTypes = {
  data: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    taskTitle: PropTypes.string,
    taskDescription: PropTypes.string,
    category: PropTypes.string,
    priority: PropTypes.oneOf(['low', 'medium', 'high']),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    status: PropTypes.oneOf(['new', 'active', 'completed', 'failed']),
  }).isRequired,
  onTaskUpdate: PropTypes.func,
};

export default NewTask;