import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { BarChart3, TrendingUp, Users, Package, DollarSign, Download, Filter } from "lucide-react"
import { Button } from "../../components/ui/button"

type PeriodoType = '7d' | '30d' | '90d' | '1y'

function RelatoriosAdmin() {
  const navigate = useNavigate()
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoType>('30d')

  const periodos = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: '1y', label: 'Último ano' }
  ]

  // Mock data - replace with real API calls
  const estatisticas = {
    '7d': {
      usuarios: { total: 127, crescimento: '+8%' },
      empresas: { total: 12, crescimento: '+2%' },
      vendas: { total: 'R$ 89.2K', crescimento: '+15%' },
      produtos: { total: 1247, crescimento: '+5%' }
    },
    '30d': {
      usuarios: { total: 2847, crescimento: '+23%' },
      empresas: { total: 156, crescimento: '+12%' },
      vendas: { total: 'R$ 847.2K', crescimento: '+28%' },
      produtos: { total: 8934, crescimento: '+18%' }
    },
    '90d': {
      usuarios: { total: 7234, crescimento: '+45%' },
      empresas: { total: 298, crescimento: '+34%' },
      vendas: { total: 'R$ 2.1M', crescimento: '+52%' },
      produtos: { total: 15678, crescimento: '+41%' }
    },
    '1y': {
      usuarios: { total: 18456, crescimento: '+89%' },
      empresas: { total: 567, crescimento: '+78%' },
      vendas: { total: 'R$ 8.9M', crescimento: '+125%' },
      produtos: { total: 34567, crescimento: '+98%' }
    }
  }

  const stats = estatisticas[periodoSelecionado]

  const topEmpresas = [
    { nome: 'Supermercado Japão', vendas: 'R$ 234.5K', produtos: 2847, crescimento: '+15%' },
    { nome: 'TechStore Ltda', vendas: 'R$ 189.3K', produtos: 1256, crescimento: '+23%' },
    { nome: 'Fashion Plus', vendas: 'R$ 156.7K', produtos: 892, crescimento: '+8%' },
    { nome: 'MercadoMax', vendas: 'R$ 134.2K', produtos: 743, crescimento: '+12%' },
    { nome: 'ElectroShop', vendas: 'R$ 98.4K', produtos: 567, crescimento: '+5%' }
  ]

  const topProdutos = [
    { nome: 'Smartphone XYZ', vendas: 342, receita: 'R$ 45.6K', categoria: 'Eletrônicos' },
    { nome: 'Notebook ABC', vendas: 198, receita: 'R$ 89.2K', categoria: 'Informática' },
    { nome: 'Headphone DEF', vendas: 156, receita: 'R$ 12.3K', categoria: 'Áudio' },
    { nome: 'Camiseta GHI', vendas: 234, receita: 'R$ 8.9K', categoria: 'Roupas' },
    { nome: 'Tênis JKL', vendas: 89, receita: 'R$ 23.4K', categoria: 'Calçados' }
  ]

  const handleExportarRelatorio = (tipo: string) => {
    console.log(`Exportando relatório: ${tipo}`)
    // Implement export functionality
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Relatórios Avançados</h1>
                  <p className="text-gray-500">Analytics detalhados da plataforma</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={periodoSelecionado}
                  onChange={(e) => setPeriodoSelecionado(e.target.value as PeriodoType)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {periodos.map(periodo => (
                    <option key={periodo.value} value={periodo.value}>
                      {periodo.label}
                    </option>
                  ))}
                </select>
                
                <Button 
                  onClick={() => handleExportarRelatorio('geral')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
                  {stats.usuarios.crescimento}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total de Usuários</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.usuarios.total.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
                  {stats.empresas.crescimento}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Empresas Ativas</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.empresas.total}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
                  {stats.vendas.crescimento}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Volume de Vendas</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.vendas.total}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
                  {stats.produtos.crescimento}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Produtos Cadastrados</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.produtos.total.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Empresas */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Top Empresas
                </h2>
                <Button 
                  onClick={() => handleExportarRelatorio('empresas')}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Exportar
                </Button>
              </div>

              <div className="space-y-4">
                {topEmpresas.map((empresa, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{empresa.nome}</p>
                        <p className="text-sm text-gray-500">{empresa.produtos} produtos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{empresa.vendas}</p>
                      <p className="text-sm text-green-600">{empresa.crescimento}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Produtos */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  Produtos Mais Vendidos
                </h2>
                <Button 
                  onClick={() => handleExportarRelatorio('produtos')}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Exportar
                </Button>
              </div>

              <div className="space-y-4">
                {topProdutos.map((produto, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{produto.nome}</p>
                        <p className="text-sm text-gray-500">{produto.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{produto.vendas} vendas</p>
                      <p className="text-sm text-blue-600">{produto.receita}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Filter className="w-6 h-6 text-gray-600" />
              Relatórios Específicos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/admin/relatorios/usuarios')}
                className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all hover:-translate-y-1 text-left"
              >
                <Users className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Relatório de Usuários</h3>
                <p className="text-sm text-gray-600">Análise detalhada de cadastros, atividade e engajamento</p>
              </button>

              <button
                onClick={() => navigate('/admin/relatorios/vendas')}
                className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all hover:-translate-y-1 text-left"
              >
                <DollarSign className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Relatório de Vendas</h3>
                <p className="text-sm text-gray-600">Performance de vendas por período, empresa e categoria</p>
              </button>

              <button
                onClick={() => navigate('/admin/relatorios/produtos')}
                className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-all hover:-translate-y-1 text-left"
              >
                <Package className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Relatório de Produtos</h3>
                <p className="text-sm text-gray-600">Análise de estoque, popularidade e performance</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default RelatoriosAdmin
