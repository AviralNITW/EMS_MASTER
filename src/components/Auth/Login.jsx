import React, { useState } from 'react'

const Login = ({handleLogin, handleEmployeeLogin, switchToSignup}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [loginType, setLoginType] = useState('admin') // 'admin' or 'employee'

    const submitHandler = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            if (loginType === 'admin') {
                await handleLogin(email, password)
            } else {
                await handleEmployeeLogin(email, password)
            }
            setEmail("")
            setPassword("")
        } catch (error) {
            console.error('Login error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex h-screen w-screen items-center justify-center bg-gray-50'>
            <div className='border-2 rounded-xl border-emerald-600 p-8 bg-white shadow-lg max-w-md w-full mx-4'>
                <div className='text-center mb-6'>
                    <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                        {loginType === 'admin' ? 'Admin Login' : 'Employee Login'}
                    </h2>
                    <p className='text-gray-600'>
                        {loginType === 'admin' ? 'Access your EMS dashboard' : 'Access your employee dashboard'}
                    </p>
                </div>

                {/* Login Type Toggle */}
                <div className='flex mb-6 bg-gray-100 rounded-full p-1'>
                    <button
                        type="button"
                        onClick={() => setLoginType('admin')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                            loginType === 'admin'
                                ? 'bg-emerald-600 text-white'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        Admin
                    </button>
                    <button
                        type="button"
                        onClick={() => setLoginType('employee')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                            loginType === 'employee'
                                ? 'bg-emerald-600 text-white'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        Employee
                    </button>
                </div>
                
                <form 
                    onSubmit={submitHandler}
                    className='flex flex-col space-y-4'
                >
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        className='w-full outline-none bg-transparent border-2 border-emerald-600 font-medium text-lg py-3 px-4 rounded-full placeholder:text-gray-400' 
                        type="email" 
                        placeholder='Enter your email' 
                    />
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        className='w-full outline-none bg-transparent border-2 border-emerald-600 font-medium text-lg py-3 px-4 rounded-full placeholder:text-gray-400' 
                        type="password" 
                        placeholder='Enter password' 
                    />
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className={`mt-6 text-white border-none outline-none font-semibold text-lg py-3 px-8 w-full rounded-full transition-colors ${
                            isLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                    >
                        {isLoading ? 'Logging in...' : `Log in as ${loginType === 'admin' ? 'Admin' : 'Employee'}`}
                    </button>
                </form>
                
                {switchToSignup && loginType === 'admin' && (
                    <div className='text-center mt-6'>
                        <p className='text-gray-600'>
                            Don't have an admin account?{' '}
                            <button 
                                onClick={switchToSignup}
                                className='text-emerald-600 hover:text-emerald-700 font-semibold underline'
                            >
                                Sign up here
                            </button>
                        </p>
                    </div>
                )}

                {loginType === 'employee' && (
                    <div className='text-center mt-6'>
                        <p className='text-gray-600 text-sm'>
                            Employee accounts are created by admins
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Login