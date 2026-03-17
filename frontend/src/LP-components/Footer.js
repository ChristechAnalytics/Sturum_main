import React from "react";
import { Link } from "react-scroll";
import logo from "../assets/Sturum.png";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 w-full h-fit py-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <Link
              className="flex items-center cursor-pointer text-neutral-400 hover:text-primary-400 text-md transition-colors"
              to="home"
              smooth={true}
              offset={50}
              duration={500}
            >
              <img src={logo} alt="Sturum Logo" style={{ width: "50px" }} />
              <h1 className="font-bold pl-2">STURUM</h1>
            </Link>
          </div>
          <div className="flex text-2xl w-[9rem] justify-between">
              <FaFacebook className="text-neutral-400 hover:text-primary-400 transition-colors cursor-pointer" />
              <FaTwitter className="text-neutral-400 hover:text-primary-400 transition-colors cursor-pointer" />
              <FaInstagram className="text-neutral-400 hover:text-primary-400 transition-colors cursor-pointer" />
          </div>
        </div>
        <div className="pt-9 md:flex md:justify-between items-center">
          <ul className="flex md:justify-start justify-start items-center font-semibold text-[1rem] text-neutral-400">
            <li className="px-0">
              <Link to="home" smooth={true} offset={50} duration={500} className="hover:text-primary-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="about" smooth={true} offset={50} duration={500} className="hover:text-primary-400 transition-colors">
                About
              </Link>
            </li>
            <li className="px-0">
              <Link to="features" smooth={true} offset={50} duration={500} className="hover:text-primary-400 transition-colors">
                Features
              </Link>
            </li>
          </ul>
          <p className="text-center md:pt-0 pt-[4rem] text-neutral-500 text-md">
            Copyright 2023-2024 @ Sturum LLC
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
