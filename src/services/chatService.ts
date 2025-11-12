import api from '../lib/api';

// Tipos para o ChatIA
export interface ChatMessage {
  id: number;
  texto: string;
  tipo: 'usuario' | 'ia' | 'erro';
  timestamp: Date;
  fonte?: string;
}

export interface ChatResponse {
  resposta?: string;
  reply?: string;
  fonte?: string;
  tempo_resposta?: string;
}

export interface ChatOptions {
  useAuth?: boolean;
  userId?: number | null;
}

// Classe principal do ChatIA
class ChatIA {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Método principal para enviar mensagens com fallback inteligente
   */
  async enviarMensagem(pergunta: string, opcoes: ChatOptions = {}): Promise<ChatResponse> {
    const { useAuth = false, userId = null } = opcoes;
    
    try {
      // Tentar endpoint principal (Groq)
      return await this.chatGroq(pergunta);
    } catch (error) {
      console.warn('Groq falhou, tentando fallback:', error);
      
      if (useAuth && this.token) {
        try {
          return await this.interagir(pergunta, userId);
        } catch (fallbackError) {
          console.warn('Fallback autenticado falhou:', fallbackError);
          return this.respostaFallback(pergunta);
        }
      }
      
      return this.respostaFallback(pergunta);
    }
  }

  /**
   * Chat Groq (Recomendado) - Não requer autenticação
   */
  private async chatGroq(pergunta: string): Promise<ChatResponse> {
    const response = await api.post('/chat-groq', { pergunta });
    return response.data;
  }

  /**
   * Interagir (Protegido) - Requer JWT Token
   */
  private async interagir(mensagem: string, idUsuario: number | null): Promise<ChatResponse> {
    if (!this.token) {
      throw new Error('Token requerido para endpoint protegido');
    }

    const payload: any = { mensagem };
    if (idUsuario) {
      payload.idUsuario = idUsuario;
    }

    const response = await api.post('/interagir', payload, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    return response.data;
  }

  /**
   * Groq Direto - Acesso direto ao controlador
   */
  async groqDireto(pergunta: string): Promise<ChatResponse> {
    const response = await api.post('/groq', { pergunta });
    return response.data;
  }

  /**
   * Resposta de fallback quando todos os endpoints falham
   */
  private respostaFallback(pergunta: string): ChatResponse {
    return {
      resposta: `Desculpe, o sistema está temporariamente indisponível. Você perguntou: "${pergunta}". Tente novamente em alguns instantes.`,
      fonte: 'fallback_local',
      tempo_resposta: '< 1ms'
    };
  }

  /**
   * Atualiza o token de autenticação
   */
  updateToken(newToken: string | null): void {
    this.token = newToken;
  }
}

// Classe para tratamento de erros
export class ChatErrorHandler {
  static async handleChatError(error: any, originalMessage: string): Promise<ChatResponse> {
    console.error('Chat Error:', error);

    // Diferentes tipos de erro
    if (error.message?.includes('Network') || error.code === 'NETWORK_ERROR') {
      return {
        resposta: 'Problema de conexão. Verifique sua internet e tente novamente.',
        fonte: 'erro_rede'
      };
    }

    if (error.response?.status === 401) {
      return {
        resposta: 'Sessão expirada. Faça login novamente.',
        fonte: 'erro_auth'
      };
    }

    if (error.response?.status === 500) {
      return {
        resposta: 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.',
        fonte: 'erro_servidor'
      };
    }

    if (error.response?.status === 400) {
      return {
        resposta: 'Não consegui entender sua pergunta. Tente reformular de forma mais clara.',
        fonte: 'erro_validacao'
      };
    }

    // Fallback genérico
    return {
      resposta: `Desculpe, não consegui processar "${originalMessage}". Tente reformular sua pergunta.`,
      fonte: 'erro_generico'
    };
  }
}

// Classe para validação de mensagens
export class ChatValidator {
  static validateMessage(message: string): string {
    if (!message || typeof message !== 'string') {
      throw new Error('Mensagem inválida');
    }

    if (message.length > 1000) {
      throw new Error('Mensagem muito longa (máximo 1000 caracteres)');
    }

    // Sanitizar HTML básico
    const sanitized = message.replace(/<[^>]*>/g, '');
    
    return sanitized.trim();
  }

  static sanitizeResponse(response: any): string {
    if (typeof response === 'string') {
      return response.replace(/<script[^>]*>.*?<\/script>/gi, '');
    }
    return String(response || '');
  }
}

// Cache simples para respostas (LRU)
export class ChatCache {
  private cache: Map<string, ChatResponse>;
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): ChatResponse | null {
    if (this.cache.has(key)) {
      // Move para o final (LRU)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key: string, value: ChatResponse): void {
    if (this.cache.size >= this.maxSize) {
      // Remove o mais antigo
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Analytics para monitoramento
export class ChatAnalytics {
  static trackMessage(message: string, response: ChatResponse, responseTime: number): void {
    // Enviar para analytics se disponível
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'chat_message', {
        'message_length': message.length,
        'response_time': responseTime,
        'response_source': response.fonte
      });
    }

    // Log para desenvolvimento
    console.log('📊 Chat Analytics:', {
      messageLength: message.length,
      responseTime,
      source: response.fonte
    });
  }

  static trackError(error: any, context: string): void {
    console.error('📊 Chat Analytics Error:', error, context);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'chat_error', {
        'error_type': error.message || 'unknown',
        'context': context
      });
    }
  }
}

// Perguntas sugeridas
export const PERGUNTAS_EXEMPLO = [
  "Quais produtos estão em promoção?",
  "Onde encontro leite mais barato?",
  "Quantos usuários estão cadastrados?",
  "Quais estabelecimentos temos parceria?",
  "Como funciona o sistema?",
  "Resumo geral do InfoHub"
];

// Instância singleton do ChatIA
export const chatIA = new ChatIA();

// Hook personalizado para usar o chat
export const useChatIA = () => {
  return {
    chatIA,
    enviarMensagem: chatIA.enviarMensagem.bind(chatIA),
    groqDireto: chatIA.groqDireto.bind(chatIA),
    updateToken: chatIA.updateToken.bind(chatIA)
  };
};

export default chatIA;
