import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import logo from "../assets/Sturum.png";

const scrollProps = { smooth: true, offset: -70, duration: 500 };

const Footer = () => {
  const contactEmail = process.env.REACT_APP_CONTACT_EMAIL;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 w-full border-t border-neutral-700">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <RouterLink to="/" className="inline-flex items-center group">
              <img src={logo} alt="" className="w-12 h-12" aria-hidden />
              <span className="font-bold text-lg text-white pl-2 group-hover:text-primary-300 transition-colors">
                Sturum
              </span>
            </RouterLink>
            <p className="mt-4 text-neutral-400 text-sm leading-relaxed max-w-md">
              Your department&apos;s home base — find coursemates, share study materials, and stay
              connected without the noise of the open internet.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Product
            </h2>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <ScrollLink to="home" {...scrollProps} className="hover:text-primary-400 transition-colors cursor-pointer">
                  Home
                </ScrollLink>
              </li>
              <li>
                <ScrollLink to="about" {...scrollProps} className="hover:text-primary-400 transition-colors cursor-pointer">
                  About
                </ScrollLink>
              </li>
              <li>
                <ScrollLink to="features" {...scrollProps} className="hover:text-primary-400 transition-colors cursor-pointer">
                  Features
                </ScrollLink>
              </li>
              <li>
                <RouterLink to="/signup" className="hover:text-primary-400 transition-colors">
                  Sign up
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/login" className="hover:text-primary-400 transition-colors">
                  Log in
                </RouterLink>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Legal & support
            </h2>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <RouterLink to="/privacy" className="hover:text-primary-400 transition-colors">
                  Privacy policy
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/terms" className="hover:text-primary-400 transition-colors">
                  Terms of service
                </RouterLink>
              </li>
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-primary-400 transition-colors"
                  >
                    Contact us
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-neutral-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            © {year} Sturum. All rights reserved.
          </p>
          <p className="text-neutral-600 text-xs">
            Built for university students · Department-scoped communities
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
