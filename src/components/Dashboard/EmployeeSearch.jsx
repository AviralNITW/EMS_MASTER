import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';
import { adminAPI } from '../../services/api';

const EmployeeSearch = () => {
  const { currentAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const searchRef = useRef(null);
  const popupRef = useRef(null);
  
  // Get the current admin ID if available
  const currentAdminId = currentAdmin?._id;

  // Debug log to check currentAdmin
  useEffect(() => {
    console.log('Current Admin:', currentAdmin);
    if (currentAdmin?.employees) {
      console.log('Number of employees:', currentAdmin.employees.length);
      console.log('Employee names:', currentAdmin.employees.map(e => e.name || 'Unnamed'));
    }
  }, [currentAdmin]);

  // Fetch employees based on search term
  useEffect(() => {
    const searchEmployees = () => {
      const trimmedTerm = searchTerm.trim().toLowerCase();
      
      if (trimmedTerm === '') {
        setSearchResults([]);
        return;
      }

      // Check if we have an admin with employees
      if (!currentAdmin?.employees?.length) {
        console.warn('No employees found for the current admin');
        setSearchResults([]);
        return;
      }

      console.log('Searching for:', trimmedTerm);
      console.log('Available employees:', currentAdmin.employees);
      
      setIsLoading(true);
      try {
        // Use the already loaded employees from the currentAdmin
        const employees = currentAdmin.employees || [];
        
        const filtered = employees.filter(emp => {
          // Handle different possible property names
          const name = emp?.name || emp?.firstName || '';
          const email = emp?.email || '';
          
          return (
            (name && name.toLowerCase().includes(trimmedTerm)) ||
            (email && email.toLowerCase().includes(trimmedTerm))
          );
        });
        
        console.log('Search results:', filtered);
        setSearchResults(filtered);
      } catch (error) {
        console.error('Error searching employees:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchEmployees, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, currentAdmin]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) &&
          searchRef.current && !searchRef.current.contains(event.target)) {
        setShowPopup(false);
        setSearchTerm('');
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setShowPopup(true);
    setSearchTerm('');
    setSearchResults([]);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedEmployee(null);
  };

  const updateTaskVerification = async (task, status, note = '') => {
    if (!selectedEmployee || !task) return;
    
    try {
      // Find the admin that contains this employee
      const adminId = currentAdmin?._id;
      if (!adminId) {
        console.error('No admin ID found');
        return;
      }

      // Find the employee in the current admin's employees array
      const employee = currentAdmin.employees.find(emp => 
        emp._id === selectedEmployee._id
      );
      
      if (!employee) {
        console.error('Employee not found in admin');
        return;
      }

      // Find the task in the employee's tasks array
      const taskIndex = employee.tasks.findIndex(t => t._id === task._id);
      if (taskIndex === -1) {
        console.error('Task not found in employee tasks');
        return;
      }

      // Update the task with verification status
      const updatedTasks = [...employee.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        verificationStatus: status,
        verificationNote: note,
        verificationDate: new Date(),
        // If verified, mark as completed, otherwise keep as active
        completed: status === 'verified',
        active: status !== 'verified'
      };

      // Update the employee's tasks
      const updatedEmployees = currentAdmin.employees.map(emp => 
        emp._id === selectedEmployee._id 
          ? { ...emp, tasks: updatedTasks }
          : emp
      );

      // Update the admin in the database
      const response = await adminAPI.update(adminId, { employees: updatedEmployees });
      
      if (response.success) {
        // Update the local state to reflect the changes
        setSelectedEmployee({
          ...selectedEmployee,
          tasks: updatedTasks
        });
      } else {
        console.error('Failed to update task verification status');
      }
    } catch (error) {
      console.error('Error updating task verification:', error);
    }
  };

  const handleVerifyTask = (task) => {
    const note = prompt('Add an optional note for the employee:');
    updateTaskVerification(task, 'verified', note || '');
  };

  const handleRejectTask = (task) => {
    const note = prompt('Please provide feedback for the employee:');
    if (note !== null) {  // Only proceed if user didn't cancel
      updateTaskVerification(task, 'rejected', note);
    }
  };

  return (
    <div className="relative w-full">
      <div ref={searchRef} className="relative w-64">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search employees..."
          className="w-full p-3 bg-black text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
            {searchResults.map((employee) => (
              <div
                key={employee._id}
                onClick={() => handleEmployeeSelect(employee)}
                className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                <div className="font-medium">{employee.name}</div>
                <div className="text-sm text-gray-500">{employee.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPopup && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={popupRef}
            className="bg-white rounded-lg w-96 max-w-full max-h-[90vh] overflow-y-auto relative"
          >
            <button
              onClick={closePopup}
              className="absolute right-2 top-2 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                  {selectedEmployee?.name ? selectedEmployee.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedEmployee?.name || 'No Name'}</h2>
                  <p className="text-gray-600">{selectedEmployee?.email || 'No email'}</p>
                  {selectedEmployee?.position && (
                    <p className="text-sm text-gray-500">{selectedEmployee.position}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Uploaded Documents</h3>
                {selectedEmployee?.tasks?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedEmployee.tasks.map((task, index) => {
                      const hasDocuments = task.documents && task.documents.length > 0;
                      const isVerified = task.verificationStatus === 'verified';
                      const isRejected = task.verificationStatus === 'rejected';
                      
                      return hasDocuments ? (
                        <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {task.taskTitle || `Task ${index + 1}`}
                                {isVerified && (
                                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    Verified
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                    Needs Revision
                                  </span>
                                )}
                                {!isVerified && !isRejected && (
                                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                    Pending Review
                                  </span>
                                )}
                              </h4>
                              {task.taskDescription && (
                                <p className="text-sm text-gray-600 mt-1">{task.taskDescription}</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <a 
                                href={task.documents[0]?.path} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors px-2 py-1 border border-blue-200 rounded"
                              >
                                View Document
                              </a>
                            </div>
                          </div>
                          
                          {task.verificationNote && (
                            <div className={`p-2 text-sm rounded mt-2 ${isRejected ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                              <span className="font-medium">Note:</span> {task.verificationNote}
                            </div>
                          )}
                          
                          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-2">
                            {!isVerified && (
                              <button 
                                onClick={() => handleVerifyTask(task, 'verified')}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {!isRejected && (
                              <button 
                                onClick={() => handleRejectTask(task, 'rejected')}
                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-500 text-sm text-center">No documents uploaded yet.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold mb-2">Task Statistics</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">Total Tasks</div>
                    <div className="font-bold">
                      {selectedEmployee.tasks ? selectedEmployee.tasks.length : 0}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">Completed</div>
                    <div className="font-bold text-green-600">
                      {selectedEmployee.tasks ? 
                        selectedEmployee.tasks.filter(t => t.status === 'completed').length : 0
                      }
                    </div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">Pending</div>
                    <div className="font-bold text-yellow-600">
                      {selectedEmployee.tasks ? 
                        selectedEmployee.tasks.filter(t => t.status !== 'completed').length : 0
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSearch;
