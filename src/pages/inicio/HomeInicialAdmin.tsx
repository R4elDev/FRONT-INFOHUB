import { useState, useEffect, useCallback } from 'react'
import { Input as CampoTexto } from "../../components/ui/input"
import { useNavigate } from "react-router-dom"
import { Search, Plus, ChevronLeft, ChevronRight, Tag, Sparkles, Settings, Edit, BarChart3 } from 'lucide-react'
import iconJarra from "../../assets/icon de jara.png"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { listarProdutos, formatarPreco, calcularDesconto, isProdutoEmPromocao } from "../../services/apiServicesFixed"

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
`
if (!document.head.querySelector('style[data-home-admin-animations]')) {
  styles.setAttribute('data-home-admin-animations', 'true')
  document.head.appendChild(styles)
}

// Imagens do carrossel de promoções (mesmas da HomeInicial)
const promocoesCarrossel = [
  {
    id: 1,
    titulo: 'Promoção Tenda Atacado - Ofertas Especiais',
    imagem: 'https://cdn2.newtail.com.br/retail_media/ads/2025/11/05/4958717408875ad204e81c9a4c727d4a.jpeg',
    descricao: 'Aproveite as melhores ofertas em produtos selecionados'
  },
  {
    id: 2,
    titulo: 'Promoção Tenda Atacado - Bebidas Geladas',
    imagem: 'https://cdn2.newtail.com.br/retail_media/ads/2025/11/06/a647bf102e88be794547e10242cd240c.jpeg',
    descricao: 'Descontos imperdíveis em bebidas'
  },
  {
    id: 3,
    titulo: 'Promoção Tenda Atacado - Alimentos',
    imagem: 'https://cdn2.newtail.com.br/retail_media/ads/2025/11/04/281745a556d26b864f7dcc41d1ea1c6a.jpeg',
    descricao: 'Economize em sua compra mensal'
  },
  {
    id: 4,
    titulo: 'Promoção Tenda Atacado - Limpeza com até 60% OFF',
    imagem: 'https://d3gdr9n5lqb5z7.cloudfront.net/fotos/omo-comfort-e-cif-com-ate-60-de-desconto-na-2%E2%94%AC%C2%AC-unidade_1178x406-home-05-11-2025-15-33-32-522.jpg',
    descricao: 'Omo, Comfort e Cif com descontos incríveis'
  },
  {
    id: 5,
    titulo: 'Promoção Tenda Atacado - Ofertas da Semana',
    imagem: 'https://d3gdr9n5lqb5z7.cloudfront.net/fotos/arte1_1178x406-home-06-11-2025-10-18-46-350.jpg',
    descricao: 'Confira as ofertas válidas até domingo'
  },
  {
    id: 6,
    titulo: 'Extra Mercado - Promoção de Carnes',
    imagem: 'https://static.clubeextra.com.br/static/ex/1762439666056-desk-desk-carne.png?im=Resize,width=1600',
    descricao: 'Carnes nobres com preços especiais'
  },
  {
    id: 7,
    titulo: 'Extra Mercado - Cervejas em Oferta',
    imagem: 'https://static.clubeextra.com.br/static/ex/1762440605486-desk-desk-cervejas.png?im=Resize,width=1600',
    descricao: 'As melhores marcas com descontos'
  },
  {
    id: 8,
    titulo: 'Extra Mercado - Hortifruti Fresquinho',
    imagem: 'https://static.clubeextra.com.br/static/ex/1762367405844-desk-kjh.jpg?im=Resize,width=1600',
    descricao: 'Frutas e verduras fresquinhas todos os dias'
  },
  {
    id: 9,
    titulo: 'Extra Mercado - Higiene e Papel',
    imagem: 'https://static.clubeextra.com.br/static/ex/1762342467276-desk-desk-papel.jpg?im=Resize,width=1600',
    descricao: 'Produtos de higiene e papel com preços baixos'
  },
  {
    id: 10,
    titulo: 'Extra Mercado - Aves Frescas',
    imagem: 'https://static.clubeextra.com.br/static/ex/1762440206680-desk-desk-aves.png?im=Resize,width=1600',
    descricao: 'Frango e aves com qualidade garantida'
  }
]

function HomeInicialAdmin() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState<Array<any>>([]) 
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [carrosselAtivo, setCarrosselAtivo] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [produtoHover, setProdutoHover] = useState<number | null>(null)

  // Carrega produtos ao montar o componente
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)
        
        // Carrega todos os produtos para admin
        const produtosResponse = await listarProdutos()
        if (produtosResponse.status && produtosResponse.data) {
          setProdutos(produtosResponse.data.slice(0, 4)) // Apenas os primeiros 4
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }
    
    carregarDados()
  }, [])

  const handleProdutoClick = (produtoId: number) => {
    navigate(`/produto/${produtoId}`)
  }

  const handleBusca = () => {
    if (busca.trim()) {
      navigate(`/promocoes?busca=${encodeURIComponent(busca.trim())}`)
    }
  }

  // Navegação do carrossel
  const proximoSlide = useCallback(() => {
    setCarrosselAtivo((prev) => (prev + 1) % promocoesCarrossel.length)
  }, [])

  const slideAnterior = () => {
    setCarrosselAtivo((prev) => (prev - 1 + promocoesCarrossel.length) % promocoesCarrossel.length)
  }

  const irParaSlide = (index: number) => {
    setCarrosselAtivo(index)
  }

  // Auto-play do carrossel (4 segundos)
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(proximoSlide, 4000)
      return () => clearInterval(interval)
    }
  }, [isPaused, proximoSlide])

  return (
    <SidebarLayout>
      {/* Carrossel de Promoções Premium - Admin View */}
      <section className="mt-8">
        <div 
          className="relative w-full h-80 sm:h-96 md:h-[450px] lg:h-[500px] xl:h-[550px] rounded-3xl shadow-2xl overflow-hidden group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slides do Carrossel */}
          <div className="relative w-full h-full bg-gray-100">
            {promocoesCarrossel.map((promo, index) => (
              <div
                key={promo.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === carrosselAtivo 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-105 pointer-events-none'
                }`}
              >
                <img
                  src={promo.imagem}
                  alt={promo.titulo}
                  className="w-full h-full object-contain md:object-cover"
                  loading="lazy"
                />
                
                {/* Overlay com gradiente para melhor legibilidade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Botão Admin - Gerenciar Promoção */}
                <div className="absolute top-6 right-6 z-20">
                  <button 
                    onClick={() => navigate('/cadastro-promocao')}
                    className="group/btn px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold shadow-xl transition-all hover:scale-105 flex items-center gap-2 backdrop-blur-sm"
                  >
                    <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                    Nova Promoção
                  </button>
                </div>

                {/* Badge Admin */}
                <div className="absolute top-6 left-6 z-20">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full shadow-lg backdrop-blur-sm">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Painel Admin</span>
                  </div>
                </div>
                
                {/* Informações da promoção */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-6 h-6" />
                    <span className="text-base font-bold uppercase tracking-wider">Promoção</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 drop-shadow-2xl leading-tight">
                    {promo.titulo}
                  </h2>
                  <p className="text-base md:text-lg lg:text-xl text-white/95 drop-shadow-lg font-medium max-w-3xl">
                    {promo.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Setas de Navegação */}
          <button
            onClick={slideAnterior}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10 backdrop-blur-sm"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-7 h-7 text-gray-800" />
          </button>
          
          <button
            onClick={proximoSlide}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10 backdrop-blur-sm"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-7 h-7 text-gray-800" />
          </button>
        </div>

        {/* Indicadores do Carrossel */}
        <div className="flex items-center justify-center gap-2.5 mt-6">
          {promocoesCarrossel.map((_, index) => (
            <button
              key={index}
              onClick={() => irParaSlide(index)}
              className={`transition-all rounded-full shadow-sm hover:scale-110 ${
                index === carrosselAtivo
                  ? 'w-10 h-3.5 bg-[#FFA726]'
                  : 'w-3.5 h-3.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Barra de Pesquisa Modernizada */}
      <section className="mt-10">
        <div 
          className="relative w-full bg-white rounded-3xl border-2 border-gray-100 
                     shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all 
                     hover:shadow-[0_8px_32px_rgba(249,160,27,0.15)] hover:border-[#FFA726]/30"
        >
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <CampoTexto
            placeholder="Buscar produtos, empresas, usuários..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBusca()}
            className="h-16 pl-16 pr-16 rounded-3xl border-0 text-gray-700 text-base 
                       focus-visible:ring-2 focus-visible:ring-[#FFA726] 
                       placeholder:text-gray-400 font-medium"
          />
          <button 
            onClick={handleBusca}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-[#FFA726] to-[#FF8C00] flex items-center justify-center shadow-lg transition-all hover:scale-110 group"
            title="Pesquisar"
          >
            <Search className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </section>

      {/* Products Section - Admin Premium View */}
      <section 
        className="mt-12 bg-white rounded-3xl border border-gray-100 
                   shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="text-2xl md:text-3xl font-bold text-gray-800 
                       flex items-center gap-2"
          >
            <BarChart3 className="w-7 h-7 text-[#FFA726]" />
            Produtos em Destaque
          </h2>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/cadastro-promocao')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
            <button 
              onClick={() => navigate('/promocoes')}
              className="text-sm md:text-base font-semibold text-[#F9A01B] 
                         hover:text-[#FF8C00] transition-colors flex items-center gap-1"
            >
              Ver Todos <span className="text-lg">→</span>
            </button>
          </div>
        </div>

        {/* Cards de Produtos Modernizados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {loading ? (
            // Loading skeleton premium
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-3xl border-2 border-gray-200 bg-white p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-28 bg-gray-200 rounded-2xl mb-3"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : produtos.length === 0 ? (
            // Sem produtos - Estado vazio premium
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhum produto cadastrado</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Comece adicionando produtos ao sistema para gerenciar seu catálogo!</p>
              <button
                onClick={() => navigate('/cadastro-promocao')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Adicionar Produto
              </button>
            </div>
          ) : (
            // Produtos reais da API com design premium
            produtos.map((produto) => {
              const emPromocao = isProdutoEmPromocao(produto)
              const desconto = emPromocao ? calcularDesconto(produto.preco, produto.promocao!.preco_promocional) : 0
              
              return (
                <article
                  key={produto.id}
                  onClick={() => handleProdutoClick(produto.id)}
                  onMouseEnter={() => setProdutoHover(produto.id)}
                  onMouseLeave={() => setProdutoHover(null)}
                  className="group relative rounded-3xl border-2 border-gray-200 bg-white p-4 cursor-pointer
                             shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300
                             hover:shadow-[0_12px_32px_rgba(66,133,244,0.2)] hover:-translate-y-2 hover:border-blue-500"
                >
                  {/* Badge de Desconto Animado */}
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

                  {/* Badge Admin - Canto Superior Direito */}
                  <div className="absolute top-3 right-3 z-10 flex gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('/cadastro-promocao')
                      }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center justify-center shadow-lg transition-all hover:scale-110 group/btn"
                      title="Editar produto"
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Settings', produto.id)
                      }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 flex items-center justify-center shadow-lg transition-all hover:scale-110 group/btn"
                      title="Configurações"
                    >
                      <Settings className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Imagem do Produto com Hover Effect */}
                  <div 
                    className="flex items-center justify-center py-6 bg-gradient-to-br from-gray-50 to-gray-100/50
                               rounded-2xl mb-4 group-hover:from-blue-50 group-hover:to-blue-100/50 transition-all duration-300"
                  >
                    <img 
                      src={produto.imagem || iconJarra} 
                      alt={produto.nome} 
                      className="w-28 h-28 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300" 
                    />
                  </div>

                  {/* Nome do Produto */}
                  <h3 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
                    {produto.nome}
                  </h3>

                  {/* Preço antigo se em promoção */}
                  {emPromocao && (
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-400 line-through">
                        De: {formatarPreco(produto.preco)}
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-100 to-emerald-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      ATIVO
                    </span>
                  </div>

                  {/* Seção de Preço e Ações Admin */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Preço atual</p>
                      <p className="text-green-700 font-black text-xl leading-none">
                        {emPromocao ? formatarPreco(produto.promocao!.preco_promocional) : formatarPreco(produto.preco)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Ver estatísticas', produto.id)
                        }}
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFA726] to-[#FF8C00] 
                                   flex items-center justify-center shadow-lg transition-all 
                                   hover:scale-110 active:scale-95"
                        title="Ver estatísticas"
                      >
                        <BarChart3 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Info adicional */}
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                    <p className="text-xs text-gray-500">
                      ID: <span className="font-bold text-gray-700">#{produto.id}</span>
                    </p>
                    {produto.categoria && (
                      <p className="text-xs text-gray-500">
                        Categoria: <span className="font-semibold text-gray-700">{produto.categoria.nome}</span>
                      </p>
                    )}
                    {produto.estabelecimento && (
                      <p className="text-xs text-blue-600 font-semibold">
                        {produto.estabelecimento.nome}
                      </p>
                    )}
                  </div>

                  {/* Tooltip no Hover */}
                  {produtoHover === produto.id && (
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-20">
                      Clique para ver detalhes
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </article>
              )
            })
          )}
        </div>
      </section>
    </SidebarLayout>
  )
}

export default HomeInicialAdmin
