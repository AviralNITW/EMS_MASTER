import React, { useEffect, useState, useContext } from 'react';
import { adminAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthProvider';

const TaskVerificationSimple = ({ adminData, onDataUpdate }) => {
  const { currentAdmin } = useContext(AuthContext);
  const adminId = currentAdmin?._id;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [verificationNotes, setVerificationNotes] = useState({});

  // Extract pending tasks from adminData or currentAdmin
  useEffect(() => {
    console.log('TaskVerificationSimple - adminData:', adminData);
    console.log('TaskVerificationSimple - currentAdmin:', currentAdmin);
    
    // Use adminData if available, otherwise fallback to currentAdmin
    const dataSource = adminData || currentAdmin;
    
    if (dataSource && dataSource.employees) {
      const pendingTasks = [];
      dataSource.employees.forEach(employee => {
        console.log('Employee:', employee.firstName, 'Tasks:', employee.tasks);
        if (employee.tasks && Array.isArray(employee.tasks)) {
          employee.tasks.forEach(task => {
            console.log('Task:', task.taskTitle, 'verificationStatus:', task.verificationStatus);
            if (task.verificationStatus === 'pending') {
              pendingTasks.push({
                ...task,
                employee: {
                  _id: employee._id,
                  firstName: employee.firstName,
                  email: employee.email
                }
              });
            }
          });
        }
      });
      console.log('Pending tasks found:', pendingTasks.length);
      setTasks(pendingTasks);
    } else {
      console.log('No valid data source found');
      setTasks([]);
    }
  }, [adminData, currentAdmin]);

  const handleVerificationNoteChange = (taskId, note) => {
    setVerificationNotes(prev => ({
      ...prev,
      [taskId]: note
    }));
  };

  const act = async (task, action) => {
    try {
      setBusy(task._id);
      const verificationNote = verificationNotes[task._id] || '';
      // Guard: if task already expired and not completed, reject it (server will enforce anyway)
      const isExpired = task.endDate ? new Date(task.endDate) < new Date() : false;
      if (isExpired && action === 'verify') {
        setError('Cannot verify an expired task');
        setBusy('');
        return;
      }
      
      // Backend accepts only "completed" or "rejected" for status.
      // Send note as reason when rejecting; backend will update flags accordingly
      const status = action === 'verify' ? 'completed' : 'rejected';
      await adminAPI.verifyTask(task.employee._id, task._id, { status, reason: verificationNote });
      
      // Clear the verification note for this task
      setVerificationNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[task._id];
        return newNotes;
      });
      
      // Refresh the admin data
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (e) {
      setError(e?.message || 'Action failed');
    } finally {
      setBusy('');
    }
  };

  if (error) return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Task Verification</h2>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-red-600 mb-3">{error}</div>
        <button onClick={() => setError('')} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded">Dismiss</button>
      </div>
    </div>
  );
  // Show loading state if no data source is available yet
  if (!adminData && !currentAdmin) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Task Verification</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-gray-500 text-lg">Loading verification data...</div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Task Verification</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-500 text-lg">No tasks pending verification</div>
        <div className="text-gray-400 text-sm mt-2">All submitted tasks have been reviewed</div>
        <div className="text-xs text-gray-400 mt-2">
          Debug: adminData={adminData ? 'loaded' : 'null'}, currentAdmin={currentAdmin ? 'loaded' : 'null'}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Task Verification</h2>
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task._id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="font-medium text-lg">{task.taskTitle}</div>
                <div className="text-sm text-gray-600 mt-1">{task.taskDescription}</div>
                <div className="text-xs text-gray-500 mt-2">
                  <span className="font-medium">Employee:</span> {task.employee?.firstName} ({task.employee?.email})
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Due:</span> {task.endDate ? new Date(task.endDate).toLocaleString() : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Category:</span> {task.category}
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-medium">Pending Verification</span>
            </div>

            {Array.isArray(task.submittedDocuments) && task.submittedDocuments.length > 0 && (
              <div className="mt-4 mb-4">
                <div className="text-sm font-medium mb-2">Submitted Documents:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {task.submittedDocuments.map((doc, i) => (
                    <div key={i} className="bg-white p-2 rounded border">
                      <a 
                        href={`http://localhost:5000${doc.filePath || doc.path || ''}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-600 text-sm underline hover:text-blue-800 block truncate"
                      >
                        {doc.originalName || doc.originalname || doc.fileName}
                      </a>
                      <div className="text-xs text-gray-500 mt-1">
                        {(doc.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Note (Optional):
              </label>
              <textarea
                value={verificationNotes[task._id] || ''}
                onChange={(e) => handleVerificationNoteChange(task._id, e.target.value)}
                placeholder="Add any comments or feedback..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="2"
              />
            </div>

            <div className="flex gap-3">
              <button
                disabled={busy === task._id}
                onClick={() => act(task, 'verify')}
                className={`px-4 py-2 text-sm rounded text-white font-medium ${busy === task._id ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {busy === task._id ? 'Verifying...' : '✓ Verify & Complete'}
              </button>
              <button
                disabled={busy === task._id}
                onClick={() => act(task, 'reject')}
                className={`px-4 py-2 text-sm rounded border font-medium ${busy === task._id ? 'bg-gray-100 cursor-not-allowed' : 'bg-white border-red-300 text-red-700 hover:bg-red-50'}`}
              >
                {busy === task._id ? 'Rejecting...' : '✗ Reject & Return'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskVerificationSimple;
