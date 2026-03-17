import React, { useState } from "react";
import { FaBars, FaTimes, FaLongArrowAltRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../assets/Sturum.png";
import ScrollLinks from "./ScrollLinks";

const Navbar = (props) => {
  const [nav, setNav] = useState(false);

  const handleClick = () => setNav(!nav);
  return (
    <header>
      <nav className="fixed z-10 w-full h-[80px] flex items-center justify-center bg-white/95 backdrop-blur-md text-black-600 border-b-2 border-primary-100 shadow-lg">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <Link className="flex items-center cursor-pointer" to="/">
                <img src={logo} alt="Sturum Logo" style={{ width: "50px" }} />
                <h1 className="font-bold pl-2 md:pr-6">STURUM</h1>
              </Link>
            </div>

            {props.currentPage === "home" ? <ScrollLinks /> : ""}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/signup">
              <button className="bg-transparent hover:bg-primary-500 text-neutral-700 font-semibold hover:text-white py-2 px-3 sm:px-4 border-2 border-primary-500 hover:border-primary-600 rounded-lg transition-all duration-300 text-sm sm:text-base">
                Sign up
              </button>
            </Link>

            <Link to="/login">
              <button className="hidden sm:flex bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-lg mr-0 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                <div className="flex content-center justify-between items-center">
                  Log in
                  <FaLongArrowAltRight className="ml-2" />
                </div>
              </button>
            </Link>
          </div>
        </div>

        {/* Hamburger */}
        <button
          onClick={handleClick}
          className="md:hidden z-20 p-2 focus:outline-none"
          aria-label="Toggle menu"
        >
          {!nav ? (
            <FaBars className="text-2xl text-gray-800" />
          ) : (
            <FaTimes className="text-2xl text-gray-800" />
          )}
        </button>

        {/* Mobile menu */}
        <div
          className={
            !nav
              ? "hidden"
              : `fixed inset-0 z-10 bg-white/98 backdrop-blur-md`
          }
          onClick={handleClick}
        >
          <ul className="w-full h-screen flex flex-col items-center justify-center font-semibold space-y-8">
            <li>
              <Link
                onClick={handleClick}
                to="/"
                className="text-3xl sm:text-4xl text-neutral-700 hover:text-primary-600 transition-colors duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                onClick={handleClick}
                to="/signup"
                className="text-3xl sm:text-4xl text-neutral-700 hover:text-primary-600 transition-colors duration-300"
              >
                Sign up
              </Link>
            </li>
            <li>
              <Link
                onClick={handleClick}
                to="/login"
                className="text-3xl sm:text-4xl text-neutral-700 hover:text-primary-600 transition-colors duration-300"
              >
                Log in
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
