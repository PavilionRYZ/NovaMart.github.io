import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, redirectTo = '/', forAuth = false, roles = [] }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    if (forAuth) {
        return isAuthenticated ? <Navigate to={redirectTo} /> : children;
    } else {
        if (!isAuthenticated) {
            console.log('Redirecting to /: Not authenticated')
            return <Navigate to={redirectTo} />;
        }
        if (roles.length > 0 && !roles.includes(user.role)) {
            console.log(`Redirecting to /: Role ${user.role} not in ${roles}`);
            return <Navigate to="/" />;
        }
        return children;
    }
};

export default ProtectedRoute;
