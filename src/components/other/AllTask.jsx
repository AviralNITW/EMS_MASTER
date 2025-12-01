import React from 'react';
import PropTypes from 'prop-types';

const AllTask = ({ employees = [], onDataUpdate }) => {
   // Check if employee data exists
   if (!employees || !Array.isArray(employees) || employees.length === 0) {
     return (
       <div className='bg-[#1c1c1c] p-5 rounded mt-5'>
         <div className='text-white text-center py-4'>
           No employees found for this admin. Add some employees first!
         </div>
       </div>
     )
   }

   return (
    <div className='bg-[#1c1c1c] p-5 rounded mt-5'>
        <div className='mb-4'>
          <h1 className='text-white text-2xl font-bold mb-2'>All Tasks Overview</h1>
          <p className='text-gray-400'>Task distribution across all employees</p>
        </div>
        
        <div className='bg-red-400 mb-2 py-2 px-4 flex justify-between rounded'>
            <h2 className='text-lg font-medium w-1/6 text-white'>Employee Name</h2>
            <h3 className='text-lg font-medium w-1/6 text-white'>New Tasks</h3>
            <h5 className='text-lg font-medium w-1/6 text-white'>Active</h5>
            <h5 className='text-lg font-medium w-1/6 text-white'>Pending Verify</h5>
            <h5 className='text-lg font-medium w-1/6 text-white'>Completed</h5>
            <h5 className='text-lg font-medium w-1/6 text-white'>Failed</h5>
        </div>
        
        <div className='space-y-2'>
        {employees.map(function(employee, idx){
            
            // Get task counts with fallback values
            const taskCounts = employee.taskCounts || {
              newTask: 0,
              active: 0,
              pendingVerification: 0,
              completed: 0,
              failed: 0
            }
            
            // Calculate total tasks
            const totalTasks = taskCounts.newTask + taskCounts.active + 
                             taskCounts.pendingVerification + taskCounts.completed + 
                             taskCounts.failed
            
            return (
              <div key={employee._id || idx} className='border-2 border-emerald-500 py-3 px-4 flex justify-between rounded hover:bg-gray-800 transition-colors'>
                <div className='w-1/6'>
                  <h2 className='text-lg font-medium text-white'>{employee.firstName || 'Unknown'}</h2>
                  <p className='text-sm text-gray-400'>{employee.email}</p>
                </div>
                <div className='w-1/6 text-center'>
                  <h3 className='text-lg font-medium text-blue-400'>{taskCounts.newTask}</h3>
                  <p className='text-xs text-gray-400'>New</p>
                </div>
                <div className='w-1/6 text-center'>
                  <h5 className='text-lg font-medium text-yellow-400'>{taskCounts.active}</h5>
                  <p className='text-xs text-gray-400'>Active</p>
                </div>
                <div className='w-1/6 text-center'>
                  <h5 className='text-lg font-medium text-purple-400'>{taskCounts.pendingVerification || 0}</h5>
                  <p className='text-xs text-gray-400'>Pending Verify</p>
                </div>
                <div className='w-1/6 text-center'>
                  <h5 className='text-lg font-medium text-green-400'>{taskCounts.completed}</h5>
                  <p className='text-xs text-gray-400'>Done</p>
                </div>
                <div className='w-1/6 text-center'>
                  <h5 className='text-lg font-medium text-red-400'>{taskCounts.failed}</h5>
                  <p className='text-xs text-gray-400'>Failed</p>
                </div>
              </div>
            )
        })}
        </div>
        
        {/* Summary */}
        <div className='mt-6 bg-gray-800 p-4 rounded'>
          <h3 className='text-white text-lg font-medium mb-2'>Summary</h3>
          <p className='text-gray-300'>
            Total Employees: <span className='text-emerald-400 font-medium'>{employees.length}</span>
          </p>
          <p className='text-gray-300'>
            Total Tasks: <span className='text-emerald-400 font-medium'>
              {employees.reduce((total, emp) => {
                const counts = emp.taskCounts || { newTask: 0, active: 0, pendingVerification: 0, completed: 0, failed: 0 }
                return total + counts.newTask + counts.active + (counts.pendingVerification || 0) + counts.completed + counts.failed
              }, 0)}
            </span>
          </p>
        </div>
    </div>
  )
}

AllTask.propTypes = {
  employees: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string,
    email: PropTypes.string.isRequired,
    tasks: PropTypes.array,
    taskCounts: PropTypes.shape({
      newTask: PropTypes.number,
      active: PropTypes.number,
      completed: PropTypes.number,
      failed: PropTypes.number
    })
  })),
  onDataUpdate: PropTypes.func
};

AllTask.defaultProps = {
  employees: [],
  onDataUpdate: () => {}
};

export default AllTask