// eslint-disable-next-line no-unused-vars
import React from "react";
import { Navigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? <AppLayout></AppLayout> : <Navigate to="/login" />;
};

export default ProtectedRoute;
