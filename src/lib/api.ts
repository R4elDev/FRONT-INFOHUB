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
});

// Interceptor de resposta para tratar erros 401 (token inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🚨 Token inválido detectado - limpando dados e redirecionando')
      
      // Limpa todos os dados de autenticação
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('estabelecimentoId')
      localStorage.removeItem('estabelecimentoNome')
      localStorage.removeItem('estabelecimentoUserId')
      localStorage.removeItem('estabelecimentoEndereco')
      localStorage.removeItem('estabelecimentoEnderecoCompleto')
      
      // Dispara evento customizado para mostrar alerta
      window.dispatchEvent(new CustomEvent('sessionExpired'))
      
      // Redireciona após um delay para permitir que o usuário veja o alerta
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    }
    return Promise.reject(error)
  }
)

export default api;
