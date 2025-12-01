import React, { useContext, useState, useEffect, useRef } from 'react'
import { AuthContext } from '../../context/AuthProvider'
import { adminAPI /*, employeeAPI*/ } from '../../services/api'

const CreateTask = ({ employees: employeesProp = [], onTaskCreated }) => {

    const { userData, refreshEmployees, currentUser /*, currentAdmin*/ } = useContext(AuthContext)

    const [taskTitle, setTaskTitle] = useState('')
    const [taskDescription, setTaskDescription] = useState('')
    const [taskDate, setTaskDate] = useState('') 
    const [endDate, setEndDate] = useState('')
    const [asignTo, setAsignTo] = useState('')
    const [category, setCategory] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [hasToken, setHasToken] = useState(() => !!localStorage.getItem('token'))

    // Unused state: commenting out to avoid confusion and potential bugs
    // const [newTask, setNewTask] = useState({})
    const triedRefreshOnFocus = useRef(false)

    // Debug: Log the raw userData to see what we're working with
    useEffect(() => {
        console.log('Current userData:', userData);
    }, [userData]);

    // Prefer employees passed from AdminDashboard; fallback to context if needed
    const employees = React.useMemo(() => {
        const source = Array.isArray(employeesProp) && employeesProp.length > 0
          ? employeesProp
          : (Array.isArray(userData) ? userData : []);
        const validEmployees = source.filter(emp => emp && emp.email); // only require email
        if (process.env.NODE_ENV === 'development') {
            console.log('[CreateTask] employees source:', Array.isArray(employeesProp) && employeesProp.length > 0 ? 'props' : 'context');
            console.log('[CreateTask] employees count:', validEmployees.length);
            console.log('[CreateTask] sample employee:', validEmployees[0]);
        }
        return validEmployees;
    }, [employeesProp, userData]);

    // Ensure employees are loaded for current admin on mount if empty
    useEffect(() => {
        const loadIfEmpty = async () => {
            if (employees.length === 0 && typeof refreshEmployees === 'function') {
                try {
                    await refreshEmployees()
                } catch (e) {
                    console.warn('[CreateTask] Failed to refresh employees on mount', e)
                }
            }
        }
        loadIfEmpty()
        // We intentionally do NOT include `employees` as a dependency to avoid loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshEmployees])

    // Set default assign date to today (no user input needed)
    useEffect(() => {
        const now = new Date();
        // Store ISO string for consistency
        setTaskDate(now.toISOString());
        // Sync token presence on mount
        setHasToken(!!localStorage.getItem('token'))
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Keep hasToken in sync when other parts of the app update localStorage
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'token') {
                setHasToken(!!e.newValue)
            }
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    // Also recompute hasToken when auth context user changes (same-tab login/logout)
    useEffect(() => {
        setHasToken(!!localStorage.getItem('token'))
    }, [currentUser])

    const submitHandler = async (e) => {
        e.preventDefault()
        
        // Validation
        if (!taskTitle.trim()) {
            alert('Task title is required')
            return
        }
        
        if (!taskDescription.trim()) {
            alert('Task description is required')
            return
        }
        
        if (!endDate) {
            alert('End date is required')
            return
        }
        
        if (!asignTo) {
            alert('Please select an employee to assign the task to')
            return
        }
        
        if (!category) {
            alert('Please select a category')
            return
        }
        
        // Validate dates (server will also validate with a grace window)
        const startDate = new Date() // let server set taskDate; use now for quick client-side check
        const taskEndDate = new Date(endDate)
        const GRACE_MS = 30 * 1000
        if (isNaN(taskEndDate.getTime())) {
            alert('Please enter a valid end date/time')
            return
        }
        if (taskEndDate.getTime() <= startDate.getTime() + GRACE_MS) {
            alert('Last date/time must be slightly after the current time')
            return
        }

        try {
            // Find the selected employee (case-insensitive email match)
            const emailEntered = (asignTo || '').trim().toLowerCase();
            const selectedEmployee = employees.find(emp => (emp.email || '').toLowerCase() === emailEntered)
            if (!selectedEmployee) {
                alert('Selected employee not found')
                return
            }

            // Ensure we have an auth token before calling protected API
            const token = localStorage.getItem('token')
            if (!token) {
                alert('You are not authenticated. Please log in as admin again to assign tasks.')
                return
            }

            // Create task data
            const taskData = {
                taskTitle: taskTitle.trim(),
                taskDescription: taskDescription.trim(),
                // taskDate is set on the server to avoid client clock issues
                endDate: new Date(endDate).toISOString(),
                category: category,
                newTask: true,
                active: false,
                completed: false,
                failed: false
            }

            console.log('Creating task:', taskData)
            console.log('For employee:', selectedEmployee)
            
            // Get current admin from localStorage
            const storedUser = localStorage.getItem('user')
            if (!storedUser) {
                alert('Admin session not found. Please log in again.')
                return
            }

            const storedAdmin = JSON.parse(storedUser)
            if (!storedAdmin._id) {
                alert('Admin ID not found. Please log in again.')
                return
            }

            // Use the adminAPI to add a task to an employee
            try {
                const adminId = storedAdmin._id;
                // Call centralized API (handles base URL, headers, token, x-admin-id)
                const responseData = await adminAPI.addTask(adminId, selectedEmployee._id, taskData);
                console.log('Task assignment result:', responseData)
                
                alert(`Task "${taskTitle}" successfully assigned to ${selectedEmployee.firstName} (${selectedEmployee.email})!`)
                
                // Clear form
                setTaskTitle('')
                setTaskDescription('')
                // Keep taskDate as now for subsequent entries
                setEndDate('')
                setAsignTo('')
                setCategory('')
                // setNewTask({}) // Unused
                
                // Refresh employee data to show updated task counts
                if (refreshEmployees) {
                    refreshEmployees()
                }
                if (onTaskCreated) {
                    onTaskCreated()
                }
                
            } catch (error) {
                console.error('Error assigning task:', error)
                alert(`Failed to assign task: ${error.message}`)
            }
            
        } catch (error) {
            console.error('Error in task assignment:', error)
            alert(`Failed to assign task: ${error.message}`)
        }
    }

    return (
        <div className='p-5 bg-[#1c1c1c] mt-5 rounded'>
            {!hasToken && (
                <div className='mb-4 p-3 rounded bg-yellow-100 text-yellow-800 border border-yellow-300'>
                    You are not authenticated. Please log in as admin to create and assign tasks.
                </div>
            )}
            {employees.length === 0 && (
                <div className='mb-4 p-3 rounded bg-blue-50 text-blue-800 border border-blue-200'>
                    No employees found for this admin. Please add employees before creating tasks.
                </div>
            )}
            <form
                onSubmit={(e) => {
                    submitHandler(e)
                }}
                className='flex flex-wrap w-full items-start justify-between'
            >
                <div className='w-1/2'>
                    <div>
                        <h3 className='text-sm text-gray-300 mb-0.5'>Task Title</h3>
                        <input
                            value={taskTitle}
                            onChange={(e) => {
                                setTaskTitle(e.target.value)
                            }}
                            className='text-sm py-2 px-3 w-4/5 rounded outline-none bg-white text-gray-900 placeholder-gray-500 border-[1px] border-gray-300 mb-4' type="text" placeholder='Make a UI design'
                        />
                    </div>
                    {/* Assign Date is set to current time by default; no input needed */}
                    <input type="hidden" value={taskDate} readOnly />
                    <div>
                        <h3 className='text-sm text-gray-300 mb-0.5'>Last Date & Time</h3>
                        <input
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value)
                            }}
                            className='text-sm py-2 px-3 w-4/5 rounded outline-none bg-white text-gray-900 placeholder-gray-500 border-[1px] border-gray-300 mb-4' type="datetime-local" min={new Date().toISOString().slice(0,16)} />
                    </div>
                    <div className='relative dropdown-container'>
                        <h3 className='text-sm text-gray-300 mb-0.5'>Assign to (Employee Email)</h3>
                        <div className='relative w-4/5'>
                            <input
                                value={asignTo}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    console.log('Input changed:', value);
                                    setAsignTo(value);
                                    setShowDropdown(!!value); // Only show dropdown if there's input
                                }}
                                onFocus={async () => {
                                    console.log('Input focused, showing dropdown');
                                    setShowDropdown(true);
                                    // If employees are not loaded yet, try refreshing once
                                    if (!triedRefreshOnFocus.current && employees.length === 0 && typeof refreshEmployees === 'function') {
                                        try {
                                            await refreshEmployees();
                                            triedRefreshOnFocus.current = true;
                                        } catch (e) {
                                            console.warn('Failed to refresh employees on focus', e);
                                            triedRefreshOnFocus.current = true;
                                        }
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        // Prevent form submit when pressing Enter in the search input
                                        e.preventDefault();
                                        e.stopPropagation();

                                        // Optional: pick the first matching employee on Enter
                                        const searchTerm = (asignTo || '').toLowerCase();
                                        const match = employees.find(emp => {
                                            if (!emp) return false;
                                            return (
                                                (emp.email && emp.email.toLowerCase().includes(searchTerm)) ||
                                                (emp.firstName && emp.firstName.toLowerCase().includes(searchTerm)) ||
                                                (emp.lastName && emp.lastName.toLowerCase().includes(searchTerm)) ||
                                                (emp.name && emp.name.toLowerCase().includes(searchTerm))
                                            );
                                        });
                                        if (match) {
                                            setAsignTo(match.email);
                                            setShowDropdown(false);
                                        }
                                    }
                                }}
                                className='text-sm py-2 px-3 w-full rounded outline-none bg-white text-gray-900 placeholder-gray-500 border-[1px] border-gray-300 mb-4' 
                                type="text"
                                placeholder='Search by name or email'
                                autoComplete='off'
                            />
                            {showDropdown && (
                                <div className='absolute top-12 left-0 w-full bg-white border border-gray-300 rounded max-h-60 overflow-y-auto z-10 shadow-lg'>
                                    {!employees || employees.length === 0 ? (
                                        <div className='p-3 text-sm text-gray-500'>
                                            {asignTo ? 'No matching employees found' : 'No employees found. Add employees first.'}
                                        </div>
                                    ) : asignTo ? (
                                        (() => {
                                            const filtered = employees.filter(emp => {
                                                if (!emp) return false;
                                                const searchTerm = asignTo.toLowerCase();
                                                return (
                                                    (emp.email && emp.email.toLowerCase().includes(searchTerm)) ||
                                                    (emp.firstName && emp.firstName.toLowerCase().includes(searchTerm)) ||
                                                    (emp.lastName && emp.lastName.toLowerCase().includes(searchTerm)) ||
                                                    (emp.name && emp.name.toLowerCase().includes(searchTerm))
                                                );
                                            }).slice(0, 10);
                                            return filtered.length > 0 ? filtered.map((employee) => (
                                                <div
                                                    key={employee._id || employee.email}
                                                    onClick={() => {
                                                        console.log('Selected employee:', employee);
                                                        setAsignTo(employee.email);
                                                        setShowDropdown(false);
                                                    }}
                                                    className='px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-900 border-b border-gray-200 last:border-b-0 flex items-center justify-between'
                                                >
                                                    <div className='min-w-0'>
                                                        <div className='font-medium truncate' title={employee.email}>
                                                            {employee.email}
                                                        </div>
                                                        <div className='text-xs text-gray-500 truncate'>
                                                            {(employee.firstName || employee.name || '')} {employee.lastName || ''}
                                                        </div>
                                                    </div>
                                                    {employee.department && (
                                                        <div className='text-xs text-blue-600 ml-2 whitespace-nowrap'>
                                                            {employee.department}
                                                        </div>
                                                    )}
                                                </div>
                                            )) : (
                                                <div className='p-3 text-sm text-gray-500'>No matching employees found</div>
                                            );
                                        })()
                                    ) : (
                                        // Show all employees when there is no search term
                                        employees.slice(0, 50).map((employee) => (
                                            <div
                                                key={employee._id || employee.email}
                                                onClick={() => {
                                                    console.log('Selected employee:', employee);
                                                    setAsignTo(employee.email);
                                                    setShowDropdown(false);
                                                }}
                                                className='px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-900 border-b border-gray-200 last:border-b-0 flex items-center justify-between'
                                            >
                                                <div className='min-w-0'>
                                                    <div className='font-medium truncate' title={employee.email}>
                                                        {employee.email}
                                                    </div>
                                                    <div className='text-xs text-gray-500 truncate'>
                                                        {(employee.firstName || employee.name || '')} {employee.lastName || ''}
                                                    </div>
                                                </div>
                                                {employee.department && (
                                                    <div className='text-xs text-blue-600 ml-2 whitespace-nowrap'>
                                                        {employee.department}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className='text-sm text-gray-300 mb-0.5'>Category</h3>
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value)
                            }}
                            className='text-sm py-2 px-3 w-4/5 rounded outline-none bg-white text-gray-900 border-[1px] border-gray-300 mb-4'
                        >
                            <option value="" className='bg-white'>Select Category</option>
                            <option value="Design" className='bg-white'>Design</option>
                            <option value="Development" className='bg-white'>Development</option>
                            <option value="Meeting" className='bg-white'>Meeting</option>
                            <option value="QA" className='bg-white'>QA</option>
                            <option value="Documentation" className='bg-white'>Documentation</option>
                            <option value="DevOps" className='bg-white'>DevOps</option>
                            <option value="Presentation" className='bg-white'>Presentation</option>
                            <option value="Support" className='bg-white'>Support</option>
                        </select>
                    </div>
                </div>

                <div className='w-2/5 flex flex-col items-start'>
                    <h3 className='text-sm text-gray-300 mb-0.5'>Description</h3>
                    <textarea value={taskDescription}
                        onChange={(e) => {
                            setTaskDescription(e.target.value)
                        }} className='w-full h-44 text-sm py-2 px-4 rounded outline-none bg-white text-gray-900 placeholder-gray-500 border-[1px] border-gray-300' name="" id=""></textarea>
                    <button 
                        className={`py-3 px-5 rounded text-sm mt-4 w-full ${hasToken && employees.length > 0 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={!hasToken || employees.length === 0}
                        title={!hasToken ? 'Please log in as admin to create tasks' : (employees.length === 0 ? 'Add employees first to assign tasks' : '')}
                    >
                        Create Task
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateTask