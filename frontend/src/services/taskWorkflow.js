// Task Workflow Management Service
// Handles task state transitions and business logic

export class TaskWorkflowService {
  
  /**
   * Check if a task has expired
   * @param {Object} task - Task object with endDate
   * @returns {boolean} - True if task is expired
   */
  static isTaskExpired(task) {
    const now = new Date();
    const endDate = new Date(task.endDate);
    return now > endDate;
  }

  /**
   * Check if a task has submitted documents
   * @param {Object} task - Task object
   * @returns {boolean} - True if task has documents
   */
  static hasSubmittedDocuments(task) {
    return task.submittedDocuments && task.submittedDocuments.length > 0;
  }

  /**
   * Determine the correct EXCLUSIVE state for a task based on current conditions
   * @param {Object} task - Task object
   * @returns {Object} - Updated task state (EXCLUSIVE - only one state true)
   */
  static determineTaskState(task) {
    const isExpired = this.isTaskExpired(task);
    const hasDocuments = this.hasSubmittedDocuments(task);
    
    // PRIORITY ORDER: completed > pendingVerification > failed > active > newTask
    
    // HIGHEST PRIORITY: If task is already completed
    if (task.completed) {
      return {
        newTask: false,
        active: false,
        completed: true,
        failed: false,
        pendingVerification: false
      };
    }
    
    // SECOND PRIORITY: If task is pending verification
    if (task.pendingVerification) {
      return {
        newTask: false,
        active: false,
        completed: false,
        failed: false,
        pendingVerification: true
      };
    }
    
    // THIRD PRIORITY: If task is expired and has no documents, mark as failed
    if (isExpired && !hasDocuments) {
      return {
        newTask: false,
        active: false,
        completed: false,
        failed: true,
        pendingVerification: false
      };
    }
    
    // FOURTH PRIORITY: If task was accepted (not new) but not expired and no documents, keep as active
    if (!task.newTask && !isExpired && !hasDocuments) {
      return {
        newTask: false,
        active: true,
        completed: false,
        failed: false,
        pendingVerification: false
      };
    }
    
    // FIFTH PRIORITY: If task is new and not expired, keep as new
    if (task.newTask && !isExpired) {
      return {
        newTask: true,
        active: false,
        completed: false,
        failed: false,
        pendingVerification: false
      };
    }
    
    // FALLBACK: If none of the above conditions match, determine based on current highest priority state
    if (task.completed) {
      return { newTask: false, active: false, completed: true, failed: false, pendingVerification: false };
    }
    if (task.pendingVerification) {
      return { newTask: false, active: false, completed: false, failed: false, pendingVerification: true };
    }
    if (task.failed) {
      return { newTask: false, active: false, completed: false, failed: true, pendingVerification: false };
    }
    if (task.active) {
      return { newTask: false, active: true, completed: false, failed: false, pendingVerification: false };
    }
    if (task.newTask) {
      return { newTask: true, active: false, completed: false, failed: false, pendingVerification: false };
    }
    
    // DEFAULT: New task state
    return {
      newTask: true,
      active: false,
      completed: false,
      failed: false,
      pendingVerification: false
    };
  }

  /**
   * Process task acceptance - move from new to active
   * @param {Object} task - Task object
   * @returns {Object} - Updated task state (EXCLUSIVE)
   */
  static acceptTask(task) {
    if (this.isTaskExpired(task)) {
      // Can't accept expired tasks
      throw new Error('Cannot accept expired task');
    }
    
    // EXCLUSIVE STATE: Only active should be true
    return {
      newTask: false,
      active: true,
      completed: false,
      failed: false
    };
  }

  /**
   * Process document submission - move to complete
   * @param {Object} task - Task object
   * @returns {Object} - Updated task state (EXCLUSIVE)
   */
  static submitDocument(task) {
    // EXCLUSIVE STATE: Only completed should be true
    return {
      newTask: false,
      active: false,
      completed: true,
      failed: false
    };
  }

  /**
   * Process task expiration - move to failed if no documents
   * @param {Object} task - Task object
   * @returns {Object} - Updated task state (EXCLUSIVE)
   */
  static expireTask(task) {
    if (this.hasSubmittedDocuments(task)) {
      // If has documents, mark as complete even if late
      return this.submitDocument(task);
    } else {
      // No documents, mark as failed - EXCLUSIVE STATE
      return {
        newTask: false,
        active: false,
        completed: false,
        failed: true
      };
    }
  }

  /**
   * Bulk process all tasks for an employee to update their states
   * @param {Array} tasks - Array of task objects
   * @returns {Array} - Array of updated tasks
   */
  static processAllTasks(tasks) {
    return tasks.map(task => {
      const newState = this.determineTaskState(task);
      return {
        ...task,
        ...newState
      };
    });
  }

  /**
   * Get task statistics for an employee
   * @param {Array} tasks - Array of task objects
   * @returns {Object} - Task count statistics
   */
  static getTaskStatistics(tasks) {
    const processedTasks = this.processAllTasks(tasks);
    
    return {
      newTask: processedTasks.filter(task => task.newTask).length,
      active: processedTasks.filter(task => task.active).length,
      completed: processedTasks.filter(task => task.completed).length,
      failed: processedTasks.filter(task => task.failed).length,
      total: processedTasks.length
    };
  }

  /**
   * Check if any tasks need state updates
   * @param {Array} tasks - Array of task objects
   * @returns {boolean} - True if any tasks need updates
   */
  static needsStateUpdate(tasks) {
    return tasks.some(task => {
      const currentState = {
        newTask: task.newTask,
        active: task.active,
        completed: task.completed,
        failed: task.failed
      };
      
      const expectedState = this.determineTaskState(task);
      
      return JSON.stringify(currentState) !== JSON.stringify(expectedState);
    });
  }
}

export default TaskWorkflowService;
