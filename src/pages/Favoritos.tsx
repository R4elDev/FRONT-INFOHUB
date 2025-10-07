import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../components/layouts/SidebarLayout"
import { Button as Botao } from "../components/ui/button"
import iconJarra from "../assets/icon de jara.png"

// Produtos favoritos de exemplo
const produtosFavoritos = [
  {
    id: 1,
    nome: "Garrafa de suco de laranja 250 ml",
    preco: 8.99,
    precoAntigo: 11.98,
    imagem: iconJarra,
    desconto: 33
  },
  {
    id: 2,
    nome: "Garrafa de suco de uva 250 ml",
    preco: 9.50,
    precoAntigo: 12.90,
    imagem: iconJarra,
    desconto: 26
  },
  {
    id: 3,
    nome: "Garrafa de suco de maçã 250 ml",
    preco: 7.99,
    precoAntigo: 10.50,
    imagem: iconJarra,
    desconto: 24
  },
  {
    id: 4,
    nome: "Garrafa de suco de limão 250 ml",
    preco: 8.50,
    precoAntigo: 11.20,
    imagem: iconJarra,
    desconto: 24
  },
  {
    id: 5,
    nome: "Garrafa de suco de morango 250 ml",
    preco: 10.90,
    precoAntigo: 14.90,
    imagem: iconJarra,
    desconto: 27
  },
  {
    id: 6,
    nome: "Garrafa de suco de abacaxi 250 ml",
    preco: 9.99,
    precoAntigo: 13.49,
    imagem: iconJarra,
    desconto: 26
  },
  {
    id: 7,
    nome: "Garrafa de suco de manga 250 ml",
    preco: 11.50,
    precoAntigo: 15.90,
    imagem: iconJarra,
    desconto: 28
  },
  {
    id: 8,
    nome: "Garrafa de suco de pêssego 250 ml",
    preco: 10.20,
    precoAntigo: 13.90,
    imagem: iconJarra,
    desconto: 27
  }
]

export default function Favoritos() {
  const navigate = useNavigate()
  const [favoritos, setFavoritos] = useState(produtosFavoritos)

  const removerFavorito = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavoritos(favoritos.filter(p => p.id !== id))
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
          {favoritos.length} {favoritos.length === 1 ? 'produto' : 'produtos'}
        </span>
      </div>

      {/* Tela Vazia */}
      {favoritos.length === 0 ? (
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
                    src={produto.imagem} 
                    alt={produto.nome} 
                    className="w-24 h-24 object-contain drop-shadow-md" 
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
                  <p className="text-green-700 font-bold text-lg">
                    R$ {produto.preco.toFixed(2)}
                  </p>
                  <Botao 
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/carrinho')
                    }}
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
              onClick={() => {
                if (confirm('Deseja remover todos os favoritos?')) {
                  setFavoritos([])
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-lg hover-scale"
            >
              Limpar Todos os Favoritos
            </Botao>
          </div>
        </>
      )}
    </SidebarLayout>
  )
}
