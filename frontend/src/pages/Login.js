import React, { useState } from "react";
import Navbar from "../LP-components/Navbar";
import { Link } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { FORM_CARD, INPUT } from "../theme/classes";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await login(email, password);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <Navbar currentPage="login" />
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4 py-8 pt-[5.2rem]">
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-[500px] h-fit ${FORM_CARD} my-[2rem] py-8 px-6 sm:px-8 pb-8`}
        >
          <h1 className="text-3xl font-bold text-center text-neutral-800 dark:text-neutral-100 pb-6 mb-6">
            Welcome Back
          </h1>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Email:
            </label>
            <input
              value={email}
              autoComplete="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className={INPUT}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Password:
            </label>
            <input
              value={password}
              autoComplete="current-password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className={INPUT}
              required
            />
          </div>
          <button
            disabled={isLoading}
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg mx-0 w-full mt-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>

          {error && (
            <div className="text-red-600 border-2 border-red-300 p-3 bg-red-50 mt-5 rounded-lg text-sm">
              {error}
            </div>
          )}

          <p className="mt-5">
            You don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold ml-2 hover:text-primary-600 cursor-pointer text-primary-600"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
