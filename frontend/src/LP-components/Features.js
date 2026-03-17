import React from "react";
import { MdOutlineConnectWithoutContact, MdPostAdd } from "react-icons/md";
import { LiaSchoolSolid } from "react-icons/lia";
import { GoCommentDiscussion } from "react-icons/go";

const Features = () => {
  return (
    <div name="features" className="w-full h-fit bg-gradient-to-b from-primary-50 to-white py-[6rem]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Features
          </p>
          <p className="text-xl md:text-2xl pt-4 text-neutral-600">Explore what else we can do for you</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
        <div className="flex flex-col justify-center items-center px-6 py-8 card bg-white border-2 border-primary-100 hover:border-primary-300 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="bg-primary-100 p-4 rounded-full mb-4">
            <MdOutlineConnectWithoutContact className="text-5xl text-primary-600" />
          </div>
          <div className="text-center pt-4">
            <p className="font-bold text-xl text-neutral-800 mb-3">Connect with coursemates</p>
            <p className="text-base text-neutral-600 leading-relaxed">
              Have easy access to your coursemates irrespective of their levels.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center px-6 py-8 card bg-white border-2 border-primary-100 hover:border-primary-300 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="bg-primary-100 p-4 rounded-full mb-4">
            <LiaSchoolSolid className="text-5xl text-primary-600" />
          </div>
          <div className="text-center pt-4">
            <p className="font-bold text-xl text-neutral-800 mb-3">Access to study materials</p>
            <p className="text-base text-neutral-600 leading-relaxed">
              Have easy access to in-demand study materials uploaded by your
              coursemates
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center px-6 py-8 card bg-white border-2 border-primary-100 hover:border-primary-300 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="bg-primary-100 p-4 rounded-full mb-4">
            <MdPostAdd className="text-5xl text-primary-600" />
          </div>
          <div className="text-center pt-4">
            <p className="font-bold text-xl text-neutral-800 mb-3">View and post contents</p>
            <p className="text-base text-neutral-600 leading-relaxed">
              Share your thoughts related to your field of study through posts
              as well as view coursemate posts
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center px-6 py-8 card bg-white border-2 border-primary-100 hover:border-primary-300 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="bg-primary-100 p-4 rounded-full mb-4">
            <GoCommentDiscussion className="text-5xl text-primary-600" />
          </div>
          <div className="text-center pt-4">
            <p className="font-bold text-xl text-neutral-800 mb-3">Start a topic</p>
            <p className="text-base text-neutral-600 leading-relaxed">
              Start an open discussion on a topic with your fellow coursemates
              to share insights
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Features;
