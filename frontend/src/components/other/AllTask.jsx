import React from 'react';
import PropTypes from 'prop-types';

const AllTask = ({ employees = [] }) => {
  if (!employees || !Array.isArray(employees) || employees.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        No employees found. Add employees to begin tracking task statistics.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0c1224]/50">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              <th className="p-4 font-heading font-bold text-gray-400">Employee</th>
              <th className="p-4 text-center font-heading font-bold text-blue-400">New</th>
              <th className="p-4 text-center font-heading font-bold text-yellow-400">Active</th>
              <th className="p-4 text-center font-heading font-bold text-purple-400">Pending</th>
              <th className="p-4 text-center font-heading font-bold text-emerald-400">Done</th>
              <th className="p-4 text-center font-heading font-bold text-rose-400">Failed</th>
              <th className="p-4 text-center font-heading font-bold text-white">Total</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, idx) => {
              const taskCounts = employee.taskCounts || {
                newTask: 0,
                active: 0,
                pendingVerification: 0,
                completed: 0,
                failed: 0,
              };

              const totalTasks =
                taskCounts.newTask +
                taskCounts.active +
                (taskCounts.pendingVerification || 0) +
                taskCounts.completed +
                taskCounts.failed;

              return (
                <tr
                  key={employee._id || idx}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4 flex flex-col">
                    <span className="font-semibold text-white">{employee.firstName || 'Unknown'}</span>
                    <span className="text-[10px] text-gray-500 mt-0.5">{employee.email}</span>
                  </td>
                  <td className="p-4 text-center font-bold text-blue-400">{taskCounts.newTask}</td>
                  <td className="p-4 text-center font-bold text-yellow-400">{taskCounts.active}</td>
                  <td className="p-4 text-center font-bold text-purple-400">
                    {taskCounts.pendingVerification || 0}
                  </td>
                  <td className="p-4 text-center font-bold text-emerald-400">{taskCounts.completed}</td>
                  <td className="p-4 text-center font-bold text-rose-400">{taskCounts.failed}</td>
                  <td className="p-4 text-center font-bold text-white">{totalTasks}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-2 gap-4 p-5 rounded-xl border border-white/[0.08] bg-[#0c1224]/30">
        <div>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block mb-0.5">
            Total Employees
          </span>
          <span className="text-xl font-heading font-bold text-white">{employees.length}</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block mb-0.5">
            Total System Tasks
          </span>
          <span className="text-xl font-heading font-bold text-white">
            {employees.reduce((total, emp) => {
              const counts = emp.taskCounts || {
                newTask: 0,
                active: 0,
                pendingVerification: 0,
                completed: 0,
                failed: 0,
              };
              return (
                total +
                counts.newTask +
                counts.active +
                (counts.pendingVerification || 0) +
                counts.completed +
                counts.failed
              );
            }, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

AllTask.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string,
      email: PropTypes.string.isRequired,
      tasks: PropTypes.array,
      taskCounts: PropTypes.shape({
        newTask: PropTypes.number,
        active: PropTypes.number,
        completed: PropTypes.number,
        failed: PropTypes.number,
      }),
    })
  ),
  onDataUpdate: PropTypes.func,
};

export default AllTask;