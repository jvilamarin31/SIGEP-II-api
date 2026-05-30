import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { RolUsuario } from "../types";

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  allowedRoles?: RolUsuario[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, allowedRoles, ...rest }) => {
  const { isAuthenticated, hasRole } = useAuth();

  return (
      <Route
          {...rest}
          render={(props) => {
            if (!isAuthenticated) {
              return <Redirect to="/login" />;
            }
            if (allowedRoles && !hasRole(allowedRoles)) {
              return <Redirect to="/dashboard" />;
            }
            return <Component {...props} />;
          }}
      />
  );
};

export default ProtectedRoute;