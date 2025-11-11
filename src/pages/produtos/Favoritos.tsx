import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Button as Botao } from "../../components/ui/button"
import { useFavoritos } from "../../contexts/FavoritosContext"
import { useCarrinho } from "../../contexts/CarrinhoContext"
import { Heart, Plus, Trash2, ShoppingBag, Tag, TrendingUp, Star } from 'lucide-react'
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
  
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }
`
if (!document.head.querySelector('style[data-favoritos-animations]')) {
  styles.setAttribute('data-favoritos-animations', 'true')
  document.head.appendChild(styles)
}

export default function Favoritos() {
  const navigate = useNavigate()
  const { favoritos, removeFavorite, clearFavorites, loading, count } = useFavoritos()
  const { addToCart } = useCarrinho()

  // Função helper para formatar preços de forma segura
  const formatarPreco = (preco: any): string => {
    const precoNum = Number(preco)
    if (isNaN(precoNum)) return '0.00'
    return precoNum.toFixed(2)
  }

  // Função helper para calcular desconto
  const calcularDesconto = (precoAntigo: any, precoAtual: any): number => {
    const antigoNum = Number(precoAntigo)
    const atualNum = Number(precoAtual)
    if (isNaN(antigoNum) || isNaN(atualNum) || antigoNum === 0) return 0
    return Math.round(((antigoNum - atualNum) / antigoNum) * 100)
  }

  const removerFavorito = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    await removeFavorite(id)
  }

  const handleAdicionarCarrinho = async (produto: any, e: React.MouseEvent) => {
    e.stopPropagation()
    await addToCart(produto, 1)
    navigate('/carrinho')
  }

  const handleLimparTodos = async () => {
    if (confirm('Deseja remover todos os favoritos?')) {
      await clearFavorites()
    }
  }

  const handleProdutoClick = (produtoId: number) => {
    navigate(`/produto/${produtoId}`)
  }

  return (
    <SidebarLayout>
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4">
        {/* Header Premium com Animação */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-xl animate-bounce-slow">
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
                Meus Favoritos
              </h1>
              <p className="text-base text-gray-600 mt-1 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {loading ? 'Carregando...' : `${count} ${count === 1 ? 'produto salvo' : 'produtos salvos'}`}
              </p>
            </div>
          </div>
          
          {/* Botão Limpar Todos */}
          {!loading && favoritos.length > 0 && (
            <Botao
              onClick={handleLimparTodos}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2 font-bold"
            >
              <Trash2 className="w-5 h-5" />
              <span className="hidden sm:inline">Limpar Todos</span>
              <span className="sm:hidden">Limpar</span>
            </Botao>
          )}
        </div>

        {/* Estatísticas Rápidas */}
        {!loading && favoritos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 border-2 border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-red-600">{count}</p>
                  <p className="text-xs text-gray-600 font-medium">Favoritos</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 border-2 border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-orange-600">
                    {favoritos.filter(p => p.precoAntigo && Number(p.precoAntigo) > 0).length}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">Em Oferta</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-green-600">
                    {favoritos.filter(p => p.precoAntigo && Number(p.precoAntigo) > 0).length > 0 
                      ? Math.round(favoritos.reduce((acc, p) => {
                          if (p.precoAntigo && Number(p.precoAntigo) > 0) {
                            return acc + calcularDesconto(p.precoAntigo, p.preco)
                          }
                          return acc
                        }, 0) / favoritos.filter(p => p.precoAntigo && Number(p.precoAntigo) > 0).length)
                      : 0
                    }%
                  </p>
                  <p className="text-xs text-gray-600 font-medium">Desconto Médio</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-blue-600">
                    R$ {favoritos.reduce((acc, p) => acc + Number(p.preco || 0), 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">Valor Total</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-3xl border-2 border-gray-200 bg-white p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-28 bg-gray-200 rounded-2xl mb-3"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : favoritos.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-40 h-40 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-100 via-pink-100 to-red-50 flex items-center justify-center shadow-xl animate-bounce-slow">
              <Heart className="w-20 h-20 text-red-400" />
            </div>
            <h2 className="text-4xl font-black text-gray-800 mb-4">
              Sua lista está vazia
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
              Comece a adicionar produtos aos favoritos para criar sua lista de desejos e não perder as melhores ofertas!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Botao
                onClick={() => navigate('/promocoes')}
                className="bg-gradient-to-r from-[#FFA726] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FFA726] text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-3 font-bold text-lg"
              >
                <ShoppingBag className="w-6 h-6" />
                Explorar Produtos
              </Botao>
              <Botao
                onClick={() => navigate('/HomeInicial')}
                className="bg-white border-2 border-gray-200 hover:border-[#FFA726] text-gray-700 hover:text-[#FFA726] px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3 font-bold text-lg"
              >
                <TrendingUp className="w-6 h-6" />
                Ver Destaques
              </Botao>
            </div>
          </div>
        ) : (
          <>
            {/* Grid de Produtos - Idêntico à Tela Promoções */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {favoritos.map((produto, index) => {
              const temDesconto = produto.precoAntigo && Number(produto.precoAntigo) > 0
              const desconto = temDesconto ? calcularDesconto(produto.precoAntigo, produto.preco) : 0
              
              return (
                <article
                  key={produto.id}
                  onClick={() => handleProdutoClick(produto.id)}
                  className="group relative rounded-3xl border-2 border-gray-200 bg-white p-4 cursor-pointer
                             shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300
                             hover:shadow-[0_12px_32px_rgba(249,160,27,0.2)] hover:-translate-y-2 hover:border-[#FFA500]
                             animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Badge de Oferta com Animação */}
                  {temDesconto && (
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
                    onClick={(e) => removerFavorito(produto.id, e)}
                    className="absolute top-3 right-3 z-10 transition-all duration-300 text-red-500 scale-110"
                    title="Remover dos favoritos"
                  >
                    <Heart className="w-6 h-6 transition-all fill-red-500" />
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
                  {temDesconto && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 line-through">
                        De: R$ {formatarPreco(produto.precoAntigo)}
                      </span>
                    </div>
                  )}

                  {/* Preço atual + Botão Adicionar */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Por apenas</p>
                      <p className="text-green-600 font-black text-lg sm:text-xl">
                        R$ {formatarPreco(produto.preco)}
                      </p>
                    </div>
                    <Botao 
                      onClick={(e) => handleAdicionarCarrinho(produto, e)}
                      className="h-10 w-10 sm:h-11 sm:w-11 rounded-full p-0 text-white font-bold 
                                 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] 
                                 hover:from-[#FF8C00] hover:to-[#FFA500] 
                                 shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95
                                 flex items-center justify-center group/btn"
                      title="Adicionar ao carrinho"
                    >
                      <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                    </Botao>
                  </div>
                </article>
              )
            })}
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  )
}
