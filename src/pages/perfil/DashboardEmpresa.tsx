import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { TrendingUp, Package, Settings, Loader2, LogOut, FileText, ShoppingBag } from "lucide-react"
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
          
          // Extrai cidade e estado do endereço
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
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header - Perfil da Empresa */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 relative animate-fadeInDown">
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                type="button"
                onClick={() => navigate('/cadastro-promocao')}
                className="bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#F9A01B] text-white px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2 text-sm"
              >
                ➕ Nova Promoção
              </button>
              <button 
                type="button"
                onClick={() => navigate('/configuracoes-empresa')}
                className="p-2 text-gray-400 hover:text-[#F9A01B] hover:bg-gray-100 rounded-xl transition-colors"
                title="Configurações"
              >
                <Settings size={20} />
              </button>
              <button 
                type="button"
                onClick={() => {
                  localStorage.removeItem('auth_token')
                  localStorage.removeItem('user_data')
                  navigate('/login')
                }}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Sair da Conta"
              >
                <LogOut size={20} />
              </button>
            </div>
            
            <div className="flex flex-col items-center">
              {/* Logo */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4 animate-bounceIn hover-glow">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  nomeEmpresa.substring(0, 2).toUpperCase()
                )}
              </div>
              
              {/* Nome da Empresa */}
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Carregando...
                  </span>
                ) : (
                  nomeEmpresa.toUpperCase()
                )}
              </h1>
              <p className="text-gray-500 text-sm mb-2">
                {loading ? "carregando..." : emailEmpresa}
              </p>
              
              {/* Localização */}
              <div className="flex items-center gap-2 bg-[#F9A01B] text-white px-4 py-2 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  {loading ? "Carregando..." : localizacao}
                </span>
              </div>
            </div>
          </div>

          {/* Cards de Métricas - Simplificado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Promoções Ativas */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white animate-fadeInUp animate-delay-100 hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Promoções Ativas</h3>
                <TrendingUp className="opacity-80" size={24} />
              </div>
              <p className="text-4xl font-bold">0</p>
              <p className="text-xs opacity-75 mt-1">Cadastre suas promoções</p>
            </div>

            {/* Produtos Cadastrados */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white animate-fadeInUp animate-delay-200 hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Produtos</h3>
                <Package className="opacity-80" size={24} />
              </div>
              <p className="text-4xl font-bold">0</p>
              <p className="text-xs opacity-75 mt-1">Adicione seus produtos</p>
            </div>

            {/* Pedidos */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white animate-fadeInUp animate-delay-300 hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Pedidos</h3>
                <ShoppingBag className="opacity-80" size={24} />
              </div>
              <p className="text-4xl font-bold">0</p>
              <p className="text-xs opacity-75 mt-1">Gerencie seus pedidos</p>
            </div>
          </div>

          {/* Menu de Ações Rápidas */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Acesso Rápido</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate('/cadastro-promocao')}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
                  <TrendingUp className="text-orange-600" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Promoções</p>
                  <p className="text-xs text-gray-500">Gerenciar promoções</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/pedidos')}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                  <ShoppingBag className="text-blue-600" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Pedidos</p>
                  <p className="text-xs text-gray-500">Ver pedidos recebidos</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/relatorios')}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                  <FileText className="text-green-600" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Relatórios</p>
                  <p className="text-xs text-gray-500">Análises e estatísticas</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/configuracoes-empresa')}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Settings className="text-gray-600" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Configurações</p>
                  <p className="text-xs text-gray-500">Ajustes da empresa</p>
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
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-blue-500" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">Gestão de Promoções</h2>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
                  Nova Promoção
                </button>
              </div>

              <p className="text-gray-500 text-sm mb-4">Promoções mais vendidas</p>

              {/* Header da Tabela */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm font-medium text-gray-600">
                <div>Promoções</div>
                <div className="text-center">Loja</div>
                <div className="text-right">Desconto</div>
              </div>

              {/* Lista de Promoções */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <p className="text-xs text-gray-500">Oferta Supermercado</p>
                      <p className="text-sm text-gray-600">Criado em 2024-01-13</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-800">SuperMax</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">25%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <p className="text-xs text-gray-500">Black Friday Eletrônicos</p>
                      <p className="text-sm text-gray-600">Criado em 2024-01-15</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-800">TechStore</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">50%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <p className="text-xs text-gray-500">Desconto Roupas Verão</p>
                      <p className="text-sm text-gray-600">Criado em 2024-01-14</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-800">Fashion Plus</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">30%</p>
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
