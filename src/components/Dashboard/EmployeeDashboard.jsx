import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import isEqual from 'lodash/isEqual';
import Header from '../other/Header';
import TaskListNumbers from '../other/TaskListNumbers';
import TaskList from '../TaskList/TaskList';
import { employeeAPI } from '../../services/api';

// Constants
const POLLING_INTERVAL = 60000; // 60 seconds
const MIN_UPDATE_INTERVAL = 10000; // 10 seconds

const EmployeeDashboard = (props) => {
  const [employeeData, setEmployeeData] = useState(props.data);
  const [isLoading, setIsLoading] = useState(false);
  const lastCheckRef = useRef(0);
  const updateInProgress = useRef(false);
  const isMounted = useRef(true);
  const didFetch = useRef(false);
  const prevDataRef = useRef();
  const prevEmployeeIdRef = useRef();
  
  // Memoize the employee ID to prevent unnecessary effect re-runs
  const employeeId = useMemo(() => props.data?._id || props.data?.id, [props.data?._id, props.data?.id]);
  
  // Update local state when props change - optimized with shallow comparison
  useEffect(() => {
    if (!isMounted.current) return;
    
    const hasDataChanged = !prevDataRef.current || 
                         !isEqual(prevDataRef.current, props.data);
    
    const hasEmployeeChanged = prevEmployeeIdRef.current !== employeeId;
    
    if (hasDataChanged || hasEmployeeChanged) {
      setEmployeeData(prev => {
        // Only update if the data has actually changed
        if (!isEqual(prev, props.data)) {
          return props.data;
        }
        return prev;
      });
      
      prevDataRef.current = props.data;
      prevEmployeeIdRef.current = employeeId;
    }
  }, [props.data, employeeId]);

  // Handle task updates - optimized with useCallback and proper dependencies
  const handleTaskUpdate = useCallback(async (force = false) => {
    if (!employeeId || !isMounted.current) {
      return;
    }

    if (updateInProgress.current) {
      return;
    }

    const now = Date.now();
    
    // Prevent too frequent updates unless forced
    if (!force && now - lastCheckRef.current < MIN_UPDATE_INTERVAL) {
      return;
    }
    
    lastCheckRef.current = now;
    updateInProgress.current = true;
    
    try {
      setIsLoading(true);
      
      // Fetch fresh data from the server
      const response = await employeeAPI.getById(employeeId);
      const updatedEmployee = response?.data;
      
      if (!updatedEmployee) {
        throw new Error('No employee data available from server');
      }

      // Update local state only if different from current state
      setEmployeeData(prevData => {
        if (!isEqual(prevData, updatedEmployee)) {
          return updatedEmployee;
        }
        return prevData;
      });
      
      return updatedEmployee;
    } catch (error) {
      console.error('Error in handleTaskUpdate:', error.message);
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        // Reset the update in progress flag after a short delay
        setTimeout(() => {
          if (isMounted.current) {
            updateInProgress.current = false;
          }
        }, 500);
      }
    }
  }, [employeeId]);

  // Handle task expiration - only run when employeeData changes
  useEffect(() => {
    if (!isMounted.current || !employeeData?.tasks?.length || updateInProgress.current) {
      return;
    }

    const checkExpiredTasks = async () => {
      const now = new Date();
      const expiredTasks = employeeData.tasks.filter(task => {
        if (!task.active || task.completed || task.failed) return false;
        const taskEndDate = new Date(task.endDate);
        return now > taskEndDate;
      });

      if (expiredTasks.length === 0) return;

      try {
        const updatePromises = expiredTasks.map(task => {
          if (!isMounted.current) return null;
          
          return employeeAPI.updateTask(
            employeeData._id || employeeData.id,
            task._id || task.id,
            {
              ...task,
              active: false,
              failed: true,
              status: 'failed',
              updatedAt: now.toISOString()
            }
          );
        }).filter(Boolean);

        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
          // After updating expired tasks, refresh the data
          if (isMounted.current) {
            handleTaskUpdate();
          }
        }
      } catch (error) {
        console.error('Failed to update expired tasks:', error);
      }
    };

    checkExpiredTasks();
  }, [employeeData?._id, employeeData?.id, employeeData?.tasks?.length, handleTaskUpdate]);

  // Initial data fetch on mount and cleanup (guarded against double-invoke in StrictMode)
  useEffect(() => {
    isMounted.current = true;
    let pollInterval;

    const fetchInitialData = async () => {
      if (!isMounted.current) return;
      if (didFetch.current) return; // prevent duplicate fetch in StrictMode
      didFetch.current = true;
      
      try {
        await handleTaskUpdate(true);
        
        // Set up polling only after initial fetch is complete
        if (isMounted.current && employeeId) {
          pollInterval = setInterval(() => {
            if (isMounted.current && document.visibilityState === 'visible') {
              handleTaskUpdate();
            }
          }, POLLING_INTERVAL);
        }
      } catch (error) {
        console.error('Error in initial data fetch:', error);
      }
    };

    fetchInitialData();
    
    // Handle visibility changes to pause polling when tab is not active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted.current) {
        // Refresh data when tab becomes visible
        handleTaskUpdate(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      isMounted.current = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [employeeId, handleTaskUpdate]);

  // Memoize the task list to prevent unnecessary re-renders
  const taskList = useMemo(() => {
    if (!employeeData?.tasks) return [];
    return employeeData.tasks;
  }, [employeeData?.tasks]);
  
  // Memoize the task numbers to prevent unnecessary re-renders
  const taskNumbers = useMemo(() => {
    if (!employeeData?.tasks) return { total: 0, completed: 0, pending: 0 };
    
    return employeeData.tasks.reduce((acc, task) => {
      acc.total++;
      if (task.completed) acc.completed++;
      if (task.active && !task.completed && !task.failed) acc.pending++;
      return acc;
    }, { total: 0, completed: 0, pending: 0 });
  }, [employeeData?.tasks]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted.current) {
        // Tab became visible, force an update
        handleTaskUpdate(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleTaskUpdate]);

  // Only render the component if we have data
  if (!employeeData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1C1C1C]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 bg-[#1C1C1C] min-h-screen">
      <Header changeUser={props.changeUser} data={employeeData} />
      <TaskListNumbers data={employeeData} />
      <TaskList data={employeeData} onTaskUpdate={handleTaskUpdate} />
      
      {isLoading && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded">
          Updating tasks...
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;