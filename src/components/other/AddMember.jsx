import React, { useState } from 'react'
import { employeeAPI } from '../../services/api'

const AddMember = () => {
    const [firstName, setFirstName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [address, setAddress] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const submitHandler = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Create new employee object for backend
            const newEmployee = {
                firstName,
                email,
                password,
                address,
                role: 'employee'
            }

            // Add employee using backend API
            const response = await employeeAPI.create(newEmployee)
            
            // Reset form on success
            setFirstName('')
            setEmail('')
            setPassword('')
            setAddress('')

            alert('Employee added successfully! They can now log in with their credentials.')
        } catch (error) {
            console.error('Error adding employee:', error)
            alert(`Failed to add employee: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='p-5 bg-[#1c1c1c] mt-5 rounded'>
            <form
                onSubmit={submitHandler}
                className='flex flex-wrap w-full items-start justify-between'
            >
                <div className='w-1/2'>
                    <div>
                        <h3 className='text-sm text-gray-300 mb-0.5'>First Name</h3>
                        <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className='text-sm py-1 px-2 w-4/5 rounded outline-none bg-transparent border-[1px] border-gray-400 mb-4'
                            type="text"
                            placeholder='John Doe'
                            required
                        />
                    </div>
                    <div>
                        <h3 className='text-sm text-gray-300 mb-0.5'>Email</h3>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='text-sm py-1 px-2 w-4/5 rounded outline-none bg-transparent border-[1px] border-gray-400 mb-4'
                            type="email"
                            placeholder='john@example.com'
                            required
                        />
                    </div>
                    <div>
                        <h3 className='text-sm text-gray-300 mb-0.5'>Password</h3>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='text-sm py-1 px-2 w-4/5 rounded outline-none bg-transparent border-[1px] border-gray-400 mb-4'
                            type="password"
                            placeholder='Enter password'
                            required
                        />
                    </div>
                </div>

                <div className='w-2/5 flex flex-col items-start'>
                    <h3 className='text-sm text-gray-300 mb-0.5'>Address</h3>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className='w-full h-44 text-sm py-2 px-4 rounded outline-none bg-transparent border-[1px] border-gray-400'
                        placeholder='Enter full address'
                        required
                    ></textarea>
                    <button 
                        className={`py-3 px-5 rounded text-sm mt-4 w-full ${
                            isLoading 
                                ? 'bg-gray-500 cursor-not-allowed' 
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Adding Employee...' : 'Add Employee'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddMember
