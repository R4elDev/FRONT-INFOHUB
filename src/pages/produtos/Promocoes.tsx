import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useNavigate } from "react-router-dom"
import lupaPesquisa from "../../assets/lupa de pesquisa .png"
import microfoneVoz from "../../assets/microfone de voz.png"
import iconJarra from "../../assets/icon de jara.png"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { listarProdutos, formatarPreco, calcularDesconto, isProdutoEmPromocao } from "../../services/apiServicesFixed"

function Promocoes() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState<Array<any>>([])
  const [busca, setBusca] = useState('')

  // Carrega produtos em promoção
  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        // Carrega produtos em promoção
        const produtosResponse = await listarProdutos({ promocao: true })
        if (produtosResponse.status && produtosResponse.data) {
          setProdutos(produtosResponse.data)
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        // Se der erro, tenta carregar todos os produtos
        try {
          const produtosResponse = await listarProdutos()
          if (produtosResponse.status && produtosResponse.data) {
            setProdutos(produtosResponse.data)
          }
        } catch (error2) {
          console.error('Erro ao carregar produtos sem filtro:', error2)
        }
      }
    }
    
    carregarProdutos()
  }, [])

  const handleProdutoClick = (produtoId: number) => {
    navigate(`/produto/${produtoId}`)
  }

  const handleBusca = () => {
    if (busca.trim()) {
      navigate(`/promocoes?busca=${encodeURIComponent(busca.trim())}`)
    }
  }

  return (
    <SidebarLayout>
      {/* Título */}
      <section className="mt-8">
        <h1 className="text-[#F9A01B] text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
           Promoções
        </h1>
      </section>

      {/* Barra de Pesquisa */}
      <section className="mb-8">
        <div 
          className="relative w-full bg-white rounded-3xl border border-gray-100 
                     shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all 
                     hover:shadow-[0_6px_30px_rgba(0,0,0,0.12)]"
        >
          <img
            src={lupaPesquisa}
            alt="Pesquisar"
            className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
          />
          <Input
            placeholder="Buscar promoções..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBusca()}
            className="h-16 pl-16 pr-16 rounded-3xl border-0 text-gray-700 text-base 
                       focus-visible:ring-2 focus-visible:ring-[#F9A01B] 
                       placeholder:text-gray-400"
          />
          <button 
            onClick={handleBusca}
            className="absolute right-6 top-1/2 -translate-y-1/2 transition-transform hover:scale-110"
          >
            <img
              src={microfoneVoz}
              alt="Pesquisar por voz"
              className="w-5 h-6"
            />
          </button>
        </div>
      </section>

      {/* Filtros de Categoria */}
      <section className="mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          <Button className="bg-[#F9A01B] hover:bg-[#FF8C00] text-white font-semibold px-6 py-2 rounded-full whitespace-nowrap shadow-md">
            Promoções
          </Button>
          <Button variant="outline" className="border-2 border-gray-200 hover:border-[#F9A01B] font-semibold px-6 py-2 rounded-full whitespace-nowrap">
            Hortifruti
          </Button>
          <Button variant="outline" className="border-2 border-gray-200 hover:border-[#F9A01B] font-semibold px-6 py-2 rounded-full whitespace-nowrap">
            Carne
          </Button>
          <Button variant="outline" className="border-2 border-gray-200 hover:border-[#F9A01B] font-semibold px-6 py-2 rounded-full whitespace-nowrap">
            Bebidas
          </Button>
        </div>
      </section>

      {/* Grid de Produtos */}
      <section 
        className="bg-white rounded-3xl border border-gray-100 
                   shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 sm:p-6 md:p-8"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {produtos.map((produto) => {
            const emPromocao = isProdutoEmPromocao(produto)
            const desconto = emPromocao ? calcularDesconto(produto.preco, produto.promocao.preco_promocional) : 0
            
            return (
              <article
                key={produto.id}
                onClick={() => handleProdutoClick(produto.id)}
                className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 cursor-pointer
                           shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all 
                           hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1"
              >
                {/* Oferta + Favorito */}
                <div className="flex items-start justify-between mb-2">
                  {emPromocao && (
                    <span 
                      className="bg-gradient-to-r from-green-600 to-green-500 
                                 text-white text-[10px] font-semibold px-2.5 py-1 
                                 rounded-md shadow-sm"
                    >
                      Oferta
                    </span>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Favorito clicado:', produto.id)
                    }}
                    className="text-gray-300 hover:text-red-500 transition-colors text-xl"
                  >
                    ♡
                  </button>
                </div>

                {/* Imagem do Produto */}
                <div 
                  className="flex items-center justify-center py-3 sm:py-4 bg-gray-50 
                             rounded-xl mb-3"
                >
                  <img 
                    src={produto.imagem || iconJarra} 
                    alt={produto.nome} 
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-md" 
                  />
                </div>

                {/* Preço antigo + desconto */}
                {emPromocao && (
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span 
                      className="bg-gradient-to-r from-orange-100 to-orange-50 
                                 text-orange-700 font-bold px-2 py-1 rounded-md"
                    >
                      -{desconto}%
                    </span>
                    <span className="text-gray-400 line-through">
                      {formatarPreco(produto.preco)}
                    </span>
                  </div>
                )}

                {/* Preço atual + botão adicionar */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-700 font-bold text-base sm:text-lg">
                    {emPromocao 
                      ? formatarPreco(produto.promocao.preco_promocional) 
                      : formatarPreco(produto.preco)
                    }
                  </p>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Adicionar ao carrinho:', produto.id)
                    }}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0 text-white font-bold 
                               bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] 
                               hover:from-[#FF8C00] hover:to-[#F9A01B] 
                               shadow-md hover:shadow-lg transition-all hover:scale-110"
                  >
                    +
                  </Button>
                </div>

                {/* Descrição */}
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {produto.nome}
                </p>
              </article>
            )
          })}
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-center gap-2.5 mt-8">
          <span 
            className="w-3 h-3 rounded-full bg-[#F9A01B] shadow-md 
                       transition-all hover:scale-125 cursor-pointer" 
          />
          <span 
            className="w-3 h-3 rounded-full bg-[#F9A01B]/60 shadow-sm 
                       transition-all hover:scale-125 cursor-pointer" 
          />
          <span 
            className="w-3 h-3 rounded-full bg-[#F9A01B]/40 shadow-sm 
                       transition-all hover:scale-125 cursor-pointer" 
          />
        </div>
      </section>
    </SidebarLayout>
  )
}

export default Promocoes
