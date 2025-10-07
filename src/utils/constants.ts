// Rotas da aplicação
export const ROUTES = {
  // Páginas iniciais
  HOME: '/',
  HOME_INICIAL: '/HomeInicial',
  LOCALIZACAO: '/Localizacao',
  CADASTRO_ENDERECO: '/CadastroDeEndereco',
  
  // Autenticação
  LOGIN: '/login',
  CADASTRO: '/cadastro',
  RECUPERAR_SENHA: '/recuperar-senha',
  RECUPERAR_SENHA_2: '/recuperar-senha2',
  RECUPERAR_SENHA_FINAL: '/recuperar-senha-final',
  
  // Produtos
  PRODUTOS: '/produto',
  PROMOCOES: '/promocoes',
  FAVORITOS: '/favoritos',
  CHAT_PRECOS: '/ChatPrecos',
  
  // Carrinho
  CARRINHO: '/carrinho',
  CHECKOUT: '/checkout',
  PAGAMENTO_SUCESSO: '/pagamento-sucesso',
  
  // Perfil
  PERFIL: '/perfil',
  PERFIL_EMPRESA: '/perfil-empresa',
  EDITAR_PERFIL_EMPRESA: '/editar-perfil-empresa',
  CONFIGURACOES: '/configuracoes',
  CONFIGURACOES_EMPRESA: '/configuracoes-empresa',
  
  // InfoCash
  INFOCASH: '/infocash',
  INFOCASH_COMENTARIOS: '/infocash/comentarios',
  INFOCASH_NOVO: '/infocash/novo',
} as const

// Manter compatibilidade (deprecated)
export const ROTAS = ROUTES

// Cores do tema
export const COLORS = {
  PRIMARY: '#F9A01B',
  PRIMARY_DARK: '#e89015',
  SECONDARY: '#25992E',
  SECONDARY_DARK: '#1f7a24',
  SUCCESS: '#47B156',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
} as const

// Configurações
export const CONFIG = {
  APP_NAME: 'InfoHub',
  VERSION: '1.0.0',
  API_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1/infohub',
} as const

// Mensagens
export const MESSAGES = {
  LOADING: 'Carregando...',
  ERROR_GENERIC: 'Algo deu errado. Tente novamente.',
  SUCCESS_ADD_CART: 'Produto adicionado ao carrinho!',
  SUCCESS_ADD_FAVORITE: 'Produto adicionado aos favoritos!',
  SUCCESS_REMOVE_FAVORITE: 'Produto removido dos favoritos!',
} as const
