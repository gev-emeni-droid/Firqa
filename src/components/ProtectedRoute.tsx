import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactElement;
}

// Guard de base: vérifier si l'utilisateur est connecté
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { session } = useAuth();

    if (!session || !session.isAuthenticated) {
        return <Navigate to="/connexion" replace />;
    }

    return children;
};
