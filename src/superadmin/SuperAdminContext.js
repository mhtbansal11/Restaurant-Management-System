import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import config from '../config';

const SuperAdminContext = createContext(null);
const API = config.API_URL;

export function SuperAdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sa_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const stored = localStorage.getItem('sa_admin');
      if (stored) setAdmin(JSON.parse(stored));
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/superadmin/login`, { email, password });
    localStorage.setItem('sa_token', res.data.token);
    localStorage.setItem('sa_admin', JSON.stringify(res.data.admin));
    setToken(res.data.token);
    setAdmin(res.data.admin);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('sa_token');
    localStorage.removeItem('sa_admin');
    setToken(null);
    setAdmin(null);
  };

  // Always read from localStorage so stale React state never sends a null/old token
  const authHeaders = () => {
    const t = localStorage.getItem('sa_token');
    return { headers: { Authorization: `Bearer ${t}` } };
  };

  const api = useMemo(() => ({
    get: (path) => axios.get(`${API}/superadmin${path}`, authHeaders()),
    put: (path, data) => axios.put(`${API}/superadmin${path}`, data, authHeaders()),
    post: (path, data) => axios.post(`${API}/superadmin${path}`, data, authHeaders()),
    delete: (path) => axios.delete(`${API}/superadmin${path}`, authHeaders()),
  }), []); // authHeaders reads localStorage directly so no deps needed

  return (
    <SuperAdminContext.Provider value={{ admin, token, loading, login, logout, api }}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export const useSuperAdmin = () => useContext(SuperAdminContext);
