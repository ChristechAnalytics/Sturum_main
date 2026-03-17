import React, { createContext, useReducer, useEffect } from "react";

// Create context
export const AuthContext = createContext();

// Define reducer actions
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    case "UPDATE_PROFILE_IMAGE":
      return {
        ...state,
        user: {
          ...state.user,
          profileImage: action.payload,
        },
      };
    case "UPDATE_PROFILE":
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

// Define the context provider
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      dispatch({ type: "LOGIN", payload: user });
    }
  }, []);

  // Function to update profile image
  const updateProfileImage = (profileImage) => {
    dispatch({ type: "UPDATE_PROFILE_IMAGE", payload: profileImage });
    // Update localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({ ...state.user, profileImage })
    );
  };

  return (
    <AuthContext.Provider value={{ ...state, dispatch, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  );
};
