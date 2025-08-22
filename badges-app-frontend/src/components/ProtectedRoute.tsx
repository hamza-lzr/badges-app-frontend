import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  preferred_username: string;
  realm_access?: { roles: string[] };
  exp: number;
}

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const roles = decoded.realm_access?.roles || [];
    const now = Date.now() / 1000;

    // ✅ Check expiration
    if (decoded.exp < now) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return <Navigate to="/login" replace />;
    }

    // ✅ Check if user has ADMIN role
    if (!roles.includes("ADMIN")) {
      return <Navigate to="/login" replace />;
    }

    return <Outlet />; // ✅ render nested routes
  } catch (e) {
    console.error("Invalid token", e);
    localStorage.removeItem("access_token");
    return <Navigate to="/login" replace />;
  }
};


export default ProtectedRoute;

