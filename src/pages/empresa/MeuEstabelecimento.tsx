import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { useUser } from "../../contexts/UserContext"
import { Store, Phone, Plus } from 'lucide-react'
import { listarProdutos, formatarPreco, isProdutoEmPromocao } from "../../services/apiServicesFixed"
import iconJarra from "../../assets/icon de jara.png"

export default function MeuEstabelecimento() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [estabelecimento, setEstabelecimento] = useState<any>(null)
  const [produtos, setProdutos] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true)
      
      try {
        // Busca dados do estabelecimento do localStorage
        const estabelecimentoId = localStorage.getItem('estabelecimentoId')
        const estabelecimentoNome = localStorage.getItem('estabelecimentoNome')
        
        if (estabelecimentoId && estabelecimentoNome) {
          setEstabelecimento({
            id: parseInt(estabelecimentoId),
            nome: estabelecimentoNome,
            cnpj: user?.cnpj || '',
            telefone: user?.telefone || ''
          })
          
          // Carrega produtos do estabelecimento
          const produtosResponse = await listarProdutos({ 
            estabelecimento: parseInt(estabelecimentoId) 
          })
          
          if (produtosResponse.status && produtosResponse.data) {
            setProdutos(produtosResponse.data)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }
    
    carregarDados()
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </SidebarLayout>
    )
  }

  // Se não encontrou estabelecimento
  if (!estabelecimento) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Estabelecimento não encontrado</h2>
            <p className="text-gray-600 mb-6">Cadastre seu estabelecimento para continuar.</p>
            <button
              onClick={() => navigate('/cadastro-estabelecimento')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Cadastrar Estabelecimento
            </button>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      {/* Cabeçalho */}
      <div className="mt-8 mb-12">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {estabelecimento.nome}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Store className="w-4 h-4" />
                <span>{estabelecimento.cnpj}</span>
              </div>
              {estabelecimento.telefone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{estabelecimento.telefone}</span>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => navigate('/cadastro-promocao')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nova Promoção
          </button>
        </div>
      </div>

      {/* Grid de Produtos */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Minhas Promoções</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/cadastro-promocao')}
              className="bg-[#F9A01B] hover:bg-[#FF8C00] text-white px-4 py-2 rounded-xl font-semibold transition-colors shadow-md"
            >
              ➕ Adicionar
            </button>
          </div>
        </div>

        {produtos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma promoção cadastrada</h3>
            <p className="text-gray-500 mb-6">Comece cadastrando sua primeira promoção!</p>
            <button 
              onClick={() => navigate('/cadastro-promocao')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Criar Promoção
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtos.map(produto => {
              const emPromocao = isProdutoEmPromocao(produto)
              
              return (
                <article
                  key={produto.id}
                  onClick={() => navigate(`/produto/${produto.id}`)}
                  className="rounded-2xl border-2 border-gray-200 bg-white p-4 cursor-pointer
                             shadow-md transition-all hover:shadow-xl hover:-translate-y-1 hover:border-blue-300"
                >
                  {/* Status Badge */}
                  <div className="flex items-start justify-between mb-2">
                    <span 
                      className={`text-white text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-sm
                                ${emPromocao ? 'bg-green-600' : 'bg-gray-500'}`}
                    >
                      {emPromocao ? 'ATIVA' : 'INATIVA'}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/produto/${produto.id}/editar`)
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors text-lg"
                    >
                      ⚙️
                    </button>
                  </div>

                  {/* Product Image */}
                  <div className="flex items-center justify-center py-4 bg-gray-50 rounded-xl mb-3">
                    <img 
                      src={produto.imagem || iconJarra} 
                      alt={produto.nome} 
                      className="w-24 h-24 object-contain drop-shadow-md" 
                    />
                  </div>

                  {/* Product Info */}
                  <div className="mb-2">
                    <h3 className="font-medium text-gray-800 line-clamp-2 mb-1">
                      {produto.nome}
                    </h3>
                    <p className="text-sm text-green-600 font-bold">
                      {emPromocao 
                        ? formatarPreco(produto.promocao.preco_promocional)
                        : formatarPreco(produto.preco)
                      }
                    </p>
                  </div>

                  {/* Promotion Period */}
                  {emPromocao && (
                    <div className="text-xs text-gray-500">
                      <p>Início: {new Date(produto.promocao.data_inicio).toLocaleDateString()}</p>
                      <p>Fim: {new Date(produto.promocao.data_fim).toLocaleDateString()}</p>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </SidebarLayout>
  )
}
