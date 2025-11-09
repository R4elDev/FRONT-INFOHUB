import { Button } from "../../components/ui/button"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Heart, Plus, Minus, Package, Store, Tag, TrendingDown, ShoppingCart, Star, Sparkles, Check, Truck } from "lucide-react"
import { useState, useEffect } from "react"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { listarProdutos, formatarPreco, calcularDesconto, isProdutoEmPromocao } from "../../services/apiServicesFixed"
import { useFavoritos } from "../../contexts/FavoritosContext"
import { useCarrinho } from "../../contexts/CarrinhoContext"
import type { Product } from "../../types"
import iconJarra from "../../assets/icon de jara.png"

// Animações CSS customizadas
const styles = document.createElement('style')
styles.textContent = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }
  
  @keyframes pulse-badge {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .animate-pulse-badge {
    animation: pulse-badge 2s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite linear;
    background: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
    background-size: 1000px 100%;
  }
`
if (!document.head.querySelector('style[data-detalhes-produto-animations]')) {
  styles.setAttribute('data-detalhes-produto-animations', 'true')
  document.head.appendChild(styles)
}

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

function DetalhesProduto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quantidade, setQuantidade] = useState(1)
  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [produtosRelacionados, setProdutosRelacionados] = useState<Produto[]>([])
  
  // Contextos de favoritos e carrinho
  const { addFavorite, removeFavorite, isFavorite } = useFavoritos()
  const { addToCart } = useCarrinho()

  // Carrega o produto específico
  useEffect(() => {
    const carregarProduto = async () => {
      if (!id) return
      
      try {
        console.log('🔍 Carregando produto com ID:', id)
        setLoading(true)
        
        // Busca todos os produtos e filtra pelo ID
        const response = await listarProdutos()
        console.log('📦 Resposta da API:', response)
        
        if (response.status && response.data) {
          const produtoEncontrado = response.data.find(p => p.id.toString() === id)
          console.log('🎯 Produto encontrado:', produtoEncontrado)
          
          if (produtoEncontrado) {
            setProduto(produtoEncontrado)
            
            // Carrega produtos relacionados (mesma categoria)
            const relacionados = response.data
              .filter(p => p.id.toString() !== id && p.categoria.id === produtoEncontrado.categoria.id)
              .slice(0, 4)
            setProdutosRelacionados(relacionados)
          } else {
            console.log('❌ Produto não encontrado')
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar produto:', error)
      } finally {
        setLoading(false)
      }
    }
    
    carregarProduto()
  }, [id])

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F9A01B]"></div>
        </div>
      </SidebarLayout>
    )
  }

  if (!produto) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Package className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Produto não encontrado</h2>
          <p className="text-gray-500 mb-4">O produto que você está procurando não existe.</p>
          <Button onClick={() => navigate('/promocoes')} className="bg-[#F9A01B] hover:bg-[#FF8C00]">
            Voltar às Promoções
          </Button>
        </div>
      </SidebarLayout>
    )
  }

  const emPromocao = isProdutoEmPromocao(produto)
  const desconto = emPromocao ? calcularDesconto(produto.preco, produto.promocao!.preco_promocional) : 0
  const precoFinal = emPromocao ? produto.promocao!.preco_promocional : produto.preco

  const handleVoltar = () => {
    navigate(-1)
  }

  // Converter produto da API para o tipo Product
  const converterParaProduct = (produto: Produto): Product => {
    const emPromocao = isProdutoEmPromocao(produto)
    return {
      id: produto.id,
      nome: produto.nome,
      preco: emPromocao ? produto.promocao!.preco_promocional : produto.preco,
      precoAntigo: emPromocao ? produto.preco : undefined,
      imagem: iconJarra,
      categoria: produto.categoria?.nome,
      descricao: produto.descricao
    }
  }

  const handleFavoritar = async () => {
    if (!produto) return
    
    const produtoConvertido = converterParaProduct(produto)
    
    if (isFavorite(produto.id)) {
      await removeFavorite(produto.id)
    } else {
      await addFavorite(produtoConvertido)
    }
  }

  const handleAdicionarCarrinho = async () => {
    if (!produto) return
    
    const produtoConvertido = converterParaProduct(produto)
    await addToCart(produtoConvertido, quantidade)
    
    console.log(`✅ Adicionado ${quantidade} unidade(s) ao carrinho`)
    // Navega para o carrinho
    navigate('/carrinho')
  }

  const incrementarQuantidade = () => {
    setQuantidade(prev => prev + 1)
  }

  const decrementarQuantidade = () => {
    if (quantidade > 1) {
      setQuantidade(prev => prev - 1)
    }
  }

  return (
    <SidebarLayout>
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4">
        {/* Header Premium */}
        <section className="mt-8 mb-8 animate-fade-in">
          <button 
            onClick={handleVoltar}
            className="flex items-center gap-2 text-[#FFA726] hover:text-[#FF8C00] 
                       font-bold transition-all group mb-6 hover:scale-105"
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-lg">Voltar</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFA726] to-[#FF8C00] flex items-center justify-center shadow-xl">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
                Detalhes do Produto
              </h1>
              <p className="text-base text-gray-600 mt-1">
                Informações completas e compra rápida
              </p>
            </div>
          </div>
        </section>

        {/* Container Principal */}
        <section 
          className="bg-white rounded-3xl border-2 border-gray-200 
                     shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 sm:p-6 md:p-10 
                     overflow-hidden animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Imagem */}
          <div className="flex flex-col">
            {/* Badge de Oferta e Favorito */}
            <div className="flex items-start justify-between mb-4">
              {emPromocao && (
                <span 
                  className="bg-gradient-to-r from-red-500 to-red-600 
                             text-white text-sm font-bold px-5 py-2.5 
                             rounded-2xl shadow-lg flex items-center gap-2 animate-pulse-badge"
                >
                  <TrendingDown className="w-5 h-5" />
                  PROMOÇÃO -{desconto}% OFF
                </span>
              )}
              <button 
                onClick={handleFavoritar}
                className={`p-3 rounded-full transition-all hover:scale-110 ${
                  isFavorite(produto.id) 
                    ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg' 
                    : 'bg-white border-2 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300'
                }`}
              >
                <Heart className={`w-7 h-7 ${isFavorite(produto.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Imagem do Produto */}
            <div 
              className="flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 
                         rounded-3xl p-8 sm:p-12 mb-6 shadow-[inset_0_2px_12px_rgba(0,0,0,0.1)] border-2 border-orange-100 relative overflow-hidden"
            >
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
              <Package className="w-48 h-48 sm:w-64 sm:h-64 text-orange-300 relative z-10" />
              {emPromocao && (
                <Sparkles className="absolute top-4 right-4 w-8 h-8 text-yellow-400 animate-pulse" />
              )}
            </div>

            {/* Informações do Estabelecimento */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border-2 border-blue-200 hover:scale-105 transition-transform shadow-md">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Estabelecimento</p>
                  <p className="text-base text-gray-800 font-bold">{produto.estabelecimento.nome}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-2xl border-2 border-orange-200 hover:scale-105 transition-transform shadow-md">
                <div className="w-12 h-12 rounded-xl bg-[#FFA726] flex items-center justify-center flex-shrink-0">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Categoria</p>
                  <p className="text-base text-gray-800 font-bold">{produto.categoria.nome}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border-2 border-green-200 hover:scale-105 transition-transform shadow-md">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wide">Entrega</p>
                  <p className="text-base text-gray-800 font-bold">Rápida e Segura</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Informações */}
          <div className="flex flex-col">
            {/* Nome do Produto */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-2 font-semibold">(5.0)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-800 mb-2 leading-tight">
                {produto.nome}
              </h1>
            </div>

            {/* Preços */}
            <div className="mb-6">
              {emPromocao ? (
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <span 
                      className="bg-gradient-to-r from-red-100 to-red-50 
                                 text-red-700 font-bold px-3 py-1.5 rounded-lg text-sm"
                    >
                      -{desconto}%
                    </span>
                    <span className="text-gray-400 line-through text-lg">
                      {formatarPreco(produto.preco)}
                    </span>
                  </div>
                  <p className="text-4xl sm:text-5xl font-bold text-green-600">
                    {formatarPreco(produto.promocao!.preco_promocional)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Economia de {formatarPreco(produto.preco - produto.promocao!.preco_promocional)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Promoção válida até: {new Date(produto.promocao!.data_fim).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-4xl sm:text-5xl font-bold text-gray-800">
                    {formatarPreco(produto.preco)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Preço regular
                  </p>
                </div>
              )}
            </div>

            {/* Descrição */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Descrição</h2>
              <p className="text-gray-600 leading-relaxed">
                {produto.descricao}
              </p>
            </div>

            {/* Seletor de Quantidade */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Quantidade</h2>
              <div className="flex items-center gap-4">
                <Button
                  onClick={decrementarQuantidade}
                  disabled={quantidade <= 1}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 
                             text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-md hover:shadow-lg transition-all"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">
                  {quantidade}
                </span>
                <Button
                  onClick={incrementarQuantidade}
                  className="w-12 h-12 rounded-full bg-[#F9A01B] hover:bg-[#FF8C00] 
                             text-white shadow-md hover:shadow-lg transition-all hover:scale-110"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Botão Adicionar ao Carrinho */}
            <Button
              onClick={handleAdicionarCarrinho}
              className="w-full h-16 sm:h-20 bg-gradient-to-r from-[#25992E] to-[#1f7a24] 
                         hover:from-[#1f7a24] hover:to-[#25992E] text-white text-xl font-black 
                         rounded-2xl shadow-xl hover:shadow-2xl transition-all 
                         hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <ShoppingCart className="w-7 h-7" />
              Adicionar - {formatarPreco(precoFinal * quantidade)}
            </Button>
            
            {/* Badge de garantia */}
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="text-sm font-bold">Compra 100% Segura e Garantida</span>
            </div>

            {/* Informações Adicionais */}
            <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200">
              <h3 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#FFA726]" />
                Informações do Produto
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl">
                  <p className="text-xs text-gray-500 font-semibold">Categoria</p>
                  <p className="text-sm text-gray-800 font-bold">{produto.categoria.nome}</p>
                </div>
                <div className="bg-white p-3 rounded-xl">
                  <p className="text-xs text-gray-500 font-semibold">Loja</p>
                  <p className="text-sm text-gray-800 font-bold">{produto.estabelecimento.nome}</p>
                </div>
                <div className="bg-white p-3 rounded-xl">
                  <p className="text-xs text-gray-500 font-semibold">Cadastrado</p>
                  <p className="text-sm text-gray-800 font-bold">{new Date(produto.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="bg-white p-3 rounded-xl">
                  <p className="text-xs text-gray-500 font-semibold">Código</p>
                  <p className="text-sm text-gray-800 font-bold">#{produto.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Produtos Relacionados */}
        {produtosRelacionados.length > 0 && (
          <section className="mt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-7 h-7 text-[#FFA726]" />
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
                Produtos Relacionados - {produto.categoria.nome}
              </h2>
            </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {produtosRelacionados.map((produtoRelacionado) => {
              const emPromocaoRelacionado = isProdutoEmPromocao(produtoRelacionado)
              
              return (
                <article
                  key={produtoRelacionado.id}
                  onClick={() => navigate(`/produto/${produtoRelacionado.id}`)}
                  className="rounded-2xl border border-gray-200 bg-white p-4 cursor-pointer
                             shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all 
                             hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1"
                >
                  {emPromocaoRelacionado && (
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg mb-2 text-center">
                      PROMOÇÃO
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center py-4 bg-gray-50 rounded-xl mb-3">
                    <Package className="w-20 h-20 text-gray-300" />
                  </div>
                  
                  <div className="space-y-1">
                    {emPromocaoRelacionado ? (
                      <div>
                        <p className="text-green-700 font-bold text-lg">
                          {formatarPreco(produtoRelacionado.promocao!.preco_promocional)}
                        </p>
                        <p className="text-xs text-gray-400 line-through">
                          {formatarPreco(produtoRelacionado.preco)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-700 font-bold text-lg">
                        {formatarPreco(produtoRelacionado.preco)}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {produtoRelacionado.nome}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      {produtoRelacionado.estabelecimento.nome}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
          </section>
        )}
      </div>
    </SidebarLayout>
  )
}

export default DetalhesProduto
