import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Users, Search, Filter, UserPlus, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"

interface Usuario {
  id: number
  nome: string
  email: string
  perfil: 'consumidor' | 'estabelecimento' | 'admin'
  status: 'ativo' | 'inativo' | 'suspenso'
  dataRegistro: string
  ultimoLogin: string
}

function UsuariosAdmin() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPerfil, setFilterPerfil] = useState<string>("todos")
  const [filterStatus, setFilterStatus] = useState<string>("todos")

  // Mock data - replace with real API call
  const usuarios: Usuario[] = [
    {
      id: 1,
      nome: "Ana Silva",
      email: "ana.silva@email.com",
      perfil: "consumidor",
      status: "ativo",
      dataRegistro: "2024-01-15",
      ultimoLogin: "2024-01-20"
    },
    {
      id: 2,
      nome: "Supermercado Japão",
      email: "contato@superjapao.com",
      perfil: "estabelecimento",
      status: "ativo",
      dataRegistro: "2024-01-10",
      ultimoLogin: "2024-01-19"
    },
    {
      id: 3,
      nome: "Carlos Santos",
      email: "carlos@email.com",
      perfil: "consumidor",
      status: "suspenso",
      dataRegistro: "2024-01-12",
      ultimoLogin: "2024-01-18"
    },
    {
      id: 4,
      nome: "TechStore Ltda",
      email: "admin@techstore.com",
      perfil: "estabelecimento",
      status: "ativo",
      dataRegistro: "2024-01-08",
      ultimoLogin: "2024-01-20"
    }
  ]

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPerfil = filterPerfil === "todos" || usuario.perfil === filterPerfil
    const matchesStatus = filterStatus === "todos" || usuario.status === filterStatus
    
    return matchesSearch && matchesPerfil && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-700'
      case 'inativo': return 'bg-gray-100 text-gray-700'
      case 'suspenso': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'estabelecimento': return 'bg-blue-100 text-blue-700'
      case 'consumidor': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h1>
                  <p className="text-gray-500">Administre contas de usuários do sistema</p>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/admin/usuarios/novo')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Novo Usuário
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter by Profile */}
              <select
                value={filterPerfil}
                onChange={(e) => setFilterPerfil(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os Perfis</option>
                <option value="consumidor">Consumidor</option>
                <option value="estabelecimento">Estabelecimento</option>
                <option value="admin">Admin</option>
              </select>

              {/* Filter by Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="suspenso">Suspenso</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center text-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                {filteredUsuarios.length} usuário(s) encontrado(s)
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perfil
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Login
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {usuario.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerfilColor(usuario.perfil)}`}>
                          {usuario.perfil}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(usuario.status)}`}>
                          {usuario.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(usuario.dataRegistro).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(usuario.ultimoLogin).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/usuarios/${usuario.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/usuarios/${usuario.id}/editar`)}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => console.log('Delete user', usuario.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsuarios.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                <p className="text-gray-500">Tente ajustar os filtros ou criar um novo usuário.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default UsuariosAdmin
