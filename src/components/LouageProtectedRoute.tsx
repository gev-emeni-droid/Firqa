import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LouageProtectedRouteProps {
    children: React.ReactElement;
}

// Guard spécifique pour les routes Louage
// Nécessite: connecté + userType='louage' + verificationStatus='verified'
export const LouageProtectedRoute: React.FC<LouageProtectedRouteProps> = ({ children }) => {
    const { session } = useAuth();

    // Pas connecté -> connexion
    if (!session || !session.isAuthenticated) {
        return <Navigate to="/connexion" replace />;
    }

    // Pas un louage -> inscription
    if (session.userType !== 'louage') {
        return <Navigate to="/inscription" replace />;
    }

    // Louage en attente de vérification -> page de vérification
    if (session.verificationStatus === 'pending') {
        return <Navigate to="/verification-en-cours" replace />;
    }

    // Louage non vérifié -> page de vérification
    if (session.verificationStatus !== 'verified') {
        return <Navigate to="/verification-en-cours" replace />;
    }

    return children;
};
