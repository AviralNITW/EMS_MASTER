import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import DataGrid from '../UI/DataGrid';
import SkeletonLoader from '../UI/SkeletonLoader';
import { attendanceAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AttendanceView = ({ users, role }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await attendanceAPI.getAll();
      
      const formatted = data.map(record => ({
        _id: record._id,
        employee: record.employee,
        date: new Date(record.date).toLocaleDateString(),
        clockIn: record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--',
        clockOut: record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--',
        status: record.status,
        workingHours: record.totalHours > 0 ? `${record.totalHours} hrs` : '--'
      }));
      
      setAttendance(formatted);
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleClockIn = async () => {
    try {
      setLoading(true);
      await attendanceAPI.clockIn();
      toast.success('Successfully clocked in!');
      fetchAttendance();
    } catch (error) {
      toast.error(error.message || 'Failed to clock in');
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setLoading(true);
      await attendanceAPI.clockOut();
      toast.success('Successfully clocked out!');
      fetchAttendance();
    } catch (error) {
      toast.error(error.message || 'Failed to clock out');
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0">
            {row.employee.firstName?.charAt(0)}{row.employee.lastName?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{row.employee.firstName} {row.employee.lastName}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
          <Calendar size={14} /> {row.date}
        </div>
      )
    },
    {
      header: 'Clock In',
      accessor: 'clockIn',
      render: (row) => <span className="text-gray-700 dark:text-gray-300 font-medium">{row.clockIn}</span>
    },
    {
      header: 'Clock Out',
      accessor: 'clockOut',
      render: (row) => <span className="text-gray-700 dark:text-gray-300 font-medium">{row.clockOut}</span>
    },
    {
      header: 'Working Hours',
      accessor: 'workingHours',
      render: (row) => <span className="text-gray-500 dark:text-gray-400 text-xs">{row.workingHours}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 w-max ${row.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
          {row.status === 'Present' ? <CheckCircle size={10} /> : <XCircle size={10} />}
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Records</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monitor employee daily attendance and working hours.</p>
        </div>
        
        {(role === 'Employee' || role === 'Manager') && (
          <div className="flex gap-3">
            <button 
              onClick={handleClockIn}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              <Clock size={16} /> Clock In
            </button>
            <button 
              onClick={handleClockOut}
              disabled={loading}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50"
            >
              <XCircle size={16} /> Clock Out
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-2xl flex flex-col">
        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : (
          <DataGrid 
            columns={columns} 
            data={attendance}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceView;
