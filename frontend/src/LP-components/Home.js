import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const Home = () => {
  return (
    <div>
      <Navbar currentPage="home" />
      <div
        name="home"
        className="w-full min-h-screen md:px-8 md:pt-8 bg-gradient-to-br from-primary-50 via-primary-100 to-accent-100 text-xl"
      >
        <div className="max-w-[1000px] mx-auto px-4 sm:px-8 md:px-16 flex flex-col justify-center min-h-screen py-20 md:py-0">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-clip-text text-transparent leading-tight mb-4">
            Connect with your fellow course mates
          </h1>
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-700 mb-6">
            In need of study materials? <br className="hidden sm:block" /> Sturum is here for you
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 py-4 max-w-[700px] mb-8 leading-relaxed">
            A platform to share your experiences and view your course mates
            experiences in your field of study through posts
          </p>
          <div>
            <Link to="/signup">
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105">
                Create an account
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
