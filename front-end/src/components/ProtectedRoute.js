import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Carregando autenticação...</div>; // Ou um spinner/skeleton screen
  }

  if (!isAuthenticated) {
    // Redireciona para a página de login, mas salva a localização atual
    // para que possamos enviar o usuário de volta para ela após o login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;