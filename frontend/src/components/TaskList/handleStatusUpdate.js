// Helper function to handle task status updates with validation and error handling
export const handleStatusUpdate = async (task, newStatus, updateTaskAPI) => {
  if (!task?._id) {
    console.error('Cannot update status: No task ID provided');
    return { error: 'No task ID provided' };
  }

  const { _id, status, completed, failed, verificationStatus, documentUrl } = task;
  const now = new Date().toISOString();

 
  if (completed || failed) {
    const message = `Task ${_id} is already in terminal state (${completed ? 'completed' : 'failed'})`;
    console.warn(message);
    return { error: message };
  }

  const validTransitions = {
    'new': ['active'],
    'active': ['pendingVerification', 'failed'],
    'pendingVerification': ['completed', 'rejected'],
    'rejected': ['active', 'failed']
  };

 
  if (validTransitions[status] && !validTransitions[status].includes(newStatus)) {
    const errorMsg = `Invalid status transition from ${status} to ${newStatus}`;
    console.error(errorMsg);
    return { error: errorMsg };
  }

  // Prepare update data based on the new status
  let updateData = { updatedAt: now };
  
  switch (newStatus) {
    case 'active':
      updateData = {
        ...updateData,
        status: 'active',
        newTask: false,
        active: true,
        startedAt: now
      };
      break;

    case 'pendingVerification':
      if (!documentUrl) {
        const errorMsg = 'Cannot submit for verification without document';
        console.error(errorMsg);
        return { error: errorMsg };
      }
      updateData = {
        ...updateData,
        status: 'pendingVerification',
        verificationStatus: 'pending',
        submittedAt: now
      };
      break;

    case 'completed':
      if (verificationStatus !== 'pending') {
        const errorMsg = 'Only tasks pending verification can be completed';
        console.error(errorMsg);
        return { error: errorMsg };
      }
      updateData = {
        ...updateData,
        status: 'completed',
        verificationStatus: 'approved',
        active: false,
        completed: true,
        completedAt: now,
        verifiedAt: now
      };
      break;

    case 'rejected':
      updateData = {
        ...updateData,
        status: 'rejected',
        verificationStatus: 'rejected',
        active: false,
        rejectedAt: now
      };
      break;

    case 'failed':
      updateData = {
        ...updateData,
        status: 'failed',
        verificationStatus: 'expired',
        active: false,
        failed: true,
        failedAt: now
      };
      break;

    default:
      const errorMsg = `Unhandled status update: ${newStatus}`;
      console.error(errorMsg);
      return { error: errorMsg };
  }

  try {
    console.log('Updating task status:', { taskId: _id, updateData });
    const updatedTask = await updateTaskAPI(_id, updateData);
    return { data: updatedTask };
  } catch (error) {
    console.error('Error updating task status:', {
      taskId: _id,
      currentStatus: status,
      newStatus,
      error: error.message,
      stack: error.stack
    });
    return { error: error.message || 'Failed to update task status' };
  }
};
