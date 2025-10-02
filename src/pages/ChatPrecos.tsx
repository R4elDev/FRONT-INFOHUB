import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Send, List } from 'lucide-react'
import SidebarLayout from '../components/layouts/SidebarLayout'
import iconRobo from '../assets/iconRobo.png'

function ChatPrecos() {
  const navigate = useNavigate()
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Array<{ text: string; time: string; isBot: boolean }>>([])

  // Verifica se o usuário está logado
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  // Mensagem inicial do bot
  useEffect(() => {
    const now = new Date()
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
    
    setMessages([{
      text: 'Olá! Sou sua assistente de compras inteligente. Posso ajudar você a encontrar os melhores preços de qualquer produto. Digite o nome do produto que você procura!',
      time: timeString,
      isBot: true
    }])
  }, [])

  const handleSendMessage = (): void => {
    const trimmedMessage = message.trim()
    if (trimmedMessage) {
      const now = new Date()
      const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
      
      // Adiciona mensagem do usuário
      setMessages(prev => [...prev, {
        text: trimmedMessage,
        time: timeString,
        isBot: false
      }])
      
      // Simula resposta do bot
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: `Buscando os melhores preços para "${trimmedMessage}"...`,
          time: timeString,
          isBot: true
        }])
      }, 1000)
      
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const handleOptionsClick = (): void => {
    console.log('Opções abertas')
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
                <div className="text-[#F9A01B] font-bold text-base sm:text-lg md:text-xl mb-2">
                  {msg.time}
                </div>
                <p className={`text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed ${
                  msg.isBot ? '' : 'bg-green-100 inline-block px-4 py-2 rounded-lg'
                }`}>
                  {msg.text}
                </p>

                {/* Welcome Box - apenas na primeira mensagem */}
                {index === 0 && (
                  <div className="bg-gradient-to-br from-[#ffb74d] to-[#ffa726] p-6 sm:p-8 rounded-xl mt-6 shadow-lg">
                    <div className="text-black font-semibold text-lg sm:text-xl mb-2">
                      Olá usuário, seja bem-vindo!
                    </div>
                    <div className="text-black text-base sm:text-lg mb-4">
                      Selecione a opção que deseja escolher:
                    </div>
                    <hr className="border-white/50 mb-4" />
                    <Button 
                      onClick={handleOptionsClick}
                      className="w-full bg-white/20 hover:bg-white/30 text-black font-semibold text-base sm:text-lg 
                                 py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 
                                 hover:-translate-y-1 flex items-center justify-center gap-3 border border-white/30"
                    >
                      <List className="w-5 h-5 sm:w-6 sm:h-6" />
                      Abrir opções
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Container */}
        <div className="flex gap-3 sm:gap-4 items-center bg-gray-50 p-3 sm:p-4 rounded-2xl 
                        shadow-[0_2px_15px_rgba(0,0,0,0.08)] border border-gray-100">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite o produto que você procura..."
            className="flex-1 h-12 sm:h-14 bg-white rounded-full px-5 sm:px-6 text-sm sm:text-base 
                       border-0 focus-visible:ring-2 focus-visible:ring-[#F9A01B] 
                       placeholder:text-gray-400 shadow-sm"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-[#25992E] hover:bg-[#1f7a24] w-12 h-12 sm:w-14 sm:h-14 rounded-xl 
                       flex-shrink-0 p-0 hover:scale-110 active:scale-95 transition-all duration-300 
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
      </section>
    </SidebarLayout>
  )
}

export default ChatPrecos
