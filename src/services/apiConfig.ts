import axios from 'axios';

// Configuração da API
const apiConfig = axios.create({
  baseURL: '/api'
});

// Adicionar token em todas as requisições
apiConfig.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tratamento de erros
apiConfig.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('Erro 401: Token inválido ou expirado');
    }
    return Promise.reject(error);
  }
);

export default apiConfig;
