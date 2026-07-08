import React, { useState } from 'react';
import { Database, HardDrive, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const BackupRestoreView = () => {
  const [loading, setLoading] = useState(false);

  const handleBackup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('System backup completed successfully!');
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Backup & Restore</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage system data backups (Mock UI).</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-2xl text-center">
          <HardDrive size={48} className="mx-auto text-primary mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Manual Backup</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Create a snapshot of the current database.</p>
          <button 
            onClick={handleBackup}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-gray-900 dark:text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Backup...' : 'Backup Now'}
          </button>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-2xl text-center">
          <RefreshCw size={48} className="mx-auto text-blue-500 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Restore System</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Restore data from a previous backup file.</p>
          <button className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 px-6 py-2 rounded-xl text-sm font-semibold transition-colors">
            Upload Backup File
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupRestoreView;
