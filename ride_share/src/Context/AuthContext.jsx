// src/context/AuthContext.js
import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists in localStorage and update auth state
    const token = localStorage.getItem("token");
    if (token) {
      setAuth(true);
    } else {
      setAuth(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setAuth(true);
    navigate("/dashboard"); // Redirect to dashboard on login
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth(false);
    navigate("/"); // Redirect to login page on logout
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
