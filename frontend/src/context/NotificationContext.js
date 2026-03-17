import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotificationCount = async () => {
    if (!user?.token) {
      setNotificationCount(0);
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/users/me", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const count = userData.friendRequests?.length || 0;
        setNotificationCount(count);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchNotificationCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotificationCount();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setNotificationCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const clearNotifications = () => {
    setNotificationCount(0);
  };

  const updateNotificationCount = (count) => {
    setNotificationCount(count);
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationCount,
        fetchNotificationCount,
        clearNotifications,
        updateNotificationCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
