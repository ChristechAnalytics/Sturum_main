import React, { useState, useEffect } from "react";
import { FaBars, FaTimes, FaLongArrowAltRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../assets/Sturum.png";
import ScrollLinks from "./ScrollLinks";
import ThemeToggle from "../components/ThemeToggle";
import { NAV_BAR, MOBILE_MENU_ITEM, MOBILE_MENU_PANEL } from "../theme/classes";

const Navbar = ({ currentPage }) => {
  const [nav, setNav] = useState(false);
  const isLanding = currentPage === "home";

  const closeNav = () => setNav(false);
  const toggleNav = () => setNav((open) => !open);

  useEffect(() => {
    if (nav) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [nav]);

  const mobileMenuCtaClass =
    "block w-full min-w-[240px] max-w-xs text-center py-4 px-8 text-xl sm:text-2xl font-bold text-white rounded-xl bg-primary-600 border-2 border-primary-600 hover:bg-primary-700 hover:border-primary-700 transition-colors shadow-md";

  return (
    <header className="w-full">
      <nav className={`fixed z-30 w-full h-[80px] ${NAV_BAR}`}>
        <div className="w-full max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="h-full flex items-center justify-between gap-4">
            <div className="flex items-center min-w-0">
              <Link
                to="/"
                className="flex items-center shrink-0 hover:opacity-80 transition-opacity"
                onClick={closeNav}
              >
                <img
                  src={logo}
                  alt="Sturum Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
                <h1 className="font-bold pl-2 text-neutral-800 dark:text-neutral-100">STURUM</h1>
              </Link>
              {isLanding && <ScrollLinks variant="desktop" />}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-3">
                <Link to="/signup">
                  <button
                    type="button"
                    className="bg-transparent hover:bg-primary-500 text-neutral-700 dark:text-neutral-200 font-semibold hover:text-white py-2 px-4 border-2 border-primary-500 dark:border-primary-500 hover:border-primary-600 rounded-lg transition-all duration-300"
                  >
                    Sign up
                  </button>
                </Link>
                <Link to="/login">
                  <button
                    type="button"
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <span className="flex items-center">
                      Log in
                      <FaLongArrowAltRight className="ml-2" />
                    </span>
                  </button>
                </Link>
              </div>

              <ThemeToggle variant="icon" className="hidden md:flex" />

              <button
                type="button"
                onClick={toggleNav}
                className="md:hidden p-2 text-neutral-800 dark:text-neutral-100 hover:text-primary-600 transition-colors"
                aria-label={nav ? "Close menu" : "Open menu"}
                aria-expanded={nav}
              >
                {nav ? (
                  <FaTimes className="text-2xl" />
                ) : (
                  <FaBars className="text-2xl" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {nav && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <button
            type="button"
            className="absolute inset-0 bg-neutral-900/70"
            onClick={closeNav}
            aria-label="Close menu"
          />

          <div
            className={`relative z-50 flex h-full w-full flex-col ${MOBILE_MENU_PANEL} pt-24 pb-10 px-6 overflow-y-auto shadow-2xl`}
          >
            <button
              type="button"
              onClick={closeNav}
              className="absolute top-5 right-5 p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-600 shadow-md hover:bg-primary-50 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Close menu"
            >
              <FaTimes className="text-2xl text-neutral-900 dark:text-neutral-100" />
            </button>

            <div className="flex justify-center mb-6 md:hidden">
              <ThemeToggle />
            </div>

            <ul className="flex flex-col items-center justify-center flex-1 gap-4 sm:gap-5 w-full">
              {isLanding ? (
                <ScrollLinks
                  variant="mobile"
                  onItemClick={closeNav}
                  itemClassName={MOBILE_MENU_ITEM}
                />
              ) : (
                <li className="w-full flex justify-center">
                  <Link to="/" onClick={closeNav} className={MOBILE_MENU_ITEM}>
                    Home
                  </Link>
                </li>
              )}
              <li className="w-full flex justify-center">
                <Link to="/signup" onClick={closeNav} className={MOBILE_MENU_ITEM}>
                  Sign up
                </Link>
              </li>
              <li className="w-full flex justify-center">
                <Link to="/login" onClick={closeNav} className={mobileMenuCtaClass}>
                  Log in
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
