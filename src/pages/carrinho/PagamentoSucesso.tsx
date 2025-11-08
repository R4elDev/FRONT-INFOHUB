import { Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom"
import { CheckCircle, Package, MapPin, CreditCard, Clock, Sparkles, ShoppingBag, Home, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import SidebarLayout from "../../components/layouts/SidebarLayout"

// Animações CSS customizadas ESTILO MERCADO PAGO
const styles = document.createElement('style')
styles.textContent = `
  @keyframes confetti-fall {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
  
  @keyframes bounce-celebrate {
    0%, 100% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.1) rotate(-5deg); }
    75% { transform: scale(1.1) rotate(5deg); }
  }
  
  @keyframes pulse-success {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
    50% { transform: scale(1.05); box-shadow: 0 0 20px 10px rgba(34, 197, 94, 0); }
  }
  
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* ANIMAÇÃO ESTILO MERCADO PAGO */
  @keyframes check-appear {
    0% {
      transform: scale(0) rotate(-45deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.2) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  @keyframes circle-fill {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }
  
  @keyframes fade-in-scale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .confetti {
    position: fixed;
    width: 10px;
    height: 10px;
    z-index: 9999;
    animation: confetti-fall 3s linear forwards;
  }
  
  .animate-bounce-celebrate {
    animation: bounce-celebrate 1s ease-in-out infinite;
  }
  
  .animate-pulse-success {
    animation: pulse-success 2s ease-in-out infinite;
  }
  
  .animate-slide-up {
    animation: slide-up 0.5s ease-out forwards;
  }
  
  .animate-check-appear {
    animation: check-appear 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  
  .animate-circle-fill {
    animation: circle-fill 0.5s ease-out forwards;
  }
  
  .animate-ripple {
    animation: ripple 1s ease-out forwards;
  }
  
  .animate-fade-in-scale {
    animation: fade-in-scale 0.4s ease-out forwards;
  }
`
if (!document.head.querySelector('style[data-pagamento-sucesso-animations]')) {
  styles.setAttribute('data-pagamento-sucesso-animations', 'true')
  document.head.appendChild(styles)
}

function PagamentoSucesso() {
  const navigate = useNavigate()
  const [showProcessing, setShowProcessing] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showContent, setShowContent] = useState(false)
  
  // Animação de processamento -> sucesso (estilo Mercado Pago)
  useEffect(() => {
    // Fase 1: Processando (2 segundos)
    const processingTimer = setTimeout(() => {
      setShowProcessing(false)
      setShowSuccess(true)
    }, 2000)
    
    // Fase 2: Sucesso aparece (1 segundo)
    const successTimer = setTimeout(() => {
      setShowSuccess(false)
      setShowContent(true)
    }, 3500)
    
    return () => {
      clearTimeout(processingTimer)
      clearTimeout(successTimer)
    }
  }, [])
  
  // Criar confete (só quando mostrar conteúdo)
  useEffect(() => {
    if (!showContent) return
    const colors = ['#FFA726', '#FF8C00', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    const confettiCount = 50
    
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div')
        confetti.className = 'confetti'
        confetti.style.left = Math.random() * 100 + '%'
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        confetti.style.animationDelay = Math.random() * 0.5 + 's'
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's'
        document.body.appendChild(confetti)
        
        setTimeout(() => {
          confetti.remove()
        }, 5000)
      }, i * 30)
    }
  }, [showContent])

  // Dados do pedido (virão do contexto depois)
  const pedido = {
    numero: "#12345",
    data: new Date().toLocaleDateString('pt-BR'),
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    total: 31.97,
    formaPagamento: "Cartão de Crédito",
    endereco: "Rua Exemplo, 123 - Centro, São Paulo - SP",
    previsaoEntrega: "30-45 minutos"
  }

  return (
    <SidebarLayout>
      {/* MODAL DE PROCESSAMENTO E SUCESSO - ESTILO MERCADO PAGO */}
      {(showProcessing || showSuccess) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-scale">
          <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-md mx-4">
            {showProcessing && (
              <div className="text-center">
                {/* Loading Spinner */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto">
                    <Loader2 className="w-32 h-32 text-[#FFA726] animate-spin" strokeWidth={3} />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-3">
                  Processando pagamento...
                </h2>
                <p className="text-gray-600">
                  Aguarde enquanto confirmamos sua transação
                </p>
              </div>
            )}
            
            {showSuccess && (
              <div className="text-center">
                {/* Check Verde Animado - ESTILO MERCADO PAGO */}
                <div className="relative mb-8 flex items-center justify-center">
                  {/* Círculo de fundo com ripple */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-green-500/20 animate-ripple"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-green-500/30 animate-ripple" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  
                  {/* Círculo principal */}
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center animate-circle-fill shadow-2xl">
                    <CheckCircle className="w-20 h-20 text-white animate-check-appear" strokeWidth={3} />
                  </div>
                </div>
                
                <h2 className="text-3xl font-black text-gray-800 mb-3 animate-fade-in-scale" style={{ animationDelay: '0.3s' }}>
                  Pagamento Aprovado!
                </h2>
                <p className="text-lg text-green-600 font-bold animate-fade-in-scale" style={{ animationDelay: '0.4s' }}>
                  ✓ Transação realizada com sucesso
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* CONTEÚDO PRINCIPAL */}
      {showContent && (
      <div className="min-h-[80vh] flex items-center justify-center py-8 px-2 sm:px-4">
        <div className="w-full max-w-3xl">
          {/* Card Principal - LAYOUT PREMIUM */}
          <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-8 sm:p-12 text-center animate-slide-up overflow-hidden relative">
            {/* Gradiente de fundo sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 via-transparent to-blue-50/40 pointer-events-none"></div>
            
            <div className="relative z-10">
              {/* Badge de Sucesso no topo */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
                <CheckCircle className="w-5 h-5" />
                <span>PAGAMENTO CONFIRMADO</span>
              </div>
              
              {/* Ícone de Sucesso com Animação */}
              <div className="mb-8 flex justify-center relative">
                <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse-success shadow-2xl">
                  <CheckCircle className="w-16 h-16 text-white" strokeWidth={3} />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-bounce-celebrate" />
                <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-orange-400 animate-bounce-celebrate" style={{ animationDelay: '0.3s' }} />
              </div>

              {/* Título */}
              <h1 className="text-4xl sm:text-5xl font-black text-gray-800 mb-3 tracking-tight">
                Pedido Realizado!
              </h1>
              <p className="text-xl sm:text-2xl text-green-600 font-bold mb-3">
                🎉 Sua compra foi confirmada com sucesso
              </p>
              <p className="text-base text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Estamos preparando seu pedido com todo carinho. Você receberá atualizações em tempo real por e-mail e WhatsApp!
              </p>
            </div>

            {/* Número do Pedido */}
            <div className="bg-gradient-to-r from-[#FFA726] to-[#FF8C00] rounded-2xl p-8 mb-8 shadow-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Package className="w-6 h-6 text-white" />
                <p className="text-white text-base font-bold">Número do Pedido</p>
              </div>
              <p className="text-white text-4xl sm:text-5xl font-black mb-3">{pedido.numero}</p>
              <div className="flex items-center justify-center gap-2 text-white/90">
                <Clock className="w-4 h-4" />
                <p className="text-sm">
                  {pedido.data} às {pedido.hora}
                </p>
              </div>
            </div>

            {/* Detalhes do Pedido */}
            <div className="space-y-4 mb-10 text-left animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {/* Previsão de Entrega */}
              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Previsão de Entrega</p>
                  <p className="text-gray-600">{pedido.previsaoEntrega}</p>
                </div>
              </div>

              {/* Endereço */}
              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-[#FFA726] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Endereço de Entrega</p>
                  <p className="text-gray-600">{pedido.endereco}</p>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Forma de Pagamento</p>
                  <p className="text-gray-600">{pedido.formaPagamento}</p>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">Total do Pedido</p>
                  <p className="text-3xl font-black text-green-600">R$ {pedido.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Mensagem */}
            <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-6 mb-10 border-2 border-green-200 animate-slide-up relative z-10" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <p className="text-xl font-black text-gray-800">Obrigado pela confiança!</p>
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-gray-700 leading-relaxed font-medium">
                Você receberá atualizações em tempo real sobre o status do seu pedido por e-mail, SMS e WhatsApp.
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up relative z-10" style={{ animationDelay: '0.5s' }}>
              <Button
                onClick={() => navigate('/HomeInicial')}
                className="flex-1 h-16 bg-gradient-to-r from-[#FFA726] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FFA726] text-white font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-3 text-lg"
              >
                <Home className="w-6 h-6" />
                Voltar ao Início
              </Button>
              <Button
                onClick={() => navigate('/promocoes')}
                className="flex-1 h-16 bg-white border-2 border-[#FFA726] text-[#FFA726] hover:bg-[#FFA726] hover:text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-3 text-lg"
              >
                <ShoppingBag className="w-6 h-6" />
                Continuar Comprando
              </Button>
            </div>
            </div>
          </div>

          {/* Informação Adicional */}
          <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
              <p className="text-base text-gray-700 font-semibold mb-2">
                📞 Precisa de ajuda?
              </p>
              <p className="text-sm text-gray-600">
                Nossa equipe está disponível 24/7 para atender você
              </p>
            </div>
          </div>
        </div>
      </div>
      )}
    </SidebarLayout>
  )
}

export default PagamentoSucesso
