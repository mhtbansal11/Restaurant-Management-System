import { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import config from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const handledInvalidTokenRef = useRef(false);

  const handleInvalidToken = useCallback((message) => {
    if (handledInvalidTokenRef.current) return;
    handledInvalidTokenRef.current = true;
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.error(message || 'Session expired. Please log in again.');
    if (window.location.pathname !== '/login') {
      window.location.replace('/login');
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        handleInvalidToken('Your session has expired. Please log in again.');
      } else {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [handleInvalidToken]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const hasToken = !!localStorage.getItem('token');
        if (hasToken && (status === 401 || status === 403)) {
          handleInvalidToken('Your session has expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, [handleInvalidToken]);

  const login = async (email, password) => {
    const response = await axios.post(config.ENDPOINTS.LOGIN, { email, password });
    localStorage.setItem('token', response.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    handledInvalidTokenRef.current = false;
    setUser(response.data.user);
    return response.data;
  };

  const register = async (name, email, password, restaurantName) => {
    const response = await axios.post(config.ENDPOINTS.REGISTER, {
      name,
      email,
      password,
      restaurantName
    });
    localStorage.setItem('token', response.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    handledInvalidTokenRef.current = false;
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    handledInvalidTokenRef.current = false;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

