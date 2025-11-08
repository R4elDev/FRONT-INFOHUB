import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Coins, Trophy, ShoppingCart, Star, ThumbsUp, MessageCircle, TrendingUp, Target } from "lucide-react"
import esferaAmarela from "../../assets/esferaAmarelaInfoCash.png"
import esferaVermelha from "../../assets/esferaVermelhaInfoCah.png"
import iconPerfilComentario from "../../assets/iconPerfilComentario.png"
import iconDePaginaComentario from "../../assets/iconDePaginaComentario.png"


export default function InfoCash() {
  const [hubCoins, setHubCoins] = useState(0)
  const targetCoins = 1285
  
  // Animação de contagem de moedas
  useEffect(() => {
    let current = 0
    const increment = targetCoins / 50
    const timer = setInterval(() => {
      current += increment
      if (current >= targetCoins) {
        setHubCoins(targetCoins)
        clearInterval(timer)
      } else {
        setHubCoins(Math.floor(current))
      }
    }, 20)
    return () => clearInterval(timer)
  }, [])

  return (
    <SidebarLayout>
      <div className="relative min-h-screen -mx-6 md:-mx-12 -mb-12 bg-gradient-to-br from-gray-50 to-orange-50 overflow-hidden w-full max-w-full">
        {/* Esferas decorativas otimizadas - sem overflow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            src={esferaAmarela} 
            alt="decoração" 
            className="absolute left-0 bottom-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 
                      transition-transform duration-700 ease-out transform-gpu will-change-transform
                      animate-float opacity-80 z-0"
            style={{
              transform: 'translate3d(0, 0, 0)'
            }}
          />
          <img 
            src={esferaVermelha} 
            alt="decoração" 
            className="absolute right-0 bottom-0 w-22 h-22 sm:w-26 sm:h-26 md:w-30 md:h-30 
                      transition-transform duration-700 ease-out transform-gpu will-change-transform
                      animate-float opacity-80 z-0"
            style={{
              animationDelay: '1s',
              transform: 'translate3d(0, 0, 0)'
            }}
          />
        </div>

        <div className="relative z-10 px-4 sm:px-6 md:px-12 py-6 w-full max-w-full overflow-hidden">
          {/* Header Fixo Moderno */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-orange-100 p-4 mb-6 sticky top-4 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center shadow-lg">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">InfoCash</h1>
                  <p className="text-xs text-gray-500">Seu saldo de recompensas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium">Ranking</p>
                <p className="text-lg font-bold text-[#F9A01B]">#972</p>
              </div>
            </div>
          </div>

          {/* Card de Saldo - Destaque Principal */}
          <div className="relative bg-gradient-to-br from-[#F9A01B] via-[#FF8C00] to-[#FF6B00] rounded-3xl shadow-2xl p-6 mb-6 overflow-hidden">
            {/* Efeito de partículas */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute w-32 h-32 rounded-full bg-white top-0 right-0 transform translate-x-16 -translate-y-16 blur-2xl"></div>
              <div className="absolute w-24 h-24 rounded-full bg-white bottom-0 left-0 transform -translate-x-12 translate-y-12 blur-2xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Coins className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-white/90 text-sm font-medium">Seu Saldo</p>
                  <p className="text-white text-xs opacity-80">HubCoins acumulados</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-black text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                    {hubCoins.toLocaleString()}
                  </span>
                  <span className="text-2xl font-bold text-white/80">HC</span>
                </div>
                <p className="text-white/70 text-sm">≈ R$ {(hubCoins * 0.01).toFixed(2)}</p>
              </div>
              
              {/* Barra de Progresso Moderna */}
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 mb-3">
                <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-green-400 via-yellow-300 to-white rounded-full transition-all duration-1000 ease-out"
                    style={{ width: '80%' }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-white/90 text-xs">
                <span>Nível: Intermediário</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Próximo: 1.500 HC</span>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-white text-[#F9A01B] font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                Ver Histórico
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 transition-all duration-300 ease-out transform-gpu will-change-transform hover:shadow-xl w-full max-w-full overflow-hidden">

            {/* Conquistas - Moderna */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#F9A01B]" />
                  <h2 className="font-bold text-gray-800">Suas Conquistas</h2>
                </div>
                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full font-bold shadow-sm">
                  14 Desbloqueadas
                </span>
              </div>
              
              {/* Carrossel de Conquistas */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex-shrink-0 w-28 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-3 text-center hover:scale-105 transition-all cursor-pointer border border-yellow-200 shadow-sm">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg relative">
                    🎯
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700 shadow-md border-2 border-white">
                      3
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-700 leading-tight mb-1">Caçador de Ofertas</p>
                  <div className="flex justify-center gap-0.5">
                    <span className="text-yellow-500 text-xs">🥇🥇🥇</span>
                  </div>
                </div>

                <div className="flex-shrink-0 w-28 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-3 text-center hover:scale-105 transition-all cursor-pointer border border-purple-200 shadow-sm">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl shadow-lg relative">
                    ⭐
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700 shadow-md border-2 border-white">
                      4
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-700 leading-tight mb-1">Top Colaborador</p>
                  <div className="flex justify-center gap-0.5">
                    <span className="text-yellow-500 text-xs">🥇🥇🥇🥇</span>
                  </div>
                </div>

                <div className="flex-shrink-0 w-28 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-3 text-center hover:scale-105 transition-all cursor-pointer border border-blue-200 shadow-sm">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-2xl shadow-lg relative">
                    ✓
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700 shadow-md border-2 border-white">
                      3
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-700 leading-tight mb-1">Verificador Expert</p>
                  <div className="flex justify-center gap-0.5">
                    <span className="text-yellow-500 text-xs">🥇🥇🥇</span>
                  </div>
                </div>

                <div className="flex-shrink-0 w-28 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-3 text-center hover:scale-105 transition-all cursor-pointer border border-green-200 shadow-sm">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl shadow-lg relative">
                    💰
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700 shadow-md border-2 border-white">
                      4
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-700 leading-tight mb-1">Economizador Pro</p>
                  <div className="flex justify-center gap-0.5">
                    <span className="text-yellow-500 text-xs">🥇🥇🥇🥇</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Como Ganhar HubCoins - Moderna */}
            <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-lg border border-orange-100 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#F9A01B]" />
                <h2 className="font-bold text-gray-800">Ganhe Mais HubCoins</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center group cursor-pointer">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <ShoppingCart className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                      ✓
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-700 mb-1">Verificar</p>
                  <p className="text-xs text-gray-500 leading-tight">+10 HC</p>
                </div>

                <div className="text-center group cursor-pointer">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Coins className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                      +
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-700 mb-1">Cadastrar</p>
                  <p className="text-xs text-gray-500 leading-tight">+25 HC</p>
                </div>

                <div className="text-center group cursor-pointer">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-700 mb-1">Avaliar</p>
                  <p className="text-xs text-gray-500 leading-tight">+15 HC</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-blue-700 font-medium">💡 Progresso: Você completou 2 de 5 atividades hoje!</p>
              </div>

              <button className="w-full py-3.5 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00]">
                🚀 Começar a Ganhar
              </button>
            </div>

            {/* Comunidade - Comentário Destacado */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#F9A01B]" />
                  <h2 className="font-bold text-gray-800">Comunidade</h2>
                </div>
                <span className="text-xs text-gray-500 font-medium">Recente</span>
              </div>

              {/* Card do Comentário */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-all mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <img 
                    src={iconPerfilComentario} 
                    alt="perfil" 
                    className="w-10 h-10 rounded-full border-2 border-orange-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm mb-0.5">Usuário Ativo</p>
                    <p className="text-xs text-gray-500">Há 2 horas</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                </div>

                <p className="text-sm font-semibold text-gray-700 mb-2">Ótimo atendimento e produtos de qualidade</p>
                
                <div className="bg-gradient-to-r from-orange-100 to-yellow-50 border border-orange-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                    Adorei fazer compras aqui! Tudo muito organizado e os funcionários são super atenciosos. Recomendo demais! 🛒✨
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-gray-600 hover:text-[#F9A01B] transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs font-medium">12</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-gray-600 hover:text-[#F9A01B] transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">3</span>
                  </button>
                </div>
              </div>

              {/* Botão Ver Todos */}
              <Link 
                to="/infocash/comentarios" 
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-50 to-orange-50 border border-gray-200 rounded-xl p-3.5 hover:shadow-md hover:border-orange-200 transition-all group"
              >
                <img src={iconDePaginaComentario} alt="comentários" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-gray-700 font-bold text-sm group-hover:text-[#F9A01B] transition-colors">
                  Ver Todos os Comentários
                </span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#F9A01B] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
