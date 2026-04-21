import React, { createContext, useState, useEffect } from 'react';
import { adminApiClient } from '../utils/apiClient';

export const AdminAuthContext = createContext({});

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if admin is already logged in on app launch
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = localStorage.getItem('adminToken');
      const savedAdmin = localStorage.getItem('adminData');

      if (savedToken && savedAdmin) {
        setToken(savedToken);
        setAdmin(JSON.parse(savedAdmin));
      }
    } catch (e) {
      console.error('[Admin Auth] Bootstrap error:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // This will be implemented as an admin login endpoint
      // For now, using the pattern established for backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify(data.admin));

      setToken(data.token);
      setAdmin(data.admin);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      setToken(null);
      setAdmin(null);
    } catch (err) {
      console.error('[Admin Auth] Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    admin,
    token,
    loading,
    error,
    login,
    logout,
    isLoggedIn: !!token && !!admin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = React.useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
