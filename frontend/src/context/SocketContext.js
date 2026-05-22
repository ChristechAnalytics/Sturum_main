import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useAuthContext } from "../hooks/useAuthContext";
import API_URL from "../config";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuthContext();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const instance = io(API_URL, {
      auth: { token: user.token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = instance;
    setSocket(instance);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    instance.on("connect", onConnect);
    instance.on("disconnect", onDisconnect);
    if (instance.connected) setIsConnected(true);

    return () => {
      instance.off("connect", onConnect);
      instance.off("disconnect", onDisconnect);
      instance.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [user?.token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};
