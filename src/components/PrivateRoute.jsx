import React from "react";
import { UserAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const { session, loading } = UserAuth();

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!session) {
        return <Navigate to="/signin" />;
    }

    return children;
};

export default PrivateRoute;
