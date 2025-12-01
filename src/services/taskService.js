import { employeeAPI } from './api';

/**
 * Service for task-related operations including periodic status checks
 */
class TaskService {
  constructor() {
    this.checkInterval = null;
    this.subscribers = new Set();
  }

  /**
   * Start periodic task status checks
   * @param {number} intervalMs - Interval in milliseconds (default: 5 minutes)
   */
  startPeriodicChecks(intervalMs = 5 * 60 * 1000) {
    // Clear any existing interval
    this.stopPeriodicChecks();

    // Initial check
    this.checkExpiredTasks();

    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.checkExpiredTasks();
    }, intervalMs);
  }

  /**
   * Stop periodic task status checks
   */
  stopPeriodicChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check for and update expired tasks
   */
  async checkExpiredTasks() {
    try {
      const now = new Date();
      console.log(`[TaskService] Checking for expired tasks at ${now.toISOString()}`);
      
      // Call backend API to handle expired tasks
      const response = await employeeAPI.checkExpiredTasks();
      
      // Notify subscribers if there were updates
      if (response?.updatedCount > 0) {
        this.notifySubscribers();
        console.log(`[TaskService] Updated ${response.updatedCount} expired tasks`);
      }
      
      return response;
    } catch (error) {
      console.error('[TaskService] Error checking expired tasks:', error);
      throw error;
    }
  }

  /**
   * Subscribe to task updates
   * @param {Function} callback - Function to call when tasks are updated
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers of task updates
   */
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[TaskService] Error in subscriber callback:', error);
      }
    });
  }
}

export const taskService = new TaskService();

// Start periodic checks when the module is loaded
if (typeof window !== 'undefined') {
  // Only run in browser environment
  taskService.startPeriodicChecks();
}
