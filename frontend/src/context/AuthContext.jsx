/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading] = useState(false);
  const [networkIp, setNetworkIp] = useState("localhost");

  useEffect(() => {
    api("/url/network-ip")
      .then((res) => {
        if (res.ipAddress) {
          setNetworkIp(res.ipAddress);
        }
      })
      .catch(() => {});
  }, []);

  const login = async (email, password) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    return data.user;
  };

  const register = async (name, email, password, role = "user", gender = "", phoneNumber = "") => {
    const data = await api("/auth/register", {
      method: "POST",
      body: { name, email, password, role, gender, phoneNumber },
    });
    return data;
  };

  const logout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout request to server failed, clearing local session anyway.", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserState,
    isAdmin: user?.role === "admin",
    networkIp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
