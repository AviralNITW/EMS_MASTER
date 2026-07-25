import React from 'react';
import { Shield, Check, X } from 'lucide-react';

const RolesPermissionsView = () => {
  const roles = [
    { name: 'Admin', desc: 'Full system access', users: 1 },
    { name: 'HR', desc: 'Manage employees, payroll, and departments', users: 3 },
    { name: 'Manager', desc: 'Manage specific department and team tasks', users: 5 },
    { name: 'Employee', desc: 'Standard access for personal tasks and attendance', users: 45 }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage system-wide role boundaries (Read-Only Mock).</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r, i) => (
          <div key={i} className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{r.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.users} Users</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{r.desc}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><Check size={14} className="text-emerald-500" /> View Dashboard</div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><Check size={14} className="text-emerald-500" /> Modify Own Settings</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesPermissionsView;
