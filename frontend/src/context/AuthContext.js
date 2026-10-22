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

    // Guarantee that if user logged in via the Staff tab, their role is set to 'User'
    // and if via Admin tab, their role is set to 'Admin'
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

  const switchRole = (newRole) => {
    if (!user) return;
    const sessionUser = {
      ...user,
      role: newRole,
    };
    setUser(sessionUser);
    localStorage.setItem('userInfo', JSON.stringify(sessionUser));
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
