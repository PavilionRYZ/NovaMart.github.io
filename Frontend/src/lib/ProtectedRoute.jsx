import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, redirectTo = '/', forAuth = false, roles = [] }) => {
    const { isAuthenticated, role } = useSelector((state) => state.auth);

    if (forAuth) {
        return isAuthenticated ? <Navigate to={redirectTo} /> : children;
    } else {
        if (!isAuthenticated) {
            return <Navigate to={redirectTo} />;
        }
        if (roles.length > 0 && !roles.includes(role)) {
            return <Navigate to="/" />;
        }
        return children;
    }
};

export default ProtectedRoute;
