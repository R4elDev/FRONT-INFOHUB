import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Send, List, Loader2, Trash2, HelpCircle, X, Sparkles, Bot, User, ArrowUp, MessageCircle, TrendingUp } from 'lucide-react'
import SidebarLayout from '../../components/layouts/SidebarLayout'
import { ChatProvider, useChat } from '../../contexts/ChatContext'
import { useChatIA } from '../../hooks/useChatIA'
import { PERGUNTAS_EXEMPLO } from '../../services/chatService'
import '../../styles/chat.css'

// Componente interno que usa o novo sistema de ChatIA
function ChatPrecosContent() {
  const navigate = useNavigate()
  const [inputMessage, setInputMessage] = useState<string>('')
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false)
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // Usando o novo sistema de ChatIA
  const { 
    messages, 
    loading: isLoading, 
    sendMessage, 
    clearMessages, 
    hasMessages 
  } = useChatIA({ 
    persistMessages: true, 
    maxMessages: 50 
  })

  /**
   * Verificação de autenticação
   */
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  /**
   * Scroll automático para última mensagem
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * Controle do botão "Voltar ao topo"
   */
  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    const handleScroll = () => {
      const scrollTop = chatContainer.scrollTop
      setShowScrollTop(scrollTop > 300)
    }

    chatContainer.addEventListener('scroll', handleScroll)
    return () => chatContainer.removeEventListener('scroll', handleScroll)
  }, [])

  /**
   * Função para enviar mensagem usando o novo sistema
   */
  const handleSendMessage = async (): Promise<void> => {
    const trimmedMessage = inputMessage.trim()
    if (!trimmedMessage || isLoading) return
    
    try {
      await sendMessage(trimmedMessage)
      setInputMessage('') // Limpa o input após enviar
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  /**
   * Handler para tecla Enter
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  /**
   * Handler para botão de opções
   */
  const handleOptionsClick = (): void => {
    setShowOptionsMenu(!showOptionsMenu)
  }

  /**
   * Limpa o histórico do chat
   */
  const handleClearHistory = (): void => {
    clearMessages()
    setShowOptionsMenu(false)
  }

  /**
   * Mostra exemplos de perguntas
   */
  const handleShowExamples = async (): Promise<void> => {
    setShowOptionsMenu(false)
    setInputMessage('Como funciona o sistema de preços?')
    // Simula envio automático
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  /**
   * Envia sugestão de pergunta
   */
  const handleSuggestion = (suggestion: string): void => {
    setShowOptionsMenu(false)
    setInputMessage(suggestion)
  }

  /**
   * Formatar timestamp para exibição
   */
  const formatTime = (timestamp: Date): string => {
    return `${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <SidebarLayout>
      {/* Header Moderno com Gradiente */}
      <section className="mt-8 mb-6">
        <div className="bg-gradient-to-r from-[#F7931E] via-[#FF8C00] to-[#F7931E] rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-xl animate-bounce-slow">
              <Bot className="w-9 h-9 text-white drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-white text-3xl sm:text-4xl font-black mb-1" style={{ textShadow: '3px 3px 10px rgba(0,0,0,0.8), 0px 0px 20px rgba(0,0,0,0.6)' }}>
                Chat de Preços IA
              </h1>
              <p className="text-white text-sm sm:text-base font-bold flex items-center gap-2" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8), 0px 0px 10px rgba(0,0,0,0.5)' }}>
                <Sparkles className="w-4 h-4 animate-pulse drop-shadow-lg" />
                Compare preços instantaneamente com inteligência artificial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Container com Gradiente Sutil */}
      <section 
        className="relative flex-1 bg-gradient-to-br from-white to-orange-50/30 rounded-3xl border-2 border-gray-100 
                   shadow-infohub p-4 sm:p-6 md:p-8 
                   flex flex-col overflow-hidden min-h-[600px]"
      >
        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2 chat-messages"
        >
          {/* Mensagem de boas-vindas se não houver mensagens */}
          {!hasMessages && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Bem-vindo ao Chat de Preços IA!</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Faça perguntas sobre produtos, preços e promoções. Nossa IA está aqui para ajudar você a encontrar as melhores ofertas!
              </p>
              
              {/* Sugestões rápidas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {PERGUNTAS_EXEMPLO.slice(0, 4).map((pergunta, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(pergunta)}
                    className="p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 text-left hover:shadow-md hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{pergunta}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mensagens do chat */}
          {messages.map((msg, index) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 sm:gap-4 animate-fade-in ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Mensagem da IA */}
              {msg.tipo === 'ia' && (
                <>
                  {/* Avatar do Bot */}
                  <div className="flex-shrink-0 relative group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#F7931E] to-[#FF8C00] p-2 shadow-lg flex items-center justify-center ring-2 ring-orange-200/50 group-hover:ring-orange-300 transition-all">
                      <Bot className="w-full h-full text-white" />
                    </div>
                    {/* Indicador online */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  </div>

                  {/* Card da Mensagem IA */}
                  <div className="flex-1 max-w-3xl">
                    <div className="chat-message-ai p-4 hover:shadow-xl transition-all">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500">IA InfoHub</span>
                          <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                        </div>
                        {/* Badge da fonte */}
                        {msg.fonte && (
                          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-semibold text-green-600">
                              {msg.fonte}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Texto */}
                      <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {msg.texto}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Mensagem do Usuário */}
              {msg.tipo === 'usuario' && (
                <>
                  {/* Card da Mensagem Usuário */}
                  <div className="flex-1 max-w-2xl flex justify-end">
                    <div className="chat-message-user p-4 hover:shadow-xl transition-all">
                      {/* Header */}
                      <div className="flex items-center justify-end gap-2 mb-2">
                        <span className="text-xs text-white/70">{formatTime(msg.timestamp)}</span>
                        <span className="text-xs font-bold text-white/90">Você</span>
                      </div>
                      {/* Texto */}
                      <div className="text-white text-sm sm:text-base leading-relaxed whitespace-pre-line text-right">
                        {msg.texto}
                      </div>
                    </div>
                  </div>

                  {/* Avatar do Usuário */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-2 shadow-lg flex items-center justify-center ring-2 ring-green-200/50">
                      <User className="w-full h-full text-white" />
                    </div>
                  </div>
                </>
              )}

              {/* Mensagem de Erro */}
              {msg.tipo === 'erro' && (
                <>
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-100 p-2 shadow-lg flex items-center justify-center">
                      <X className="w-full h-full text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1 max-w-3xl">
                    <div className="chat-message-error p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-red-600">Sistema</span>
                        <span className="text-xs text-red-500">{formatTime(msg.timestamp)}</span>
                      </div>
                      <div className="text-red-800 text-sm leading-relaxed">
                        {msg.texto}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 animate-fade-in justify-start">
              <div className="flex-shrink-0 relative group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#F7931E] to-[#FF8C00] p-2 shadow-lg flex items-center justify-center ring-2 ring-orange-200/50 animate-pulse-slow">
                  <Bot className="w-full h-full text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white animate-ping" />
              </div>

              <div className="flex-1 max-w-3xl">
                <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-lg border-l-4 border-[#F7931E]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-500">IA InfoHub</span>
                    <span className="text-xs text-gray-400">digitando...</span>
                  </div>
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Menu de Opções */}
        {hasMessages && (
          <div className="mb-4">
            <button 
              onClick={handleOptionsClick}
              className="w-full bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between border-2 border-gray-100"
            >
              <div className="flex items-center gap-3">
                <List className="w-5 h-5 text-orange-600" />
                <span>{showOptionsMenu ? 'Fechar Opções' : 'Ver Opções e Sugestões'}</span>
              </div>
              <div className={`transition-transform duration-300 ${showOptionsMenu ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {showOptionsMenu && (
              <div className="mt-3 bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-100 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {PERGUNTAS_EXEMPLO.slice(0, 4).map((pergunta, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestion(pergunta)}
                      className="text-left p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all hover:shadow-md"
                    >
                      <span className="text-sm font-medium text-gray-700">{pergunta}</span>
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleShowExamples}
                    className="flex-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Como funciona?</span>
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Limpar Chat</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Container */}
        <div className="relative">
          <div className="flex gap-3 items-center bg-white p-2 rounded-3xl shadow-xl border-2 border-gray-100 hover:border-orange-300 transition-all chat-input">
            <Input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite o produto que você procura... (ex: leite, carne, frango)"
              disabled={isLoading}
              className="flex-1 h-12 sm:h-14 bg-transparent rounded-full px-5 sm:px-6 text-sm sm:text-base 
                         border-0 focus-visible:ring-0 focus-visible:ring-offset-0 
                         placeholder:text-gray-400 disabled:opacity-70"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="chat-button-primary w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0 p-0 
                         hover:scale-105 active:scale-95 transition-all duration-300 
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white" />
              ) : (
                <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 text-center mt-2">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Pressione Enter para enviar
          </p>
        </div>
        
        {/* Botão Voltar ao Topo */}
        {showScrollTop && (
          <button
            onClick={() => chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 bg-gradient-to-r from-[#F7931E] to-[#FF8C00] text-white w-12 h-12 rounded-full shadow-2xl hover:shadow-xl hover:scale-110 transition-all z-50 flex items-center justify-center group"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        )}
      </section>
    </SidebarLayout>
  )
}

// Componente principal com Provider
function ChatPrecos() {
  return (
    <ChatProvider>
      <ChatPrecosContent />
    </ChatProvider>
  )
}

export default ChatPrecos
