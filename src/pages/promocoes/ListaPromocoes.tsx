import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, ShoppingCart, Tag, TrendingDown, Package, Store } from 'lucide-react'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { listarProdutos, listarCategorias, formatarPreco, calcularDesconto, isProdutoEmPromocao } from "../../services/apiServices"
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
    
    if (categoriaParam) {
      setCategoriaFiltro(categoriaParam)
    }
    if (buscaParam) {
      setBusca(buscaParam)
    }
    if (promocaoParam === 'true') {
      setApenasPromocoes(true)
    }
  }, [searchParams])

  // Carrega categorias uma vez
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const categoriasResponse = await listarCategorias()
        if (categoriasResponse.status && categoriasResponse.data) {
          setCategorias(categoriasResponse.data)
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }
    
    carregarCategorias()
  }, [])

  // Carrega produtos quando filtros mudam
  useEffect(() => {
    const carregarProdutos = async () => {
      try {
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
        
        const produtosResponse = await listarProdutos(novosFiltros)
        if (produtosResponse.status && produtosResponse.data) {
          setProdutos(produtosResponse.data)
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
      } finally {
        setLoading(false)
      }
    }
    
    carregarProdutos()
  }, [searchParams, categoriaFiltro, busca, apenasPromocoes])

  // Aplica filtros atualizando a URL
  const aplicarFiltros = () => {
    const params = new URLSearchParams()
    
    if (busca.trim()) params.set('busca', busca.trim())
    if (categoriaFiltro) params.set('categoria', categoriaFiltro)
    if (apenasPromocoes) params.set('promocao', 'true')
    
    setSearchParams(params)
  }

  // Limpa filtros
  const limparFiltros = () => {
    setBusca('')
    setCategoriaFiltro('')
    setApenasPromocoes(false)
    setSearchParams({})
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#F9A01B] via-[#FF8C00] to-[#F9A01B] rounded-3xl shadow-2xl p-8 text-white mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Promoções Disponíveis</h1>
                <p className="text-white/90">Encontre os melhores preços da região</p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-[#F9A01B]" />
              <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9A01B] focus:outline-none"
                />
              </div>

              {/* Categoria */}
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9A01B] focus:outline-none"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>

              {/* Apenas promoções */}
              <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={apenasPromocoes}
                  onChange={(e) => setApenasPromocoes(e.target.checked)}
                  className="w-4 h-4 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                />
                <span className="text-gray-700">Apenas promoções</span>
              </label>

              {/* Botões */}
              <div className="flex gap-2">
                <button
                  onClick={aplicarFiltros}
                  className="flex-1 bg-[#F9A01B] hover:bg-[#FF8C00] text-white px-4 py-3 rounded-xl font-semibold transition-all"
                >
                  Filtrar
                </button>
                <button
                  onClick={limparFiltros}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>

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
                  <p className="text-gray-500">Tente ajustar os filtros ou buscar por outros termos</p>
                </div>
              ) : (
                produtos.map(produto => {
                  const emPromocao = isProdutoEmPromocao(produto)
                  const desconto = emPromocao ? calcularDesconto(produto.preco, produto.promocao!.preco_promocional) : 0
                  
                  return (
                    <div key={produto.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Badge de promoção */}
                      {emPromocao && (
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 text-sm font-bold">
                          <TrendingDown className="w-4 h-4 inline mr-1" />
                          {desconto}% OFF
                        </div>
                      )}
                      
                      <div className="p-6">
                        {/* Nome do produto */}
                        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                          {produto.nome}
                        </h3>
                        
                        {/* Descrição */}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {produto.descricao}
                        </p>
                        
                        {/* Categoria */}
                        <div className="flex items-center gap-1 mb-3">
                          <Tag className="w-4 h-4 text-[#F9A01B]" />
                          <span className="text-sm text-gray-600">{produto.categoria.nome}</span>
                        </div>
                        
                        {/* Estabelecimento */}
                        <div className="flex items-center gap-1 mb-4">
                          <Store className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">{produto.estabelecimento.nome}</span>
                        </div>
                        
                        {/* Preços */}
                        <div className="mb-4">
                          {emPromocao ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-green-600">
                                  {formatarPreco(produto.promocao!.preco_promocional)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatarPreco(produto.preco)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-2xl font-bold text-gray-800">
                              {formatarPreco(produto.preco)}
                            </span>
                          )}
                        </div>
                        
                        {/* Botão de ação */}
                        <button className="w-full bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#F9A01B] text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          Ver Detalhes
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
