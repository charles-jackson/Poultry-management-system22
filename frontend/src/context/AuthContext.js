import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, loginRole = null) => {
    const payload = { email, password };
    if (loginRole) payload.loginRole = loginRole;
    const { data } = await API.post('/auth/login', payload);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password, role = 'User') => {
    const { data } = await API.post('/auth/register', { name, email, password, role });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
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
