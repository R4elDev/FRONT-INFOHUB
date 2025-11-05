import { Button } from "../../components/ui/button"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Heart, Plus, Minus, Package, Store, Tag, TrendingDown } from "lucide-react"
import { useState, useEffect } from "react"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { listarProdutos, formatarPreco, calcularDesconto, isProdutoEmPromocao } from "../../services/apiServicesFixed"

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
  const [favorito, setFavorito] = useState(false)
  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [produtosRelacionados, setProdutosRelacionados] = useState<Produto[]>([])

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

  const handleAdicionarCarrinho = () => {
    console.log(`Adicionado ${quantidade} unidade(s) ao carrinho`)
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
      {/* Header com botão voltar */}
      <section className="mt-8 mb-6">
        <button 
          onClick={handleVoltar}
          className="flex items-center gap-2 text-[#F9A01B] hover:text-[#FF8C00] 
                     font-semibold transition-colors group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg">Voltar</span>
        </button>
      </section>

      {/* Container Principal */}
      <section 
        className="bg-white rounded-3xl border border-gray-100 
                   shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 sm:p-6 md:p-8 
                   overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Imagem */}
          <div className="flex flex-col">
            {/* Badge de Oferta e Favorito */}
            <div className="flex items-start justify-between mb-4">
              {emPromocao && (
                <span 
                  className="bg-gradient-to-r from-red-500 to-red-600 
                             text-white text-sm font-semibold px-4 py-2 
                             rounded-lg shadow-md flex items-center gap-2"
                >
                  <TrendingDown className="w-4 h-4" />
                  PROMOÇÃO {desconto}% OFF
                </span>
              )}
              <button 
                onClick={() => setFavorito(!favorito)}
                className={`p-2 rounded-full transition-all ${
                  favorito 
                    ? 'bg-red-50 text-red-500' 
                    : 'bg-gray-100 text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${favorito ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Imagem do Produto */}
            <div 
              className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 
                         rounded-2xl p-8 sm:p-12 mb-6 shadow-inner"
            >
              <Package className="w-48 h-48 sm:w-64 sm:h-64 text-gray-300" />
            </div>

            {/* Informações do Estabelecimento */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <Store className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Estabelecimento</p>
                  <p className="text-sm text-gray-700 font-semibold">{produto.estabelecimento.nome}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-orange-50 p-4 rounded-xl border border-orange-100">
                <Tag className="w-5 h-5 text-[#F9A01B]" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Categoria</p>
                  <p className="text-sm text-gray-700 font-semibold">{produto.categoria.nome}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Informações */}
          <div className="flex flex-col">
            {/* Nome do Produto */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {produto.nome}
            </h1>

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
              className="w-full h-14 sm:h-16 bg-gradient-to-r from-[#25992E] to-[#1f7a24] 
                         hover:from-[#1f7a24] hover:to-[#25992E] text-white text-lg font-bold 
                         rounded-2xl shadow-lg hover:shadow-xl transition-all 
                         hover:scale-105 active:scale-95"
            >
              Adicionar ao Carrinho - {formatarPreco(precoFinal * quantidade)}
            </Button>

            {/* Informações Adicionais */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Informações do Produto</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Categoria: {produto.categoria.nome}</li>
                <li>• Estabelecimento: {produto.estabelecimento.nome}</li>
                <li>• Cadastrado em: {new Date(produto.created_at).toLocaleDateString('pt-BR')}</li>
                <li>• ID do produto: #{produto.id}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Produtos Relacionados */}
      {produtosRelacionados.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            Produtos Relacionados - {produto.categoria.nome}
          </h2>
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
    </SidebarLayout>
  )
}

export default DetalhesProduto
