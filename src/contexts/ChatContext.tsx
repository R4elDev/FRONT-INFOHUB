import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ChatMessage, ChatResponse } from '../services/chatService';
import { chatIA, ChatErrorHandler, ChatValidator, ChatAnalytics } from '../services/chatService';

// Tipos para o contexto
interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  isOpen: boolean;
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'TOGGLE_CHAT' }
  | { type: 'SET_CHAT_OPEN'; payload: boolean };

interface ChatContextType {
  state: ChatState;
  enviarMensagem: (texto: string, useAuth?: boolean, userId?: number) => Promise<void>;
  limparMensagens: () => void;
  toggleChat: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

// Estado inicial
const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  isOpen: false,
};

// Reducer
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
        error: null,
      };
    case 'TOGGLE_CHAT':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    case 'SET_CHAT_OPEN':
      return {
        ...state,
        isOpen: action.payload,
      };
    default:
      return state;
  }
};

// Contexto
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider
interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const enviarMensagem = useCallback(async (texto: string, useAuth: boolean = false, userId?: number) => {
    try {
      // Validar mensagem
      const textoLimpo = ChatValidator.validateMessage(texto);
      
      if (!textoLimpo) {
        throw new Error('Mensagem vazia');
      }

      // Adicionar mensagem do usuário
      const mensagemUsuario: ChatMessage = {
        id: Date.now(),
        texto: textoLimpo,
        tipo: 'usuario',
        timestamp: new Date(),
      };

      dispatch({ type: 'ADD_MESSAGE', payload: mensagemUsuario });
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Marcar tempo de início
      const startTime = Date.now();

      try {
        // Enviar para IA
        const resposta: ChatResponse = await chatIA.enviarMensagem(textoLimpo, {
          useAuth,
          userId: userId || null,
        });

        // Calcular tempo de resposta
        const responseTime = Date.now() - startTime;

        // Sanitizar resposta
        const textoResposta = ChatValidator.sanitizeResponse(
          resposta.resposta || resposta.reply || 'Resposta não disponível'
        );

        // Adicionar mensagem da IA
        const mensagemIA: ChatMessage = {
          id: Date.now() + 1,
          texto: textoResposta,
          tipo: 'ia',
          timestamp: new Date(),
          fonte: resposta.fonte || 'sistema',
        };

        dispatch({ type: 'ADD_MESSAGE', payload: mensagemIA });

        // Analytics
        ChatAnalytics.trackMessage(textoLimpo, resposta, responseTime);

      } catch (error: any) {
        console.error('Erro ao enviar mensagem:', error);

        // Tratar erro com fallback inteligente
        const respostaErro = await ChatErrorHandler.handleChatError(error, textoLimpo);

        const mensagemErro: ChatMessage = {
          id: Date.now() + 1,
          texto: respostaErro.resposta || 'Erro desconhecido',
          tipo: 'erro',
          timestamp: new Date(),
          fonte: respostaErro.fonte || 'erro',
        };

        dispatch({ type: 'ADD_MESSAGE', payload: mensagemErro });

        // Analytics de erro
        ChatAnalytics.trackError(error, 'enviar_mensagem');
      }

    } catch (validationError: any) {
      console.error('Erro de validação:', validationError);
      
      const mensagemErroValidacao: ChatMessage = {
        id: Date.now() + 1,
        texto: validationError.message || 'Erro de validação',
        tipo: 'erro',
        timestamp: new Date(),
        fonte: 'validacao',
      };

      dispatch({ type: 'ADD_MESSAGE', payload: mensagemErroValidacao });
      dispatch({ type: 'SET_ERROR', payload: validationError.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const limparMensagens = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const toggleChat = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHAT' });
  }, []);

  const setIsOpen = useCallback((isOpen: boolean) => {
    dispatch({ type: 'SET_CHAT_OPEN', payload: isOpen });
  }, []);

  const contextValue: ChatContextType = {
    state,
    enviarMensagem,
    limparMensagens,
    toggleChat,
    setIsOpen,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook customizado
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat deve ser usado dentro de ChatProvider');
  }
  return context;
};

// Hook para debounce (útil para digitação)
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default ChatContext;
