import React, { useReducer } from "react";
import MkdSDK from "./utils/MkdSDK";

export const AuthContext = React.createContext();
const userData = JSON.parse(localStorage.getItem("user-data") || "{}")

const initialState = {
  ...userData,
  isAuthenticated: !!userData?.token
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("user-data", JSON.stringify({
        ...action.payload,
        user: action.payload?.user_id
      }))
      return {
        ...state,
        user: action.payload?.user_id,
        token: action.payload?.token,
        role: action.payload?.role,
        isAuthenticated: true,
      };
    case "LOGOUT":
      localStorage.clear();
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

let sdk = new MkdSDK();

export const tokenExpireError = (dispatch, errorMessage, role = "admin") => {
  if (errorMessage === "TOKEN_EXPIRED") {
    dispatch({
      type: "Logout",
    });
    window.location.href = "/" + role + "/login";
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const tokenValidity = async () => {
    const response = await sdk.check(state.role, state.token)
    if (response.error) {
      tokenExpireError(dispatch, response.message, state.role)
    }
  }

  React.useEffect(() => {
    if (!window.location.pathname.includes("login")) {
      tokenValidity()
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

/**
 * {
  * error: false,
  * message: "ok",
 * }
 */