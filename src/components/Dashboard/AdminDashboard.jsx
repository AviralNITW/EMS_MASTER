import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthProvider';
import AdminToggle from '../other/AdminToggle';
import CreateTask from '../other/CreateTask';
import AddMember from '../other/AddMember';
import TaskVerificationSimple from './TaskVerificationSimple';
import AllTask from '../other/AllTask';
import Header from '../other/Header';
import EmployeeSearch from './EmployeeSearch';

// Memoized components
const MemoizedHeader = React.memo(Header);
const MemoizedEmployeeSearch = React.memo(EmployeeSearch);
const MemoizedAdminToggle = React.memo(AdminToggle);
const MemoizedCreateTask = React.memo(CreateTask);
const MemoizedAddMember = React.memo(AddMember);
const MemoizedTaskVerification = React.memo(TaskVerificationSimple);
const MemoizedAllTask = React.memo(AllTask);

// Constants
const POLLING_INTERVAL = 60000; // 60 seconds
const MIN_FETCH_INTERVAL = 5000; // 5 seconds

const AdminDashboard = (props) => {
  const [activeTab, setActiveTab] = useState('createTask');
  const [adminData, setAdminData] = useState({ employees: [] });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEmployees: 0,
    employeesPerPage: 10
  });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const { currentAdmin, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Refs for tracking
  const lastFetchTime = useRef(0);
  const isMounted = useRef(true);
  const fetchTimeout = useRef(null);
  const prevAdminData = useRef(null);
  const isFetchingRef = useRef(false);
  const initialLoadDone = useRef(false);
  const didFetchOnce = useRef(false);

  // Derive stable adminId to minimize effect churn
  const adminId = useMemo(() => {
    // Priority:
    // 1) currentAdmin._id (if context already populated)
    // 2) If currentUser is employee -> use their adminId/admin._id
    // 3) Otherwise fallback to currentUser._id
    if (currentAdmin && currentAdmin._id) return currentAdmin._id;
    if (currentUser && (currentUser.userType === 'employee' || currentUser.role === 'employee')) {
      return currentUser.adminId || currentUser.admin?._id || null;
    }
    return (currentUser && currentUser._id) || null;
  }, [currentAdmin?._id, currentUser?._id, currentUser?.adminId, currentUser?.admin?._id, currentUser?.userType, currentUser?.role]);
  
  // Debug current user and admin (in development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Current User:', currentUser);
      console.log('Current Admin:', currentAdmin);
      console.log('Derived adminId:', adminId);
    }
  }, [adminId]);

  // Handle page change with debounce
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  }, [pagination.totalPages]);

  // Fetch admin data with proper cleanup and optimizations
  const fetchAdminData = useCallback(async (isPolling = false) => {
    if (isFetchingRef.current && !isPolling) return; // hard guard
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    
    // Skip if we've fetched recently and this isn't a polling request
    if (!isPolling && (isFetchingRef.current || timeSinceLastFetch < MIN_FETCH_INTERVAL)) {
      return;
    }
    
    lastFetchTime.current = now;
    
    // Skip if already loading
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    if (isPolling) {
      setIsSyncing(true);
    } else if (!adminData) {
      // Only show full loader if no data yet
      setLoading(true);
    }
    setError(null);
    
    try {
      // Validate admin ID
      if (!adminId) {
        throw new Error('No admin user found. Please log out and log in again.');
      }
      // If no token present, use context fallback and skip protected fetch
      const hasToken = !!localStorage.getItem('token');
      if (!hasToken) {
        if (currentAdmin) {
          const { employees = [], ...rest } = currentAdmin;
          setAdminData(prev => {
            // Avoid unnecessary state updates
          const next = { ...rest, employees: Array.isArray(employees) ? employees : [] };
            return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
          });
          return; // Skip network
        } else {
          throw new Error('Not authorized, no token');
        }
      }
      
      const { currentPage, employeesPerPage } = pagination;
      const cacheBuster = Math.floor(now / 5000); // Changes every 5 seconds
      
      const data = await adminAPI.getById(
        adminId, 
        currentPage, 
        employeesPerPage,
        cacheBuster
      );
      
      if (!isMounted.current) return;
      
      if (!data) {
        throw new Error('No admin data returned from server');
      }
      
      console.log('Raw API response:', data);
      console.log('API response employees:', data.employees);
      if (data.employees && data.employees.length > 0) {
        console.log('First employee from API:', data.employees[0]);
        console.log('First employee tasks:', data.employees[0].tasks);
      }
      
      const { pagination: serverPagination, ...adminData } = data;
      if (!Array.isArray(adminData.employees)) adminData.employees = [];
      
      // Only update state if data has actually changed
      if (JSON.stringify(prevAdminData.current) !== JSON.stringify(adminData)) {
        setAdminData(adminData);
        prevAdminData.current = adminData;
      }
      
      if (serverPagination) {
        setPagination(prev => {
          const next = {
            ...prev,
            totalPages: serverPagination.totalPages || 1,
            totalEmployees: serverPagination.totalEmployees || 0,
            employeesPerPage: serverPagination.employeesPerPage || 10
          };
          return (prev.totalPages === next.totalPages && prev.totalEmployees === next.totalEmployees && prev.employeesPerPage === next.employeesPerPage)
            ? prev
            : next;
        });
      }
      
    } catch (err) {
      console.error('Error in fetchAdminData:', err);
      if (isMounted.current) {
        // Fallback to context admin if available to keep UI usable
        if (currentAdmin && Array.isArray(currentAdmin.employees)) {
          const { employees = [], ...rest } = currentAdmin;
          setAdminData(prev => {
            const next = { ...rest, employees: Array.isArray(employees) ? employees : [] };
            return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
          });
          setError(null);
        } else {
          setError(`Failed to load admin data: ${err.message}`);
        }
      }
    } finally {
      if (isMounted.current) {
        if (isPolling) {
          setIsSyncing(false);
        } else {
          setLoading(false);
        }
      }
      isFetchingRef.current = false;
    }
  }, [adminId, pagination.currentPage, pagination.employeesPerPage]);

  // Effect for initial data load and cleanup
  useEffect(() => {
    isMounted.current = true;
    
    // Initial data load
    const loadInitialData = async () => {
      if (!adminId) return; // Wait until adminId is available
      if (isMounted.current) {
        if (didFetchOnce.current) return; // guard duplicate fetches (StrictMode)
        didFetchOnce.current = true;
        // If no token but context has data, prefill immediately to avoid 401 error flashes
        const hasToken = !!localStorage.getItem('token');
        if (!hasToken && currentAdmin && Array.isArray(currentAdmin.employees)) {
          const { employees = [], ...rest } = currentAdmin;
          setAdminData({ ...rest, employees });
          setLoading(false);
          return; // Skip network
        }
        // defer one tick to allow other mounts to settle; reduces cascading re-fetch
        setTimeout(() => fetchAdminData().catch(()=>{}), 0);
      }
    };
    
    loadInitialData();
    
    // Automatic polling disabled: use manual refresh instead
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      // no intervals or listeners to clear
      
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }
    };
  }, [fetchAdminData, adminId]);

  // Memoize tab change handler
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Memoize data update handler
  const handleDataUpdate = useCallback(() => {
    fetchAdminData().catch(console.error);
  }, [fetchAdminData]);
  
  // Memoize the active tab content to prevent unnecessary re-renders
  const activeTabContent = useMemo(() => {
    switch (activeTab) {
      case 'addMember':
        return <MemoizedAddMember onMemberAdded={handleDataUpdate} />;
      case 'allTasks':
        // Rendered by the dedicated overview panel below to avoid duplicate mounts
        return null;
      case 'createTask':
      default:
        return <MemoizedCreateTask onTaskCreated={handleDataUpdate} employees={adminData?.employees || []} />;
    }
  }, [activeTab, adminData?.employees, handleDataUpdate]);

  return (
    <div className='h-screen w-full p-7'>
      {/* Main content */}
      <div className="mb-6">
        <MemoizedHeader changeUser={props.changeUser} />
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <MemoizedEmployeeSearch />
      </div>

      {/* Toggle between different admin functions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <MemoizedAdminToggle activeTab={activeTab} onTabChange={handleTabChange} />
        
        {/* Show the active tab content */}
        <div className="mt-4">
          {activeTabContent}
        </div>
      </div>

      {/* Verification Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {console.log('AdminDashboard - Passing adminData to TaskVerification:', adminData)}
        <h2 className="text-xl font-semibold mb-4">Task Verification</h2>
        {(!adminData || !Array.isArray(adminData.employees) || adminData.employees.length === 0) ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-gray-600">No employees found for this admin.</div>
            <div className="text-gray-400 text-sm mt-1">Add employees to start assigning tasks and verifying submissions.</div>
          </div>
        ) : (
          <MemoizedTaskVerification adminData={adminData} onDataUpdate={handleDataUpdate} />
        )}
      </div>
      
      {/* All Tasks Overview (render only when All Tasks tab is active) */}
      {activeTab === 'allTasks' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">All Tasks Overview</h2>
            <button
              onClick={() => fetchAdminData(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
          {isSyncing && (
            <div className="text-sm text-gray-500 mb-2">Syncing latest data...</div>
          )}
          {(!adminData || !Array.isArray(adminData.employees) || adminData.employees.length === 0) ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
              <p>No employees found. Add some employees to see their tasks.</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <button 
                onClick={fetchAdminData}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
              >
                <span className="sr-only">Retry</span>
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M14.66 15.66A8 8 0 1 1 17 10h-2a6 6 0 1 0-1.76 4.24l1.42 1.42zM12 10h8l-4 4-4-4z"/>
                </svg>
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-4">
              <p>Loading task data...</p>
            </div>
          ) : adminData?.employees?.length > 0 ? (
            <MemoizedAllTask employees={adminData.employees} onDataUpdate={handleDataUpdate} />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;