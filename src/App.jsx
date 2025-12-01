import React, { useContext, useEffect, useState, useCallback, useRef } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AuthWrapper from './components/Auth/AuthWrapper'
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import { AuthContext } from './context/AuthProvider'

const App = () => {
  const [user, setUser] = useState(null)
  const [loggedInUserData, setLoggedInUserData] = useState(null)
  const { userData, setUserData, loading, refreshEmployees, updateCurrentUser } = useContext(AuthContext)

  // Use useCallback to memoize the user loading logic
  const loadUserFromStorage = useCallback(() => {
    const storedUser = localStorage.getItem('user')
    
    if (storedUser) {
      try {
      const userData = JSON.parse(storedUser)
       
      setUser(prevUser => (prevUser === (userData.userType || 'admin') ? prevUser : (userData.userType || 'admin')))
      setLoggedInUserData(prevData => JSON.stringify(prevData) === JSON.stringify(userData) ? prevData : userData)
      return userData
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
        return null
      }
    }
    return null
  }, [])

  // Use a ref to track if we've already loaded the user
  const initialLoad = useRef(true)

  useEffect(() => {
    // Only run this effect on initial mount
    if (initialLoad.current) {
      const userData = loadUserFromStorage()
      if (userData) {
        updateCurrentUser(userData)
      } else {
        updateCurrentUser(null)
      }
      initialLoad.current = false
    }
  }, [loadUserFromStorage, updateCurrentUser])

  const handleAuthSuccess = (userType, userData) => {
    // Handle successful authentication
    setUser(userType)
    setLoggedInUserData(userData)
    
    // Create a complete user object with all necessary fields
    const completeUserData = {
      ...userData,
      userType,
      // Ensure we have a consistent _id field
      _id: userData._id || userData.user?._id
    }
    
    // Store user data in localStorage and update context
    updateCurrentUser(completeUserData)
    
    // For backward compatibility, also store in old format
    localStorage.setItem('loggedInUser', JSON.stringify({ role: userType, data: userData }))
    
    // If admin login, refresh employee data
    if (userType === 'admin' && refreshEmployees) {
      refreshEmployees()
    }
  }

  const handleLogout = () => {
    setUser(null)
    setLoggedInUserData(null)
    updateCurrentUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('loggedInUser')
    localStorage.removeItem('token')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      
      {!user ? (
        <AuthWrapper onAuthSuccess={handleAuthSuccess} />
      ) : user === 'admin' ? (
        <AdminDashboard 
          userData={userData} 
          setUserData={setUserData} 
          refreshEmployees={refreshEmployees}
          updateCurrentUser={updateCurrentUser}
          changeUser={handleLogout}
        />
      ) : (
        <EmployeeDashboard 
          userData={userData} 
          setUserData={setUserData} 
          refreshEmployees={refreshEmployees}
          updateCurrentUser={updateCurrentUser}
          changeUser={handleLogout}
          data={loggedInUserData}
        />
      )}
    </div>
  )
}

export default App