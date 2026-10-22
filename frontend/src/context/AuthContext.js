import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize user from MongoDB database on mount
  useEffect(() => {
    const syncUserFromDatabase = async () => {
      const stored = localStorage.getItem('userInfo');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.token) {
            // Fetch live user profile directly from MongoDB database
            const { data } = await API.get('/auth/me');
            const updatedUser = {
              ...data,
              role: data.role || parsed.role || 'User',
              token: parsed.token,
            };
            setUser(updatedUser);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
          } else {
            localStorage.removeItem('userInfo');
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to sync user from MongoDB, clearing session:', error);
          localStorage.removeItem('userInfo');
          setUser(null);
        }
      }
      setLoading(false);
    };

    syncUserFromDatabase();
  }, []);

  const login = async (email, password, loginRole = null) => {
    const payload = { email, password };
    if (loginRole) payload.loginRole = loginRole;
    
    // Save/validate directly in MongoDB database
    const { data } = await API.post('/auth/login', payload);

    // Guaranteed role assignment: if user clicked Staff tab, role is ALWAYS 'User'
    const finalRole = loginRole ? loginRole : (data.role || 'User');
    const sessionUser = {
      ...data,
      role: finalRole,
    };

    setUser(sessionUser);
    localStorage.setItem('userInfo', JSON.stringify(sessionUser));
    return sessionUser;
  };

  const register = async (name, email, password, role = 'User') => {
    // Save directly in MongoDB database
    const { data } = await API.post('/auth/register', { name, email, password, role });
    
    const finalRole = role ? role : (data.role || 'User');
    const sessionUser = {
      ...data,
      role: finalRole,
    };

    setUser(sessionUser);
    localStorage.setItem('userInfo', JSON.stringify(sessionUser));
    return sessionUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
