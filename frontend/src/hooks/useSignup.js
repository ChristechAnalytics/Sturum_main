import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const signup = async (department, name, email, password, contact, academicLevel) => {
    setIsLoading(true);
    setError(null);

    // Validate required fields before sending
    if (!contact || !academicLevel) {
      setIsLoading(false);
      setError("Contact number and academic level are required");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          department, 
          name, 
          email, 
          password, 
          contact: contact.trim(), 
          academicLevel: academicLevel.trim() 
        }),
      });

      if (!response.ok) {
        const json = await response.json();
        setIsLoading(false);
        setError(json.error || json.message || "Failed to sign up. Please try again.");
        return;
      }

      const json = await response.json();

      // save user to local storage
      localStorage.setItem("user", JSON.stringify(json));

      // update AuthContext
      dispatch({ type: "LOGIN", payload: json });
      setIsLoading(false);

      setSuccessMessage(
        json.message ||
          (json.emailSent
            ? "Account created. Check your email to verify your address."
            : "Account created.")
      );

      setTimeout(() => navigate("/home"), 3500);
    } catch (error) {
      setIsLoading(false);
      console.error("Signup error:", error);
      
      if (error.message === "Failed to fetch" || error.name === "TypeError") {
        setError("Cannot connect to server. Please check your connection and try again.");
      } else {
        setError(error.message || "An unexpected error occurred. Please try again.");
      }
    }
  };

  return { signup, isLoading, error, successMessage };
};
