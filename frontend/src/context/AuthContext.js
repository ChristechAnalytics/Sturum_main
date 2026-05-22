import React, { createContext, useReducer } from "react";

// Create context
export const AuthContext = createContext();

const persistUser = (user) => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
};

const loadStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const user = JSON.parse(stored);
    return user?.token ? user : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

// Define reducer actions
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN": {
      persistUser(action.payload);
      return { user: action.payload };
    }
    case "LOGOUT": {
      persistUser(null);
      return { user: null };
    }
    case "UPDATE_PROFILE_IMAGE": {
      const user = {
        ...state.user,
        profileImage: action.payload,
      };
      persistUser(user);
      return { ...state, user };
    }
    case "UPDATE_PROFILE": {
      const user = {
        ...state.user,
        ...action.payload,
      };
      persistUser(user);
      return { ...state, user };
    }
    default:
      return state;
  }
};

const initAuthState = () => ({
  user: loadStoredUser(),
});

// Define the context provider
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, null, initAuthState);

  const updateProfileImage = (profileImage) => {
    dispatch({ type: "UPDATE_PROFILE_IMAGE", payload: profileImage });
  };

  return (
    <AuthContext.Provider value={{ ...state, dispatch, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  );
};
