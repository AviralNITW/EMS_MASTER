// In src/services/api.js
const API_BASE_URL = 'http://localhost:5000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Enhanced API request function with retry logic
const apiRequest = async (endpoint, options = {}, retryCount = 0) => {
  // Normalize endpoint and construct URL
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint.startsWith('/api') ? '' : '/api'}${normalizedEndpoint}`;
  
  // Configure request
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
    credentials: 'include',
  };

  // Automatically attach x-admin-id header for backend auth middleware
  // Pull from localStorage 'user': admin uses _id; employee uses adminId
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Determine adminId in a robust way
      let inferredAdminId = undefined;
      if (user?.userType === 'admin') {
        inferredAdminId = user?._id;
      } else if (user?.userType === 'employee') {
        inferredAdminId = user?.adminId || user?.admin?._id;
      } else {
        // Fallbacks when userType is absent: try adminId, then embedded admin._id, then _id (admin doc stored directly)
        inferredAdminId = user?.adminId || user?.admin?._id || user?._id;
      }
      if (inferredAdminId && !config.headers['x-admin-id']) {
        config.headers['x-admin-id'] = inferredAdminId;
      }
    }
  } catch (e) {
    // Non-fatal: if parsing fails, proceed without the header and let server respond accordingly
    if (process.env.NODE_ENV === 'development') {
      console.warn('[api] Failed to attach x-admin-id header:', e?.message);
    }
  }

  // Optionally attach Authorization header if a token is present (JWT/session token scenarios)
  try {
    const token = localStorage.getItem('token');
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}

  // Handle request body
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      const sentXAdmin = config.headers && (config.headers['x-admin-id'] || config.headers['X-Admin-Id']);
      const hasAuth = !!(config.headers && config.headers['Authorization']);
      console.log('[api] request ->', url, { method: config.method, xAdminId: sentXAdmin, hasAuth });
    }
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized: try to parse and surface server message
    if (response.status === 401) {
      localStorage.removeItem('token');
      let errMessage = 'Unauthorized';
      try {
        const ct = response.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const body = await response.json();
          errMessage = body?.message || errMessage;
        } else {
          const text = await response.text();
          errMessage = text || errMessage;
        }
      } catch {}
      const unauthorizedError = new Error(errMessage);
      unauthorizedError.status = 401;
      throw unauthorizedError;
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    let data;
    
    try {
      data = contentType?.includes('application/json') 
        ? await response.json()
        : { message: await response.text() };
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Failed to parse server response');
    }

    // Handle non-2xx responses
    if (!response.ok) {
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.response = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Retry logic for network errors or 5xx errors
    const shouldRetry = 
      error.name === 'TypeError' || // Network error
      (error.status && error.status >= 500) || // Server error
      error.message.includes('Failed to fetch'); // Network issue

    if (shouldRetry && retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.log(`Retry ${retryCount + 1}/${MAX_RETRIES} for ${url} in ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiRequest(endpoint, options, retryCount + 1);
    }

    console.error('API request failed:', {
      url,
      method: options.method || 'GET',
      error: {
        name: error.name,
        message: error.message,
        status: error.status,
        response: error.response,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
    
    throw error;
  }
};

// Request deduplication and caching
const requestCache = new Map();
const pendingRequests = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Helper function to generate cache keys
const getCacheKey = (endpoint, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  return `${endpoint}?${sortedParams}`;
};

export const adminAPI = {
  // ... existing methods ...

  // Cache for pending verification tasks
  _pendingTasksCache: {
    data: null,
    timestamp: 0,
    cacheDuration: 60000, // 60 seconds cache
    adminId: null
  },
  
  // Clear cache method
  clearCache() {
    this._pendingTasksCache = {
      data: null,
      timestamp: 0,
      cacheDuration: 60000,
      adminId: null
    };
  },

  // Get tasks pending verification with pagination, caching and deduplication
  getPendingVerificationTasks: async (page = 1, limit = 10, adminId = null, forceRefresh = false) => {
    // Skip if no adminId is provided
    if (!adminId) {
      console.warn('[API] No adminId provided for getPendingVerificationTasks');
      return { data: { tasks: [], pagination: { page, limit, total: 0 } } };
    }
    
    const cacheKey = getCacheKey('/admin/tasks/pending-verification', { adminId, page, limit });
    const now = Date.now();
    
    // Check cache first if not forcing refresh
    if (!forceRefresh && requestCache.has(cacheKey)) {
      const { data, timestamp } = requestCache.get(cacheKey);
      if (now - timestamp < CACHE_DURATION) {
        console.log('[API] Returning cached data for', cacheKey);
        return { data };
      }
    }
    
    // Check for pending request
    if (pendingRequests.has(cacheKey)) {
      console.log('[API] Request already in progress for', cacheKey);
      return pendingRequests.get(cacheKey);
    }

    const startTime = now;
    console.log(`[API] [${cacheKey}] Starting API request at ${new Date().toISOString()}`);
    
    // Create a promise that will be stored in the pending requests map
    const requestPromise = (async () => {
      try {
        // Backend route is defined at GET /api/admin/tasks/pending-verification
        // and expects adminId via query parameter. Adjust path accordingly.
        const url = `/admin/tasks/pending-verification?adminId=${encodeURIComponent(adminId)}&page=${page}&limit=${limit}`;
        console.log(`[API] [${cacheKey}] Fetching pending verification tasks`);
        
        const response = await apiRequest(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        });
        
        let responseData;
        // Handle different response formats
        if (Array.isArray(response)) {
          console.log(`[API] [${cacheKey}] Received array of ${response.length} tasks`);
          responseData = { tasks: response, pagination: { page, limit, total: response.length } };
        } else if (response && Array.isArray(response.tasks)) {
          console.log(`[API] [${cacheKey}] Received response with ${response.tasks.length} tasks`);
          responseData = response;
        } else if (response && response.data) {
          responseData = response.data;
        } else {
          console.warn(`[API] [${cacheKey}] Unexpected response format:`, response);
          responseData = { tasks: [], pagination: { page, limit, total: 0 } };
        }
        
        // Cache the successful response
        if (responseData) {
          requestCache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now()
          });
          
          // Update cache with the new data
          adminAPI._pendingTasksCache = {
            data: responseData,
            timestamp: Date.now(),
            cacheDuration: 60000, // 60 seconds
            adminId: adminId
          };
        }
        
        const duration = Date.now() - startTime;
        console.log(`[API] [${cacheKey}] Request completed in ${duration}ms`);
        
        return { data: responseData };
      
      } catch (error) {
        console.error(`[API] [${cacheKey}] Error in getPendingVerificationTasks:`, {
          name: error.name,
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
        
        // Clear cache on error to force refresh next time
        requestCache.delete(cacheKey);
        
        // Create a new error with additional context
        const apiError = new Error(`Failed to fetch pending verification tasks: ${error.message}`);
        apiError.originalError = error;
        throw apiError;
      } finally {
        // Always clean up the pending request
        pendingRequests.delete(cacheKey);
      }
    })();
    
    // Store the promise for deduplication
    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  },
  
  // Verify or reject a task
  verifyTask: (employeeId, taskId, { status, reason = '' }) => {
    console.log(`[API] Verifying task ${taskId} with status:`, status, 'reason:', reason);
    return apiRequest(`/employees/${employeeId}/tasks/${taskId}/verify`, {
      method: 'POST',
      body: { status, reason },
    });
  },

  // Create a task for an employee (embedded under admin)
  addTask: (adminId, employeeId, taskData) => {
    if (!adminId) throw new Error('adminId is required');
    if (!employeeId) throw new Error('employeeId is required');
    // Try to read token explicitly to ensure Authorization header is present
    let authHeader = {};
    try {
      const token = localStorage.getItem('token');
      if (token) authHeader = { Authorization: `Bearer ${token}` };
    } catch {}
    return apiRequest(`/admin/${adminId}/employees/${employeeId}/tasks`, {
      method: 'POST',
      body: taskData,
      headers: {
        'Content-Type': 'application/json',
        // x-admin-id will be auto-attached, but ensure correct one as well
        'x-admin-id': adminId,
        ...authHeader,
      },
    });
  },

  // Admin authentication
  login: (credentials) =>
    apiRequest('/auth/admin/login', {
      method: 'POST',
      body: credentials,
    }),

  signup: (userData) =>
    apiRequest('/auth/admin/signup', {
      method: 'POST',
      body: userData,
    }),

  // Get admin by ID with pagination support and deduped requests
  getById: (id, page = 1, limit = 10, _cacheBuster = '') => {
    const cacheKey = getCacheKey('/admin/getById', { id, page, limit });
    const now = Date.now();
    // short-lived cache (2s) to suppress storms caused by re-renders
    const SHORT_CACHE_MS = 2000;
    if (requestCache.has(cacheKey)) {
      const { data, timestamp } = requestCache.get(cacheKey);
      if (now - timestamp < SHORT_CACHE_MS) {
        return Promise.resolve(data);
      }
    }
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }

    const url = new URL(`/api/admin/${id}`, window.location.origin);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);

    const promise = apiRequest(url.pathname + url.search, {
      method: 'GET',
      headers: {
        'x-page': page,
        'x-limit': limit,
        'x-admin-id': id,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }).then((resp) => {
      requestCache.set(cacheKey, { data: resp, timestamp: Date.now() });
      return resp;
    }).finally(() => {
      pendingRequests.delete(cacheKey);
    });

    pendingRequests.set(cacheKey, promise);
    return promise;
  },
};

// Employee API
export const employeeAPI = {
  // Get a single employee by ID
  getById: (employeeId) =>
    apiRequest(`/employees/${employeeId}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    }).then((resp) => ({ data: resp })),
  // Update task
  updateTask: (employeeId, taskId, taskData) =>
    apiRequest(`/employees/${employeeId}/tasks/${taskId}`, {
      method: 'PUT',
      body: taskData,
    }),

  // Upload document for a task with progress reporting
  uploadDocument: (employeeId, taskId, formData, onProgress) => new Promise(async (resolve, reject) => {
    try {
      const url = `${API_BASE_URL}/api/employees/${employeeId}/tasks/${taskId}/documents`;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      // Attach auth/admin headers similar to apiRequest
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const inferredAdminId = user?.adminId || user?.admin?._id || user?._id;
          if (inferredAdminId) xhr.setRequestHeader('x-admin-id', inferredAdminId);
        }
        const token = localStorage.getItem('token');
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      } catch {}

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && typeof onProgress === 'function') {
          const percent = Math.round((event.loaded / event.total) * 100);
          try { onProgress(percent); } catch {}
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({}); }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err?.message || 'Upload failed'));
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    } catch (e) {
      reject(e);
    }
  }),

  // Get task by ID
  getTask: (employeeId, taskId) =>
    apiRequest(`/employees/${employeeId}/tasks/${taskId}`),

    // Update task state
  updateTaskState: (employeeId, taskId, status) =>
    apiRequest(`/employees/${employeeId}/tasks/${taskId}/state`, {
      method: 'PUT',
      body: { status },
    }),
    
  // Check and update expired tasks
  checkExpiredTasks: () =>
    apiRequest('/tasks/check-expired', {
      method: 'POST',
    }),
};

// Authentication API
export const authAPI = {
  // Employee login
  employeeLogin: (credentials) => apiRequest('/auth/employee/login', {
    method: 'POST',
    body: credentials,
  }),

  // Admin login
  adminLogin: (credentials) => apiRequest('/auth/admin/login', {
    method: 'POST',
    body: credentials,
  }),

  // Admin signup
  adminSignup: (userData) => apiRequest('/auth/admin/signup', {
    method: 'POST',
    body: userData,
  }),

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
};

// Health check
export const healthCheck = () => apiRequest('/health');