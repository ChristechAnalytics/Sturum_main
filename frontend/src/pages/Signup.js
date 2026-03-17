import React, { useState } from "react";
import Navbar from "../LP-components/Navbar";
import { Link } from "react-router-dom";
import { useSignup } from "../hooks/useSignup";

const Signup = () => {
  const [department, setDepartment] = useState(
    "Meteorology and Climate Change"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const { signup, error, isLoading, successMessage } = useSignup();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that contact and academicLevel are filled
    if (!contact || contact.trim() === "") {
      alert("Please enter your contact number");
      return;
    }
    if (!academicLevel || academicLevel === "") {
      alert("Please select your academic level");
      return;
    }

    await signup(department, name, email, password, contact, academicLevel);
  };

  return (
    <div>
      <Navbar currentPage="signup" />
      <div className="pt-[4.5rem]">
        {successMessage ? (
          <div className="mx-auto w-fit px-8 py-3 text-primary-700 border-2 border-primary-300 bg-primary-50 mt-5 rounded-lg shadow-md">
            {"You have successfully signed up"}
          </div>
        ) : (
          ""
        )}

        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4 py-8">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[500px] h-fit bg-white shadow-xl rounded-2xl my-[2rem] py-8 px-6 sm:px-8 pb-8 border border-gray-200"
          >
            <h1 className="text-3xl font-bold text-center text-[#424242] pb-6 mb-6">
              Create Your Account
            </h1>

            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Department:
            </label>
            <select
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
              autoComplete="off"
              id="department"
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="Meteorology and Climate Change">
                Meteorology and Climate Change
              </option>
              <option value="Marine Geology">Marine Geology</option>
              <option value="Marine Environmental and Pollution">
                Marine Environmental and Pollution
              </option>
              <option value="Marine Transport and Logistics">
                Marine Transport and Logistics
              </option>
              <option value="Fisheries and Aquaculture">
                Fisheries and Aquaculture
              </option>
              <option value="Marine Economics and Finance">
                Marine Economics and Finance
              </option>
              <option value="Port Management">Port Management</option>
            </select>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name:
              </label>
              <input
                value={name}
                autoComplete="name"
                id="name"
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                required
                minLength={2}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email:
              </label>
              <input
                value={email}
                autoComplete="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number:
              </label>
              <input
                value={contact}
                autoComplete="tel"
                id="contact"
                onChange={(e) => setContact(e.target.value)}
                type="tel"
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                required
                placeholder="e.g., 1234567890"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="academicLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Academic Level:
              </label>
              <select
                value={academicLevel}
                id="academicLevel"
                onChange={(e) => setAcademicLevel(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                required
              >
                <option value="">Select Academic Level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
                <option value="graduate">Graduate</option>
              </select>
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password:
              </label>
              <input
                value={password}
                autoComplete="new-password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg mx-0 w-full mt-2 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {isLoading ? "Creating Account..." : "Sign up"}
            </button>

            {error && (
              <div className="text-red-600 border-2 border-red-300 p-3 bg-red-50 mt-5 rounded-lg text-sm">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            <p className="mt-5">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold ml-2 hover:text-primary-600 cursor-pointer text-primary-600"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
