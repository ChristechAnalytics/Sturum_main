import { useEffect } from "react";
import { useAuthContext } from "./useAuthContext";
import { refreshAccessToken } from "../utils/api";

export const useTokenRefresh = () => {
  const { user, dispatch } = useAuthContext();

  useEffect(() => {
    if (!user?.refreshToken) return;

    const refresh = async () => {
      const data = await refreshAccessToken(user.refreshToken);
      if (!data?.token) return;

      const updatedUser = { ...user, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch({ type: "LOGIN", payload: updatedUser });
    };

    const interval = setInterval(refresh, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, dispatch]);
};
