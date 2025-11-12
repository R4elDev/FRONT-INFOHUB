// Componentes principais
export { default as ChatComponent } from './ChatComponent';
export { default as FloatingChat } from './FloatingChat';
export { default as ChatSuggestions } from './ChatSuggestions';

// Contexto e hooks
export { ChatProvider, useChat } from '../../contexts/ChatContext';
export { useChatIA, useChatStats, useTypingIndicator } from '../../hooks/useChatIA';

// Serviços e utilitários
export {
  chatIA,
  ChatErrorHandler,
  ChatValidator,
  ChatCache,
  ChatAnalytics,
  PERGUNTAS_EXEMPLO
} from '../../services/chatService';

// Tipos
export type { ChatMessage, ChatResponse, ChatOptions } from '../../services/chatService';
