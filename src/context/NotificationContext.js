import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/users/notifications`);
      setNotifications(response.data);
      setUnreadCount(response.data.filter(notif => !notif.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const newSocket = io(config.API_URL.replace('/api', ''));
      setSocket(newSocket);
      newSocket.emit('join', user.restaurantName);

      newSocket.on('new_order', (order) => {
        const newNotif = {
          _id: Date.now().toString(),
          title: 'New Order Received',
          message: `Order #${order?._id?.slice(-6) || 'N/A'} for Table ${order.tableLabels?.join(', ') || 'Takeaway'}`,
          type: 'info',
          createdAt: new Date(),
          read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        new Audio('/notification.mp3').play().catch(e => console.log('Audio blocked'));
      });

      newSocket.on('order_updated', (order) => {
        if (order.status === 'ready') {
          const newNotif = {
            _id: Date.now().toString(),
            title: 'Order Ready',
            message: `Order for Table ${order.tableLabels?.join(', ')} is ready to serve!`,
            type: 'success',
            createdAt: new Date(),
            read: false
          };
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      });

      newSocket.on('new_expense', (expense) => {
        const newNotif = {
          _id: Date.now().toString(),
          title: 'Expense Recorded',
          message: `New expense of ₹${expense.amount.toLocaleString()} for ${expense.category}`,
          type: 'warning',
          createdAt: new Date(),
          read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      newSocket.on('low_stock', (item) => {
        const newNotif = {
          _id: Date.now().toString(),
          title: 'Low Stock Alert',
          message: `${item.name} is low on stock (${item.quantity} ${item.unit} left)`,
          type: 'danger',
          createdAt: new Date(),
          read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      return () => newSocket.close();
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${config.API_URL}/users/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) { console.error('Error marking as read:', error); }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${config.API_URL}/users/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) { console.error('Error marking all as read:', error); }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};