import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "../DEPT-components/Header";
import NavbarMP from "../DEPT-components/NavbarMP";
import { useAuthContext } from "../hooks/useAuthContext";
import API_URL from "../config";
import { PAGE_BG } from "../theme/classes";
import { useNotification } from "../context/NotificationContext";
import { useSocket } from "../context/SocketContext";
import {
  toIdString,
  messageBelongsToChat,
  appendMessage,
} from "../utils/messageIds";

const Messaging = () => {
  const { user } = useAuthContext();
  const { clearMessageNotifications } = useNotification();
  const [connections, setConnections] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const { socket } = useSocket();
  const currentChatRef = useRef(currentChat);
  const isSendingRef = useRef(false);
  const messagesEndRef = useRef(null);

  const currentUserId = user?._id || user?.userId;

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  useEffect(() => {
    clearMessageNotifications();
  }, [clearMessageNotifications]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/connections`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (!response.ok) throw new Error(`Failed to fetch connections`);
        const data = await response.json();
        setConnections(data.connections);
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };

    if (user?.token) fetchConnections();
  }, [user]);

  useEffect(() => {
    if (!currentChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/messages/${currentChat}`,
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );
        if (!response.ok) throw new Error(`Failed to fetch messages`);
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [currentChat, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessageToChat = useCallback(
    (message) => {
      const partnerId = currentChatRef.current;
      if (!messageBelongsToChat(message, currentUserId, partnerId)) return;

      setMessages((prev) => appendMessage(prev, message));
    },
    [currentUserId]
  );

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      addMessageToChat(message);
    };

    socket.on("new_message", handleNewMessage);
    return () => socket.off("new_message", handleNewMessage);
  }, [socket, addMessageToChat]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentChat || isSendingRef.current) return;

    isSendingRef.current = true;
    const textToSend = messageText.trim();
    setMessageText("");

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          receiverId: currentChat,
          text: textToSend,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const savedMessage = await response.json();
      addMessageToChat(savedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessageText(textToSend);
    } finally {
      isSendingRef.current = false;
    }
  };

  const renderMessage = (message) => {
    const isOwnMessage =
      toIdString(message.senderId ?? message.sender) ===
      toIdString(currentUserId);

    return (
      <div
        key={message._id}
        className={`p-3 mb-3 rounded-lg shadow-sm ${
          isOwnMessage
            ? "bg-primary-600 text-white ml-auto"
            : "bg-neutral-200 text-neutral-800"
        }`}
        style={{ maxWidth: "75%" }}
      >
        {!isOwnMessage && (
          <p className="text-sm font-semibold mb-1 opacity-80">
            {message.senderId?.name || message.sender?.name || "Other"}
          </p>
        )}
        <p className="break-words">{message.text}</p>
        <p
          className={`text-xs mt-1 ${
            isOwnMessage ? "text-primary-100" : "text-neutral-500"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    );
  };

  const selectChat = (connectionId) => {
    setCurrentChat(toIdString(connectionId));
  };

  const chatPartner = connections.find(
    (c) => toIdString(c._id) === toIdString(currentChat)
  );

  return (
    <div className={`${PAGE_BG} flex flex-col`}>
      <Header />
      <NavbarMP />
      <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] flex flex-1 h-[calc(100vh-7rem)] sm:h-[calc(100vh-7.125rem)] md:h-[calc(100vh-8rem)]">
        <div className="w-full max-w-7xl mx-auto flex flex-1">
          <div className="w-full sm:w-1/3 md:w-1/4 bg-white dark:bg-neutral-800 border-r border-neutral-300 dark:border-neutral-700 p-4 overflow-y-auto shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-neutral-800 dark:text-neutral-100">Connections</h2>
            {connections.length > 0 ? (
              connections.map((connection) => (
                <div
                  key={connection._id}
                  onClick={() => selectChat(connection._id)}
                  className={`cursor-pointer p-3 hover:bg-primary-50 dark:hover:bg-neutral-700 rounded-lg mb-2 transition-all duration-300 border-2 ${
                    toIdString(currentChat) === toIdString(connection._id)
                      ? "bg-primary-100 dark:bg-primary-900/40 border-primary-400"
                      : "border-transparent hover:border-primary-200 dark:hover:border-neutral-600"
                  }`}
                >
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">{connection.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{connection.email}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500">No connections found</p>
                <p className="text-sm text-neutral-400 mt-2">
                  Connect with users to start messaging
                </p>
              </div>
            )}
          </div>

          <div className="hidden sm:flex w-2/3 md:w-3/4 p-4 flex-col">
            {currentChat ? (
              <div className="bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg flex flex-col h-full">
                <div className="p-4 border-b-2 border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-primary-50 to-white dark:from-neutral-800 dark:to-neutral-900">
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                    {chatPartner?.name || "Chat"}
                  </h2>
                </div>
                <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
                  {messages.length > 0 ? (
                    <>
                      {messages.map(renderMessage)}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <p className="text-neutral-500">No messages yet</p>
                  )}
                </div>
                <div className="p-4 border-t-2 border-neutral-200 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-grow border-2 border-neutral-300 rounded-lg px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-neutral-500 text-lg mb-2">
                    Select a connection to start chatting
                  </p>
                  <p className="text-neutral-400 text-sm">
                    Choose someone from the sidebar to begin
                  </p>
                </div>
              </div>
            )}
          </div>

          {currentChat && (
            <div className="sm:hidden fixed inset-0 z-20 bg-white pt-[7rem] flex flex-col">
              <div className="p-4 border-b-2 border-neutral-200 bg-white">
                <button
                  onClick={() => setCurrentChat(null)}
                  className="mb-2 text-neutral-600 hover:text-neutral-800"
                >
                  ← Back
                </button>
                <h2 className="text-xl font-bold text-neutral-800">
                  {chatPartner?.name || "Chat"}
                </h2>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.length > 0 ? (
                  <>
                    {messages.map(renderMessage)}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <p className="text-neutral-500 text-center">No messages yet</p>
                )}
              </div>
              <div className="p-4 border-t-2 border-neutral-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-grow border-2 border-neutral-300 rounded-lg px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 text-white rounded-lg px-6 py-3 font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
