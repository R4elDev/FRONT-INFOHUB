import { X, Bell, Tag, Package, DollarSign, CheckCircle, Trash2, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useNotificacoes } from '../contexts/NotificacoesContext'
import { getIconePorTipo, getCorPorTipo } from '../services/notificacaoService'

interface NotificacoesProps {
  isOpen: boolean
  onClose: () => void
}

const getIconByType = (tipo: string) => {
  switch (tipo) {
    case 'promocao':
      return <Tag className="w-5 h-5" />
    case 'compra':
      return <Package className="w-5 h-5" />
    case 'social':
      return <DollarSign className="w-5 h-5" />
    case 'alerta':
      return <AlertCircle className="w-5 h-5" />
    case 'carrinho':
      return <Bell className="w-5 h-5" />
    default:
      return <Bell className="w-5 h-5" />
  }
}

export default function Notificacoes({ isOpen, onClose }: NotificacoesProps) {
  const navigate = useNavigate()
  const { 
    notificacoes, 
    naoLidas, 
    loading, 
    error,
    marcarComoLida,
    marcarTodasComoLidas,
    deletarNotificacao,
    limparError
  } = useNotificacoes()

  const handleMarcarTodasComoLidas = async () => {
    await marcarTodasComoLidas()
  }

  const handleMarcarComoLida = async (notificacaoId: number) => {
    await marcarComoLida(notificacaoId)
  }

  const handleDeletarNotificacao = async (notificacaoId: number) => {
    if (window.confirm('Deseja realmente deletar esta notificação?')) {
      await deletarNotificacao(notificacaoId)
    }
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
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
              <button 
                onClick={limparError}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <button 
              onClick={handleMarcarTodasComoLidas}
              disabled={loading || naoLidas === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FFA726] to-[#FF8C00] text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Carregando...' : 'Marcar todas como lidas'}
            </button>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="overflow-y-auto h-[calc(100vh-220px)] scrollbar-hide">
          {loading && notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 animate-spin">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Carregando notificações...
              </h3>
            </div>
          ) : notificacoes.length === 0 ? (
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
                  key={notificacao.id_notificacao}
                  className={`group relative bg-white rounded-2xl border-2 p-4 transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in ${
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
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCorPorTipo(notificacao.tipo)} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                      {getIconByType(notificacao.tipo)}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                          {notificacao.mensagem}
                        </p>
                        <div className="flex items-center gap-1 ml-2">
                          {!notificacao.lida && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarcarComoLida(notificacao.id_notificacao)
                              }}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-all"
                              title="Marcar como lida"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletarNotificacao(notificacao.id_notificacao)
                            }}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                            title="Deletar notificação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                          {notificacao.tempo_relativo}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            notificacao.tipo === 'promocao' ? 'bg-red-100 text-red-700' :
                            notificacao.tipo === 'compra' ? 'bg-green-100 text-green-700' :
                            notificacao.tipo === 'social' ? 'bg-purple-100 text-purple-700' :
                            notificacao.tipo === 'alerta' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {getIconePorTipo(notificacao.tipo)} {notificacao.tipo}
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
