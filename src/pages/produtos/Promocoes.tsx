import { useState, useEffect, useRef } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Search, Heart, Plus, ChevronLeft, ChevronRight, ShoppingBag, Sparkles, Tag, CheckCircle, AlertCircle, XCircle, Package } from "lucide-react"
import iconJarra from "../../assets/icon de jara.png"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { listarProdutos, listarCategorias, formatarPreco, calcularDesconto, isProdutoEmPromocao } from "../../services/apiServicesFixed"
import type { filtrosProdutos } from "../../services/types"
import { useFavoritos } from "../../contexts/FavoritosContext"
import { useCarrinho } from "../../contexts/CarrinhoContext"
import type { Product } from "../../types"

// Animações CSS customizadas
const styles = document.createElement('style')
styles.textContent = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes bounce-slow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
  
  .animate-shimmer {
    animation: shimmer 3s infinite linear;
  }
  
  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`
if (!document.head.querySelector('style[data-promocoes-animations]')) {
  styles.setAttribute('data-promocoes-animations', 'true')
  document.head.appendChild(styles)
}

// Ícones de categorias
const categoriasIcones: Record<string, string> = {
  'Alimentos': '🍞',
  'Bebidas': '🥤',
  'Higiene': '🧴',
  'Limpeza': '🧹',
  'Padaria': '🥐',
  'Hortifruti': '🥬',
  'Carnes': '🥩',
  'Laticínios': '🥛',
}

function Promocoes() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [produtos, setProdutos] = useState<Array<any>>([])
  const [categorias, setCategorias] = useState<Array<any>>([])
  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarPromocoes, setMostrarPromocoes] = useState(false)
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'aviso' | 'erro' | null, mensagem: string }>({ tipo: null, mensagem: '' })
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [produtoHover, setProdutoHover] = useState<number | null>(null)
  const [produtoAdicionando, setProdutoAdicionando] = useState<number | null>(null)
  const filtrosRef = useRef<HTMLDivElement>(null)
  
  // Contextos de favoritos e carrinho
  const { addFavorite, removeFavorite, isFavorite } = useFavoritos()
  const { addToCart } = useCarrinho()
  
  // Placeholders animados
  const placeholders = [
    'Buscar promoções...',
    'Leite em promoção...',
    'Promoções de higiene...',
    'Buscar produtos...',
    'Ofertas do dia...'
  ]

  // Animação do placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Sincroniza estado de promoções com URL params
  useEffect(() => {
    const promocaoParam = searchParams.get('promocao')
    if (promocaoParam === 'true' && !mostrarPromocoes) {
      setMostrarPromocoes(true)
    } else if (!promocaoParam && mostrarPromocoes) {
      setMostrarPromocoes(false)
    }
  }, [searchParams])

  // Feedback automático
  useEffect(() => {
    if (feedback.tipo) {
      const timer = setTimeout(() => {
        setFeedback({ tipo: null, mensagem: '' })
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  // Carrega categorias do banco de dados
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const categoriasResponse = await listarCategorias()
        
        if (categoriasResponse.status && categoriasResponse.data && categoriasResponse.data.length > 0) {
          setCategorias(categoriasResponse.data)
        } else {
          setCategorias([])
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
        setCategorias([])
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
        const novosFiltros: filtrosProdutos = {
          // Não aplica filtro de promoção por padrão - mostra todos os produtos
        }
        
        const categoriaParam = searchParams.get('categoria')
        const buscaParam = searchParams.get('busca')
        const promocaoParam = searchParams.get('promocao')
        
        // Prioriza parâmetros da URL, depois estado local
        if (categoriaParam) {
          novosFiltros.categoria = parseInt(categoriaParam)
        } else if (categoriaFiltro) {
          novosFiltros.categoria = parseInt(categoriaFiltro)
        }
        
        if (buscaParam) {
          novosFiltros.busca = buscaParam
          // Não sobrescreve o campo se o usuário está editando
        } else if (busca.trim()) {
          novosFiltros.busca = busca.trim()
        }
        
        // Aplica filtro de promoção se ativo
        if (promocaoParam === 'true') {
          novosFiltros.promocao = true
        }
        
        
        const produtosResponse = await listarProdutos(novosFiltros)
        
        
        if (produtosResponse.status && produtosResponse.data) {
          // VALIDAÇÃO: Filtra produtos no frontend para garantir categoria correta
          let produtosFiltrados = produtosResponse.data
          
          if (novosFiltros.categoria) {
            produtosFiltrados = produtosResponse.data.filter(produto => {
              const categoriaId = produto.categoria?.id || produto.id_categoria
              return categoriaId === novosFiltros.categoria
            })
          }
          
          // Busca inteligente - case-insensitive e busca parcial
          if (novosFiltros.busca) {
            const termoBusca = novosFiltros.busca.toLowerCase().trim()
            produtosFiltrados = produtosFiltrados.filter(produto => {
              const nomeProduto = (produto.nome || '').toLowerCase()
              const descricaoProduto = (produto.descricao || '').toLowerCase()
              const categoriaNome = (produto.categoria?.nome || '').toLowerCase()
              
              // Busca no nome, descrição ou categoria
              return nomeProduto.includes(termoBusca) || 
                     descricaoProduto.includes(termoBusca) ||
                     categoriaNome.includes(termoBusca)
            })
            
          }
          
          // Aplica filtro de promoção no frontend se necessário
          let produtosFinais = produtosFiltrados
          if (promocaoParam === 'true') {
            produtosFinais = produtosFiltrados.filter(produto => {
              return isProdutoEmPromocao(produto)
            })
          }
          
          setProdutos(produtosFinais)
          
          // Feedback baseado na busca
          if (novosFiltros.busca) {
            if (produtosFinais.length > 0) {
              setFeedback({ 
                tipo: 'sucesso', 
                mensagem: `✅ ${produtosFinais.length} produto(s) encontrado(s) para "${novosFiltros.busca}"` 
              })
            } else {
              // Busca produtos similares (primeiras 3 letras)
              const termoBuscaCurto = novosFiltros.busca.toLowerCase().substring(0, 3)
              const produtosSimilares = produtosResponse.data.filter((produto: any) => {
                const nomeProduto = (produto.nome || '').toLowerCase()
                return nomeProduto.includes(termoBuscaCurto)
              }).slice(0, 3)
              
              if (produtosSimilares.length > 0) {
                const sugestoes = produtosSimilares.map((p: any) => p.nome).join(', ')
                setFeedback({ 
                  tipo: 'aviso', 
                  mensagem: `⚠️ Nenhum produto encontrado para "${novosFiltros.busca}". Você quis dizer: ${sugestoes}?` 
                })
              } else {
                setFeedback({ 
                  tipo: 'aviso', 
                  mensagem: `⚠️ Nenhum produto encontrado para "${novosFiltros.busca}". Tente termos como "leite", "arroz", "café"...` 
                })
              }
            }
          } else if (produtosFinais.length > 0) {
            setFeedback({ tipo: 'sucesso', mensagem: `✅ ${produtosFinais.length} produto(s) disponível(is)!` })
          } else {
            setFeedback({ tipo: 'aviso', mensagem: '⚠️ Nenhum produto disponível no momento.' })
          }
        } else {
          setProdutos([])
          setFeedback({ tipo: 'aviso', mensagem: '⚠️ Nenhum produto disponível.' })
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        setProdutos([])
        setFeedback({ tipo: 'erro', mensagem: '❌ Erro ao carregar promoções. Tente novamente.' })
      } finally {
        setLoading(false)
      }
    }
    
    carregarProdutos()
  }, [searchParams, categoriaFiltro, busca])

  const handleProdutoClick = (produtoId: number) => {
    navigate(`/produto/${produtoId}`)
  }

  const handleBusca = () => {
    const termoBusca = busca.trim()
    if (termoBusca) {
      setFeedback({ tipo: null, mensagem: '' })
      navigate(`/promocoes?busca=${encodeURIComponent(termoBusca)}`)
    } else {
      setFeedback({ tipo: 'aviso', mensagem: '⚠️ Digite algo para pesquisar!' })
    }
  }

  // Converter produto da API para o tipo Product
  const converterParaProduct = (produto: any): Product => {
    const emPromocao = isProdutoEmPromocao(produto)
    return {
      id: produto.id,
      nome: produto.nome,
      preco: emPromocao ? produto.promocao.preco_promocional : produto.preco,
      precoAntigo: emPromocao ? produto.preco : undefined,
      imagem: produto.imagem || iconJarra,
      categoria: produto.categoria?.nome,
      descricao: produto.descricao
    }
  }

  const handleFavoritar = async (produto: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const produtoConvertido = converterParaProduct(produto)
    
    if (isFavorite(produto.id)) {
      await removeFavorite(produto.id)
    } else {
      await addFavorite(produtoConvertido)
    }
  }

  const handleAdicionarCarrinho = async (produto: any, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Define produto que está sendo adicionado
    setProdutoAdicionando(produto.id)
    
    try {
      const produtoConvertido = converterParaProduct(produto)
      await addToCart(produtoConvertido, 1)
      
      // Feedback de sucesso
      setFeedback({ 
        tipo: 'sucesso', 
        mensagem: `✅ "${produto.nome}" adicionado ao carrinho com sucesso!` 
      })
      
      // Limpa o feedback após 3 segundos
      setTimeout(() => {
        setFeedback({ tipo: null, mensagem: '' })
      }, 3000)
      
      console.log('✅ Produto adicionado ao carrinho:', produto.nome)
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error)
      setFeedback({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao adicionar produto. Tente novamente.' 
      })
    } finally {
      // Remove estado de loading
      setTimeout(() => {
        setProdutoAdicionando(null)
      }, 500)
    }
  }

  return (
    <SidebarLayout>
      {/* Header com Gradiente */}
      <section className="mt-8 mb-6">
        <div className="bg-gradient-to-r from-[#FFA500] via-[#FF8C00] to-[#FFA500] rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-xl">
              <Tag className="w-9 h-9 text-white animate-bounce-slow drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-black mb-1" style={{ textShadow: '3px 3px 10px rgba(0,0,0,0.8), 0px 0px 20px rgba(0,0,0,0.6)' }}>
                Promoções Especiais
              </h1>
              <p className="text-white text-sm sm:text-base font-bold flex items-center gap-2" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8), 0px 0px 10px rgba(0,0,0,0.5)' }}>
                <Sparkles className="w-4 h-4 animate-pulse drop-shadow-lg" />
                Encontre as melhores ofertas e economize!
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feedback Visual */}
      {feedback.tipo && (
        <div className={`mb-6 p-4 rounded-2xl shadow-lg border-2 flex items-center gap-3 animate-fade-in ${
          feedback.tipo === 'sucesso' ? 'bg-green-50 border-green-200' :
          feedback.tipo === 'aviso' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          {feedback.tipo === 'sucesso' && <CheckCircle className="w-6 h-6 text-green-600" />}
          {feedback.tipo === 'aviso' && <AlertCircle className="w-6 h-6 text-yellow-600" />}
          {feedback.tipo === 'erro' && <XCircle className="w-6 h-6 text-red-600" />}
          <p className={`text-sm font-semibold ${
            feedback.tipo === 'sucesso' ? 'text-green-700' :
            feedback.tipo === 'aviso' ? 'text-yellow-700' :
            'text-red-700'
          }`}>
            {feedback.mensagem}
          </p>
        </div>
      )}

      {/* Barra de Pesquisa Moderna com Feedback */}
      <section className="mb-8">
        <div 
          className="relative w-full bg-white rounded-3xl border-2 border-gray-100 
                     shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all 
                     hover:shadow-[0_8px_32px_rgba(249,160,27,0.15)] hover:border-[#FFA500]/30">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <Input
            placeholder={placeholders[placeholderIndex]}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBusca()}
            className="h-16 pl-16 pr-32 rounded-3xl border-0 text-gray-700 text-base 
                       focus-visible:ring-2 focus-visible:ring-[#FFA500] 
                       placeholder:text-gray-400 font-medium"
          />
          
          {/* Botões de Ação */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {busca.trim() && (
              <button 
                onClick={() => {
                  setBusca('')
                  navigate('/promocoes')
                  setFeedback({ tipo: null, mensagem: '' })
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:scale-110"
                title="Limpar busca"
              >
                <XCircle className="w-4 h-4 text-gray-600" />
              </button>
            )}
            <button 
              onClick={handleBusca}
              disabled={!busca.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFA500] to-[#FF8C00] flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
              title="Pesquisar"
            >
              <Search className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        
        {/* Termo de Busca Ativo */}
        {searchParams.get('busca') && (
          <div className="mt-3 flex items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] text-white px-4 py-2 rounded-full shadow-md">
              <Search className="w-4 h-4" />
              <span className="text-sm font-bold">Buscando por:</span>
              <span className="text-sm font-semibold">"{searchParams.get('busca')}"</span>
              <button
                onClick={() => {
                  setBusca('')
                  navigate('/promocoes')
                  setFeedback({ tipo: null, mensagem: '' })
                }}
                className="ml-1 hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Filtros de Tipo (Todos/Promoções) - Pill Buttons */}
      {!loading && (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.delete('promocao')
              setSearchParams(params)
            }}
            className={`group px-6 py-3 rounded-2xl font-bold transition-all shadow-lg whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
              searchParams.get('promocao') !== 'true'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white ring-4 ring-blue-200' 
                : 'bg-white hover:bg-blue-50 text-gray-700 border-2 border-gray-200 hover:border-blue-500'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Todos os Produtos</span>
          </button>

          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set('promocao', 'true')
              setSearchParams(params)
            }}
            className={`group px-6 py-3 rounded-2xl font-bold transition-all shadow-lg whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
              searchParams.get('promocao') === 'true'
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white ring-4 ring-green-200' 
                : 'bg-white hover:bg-green-50 text-gray-700 border-2 border-gray-200 hover:border-green-500'
            }`}
          >
            <Tag className="w-5 h-5" />
            <span>Apenas Promoções</span>
          </button>
        </div>
      )}

      {/* Filtros de Categoria - Scrollável com Ícones */}
      {!loading && (
        <div className="relative mb-8">
          <div ref={filtrosRef} className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide scroll-smooth">
            {/* Botão "Todas as Categorias" */}
            <button
              onClick={() => {
                setCategoriaFiltro('')
                const params = new URLSearchParams(searchParams)
                params.delete('categoria')
                if (busca.trim()) params.set('busca', busca.trim())
                if (mostrarPromocoes) params.set('promocao', 'true')
                setSearchParams(params)
              }}
              className={`group px-6 py-3 rounded-2xl font-bold transition-all shadow-lg whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
                !categoriaFiltro && !searchParams.get('categoria')
                  ? 'bg-gradient-to-r from-[#FFA500] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FFA500] text-white ring-4 ring-orange-200' 
                  : 'bg-white hover:bg-orange-50 text-gray-700 border-2 border-gray-200 hover:border-[#FFA500]'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Todas as Categorias</span>
            </button>

            {/* Botões de Categoria Dinâmicos */}
            {categorias.length > 0 ? (
              categorias.map((categoria) => {
                const isActive = (categoriaFiltro === categoria.id.toString()) || 
                                (searchParams.get('categoria') === categoria.id.toString())
                const iconeCategoria = categoriasIcones[categoria.nome] || '📦'
                
                return (
                  <button 
                    key={categoria.id}
                    onClick={() => {
                      const novaCategoria = categoria.id.toString()
                      setCategoriaFiltro(novaCategoria)
                      const params = new URLSearchParams(searchParams)
                      params.set('categoria', novaCategoria)
                      if (busca.trim()) params.set('busca', busca.trim())
                      if (mostrarPromocoes) params.set('promocao', 'true')
                      setSearchParams(params)
                    }}
                    className={`group px-6 py-3 rounded-2xl font-bold transition-all shadow-lg whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#FFA500] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FFA500] text-white ring-4 ring-orange-200' 
                        : 'bg-white hover:bg-orange-50 text-gray-700 border-2 border-gray-200 hover:border-[#FFA500]'
                    }`}
                  >
                    <span className="text-lg">{iconeCategoria}</span>
                    <span>{categoria.nome}</span>
                  </button>
                )
              })
            ) : (
              <div className="w-full bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-md">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-yellow-800 mb-1">Nenhuma categoria encontrada</h3>
                    <p className="text-sm text-yellow-700">O sistema está configurado para mostrar apenas as categorias cadastradas no banco.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Indicator Moderno */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FFA500] border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse text-[#FFA500]" />
            Carregando promoções...
          </p>
        </div>
      )}

      {/* Grid de Produtos */}
      <section 
        className="bg-white rounded-3xl border border-gray-100 
                   shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 sm:p-6 md:p-8"
      >
        {!loading && produtos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
              <Tag className="w-12 h-12 text-[#FFA500]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhuma promoção encontrada</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchParams.get('categoria') || categoriaFiltro 
                ? 'Não há promoções nesta categoria no momento. Explore outras categorias!' 
                : 'Não há promoções disponíveis no momento. Volte em breve!'
              }
            </p>
            {(searchParams.get('categoria') || categoriaFiltro) && (
              <button
                onClick={() => {
                  setCategoriaFiltro('')
                  const params = new URLSearchParams()
                  if (busca.trim()) params.set('busca', busca.trim())
                  setSearchParams(params)
                }}
                className="mt-2 px-8 py-3 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FFA500] text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Ver todas as promoções
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
            {produtos.map((produto, index) => {
            const emPromocao = isProdutoEmPromocao(produto)
            const desconto = emPromocao ? calcularDesconto(produto.preco, produto.promocao.preco_promocional) : 0
            
            // Verifica se o produto corresponde à busca atual
            const termoBusca = searchParams.get('busca')?.toLowerCase() || ''
            const produtoCorrespondeBusca = termoBusca && (
              produto.nome.toLowerCase().includes(termoBusca) ||
              (produto.descricao || '').toLowerCase().includes(termoBusca)
            )
            
            return (
              <article
                key={produto.id}
                onClick={() => handleProdutoClick(produto.id)}
                onMouseEnter={() => setProdutoHover(produto.id)}
                onMouseLeave={() => setProdutoHover(null)}
                className={`group relative rounded-3xl border-2 bg-white p-4 cursor-pointer
                           shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300
                           hover:shadow-[0_12px_32px_rgba(249,160,27,0.2)] hover:-translate-y-2 hover:border-[#FFA500]
                           animate-fade-in ${
                             produtoCorrespondeBusca 
                               ? 'border-[#FFA500] ring-2 ring-[#FFA500]/20 bg-gradient-to-br from-orange-50/30 to-white' 
                               : 'border-gray-200'
                           }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Badge de Resultado da Busca */}
                {produtoCorrespondeBusca && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-[#FFA500] to-[#FF8C00] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-bounce-slow">
                      <Search className="w-3 h-3" />
                      <span>Encontrado</span>
                    </div>
                  </div>
                )}
                
                {/* Badge de Oferta com Animação */}
                {emPromocao && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                        <Tag className="w-3 h-3" />
                        <span>-{desconto}%</span>
                      </div>
                      <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50 animate-ping"></div>
                    </div>
                  </div>
                )}

                {/* Botão Favorito */}
                <button 
                  onClick={(e) => handleFavoritar(produto, e)}
                  className={`absolute top-3 right-3 z-10 transition-all duration-300 ${
                    isFavorite(produto.id) 
                      ? 'text-red-500 scale-110' 
                      : 'text-gray-300 hover:text-red-500 hover:scale-125'
                  }`}
                  title={isFavorite(produto.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Heart 
                    className={`w-6 h-6 transition-all ${
                      isFavorite(produto.id) ? 'fill-red-500' : ''
                    }`}
                  />
                </button>

                {/* Imagem do Produto com Hover Effect */}
                <div 
                  className="flex items-center justify-center py-6 bg-gradient-to-br from-gray-50 to-gray-100/50
                             rounded-2xl mb-4 group-hover:bg-gradient-to-br group-hover:from-orange-50 group-hover:to-orange-100/30 transition-all"
                >
                  <img 
                    src={produto.imagem || iconJarra} 
                    alt={produto.nome} 
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300" 
                  />
                </div>

                {/* Nome do Produto */}
                <h3 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-[#FFA500] transition-colors">
                  {produto.nome}
                </h3>

                {/* Preço antigo */}
                {emPromocao && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 line-through">
                      De: {formatarPreco(produto.preco)}
                    </span>
                  </div>
                )}

                {/* Preço atual + Botão Adicionar */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Por apenas</p>
                    <p className="text-green-600 font-black text-lg sm:text-xl">
                      {emPromocao 
                        ? formatarPreco(produto.promocao.preco_promocional) 
                        : formatarPreco(produto.preco)
                      }
                    </p>
                  </div>
                  <Button 
                    onClick={(e) => handleAdicionarCarrinho(produto, e)}
                    disabled={produtoAdicionando === produto.id}
                    className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full p-0 text-white font-bold 
                               bg-gradient-to-r from-[#FFA500] to-[#FF8C00] 
                               hover:from-[#FF8C00] hover:to-[#FFA500] 
                               shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95
                               flex items-center justify-center group/btn
                               ${produtoAdicionando === produto.id ? 'animate-pulse scale-95' : ''}`}
                    title="Adicionar ao carrinho"
                  >
                    {produtoAdicionando === produto.id ? (
                      <ShoppingBag className="w-5 h-5 animate-bounce" />
                    ) : (
                      <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                    )}
                  </Button>
                </div>

              {/* Tooltip ao Hover */}
              {produtoHover === produto.id && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-20 animate-fade-in">
                  Clique para ver detalhes
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </article>
          )
        })}
        </div>
      )}

        {/* Paginação Moderna com Setas */}
        {!loading && produtos.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button className="group w-10 h-10 rounded-full bg-white border-2 border-gray-200 hover:border-[#FFA500] flex items-center justify-center transition-all hover:scale-110 shadow-md hover:shadow-lg">
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-[#FFA500] transition-colors" />
            </button>
            
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFA500] to-[#FF8C00] text-white font-bold shadow-lg transition-all hover:scale-110">
                1
              </button>
              <button className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 hover:border-[#FFA500] text-gray-600 hover:text-[#FFA500] font-semibold transition-all hover:scale-110">
                2
              </button>
              <button className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 hover:border-[#FFA500] text-gray-600 hover:text-[#FFA500] font-semibold transition-all hover:scale-110">
                3
              </button>
            </div>
            
            <button className="group w-10 h-10 rounded-full bg-white border-2 border-gray-200 hover:border-[#FFA500] flex items-center justify-center transition-all hover:scale-110 shadow-md hover:shadow-lg">
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#FFA500] transition-colors" />
            </button>
          </div>
        )}

      </section>
    </SidebarLayout>
  )
}

export default Promocoes
