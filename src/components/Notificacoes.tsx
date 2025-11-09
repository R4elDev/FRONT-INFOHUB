import { X, Bell, Tag, Package, DollarSign, TrendingDown, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

interface NotificacoesProps {
  isOpen: boolean
  onClose: () => void
}

interface Notificacao {
  id: number
  tipo: 'promocao' | 'pedido' | 'cashback' | 'sistema'
  titulo: string
  mensagem: string
  tempo: string
  lida: boolean
}

const notificacoesData: Notificacao[] = [
  {
    id: 1,
    tipo: 'promocao',
    titulo: 'Nova Promoção!',
    mensagem: 'Arroz integral com 30% de desconto hoje!',
    tempo: 'há 5 min',
    lida: false
  },
  {
    id: 2,
    tipo: 'pedido',
    titulo: 'Pedido Confirmado',
    mensagem: 'Seu pedido #1234 foi confirmado e está sendo preparado.',
    tempo: 'há 1 hora',
    lida: false
  },
  {
    id: 3,
    tipo: 'cashback',
    titulo: 'Cashback Recebido!',
    mensagem: 'Você ganhou R$ 5,00 em InfoCash na sua última compra.',
    tempo: 'há 2 horas',
    lida: false
  },
  {
    id: 4,
    tipo: 'promocao',
    titulo: 'Ofertas Relâmpago',
    mensagem: 'Produtos de limpeza com até 40% OFF por tempo limitado.',
    tempo: 'há 3 horas',
    lida: true
  },
  {
    id: 5,
    tipo: 'sistema',
    titulo: 'Bem-vindo ao InfoHub!',
    mensagem: 'Aproveite as melhores ofertas da sua região.',
    tempo: 'há 1 dia',
    lida: true
  }
]

const getIconByType = (tipo: string) => {
  switch (tipo) {
    case 'promocao':
      return <Tag className="w-5 h-5" />
    case 'pedido':
      return <Package className="w-5 h-5" />
    case 'cashback':
      return <DollarSign className="w-5 h-5" />
    case 'sistema':
      return <Bell className="w-5 h-5" />
    default:
      return <Bell className="w-5 h-5" />
  }
}

const getColorByType = (tipo: string) => {
  switch (tipo) {
    case 'promocao':
      return 'from-red-500 to-pink-500'
    case 'pedido':
      return 'from-green-500 to-emerald-500'
    case 'cashback':
      return 'from-yellow-500 to-orange-500'
    case 'sistema':
      return 'from-blue-500 to-indigo-500'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

export default function Notificacoes({ isOpen, onClose }: NotificacoesProps) {
  const navigate = useNavigate()
  const [notificacoes, setNotificacoes] = useState(notificacoesData)
  const naoLidas = notificacoes.filter(n => !n.lida).length

  const handleMarcarTodasComoLidas = () => {
    setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })))
  }

  const handleLimpar = () => {
    setNotificacoes([])
  }

  const handleVerTodas = () => {
    navigate('/notificacoes')
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 z-40 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel de Notificações */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-gradient-to-b from-white via-gray-50 to-white z-50 shadow-[-4px_0_40px_rgba(0,0,0,0.2)]
        transform transition-all duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#FFA726] via-[#FF8C00] to-[#FFA726] text-white relative overflow-hidden">
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-lg animate-bounce-slow">
                <Bell className="w-6 h-6 animate-bell-ring" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Notificações</h2>
                <p className="text-xs text-white/90">
                  {naoLidas} {naoLidas === 1 ? 'nova' : 'novas'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex gap-2">
            <button 
              onClick={handleMarcarTodasComoLidas}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FFA726] to-[#FF8C00] text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Marcar todas como lidas
            </button>
            <button 
              onClick={handleLimpar}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="overflow-y-auto h-[calc(100vh-220px)] scrollbar-hide">
          {notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 animate-bounce-slow">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-sm text-gray-500">
                Você está em dia! Não há notificações no momento.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notificacoes.map((notificacao, index) => (
                <div
                  key={notificacao.id}
                  className={`group relative bg-white rounded-2xl border-2 p-4 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer animate-fade-in ${
                    notificacao.lida 
                      ? 'border-gray-200 opacity-75' 
                      : 'border-[#FFA726] shadow-md'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Indicador de não lida */}
                  {!notificacao.lida && (
                    <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}

                  <div className="flex gap-3">
                    {/* Ícone */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorByType(notificacao.tipo)} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                      {getIconByType(notificacao.tipo)}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                        {notificacao.titulo}
                        {notificacao.tipo === 'promocao' && (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notificacao.mensagem}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                          {notificacao.tempo}
                        </span>
                        {notificacao.lida && (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-bold">
                            <CheckCircle className="w-3 h-3" />
                            Lida
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FFA726]/0 to-[#FF8C00]/0 group-hover:from-[#FFA726]/5 group-hover:to-[#FF8C00]/5 transition-all pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent border-t border-gray-200">
          <button 
            onClick={handleVerTodas}
            className="w-full py-3 bg-gradient-to-r from-[#FFA726] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FFA726] text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            Ver Todas as Notificações
          </button>
        </div>

        {/* CSS para animação e scrollbar */}
        <style>{`
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
          
          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes bell-ring {
            0%, 100% {
              transform: rotate(0deg);
            }
            10%, 30% {
              transform: rotate(-10deg);
            }
            20%, 40% {
              transform: rotate(10deg);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
          
          .animate-bell-ring {
            animation: bell-ring 1s ease-in-out;
          }
          
          .animate-bell-ring:hover {
            animation: bell-ring 1s ease-in-out infinite;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </aside>
    </>
  )
}
