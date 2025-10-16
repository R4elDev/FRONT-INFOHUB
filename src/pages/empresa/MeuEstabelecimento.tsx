import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { useUser } from "../../contexts/UserContext"
import { Store, MapPin, Phone, FileText, Plus } from 'lucide-react'

export default function MeuEstabelecimento() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [estabelecimento, setEstabelecimento] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verifica se o estabelecimento no localStorage pertence ao usuário atual
    const estabelecimentoId = localStorage.getItem('estabelecimentoId')
    const estabelecimentoNome = localStorage.getItem('estabelecimentoNome')
    const estabelecimentoUserId = localStorage.getItem('estabelecimentoUserId')
    
    // Se existe estabelecimento mas é de outro usuário, limpa o localStorage
    if (estabelecimentoUserId && user && parseInt(estabelecimentoUserId) !== user.id) {
      console.log('🧹 MeuEstabelecimento: Limpando estabelecimento de outro usuário:', estabelecimentoUserId, '!==', user.id)
      localStorage.removeItem('estabelecimentoId')
      localStorage.removeItem('estabelecimentoNome')
      localStorage.removeItem('estabelecimentoUserId')
      setEstabelecimento(null)
    }
    // Se tem estabelecimento do usuário atual, usa ele
    else if (estabelecimentoId && estabelecimentoNome && estabelecimentoUserId && user && parseInt(estabelecimentoUserId) === user.id) {
      setEstabelecimento({
        id: parseInt(estabelecimentoId),
        nome: estabelecimentoNome,
        cnpj: user?.cnpj || '',
        telefone: user?.telefone || ''
      })
    }
    
    setLoading(false)
  }, [user])

  // Verificar se usuário tem permissão
  if (user?.perfil !== 'estabelecimento') {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
            <p className="text-gray-600 mb-6">Esta funcionalidade é exclusiva para usuários jurídicos.</p>
            <button
              onClick={() => navigate('/HomeInicial')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  // Loading
  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  // Se não tem estabelecimento
  if (!estabelecimento) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Nenhum Estabelecimento Cadastrado</h1>
            <p className="text-gray-600 mb-6">
              Você ainda não possui um estabelecimento cadastrado. Cadastre agora para começar a vender!
            </p>
            <button
              onClick={() => navigate('/empresa/cadastro-estabelecimento')}
              className="px-6 py-3 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white rounded-lg hover:from-[#FF8C00] hover:to-[#F9A01B] transition-all flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Cadastrar Estabelecimento
            </button>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  // Mostra estabelecimento
  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F9A01B] via-[#FF8C00] to-[#F9A01B] rounded-3xl shadow-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Meu Estabelecimento</h1>
              <p className="text-white/90">Informações do seu estabelecimento</p>
            </div>
          </div>
        </div>

        {/* Card do Estabelecimento */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{estabelecimento.nome}</h2>
              <p className="text-gray-500">ID: #{estabelecimento.id}</p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
              ✓ Ativo
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CNPJ */}
            {estabelecimento.cnpj && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">CNPJ</p>
                  <p className="text-lg font-semibold text-gray-800">{estabelecimento.cnpj}</p>
                </div>
              </div>
            )}

            {/* Telefone */}
            {estabelecimento.telefone && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Telefone</p>
                  <p className="text-lg font-semibold text-gray-800">{estabelecimento.telefone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/empresa/cadastro-promocao')}
            className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white rounded-2xl hover:from-[#FF8C00] hover:to-[#F9A01B] transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-6 h-6" />
            <div className="text-left">
              <p className="font-bold text-lg">Cadastrar Produto</p>
              <p className="text-sm text-white/90">Adicione novos produtos</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/HomeInicial')}
            className="flex items-center justify-center gap-3 p-6 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-[#F9A01B] hover:bg-orange-50 transition-all"
          >
            <MapPin className="w-6 h-6" />
            <div className="text-left">
              <p className="font-bold text-lg">Ir para Home</p>
              <p className="text-sm text-gray-500">Voltar ao início</p>
            </div>
          </button>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Dicas</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Mantenha suas informações sempre atualizadas</li>
            <li>• Cadastre produtos com descrições detalhadas</li>
            <li>• Use fotos de qualidade para atrair mais clientes</li>
          </ul>
        </div>
      </div>
    </SidebarLayout>
  )
}
