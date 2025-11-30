import { Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom"
import { CheckCircle, Package, MapPin, CreditCard, Clock, Sparkles, ShoppingBag, Home, Loader2, Star, Store } from "lucide-react"
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
      
      // TOCAR SOM DE SUCESSO!
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGJ1O+4aSEFL3vO8dqMNwcZabvs56BQEQ1Tq+fxuHAhBjiS2fHNfC8GJnjJ8OCXSQ4TYbXq7KxZFQxKotzvw4UqBjKM1++wbyAGL37V8N6VTRAUYrbq7bBXFQ1OqOTvw4QrBjKM1PC1ciQGMH7X8OeeURAVYrjq7LFYFg5PqOTvw4RBDjWR1vDHcyoHMoDU8N2cUhEWY7fr7LJaGBFRqOPuw4QyDDWR1O+6bCEFMH3S793KtioIMIDT8N6aTRAVYrfq7LFZGBBRp+Luw4RBDTaR1PC/dyoHMYDU8N+fVBIXZLjr67JaGBFSqOPvxY0oCS+M0+7Cfi4HMn/R8N+fURIXZLjs7LNbGRJTqePvxo0pCS+M0+69h0YRKHzP8N6gUhMYZrrr67RcGhNUqOPvxowqCjCM0u6+jFERKX3R8OCiUxQZZ7vs7LVdGxRVqOPvxowqCjGN0u/CkFYVKH3R8OGjVBQZZ7vs7bZeGxVWqeTvxowqCzGN0u/CkVkXKH7R8OGkVRUaaLvt7bdgHBZYqOTvxooqCzGN0u/BkFocKH7S8OOlVxYbabzu7rhgHRdZqeXvxo0qCzGN0u/BkV4dKX/T8OSmWhgcabzv7rkgHxlaqu/u++/vxo0qCzGN0u/BkWAdKX/T8OSnWhgcabzw77kgHxlaqu/u++/vxo8qCzCO0u/CkWAeKX/U8OSnWxkdab3w77sgIBpaq/Dv//Awxo8rDDCO0u/CkWAeKX/U8OSnWxkdab3w77sgIBpaq/Dv//Awxo8rDDCO0u/CkWAeKX/U8OSnWxkdab3w77sgIBpaq/Dv//Awxo8rDDGO0u/CkV8eKH7T8OOmWxgcabzw7rkeHxlavPDu++/vxo4rCzCO0u/BkV0cKH3S8OOlWRgbabzu7rkgHRdZqePuxo0qCzGN0u/BkFocKH7S8OGkVRUaaLvt7bdgHBZYqOTvxooqCzGN0u/CkFkXKH7R8OGkVRQZZ7vs7bZeGxVWqeTvxowqCzGN0u/BkFUUKH3R8OCiUxMYZbrs7LVdGxRVqOPvxowqCjGN0u/CkFIRKX3R8OCiUhMXZLnr67RcGhNUqOPvxo0pCS+M0u69iFAQJ3zP8N+gUhIXZLnr7LNbGRJTqePvxY0oCS+M0+68gi4GsH/R8N+fURMXZLjr67JaGBFSqOPvxIYmCSyKz+28Yh8FLHvP796fThEWY7fr7LFZGBBRp+Luw4M9CzOPzu67YhkEKHfO8N6cTRIVYrfp7LBYFg5PqOLuw4ItCy+JzO2xVxMFJ3PK79yaTBEVYbbp7a5XFQ1OqOTvxIMrCCyHyuy1UQ8EJnDI7tySRg8VYbXp7axYFA1MpuHuw4IqCCuFyOu/TQwEJm/I7t2URw8UXrPn66hUEAtJpN/tw4YnCCuEyOu9SwoEJW3F7tqNRgsUXbDm66RQEQ1Mqt/sw4QnCCt+xOu4SAgEJGzE7tmKRQoUXK7k66FNDgxJpt3rwY8kCCuAw+u6RwwEJGzE7tmJRgoUXK/k66NQEg9Lpt3sw48kByt/wuu4RwwEI2vD7tiLRgoTW67k66FQEg9KpdzswY8kByt9wuq3RgsDImrC7deFQwkSWavj6qBPEQ5Ipdrquokic2U=')
      audio.volume = 0.3
      audio.play().catch(e => console.log('Audio play failed:', e))
    }, 2000)
    
    // Fase 2: Sucesso aparece (2 segundos - aumentado)
    const successTimer = setTimeout(() => {
      setShowSuccess(false)
      setShowContent(true)
    }, 4000)
    
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

  // Dados do pedido do localStorage
  const [pedidoData, setPedidoData] = useState<any>(null)
  
  useEffect(() => {
    const ultimoPedido = localStorage.getItem('ultimo_pedido')
    if (ultimoPedido) {
      setPedidoData(JSON.parse(ultimoPedido))
    }
  }, [])

  const pedido = pedidoData ? {
    numero: `#${pedidoData.id}`,
    data: new Date(pedidoData.data_pedido).toLocaleDateString('pt-BR'),
    hora: new Date(pedidoData.data_pedido).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    total: pedidoData.total,
    formaPagamento: pedidoData.pagamento === 'credito' ? 'Cartão de Crédito' : 
                    pedidoData.pagamento === 'debito' ? 'Cartão de Débito' :
                    pedidoData.pagamento === 'pix' ? 'PIX' : 'Dinheiro',
    endereco: `${pedidoData.endereco?.endereco}, ${pedidoData.endereco?.numero} - ${pedidoData.endereco?.bairro}, ${pedidoData.endereco?.cidade} - ${pedidoData.endereco?.estado}`,
    previsaoEntrega: "Pedido Entregue! ✅",
    itens: pedidoData.itens || []
  } : {
    numero: "#12345",
    data: new Date().toLocaleDateString('pt-BR'),
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    total: 0,
    formaPagamento: "Cartão de Crédito",
    endereco: "Endereço não informado",
    previsaoEntrega: "Pedido Entregue! ✅",
    itens: []
  }

  return (
    <SidebarLayout>
      {/* MODAL DE PROCESSAMENTO E SUCESSO - ESTILO MERCADO PAGO */}
      {(showProcessing || showSuccess) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in-scale">
          {/* Loading com card branco */}
          {showProcessing && (
            <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-md mx-4">
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
            </div>
          )}
            
          {/* Tela Verde FULLSCREEN sem card branco */}
          {showSuccess && (
            <>
              {/* FUNDO VERDE FULLSCREEN */}
              <div className="fixed inset-0 bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 animate-fade-in-scale"></div>
              
              <div className="relative z-10 text-center px-4 w-full max-w-2xl">
                
                {/* Partículas brilhantes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
                  <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                  <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-yellow-200 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                  <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                </div>
                
                {/* Check Verde Animado GIGANTE - ESTILO MERCADO PAGO */}
                <div className="relative mb-12 flex items-center justify-center">
                  {/* Círculo de fundo com ripple MAIOR */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 rounded-full bg-white/30 animate-ripple"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 rounded-full bg-white/40 animate-ripple" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 rounded-full bg-white/20 animate-ripple" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  
                  {/* Círculo principal GIGANTE */}
                  <div className="relative w-48 h-48 rounded-full bg-white flex items-center justify-center animate-circle-fill shadow-[0_0_80px_rgba(255,255,255,0.8)]">
                    <CheckCircle className="w-32 h-32 text-green-500 animate-check-appear" strokeWidth={4} />
                  </div>
                  
                  {/* Estrelas ao redor */}
                  <Sparkles className="absolute -top-8 -right-8 w-16 h-16 text-yellow-300 animate-bounce-celebrate" />
                  <Sparkles className="absolute -bottom-8 -left-8 w-12 h-12 text-yellow-200 animate-bounce-celebrate" style={{ animationDelay: '0.3s' }} />
                  <Sparkles className="absolute -top-8 -left-8 w-10 h-10 text-white animate-bounce-celebrate" style={{ animationDelay: '0.5s' }} />
                  <Sparkles className="absolute -bottom-8 -right-8 w-14 h-14 text-yellow-400 animate-bounce-celebrate" style={{ animationDelay: '0.2s' }} />
                </div>
                
                <h2 className="text-5xl md:text-6xl font-black text-white mb-4 animate-fade-in-scale drop-shadow-2xl" style={{ animationDelay: '0.3s' }}>
                  🎉 Pagamento Aprovado!
                </h2>
                <p className="text-2xl md:text-3xl text-white font-bold animate-fade-in-scale drop-shadow-xl" style={{ animationDelay: '0.4s' }}>
                  ✓ Transação realizada com sucesso
                </p>
                <p className="text-lg text-white/90 mt-4 animate-fade-in-scale" style={{ animationDelay: '0.6s' }}>
                  Preparando seu pedido...
                </p>
              </div>
            </>
          )}
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

            {/* Seção de Avaliação - PEDIDO ENTREGUE */}
            <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 rounded-2xl p-6 mb-8 border-2 border-yellow-300 animate-slide-up relative z-10" style={{ animationDelay: '0.35s' }}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <p className="text-xl font-black text-gray-800">Avalie sua compra!</p>
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-gray-700 leading-relaxed font-medium mb-6 text-center">
                Seu pedido foi entregue! Sua opinião é muito importante para nós. Avalie os produtos e o estabelecimento.
              </p>
              
              {/* Produtos para avaliar */}
              {pedido.itens && pedido.itens.length > 0 && (
                <div className="space-y-3 mb-4">
                  <p className="text-sm font-bold text-gray-700">Produtos comprados:</p>
                  {pedido.itens.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
                      <span className="font-medium text-gray-800">{item.nome}</span>
                      <Button
                        onClick={() => navigate(`/avaliar-produto/${item.id}`)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
                      >
                        <Star className="w-4 h-4" />
                        Avaliar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Botão avaliar estabelecimento */}
              <Button
                onClick={() => navigate('/avaliar-estabelecimento/1')}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition-all"
              >
                <Store className="w-5 h-5" />
                Avaliar Estabelecimento
              </Button>
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
