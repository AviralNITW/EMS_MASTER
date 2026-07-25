import React from 'react';
import { SlidersHorizontal, Save } from 'lucide-react';

const SystemConfigView = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Configuration</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage deep system settings (Mock UI).</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-gray-900 dark:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Save size={16} /> Save Changes
        </button>
      </div>
      <div className="flex-1 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-2xl flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Company Information</h3>
          <input type="text" defaultValue="EMS Master Inc." className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Default Currency</h3>
          <select className="w-full bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white">
            <option>USD ($)</option>
            <option>EUR (€)</option>
            <option>GBP (£)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigView;
