import React, { useMemo, useCallback, useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { isAfter, isEqual } from 'date-fns';
import { debounce } from 'lodash';
import AcceptTask from './AcceptTask';
import NewTask from './NewTask';
import CompleteTask from './CompleteTask';
import FailedTask from './FailedTask';

// Styled components for consistency
const sectionTitleStyles = 'text-xl font-bold m-10';
const cardContainerStyles = 'overflow-x-auto flex items-center justify-start gap-5 flex-nowrap w-full py-1 mt-10';

// Memoized task components to prevent unnecessary re-renders
const MemoizedNewTask = memo(NewTask);
const MemoizedAcceptTask = memo(AcceptTask);
const MemoizedCompleteTask = memo(CompleteTask);
const MemoizedFailedTask = memo(FailedTask);

const TaskList = ({ data, isLoading, error, onTaskUpdate }) => {
  // Debounce the task update function to prevent rapid consecutive calls
  const debouncedTaskUpdate = useCallback(debounce(async () => {
    if (onTaskUpdate) {
      try {
        await onTaskUpdate();
      } catch (err) {
        console.error('Error in task update:', err);
      }
    }
  }, 500), [onTaskUpdate]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedTaskUpdate.cancel();
    };
  }, [debouncedTaskUpdate]);

  // Wrap in useCallback to maintain referential equality
  const handleTaskUpdate = useCallback(() => {
    debouncedTaskUpdate();
  }, [debouncedTaskUpdate]);

  // Memoize the current date to prevent unnecessary recalculations
  const now = useMemo(() => new Date(), []);
  
  // Process tasks and ensure they can only be in one state at a time
  const tasks = useMemo(() => {
    if (!data?.tasks?.length) return [];
    
    return data.tasks.map(task => {
      // Skip invalid tasks
      if (!task || typeof task !== 'object') return null;
      
      // Check if task is expired
      const endDate = task.endDate ? new Date(task.endDate) : null;
      const isExpired = endDate ? now > endDate : false;
      
      // Create base task with employee reference and default values
      const baseTask = {
        ...task,
        employeeId: data._id || data.id,
        // Reset all status flags
        newTask: false,
        active: false,
        completed: false,
        failed: false,
        // Preserve empty string for initial state, default to 'none' only if undefined
        verificationStatus: task.verificationStatus === undefined ? 'none' : task.verificationStatus,
        // Store expiration status for easier access
        isExpired
      };

      // 1. Check for expired tasks first (highest priority)
      if (isExpired && !task.completed && task.verificationStatus !== 'approved') {
        return {
          ...baseTask,
          failed: true,
          status: 'failed',
          verificationStatus: 'expired',
          // Ensure all other statuses are false
          newTask: false,
          active: false,
          completed: false
        };
      }

      // 2. Check for completed tasks (approved by admin)
      if (task.completed || task.verificationStatus === 'approved') {
        return {
          ...baseTask,
          completed: true,
          verificationStatus: 'approved',
          // Ensure all other statuses are false
          newTask: false,
          active: false,
          failed: false
        };
      }

      // 3. Check for pending verification
      if (task.verificationStatus === 'pending') {
        return {
          ...baseTask,
          verificationStatus: 'pending',
          // Ensure all other statuses are false
          newTask: false,
          active: false,
          completed: false,
          failed: false
        };
      }

      // 4. Rejected tasks should return to Active for re-upload
      if (task.verificationStatus === 'rejected') {
        return {
          ...baseTask,
          verificationStatus: 'rejected',
          // Place back into active with rejection context
          active: true,
          newTask: false,
          completed: false,
          failed: false
        };
      }

      // 5. Handle tasks with empty verification status (initial state)
      if (task.verificationStatus === '') {
        return {
          ...baseTask,
          verificationStatus: '',
          // Keep the task in its current state (new or active)
          newTask: task.newTask || false,
          active: task.active || false,
          // Ensure other statuses are false
          completed: false,
          failed: false
        };
      }

      // 6. Check for new tasks
      if (task.newTask) {
        return {
          ...baseTask,
          newTask: true,
          // Ensure all other statuses are false
          active: false,
          completed: false,
          failed: false,
          verificationStatus: 'none'
        };
      }

      // 6. Default to active task (lowest priority)
      return {
        ...baseTask,
        active: true,
        // Ensure all other statuses are false
        newTask: false,
        completed: false,
        failed: false,
        verificationStatus: 'none'
      };
    }).filter(Boolean); // Remove any null entries
  }, [data?.tasks, data?._id, data?.id]);

  // Single pass to categorize all tasks into their respective statuses
  const {
    failedTasks,
    completeTasks,
    pendingVerificationTasks,
    rejectedTasks,
    newTasks,
    activeTasks
  } = useMemo(() => {
    const failed = [];
    const complete = [];
    const pending = [];
    const rejected = [];
    const newTasks = [];
    const active = [];
    
    tasks.forEach(task => {
      if (task.failed) {
        failed.push(task);
      } else if (task.completed || task.verificationStatus === 'approved') {
        complete.push(task);
      } else if (task.verificationStatus === 'pending') {
        pending.push(task);
      } else if (task.verificationStatus === 'rejected') {
        // Show rejected tasks under Active so user can re-upload
        active.push(task);
      } else if (task.newTask) {
        newTasks.push(task);
      } else {
        active.push(task);
      }
    });
    
    return { 
      failedTasks: failed, 
      completeTasks: complete, 
      pendingVerificationTasks: pending, 
      rejectedTasks: rejected,
      newTasks: newTasks,
      activeTasks: active
    };
  }, [tasks]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error.message || 'Failed to load tasks'}</p>
        <button
          onClick={handleTaskUpdate}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show empty state
  if (!data || !Array.isArray(data.tasks) || data.tasks.length === 0) {
    return <div className='text-center py-10'>No tasks found</div>;
  }

  return (
    <div className="space-y-12">
      {/* New Tasks Section */}
      {newTasks.length > 0 && (
        <section>
          <h1 className={sectionTitleStyles}>New Tasks</h1>
          <div className={cardContainerStyles}>
            {newTasks.map((task) => (
              <MemoizedNewTask 
                key={`new-${task._id}`} 
                data={task} 
                onTaskUpdate={handleTaskUpdate} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Pending Verification Section */}
      {pendingVerificationTasks.length > 0 && (
        <section>
          <h1 className={`${sectionTitleStyles} text-yellow-600`}>Pending Verification</h1>
          <p className="text-gray-500 text-sm mb-4 px-10">
            These tasks are awaiting admin verification. You'll be notified once they're reviewed.
          </p>
          <div className={cardContainerStyles}>
            {pendingVerificationTasks.map((task) => (
              <MemoizedAcceptTask 
                key={`pending-${task._id}`} 
                data={task} 
                onTaskUpdate={handleTaskUpdate} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Active Tasks Section */}
      {activeTasks.length > 0 && (
        <section>
          <h1 className={sectionTitleStyles}>Active Tasks</h1>
          <div className={cardContainerStyles}>
            {activeTasks.map((task) => (
              <MemoizedAcceptTask 
                key={`active-${task._id}`} 
                data={task} 
                onTaskUpdate={handleTaskUpdate} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Rejected Tasks Section */}
      {rejectedTasks.length > 0 && (
        <section>
          <h1 className={`${sectionTitleStyles} text-orange-600`}>Rejected Tasks - Needs Resubmission</h1>
          <div className='mb-2 px-10 text-sm text-orange-700'>
            These tasks were rejected by the admin. Please review the feedback and resubmit.
          </div>
          <div className={cardContainerStyles}>
            {rejectedTasks.map((task) => (
              <MemoizedAcceptTask 
                key={`rejected-${task._id}`} 
                data={task} 
                onTaskUpdate={handleTaskUpdate} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Failed/Expired Tasks Section */}
      {failedTasks.length > 0 && (
        <section>
          <h1 className={`${sectionTitleStyles} text-red-600`}>Failed/Expired Tasks</h1>
          <div className='mb-2 px-10 text-sm text-red-700'>
            These tasks have either failed or expired and can no longer be completed.
          </div>
          <div className={cardContainerStyles}>
            {failedTasks.map((task) => (
              <MemoizedFailedTask 
                key={`failed-${task._id}`} 
                data={task} 
                onTaskUpdate={handleTaskUpdate} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed Tasks Section */}
      {completeTasks.length > 0 && (
        <section>
          <h1 className={`${sectionTitleStyles} text-green-600`}>Completed Tasks</h1>
          <div className={cardContainerStyles}>
            {completeTasks.map((task) => (
              <MemoizedCompleteTask 
                key={`complete-${task._id}`} 
                data={task} 
                onTaskUpdate={handleTaskUpdate} 
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

TaskList.propTypes = {
  data: PropTypes.shape({
    _id: PropTypes.string,
    tasks: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      taskTitle: PropTypes.string,
      description: PropTypes.string,
      taskDescription: PropTypes.string,
      startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      completed: PropTypes.bool,
      failed: PropTypes.bool,
      active: PropTypes.bool,
      newTask: PropTypes.bool,
      status: PropTypes.string,
      verificationStatus: PropTypes.oneOf(['pending', 'verified', 'rejected']),
      category: PropTypes.oneOf(['Design', 'Development', 'Meeting', 'QA', 'Documentation', 'DevOps', 'Presentation', 'Support']),
      priority: PropTypes.oneOf(['low', 'medium', 'high']),
      files: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        url: PropTypes.string,
        type: PropTypes.string,
        size: PropTypes.number
      })),
      submittedDocuments: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        size: PropTypes.number,
        type: PropTypes.string,
        url: PropTypes.string
      })),
      feedback: PropTypes.string,
      rejectionReason: PropTypes.string,
      employeeId: PropTypes.string,
      createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    }))
  }),
  isLoading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.instanceOf(Error),
    PropTypes.shape({
      message: PropTypes.string
    }),
    PropTypes.object
  ]),
  onTaskUpdate: PropTypes.func.isRequired
};

TaskList.defaultProps = {
  data: { tasks: [] },
  isLoading: false,
  error: null
};

export default TaskList;