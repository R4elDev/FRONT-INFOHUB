import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useNavigate } from "react-router-dom"
import iconJarra from "../assets/icon de jara.png"
import lupaPesquisa from "../assets/lupa de pesquisa .png"
import microfoneVoz from "../assets/microfone de voz.png"
import SidebarLayout from "../components/layouts/SidebarLayout"

function Promocoes() {
  const navigate = useNavigate()

  const produtos = [
    {
      id: 1,
      nome: "Garrafa de suco de laranja 250 ml",
      precoAntigo: 11.98,
      precoAtual: 8.99,
      desconto: 33,
      imagem: iconJarra,
      oferta: true
    },
    {
      id: 2,
      nome: "Garrafa de suco de laranja 250 ml",
      precoAntigo: 11.98,
      precoAtual: 7.99,
      desconto: 33,
      imagem: iconJarra,
      oferta: true
    },
    {
      id: 3,
      nome: "Garrafa de suco de laranja 250 ml",
      precoAntigo: 11.98,
      precoAtual: 8.99,
      desconto: 33,
      imagem: iconJarra,
      oferta: true
    },
    {
      id: 4,
      nome: "Garrafa de suco de laranja 250 ml",
      precoAntigo: 11.98,
      precoAtual: 9.99,
      desconto: 17,
      imagem: iconJarra,
      oferta: true
    },
    {
      id: 5,
      nome: "Garrafa de suco de laranja 250 ml",
      precoAntigo: 11.98,
      precoAtual: 8.99,
      desconto: 33,
      imagem: iconJarra,
      oferta: true
    },
    {
      id: 6,
      nome: "Garrafa de suco de laranja 250 ml",
      precoAntigo: 11.98,
      precoAtual: 7.99,
      desconto: 33,
      imagem: iconJarra,
      oferta: true
    },
    {
      id: 7,
      nome: "Garrafa de suco de laranja 250 ml",
      precoAntigo: 11.98,
      precoAtual: 8.99,
      desconto: 33,
      imagem: iconJarra,
      oferta: true
    },
    {
      id: 8,
      nome: "Garrafa de suco de laranja 250 ml",
      precoAntigo: 11.98,
      precoAtual: 9.99,
      desconto: 17,
      imagem: iconJarra,
      oferta: true
    }
  ]

  const handleProdutoClick = (produtoId: number) => {
    navigate(`/produto/${produtoId}`)
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
            placeholder="Suco de laranja"
            className="h-16 pl-16 pr-16 rounded-3xl border-0 text-gray-700 text-base 
                       focus-visible:ring-2 focus-visible:ring-[#F9A01B] 
                       placeholder:text-gray-400"
          />
          <button className="absolute right-6 top-1/2 -translate-y-1/2 transition-transform hover:scale-110">
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
          {produtos.map((produto) => (
            <article
              key={produto.id}
              onClick={() => handleProdutoClick(produto.id)}
              className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 cursor-pointer
                         shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all 
                         hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1"
            >
              {/* Oferta + Favorito */}
              <div className="flex items-start justify-between mb-2">
                {produto.oferta && (
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
                    console.log('Favorito clicado')
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
                  src={produto.imagem} 
                  alt={produto.nome} 
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-md" 
                />
              </div>

              {/* Preço antigo + desconto */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span 
                  className="bg-gradient-to-r from-orange-100 to-orange-50 
                             text-orange-700 font-bold px-2 py-1 rounded-md"
                >
                  -{produto.desconto}%
                </span>
                <span className="text-gray-400 line-through">
                  R$ {produto.precoAntigo.toFixed(2)}
                </span>
              </div>

              {/* Preço atual + botão adicionar */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-700 font-bold text-base sm:text-lg">
                  R$ {produto.precoAtual.toFixed(2)}
                </p>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Adicionar ao carrinho')
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
          ))}
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
