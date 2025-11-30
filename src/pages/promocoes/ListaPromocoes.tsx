import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Tag, TrendingDown, Package, Store, RefreshCw } from 'lucide-react'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import BotaoFavorito from "../../components/favoritos/BotaoFavorito"
import { listarProdutos, listarCategorias, formatarPreco, calcularDesconto, isProdutoEmPromocao } from "../../services/apiServicesFixed"
import type { filtrosProdutos } from "../../services/types"

interface Produto {
  id: number
  nome: string
  descricao: string
  preco: number
  imagem?: string
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
  const [estabelecimentos, setEstabelecimentos] = useState<Array<{ id: number; nome: string }>>([])
  const [loading, setLoading] = useState(true)
  // Removido filtros e setFiltros pois agora usamos URL params
  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [estabelecimentoFiltro, setEstabelecimentoFiltro] = useState('')
  const [apenasPromocoes, setApenasPromocoes] = useState(false)

  // Inicializa filtros com base nos parâmetros da URL
  useEffect(() => {
    const categoriaParam = searchParams.get('categoria')
    const buscaParam = searchParams.get('busca')
    const promocaoParam = searchParams.get('promocao')
    const estabelecimentoParam = searchParams.get('estabelecimento')
    
    console.log('🔍 Inicializando filtros da URL:', {
      categoriaParam,
      buscaParam,
      promocaoParam,
      estabelecimentoParam
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
    
    if (estabelecimentoParam) {
      setEstabelecimentoFiltro(estabelecimentoParam)
    } else {
      setEstabelecimentoFiltro('')
    }
  }, [searchParams])

  // Carrega estabelecimentos uma vez
  useEffect(() => {
    const carregarEstabelecimentos = async () => {
      try {
        console.log('🏪 CARREGANDO ESTABELECIMENTOS DO BANCO DE DADOS...')
        const api = (await import('../../lib/api')).default
        const response = await api.get<any>('/estabelecimentos/todos')
        console.log('🏪 Resposta da API de estabelecimentos:', response.data)
        
        if (response.data?.status && response.data?.data?.length > 0) {
          const estabs = response.data.data.map((e: any) => ({
            id: e.id_estabelecimento,
            nome: e.nome
          }))
          console.log('✅ Estabelecimentos carregados:', estabs)
          setEstabelecimentos(estabs)
        } else {
          console.log('⚠️ API não retornou estabelecimentos válidos')
          setEstabelecimentos([])
        }
      } catch (error) {
        console.error('❌ Erro ao carregar estabelecimentos:', error)
        setEstabelecimentos([])
      }
    }
    
    carregarEstabelecimentos()
  }, [])

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
        const estabelecimentoParam = searchParams.get('estabelecimento')
        
        // Prioriza parâmetros da URL, depois estado local
        if (categoriaParam) {
          novosFiltros.categoria = parseInt(categoriaParam)
          console.log('🏷️ Filtro de categoria da URL:', categoriaParam)
        } else if (categoriaFiltro) {
          novosFiltros.categoria = parseInt(categoriaFiltro)
          console.log('🏷️ Filtro de categoria do estado:', categoriaFiltro)
        }
        
        if (buscaParam) {
          novosFiltros.busca = buscaParam
          console.log('🔍 Filtro de busca da URL:', buscaParam)
        } else if (busca.trim()) {
          novosFiltros.busca = busca.trim()
          console.log('🔍 Filtro de busca do estado:', busca.trim())
        }
        
        if (promocaoParam === 'true') {
          novosFiltros.promocao = true
          console.log('🎁 Filtro de promoção da URL: true')
        } else if (apenasPromocoes) {
          novosFiltros.promocao = true
          console.log('🎁 Filtro de promoção do estado: true')
        }
        
        // Filtro de estabelecimento
        let filtroEstabelecimento: number | null = null
        if (estabelecimentoParam) {
          filtroEstabelecimento = parseInt(estabelecimentoParam)
          novosFiltros.estabelecimento = filtroEstabelecimento
          console.log('🏪 Filtro de estabelecimento da URL:', estabelecimentoParam)
        } else if (estabelecimentoFiltro) {
          filtroEstabelecimento = parseInt(estabelecimentoFiltro)
          novosFiltros.estabelecimento = filtroEstabelecimento
          console.log('🏪 Filtro de estabelecimento do estado:', estabelecimentoFiltro)
        }
        
        console.log('🔍 Filtros finais aplicados:', novosFiltros)
        
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
              estabelecimento: produto.estabelecimento,
              temPromocao: !!produto.promocao
            })
          })
          
          // FILTRO FRONTEND: Garante que só mostra produtos do estabelecimento correto
          let produtosFiltrados = produtosResponse.data
          if (filtroEstabelecimento) {
            produtosFiltrados = produtosResponse.data.filter((p: any) => {
              const produtoEstabId = Number(p.estabelecimento?.id || p.id_estabelecimento || 0)
              return produtoEstabId === filtroEstabelecimento
            })
            console.log(`🏪 Filtrado por estabelecimento ${filtroEstabelecimento}: ${produtosFiltrados.length} de ${produtosResponse.data.length} produtos`)
          }
          
          setProdutos(produtosFiltrados)
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
  }, [searchParams, categoriaFiltro, busca, apenasPromocoes, estabelecimentoFiltro])

  // Limpa filtros
  const limparFiltros = () => {
    setBusca('')
    setCategoriaFiltro('')
    setEstabelecimentoFiltro('')
    setApenasPromocoes(false)
    setSearchParams({})
  }

  // Recarrega produtos manualmente
  const recarregarProdutos = async () => {
    try {
      console.log('🔄 Recarregando produtos manualmente...')
      setLoading(true)
      
      // Monta filtros atuais usando a mesma lógica
      const filtrosAtuais: filtrosProdutos = {}
      
      const categoriaParam = searchParams.get('categoria')
      const buscaParam = searchParams.get('busca')
      const promocaoParam = searchParams.get('promocao')
      
      // Prioriza parâmetros da URL, depois estado local
      if (categoriaParam) {
        filtrosAtuais.categoria = parseInt(categoriaParam)
        console.log('🏷️ Recarregando com categoria da URL:', categoriaParam)
      } else if (categoriaFiltro) {
        filtrosAtuais.categoria = parseInt(categoriaFiltro)
        console.log('🏷️ Recarregando com categoria do estado:', categoriaFiltro)
      }
      
      if (buscaParam) {
        filtrosAtuais.busca = buscaParam
        console.log('🔍 Recarregando com busca da URL:', buscaParam)
      } else if (busca.trim()) {
        filtrosAtuais.busca = busca.trim()
        console.log('🔍 Recarregando com busca do estado:', busca.trim())
      }
      
      if (promocaoParam === 'true') {
        filtrosAtuais.promocao = true
        console.log('🎁 Recarregando com promoção da URL: true')
      } else if (apenasPromocoes) {
        filtrosAtuais.promocao = true
        console.log('🎁 Recarregando com promoção do estado: true')
      }
      
      console.log('🔍 Recarregando com filtros finais:', filtrosAtuais)
      
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Moderno */}
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6 border border-orange-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl shadow-lg">
                  <Tag className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    Promoções
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {categoriaFiltro ? (
                      <>
                        <span className="font-medium text-orange-600">
                          {categorias.find(c => c.id.toString() === categoriaFiltro)?.nome || 'Categoria'}
                        </span>
                      </>
                    ) : (
                      'Encontre as melhores ofertas'
                    )}
                  </p>
                </div>
              </div>
              
              {/* Contador de produtos - Design melhorado */}
              {!loading && (
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 px-6 py-3 rounded-2xl border-2 border-orange-300">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{produtos.length}</div>
                        <div className="text-xs text-orange-700 font-medium">
                          {produtos.length === 1 ? 'oferta' : 'ofertas'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={recarregarProdutos}
                    disabled={loading}
                    className="p-3 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-2xl transition-all hover:scale-105 disabled:opacity-50"
                    title="Atualizar lista"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              )}
            </div>
          </div>


          {/* Barra de Pesquisa - Design Melhorado */}
          <section className="mb-6">
            <div className="relative w-full bg-white rounded-2xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <input
                placeholder="Buscar promoções e produtos..."
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
                className="w-full h-14 pl-14 pr-32 rounded-2xl border-0 text-gray-700 text-base focus:ring-2 focus:ring-orange-400 placeholder:text-gray-400"
              />
              <button 
                type="button"
                onClick={() => {
                  const params = new URLSearchParams()
                  if (busca.trim()) params.set('busca', busca.trim())
                  if (categoriaFiltro) params.set('categoria', categoriaFiltro)
                  if (apenasPromocoes) params.set('promocao', 'true')
                  setSearchParams(params)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>
            </div>
          </section>

          {/* Category Filters - Design Melhorado */}
          <section className="mb-6">
            <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-orange-600" />
                  Filtrar por Categoria
                </h2>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl border-2 border-orange-300 cursor-pointer hover:from-orange-200 hover:to-orange-300 transition-all">
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
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <TrendingDown className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-700 font-semibold">Apenas Promoções</span>
                  </label>
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Limpar filtros
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-2 mt-4">
              {/* Botão "Todas" */}
              <button 
                onClick={() => {
                  console.log('🛒 Clicou em "Todas as categorias"')
                  setCategoriaFiltro('')
                  const params = new URLSearchParams()
                  if (busca.trim()) params.set('busca', busca.trim())
                  if (apenasPromocoes) params.set('promocao', 'true')
                  // Remove o parâmetro categoria da URL
                  setSearchParams(params)
                  console.log('🛒 Filtros após clicar em "Todas":', { busca: busca.trim(), apenasPromocoes })
                }}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-md whitespace-nowrap flex-shrink-0 ${
                  !categoriaFiltro && !searchParams.get('categoria')
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
                const isActive = categoriaFiltro === categoria.id.toString() || searchParams.get('categoria') === categoria.id.toString()
                
                return (
                  <button 
                    key={categoria.id}
                    onClick={() => {
                      const novaCategoria = categoria.id.toString()
                      console.log('🏷️ Clicou na categoria:', categoria.nome, 'ID:', novaCategoria)
                      setCategoriaFiltro(novaCategoria)
                      const params = new URLSearchParams()
                      if (busca.trim()) params.set('busca', busca.trim())
                      params.set('categoria', novaCategoria)
                      if (apenasPromocoes) params.set('promocao', 'true')
                      setSearchParams(params)
                      console.log('🏷️ Filtros após selecionar categoria:', { 
                        categoria: novaCategoria, 
                        busca: busca.trim(), 
                        apenasPromocoes 
                      })
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
            </div>
          </section>

          {/* Filtro por Estabelecimento */}
          <section className="mb-6">
            <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Store className="w-5 h-5 text-orange-600" />
                  Filtrar por Estabelecimento
                </h2>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-2 mt-4">
                {/* Botão "Todos" */}
                <button 
                  onClick={() => {
                    setEstabelecimentoFiltro('')
                    const params = new URLSearchParams(searchParams)
                    params.delete('estabelecimento')
                    setSearchParams(params)
                  }}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-md whitespace-nowrap flex-shrink-0 ${
                    !estabelecimentoFiltro && !searchParams.get('estabelecimento')
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                  }`}
                >
                  🏪 Todos
                </button>
                
                {/* Estabelecimentos da API */}
                {estabelecimentos.map((estab) => {
                  const isActive = estabelecimentoFiltro === estab.id.toString() || searchParams.get('estabelecimento') === estab.id.toString()
                  
                  return (
                    <button 
                      key={estab.id}
                      onClick={() => {
                        const novoEstab = estab.id.toString()
                        setEstabelecimentoFiltro(novoEstab)
                        const params = new URLSearchParams(searchParams)
                        params.set('estabelecimento', novoEstab)
                        setSearchParams(params)
                      }}
                      className={`px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-md whitespace-nowrap flex-shrink-0 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-2 ring-white ring-offset-2' 
                          : 'bg-white hover:bg-blue-50 text-gray-700 border border-blue-200'
                      }`}
                    >
                      🏬 {estab.nome}
                    </button>
                  )
                })}
                
                {/* Loading de estabelecimentos */}
                {estabelecimentos.length === 0 && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span>Carregando estabelecimentos...</span>
                  </div>
                )}
              </div>
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
                      {/* Header com Badge e Favorito */}
                      <div className="relative">
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
                        
                        {/* Botão de Favorito */}
                        <div 
                          className="absolute top-2 right-2"
                          onClick={(e) => e.stopPropagation()} // Evita que o clique acione o card
                        >
                          <BotaoFavorito
                            idProduto={produto.id}
                            idEstabelecimento={produto.estabelecimento.id}
                            size="sm"
                            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
                          />
                        </div>
                      </div>
                      
                      <div className="p-6">
                        {/* Imagem do produto */}
                        <div className="flex justify-center mb-4">
                          {produto.imagem ? (
                            <img 
                              src={produto.imagem} 
                              alt={produto.nome}
                              className="w-32 h-32 object-contain rounded-xl bg-gray-50"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center ${produto.imagem ? 'hidden' : ''}`}>
                            <Package className="w-12 h-12 text-orange-300" />
                          </div>
                        </div>
                        
                        {/* Nome do produto */}
                        <h3 className="font-bold text-xl text-gray-800 mb-3 leading-tight text-center">
                          {produto.nome}
                        </h3>
                        
                        {/* Descrição */}
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {produto.descricao}
                        </p>
                        
                        {/* Informações do produto */}
                        <div className="space-y-3 mb-4">
                          {/* Estabelecimento - DESTAQUE */}
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-500 p-1.5 rounded-lg">
                                <Store className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <span className="text-xs text-blue-600 font-medium">Vendido por</span>
                                <p className="text-sm text-blue-800 font-bold">{produto.estabelecimento?.nome || 'Estabelecimento'}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Categoria */}
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[#F9A01B]" />
                            <span className="text-sm text-gray-700 font-medium">{produto.categoria?.nome || 'Categoria'}</span>
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
