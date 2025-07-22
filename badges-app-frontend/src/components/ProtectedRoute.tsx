import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Helper to check if user is logged in
const isAuthenticated = () => {
  const token = localStorage.getItem("access_token");
  return token && token.length > 0;
};

const ProtectedRoute: React.FC = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
