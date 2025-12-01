import React, { useState } from 'react'
import Login from './Login'
import Signup from './Signup'
import { authAPI } from '../../services/api'

const AuthWrapper = ({ onAuthSuccess }) => {
    const [isLoginMode, setIsLoginMode] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const handleLogin = async (email, password) => {
        try {
            setError('')
            
            const response = await authAPI.adminLogin({ email, password })
            if (response.user) {
                // Persist token if provided by backend (support multiple shapes)
                const token = response.token || response?.data?.token || response?.user?.token || response?.accessToken;
                if (token) {
                    localStorage.setItem('token', token)
                }
                // Include user type in the response
                const adminData = {
                    ...response.user,
                    userType: 'admin'
                };
                onAuthSuccess('admin', adminData)
                return
            }
        } catch (error) {
            console.error('Admin login error:', error)
            const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Invalid admin credentials. Please check your email and password.';
            setError(errorMessage)
        }
    }

    const handleEmployeeLogin = async (email, password) => {
        try {
            setError('')
            
            const response = await authAPI.employeeLogin({ email, password })
            if (response.user) {
                // Persist token if provided by backend (support multiple shapes)
                const token = response.token || response?.data?.token || response?.user?.token || response?.accessToken;
                if (token) {
                    localStorage.setItem('token', token)
                }
                // Include admin ID and user type in the response
                const employeeData = {
                    ...response.user,
                    userType: 'employee',
                    adminId: response.adminId
                }
                onAuthSuccess('employee', employeeData)
                return
            }
        } catch (error) {
            console.error('Employee login error:', error)
            const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'Invalid employee credentials. Please check your email and password.';
            setError(errorMessage)
        }
    }

    const handleSignup = async (userData) => {
        try {
            setError('')
            setSuccessMessage('')
            
            const response = await authAPI.adminSignup(userData)
            if (response.user) {
                // Persist token and auto-login newly created admin for seamless onboarding
                const token = response.token || response?.data?.token || response?.user?.token || response?.accessToken
                if (token) {
                    localStorage.setItem('token', token)
                }
                const adminData = { ...response.user, userType: 'admin' }
                onAuthSuccess('admin', adminData)
                return
            }
        } catch (error) {
            console.error('Signup error:', error)
            if (error.message.includes('already exists')) {
                setError('An admin account with this email already exists. Please use a different email or try logging in.')
            } else {
                setError('Signup failed. Please try again.')
            }
            throw error // Re-throw to let the signup component handle loading state
        }
    }

    const switchToLogin = () => {
        setIsLoginMode(true)
        setError('')
        setSuccessMessage('')
    }

    const switchToSignup = () => {
        setIsLoginMode(false)
        setError('')
        setSuccessMessage('')
    }

    return (
        <div>
            {/* Error/Success Messages */}
            {error && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 max-w-md">
                    <div className="flex items-center">
                        <span className="text-sm">{error}</span>
                        <button 
                            onClick={() => setError('')}
                            className="ml-4 text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            
            {successMessage && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 max-w-md">
                    <div className="flex items-center">
                        <span className="text-sm">{successMessage}</span>
                        <button 
                            onClick={() => setSuccessMessage('')}
                            className="ml-4 text-green-500 hover:text-green-700"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Auth Components */}
            {isLoginMode ? (
                <Login 
                    handleLogin={handleLogin}
                    handleEmployeeLogin={handleEmployeeLogin}
                    switchToSignup={switchToSignup}
                />
            ) : (
                <Signup 
                    handleSignup={handleSignup} 
                    switchToLogin={switchToLogin}
                />
            )}
        </div>
    )
}

export default AuthWrapper
