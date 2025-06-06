import apiClient from '../utils/apiClient'; // Ou use axios diretamente

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Se não estiver usando apiClient com interceptor, precisará do token aqui:
// const getAuthHeaders = () => {
//   const token = localStorage.getItem('accessToken');
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

export const login = async (email, password) => {
  // A SENHA É ENVIADA EM TEXTO PLANO (SOBRE HTTPS EM PRODUÇÃO)
  const response = await apiClient.post(`/auth/login`, { email, password });
  if (response.data.access_token) {
    localStorage.setItem('accessToken', response.data.access_token);
    localStorage.setItem('refreshToken', response.data.refresh_token);
    // Supabase user object está em response.data.user
    localStorage.setItem('user', JSON.stringify(response.data.user)); 
  }
  return response.data;
};

export const logout = async () => {
  try {
    // O token já é adicionado pelo interceptor do apiClient
    await apiClient.post(`/auth/logout`);
  } catch (error) {
    console.warn("Logout API call failed or token was already invalid:", error.response?.data?.detail || error.message);
    // Mesmo que a chamada falhe (ex: token expirado), o cliente deve limpar os tokens
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

export const getSession = async () => {
  try {
    // O token já é adicionado pelo interceptor do apiClient
    const response = await apiClient.get(`/auth/session`);
    localStorage.setItem('user', JSON.stringify(response.data)); // Atualiza dados do usuário
    return response.data;
  } catch (error) {
    // Se a sessão for inválida (401), o interceptor de resposta (se implementado)
    // pode tentar dar refresh. Se falhar ou não houver interceptor, limpa os dados.
    console.error("Failed to get session:", error.response?.data?.detail || error.message);
    // Considerar limpar o storage aqui se o erro for 401 e não houver refresh token
    if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
    throw error; 
  }
};

export const refreshToken = async (currentRefreshToken) => {
    const response = await apiClient.post(`/auth/refresh`, { refresh_token: currentRefreshToken });
    if (response.data.access_token) {
        localStorage.setItem('accessToken', response.data.access_token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};


// Função auxiliar para pegar o usuário do localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

// Função auxiliar para pegar o token de acesso
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};