import React from "react";
import { Link } from "react-router-dom";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useNotification } from "../context/NotificationContext";

const MainLinks = () => {
  const { notificationCount, messageCount } = useNotification();

  return (
    <nav className="flex items-center">
      <ul className="flex items-center gap-4 lg:gap-6">
        <li>
          <Link 
            to="/home" 
            className="text-neutral-700 hover:text-primary-600 transition-colors font-medium text-sm lg:text-base py-2 px-1"
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            to="/materials" 
            className="text-neutral-700 hover:text-primary-600 transition-colors font-medium text-sm lg:text-base py-2 px-1"
          >
            Materials
          </Link>
        </li>
        <li>
          <Link 
            to="/messaging" 
            className="text-neutral-700 hover:text-primary-600 transition-colors font-medium text-sm lg:text-base py-2 px-1 relative"
            aria-label={`Messaging${messageCount > 0 ? ` (${messageCount} new)` : ''}`}
          >
            Messaging
            {messageCount > 0 && (
              <span className="absolute -top-0.5 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                {messageCount > 9 ? "9+" : messageCount}
              </span>
            )}
          </Link>
        </li>
        <li>
          <Link 
            to="/mynetwork" 
            className="text-neutral-700 hover:text-primary-600 transition-colors font-medium text-sm lg:text-base py-2 px-1"
          >
            Network
          </Link>
        </li>
        <li>
          <Link 
            to="/discover" 
            className="text-neutral-700 hover:text-primary-600 transition-colors font-medium text-sm lg:text-base py-2 px-1"
          >
            Discover
          </Link>
        </li>
        <li>
          <Link 
            to="/settings" 
            className="text-neutral-700 hover:text-primary-600 transition-colors font-medium text-sm lg:text-base py-2 px-1"
          >
            Settings
          </Link>
        </li>
        <li>
          <Link 
            to="/notifications" 
            className="text-neutral-700 hover:text-primary-600 transition-colors font-medium py-2 px-1 relative"
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} new)` : ''}`}
          >
            <IoMdNotificationsOutline className="text-xl lg:text-2xl" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse border-2 border-white">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MainLinks;
