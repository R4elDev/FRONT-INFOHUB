import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Send, List, Loader2, Trash2, HelpCircle, X, Sparkles, Bot, User, ArrowUp } from 'lucide-react'
import SidebarLayout from '../../components/layouts/SidebarLayout'
import { interagirComIA } from '../../services/requests'
import type { chatMessage } from '../../services/types'

// Animações CSS customizadas
const styles = document.createElement('style')
styles.textContent = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes bounce-slow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes pulse-slow {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.4s ease-out forwards;
  }
  
  .animate-shimmer {
    animation: shimmer 3s infinite linear;
  }
  
  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }
  
  /* Custom scrollbar */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #FED7AA;
    border-radius: 3px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #FDBA74;
  }
`
if (!document.head.querySelector('style[data-chat-animations]')) {
  styles.setAttribute('data-chat-animations', 'true')
  document.head.appendChild(styles)
}

/**
 * CONSTANTES PARA LOCALSTORAGE
 * Usadas para salvar e recuperar o histórico do chat
 */
const CHAT_STORAGE_KEY = 'infohub_chat_messages'
const MOCK_USER_ID = 1 // ID mockado do usuário (em produção viria do contexto de autenticação)

function ChatPrecos() {
  const navigate = useNavigate()
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<chatMessage[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false)
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  /**
   * EFEITO 1: Verificação de autenticação
   * Redireciona para login se não houver token
   */
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  /**
   * EFEITO 2: Carregamento do histórico do localStorage
   * 
   * COMO FUNCIONA:
   * 1. Ao montar o componente, tenta recuperar mensagens salvas
   * 2. Se houver mensagens salvas, carrega elas
   * 3. Se não houver, cria a mensagem de boas-vindas inicial
   * 4. As mensagens são salvas automaticamente a cada mudança (ver EFEITO 3)
   */
  useEffect(() => {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY)
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages) as chatMessage[]
        setMessages(parsedMessages)
        console.log('💾 Histórico de chat carregado:', parsedMessages.length, 'mensagens')
      } catch (error) {
        console.error('❌ Erro ao carregar histórico:', error)
        initializeChat()
      }
    } else {
      initializeChat()
    }
  }, [])

  /**
   * EFEITO 3: Salvar mensagens no localStorage
   * 
   * COMO FUNCIONA:
   * - Sempre que o array de mensagens mudar, salva automaticamente no localStorage
   * - Isso garante que o histórico seja persistido mesmo se o usuário recarregar a página
   * - Ignora a primeira renderização (quando messages está vazio)
   */
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
      console.log('💾 Histórico salvo:', messages.length, 'mensagens')
    }
  }, [messages])

  /**
   * EFEITO 4: Scroll automático para última mensagem
   * Sempre que novas mensagens chegam, rola para o final
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * EFEITO 6: Controle do botão "Voltar ao topo"
   * Monitora o scroll para mostrar/esconder botão
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
   * EFEITO 5: Limpeza ao sair da página
   * 
   * COMO FUNCIONA:
   * - Quando o componente é desmontado (usuário sai da página), limpa o localStorage
   * - Isso garante que ao voltar, o chat comece do zero
   * - Usa beforeunload para capturar também quando o usuário fecha a aba/navegador
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem(CHAT_STORAGE_KEY)
      console.log('🗑️ Histórico de chat limpo ao sair da página')
    }

    // Adiciona listener para quando usuário sair/recarregar a página
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup: remove listener e limpa storage quando componente desmontar
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      localStorage.removeItem(CHAT_STORAGE_KEY)
      console.log('🗑️ Histórico de chat limpo')
    }
  }, [])

  /**
   * Função auxiliar para inicializar o chat com mensagem de boas-vindas
   */
  const initializeChat = () => {
    const now = new Date()
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const welcomeMessage: chatMessage = {
      text: 'Olá! Sou sua assistente de compras inteligente. Posso ajudar você a encontrar os melhores preços de qualquer produto. Digite o nome do produto que você procura!',
      time: timeString,
      isBot: true,
      confidence: 1.0
    }
    
    setMessages([welcomeMessage])
  }

  /**
   * Função para enviar mensagem e obter resposta da IA
   * 
   * COMO FUNCIONA:
   * 1. Valida se a mensagem não está vazia
   * 2. Adiciona a mensagem do usuário ao chat
   * 3. Limpa o input
   * 4. Chama a API mockada (interagirComIA)
   * 5. Adiciona a resposta da IA ao chat
   * 6. Trata erros caso a API falhe
   * 
   * INTEGRAÇÃO COM A API:
   * - Usa a função interagirComIA do services/requests.ts
   * - Envia: { mensagem: string, idUsuario: number }
   * - Recebe: { status, status_code, data: { reply, confidence, response_time_ms } }
   * - A API é mockada, mas a estrutura é idêntica à API real
   */
  const handleSendMessage = async (): Promise<void> => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isLoading) return
    
    const now = new Date()
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
    
    // Adiciona mensagem do usuário
    const userMessage: chatMessage = {
      text: trimmedMessage,
      time: timeString,
      isBot: false
    }
    
    setMessages(prev => [...prev, userMessage])
    setMessage('') // Limpa o input imediatamente
    setIsLoading(true)
    
    try {
      // Chama a API mockada da IA
      const response = await interagirComIA({
        mensagem: trimmedMessage,
        idUsuario: MOCK_USER_ID
      })
      
      // Verifica se a resposta foi bem sucedida
      if (response.status && response.data) {
        const botMessage: chatMessage = {
          text: response.data.reply,
          time: `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`,
          isBot: true,
          confidence: response.data.confidence
        }
        
        setMessages(prev => [...prev, botMessage])
        console.log(`✅ Resposta recebida (confiança: ${(response.data.confidence * 100).toFixed(0)}%, tempo: ${response.data.response_time_ms}ms)`)
      } else {
        // Resposta de erro da API
        const errorMessage: chatMessage = {
          text: response.message || 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
          time: `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`,
          isBot: true,
          confidence: 0
        }
        
        setMessages(prev => [...prev, errorMessage])
        console.error('❌ Erro na resposta da IA:', response.message)
      }
    } catch (error) {
      // Erro na chamada da API
      console.error('❌ Erro ao chamar API:', error)
      
      const errorMessage: chatMessage = {
        text: 'Desculpe, não consegui processar sua mensagem no momento. Por favor, tente novamente.',
        time: `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`,
        isBot: true,
        confidence: 0
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handler para tecla Enter no input
   * Permite enviar mensagem pressionando Enter
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault() // Previne comportamento padrão
      handleSendMessage()
    }
  }

  /**
   * Handler para botão de opções
   * Abre/fecha o menu de opções
   */
  const handleOptionsClick = (): void => {
    setShowOptionsMenu(!showOptionsMenu)
  }

  /**
   * Limpa o histórico do chat
   */
  const handleClearHistory = (): void => {
    localStorage.removeItem(CHAT_STORAGE_KEY)
    initializeChat()
    setShowOptionsMenu(false)
    console.log('🗑️ Histórico limpo manualmente')
  }

  /**
   * Mostra exemplos de perguntas
   */
  const handleShowExamples = async (): Promise<void> => {
    setShowOptionsMenu(false)
    setMessage('como funciona?')
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
    setMessage(suggestion)
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
        className="relative flex-1 bg-gradient-to-br from-white to-orange-50/30 rounded-3xl border border-gray-100 
                   shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 sm:p-6 md:p-8 
                   flex flex-col overflow-hidden"
      >
        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent"
        >
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex gap-3 sm:gap-4 animate-fade-in ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Mensagem da IA */}
              {msg.isBot && (
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
                    <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-lg border-l-4 border-[#F7931E] hover:shadow-xl transition-all">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500">IA InfoHub</span>
                          <span className="text-xs text-gray-400">{msg.time}</span>
                        </div>
                        {/* Badge de Confiança */}
                        {msg.confidence !== undefined && msg.confidence > 0 && (
                          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                            <Sparkles className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-semibold text-green-600">
                              {(msg.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Texto */}
                      <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Mensagem do Usuário */}
              {!msg.isBot && (
                <>
                  {/* Card da Mensagem Usuário */}
                  <div className="flex-1 max-w-2xl flex justify-end">
                    <div className="bg-gradient-to-br from-[#25992E] to-[#1f7a24] rounded-2xl rounded-tr-none p-4 shadow-lg hover:shadow-xl transition-all">
                      {/* Header */}
                      <div className="flex items-center justify-end gap-2 mb-2">
                        <span className="text-xs text-white/70">{msg.time}</span>
                        <span className="text-xs font-bold text-white/90">Você</span>
                      </div>
                      {/* Texto */}
                      <div className="text-white text-sm sm:text-base leading-relaxed whitespace-pre-line text-right">
                        {msg.text}
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
            </div>
          ))}
          
          {/* Welcome Box Premium - apenas se for a primeira mensagem */}
          {messages.length > 0 && messages[0].isBot && (
            <div className="w-full mt-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="max-w-4xl">
                {/* Card de Boas-vindas Moderno */}
                <div className="bg-gradient-to-br from-[#F7931E] via-[#FF8C00] to-[#FFA726] rounded-3xl shadow-2xl">
                  <div className="p-6 sm:p-8">
                    {/* Header com ícone */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-xl animate-bounce-slow">
                        <Sparkles className="w-7 h-7 text-white drop-shadow-lg" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white text-2xl font-black mb-1" style={{ textShadow: '3px 3px 10px rgba(0,0,0,0.8)' }}>
                          Olá! Seja bem-vindo! 👋
                        </h3>
                        <p className="text-white text-sm sm:text-base font-bold" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
                          Estou aqui para ajudar você a encontrar os melhores preços!
                        </p>
                      </div>
                    </div>
                    
                    {/* Divisor elegante */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mb-4" />
                    
                    {/* Botão Expansível Premium */}
                    <button 
                      onClick={handleOptionsClick}
                      className="group w-full bg-white hover:bg-white/95 text-gray-800 font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F7931E] to-[#FF8C00] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <List className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-base sm:text-lg">
                          {showOptionsMenu ? 'Fechar Menu' : 'Ver Opções e Sugestões'}
                        </span>
                      </div>
                      <div className={`transition-transform duration-300 ${showOptionsMenu ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    {/* Menu de Opções Modernizado */}
                    {showOptionsMenu && (
                      <div className="mt-5 bg-white rounded-2xl p-5 shadow-2xl border border-gray-100 animate-fade-in overflow-hidden">
                        {/* Header do Menu */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-gray-800 font-bold text-base">Menu Inteligente</h3>
                          </div>
                          <button 
                            onClick={() => setShowOptionsMenu(false)}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        
                        {/* Sugestões Rápidas */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-lg bg-yellow-100 flex items-center justify-center">
                              <span className="text-sm">💡</span>
                            </div>
                            <h4 className="text-gray-700 text-sm font-bold">Sugestões Rápidas</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              onClick={() => handleSuggestion('quero carne moída perto de mim')}
                              className="group text-left p-3 bg-gradient-to-br from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border border-red-200 rounded-xl transition-all hover:shadow-md hover:scale-[1.02]"
                            >
                              <div className="text-2xl mb-1">🥩</div>
                              <p className="text-xs font-semibold text-gray-700">Carne moída</p>
                            </button>
                            <button
                              onClick={() => handleSuggestion('leite mais barato')}
                              className="group text-left p-3 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 rounded-xl transition-all hover:shadow-md hover:scale-[1.02]"
                            >
                              <div className="text-2xl mb-1">🥛</div>
                              <p className="text-xs font-semibold text-gray-700">Leite barato</p>
                            </button>
                            <button
                              onClick={() => handleSuggestion('quais as promoções?')}
                              className="group text-left p-3 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-xl transition-all hover:shadow-md hover:scale-[1.02]"
                            >
                              <div className="text-2xl mb-1">🛍️</div>
                              <p className="text-xs font-semibold text-gray-700">Promoções</p>
                            </button>
                            <button
                              onClick={() => handleSuggestion('frango barato')}
                              className="group text-left p-3 bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border border-yellow-200 rounded-xl transition-all hover:shadow-md hover:scale-[1.02]"
                            >
                              <div className="text-2xl mb-1">🍗</div>
                              <p className="text-xs font-semibold text-gray-700">Frango barato</p>
                            </button>
                          </div>
                        </div>
                        
                        {/* Divisor */}
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />
                        
                        {/* Ações */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                              <span className="text-sm">⚙️</span>
                            </div>
                            <h4 className="text-gray-700 text-sm font-bold">Ações</h4>
                          </div>
                          <div className="space-y-2">
                            <button
                              onClick={handleShowExamples}
                              className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all hover:shadow-md flex items-center gap-3 group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <HelpCircle className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Como funciona?</p>
                                <p className="text-xs text-gray-500">Veja exemplos de perguntas</p>
                              </div>
                            </button>
                            <button
                              onClick={handleClearHistory}
                              className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all hover:shadow-md flex items-center gap-3 group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Trash2 className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Limpar histórico</p>
                                <p className="text-xs text-gray-500">Apagar todas as mensagens</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading Indicator Moderno - Digitando */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 animate-fade-in justify-start">
              {/* Avatar da IA */}
              <div className="flex-shrink-0 relative group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#F7931E] to-[#FF8C00] p-2 shadow-lg flex items-center justify-center ring-2 ring-orange-200/50 animate-pulse-slow">
                  <Bot className="w-full h-full text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white animate-ping" />
              </div>

              {/* Card de Digitando */}
              <div className="flex-1 max-w-3xl">
                <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-lg border-l-4 border-[#F7931E]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-500">IA InfoHub</span>
                    <span className="text-xs text-gray-400">digitando...</span>
                  </div>
                  {/* Typing Dots Animation */}
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#F7931E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#F7931E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#F7931E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Elemento invisível para scroll automático */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Container Estilo ChatGPT */}
        <div className="relative mb-2">
          <div className="flex gap-3 items-center bg-white p-2 rounded-3xl shadow-xl border-2 border-gray-100 hover:border-[#F7931E]/30 transition-all">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite o produto que você procura... (ex: leite, carne, frango)"
              disabled={isLoading}
              className="flex-1 h-12 sm:h-14 bg-transparent rounded-full px-5 sm:px-6 text-sm sm:text-base 
                         border-0 focus-visible:ring-0 focus-visible:ring-offset-0 
                         placeholder:text-gray-400 disabled:opacity-70"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="bg-gradient-to-r from-[#F7931E] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#F7931E] 
                         w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0 p-0 
                         hover:scale-105 active:scale-95 transition-all duration-300 
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white" />
              ) : (
                <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </Button>
          </div>
          
          {/* Hint text */}
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

export default ChatPrecos
