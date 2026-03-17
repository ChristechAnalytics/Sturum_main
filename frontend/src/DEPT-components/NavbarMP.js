import React, { useState, useEffect } from "react";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { Link } from "react-router-dom";
import logo from "../assets/Sturum.png";
import MainLinks from "./MainLinks";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

const NavbarMP = ({ onSearch }) => {
  const [nav, setNav] = useState(false);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { notificationCount } = useNotification();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (nav) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [nav]);

  function handleClick() {
    return setNav(!nav);
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);

    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  return (
    <header className="w-full">
      <div className="flex flex-col">
        {/* Calculate top position based on header height: ~2.5rem (40px) on mobile, ~3rem (48px) on larger screens */}
        <nav className="fixed z-20 w-full h-[60px] sm:h-[70px] md:h-[80px] bg-white/95 backdrop-blur-md border-b-2 border-primary-100 shadow-lg top-[2.5rem] sm:top-[2.75rem] md:top-[3rem]">
          <div className="w-full max-w-7xl mx-auto h-full px-4 sm:px-6 md:px-8">
            <div className="h-full flex items-center justify-between">
              {/* Left: Logo */}
              <div className="flex items-center flex-shrink-0">
                <Link 
                  to="/home" 
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <img 
                    src={logo} 
                    alt="Sturum Logo" 
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" 
                  />
                  <h1 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-neutral-800 sm:block">
                    STURUM
                  </h1>
                </Link>
              </div>

              {/* Center: Navigation Links (Desktop only) */}
              <div className="hidden md:flex items-center justify-center flex-1 px-4">
                <MainLinks />
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
                {/* Search Button */}
                <button
                  onClick={() => setSearchVisible(!searchVisible)}
                  className="p-2 text-neutral-700 hover:text-primary-600 transition-colors"
                  aria-label="Search"
                >
                  <FaSearch className="text-lg sm:text-xl" />
                </button>

                {/* Logout Button (Desktop only) */}
                <button
                  onClick={handleLogout}
                  className="hidden md:block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
                >
                  Log out
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={handleClick}
                  className="md:hidden p-2 text-neutral-800 hover:text-primary-600 transition-colors"
                  aria-label="Toggle menu"
                >
                  {nav ? (
                    <FaTimes className="text-xl" />
                  ) : (
                    <FaBars className="text-xl" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile menu overlay - moved outside nav to avoid z-index conflicts */}
        {nav && (
          <div
            className="fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm"
            onClick={handleClick}
          >
            {/* Close button */}
            <button
              onClick={handleClick}
              className="absolute top-4 right-4 z-[60] p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
              aria-label="Close menu"
            >
              <FaTimes className="text-2xl text-neutral-800" />
            </button>

            {/* Menu content */}
            <div
              className="w-full h-screen bg-white/98 backdrop-blur-md flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="w-full flex flex-col items-center justify-center font-semibold space-y-6 sm:space-y-8 px-4">
              <li>
                <Link
                  onClick={handleClick}
                  to="/home"
                  className="text-xl sm:text-2xl md:text-3xl text-neutral-400 hover:text-primary-600 transition-colors duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  onClick={handleClick}
                  to="/materials"
                  className="text-xl sm:text-2xl md:text-3xl text-neutral-400 hover:text-primary-600 transition-colors duration-300"
                >
                  Materials
                </Link>
              </li>
              <li>
                <Link
                  onClick={handleClick}
                  to="/messaging"
                  className="text-xl sm:text-2xl md:text-3xl text-neutral-400 hover:text-primary-600 transition-colors duration-300"
                >
                  Messaging
                </Link>
              </li>
              <li>
                <Link
                  onClick={handleClick}
                  to="/mynetwork"
                  className="text-xl sm:text-2xl md:text-3xl text-neutral-400 hover:text-primary-600 transition-colors duration-300"
                >
                  Network
                </Link>
              </li>
              <li>
                <Link
                  onClick={handleClick}
                  to="/discover"
                  className="text-xl sm:text-2xl md:text-3xl text-neutral-400 hover:text-primary-600 transition-colors duration-300"
                >
                  Discover
                </Link>
              </li>
              <li>
                <Link
                  onClick={handleClick}
                  to="/settings"
                  className="text-xl sm:text-2xl md:text-3xl text-neutral-400 hover:text-primary-600 transition-colors duration-300"
                >
                  Settings
                </Link>
              </li>
              <li className="relative">
                <Link
                  onClick={handleClick}
                  to="/notifications"
                  className="text-xl sm:text-2xl md:text-3xl text-neutral-400 hover:text-primary-600 transition-colors duration-300 relative inline-flex items-center gap-2"
                  aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} new)` : ''}`}
                >
                  <div className="relative">
                    <IoMdNotificationsOutline />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse border-2 border-white">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </div>
                  <span>Notifications</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleLogout();
                    handleClick();
                  }}
                  className="text-xl sm:text-2xl md:text-3xl text-neutral-700 hover:text-red-500 transition-colors duration-300 bg-red-50 hover:bg-red-100 px-6 py-2 rounded-lg"
                >
                  Log out
                </button>
              </li>
            </ul>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {searchVisible && (
          <div className="fixed z-20 w-full bg-white border-b-2 border-primary-100 shadow-lg top-[calc(2.5rem+60px)] sm:top-[calc(2.75rem+70px)] md:top-[calc(3rem+80px)]">
            <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center py-2 sm:py-3"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search posts, materials, users..."
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-neutral-300 rounded-l-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-r-lg transition-colors flex-shrink-0"
                  aria-label="Submit search"
                >
                  <FaSearch className="text-sm sm:text-base" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavbarMP;
