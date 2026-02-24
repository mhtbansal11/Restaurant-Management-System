import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

const useExpenseNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);
  const storageKey = 'expenseReminderDismissed';

  const readDismissedMap = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const writeDismissedMap = (map) => {
    localStorage.setItem(storageKey, JSON.stringify(map));
  };

  const checkForNotifications = useCallback(async () => {
    try {
      // Check for upcoming reminders (next 3 days)
      const upcomingResponse = await axios.get(
        `${config.ENDPOINTS.EXPENSE_REMINDERS}/notifications/upcoming`
      );
      
      // Check for overdue reminders
      const overdueResponse = await axios.get(
        `${config.ENDPOINTS.EXPENSE_REMINDERS}/notifications/overdue`
      );

      const newNotifications = [
        ...upcomingResponse.data.map(reminder => ({
          ...reminder,
          type: 'upcoming',
          timestamp: new Date()
        })),
        ...overdueResponse.data.map(reminder => ({
          ...reminder,
          type: 'overdue',
          timestamp: new Date()
        }))
      ];

      // Filter out duplicates and already shown notifications
      const uniqueNotifications = newNotifications.filter(
        (notification, index, self) =>
          index === self.findIndex(n => n._id === notification._id)
      );

      const dismissedMap = readDismissedMap();
      const filteredNotifications = uniqueNotifications.filter(
        (notification) => dismissedMap[notification._id] !== String(notification.nextReminder)
      );

      setNotifications(prev => {
        const remaining = prev.filter(
          (notification) => dismissedMap[notification._id] !== String(notification.nextReminder)
        );
        const existingIds = remaining.map(n => n._id);
        const toAdd = filteredNotifications.filter(n => !existingIds.includes(n._id));
        return [...remaining, ...toAdd];
      });

      setLastChecked(new Date());

    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }, []);

  // Check every 5 minutes
  useEffect(() => {
    const interval = setInterval(checkForNotifications, 5 * 60 * 1000);
    
    // Initial check after 2 seconds (to let app load)
    const initialTimeout = setTimeout(checkForNotifications, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [checkForNotifications]);

  const dismissNotification = (notification) => {
    const dismissedMap = readDismissedMap();
    dismissedMap[notification._id] = String(notification.nextReminder);
    writeDismissedMap(dismissedMap);
    setNotifications(prev => prev.filter(n => n._id !== notification._id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationCount = () => {
    return notifications.length;
  };

  const getUrgentNotifications = () => {
    return notifications.filter(n => 
      n.type === 'overdue' || n.priority === 'high' || n.priority === 'critical'
    );
  };

  return {
    notifications,
    lastChecked,
    checkForNotifications,
    dismissNotification,
    clearAllNotifications,
    getNotificationCount,
    getUrgentNotifications
  };
};

export default useExpenseNotifications;
