import React, { useState } from 'react'

const Signup = ({ handleSignup, switchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email'
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 3) {
            newErrors.password = 'Password must be at least 3 characters'
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const submitHandler = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }
        
        setIsLoading(true)
        try {
            await handleSignup({
                name: formData.name,
                email: formData.email,
                password: formData.password
            })
            // Reset form on success
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            })
        } catch (error) {
            console.error('Signup error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex h-screen w-screen items-center justify-center bg-gray-50'>
            <div className='border-2 rounded-xl border-emerald-600 p-8 bg-white shadow-lg max-w-md w-full mx-4'>
                <div className='text-center mb-6'>
                    <h2 className='text-2xl font-bold text-gray-800 mb-2'>Create Admin Account</h2>
                    <p className='text-gray-600'>Sign up to create your EMS system</p>
                </div>
                
                <form onSubmit={submitHandler} className='flex flex-col space-y-4'>
                    <div>
                        <input 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required 
                            className={`w-full outline-none bg-transparent border-2 ${errors.name ? 'border-red-500' : 'border-emerald-600'} font-medium text-lg py-3 px-4 rounded-full placeholder:text-gray-400`}
                            type="text" 
                            placeholder='Enter your full name' 
                        />
                        {errors.name && <p className='text-red-500 text-sm mt-1 ml-4'>{errors.name}</p>}
                    </div>
                    
                    <div>
                        <input 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required 
                            className={`w-full outline-none bg-transparent border-2 ${errors.email ? 'border-red-500' : 'border-emerald-600'} font-medium text-lg py-3 px-4 rounded-full placeholder:text-gray-400`}
                            type="email" 
                            placeholder='Enter your email' 
                        />
                        {errors.email && <p className='text-red-500 text-sm mt-1 ml-4'>{errors.email}</p>}
                    </div>
                    
                    <div>
                        <input
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required 
                            className={`w-full outline-none bg-transparent border-2 ${errors.password ? 'border-red-500' : 'border-emerald-600'} font-medium text-lg py-3 px-4 rounded-full placeholder:text-gray-400`}
                            type="password" 
                            placeholder='Enter password' 
                        />
                        {errors.password && <p className='text-red-500 text-sm mt-1 ml-4'>{errors.password}</p>}
                    </div>
                    
                    <div>
                        <input
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required 
                            className={`w-full outline-none bg-transparent border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-emerald-600'} font-medium text-lg py-3 px-4 rounded-full placeholder:text-gray-400`}
                            type="password" 
                            placeholder='Confirm password' 
                        />
                        {errors.confirmPassword && <p className='text-red-500 text-sm mt-1 ml-4'>{errors.confirmPassword}</p>}
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className={`mt-6 text-white border-none outline-none font-semibold text-lg py-3 px-8 w-full rounded-full transition-colors ${
                            isLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                
                <div className='text-center mt-6'>
                    <p className='text-gray-600'>
                        Already have an account?{' '}
                        <button 
                            onClick={switchToLogin}
                            className='text-emerald-600 hover:text-emerald-700 font-semibold underline'
                        >
                            Login here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup
