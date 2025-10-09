// Tipo para os dados do login
export type loginRequest = {
    email: string,
    senha: string
}

export type loginResponse = {
    status: boolean,
    status_code: number,
    token: string,
    usuario: {
        id: number,
        nome: string,
        email: string,
        perfil: string
    }
}

export type cadastroRequest = {
  nome: string;
  email: string;
  senha_hash: string;
  perfil: 'consumidor' | 'admin' | 'estabelecimento';
  cpf?: string | null;
  cnpj?: string | null;
  telefone?: string | null
  data_nascimento: string;
};


export type cadastroResponse = {
  status: boolean,
  status_code: number,
  message: string,
}



// Solicitar código por email
export interface solicitarCodigoRequest {
  email: string;
}

export interface solicitarCodigoResponse {
  status: boolean;
  status_code?: number;
  message: string;
}

// Validar código
export interface validarCodigoRequest {
  email: string;
  codigo: string;
}

export interface validarCodigoResponse {
  status: boolean;
  status_code?: number;
  message: string;
  // Pode retornar dados adicionais se necessário
  data?: any;
}

// Redefinir senha
export interface redefinirSenhaRequest {
  codigo: string;
  novaSenha: string;
}

export interface redefinirSenhaResponse {
  status: boolean;
  status_code?: number;
  message: string;
}

// ============================================
// TIPOS PARA CHAT IA
// ============================================

/**
 * Request para interagir com a IA
 * @param mensagem - A pergunta/mensagem do usuário para a IA
 * @param idUsuario - ID do usuário que está fazendo a pergunta
 */
export interface chatIARequest {
  mensagem: string;
  idUsuario: number;
}

/**
 * Dados retornados pela IA na resposta
 * @param reply - A resposta formatada da IA (pode conter markdown/emojis)
 * @param confidence - Nível de confiança da IA na resposta (0-1)
 * @param response_time_ms - Tempo de resposta em milissegundos
 */
export interface chatIAData {
  reply: string;
  confidence: number;
  response_time_ms: number;
}

/**
 * Response completa da API de Chat IA
 * @param status - Se a requisição foi bem sucedida
 * @param status_code - Código HTTP da resposta
 * @param data - Dados da resposta da IA
 * @param message - Mensagem de erro (opcional, quando status é false)
 * @param error - Detalhes do erro (opcional)
 */
export interface chatIAResponse {
  status: boolean;
  status_code: number;
  data?: chatIAData;
  message?: string;
  error?: string;
}

/**
 * Tipo para armazenar mensagens no chat
 * Usado tanto para mensagens do usuário quanto da IA
 * @param text - Conteúdo da mensagem
 * @param time - Horário formatado (HH:MM)
 * @param isBot - Se a mensagem é da IA (true) ou do usuário (false)
 * @param confidence - Nível de confiança da IA (apenas para mensagens do bot)
 */
export interface chatMessage {
  text: string;
  time: string;
  isBot: boolean;
  confidence?: number;
}