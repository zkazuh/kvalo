import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <p>Carregando perfil...</p>; // Ou redirecionar se o ProtectedRoute não pegar
  }

  return (
    <div>
      <h2>Perfil do Usuário</h2>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Email:</strong> {user.email}</p>
      {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
        <div>
          <strong>Metadados do Usuário:</strong>
          <pre>{JSON.stringify(user.user_metadata, null, 2)}</pre>
        </div>
      )}
       {user.app_metadata && Object.keys(user.app_metadata).length > 0 && (
        <div>
          <strong>Metadados da Aplicação:</strong>
          <pre>{JSON.stringify(user.app_metadata, null, 2)}</pre>
        </div>
      )}
      {/* Adicione mais informações do perfil conforme necessário */}
    </div>
  );
}

export default ProfilePage;