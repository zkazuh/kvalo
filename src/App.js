import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'; // Se você tiver estilos global

function HomePage() {
  return (
    <div>
      <h1>Bem-vindo!</h1>
      <p>Este é um exemplo de front-end React com autenticação Supabase via FastAPI.</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container" style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            {/* Adicione outras rotas aqui */}
            <Route path="*" element={<div>Página não encontrada. <Link to="/">Voltar para Home</Link></div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;