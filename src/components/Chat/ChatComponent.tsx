import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { PERGUNTAS_EXEMPLO } from '../../services/chatService';
import type { ChatMessage } from '../../services/chatService';

interface ChatComponentProps {
  className?: string;
  isFloating?: boolean;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ 
  className = '', 
  isFloating = false 
}) => {
  const { state, enviarMensagem, limparMensagens, toggleChat, setIsOpen } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [state.messages]);

  // Focar no input quando o chat abrir
  useEffect(() => {
    if (state.isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [state.isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || state.loading) return;

    const message = inputValue.trim();
    setInputValue('');
    setShowSuggestions(false);

    // Obter dados do usuário se disponível
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setTimeout(() => handleSendMessage(), 100);
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.tipo === 'usuario';
    const isError = message.tipo === 'erro';

    return (
      <div
        key={message.id}
        className={`flex items-start gap-3 mb-4 animate-fade-in ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser 
            ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' 
            : isError
            ? 'bg-red-100 text-red-600'
            : 'bg-gradient-to-r from-green-400 to-green-600 text-white'
          }
        `}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : isError ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        {/* Mensagem */}
        <div className={`
          max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
          ${isUser
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-tr-md'
            : isError
            ? 'bg-red-50 border border-red-200 text-red-800 rounded-tl-md'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-md'
          }
        `}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.texto}
          </p>
          
          {/* Timestamp e fonte */}
          <div className={`
            flex items-center justify-between mt-2 text-xs
            ${isUser ? 'text-orange-100' : isError ? 'text-red-500' : 'text-gray-500'}
          `}>
            <span>
              {message.timestamp.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {message.fonte && !isUser && (
              <span className="ml-2 opacity-75">
                via {message.fonte}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSuggestions = () => {
    if (!showSuggestions || state.messages.length > 0) return null;

    return (
      <div className="p-4 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          💡 Perguntas sugeridas:
        </h4>
        <div className="space-y-2">
          {PERGUNTAS_EXEMPLO.slice(0, 4).map((pergunta, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(pergunta)}
              className="
                w-full text-left p-3 rounded-xl border border-gray-200 
                hover:border-orange-300 hover:bg-orange-50 
                transition-all duration-200 text-sm text-gray-700
                hover:shadow-md hover:scale-[1.02]
              "
            >
              {pergunta}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => {
    if (!state.loading) return null;

    return (
      <div className="flex items-start gap-3 mb-4 animate-fade-in">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-green-600" />
            <span className="text-sm text-gray-600">Pensando...</span>
          </div>
        </div>
      </div>
    );
  };

  // Renderização para chat flutuante
  if (isFloating) {
    return (
      <>
        {/* Botão flutuante */}
        {!state.isOpen && (
          <button
            onClick={toggleChat}
            className="
              fixed bottom-6 right-6 z-50
              w-14 h-14 rounded-full
              bg-gradient-to-r from-orange-500 to-orange-600
              text-white shadow-lg hover:shadow-xl
              flex items-center justify-center
              transition-all duration-300
              hover:scale-110 animate-bounce-slow
            "
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}

        {/* Chat modal */}
        {state.isOpen && (
          <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-3xl shadow-2xl border-2 border-gray-100 flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">InfoHub IA</h3>
                  <p className="text-xs text-orange-100">Assistente inteligente</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {renderSuggestions()}
              
              <div
                ref={chatMessagesRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
              >
                {state.messages.length === 0 && !showSuggestions && (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">Olá! Como posso ajudar você hoje?</p>
                  </div>
                )}
                
                {state.messages.map(renderMessage)}
                {renderTypingIndicator()}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white rounded-b-3xl">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta..."
                  disabled={state.loading}
                  className="
                    flex-1 px-4 py-3 rounded-2xl border border-gray-200
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                    disabled:bg-gray-50 disabled:text-gray-400
                    text-sm
                  "
                />
                <button
                  onClick={handleSendMessage}
                  disabled={state.loading || !inputValue.trim()}
                  className="
                    w-12 h-12 rounded-2xl
                    bg-gradient-to-r from-orange-500 to-orange-600
                    text-white shadow-lg hover:shadow-xl
                    flex items-center justify-center
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    hover:scale-105
                  "
                >
                  {state.loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Renderização para chat integrado
  return (
    <div className={`flex flex-col h-full bg-white rounded-3xl border-2 border-gray-100 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">InfoHub IA</h3>
            <p className="text-sm text-orange-100">Assistente inteligente</p>
          </div>
        </div>
        
        {state.messages.length > 0 && (
          <button
            onClick={limparMensagens}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {renderSuggestions()}
        
        <div
          ref={chatMessagesRef}
          className="flex-1 overflow-y-auto p-6 bg-gray-50"
        >
          {state.messages.length === 0 && !showSuggestions && (
            <div className="text-center text-gray-500 py-12">
              <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold mb-2">Bem-vindo ao InfoHub IA!</h4>
              <p className="text-sm">Faça uma pergunta sobre produtos, promoções ou estabelecimentos.</p>
            </div>
          )}
          
          {state.messages.map(renderMessage)}
          {renderTypingIndicator()}
        </div>
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-100 bg-white rounded-b-3xl">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta..."
            disabled={state.loading}
            className="
              flex-1 px-6 py-4 rounded-2xl border-2 border-gray-200
              focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-400
              text-sm font-medium
            "
          />
          <button
            onClick={handleSendMessage}
            disabled={state.loading || !inputValue.trim()}
            className="
              w-14 h-14 rounded-2xl
              bg-gradient-to-r from-orange-500 to-orange-600
              text-white shadow-lg hover:shadow-xl
              flex items-center justify-center
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              hover:scale-105
            "
          >
            {state.loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
