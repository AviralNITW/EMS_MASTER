import React from 'react';
import { FileClock } from 'lucide-react';
import DataGrid from '../UI/DataGrid';

const AuditLogsView = () => {
  const logs = [
    { id: 1, action: 'User Created', user: 'Admin', details: 'Created HR user John Doe', time: '10 mins ago' },
    { id: 2, action: 'Department Created', user: 'Admin', details: 'Created Engineering dept', time: '1 hour ago' },
    { id: 3, action: 'Payroll Verified', user: 'Admin', details: 'Verified June payroll batch', time: '2 hours ago' },
    { id: 4, action: 'System Backup', user: 'System', details: 'Automated daily backup', time: '12 hours ago' }
  ];

  const columns = [
    { header: 'Action', accessor: 'action', render: row => <span className="font-semibold text-gray-900 dark:text-white">{row.action}</span> },
    { header: 'Performed By', accessor: 'user', render: row => <span className="text-gray-700 dark:text-gray-300">{row.user}</span> },
    { header: 'Details', accessor: 'details', render: row => <span className="text-gray-500 dark:text-gray-400 text-sm">{row.details}</span> },
    { header: 'Time', accessor: 'time', render: row => <span className="text-xs text-gray-500">{row.time}</span> }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audit Logs</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">System-wide activity logs (Read-Only Mock).</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <FileClock size={16} /> Export Logs
        </button>
      </div>
      <div className="flex-1 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-2xl flex flex-col">
        <DataGrid columns={columns} data={logs} />
      </div>
    </div>
  );
};

export default AuditLogsView;
