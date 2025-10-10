import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Building2, Search, Filter, Plus, Edit, Trash2, Eye, MapPin, Phone } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"

interface Empresa {
  id: number
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  status: 'ativa' | 'inativa' | 'pendente'
  dataRegistro: string
  totalProdutos: number
  totalVendas: string
}

function EmpresasAdmin() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("todos")

  // Mock data - replace with real API call
  const empresas: Empresa[] = [
    {
      id: 1,
      nome: "Supermercado Japão",
      cnpj: "12.345.678/0001-90",
      email: "contato@superjapao.com",
      telefone: "(11) 99999-9999",
      endereco: "Rua das Flores, 123",
      cidade: "São Paulo, SP",
      status: "ativa",
      dataRegistro: "2024-01-10",
      totalProdutos: 2847,
      totalVendas: "R$ 847.2K"
    },
    {
      id: 2,
      nome: "TechStore Ltda",
      cnpj: "98.765.432/0001-10",
      email: "admin@techstore.com",
      telefone: "(11) 88888-8888",
      endereco: "Av. Tecnologia, 456",
      cidade: "São Paulo, SP",
      status: "ativa",
      dataRegistro: "2024-01-08",
      totalProdutos: 1256,
      totalVendas: "R$ 523.8K"
    },
    {
      id: 3,
      nome: "Fashion Plus",
      cnpj: "11.222.333/0001-44",
      email: "contato@fashionplus.com",
      telefone: "(11) 77777-7777",
      endereco: "Rua da Moda, 789",
      cidade: "Rio de Janeiro, RJ",
      status: "pendente",
      dataRegistro: "2024-01-15",
      totalProdutos: 0,
      totalVendas: "R$ 0"
    },
    {
      id: 4,
      nome: "MercadoMax",
      cnpj: "55.666.777/0001-88",
      email: "admin@mercadomax.com",
      telefone: "(11) 66666-6666",
      endereco: "Av. Comércio, 321",
      cidade: "Belo Horizonte, MG",
      status: "inativa",
      dataRegistro: "2024-01-05",
      totalProdutos: 892,
      totalVendas: "R$ 234.1K"
    }
  ]

  const filteredEmpresas = empresas.filter(empresa => {
    const matchesSearch = empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.cnpj.includes(searchTerm) ||
                         empresa.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "todos" || empresa.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-700'
      case 'inativa': return 'bg-red-100 text-red-700'
      case 'pendente': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativa': return '✅'
      case 'inativa': return '❌'
      case 'pendente': return '⏳'
      default: return '❓'
    }
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Empresas Parceiras</h1>
                  <p className="text-gray-500">Gerencie empresas cadastradas na plataforma</p>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/admin/empresas/nova')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Empresa
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total de Empresas</h3>
              <p className="text-3xl font-bold text-gray-800">{empresas.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Empresas Ativas</h3>
              <p className="text-3xl font-bold text-green-600">
                {empresas.filter(e => e.status === 'ativa').length}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Pendentes</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {empresas.filter(e => e.status === 'pendente').length}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total de Produtos</h3>
              <p className="text-3xl font-bold text-blue-600">
                {empresas.reduce((sum, e) => sum + e.totalProdutos, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter by Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
                <option value="pendente">Pendente</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center text-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                {filteredEmpresas.length} empresa(s) encontrada(s)
              </div>
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmpresas.map((empresa) => (
              <div key={empresa.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white font-semibold">
                      {empresa.nome.charAt(0).toUpperCase()}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(empresa.status)}`}>
                      {getStatusIcon(empresa.status)} {empresa.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg truncate">{empresa.nome}</h3>
                  <p className="text-gray-500 text-sm">{empresa.cnpj}</p>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm truncate">{empresa.endereco}, {empresa.cidade}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{empresa.telefone}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Produtos</p>
                      <p className="font-semibold text-gray-800">{empresa.totalProdutos.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Vendas</p>
                      <p className="font-semibold text-green-600">{empresa.totalVendas}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Registrada em {new Date(empresa.dataRegistro).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/admin/empresas/${empresa.id}`)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/empresas/${empresa.id}/editar`)}
                    className="text-green-600 hover:text-green-900 p-2 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => console.log('Delete empresa', empresa.id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredEmpresas.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-gray-500 mb-4">Tente ajustar os filtros ou cadastrar uma nova empresa.</p>
              <Button 
                onClick={() => navigate('/admin/empresas/nova')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Cadastrar Nova Empresa
              </Button>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}

export default EmpresasAdmin
