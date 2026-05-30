import React from "react";
import { useHistory } from "react-router-dom"
import { useAuth } from "../hooks/useAuth";
import type { RolUsuario } from "../types";
import {Redirect} from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RolUsuario[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;