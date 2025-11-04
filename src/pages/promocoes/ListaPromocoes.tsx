import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Tag, TrendingDown, Package, Store, RefreshCw } from 'lucide-react'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { listarProdutos, listarCategorias, formatarPreco, calcularDesconto, isProdutoEmPromocao } from "../../services/apiServicesFixed"
import type { filtrosProdutos } from "../../services/types"

interface Produto {
  id: number
  nome: string
  descricao: string
  preco: number
  promocao?: {
    id: number
    preco_promocional: number
    data_inicio: string
    data_fim: string
  }
  categoria: {
    id: number
    nome: string
  }
  estabelecimento: {
    id: number
    nome: string
  }
  created_at: string
}

export default function ListaPromocoes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Array<{ id: number; nome: string }>>([]) 
  const [loading, setLoading] = useState(true)
  // Removido filtros e setFiltros pois agora usamos URL params
  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [apenasPromocoes, setApenasPromocoes] = useState(false)

  // Inicializa filtros com base nos parâmetros da URL
  useEffect(() => {
    const categoriaParam = searchParams.get('categoria')
    const buscaParam = searchParams.get('busca')
    const promocaoParam = searchParams.get('promocao')
    
    console.log('🔍 Inicializando filtros da URL:', {
      categoriaParam,
      buscaParam,
      promocaoParam
    })
    
    if (categoriaParam) {
      setCategoriaFiltro(categoriaParam)
    } else {
      setCategoriaFiltro('')
    }
    
    if (buscaParam) {
      setBusca(buscaParam)
    } else {
      setBusca('')
    }
    
    if (promocaoParam === 'true') {
      setApenasPromocoes(true)
    } else {
      setApenasPromocoes(false)
    }
  }, [searchParams])

  // Carrega categorias uma vez
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        console.log('🏷️ CARREGANDO CATEGORIAS DO BANCO DE DADOS...')
        const categoriasResponse = await listarCategorias()
        console.log('🏷️ Resposta da API de categorias:', categoriasResponse)
        
        if (categoriasResponse.status && categoriasResponse.data && categoriasResponse.data.length > 0) {
          console.log('✅ Categorias carregadas do banco:', categoriasResponse.data)
          setCategorias(categoriasResponse.data)
        } else {
          console.log('⚠️ API não retornou categorias válidas')
          console.log('🚫 MANTENDO ARRAY VAZIO - Só usar categorias do banco de dados')
          // NÃO usa categorias padrão - só mostra as que existem no banco
          setCategorias([])
        }
      } catch (error) {
        console.error('❌ Erro ao carregar categorias do banco:', error)
        console.log('🚫 MANTENDO ARRAY VAZIO - Só usar categorias do banco de dados')
        // NÃO usa categorias padrão mesmo em caso de erro
        setCategorias([])
      }
    }
    
    carregarCategorias()
  }, [])

  // Carrega produtos quando filtros mudam
  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        console.log('🔄 INICIANDO carregamento de produtos na página de promoções')
        setLoading(true)
        
        // Monta filtros baseado no estado atual e parâmetros da URL
        const novosFiltros: filtrosProdutos = {}
        
        const categoriaParam = searchParams.get('categoria')
        const buscaParam = searchParams.get('busca')
        const promocaoParam = searchParams.get('promocao')
        
        if (categoriaParam) novosFiltros.categoria = parseInt(categoriaParam)
        if (buscaParam) novosFiltros.busca = buscaParam
        if (promocaoParam === 'true') novosFiltros.promocao = true
        if (categoriaFiltro && !categoriaParam) novosFiltros.categoria = parseInt(categoriaFiltro)
        if (busca.trim() && !buscaParam) novosFiltros.busca = busca.trim()
        if (apenasPromocoes && !promocaoParam) novosFiltros.promocao = true
        
        console.log('🔍 Filtros aplicados:', novosFiltros)
        
        const produtosResponse = await listarProdutos(novosFiltros)
        console.log('📦 Resposta da API de produtos:', produtosResponse)
        
        if (produtosResponse.status && produtosResponse.data) {
          console.log('✅ Produtos carregados com sucesso:', produtosResponse.data.length, 'produtos')
          console.log('🔍 DADOS COMPLETOS DOS PRODUTOS:', JSON.stringify(produtosResponse.data, null, 2))
          
          // Analisa cada produto individualmente
          produtosResponse.data.forEach((produto, index) => {
            console.log(`📦 PRODUTO ${index + 1}:`, {
              id: produto.id,
              nome: produto.nome,
              preco: produto.preco,
              temPromocao: !!produto.promocao,
              promocao: produto.promocao,
              promocaoCompleta: JSON.stringify(produto.promocao, null, 2)
            })
          })
          
          setProdutos(produtosResponse.data)
        } else {
          console.log('⚠️ Resposta da API sem produtos válidos:', produtosResponse)
          setProdutos([])
        }
      } catch (error) {
        console.error('❌ Erro ao carregar produtos na página de promoções:', error)
        setProdutos([]) // Define array vazio em caso de erro
      } finally {
        setLoading(false)
      }
    }
    
    carregarProdutos()
  }, [searchParams, categoriaFiltro, busca, apenasPromocoes])

  // Limpa filtros
  const limparFiltros = () => {
    setBusca('')
    setCategoriaFiltro('')
    setApenasPromocoes(false)
    setSearchParams({})
  }

  // Recarrega produtos manualmente
  const recarregarProdutos = async () => {
    try {
      console.log('🔄 Recarregando produtos manualmente...')
      setLoading(true)
      
      // Monta filtros atuais
      const filtrosAtuais: filtrosProdutos = {}
      
      const categoriaParam = searchParams.get('categoria')
      const buscaParam = searchParams.get('busca')
      const promocaoParam = searchParams.get('promocao')
      
      if (categoriaParam) filtrosAtuais.categoria = parseInt(categoriaParam)
      if (buscaParam) filtrosAtuais.busca = buscaParam
      if (promocaoParam === 'true') filtrosAtuais.promocao = true
      if (categoriaFiltro && !categoriaParam) filtrosAtuais.categoria = parseInt(categoriaFiltro)
      if (busca.trim() && !buscaParam) filtrosAtuais.busca = busca.trim()
      if (apenasPromocoes && !promocaoParam) filtrosAtuais.promocao = true
      
      console.log('🔍 Recarregando com filtros:', filtrosAtuais)
      
      const produtosResponse = await listarProdutos(filtrosAtuais)
      console.log('📦 Produtos recarregados:', produtosResponse)
      
      if (produtosResponse.status && produtosResponse.data) {
        console.log('✅ Produtos recarregados com sucesso:', produtosResponse.data.length, 'produtos')
        setProdutos(produtosResponse.data)
      } else {
        console.log('⚠️ Nenhum produto encontrado no recarregamento')
        setProdutos([])
      }
    } catch (error) {
      console.error('❌ Erro ao recarregar produtos:', error)
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#F9A01B] via-[#FF8C00] to-[#F9A01B] rounded-3xl shadow-2xl p-8 text-white mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Promoções Disponíveis</h1>
                  <p className="text-white/90">
                    {categoriaFiltro ? (
                      <>
                        Categoria: <span className="font-semibold">
                          {categorias.find(c => c.id.toString() === categoriaFiltro)?.nome || 'Categoria selecionada'}
                        </span>
                      </>
                    ) : (
                      'Encontre os melhores preços da região'
                    )}
                  </p>
                </div>
              </div>
              
              {/* Contador de produtos */}
              {!loading && (
                <div className="bg-white/20 px-4 py-2 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{produtos.length}</div>
                    <div className="text-sm text-white/90">
                      {produtos.length === 1 ? 'produto' : 'produtos'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <section className="mt-10">
            <div 
              className="relative w-full bg-white rounded-3xl border border-gray-100 
                       shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all 
                       hover:shadow-[0_6px_30px_rgba(0,0,0,0.12)]"
            >
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                placeholder="Digite para buscar produtos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const params = new URLSearchParams()
                    if (busca.trim()) params.set('busca', busca.trim())
                    if (categoriaFiltro) params.set('categoria', categoriaFiltro)
                    if (apenasPromocoes) params.set('promocao', 'true')
                    setSearchParams(params)
                  }
                }}
                className="h-16 pl-16 pr-16 rounded-3xl border-0 text-gray-700 text-base 
                         focus-visible:ring-2 focus-visible:ring-[#F9A01B] 
                         placeholder:text-gray-400"
              />
              <button 
                onClick={() => {
                  const params = new URLSearchParams()
                  if (busca.trim()) params.set('busca', busca.trim())
                  if (categoriaFiltro) params.set('categoria', categoriaFiltro)
                  if (apenasPromocoes) params.set('promocao', 'true')
                  setSearchParams(params)
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 transition-transform hover:scale-110"
              >
                <Search className="w-5 h-6 text-gray-400" />
              </button>
            </div>
          </section>

          {/* Category Filters */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Categorias</h2>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all">
                  <input
                    type="checkbox"
                    checked={apenasPromocoes}
                    onChange={(e) => {
                      setApenasPromocoes(e.target.checked)
                      const params = new URLSearchParams()
                      if (busca.trim()) params.set('busca', busca.trim())
                      if (categoriaFiltro) params.set('categoria', categoriaFiltro)
                      if (e.target.checked) params.set('promocao', 'true')
                      setSearchParams(params)
                    }}
                    className="w-4 h-4 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                  />
                  <span className="text-sm text-gray-700 font-medium">🎁 Apenas promoções</span>
                </label>
                <button
                  onClick={limparFiltros}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition-all"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {/* Botão "Todas" */}
              <button 
                onClick={() => {
                  setCategoriaFiltro('')
                  const params = new URLSearchParams()
                  if (busca.trim()) params.set('busca', busca.trim())
                  if (apenasPromocoes) params.set('promocao', 'true')
                  setSearchParams(params)
                }}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-md whitespace-nowrap flex-shrink-0 ${
                  !categoriaFiltro 
                    ? 'bg-[#F9A01B] hover:bg-[#FF8C00] text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                🛒 Todas
              </button>
              
              {/* Categorias dinâmicas da API */}
              {categorias.map((categoria, index) => {
                const cores = [
                  'bg-green-500 hover:bg-green-600',
                  'bg-purple-500 hover:bg-purple-600', 
                  'bg-red-500 hover:bg-red-600',
                  'bg-yellow-500 hover:bg-yellow-600',
                  'bg-indigo-500 hover:bg-indigo-600',
                  'bg-pink-500 hover:bg-pink-600',
                  'bg-teal-500 hover:bg-teal-600',
                  'bg-orange-500 hover:bg-orange-600'
                ]
                const cor = cores[index % cores.length]
                const isActive = categoriaFiltro === categoria.id.toString()
                
                return (
                  <button 
                    key={categoria.id}
                    onClick={() => {
                      const novaCategoria = categoria.id.toString()
                      setCategoriaFiltro(novaCategoria)
                      const params = new URLSearchParams()
                      if (busca.trim()) params.set('busca', busca.trim())
                      params.set('categoria', novaCategoria)
                      if (apenasPromocoes) params.set('promocao', 'true')
                      setSearchParams(params)
                    }}
                    className={`${cor} text-white px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-md whitespace-nowrap flex-shrink-0 ${
                      isActive ? 'ring-2 ring-white ring-offset-2' : ''
                    }`}
                  >
                    {categoria.nome}
                  </button>
                )
              })}
              
              {/* Loading de categorias */}
              {loading && categorias.length === 0 && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#F9A01B]"></div>
                  <span>Carregando categorias do banco de dados...</span>
                </div>
              )}
              
              {/* Mensagem quando não há categorias no banco */}
              {!loading && categorias.length === 0 && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-yellow-800 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⚠️</span>
                    <strong>Nenhuma categoria encontrada no banco de dados</strong>
                  </div>
                  <p>O sistema está configurado para mostrar apenas as categorias cadastradas no banco.</p>
                  <p>Cadastre algumas categorias no sistema para que apareçam aqui.</p>
                </div>
              )}
            </div>
          </section>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F9A01B]"></div>
            </div>
          )}

          {/* Lista de Produtos */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {produtos.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-500 mb-4">
                    {Object.keys(searchParams.toString()).length > 0 || busca || categoriaFiltro || apenasPromocoes
                      ? 'Tente ajustar os filtros ou buscar por outros termos'
                      : 'Ainda não há produtos cadastrados no sistema'
                    }
                  </p>
                  <button
                    onClick={recarregarProdutos}
                    disabled={loading}
                    className="bg-[#F9A01B] hover:bg-[#FF8C00] disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Tentar novamente
                  </button>
                </div>
              ) : (
                produtos.map(produto => {
                  const emPromocao = isProdutoEmPromocao(produto)
                  const desconto = emPromocao ? calcularDesconto(produto.preco, produto.promocao!.preco_promocional) : 0
                  
                  console.log('🔍 Produto sendo renderizado:', {
                    id: produto.id,
                    nome: produto.nome,
                    preco: produto.preco,
                    promocao: produto.promocao,
                    emPromocao,
                    desconto
                  })
                  
                  return (
                    <div 
                      key={produto.id} 
                      onClick={() => navigate(`/produto/${produto.id}`)}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer hover:scale-105"
                    >
                      {/* Badge de promoção ou produto normal */}
                      {emPromocao ? (
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 text-sm font-bold flex items-center justify-center">
                          <TrendingDown className="w-4 h-4 mr-2" />
                          PROMOÇÃO {desconto}% OFF
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-sm font-bold flex items-center justify-center">
                          <Package className="w-4 h-4 mr-2" />
                          PRODUTO DISPONÍVEL
                        </div>
                      )}
                      
                      <div className="p-6">
                        {/* Nome do produto */}
                        <h3 className="font-bold text-xl text-gray-800 mb-3 leading-tight">
                          {produto.nome}
                        </h3>
                        
                        {/* Descrição */}
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {produto.descricao}
                        </p>
                        
                        {/* Informações do produto */}
                        <div className="space-y-2 mb-4">
                          {/* Categoria */}
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[#F9A01B]" />
                            <span className="text-sm text-gray-700 font-medium">{produto.categoria.nome}</span>
                          </div>
                          
                          {/* Estabelecimento */}
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 font-medium">{produto.estabelecimento.nome}</span>
                          </div>
                        </div>
                        
                        {/* Preços */}
                        <div className="mb-6">
                          {emPromocao ? (
                            <div className="space-y-2">
                              {/* Preço promocional */}
                              <div className="flex items-center gap-3">
                                <span className="text-3xl font-bold text-green-600">
                                  {formatarPreco(produto.promocao!.preco_promocional)}
                                </span>
                                <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                                  -{desconto}%
                                </div>
                              </div>
                              
                              {/* Preço original */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">De:</span>
                                <span className="text-lg text-gray-500 line-through font-semibold">
                                  {formatarPreco(produto.preco)}
                                </span>
                              </div>
                              
                              {/* Economia */}
                              <div className="text-sm text-green-600 font-semibold">
                                Você economiza: {formatarPreco(produto.preco - produto.promocao!.preco_promocional)}
                              </div>
                              
                              {/* Período da promoção */}
                              {produto.promocao && (
                                <div className="text-xs text-gray-500 mt-2">
                                  Promoção válida até: {new Date(produto.promocao.data_fim).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span className="text-3xl font-bold text-gray-800">
                                {formatarPreco(produto.preco)}
                              </span>
                              <div className="text-sm text-gray-500 mt-1">
                                Preço regular
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Botão de ação */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation() // Evita que o clique no botão acione o clique do card
                            navigate(`/produto/${produto.id}`)
                          }}
                          className="w-full bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#F9A01B] text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          {emPromocao ? 'Aproveitar Oferta' : 'Ver Detalhes'}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}
