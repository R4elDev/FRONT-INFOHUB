import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../components/layouts/SidebarLayout"
import { TrendingUp, Package, Star, Settings } from "lucide-react"

type TabType = 'promocoes' | 'pedidos' | 'relatorio' | 'sistema'

function DashboardEmpresa() {
  const [activeTab, setActiveTab] = useState<TabType>('promocoes')
  const navigate = useNavigate()

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header - Perfil da Empresa */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 relative">
            <button 
              onClick={() => navigate('/configuracoes-empresa')}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#F9A01B] transition-colors"
              title="Configurações"
            >
              <Settings size={24} />
            </button>
            
            <div className="flex flex-col items-center">
              {/* Logo */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4">
                iJ
              </div>
              
              {/* Nome da Empresa */}
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                SUPERMERCADO JAPÃO
              </h1>
              <p className="text-gray-500 text-sm mb-2">japao@gmail.com</p>
              
              {/* Localização */}
              <div className="flex items-center gap-2 bg-[#F9A01B] text-white px-4 py-2 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">São Paulo, SP</span>
              </div>
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Promoções Ativas */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Promoções Ativas</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-800">47</p>
                  <p className="text-green-600 text-sm font-medium">+8</p>
                </div>
                <TrendingUp className="text-blue-500" size={32} />
              </div>
            </div>

            {/* Vendas Hoje */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Vendas Hoje</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-800">R$ 42.2K</p>
                  <p className="text-green-600 text-sm font-medium">+8%</p>
                </div>
                <span className="text-green-500 text-4xl">$</span>
              </div>
            </div>

            {/* Produtos Cadastrados */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Produtos Cadastrados</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-800">2.3K</p>
                  <p className="text-green-600 text-sm font-medium">+5%</p>
                </div>
                <Package className="text-purple-500" size={32} />
              </div>
            </div>

            {/* Avaliação Média */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Avaliação Média</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-800">4.8</p>
                  <p className="text-green-600 text-sm font-medium">+0.5</p>
                </div>
                <Star className="text-yellow-500 fill-yellow-500" size={32} />
              </div>
            </div>
          </div>

          {/* Abas de Navegação */}
          <div className="bg-white rounded-full shadow-md p-2 mb-6 flex gap-2">
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
