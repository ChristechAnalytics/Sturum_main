import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";
import { apiFetch, parseJsonResponse } from "../utils/apiFetch";

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const signup = async (department, name, email, password, contact, academicLevel) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!contact || !academicLevel) {
      setIsLoading(false);
      setError("Contact number and academic level are required");
      return;
    }

    try {
      const response = await apiFetch(`${API_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department,
          name,
          email,
          password,
          contact: contact.trim(),
          academicLevel: academicLevel.trim(),
        }),
      });

      const json = await parseJsonResponse(response);

      if (!response.ok) {
        setError(json.error || json.message || "Failed to sign up. Please try again.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(json));
      dispatch({ type: "LOGIN", payload: json });

      const parts = [json.message || "Account created."];
      if (json.emailSent) {
        parts.push("If you do not see it in a few minutes, check spam or junk.");
      } else if (json.emailWarning) {
        parts.push(json.emailWarning);
      }
      setSuccessMessage(parts.join(" "));

      setTimeout(() => navigate("/home"), 3500);
    } catch (err) {
      console.error("Signup error:", err);

      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        setError(
          "Cannot reach the server. Check your connection, or wait if the backend is waking up (free hosting can take up to a minute)."
        );
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, isLoading, error, successMessage };
};
