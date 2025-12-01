import React, { useState } from 'react'

const AdminToggle = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex justify-center mb-6">
            <div className="bg-gray-600 rounded-full p-1 flex">
                <button
                    onClick={() => onTabChange('createTask')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeTab === 'createTask'
                            ? 'bg-white text-gray-800 shadow-md'
                            : 'text-gray-300 hover:text-white'
                    }`}
                >
                    Create Task
                </button>
                <button
                    onClick={() => onTabChange('addMember')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeTab === 'addMember'
                            ? 'bg-white text-gray-800 shadow-md'
                            : 'text-gray-300 hover:text-white'
                    }`}
                >
                    Add Member
                </button>
            </div>
        </div>
    )
}

export default AdminToggle
