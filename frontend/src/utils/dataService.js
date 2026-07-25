import { employeeAPI, adminAPI, authAPI } from '../services/api.js';

// Legacy functions removed - use dataService instead
// These functions are no longer needed as data is now stored in the database

// New functions for specific operations
export const dataService = {
  // Employee operations
  employees: {
    getAll: () => employeeAPI.getAll(),
    getById: (id) => employeeAPI.getById(id),
    create: (employeeData) => employeeAPI.create(employeeData),
    update: (id, employeeData) => employeeAPI.update(id, employeeData),
    delete: (id) => employeeAPI.delete(id),
    addTask: (employeeId, taskData) => employeeAPI.addTask(employeeId, taskData),
    updateTask: (employeeId, taskId, taskData) => employeeAPI.updateTask(employeeId, taskId, taskData),
    deleteTask: (employeeId, taskId) => employeeAPI.deleteTask(employeeId, taskId),
  },

  // Admin operations
  admin: {
    getAll: () => adminAPI.getAll(),
    getById: (id) => adminAPI.getById(id),
    create: (adminData) => adminAPI.create(adminData),
    update: (id, adminData) => adminAPI.update(id, adminData),
    delete: (id) => adminAPI.delete(id),
    login: (credentials) => adminAPI.login(credentials),
  },

  // Authentication
  auth: {
    employeeLogin: (credentials) => authAPI.employeeLogin(credentials),
    adminLogin: (credentials) => authAPI.adminLogin(credentials),
  },
};

export default dataService;
