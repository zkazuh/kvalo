import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import apiClient from '../utils/apiClient'; // Para o interceptor de refresh

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [accessToken, setAccessToken] = useState(() => authService.getAccessToken());
  const [loading, setLoading] = useState(true); // Para verificação inicial da sessão

  const handleAuthResponse = (data) => {
    setUser(data.user);
    setAccessToken(data.access_token);
    // Os tokens já são salvos no localStorage pelo authService
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    handleAuthResponse(data);
    return data; // Retorna para que a página de login possa lidar com sucesso/erro
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setAccessToken(null);
    // Os tokens são removidos do localStorage pelo authService
  };
  
  const attemptRefreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedRefreshToken) {
      try {
        console.log("Attempting token refresh...");
        const data = await authService.refreshToken(storedRefreshToken);
        handleAuthResponse(data);
        return data.access_token;
      } catch (error) {
        console.error("Refresh token failed:", error);
        await logout(); // Se o refresh falhar, deslogar completamente
        return null;
      }
    }
    return null;
  }, []); // Adicione 'logout' como dependência se ele for definido fora e usado aqui

  const checkUserSession = useCallback(async () => {
    setLoading(true);
    const token = authService.getAccessToken();
    if (token) {
      try {
        const sessionUser = await authService.getSession();
        setUser(sessionUser); // Supabase /session retorna o objeto do usuário diretamente
        setAccessToken(token);
      } catch (error) {
        console.warn("Session check failed, possibly invalid token.", error);
        // Tentar refresh se a sessão falhar por 401
        if (error.response?.status === 401) {
            const newAccessToken = await attemptRefreshToken();
            if (!newAccessToken) { // Se o refresh falhar
                await logout(); // Garante que o estado seja limpo
            }
        } else {
            await logout(); // Para outros erros de sessão, limpar
        }
      }
    } else {
      setUser(null); // Garante que não há usuário se não houver token
      setAccessToken(null);
    }
    setLoading(false);
  }, [attemptRefreshToken]); // Adicione logout como dependência se ele for usado aqui

  useEffect(() => {
    checkUserSession();

    // Configurar interceptor de resposta do Axios para refresh token (se não configurado no apiClient.js)
    // Este é um local alternativo para o interceptor se você preferir tê-lo acoplado ao AuthContext
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newAccessToken = await attemptRefreshToken();
          if (newAccessToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest); // Tenta a requisição original novamente
          }
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      // Limpar o interceptor quando o componente desmontar
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [checkUserSession, attemptRefreshToken]);

  const value = {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    loading,
    login,
    logout,
    checkUserSession,
    attemptRefreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};