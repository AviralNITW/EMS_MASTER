import React, { createContext, useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            return null;
        }
    });

    const refreshEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setUserData([]);
                return;
            }

            // Get users based on the role using the new userAPI
            const resp = await userAPI.getAll();
            setUserData(resp || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            if (error.message === 'Unauthorized') {
                localStorage.removeItem('user');
                setCurrentUser(null);
            }
            setUserData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadUserData = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            
            if (storedUser && token) {
                try {
                    // Fetch fresh data if needed based on role
                    await refreshEmployees();
                } catch (error) {
                    console.error('Error loading user data:', error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setCurrentUser(null);
                    setUserData([]);
                }
            } else {
                setCurrentUser(null);
                setUserData([]);
            }
        };
        
        loadUserData();
    }, [refreshEmployees]);

    const value = {
        userData,
        setUserData,
        loading,
        refreshEmployees,
        currentUser,
        updateCurrentUser: (userData) => {
            if (userData) {
                setCurrentUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                setCurrentUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthProvider;