import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useSocket } from "./SocketContext";
import API_URL from "../config";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuthContext();
  const { socket } = useSocket();
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  const fetchNotificationCount = async () => {
    if (!user?.token) {
      setNotificationCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setNotificationCount(userData.friendRequests?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  useEffect(() => {
    if (!user?.token) {
      setNotificationCount(0);
      setMessageCount(0);
      return;
    }

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (payload) => {
      if (payload.type === "friend_request") {
        setNotificationCount(payload.count ?? 0);
        fetchNotificationCount();
      }
      if (payload.type === "message") {
        setMessageCount((prev) => prev + 1);
      }
    };

    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const clearNotifications = () => {
    setNotificationCount(0);
  };

  const clearMessageNotifications = () => {
    setMessageCount(0);
  };

  const updateNotificationCount = (count) => {
    setNotificationCount(count);
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationCount,
        messageCount,
        fetchNotificationCount,
        clearNotifications,
        clearMessageNotifications,
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
