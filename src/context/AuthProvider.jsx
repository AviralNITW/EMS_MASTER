import React, { createContext, useState, useEffect, useCallback } from 'react'
import { adminAPI, employeeAPI } from '../services/api'

export const AuthContext = createContext()

const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState([])
    const [loading, setLoading] = useState(false)
    const [currentAdmin, setCurrentAdmin] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)

    const refreshEmployees = useCallback(async () => {
        try {
            setLoading(true)
            const storedUser = localStorage.getItem('user')
            if (!storedUser) {
                setUserData([])
                setCurrentAdmin(null)
                return
            }
            
            const stored = JSON.parse(storedUser)
            // Infer identity and adminId robustly
            const isAdmin = stored.userType === 'admin' || (!!stored._id && Array.isArray(stored.employees))
            const isEmployee = stored.userType === 'employee' || (!!stored.adminId || !!stored.admin)
            const adminId = isAdmin ? (stored._id)
                            : isEmployee ? (stored.adminId || stored.admin?._id)
                            : (stored.adminId || stored.admin?._id || stored._id)

            if (!adminId) {
                setUserData([])
                setCurrentAdmin(null)
                return
            }

            // Prefer live data from backend
            try {
                const token = localStorage.getItem('token')

                if (isEmployee) {
                    // Employees do NOT have admin JWT; fetch their own record directly
                    const empResp = await employeeAPI.getById(stored._id)
                    const employee = empResp?.data
                    setUserData(employee ? [employee] : [])
                    // Best-effort: keep minimal currentAdmin reference
                    setCurrentAdmin(prev => prev?.
                        _id === adminId ? prev : { _id: adminId })
                } else {
                    // Admin dashboard: require token to call protected endpoint
                    if (!token) throw new Error('Not authorized, no token')
                    const adminData = await adminAPI.getById(adminId)
                    
                    // Defensive programming: ensure adminData has required fields
                    if (!adminData || !adminData._id) {
                        throw new Error('Invalid admin data received from server')
                    }
                    
                    console.log('Admin data received:', { 
                        id: adminData._id, 
                        email: adminData.email, 
                        employeeCount: adminData.employees?.length || 0 
                    })
                    
                    setCurrentAdmin(adminData)
                    setUserData(adminData.employees || [])
                }
            } catch (fetchError) {
                // Graceful fallback if unauthorized/no token or any fetch error
                console.error('Error fetching employees (using fallback):', {
                    message: fetchError.message,
                    isAdmin,
                    adminId,
                    hasToken: !!token
                })
                
                const fallbackAdmin = isAdmin ? stored : (stored.admin || null)
                if (fallbackAdmin && fallbackAdmin._id) {
                    // Ensure fallback admin has proper structure
                    const safeAdmin = {
                        _id: fallbackAdmin._id,
                        email: fallbackAdmin.email,
                        name: fallbackAdmin.name,
                        employees: Array.isArray(fallbackAdmin.employees) ? fallbackAdmin.employees : [],
                        ...fallbackAdmin
                    }
                    
                    setCurrentAdmin(safeAdmin)
                    if (isEmployee) {
                        const employee = (safeAdmin.employees || []).find(emp => emp._id === stored._id || emp.email === stored.email)
                        setUserData(employee ? [employee] : [])
                    } else {
                        setUserData(safeAdmin.employees || [])
                    }
                } else {
                    console.warn('No valid fallback admin data available')
                    setUserData([])
                    setCurrentAdmin(null)
                }
            }
        } catch (error) {
            console.error('Error in refreshEmployees:', error)
            setUserData([])
            setCurrentAdmin(null)
        } finally {
            setLoading(false)
        }
    }, [])

    // Load current user and admin data when component mounts
    useEffect(() => {
        const loadUserData = async () => {
            const storedUser = localStorage.getItem('user')
            if (storedUser) {
                try {
                    const stored = JSON.parse(storedUser)
                    setCurrentUser(stored)

                    // Prefill context from stored admin data to avoid empty UI before network
                    const prefillAdmin = stored.userType === 'admin' ? stored : (stored.admin || null)
                    if (prefillAdmin && Array.isArray(prefillAdmin.employees)) {
                        setCurrentAdmin(prefillAdmin)
                        if (stored.userType === 'employee') {
                            const self = (prefillAdmin.employees || []).find(emp => emp._id === stored._id || emp.email === stored.email)
                            setUserData(self ? [self] : [])
                        } else {
                            setUserData(prefillAdmin.employees || [])
                        }
                    }

                    // Then fetch fresh data
                    await refreshEmployees()
                } catch (error) {
                    console.error('Error loading user data:', error)
                    // Clear invalid user data
                    localStorage.removeItem('user')
                    setCurrentUser(null)
                    setCurrentAdmin(null)
                    setUserData([])
                }
            } else {
                setCurrentUser(null)
                setCurrentAdmin(null)
                setUserData([])
            }
        }
        
        loadUserData()
    }, [refreshEmployees])

    const value = {
        userData,
        setUserData,
        loading,
        refreshEmployees,
        currentAdmin,
        currentUser,
        // Add a function to manually update the current user (for login/logout)
        updateCurrentUser: (userData) => {
            if (userData) {
                setCurrentUser(userData)
                localStorage.setItem('user', JSON.stringify(userData))
            } else {
                setCurrentUser(null)
                setCurrentAdmin(null)
                localStorage.removeItem('user')
            }
        }
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// Create and export the useAuth hook
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Default export the AuthProvider component
export default AuthProvider;