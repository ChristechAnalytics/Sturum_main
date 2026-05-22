import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorResponse =
          contentType && contentType.includes("application/json")
            ? await response.json()
            : await response.text();
        const errorMessage = errorResponse.error || errorResponse;
        throw new Error(errorMessage);
      }

      const json = await response.json();

      dispatch({ type: "LOGIN", payload: json });
      setIsLoading(false);

      navigate("/home");
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
    }
  };

  return { login, isLoading, error };
};
