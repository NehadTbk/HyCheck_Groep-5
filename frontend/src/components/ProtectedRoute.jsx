import React from "react";
import { Navigate } from "react-router-dom";

const getRedirectPathByRole = (role) => {
    switch (role) {
        case 'admin':
            return "/afdelingshoofd/dashboard"; 
        case 'responsible':
            return "/verantwoordelijke/dashboard";
        case 'assistant':
            return "/assistant/dashboard";
        default:
            return "/login";
    }
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
        return <Navigate to="/login" replace />;
    }
    
    let userData;
    try {
        userData = JSON.parse(userStr);
    } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/login" replace />;
    }
    
      if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
        const redirectPath = getRedirectPathByRole(userData.role);
        return <Navigate to={redirectPath} replace />;
    }
    return children;
};
export default ProtectedRoute;