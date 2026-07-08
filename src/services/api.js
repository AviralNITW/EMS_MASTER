// In src/services/api.js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:5000'; // Defaulting to local backend, or adjust if on Render

const apiRequest = async (endpoint, options = {}) => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint.startsWith('/api') ? '' : '/api'}${normalizedEndpoint}`;
  
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    throw new Error('Unauthorized');
  }

  const contentType = response.headers.get('content-type');
  let data;
  try {
    data = contentType?.includes('application/json') 
      ? await response.json()
      : { message: await response.text() };
  } catch (parseError) {
    throw new Error('Failed to parse server response');
  }

  if (!response.ok) {
    const error = new Error(data.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
};

// Unified Auth API
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  }),
  signup: (userData) => apiRequest('/auth/admin/signup', {
    method: 'POST',
    body: userData,
  }),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  requestOtp: (email) => apiRequest('/auth/request-otp', {
    method: 'POST',
    body: { email },
  }),
  loginOtp: (email, otp) => apiRequest('/auth/login-otp', {
    method: 'POST',
    body: { email, otp },
  }),
};

// Unified Users API
export const userAPI = {
  getAll: () => apiRequest('/users'),
  getById: (id) => apiRequest(`/users/${id}`),
  create: (userData) => apiRequest('/users', {
    method: 'POST',
    body: userData
  }),
  delete: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE'
  }),
};

// Department API
export const departmentAPI = {
  getAll: () => apiRequest('/departments'),
  create: (deptData) => apiRequest('/departments', {
    method: 'POST',
    body: deptData
  })
};

// Unified Tasks API
export const taskAPI = {
  getAll: () => apiRequest('/tasks'),
  create: (taskData) => apiRequest('/tasks', {
    method: 'POST',
    body: taskData
  }),
  updateStatus: (taskId, status) => apiRequest(`/tasks/${taskId}/status`, {
    method: 'PUT',
    body: { status }
  }),
};

// Leaves API
export const leaveAPI = {
  getAll: () => apiRequest('/leaves'),
  create: (leaveData) => apiRequest('/leaves', {
    method: 'POST',
    body: leaveData
  }),
  updateStatus: (leaveId, status, note) => apiRequest(`/leaves/${leaveId}/status`, {
    method: 'PUT',
    body: { status, note }
  }),
};

// Payroll API
export const payrollAPI = {
  getAll: () => apiRequest('/payroll'),
  create: (payrollData) => apiRequest('/payroll', {
    method: 'POST',
    body: payrollData
  }),
  updateStatus: (payrollId, status) => apiRequest(`/payroll/${payrollId}/status`, {
    method: 'PUT',
    body: { status }
  }),
};

// Attendance API
export const attendanceAPI = {
  getAll: () => apiRequest('/attendance'),
  clockIn: () => apiRequest('/attendance/clock-in', {
    method: 'POST'
  }),
  clockOut: () => apiRequest('/attendance/clock-out', {
    method: 'PUT'
  }),
};

// Announcement API
export const announcementAPI = {
  getAll: () => apiRequest('/announcements'),
  create: (data) => apiRequest('/announcements', {
    method: 'POST',
    body: data
  }),
  delete: (id) => apiRequest(`/announcements/${id}`, {
    method: 'DELETE'
  }),
};

// Document API
export const documentAPI = {
  getAll: () => apiRequest('/documents'),
  create: (data) => apiRequest('/documents', {
    method: 'POST',
    body: data
  }),
  delete: (id) => apiRequest(`/documents/${id}`, {
    method: 'DELETE'
  }),
};

// System Config API
export const configAPI = {
  getAll: () => apiRequest('/config'),
  update: (key, value) => apiRequest('/config', {
    method: 'POST',
    body: { key, value }
  }),
};