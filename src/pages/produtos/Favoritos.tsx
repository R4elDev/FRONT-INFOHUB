import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Button as Botao } from "../../components/ui/button"
import { useFavoritos } from "../../contexts/FavoritosContext"
import { useCarrinho } from "../../contexts/CarrinhoContext"
import iconJarra from "../../assets/icon de jara.png"


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
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fadeInDown">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
           Meus Favoritos
        </h2>
        <span className="text-sm text-gray-600">
          {loading ? 'Carregando...' : `${count} ${count === 1 ? 'produto' : 'produtos'}`}
        </span>
      </div>

      {/* Tela Vazia */}
      {loading ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Carregando favoritos...</p>
        </div>
      ) : favoritos.length === 0 ? (
        <div className="text-center py-20 animate-fadeInUp">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Nenhum favorito ainda
          </h2>
          <p className="text-gray-500 mb-6">
            Adicione produtos aos favoritos para vê-los aqui
          </p>
          <Botao
            onClick={() => navigate('/HomeInicial')}
            className="bg-[#F9A01B] hover:bg-[#e89015] text-white px-8 py-3 rounded-full"
          >
            Explorar Produtos
          </Botao>
        </div>
      ) : (
        <>
          {/* Grid de Produtos - Mesmo estilo da HomeInicial */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {favoritos.map((produto, index) => (
              <article
                key={produto.id}
                onClick={() => handleProdutoClick(produto.id)}
                className="rounded-2xl border border-gray-200 bg-white p-4 cursor-pointer
                           shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all 
                           hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Oferta + Favorito */}
                <div className="flex items-start justify-between mb-2">
                  <span 
                    className="bg-gradient-to-r from-green-600 to-green-500 
                               text-white text-[10px] font-semibold px-2.5 py-1 
                               rounded-md shadow-sm"
                  >
                    OFERTA
                  </span>
                  <button 
                    onClick={(e) => removerFavorito(produto.id, e)}
                    className="text-red-500 hover:text-red-600 transition-colors text-xl"
                    title="Remover dos favoritos"
                  >
                    ♥
                  </button>
                </div>

                {/* Imagem do Produto */}
                <div 
                  className="flex items-center justify-center py-4 bg-gray-50 
                             rounded-xl mb-3"
                >
                  <img 
                    src={produto.imagem || iconJarra} 
                    alt={produto.nome} 
                    className="w-24 h-24 object-contain drop-shadow-md" 
                  />
                </div>

                {/* Preço antigo + desconto */}
                {produto.precoAntigo && Number(produto.precoAntigo) > 0 && (
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span 
                      className="bg-gradient-to-r from-orange-100 to-orange-50 
                                 text-orange-700 font-bold px-2 py-1 rounded-md"
                    >
                      -{calcularDesconto(produto.precoAntigo, produto.preco)}%
                    </span>
                    <span className="text-gray-400 line-through">
                      R$ {formatarPreco(produto.precoAntigo)}
                    </span>
                  </div>
                )}

                {/* Preço atual + botão adicionar */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-700 font-bold text-lg">
                    R$ {formatarPreco(produto.preco)}
                  </p>
                  <Botao 
                    onClick={(e) => handleAdicionarCarrinho(produto, e)}
                    className="h-8 w-8 rounded-full p-0 text-white font-bold 
                               bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] 
                               hover:from-[#FF8C00] hover:to-[#F9A01B] 
                               shadow-md hover:shadow-lg transition-all hover:scale-110"
                  >
                    +
                  </Botao>
                </div>

                {/* Descrição */}
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {produto.nome}
                </p>
              </article>
            ))}
          </div>

          {/* Botão Limpar Todos */}
          <div className="mt-8 text-center animate-fadeInUp">
            <Botao
              onClick={handleLimparTodos}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-lg hover-scale disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Limpar Todos os Favoritos'}
            </Botao>
          </div>
        </>
      )}
    </SidebarLayout>
  )
}
