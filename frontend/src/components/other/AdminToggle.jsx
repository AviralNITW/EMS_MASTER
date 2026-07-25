import React from 'react';
import { PlusCircle, UserPlus, FolderKanban } from 'lucide-react';

const AdminToggle = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-4">
      <div className="bg-[#0c1224] border border-white/[0.08] rounded-xl p-1.5 flex gap-2 w-full max-w-lg">
        {[
          { id: 'createTask', label: 'Create Task', icon: PlusCircle },
          { id: 'allTasks', label: 'All Tasks Overview', icon: FolderKanban },
          { id: 'addMember', label: 'Add Member', icon: UserPlus },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary to-brand-purple text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminToggle;
