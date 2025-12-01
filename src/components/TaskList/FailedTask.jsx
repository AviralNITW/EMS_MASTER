import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { format, isAfter } from 'date-fns';
import { FaExclamationTriangle } from 'react-icons/fa';

const FailedTask = ({ data, isExpired, isRejected = false }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
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

  // Check if task is expired (either from props or by date comparison)
  const taskIsExpired = isExpired || (data?.endDate && isAfter(new Date(), new Date(data.endDate)));

  // Get status color based on task status
  const getStatusColor = () => {
    if (isRejected) return 'bg-red-600 text-white';
    if (isExpired) return 'bg-red-500 text-white';
    return 'bg-red-600 text-white';
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

  // Format time left or show expired status
  const renderTimeLeft = () => {
    if (data?.endDate) {
      const end = new Date(data.endDate);
      const now = new Date();
      const diff = end - now;

      if (diff <= 0) {
        return 'Expired';
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      return `${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m left`;
    }
    return 'No deadline';
  };

  // Handle retry task action
  const handleRetryTask = async () => {
    try {
      setIsUpdating(true);
      // Add your retry logic here
      // For example: await someApiCallToRetryTask(data._id);
    } catch (err) {
      setError(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // For rejected tasks, show the rejection reason
  const rejectionInfo = isRejected && data?.rejectionReason ? (
    <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-500 text-red-700">
      <p className="font-semibold">Rejection Reason:</p>
      <p className="text-sm">{data.rejectionReason}</p>
      {data.rejectedBy && (
        <p className="text-xs mt-1">Rejected by: {data.rejectedBy}</p>
      )}
      {data.rejectedAt && (
        <p className="text-xs">
          On: {new Date(data.rejectedAt).toLocaleString()}
        </p>
      )}
    </div>
  ) : null;



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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // For manually failed tasks (not expired), show with retry option
  return (
    <div className='flex-shrink-0 min-h-[300px] w-[300px] p-5 bg-red-400 shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200'>
      <div className='flex justify-between items-start'>
        <div className='mt-4 '>
          <h3 className='bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full inline-block'>
            {data?.category || data?.taskCategory || 'Uncategorized'}
          </h3>
        </div>

        {/* Due Date and Time Left */}
        <div className='text-right'>
          <div className='text-xs text-gray-500'>Due: {data?.endDate ? formatDate(data.endDate) : 'No deadline'}</div>
          <div className='text-xs font-medium text-red-600 mt-1'>{timeLeft || 'Expired'}</div>
        </div>
      </div>

      {/* Category */}


      {/* Task Title */}
      <h2 className='mt-5 text-lg font-semibold text-white'>
        {data?.taskTitle || data?.title || 'Untitled Task'}
      </h2>

      {/* Task Description */}
      <p className='mt-2 text-sm text-white line-clamp-3'>
        {data?.taskDescription || data?.description || 'No description provided.'}
      </p>

      {/* Footer with Expired Button */}
      <div className='mt-6 pt-3 border-t border-gray-100'>
        <button
          disabled
          className="w-full py-2 px-4 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors  disabled:cursor-not-allowed flex items-center justify-center"
        >
          Expired
        </button>
      </div>

    </div>
  );
};

FailedTask.propTypes = {
  isExpired: PropTypes.bool,
  data: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    taskTitle: PropTypes.string,
    taskDescription: PropTypes.string,
    category: PropTypes.string,
    priority: PropTypes.oneOf(['low', 'medium', 'high']),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    failedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    failureReason: PropTypes.string,
    status: PropTypes.oneOf(['new', 'active', 'completed', 'failed']),
  }).isRequired,
  onTaskUpdate: PropTypes.func,
};

export default FailedTask;