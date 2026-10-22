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
            // Fetch live user profile and role directly from MongoDB database
            const { data } = await API.get('/auth/me');
            const updatedUser = {
              ...data,
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

    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password, role = 'User') => {
    // Save directly in MongoDB database
    const { data } = await API.post('/auth/register', { name, email, password, role });
    
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const switchRole = async (newRole) => {
    if (!user) return;
    try {
      // Persist role change directly to MongoDB database
      const { data } = await API.put('/auth/role', { role: newRole });
      const updatedUser = {
        ...data,
        token: user.token,
      };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      console.error('Failed to update role in database:', err);
      // Fallback local update if network hiccups
      const fallbackUser = { ...user, role: newRole };
      setUser(fallbackUser);
      localStorage.setItem('userInfo', JSON.stringify(fallbackUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
