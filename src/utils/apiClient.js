import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000', // Fallback se .env não carregar
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT às requisições
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Opcional: Interceptor para lidar com refresh token
// Isso é mais complexo e pode variar na implementação.
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const refreshToken = localStorage.getItem('refreshToken');
//         if (!refreshToken) return Promise.reject(error);

//         const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/auth/refresh`, { refresh_token: refreshToken });
        
//         localStorage.setItem('accessToken', data.access_token);
//         localStorage.setItem('refreshToken', data.refresh_token); // Supabase pode retornar novo refresh token
        
//         apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
//         originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;
        
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         // Se o refresh token falhar, deslogar o usuário
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         localStorage.removeItem('user');
//         // Idealmente, o AuthContext lidaria com o redirecionamento global para login
//         window.location.href = '/login'; 
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );


export default apiClient;