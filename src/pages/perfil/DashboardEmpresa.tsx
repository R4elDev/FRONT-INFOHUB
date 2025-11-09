import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { TrendingUp, Package, Settings, Loader2, LogOut, ShoppingBag, User, MapPin, BarChart3, Zap, Sparkles, Eye, Heart, Star, ArrowUpRight, Clock, CheckCircle2, Users, Edit2, Trash2, Play, Pause, Calendar, Tag, Target, TrendingDown, Plus } from "lucide-react"
import { buscarDadosEstabelecimentoAtualizado } from "../../services/apiServicesFixed"

type TabType = 'promocoes' | 'pedidos' | 'relatorio' | 'sistema'

function DashboardEmpresa() {
  const [activeTab, setActiveTab] = useState<TabType>('promocoes')
  const navigate = useNavigate()
  
  // Estados para dados da empresa
  const [nomeEmpresa, setNomeEmpresa] = useState("Carregando...")
  const [emailEmpresa, setEmailEmpresa] = useState("carregando@email.com")
  const [localizacao, setLocalizacao] = useState("Carregando...")
  const [loading, setLoading] = useState(true)
  
  // Carrega dados da empresa ao montar o componente
  useEffect(() => {
    const carregarDadosEmpresa = async () => {
      console.log('🔍 [Dashboard] Carregando dados da empresa...')
      setLoading(true)
      
      try {
        const dados = await buscarDadosEstabelecimentoAtualizado()
        console.log('✅ [Dashboard] Dados recebidos:', dados)
        
        if (dados) {
          setNomeEmpresa(dados.razao_social || dados.nome || "Empresa")
          setEmailEmpresa(dados.email || "email@empresa.com")
          
          // PRIORIDADE 1: Carregar endereço do localStorage (mais atualizado)
          const enderecoSalvo = localStorage.getItem('endereco_empresa')
          if (enderecoSalvo) {
            try {
              const enderecoData = JSON.parse(enderecoSalvo)
              if (enderecoData.cidade && enderecoData.estado) {
                setLocalizacao(`${enderecoData.cidade}, ${enderecoData.estado}`)
                console.log('📍 [Dashboard] Localização do localStorage:', `${enderecoData.cidade}, ${enderecoData.estado}`)
                setLoading(false)
                return
              }
            } catch (e) {
              console.error('Erro ao carregar endereço do localStorage:', e)
            }
          }
          
          // PRIORIDADE 2: Extrai cidade e estado do endereço da API
          console.log('📍 [Dashboard] Verificando endereço:', dados.endereco)
          console.log('📍 [Dashboard] Tipo do endereço:', typeof dados.endereco)
          
          if (dados.endereco && dados.endereco !== "" && dados.endereco !== "undefined") {
            console.log('📍 [Dashboard] Endereço completo:', dados.endereco)
            
            // Tenta extrair cidade e estado de diferentes formatos
            // Formato esperado: "Rua X, Bairro, Cidade - Estado" ou "Rua X, Cidade/Estado"
            let cidadeEstado = ""
            
            // Procura por padrão "Cidade - Estado" ou "Cidade/Estado"
            const matchTraco = dados.endereco.match(/([^,]+)\s*-\s*([A-Z]{2})/i)
            const matchBarra = dados.endereco.match(/([^,]+)\/([A-Z]{2})/i)
            
            if (matchTraco) {
              // Formato: "Carapicuíba - SP"
              cidadeEstado = `${matchTraco[1].trim()}, ${matchTraco[2].toUpperCase()}`
            } else if (matchBarra) {
              // Formato: "Carapicuíba/SP"
              cidadeEstado = `${matchBarra[1].trim()}, ${matchBarra[2].toUpperCase()}`
            } else {
              // Tenta pegar as últimas 2 partes separadas por vírgula
              const partes = dados.endereco.split(',').map((p: string) => p.trim())
              if (partes.length >= 2) {
                const ultimaParte = partes[partes.length - 1]
                const penultimaParte = partes[partes.length - 2]
                
                // Se a última parte tem 2 letras, provavelmente é o estado
                if (ultimaParte.length === 2) {
                  cidadeEstado = `${penultimaParte}, ${ultimaParte.toUpperCase()}`
                } else {
                  cidadeEstado = ultimaParte
                }
              } else {
                cidadeEstado = dados.endereco
              }
            }
            
            setLocalizacao(cidadeEstado || "Localização não informada")
            console.log('📍 [Dashboard] Localização extraída:', cidadeEstado)
          } else {
            setLocalizacao("Localização não informada")
          }
          
          console.log('📋 [Dashboard] Dados atualizados:', {
            nome: dados.razao_social || dados.nome,
            email: dados.email,
            endereco: dados.endereco,
            localizacao: localizacao
          })
        }
      } catch (error) {
        console.error('❌ [Dashboard] Erro ao carregar dados:', error)
        setNomeEmpresa("Empresa")
        setEmailEmpresa("email@empresa.com")
        setLocalizacao("São Paulo, SP")
      } finally {
        setLoading(false)
      }
    }
    
    carregarDadosEmpresa()
  }, [])

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-purple-50/20 py-8 px-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header - Perfil da Empresa */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-2 border-white/60 p-8 mb-8 relative animate-fadeInDown hover:shadow-[0_12px_40px_rgba(249,160,27,0.2)] transition-all duration-300">
            {/* Decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFA726] via-purple-500 to-blue-500 rounded-t-3xl" />
            <div className="absolute top-6 right-6 flex gap-3">
              <button 
                type="button"
                onClick={() => navigate('/cadastro-promocao')}
                className="bg-gradient-to-r from-[#FFA726] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FFA726] text-white px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105 hover:shadow-[0_8px_20px_rgba(255,140,0,0.4)] shadow-lg flex items-center gap-2 text-sm group"
              >
                <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Nova Promoção
              </button>
              <button 
                type="button"
                onClick={() => navigate('/perfil-empresa')}
                className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 shadow-md hover:shadow-lg"
                title="Editar Perfil"
              >
                <User size={22} />
              </button>
              <button 
                type="button"
                onClick={() => navigate('/configuracoes-empresa')}
                className="p-3 text-gray-400 hover:text-[#FFA726] hover:bg-orange-50 rounded-xl transition-all hover:scale-110 shadow-md hover:shadow-lg"
                title="Configurações"
              >
                <Settings size={22} />
              </button>
              <button 
                type="button"
                onClick={() => {
                  localStorage.removeItem('auth_token')
                  localStorage.removeItem('user_data')
                  navigate('/login')
                }}
                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 shadow-md hover:shadow-lg"
                title="Sair da Conta"
              >
                <LogOut size={22} />
              </button>
            </div>
            
            <div className="flex flex-col items-center">
              {/* Logo with animated ring */}
              <div className="relative mb-5">
                <div className="absolute inset-0 w-28 h-28 rounded-full bg-gradient-to-br from-[#FFA726] to-[#FF8C00] blur-xl opacity-50 animate-pulse" />
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#FFA726] via-[#FF8C00] to-[#FFA726] flex items-center justify-center text-white text-4xl font-bold shadow-[0_8px_30px_rgba(255,140,0,0.5)] animate-bounceIn hover:scale-105 transition-transform duration-300 border-4 border-white ring-4 ring-orange-200/50">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  nomeEmpresa.substring(0, 2).toUpperCase()
                )}
                </div>
                {/* Online status badge */}
                <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              
              {/* Nome da Empresa */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Carregando...
                  </span>
                ) : (
                  nomeEmpresa.toUpperCase()
                )}
                </h1>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
              </div>
              <p className="text-gray-600 text-base mb-4 font-medium">
                {loading ? "carregando..." : emailEmpresa}
              </p>
              
              {/* Localização e Stats */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#FFA726] to-[#FF8C00] text-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-bold">
                    {loading ? "Carregando..." : localizacao}
                  </span>
                </div>
                
                {/* Stats Badges */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-all">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-bold">1.2k visualizações</span>
                </div>
                
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-all">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold">248 seguidores</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Métricas - Aprimorados com Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Promoções Ativas */}
            <div className="relative bg-gradient-to-br from-[#FFA726] to-[#FF8C00] rounded-3xl shadow-[0_4px_16px_rgba(255,140,0,0.3)] border-2 border-orange-200 p-8 text-white animate-fadeInUp animate-delay-100 hover:scale-105 hover:shadow-[0_8px_30px_rgba(255,140,0,0.5)] hover:-translate-y-2 transition-all duration-300 cursor-pointer group overflow-hidden">
              {/* Decorative shine effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold opacity-95">Promoções Ativas</h3>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <TrendingUp className="opacity-90" size={28} />
                </div>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-5xl font-black">0</p>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg mb-2">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-xs font-bold">0%</span>
                </div>
              </div>
              <p className="text-sm opacity-90 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Cadastre suas promoções
              </p>
            </div>

            {/* Produtos Cadastrados */}
            <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl shadow-[0_4px_16px_rgba(147,51,234,0.3)] border-2 border-purple-200 p-8 text-white animate-fadeInUp animate-delay-200 hover:scale-105 hover:shadow-[0_8px_30px_rgba(147,51,234,0.5)] hover:-translate-y-2 transition-all duration-300 cursor-pointer group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold opacity-95">Produtos</h3>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Package className="opacity-90" size={28} />
                </div>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-5xl font-black">0</p>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold">Hoje</span>
                </div>
              </div>
              <p className="text-sm opacity-90 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Adicione seus produtos
              </p>
            </div>

            {/* Pedidos */}
            <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-[0_4px_16px_rgba(59,130,246,0.3)] border-2 border-blue-200 p-8 text-white animate-fadeInUp animate-delay-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)] hover:-translate-y-2 transition-all duration-300 cursor-pointer group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold opacity-95">Pedidos</h3>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ShoppingBag className="opacity-90" size={28} />
                </div>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-5xl font-black">0</p>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg mb-2">
                  <Heart className="w-4 h-4 fill-white" />
                  <span className="text-xs font-bold">100%</span>
                </div>
              </div>
              <p className="text-sm opacity-90 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Gerencie seus pedidos
              </p>
            </div>
          </div>

          {/* Menu de Ações Rápidas */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-2 border-white/60 p-8 animate-fadeInUp hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FFA726] to-[#FF8C00] rounded-xl blur-md opacity-50 animate-pulse" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-[#FFA726] to-[#FF8C00] rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="text-white" size={24} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Acesso Rápido</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">4 ações disponíveis</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => navigate('/cadastro-promocao')}
                className="relative flex items-center gap-4 p-5 rounded-2xl border-2 border-orange-200 hover:border-[#FFA726] hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 transition-all group hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 group-hover:from-[#FFA726] group-hover:to-[#FF8C00] flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-md">
                  <TrendingUp className="text-orange-600 group-hover:text-white transition-colors" size={28} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-lg">Promoções</p>
                  <p className="text-sm text-gray-600">Gerenciar promoções</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/pedidos')}
                className="relative flex items-center gap-4 p-5 rounded-2xl border-2 border-blue-200 hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 transition-all group hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-500 group-hover:to-blue-700 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-md">
                  <ShoppingBag className="text-blue-600 group-hover:text-white transition-colors" size={28} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-lg">Pedidos</p>
                  <p className="text-sm text-gray-600">Ver pedidos recebidos</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/relatorios')}
                className="relative flex items-center gap-4 p-5 rounded-2xl border-2 border-green-200 hover:border-green-500 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 transition-all group hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-500 group-hover:to-green-700 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-md">
                  <BarChart3 className="text-green-600 group-hover:text-white transition-colors" size={28} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-lg">Relatórios</p>
                  <p className="text-sm text-gray-600">Análises e estatísticas</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/configuracoes-empresa')}
                className="relative flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-gray-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 transition-all group hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-600 group-hover:to-gray-800 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-md">
                  <Settings className="text-gray-600 group-hover:text-white transition-colors" size={28} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-lg">Configurações</p>
                  <p className="text-sm text-gray-600">Ajustes da empresa</p>
                </div>
              </button>
            </div>
          </div>

          {/* Removido: Abas antigas */}
          <div className="hidden">
            <button
              onClick={() => setActiveTab('promocoes')}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'promocoes'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Promoções
            </button>
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'pedidos'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setActiveTab('relatorio')}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'relatorio'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Relatório
            </button>
            <button
              onClick={() => setActiveTab('sistema')}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'sistema'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Sistema
            </button>
          </div>

          {/* Conteúdo das Abas */}
          {activeTab === 'promocoes' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-2 border-white/60 p-8 mt-12 animate-fadeInUp">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FFA726] to-[#FF8C00] rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Gestão de Promoções</h2>
                      <p className="text-sm text-gray-500">Gerencie todas as suas promoções ativas</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/cadastro-promocao')}
                  className="bg-gradient-to-r from-[#FFA726] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FFA726] text-white px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105 hover:shadow-xl shadow-lg flex items-center gap-2 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Nova Promoção
                </button>
              </div>

              {/* Estatísticas Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-green-700 uppercase">Ativas</span>
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-green-700">2</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-yellow-700 uppercase">Pausadas</span>
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Pause className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-yellow-700">1</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 border-2 border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-red-700 uppercase">Expiradas</span>
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-red-700">0</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-700 uppercase">Total</span>
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-blue-700">3</p>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <button className="px-4 py-2 bg-[#FFA726] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all">
                  Todas
                </button>
                <button className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:border-[#FFA726] hover:text-[#FFA726] transition-all">
                  Ativas
                </button>
                <button className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:border-yellow-500 hover:text-yellow-600 transition-all">
                  Pausadas
                </button>
                <button className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:border-red-500 hover:text-red-600 transition-all">
                  Expiradas
                </button>
              </div>

              {/* Lista de Promoções Aprimorada */}
              <div className="space-y-4">
                {/* Promoção 1 - Ativa */}
                <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border-2 border-gray-200 hover:border-[#FFA726] hover:shadow-xl transition-all duration-300">
                  {/* Badge de Status */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ATIVA
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Ícone e Info Principal */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Tag className="w-8 h-8 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">Oferta Supermercado</h3>
                          <p className="text-sm text-gray-600 mb-3">Produtos selecionados com desconto especial</p>
                          
                          {/* Metadados */}
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>Criado em 13/01/2024</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Eye className="w-4 h-4" />
                              <span>1.2k visualizações</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                              <TrendingUp className="w-4 h-4" />
                              <span>+15% esta semana</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desconto em Destaque */}
                    <div className="flex items-center justify-center md:justify-end">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl blur-lg opacity-50" />
                        <div className="relative bg-gradient-to-br from-green-500 to-green-600 text-white px-8 py-6 rounded-2xl shadow-xl">
                          <p className="text-sm font-bold mb-1 text-center">Desconto</p>
                          <p className="text-5xl font-black text-center">25%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Válida até:</span>
                      <span className="text-sm font-bold text-gray-800">31/12/2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all hover:scale-110 shadow-md" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-all hover:scale-110 shadow-md" title="Pausar">
                        <Pause className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all hover:scale-110 shadow-md" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Promoção 2 - Ativa */}
                <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border-2 border-gray-200 hover:border-[#FFA726] hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ATIVA
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Sparkles className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">Black Friday Eletrônicos</h3>
                          <p className="text-sm text-gray-600 mb-3">Mega desconto em produtos selecionados</p>
                          
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>Criado em 15/01/2024</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Eye className="w-4 h-4" />
                              <span>3.5k visualizações</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                              <TrendingUp className="w-4 h-4" />
                              <span>+45% esta semana</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-end">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl blur-lg opacity-50" />
                        <div className="relative bg-gradient-to-br from-green-500 to-green-600 text-white px-8 py-6 rounded-2xl shadow-xl">
                          <p className="text-sm font-bold mb-1 text-center">Desconto</p>
                          <p className="text-5xl font-black text-center">50%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Válida até:</span>
                      <span className="text-sm font-bold text-gray-800">28/02/2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all hover:scale-110 shadow-md" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-all hover:scale-110 shadow-md" title="Pausar">
                        <Pause className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all hover:scale-110 shadow-md" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Promoção 3 - Pausada */}
                <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border-2 border-gray-200 hover:border-yellow-500 hover:shadow-xl transition-all duration-300 opacity-75">
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    <Pause className="w-3 h-3" />
                    PAUSADA
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <ShoppingBag className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">Desconto Roupas Verão</h3>
                          <p className="text-sm text-gray-600 mb-3">Coleção verão com preços especiais</p>
                          
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>Criado em 14/01/2024</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Eye className="w-4 h-4" />
                              <span>892 visualizações</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold">
                              <TrendingDown className="w-4 h-4" />
                              <span>Pausada temporariamente</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-end">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl blur-lg opacity-50" />
                        <div className="relative bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-8 py-6 rounded-2xl shadow-xl">
                          <p className="text-sm font-bold mb-1 text-center">Desconto</p>
                          <p className="text-5xl font-black text-center">30%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Válida até:</span>
                      <span className="text-sm font-bold text-gray-800">15/03/2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all hover:scale-110 shadow-md" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all hover:scale-110 shadow-md" title="Reativar">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all hover:scale-110 shadow-md" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pedidos' && (
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Package className="text-purple-500" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Gestão de Pedidos</h2>
              </div>

              <p className="text-gray-500 text-sm mb-4">Pedidos recentes</p>

              {/* Header da Tabela */}
              <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium text-gray-600">
                <div>Pedido</div>
                <div>Cliente</div>
                <div className="text-right">Total</div>
                <div className="text-right">Status</div>
              </div>

              {/* Lista de Pedidos */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="text-gray-600 font-mono text-sm">#12345</div>
                    <div className="font-medium text-gray-800">Ana Silva</div>
                    <div className="text-right font-medium text-gray-800">R$ 156.90</div>
                    <div className="text-right">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        Entregue
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="text-gray-600 font-mono text-sm">#12346</div>
                    <div className="font-medium text-gray-800">Carlos Santos</div>
                    <div className="text-right font-medium text-gray-800">R$ 89.50</div>
                    <div className="text-right">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        Processando
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="text-gray-600 font-mono text-sm">#12347</div>
                    <div className="font-medium text-gray-800">Maria Oliveira</div>
                    <div className="text-right font-medium text-gray-800">R$ 203.75</div>
                    <div className="text-right">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                        Enviado
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="text-gray-600 font-mono text-sm">#12348</div>
                    <div className="font-medium text-gray-800">João Costa</div>
                    <div className="text-right font-medium text-gray-800">R$ 67.30</div>
                    <div className="text-right">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                        Cancelado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'relatorio' && (
            <div className="space-y-6">
              {/* Vendas por Período */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-green-500 text-2xl">$</span>
                  <h2 className="text-xl font-bold text-gray-800">Vendas por Período</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Hoje</span>
                    <span className="text-xl font-bold text-gray-800">R$ 47.2K</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Esta Semana</span>
                    <span className="text-xl font-bold text-gray-800">R$ 284.8K</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-medium text-gray-700">Este Mês</span>
                    <span className="text-xl font-bold text-gray-800">R$ 1.2M</span>
                  </div>
                </div>
              </div>

              {/* Produtos Mais Vendidos */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="text-blue-500" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">Produtos Mais Vendidos</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Smartphone XYZ</span>
                    <span className="text-lg font-bold text-blue-600">342 vendas</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Notebook ABC</span>
                    <span className="text-lg font-bold text-blue-600">198 vendas</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-medium text-gray-700">Headphone DEF</span>
                    <span className="text-lg font-bold text-blue-600">156 vendas</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sistema' && (
            <div className="space-y-6">
              {/* Status do Sistema */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-xl font-bold text-gray-800">Status do Sistema</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Servidor Principal</span>
                    <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
                      Online
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Base de Dados</span>
                    <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
                      Ativo
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-medium text-gray-700">Cache Redis</span>
                    <span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-sm font-medium">
                      Atenção
                    </span>
                  </div>
                </div>
              </div>

              {/* Configurações Rápidas */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="text-gray-700" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">Configurações Rápidas</h2>
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-xl text-left font-medium transition-colors">
                    Gerenciar Permissões
                  </button>
                  <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-xl text-left font-medium transition-colors">
                    Configurar Notificações
                  </button>
                  <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-xl text-left font-medium transition-colors">
                    Gerenciar Produtos
                  </button>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl text-center font-medium transition-colors">
                    Backup do Sistema
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}

export default DashboardEmpresa
