import { useState, useEffect } from "react"
import { Bell, Tag, Package, DollarSign, CheckCircle, Filter, Search, ChevronDown, X, Clock, Trash2, AlertCircle } from "lucide-react"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Input } from "../../components/ui/input"
import { useNotificacoes } from '../../contexts/NotificacoesContext'
import { getIconePorTipo, getCorPorTipo } from '../../services/notificacaoService'
import type { Notificacao } from '../../services/notificacaoService'

const getIconByType = (tipo: string) => {
  switch (tipo) {
    case 'promocao':
      return <Tag className="w-6 h-6" />
    case 'compra':
      return <Package className="w-6 h-6" />
    case 'social':
      return <DollarSign className="w-6 h-6" />
    case 'alerta':
      return <AlertCircle className="w-6 h-6" />
    case 'carrinho':
      return <Bell className="w-6 h-6" />
    default:
      return <Bell className="w-6 h-6" />
  }
}

export default function NotificacoesTodas() {
  const [filtroTipo, setFiltroTipo] = useState<string>('todas')
  const [filtroStatus, setFiltroStatus] = useState<string>('todas')
  const [busca, setBusca] = useState('')
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState<Notificacao | null>(null)

  const {
    notificacoes,
    naoLidas,
    loading,
    error,
    carregarNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    deletarNotificacao,
    filtrarPorTipo,
    limparError
  } = useNotificacoes()

  // Carregar notificações com limite maior para a página completa
  useEffect(() => {
    carregarNotificacoes(50)
  }, [])

  // Aplicar filtros quando mudarem
  useEffect(() => {
    if (filtroTipo !== 'todas') {
      filtrarPorTipo(filtroTipo)
    } else {
      carregarNotificacoes(50)
    }
  }, [filtroTipo])

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
  
  const handleAbrirDetalhes = (notificacao: Notificacao) => {
    setNotificacaoSelecionada(notificacao)
    if (!notificacao.lida) {
      handleMarcarComoLida(notificacao.id_notificacao)
    }
  }

  // Filtrar notificações localmente
  const notificacoesFiltradas = notificacoes.filter(n => {
    const matchStatus = filtroStatus === 'todas' || 
                       (filtroStatus === 'lidas' && n.lida) ||
                       (filtroStatus === 'nao-lidas' && !n.lida)
    const matchBusca = busca === '' || 
                       n.mensagem.toLowerCase().includes(busca.toLowerCase())
    return matchStatus && matchBusca
  })

  return (
    <SidebarLayout>
      {/* Header Premium */}
      <section className="mt-8 mb-8">
        <div className="bg-gradient-to-r from-[#FFA726] via-[#FF8C00] to-[#FFA726] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-xl animate-bounce-slow">
                <Bell className="w-9 h-9 text-white animate-bell-ring" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-1 drop-shadow-lg">
                  Notificações
                </h1>
                <p className="text-white/90 text-sm sm:text-base font-bold flex items-center gap-2">
                  <span>{naoLidas} não {naoLidas === 1 ? 'lida' : 'lidas'}</span>
                  <span>•</span>
                  <span>{notificacoes.length} total</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de Busca e Filtros */}
      <section className="mb-6 space-y-4">
        {/* Erro */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button 
              onClick={limparError}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar notificações..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-200 focus:border-[#FFA726] text-base"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filtro por Tipo */}
          <div className="flex-1 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full h-12 pl-10 pr-10 rounded-xl border-2 border-gray-200 bg-white font-semibold text-gray-700 cursor-pointer hover:border-[#FFA726] transition-colors appearance-none"
            >
              <option value="todas">Todos os Tipos</option>
              <option value="promocao">🔥 Promoções</option>
              <option value="compra">🛒 Compras</option>
              <option value="social">❤️ Social</option>
              <option value="alerta">⚠️ Alertas</option>
              <option value="carrinho">🛍️ Carrinho</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>

          {/* Filtro por Status */}
          <div className="flex-1 relative">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full h-12 pl-4 pr-10 rounded-xl border-2 border-gray-200 bg-white font-semibold text-gray-700 cursor-pointer hover:border-[#FFA726] transition-colors appearance-none"
            >
              <option value="todas">Todas</option>
              <option value="nao-lidas">Não Lidas</option>
              <option value="lidas">Lidas</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>

          {/* Botões de Ação */}
          <button 
            onClick={handleMarcarTodasComoLidas}
            disabled={loading || naoLidas === 0}
            className="px-6 h-12 bg-gradient-to-r from-[#FFA726] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FFA726] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Carregando...' : 'Marcar todas'}
          </button>
        </div>
      </section>

      {/* Lista de Notificações */}
      <section>
        {loading && notificacoes.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-gray-200 p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6 animate-spin">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Carregando notificações...
            </h3>
          </div>
        ) : notificacoesFiltradas.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-gray-200 p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Nenhuma notificação encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              {busca ? `Não encontramos resultados para "${busca}"` : 'Você está em dia!'}
            </p>
            {busca && (
              <button 
                onClick={() => setBusca('')}
                className="px-6 py-3 bg-gradient-to-r from-[#FFA726] to-[#FF8C00] text-white font-bold rounded-xl hover:scale-105 transition-all"
              >
                Limpar Busca
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {notificacoesFiltradas.map((notificacao, index) => (
              <div
                key={notificacao.id_notificacao}
                onClick={() => handleAbrirDetalhes(notificacao)}
                className={`group bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer animate-fade-in relative overflow-hidden ${
                  notificacao.lida 
                    ? 'border-gray-200' 
                    : 'border-[#FFA726] shadow-lg'
                }`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Indicador de não lida */}
                {!notificacao.lida && (
                  <div className="absolute top-6 right-6 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFA726]/0 to-[#FF8C00]/0 group-hover:from-[#FFA726]/5 group-hover:to-[#FF8C00]/5 transition-all pointer-events-none"></div>

                <div className="flex gap-4 relative z-10">
                  {/* Ícone */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getCorPorTipo(notificacao.tipo)} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                    {getIconByType(notificacao.tipo)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-base text-gray-700 leading-relaxed">
                        {notificacao.mensagem}
                      </p>
                      <div className="flex items-center gap-2 ml-4">
                        {!notificacao.lida && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarcarComoLida(notificacao.id_notificacao)
                            }}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                            title="Marcar como lida"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletarNotificacao(notificacao.id_notificacao)
                          }}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          title="Deletar notificação"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 font-medium">
                        {notificacao.tempo_relativo} • {new Date(notificacao.data_envio).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          notificacao.tipo === 'promocao' ? 'bg-red-100 text-red-700' :
                          notificacao.tipo === 'compra' ? 'bg-green-100 text-green-700' :
                          notificacao.tipo === 'social' ? 'bg-purple-100 text-purple-700' :
                          notificacao.tipo === 'alerta' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {getIconePorTipo(notificacao.tipo)} {notificacao.tipo}
                        </span>
                        {notificacao.lida && (
                          <span className="flex items-center gap-1 text-sm text-green-600 font-bold px-3 py-1 bg-green-50 rounded-full">
                            <CheckCircle className="w-4 h-4" />
                            Lida
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal de Detalhes */}
      {notificacaoSelecionada && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setNotificacaoSelecionada(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className={`p-6 bg-gradient-to-r ${getCorPorTipo(notificacaoSelecionada.tipo)} text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-lg animate-bounce-slow">
                        {getIconByType(notificacaoSelecionada.tipo)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black mb-1">
                          Detalhes da Notificação
                        </h2>
                        <div className="flex items-center gap-3 text-white/90 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {notificacaoSelecionada.tempo_relativo}
                          </span>
                          <span>•</span>
                          <span>{new Date(notificacaoSelecionada.data_envio).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setNotificacaoSelecionada(null)}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Mensagem Completa</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {notificacaoSelecionada.mensagem}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Tipo</p>
                    <p className="text-sm text-gray-800 font-bold capitalize">
                      {getIconePorTipo(notificacaoSelecionada.tipo)} {notificacaoSelecionada.tipo}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Status</p>
                    <p className="text-sm text-gray-800 font-bold flex items-center gap-1">
                      {notificacaoSelecionada.lida ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Lida
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Não lida
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setNotificacaoSelecionada(null)}
                    className="flex-1 h-12 bg-gradient-to-r from-[#FFA726] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FFA726] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    Fechar
                  </button>
                  {notificacaoSelecionada.tipo === 'promocao' && (
                    <button
                      onClick={() => {
                        setNotificacaoSelecionada(null)
                        window.location.href = '/promocoes'
                      }}
                      className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                      Ver Promoções
                    </button>
                  )}
                  {notificacaoSelecionada.tipo === 'compra' && (
                    <button
                      onClick={() => {
                        setNotificacaoSelecionada(null)
                        window.location.href = '/carrinho'
                      }}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                      Ver Pedidos
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSS Animação */}
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
      `}</style>
    </SidebarLayout>
  )
}
