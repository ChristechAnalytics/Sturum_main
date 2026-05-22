import React, { useState } from "react";
import Navbar from "../LP-components/Navbar";
import { Link } from "react-router-dom";
import { useSignup } from "../hooks/useSignup";
import DepartmentPicker from "../components/DepartmentPicker";
import { FORM_CARD } from "../theme/classes";
import {
  isValidEmail,
  normalizeEmail,
  passwordsMatch,
  getPasswordHint,
} from "../utils/validation";

const inputClass = (hasError) =>
  `w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 transition-all ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900"
      : "border-neutral-300 dark:border-neutral-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-200 dark:focus:ring-primary-900"
  }`;

const Signup = () => {
  const [department, setDepartment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { signup, error, isLoading, successMessage } = useSignup();

  const validateForm = () => {
    const errors = {};

    if (!department) errors.department = "Please select your department";
    if (!name.trim() || name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters)";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      errors.email = "Enter a valid email address (e.g. name@school.edu)";
    }

    if (!contact.trim()) {
      errors.contact = "Contact number is required";
    } else if (!/^\d{7,15}$/.test(contact.trim())) {
      errors.contact = "Enter a valid phone number (7–15 digits)";
    }

    if (!academicLevel) errors.academicLevel = "Select your academic level";

    if (!password) {
      errors.password = "Password is required";
    } else {
      const hint = getPasswordHint(password);
      if (hint) errors.password = hint;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (!passwordsMatch(password, confirmPassword)) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    await signup(
      department,
      name.trim(),
      normalizeEmail(email),
      password,
      contact.trim(),
      academicLevel
    );
  };

  const emailLooksValid = email.trim() && isValidEmail(email);
  const passwordsOk = passwordsMatch(password, confirmPassword);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <Navbar currentPage="signup" />
      <div className="pt-[4.5rem]">
        {successMessage ? (
          <div className="mx-auto max-w-lg px-8 py-4 text-primary-800 border-2 border-primary-300 bg-primary-50 mt-5 rounded-lg shadow-md text-center">
            <p className="font-semibold">Account created</p>
            <p className="text-sm mt-1">{successMessage}</p>
            <p className="text-xs text-primary-600 mt-2">Taking you to your feed…</p>
          </div>
        ) : null}

        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4 py-8">
          <form
            onSubmit={handleSubmit}
            noValidate
            className={`w-full max-w-[500px] h-fit ${FORM_CARD} my-[2rem] py-8 px-6 sm:px-8 pb-8`}
          >
            <h1 className="text-3xl font-bold text-center text-[#424242] pb-6 mb-6">
              Create Your Account
            </h1>

            <DepartmentPicker
              value={department}
              onChange={(val) => {
                setDepartment(val);
                setFieldErrors((prev) => ({ ...prev, department: undefined }));
              }}
              required
            />
            {fieldErrors.department && (
              <p className="text-sm text-red-600 -mt-2 mb-3">{fieldErrors.department}</p>
            )}

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                value={name}
                autoComplete="name"
                id="name"
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                type="text"
                className={inputClass(fieldErrors.name)}
                required
                minLength={2}
              />
              {fieldErrors.name && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                value={email}
                autoComplete="email"
                id="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                onBlur={() => {
                  if (email.trim() && !isValidEmail(email)) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      email: "Enter a valid email address",
                    }));
                  }
                }}
                type="email"
                className={inputClass(fieldErrors.email)}
                required
                placeholder="you@university.edu"
              />
              {fieldErrors.email ? (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              ) : emailLooksValid ? (
                <p className="text-sm text-green-600 mt-1">Valid email format</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Use a real email you can access (student or personal)
                </p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <input
                value={contact}
                autoComplete="tel"
                id="contact"
                onChange={(e) => {
                  setContact(e.target.value.replace(/\D/g, ""));
                  setFieldErrors((prev) => ({ ...prev, contact: undefined }));
                }}
                type="tel"
                inputMode="numeric"
                className={inputClass(fieldErrors.contact)}
                required
                placeholder="e.g. 08012345678"
              />
              {fieldErrors.contact && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.contact}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="academicLevel"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Academic Level
              </label>
              <select
                value={academicLevel}
                id="academicLevel"
                onChange={(e) => {
                  setAcademicLevel(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, academicLevel: undefined }));
                }}
                className={inputClass(fieldErrors.academicLevel)}
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
              {fieldErrors.academicLevel && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.academicLevel}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                value={password}
                autoComplete="new-password"
                id="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({
                    ...prev,
                    password: undefined,
                    confirmPassword: undefined,
                  }));
                }}
                type="password"
                className={inputClass(fieldErrors.password)}
                required
                minLength={8}
              />
              {fieldErrors.password ? (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  At least 8 characters with uppercase, lowercase, number, and symbol
                </p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                value={confirmPassword}
                autoComplete="new-password"
                id="confirmPassword"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                type="password"
                className={inputClass(fieldErrors.confirmPassword)}
                required
                minLength={8}
              />
              {fieldErrors.confirmPassword ? (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
              ) : confirmPassword && passwordsOk ? (
                <p className="text-sm text-green-600 mt-1">Passwords match</p>
              ) : confirmPassword ? (
                <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
              ) : null}
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg mx-0 w-full mt-2 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {isLoading ? "Creating account…" : "Sign up"}
            </button>
            {isLoading && (
              <p className="text-xs text-neutral-500 text-center mt-2">
                First request after idle may take up to a minute on free hosting.
              </p>
            )}

            {error && (
              <div className="text-red-600 border-2 border-red-300 p-3 bg-red-50 mt-5 rounded-lg text-sm">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            )}

            <p className="mt-5 text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold hover:text-primary-600 text-primary-600"
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
