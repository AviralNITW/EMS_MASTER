import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileJson, Database } from 'lucide-react';
import { toast } from 'react-toastify';

const ExportDataView = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = (type) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Data exported as ${type} successfully!`);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Data</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Download system records and reports (Mock UI).</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-2xl text-center">
          <FileSpreadsheet size={48} className="mx-auto text-emerald-500 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Excel Export</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Download all employee records as .xlsx</p>
          <button 
            onClick={() => handleExport('Excel')}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-gray-900 dark:text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Export to Excel
          </button>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-2xl text-center">
          <FileJson size={48} className="mx-auto text-yellow-500 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">JSON Export</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Download raw data format as .json</p>
          <button 
            onClick={() => handleExport('JSON')}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 dark:text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Export to JSON
          </button>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-2xl text-center">
          <Database size={48} className="mx-auto text-blue-500 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">CSV Export</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Download flat table format as .csv</p>
          <button 
            onClick={() => handleExport('CSV')}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-gray-900 dark:text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Export to CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDataView;
