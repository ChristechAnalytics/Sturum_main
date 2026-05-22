import React from "react";
import AboutSturum from "../assets/AboutSturum.jpg";

const About = () => {
  return (
    <div name="about" className="bg-gradient-to-b from-white to-primary-50 dark:from-neutral-950 dark:to-neutral-900 w-full h-fit pt-[5rem] pb-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-neutral-800 p-8 md:p-12 rounded-2xl shadow-xl border border-transparent dark:border-neutral-700">
        <p className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-4">
          About
        </p>
        <div className="lg:flex lg:h-full md:mx-10 block shadow-2xl rounded-2xl overflow-hidden my-8">
          <div className="lg:w-[50%] w-[100%] bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden">
            <img className="h-full w-full object-cover" src={AboutSturum} alt="About Sturum" />
          </div>
          <div className="flex flex-col justify-center items-center lg:w-[50%] w-[100%] bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-800 dark:to-neutral-900 py-12 px-8 md:px-16 text-center">
            <p className="text-neutral-800 dark:text-neutral-100 text-3xl md:text-4xl font-bold pb-6">
              What is the purpose of Sturum?
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-8 text-lg md:text-xl">
              Sturum is a platform that performs the functionality of a BLOG as well as a FORUM for all students across
              the world. This platform helps you to connect with students in
              your field of study. It gives you the opportunity to post and view
              any content relating to your field of study, as well as providing
              in-demand study materials relevant to your field.
              <br />
              <span className="font-bold text-primary-600 text-xl">Sturum is the best.</span>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default About;
