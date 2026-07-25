/**
 * Task Status Management Utilities
 * 
 * This module provides consistent task status management across the application.
 * It ensures that task state transitions are valid and handles all edge cases.
 */

/**
 * Valid task status transitions
 */
const ALLOWED_TRANSITIONS = {
  'new': ['active', 'failed'],
  'active': ['pendingVerification', 'failed'],
  'pendingVerification': ['completed', 'rejected', 'failed'],
  'rejected': ['pendingVerification', 'failed'],
  'completed': [], // Terminal state
  'failed': []     // Terminal state
};

/**
 * Check if a task status transition is valid
 * @param {string} currentStatus - Current status of the task
 * @param {string} newStatus - Desired new status
 * @returns {boolean} - True if the transition is valid
 */
export const isValidTransition = (currentStatus, newStatus) => {
  if (!currentStatus) return false;
  if (currentStatus === newStatus) return true; // No state change is always valid
  
  const allowedNextStates = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowedNextStates.includes(newStatus);
};

/**
 * Get the appropriate task status based on task properties
 * @param {Object} task - The task object
 * @returns {string} - The calculated status
 */
export const getTaskStatus = (task) => {
  if (!task) return 'unknown';
  
  const now = new Date();
  const endDate = task.endDate ? new Date(task.endDate) : null;
  const isExpired = endDate ? now > endDate : false;
  
  // Check for terminal states first (highest priority)
  if (task.completed && task.verificationStatus === 'verified') {
    return 'completed';
  }
  
  if (task.failed || (isExpired && task.verificationStatus !== 'verified')) {
    return 'failed';
  }
  
  // Check for verification states
  if (task.verificationStatus === 'pending') {
    return 'pendingVerification';
  }
  
  if (task.verificationStatus === 'rejected') {
    return 'rejected';
  }
  
  // Check for active state
  if (task.active) {
    return 'active';
  }
  
  // Default to new task
  return 'new';
};

/**
 * Get the appropriate status update payload for a task
 * @param {string} newStatus - The target status
 * @param {Object} task - The task object
 * @returns {Object} - The update payload
 */
export const getStatusUpdatePayload = (newStatus, task = {}) => {
  const now = new Date().toISOString();
  const baseUpdate = {
    updatedAt: now,
    status: newStatus
  };
  
  switch (newStatus) {
    case 'active':
      return {
        ...baseUpdate,
        active: true,
        newTask: false,
        completed: false,
        failed: false,
        acceptedAt: now
      };
      
    case 'pendingVerification':
      return {
        ...baseUpdate,
        active: false,
        verificationStatus: 'pending',
        submittedAt: now
      };
      
    case 'completed':
      return {
        ...baseUpdate,
        active: false,
        completed: true,
        failed: false,
        verificationStatus: 'verified',
        completedAt: now
      };
      
    case 'rejected':
      return {
        ...baseUpdate,
        active: false,
        verificationStatus: 'rejected',
        rejectedAt: now
      };
      
    case 'failed':
      return {
        ...baseUpdate,
        active: false,
        completed: false,
        failed: true,
        verificationStatus: 'expired',
        failedAt: now
      };
      
    default:
      return baseUpdate;
  }
};

/**
 * Validate if a task can be updated to the new status
 * @param {Object} task - The task object
 * @param {string} newStatus - The desired new status
 * @returns {{isValid: boolean, reason: string|null}}
 */
export const validateStatusUpdate = (task, newStatus) => {
  const currentStatus = getTaskStatus(task);
  
  // Check if it's a valid transition
  if (!isValidTransition(currentStatus, newStatus)) {
    return {
      isValid: false,
      reason: `Invalid status transition from ${currentStatus} to ${newStatus}`
    };
  }
  
  // Additional validation for specific statuses
  if (newStatus === 'pendingVerification' && !task.documentUrl) {
    return {
      isValid: false,
      reason: 'Cannot submit for verification without a document'
    };
  }
  
  return { isValid: true, reason: null };
};
