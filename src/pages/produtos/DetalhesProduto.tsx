import { Button } from "../../components/ui/button"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Heart, MapPin, Plus, Minus } from "lucide-react"
import { useState } from "react"
import iconJarra from "../../assets/icon de jara.png"
import SidebarLayout from "../../components/layouts/SidebarLayout"

function DetalhesProduto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quantidade, setQuantidade] = useState(1)
  const [favorito, setFavorito] = useState(false)

  // Dados estáticos do produto (depois virá da API)
  const produto = {
    id: id,
    nome: "Garrafa de suco de laranja 250 ml",
    precoAntigo: 11.98,
    precoAtual: 8.99,
    desconto: 33,
    imagem: iconJarra,
    oferta: true,
    descricao: "Delicioso suco de laranja natural, feito com frutas selecionadas. Ideal para acompanhar suas refeições ou para um lanche refrescante.",
    localizacao: "Seção de Bebidas - Corredor 3"
  }

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
              {produto.oferta && (
                <span 
                  className="bg-gradient-to-r from-green-600 to-green-500 
                             text-white text-sm font-semibold px-4 py-2 
                             rounded-lg shadow-md"
                >
                  Oferta
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
              <img 
                src={produto.imagem} 
                alt={produto.nome} 
                className="w-48 h-48 sm:w-64 sm:h-64 object-contain drop-shadow-2xl" 
              />
            </div>

            {/* Localização */}
            <div className="flex items-center gap-3 bg-orange-50 p-4 rounded-xl border border-orange-100">
              <MapPin className="w-5 h-5 text-[#F9A01B]" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Localização no mercado</p>
                <p className="text-sm text-gray-700 font-semibold">{produto.localizacao}</p>
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
              <div className="flex items-center gap-4 mb-2">
                <span 
                  className="bg-gradient-to-r from-orange-100 to-orange-50 
                             text-orange-700 font-bold px-3 py-1.5 rounded-lg text-sm"
                >
                  -{produto.desconto}%
                </span>
                <span className="text-gray-400 line-through text-lg">
                  R$ {produto.precoAntigo.toFixed(2)}
                </span>
              </div>
              <p className="text-4xl sm:text-5xl font-bold text-green-600">
                R$ {produto.precoAtual.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Economia de R$ {(produto.precoAntigo - produto.precoAtual).toFixed(2)}
              </p>
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
              Adicionar ao Carrinho - R$ {(produto.precoAtual * quantidade).toFixed(2)}
            </Button>

            {/* Informações Adicionais */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Informações do Produto</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Volume: 250ml</li>
                <li>• Categoria: Bebidas</li>
                <li>• Marca: Natural Juice</li>
                <li>• Validade: Consultar embalagem</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Produtos Relacionados */}
      <section className="mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Produtos Relacionados
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <article
              key={i}
              onClick={() => navigate(`/produto/${i}`)}
              className="rounded-2xl border border-gray-200 bg-white p-4 cursor-pointer
                         shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all 
                         hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1"
            >
              <div className="flex items-center justify-center py-4 bg-gray-50 rounded-xl mb-3">
                <img 
                  src={iconJarra} 
                  alt="Produto" 
                  className="w-20 h-20 object-contain drop-shadow-md" 
                />
              </div>
              <p className="text-green-700 font-bold text-lg mb-1">R$ 8,99</p>
              <p className="text-xs text-gray-600 line-clamp-2">
                Garrafa de suco de laranja 250 ml
              </p>
            </article>
          ))}
        </div>
      </section>
    </SidebarLayout>
  )
}

export default DetalhesProduto
