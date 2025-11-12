import { useCallback, useEffect, useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { chatIA } from '../services/chatService';
import type { ChatMessage } from '../services/chatService';

interface UseChatIAOptions {
  autoFocus?: boolean;
  persistMessages?: boolean;
  maxMessages?: number;
}

interface UseChatIAReturn {
  // Estado
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  
  // Ações
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  
  // Utilitários
  getLastMessage: () => ChatMessage | null;
  getMessageCount: () => number;
  hasMessages: boolean;
}

export const useChatIA = (options: UseChatIAOptions = {}): UseChatIAReturn => {
  const {
    persistMessages = false,
    maxMessages = 100
  } = options;

  const { 
    state, 
    enviarMensagem, 
    limparMensagens, 
    toggleChat: contextToggleChat, 
    setIsOpen 
  } = useChat();

  const [localError, setLocalError] = useState<string | null>(null);

  // Carregar mensagens persistidas
  useEffect(() => {
    if (persistMessages) {
      try {
        const savedMessages = localStorage.getItem('chat_messages');
        if (savedMessages) {
          const messages = JSON.parse(savedMessages);
          // Aqui você poderia implementar lógica para restaurar mensagens
          console.log('Mensagens salvas encontradas:', messages.length);
        }
      } catch (error) {
        console.warn('Erro ao carregar mensagens salvas:', error);
      }
    }
  }, [persistMessages]);

  // Salvar mensagens quando mudarem
  useEffect(() => {
    if (persistMessages && state.messages.length > 0) {
      try {
        // Manter apenas as últimas mensagens para não sobrecarregar o localStorage
        const messagesToSave = state.messages.slice(-maxMessages);
        localStorage.setItem('chat_messages', JSON.stringify(messagesToSave));
      } catch (error) {
        console.warn('Erro ao salvar mensagens:', error);
      }
    }
  }, [state.messages, persistMessages, maxMessages]);

  // Atualizar token quando o usuário fizer login/logout
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('auth_token');
      chatIA.updateToken(newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    try {
      setLocalError(null);
      
      // Verificar se há dados do usuário
      const userData = localStorage.getItem('user_data');
      let userId: number | undefined;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          userId = user.id;
        } catch (error) {
          console.warn('Erro ao parsear dados do usuário:', error);
        }
      }

      await enviarMensagem(message, !!userData, userId);
    } catch (error: any) {
      setLocalError(error.message || 'Erro ao enviar mensagem');
      throw error;
    }
  }, [enviarMensagem]);

  const clearMessages = useCallback(() => {
    limparMensagens();
    setLocalError(null);
    
    if (persistMessages) {
      localStorage.removeItem('chat_messages');
    }
  }, [limparMensagens, persistMessages]);

  const toggleChat = useCallback(() => {
    contextToggleChat();
  }, [contextToggleChat]);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const getLastMessage = useCallback((): ChatMessage | null => {
    return state.messages.length > 0 ? state.messages[state.messages.length - 1] : null;
  }, [state.messages]);

  const getMessageCount = useCallback((): number => {
    return state.messages.length;
  }, [state.messages]);

  const hasMessages = state.messages.length > 0;

  return {
    // Estado
    messages: state.messages,
    loading: state.loading,
    error: state.error || localError,
    isOpen: state.isOpen,
    
    // Ações
    sendMessage,
    clearMessages,
    toggleChat,
    openChat,
    closeChat,
    
    // Utilitários
    getLastMessage,
    getMessageCount,
    hasMessages,
  };
};

// Hook para estatísticas do chat
export const useChatStats = () => {
  const { messages } = useChat().state;

  const stats = {
    totalMessages: messages.length,
    userMessages: messages.filter(m => m.tipo === 'usuario').length,
    aiMessages: messages.filter(m => m.tipo === 'ia').length,
    errorMessages: messages.filter(m => m.tipo === 'erro').length,
    averageResponseTime: 0, // Poderia ser calculado se armazenássemos os tempos
    lastActivity: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
  };

  return stats;
};

// Hook para controle de digitação
export const useTypingIndicator = (delay: number = 1000) => {
  const [isTyping, setIsTyping] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    setIsTyping(true);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const newTimeoutId = setTimeout(() => {
      setIsTyping(false);
    }, delay);
    
    setTimeoutId(newTimeoutId);
  }, [delay, timeoutId]);

  const stopTyping = useCallback(() => {
    setIsTyping(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    isTyping,
    startTyping,
    stopTyping,
  };
};

export default useChatIA;
