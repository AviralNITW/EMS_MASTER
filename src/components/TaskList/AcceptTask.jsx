import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { format, isAfter, isBefore, formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';
import { employeeAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { getTaskStatus, validateStatusUpdate, getStatusUpdatePayload } from '../../utils/taskUtils';
import DocumentUploader from './DocumentUploader';
import { debounce } from 'lodash';
// Helper function to check if task can be resubmitted
  const canResubmit = (task) => {
  if (!task.endDate) return true; // No deadline, can always resubmit
  // Can resubmit only if after endDate AND task is not completed
  return isAfter(new Date(), new Date(task.endDate)) && !task.completed;
};

const AcceptTask = ({ data, onTaskUpdate }) => {
  const [localState, setLocalState] = useState({
    timeLeft: '',
    isUpdating: false,
    isUploading: false,
    uploadError: null,
    error: null,
    taskData: data,
    loading: false
  });
  
  // Memoize the task data comparison to prevent unnecessary re-renders
  const taskData = useMemo(() => data, [JSON.stringify(data)]);
  
  // Update local state with debounce
  const updateLocalState = useCallback((updates) => {
    setLocalState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Memoized date formatter
  const formatDate = useCallback((dateString) => {
    try {
      return dateString ? formatDistanceToNow(new Date(dateString)) : 'N/A';
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  }, []);

  // Memoized expiration check
  const isTaskExpired = useCallback((endDate) => {
    if (!endDate) return false;
    return isAfter(new Date(), new Date(endDate));
  }, []);

  // Debounced task update function
  const debouncedTaskUpdate = useCallback(debounce(async (taskId, updateData) => {
    try {
      await employeeAPI.updateTask(data.employeeId, taskId, updateData);
      toast.success(`Task status updated`);
      onTaskUpdate?.();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error(`Failed to update task: ${error.message || 'Unknown error'}`);
      throw error;
    }
  }, 500), [data?.employeeId, onTaskUpdate]);

  // Handle status updates for the task
  const handleStatusUpdate = useCallback(async (newStatus) => {
    if (!data?._id) return;
    
    try {
      updateLocalState({ loading: true });
      
      // Validate the status update
      const validation = validateStatusUpdate(data, newStatus);
      if (!validation.isValid) {
        toast.error(validation.reason || 'Invalid status update');
        return;
      }
      
      // Get the appropriate update payload
      const updateData = getStatusUpdatePayload(newStatus, data);
      
      // Optimistic UI update
      updateLocalState({
        taskData: { ...data, ...updateData },
        loading: false
      });
      
      // Debounced API call
      await debouncedTaskUpdate(data._id, updateData);
      
    } catch (error) {
      console.error('Error in handleStatusUpdate:', error);
      updateLocalState({ 
        error: error.message || 'Failed to update task',
        loading: false 
      });
    }
  }, [data, debouncedTaskUpdate, updateLocalState]);

  // Check task status with cleanup
  useEffect(() => {
    if (!data?._id || !data?.endDate) return;
    
    // Create a flag to track if the component is still mounted
    let isMounted = true;
    
    const checkTaskStatus = async () => {
      if (!isMounted) return;
      
      try {
        const currentStatus = getTaskStatus(data);
        const now = new Date();
        const endDate = new Date(data.endDate);
        
        // Skip if task is already in a terminal state
        if (['completed', 'failed'].includes(currentStatus)) {
          return;
        }
        
        // Check if task is expired and should be marked as failed
        if (now > endDate) {
          const hasPendingVerification = data.verificationStatus === 'pending';
          const hasSubmittedDocument = !!data.documentUrl || (data.submittedDocuments?.length > 0);
          
          if (!hasPendingVerification && !hasSubmittedDocument && data.active && !data.completed) {
            console.log('Marking task as failed due to expiration');
            await handleStatusUpdate('failed');
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error in task status check:', error);
        }
      }
    };
    
    // Initial check with debounce
    const debounceTimer = setTimeout(() => {
      checkTaskStatus();
    }, 1000);
    
    // Set up interval for periodic checks (reduced to every 10 minutes)
    const intervalId = setInterval(() => {
      checkTaskStatus();
    }, 600000);
    
    // Clean up
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
      clearInterval(intervalId);
    };
  }, [data?._id, data?.endDate, data?.verificationStatus, data?.documentUrl, data?.submittedDocuments, data?.active, data?.completed, handleStatusUpdate]);

  // Handle task acceptance (newTask -> active)
  const handleAcceptTask = useCallback(async () => {
    if (!data?.newTask) return;
    
    try {
      await handleStatusUpdate('active');
    } catch (error) {
      console.error('Error accepting task:', error);
      updateLocalState({ 
        error: error.message || 'Failed to accept task' 
      });
    }
  }, [data?.newTask, handleStatusUpdate, updateLocalState]);

  // Handle document upload and submit for verification (active -> pendingVerification)
  const handleDocumentUpload = useCallback(async (file, onProgress) => {
    if (!file) return;
    // Block uploads if task expired and not completed
    const expired = isAfter(new Date(), new Date(data.endDate || 0));
    if (expired && !data.completed) {
      updateLocalState({ uploadError: 'Task expired. You can no longer upload.' });
      return;
    }

    updateLocalState({ 
      isUploading: true,
      uploadError: null 
    });

    try {
      // First, ensure task is active (accept it if it's new or has empty verification status)
      if (data.newTask || data.verificationStatus === '') {
        await handleAcceptTask();
      }

      // Upload the document
      const formData = new FormData();
      formData.append('document', file);
      
      // Show instant progress while uploading
      const response = await employeeAPI.uploadDocument(
        data.employeeId,
        data._id,
        formData,
        (percent) => {
          if (typeof onProgress === 'function') onProgress(percent);
        }
      );

      // Optimistic UI update
      const updatedTask = {
        ...data,
        submittedDocuments: [
          ...(data.submittedDocuments || []),
          response.document
        ],
        verificationStatus: 'pending',
        status: 'pendingVerification',
        active: false,
        newTask: false
      };

      updateLocalState({
        taskData: updatedTask,
        isUploading: false
      });

      // Mark task as pending verification after successful upload
      await handleStatusUpdate('pendingVerification');
      
      return updatedTask;
    } catch (error) {
      console.error('Error uploading document:', error);
      updateLocalState({ 
        uploadError: error.message || 'Failed to upload document',
        isUploading: false 
      });
      throw error;
    }
  }, [data, handleAcceptTask, handleStatusUpdate, updateLocalState]);

  // Timer effect for countdown
  useEffect(() => {
    if (!data?.endDate) return;

    const updateTimer = () => {
      try {
        const end = new Date(data.endDate);
        const now = new Date();
        const diff = end - now;

        if (diff <= 0) {
          setLocalState(prev => ({ ...prev, timeLeft: 'Expired' }));
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setLocalState(prev => ({
          ...prev,
          timeLeft: `${days}d ${hours}h ${minutes}m ${seconds}s`
        }));
      } catch (err) {
        console.error('Error in timer update:', err);
        setLocalState(prev => ({ ...prev, timeLeft: '--' }));
      }
    };

    // Initial update
    updateTimer();

    // Set up interval to check every second for countdown
    const intervalId = setInterval(updateTimer, 1000);
    
    // Cleanup interval on component unmount or data change
    return () => {
      clearInterval(intervalId);
    };
  }, [data?.endDate]);

  // Show error state
  if (localState.error) {
    return (
      <div className="flex-shrink-0 min-h-[280px] sm:min-h-[300px] w-full sm:w-[300px] p-4 sm:p-5 bg-red-100 border-l-4 border-red-500 rounded-xl">
        <h3 className="text-red-700 font-bold text-sm sm:text-base">Error</h3>
        <p className="text-red-600 text-xs sm:text-sm mt-2">
          {localState.error.message || 'Failed to load task details'}
        </p>
        <button
          onClick={() => updateLocalState({ error: null })}
          className="mt-4 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Dismiss
        </button>
      </div>
    );
  }

  // Show loading state
  if (localState.loading || localState.isUpdating) {
    return (
      <div className="flex-shrink-0 min-h-[280px] sm:min-h-[300px] w-full sm:w-[300px] p-4 sm:p-5 bg-white bg-opacity-70 rounded-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Determine if the task can be resubmitted
  const canBeResubmitted = canResubmit(data);
  const isPendingVerification = data?.verificationStatus === 'pending';
  const isRejected = data?.verificationStatus === 'rejected';
  const isExpired = isTaskExpired(data?.endDate);
  const currentStatus = getTaskStatus(data);

  return (
    <div className="flex-shrink-0 min-h-[280px] sm:min-h-[300px] w-full sm:w-[300px] p-4 sm:p-5 bg-white border-l-4 border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Task header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 sm:gap-0 mb-3">
        <h3 className="font-medium text-gray-800">{data.taskTitle}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          data.priority === 'high' ? 'bg-red-100 text-red-800' :
          data.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {data.priority}
        </span>
      </div>

      {/* Task description */}
      <p className="text-xs sm:text-sm text-gray-600 mb-4">{data.taskDescription || 'No description provided.'}</p>

      {/* Task details */}
      <div className="space-y-2 text-xs text-gray-500 mb-4">
        <div className="flex items-center">
          <span className="w-24 font-medium">Category:</span>
          <span className="capitalize">{data.category || 'N/A'}</span>
        </div>
        <div className="flex items-center">
          <span className="w-24 font-medium">Due:</span>
          <span className={isExpired ? 'text-red-500' : ''}>
            {data.endDate ? format(new Date(data.endDate), 'MMM d, yyyy h:mm a') : 'No deadline'}
            {isExpired && ' (Expired)'}
          </span>
        </div>
        <div className="flex items-center">
          <span className="w-24 font-medium">Status:</span>
          <span className={`capitalize ${
            currentStatus === 'completed' ? 'text-green-600' :
            currentStatus === 'failed' ? 'text-red-600' :
            'text-blue-600'
          }`}>
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Rejection reason */}
      {isRejected && data?.rejectionReason && (
        <div className='mt-3 p-2 bg-red-50 border border-red-100 rounded-md mb-4'>
          <h4 className='text-xs font-medium text-red-800 mb-1'>Rejection Reason:</h4>
          <p className='text-xs text-red-700'>{data.rejectionReason}</p>
        </div>
      )}

      {/* Document uploader */}
      {!isPendingVerification && (!isRejected || canBeResubmitted) && (
        <div className='mt-4'>
          <DocumentUploader
            onUpload={handleDocumentUpload}
            isUploading={localState.isUploading}
            error={localState.uploadError}
            task={data}
            disabled={localState.isUpdating}
          />
        </div>
      )}

      {/* Pending verification message */}
      {isPendingVerification && (
        <div className='mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md text-center'>
          <p className='text-sm text-yellow-800'>
            Waiting for admin verification...
          </p>
        </div>
      )}

      {/* Error message */}
      {localState.error && (
        <div className='mt-2 text-xs text-red-500'>{localState.error}</div>
      )}
    </div>
  );
};

AcceptTask.propTypes = {
  data: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    employeeId: PropTypes.string,
    taskTitle: PropTypes.string,
    taskDescription: PropTypes.string,
    category: PropTypes.string,
    priority: PropTypes.oneOf(['low', 'medium', 'high']),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    status: PropTypes.oneOf(['new', 'active', 'completed', 'failed']),
    verificationStatus: PropTypes.string,
    submittedDocuments: PropTypes.array,
    documentUrl: PropTypes.string,
    active: PropTypes.bool,
    completed: PropTypes.bool,
    failed: PropTypes.bool,
    newTask: PropTypes.bool,
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    assignedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    completedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    failedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
  }).isRequired,
  onTaskUpdate: PropTypes.func
};

// Memoize the component to prevent unnecessary re-renders
export default memo(AcceptTask, (prevProps, nextProps) => {
  // Only re-render if the task data has actually changed
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
         prevProps.onTaskUpdate === nextProps.onTaskUpdate;
});

