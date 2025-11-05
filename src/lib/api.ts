import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Antes de cada requisição, adicionamos o token (jwt)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de resposta para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔐 Token inválido ou expirado. Redirecionando para login...');
      
      // Limpa dados de autenticação
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('estabelecimentoId');
      localStorage.removeItem('estabelecimentoNome');
      localStorage.removeItem('estabelecimentoUserId');
      localStorage.removeItem('estabelecimentoEndereco');
      localStorage.removeItem('estabelecimentoEnderecoCompleto');
      
      // Redireciona para login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
