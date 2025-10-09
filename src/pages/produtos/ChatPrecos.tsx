import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Send, List, Loader2, Trash2, HelpCircle, X } from 'lucide-react'
import SidebarLayout from '../../components/layouts/SidebarLayout'
import iconRobo from '../../assets/iconRobo.png'
import { interagirComIA } from '../../services/requests'
import type { chatMessage } from '../../services/types'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      {/* Title Section */}
      <section className="mt-8">
        <h1 className="text-[#F9A01B] text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
          Chat de Preços IA
        </h1>
        <p className="text-[#F9A01B] text-base sm:text-lg md:text-xl mb-6">
          Compare preços instantaneamente com nossa inteligência artificial
        </p>
      </section>

      {/* Chat Container */}
      <section 
        className="flex-1 bg-white rounded-3xl border border-gray-100 
                   shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 sm:p-6 md:p-8 
                   flex flex-col overflow-hidden"
      >
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className="flex gap-4 sm:gap-6">
              {/* Robot Avatar */}
              {msg.isBot && (
                <div className="flex-shrink-0">
                  <img 
                    src={iconRobo} 
                    alt="Robô IA" 
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                  />
                </div>
              )}

              {/* Message Content */}
              <div className={`flex-1 ${msg.isBot ? 'border-l-4 border-orange-200 pl-4 sm:pl-6' : 'text-right'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-[#F9A01B] font-bold text-base sm:text-lg md:text-xl">
                    {msg.time}
                  </div>
                  {/* Mostra nível de confiança da IA (apenas para mensagens do bot) */}
                  {msg.isBot && msg.confidence !== undefined && msg.confidence > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {(msg.confidence * 100).toFixed(0)}% confiança
                    </span>
                  )}
                </div>
                <div className={`text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-line ${
                  msg.isBot ? '' : 'bg-green-100 inline-block px-4 py-2 rounded-lg'
                }`}>
                  {msg.text}
                </div>

                {/* Welcome Box - apenas na primeira mensagem */}
                {index === 0 && (
                  <div className="bg-gradient-to-br from-[#ffb74d] to-[#ffa726] p-6 sm:p-8 rounded-xl mt-6 shadow-lg relative">
                    <div className="text-black font-semibold text-lg sm:text-xl mb-2">
                      Olá! Seja bem-vindo! 👋
                    </div>
                    <div className="text-black text-base sm:text-lg mb-4">
                      Precisa de ajuda? Veja as opções disponíveis:
                    </div>
                    <hr className="border-white/50 mb-4" />
                    <Button 
                      onClick={handleOptionsClick}
                      className="w-full bg-white/20 hover:bg-white/30 text-black font-semibold text-base sm:text-lg 
                                 py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 
                                 hover:-translate-y-1 flex items-center justify-center gap-3 border border-white/30"
                    >
                      <List className="w-5 h-5 sm:w-6 sm:h-6" />
                      {showOptionsMenu ? 'Fechar opções' : 'Abrir opções'}
                    </Button>
                    
                    {/* Menu de Opções */}
                    {showOptionsMenu && (
                      <div className="mt-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/50 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-black font-bold text-base">Menu de Opções</h3>
                          <button 
                            onClick={() => setShowOptionsMenu(false)}
                            className="text-black/60 hover:text-black transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {/* Sugestões rápidas */}
                          <div className="text-black/80 text-sm font-semibold mb-2">💡 Sugestões rápidas:</div>
                          <button
                            onClick={() => handleSuggestion('quero carne moída perto de mim')}
                            className="w-full text-left px-3 py-2 bg-white/50 hover:bg-white text-black rounded-lg text-sm transition-all hover:shadow-md"
                          >
                            🥩 Carne moída perto de mim
                          </button>
                          <button
                            onClick={() => handleSuggestion('leite mais barato')}
                            className="w-full text-left px-3 py-2 bg-white/50 hover:bg-white text-black rounded-lg text-sm transition-all hover:shadow-md"
                          >
                            🥛 Leite mais barato
                          </button>
                          <button
                            onClick={() => handleSuggestion('quais as promoções?')}
                            className="w-full text-left px-3 py-2 bg-white/50 hover:bg-white text-black rounded-lg text-sm transition-all hover:shadow-md"
                          >
                            🛍️ Ver todas as promoções
                          </button>
                          <button
                            onClick={() => handleSuggestion('frango barato')}
                            className="w-full text-left px-3 py-2 bg-white/50 hover:bg-white text-black rounded-lg text-sm transition-all hover:shadow-md"
                          >
                            🍗 Frango barato
                          </button>
                          
                          <hr className="border-black/20 my-3" />
                          
                          {/* Ações */}
                          <div className="text-black/80 text-sm font-semibold mb-2">⚙️ Ações:</div>
                          <button
                            onClick={handleShowExamples}
                            className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-black rounded-lg text-sm transition-all hover:shadow-md flex items-center gap-2"
                          >
                            <HelpCircle className="w-4 h-4" />
                            Como funciona?
                          </button>
                          <button
                            onClick={handleClearHistory}
                            className="w-full text-left px-3 py-2 bg-red-50 hover:bg-red-100 text-black rounded-lg text-sm transition-all hover:shadow-md flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Limpar histórico
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <img 
                  src={iconRobo} 
                  alt="Robô IA" 
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain animate-pulse"
                />
              </div>
              <div className="flex-1 border-l-4 border-orange-200 pl-4 sm:pl-6">
                <div className="text-[#F9A01B] font-bold text-base sm:text-lg md:text-xl mb-2">
                  Processando...
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>A IA está analisando sua pergunta...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Elemento invisível para scroll automático */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div className="flex gap-3 sm:gap-4 items-center bg-gray-50 p-3 sm:p-4 rounded-2xl 
                        shadow-[0_2px_15px_rgba(0,0,0,0.08)] border border-gray-100">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite o produto que você procura..."
            className="flex-1 h-12 sm:h-14 bg-white rounded-full px-5 sm:px-6 text-sm sm:text-base 
                       border-0 focus-visible:ring-2 focus-visible:ring-[#F9A01B] 
                       placeholder:text-gray-400 shadow-sm"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="bg-[#25992E] hover:bg-[#1f7a24] w-12 h-12 sm:w-14 sm:h-14 rounded-xl 
                       flex-shrink-0 p-0 hover:scale-110 active:scale-95 transition-all duration-300 
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            ) : (
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </Button>
        </div>
      </section>
    </SidebarLayout>
  )
}

export default ChatPrecos
