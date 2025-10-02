import { Button } from "../components/ui/button"
import { useNavigate } from "react-router-dom"
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react"
import { useState } from "react"
import iconJarra from "../assets/icon de jara.png"
import SidebarLayout from "../components/layouts/SidebarLayout"

interface ItemCarrinho {
  id: number
  nome: string
  preco: number
  quantidade: number
  imagem: string
}

function Carrinho() {
  const navigate = useNavigate()
  const [itens, setItens] = useState<ItemCarrinho[]>([
    {
      id: 1,
      nome: "Garrafa de suco de laranja 250 ml",
      preco: 8.99,
      quantidade: 2,
      imagem: iconJarra
    },
    {
      id: 2,
      nome: "Garrafa de suco de laranja 250 ml",
      preco: 8.99,
      quantidade: 1,
      imagem: iconJarra
    },
    {
      id: 3,
      nome: "Garrafa de suco de laranja 250 ml",
      preco: 8.99,
      quantidade: 3,
      imagem: iconJarra
    }
  ])

  const incrementarQuantidade = (id: number) => {
    setItens(itens.map(item => 
      item.id === id ? { ...item, quantidade: item.quantidade + 1 } : item
    ))
  }

  const decrementarQuantidade = (id: number) => {
    setItens(itens.map(item => 
      item.id === id && item.quantidade > 1 
        ? { ...item, quantidade: item.quantidade - 1 } 
        : item
    ))
  }

  const removerItem = (id: number) => {
    setItens(itens.filter(item => item.id !== id))
  }

  const calcularSubtotal = () => {
    return itens.reduce((total, item) => total + (item.preco * item.quantidade), 0)
  }

  const calcularFrete = () => {
    return 5.00 // Frete fixo por enquanto
  }

  const calcularTotal = () => {
    return calcularSubtotal() + calcularFrete()
  }

  const handleFinalizarCompra = () => {
    navigate('/checkout')
  }

  const handleContinuarComprando = () => {
    navigate('/promocoes')
  }

  return (
    <SidebarLayout>
      {/* Título */}
      <section className="mt-6 mb-4">
        <h1 className="text-[#F9A01B] text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10" />
          Meu Carrinho
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mt-2">{itens.length} {itens.length === 1 ? 'item' : 'itens'} no carrinho</p>
      </section>

      {itens.length === 0 ? (
        // Carrinho Vazio
        <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-12 text-center">
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos para continuar comprando</p>
          <Button
            onClick={handleContinuarComprando}
            className="bg-[#F9A01B] hover:bg-[#FF8C00] text-white px-8 py-3 rounded-full font-semibold"
          >
            Continuar Comprando
          </Button>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {itens.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 sm:p-6 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Imagem */}
                  <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl flex items-center justify-center">
                    <img 
                      src={item.imagem} 
                      alt={item.nome} 
                      className="w-20 h-20 sm:w-28 sm:h-28 object-contain"
                    />
                  </div>

                  {/* Informações */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                        {item.nome}
                      </h3>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">
                        R$ {item.preco.toFixed(2)}
                      </p>
                    </div>

                    {/* Controles */}
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantidade */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1">
                        <Button
                          onClick={() => decrementarQuantidade(item.id)}
                          disabled={item.quantidade <= 1}
                          className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-700 p-0 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg font-bold text-gray-800 min-w-[2rem] text-center">
                          {item.quantidade}
                        </span>
                        <Button
                          onClick={() => incrementarQuantidade(item.id)}
                          className="w-8 h-8 rounded-full bg-[#F9A01B] hover:bg-[#FF8C00] text-white p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Remover */}
                      <Button
                        onClick={() => removerItem(item.id)}
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumo do Pedido</h2>

              {/* Detalhes */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itens.reduce((acc, item) => acc + item.quantidade, 0)} itens)</span>
                  <span className="font-semibold">R$ {calcularSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span className="font-semibold">R$ {calcularFrete().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-green-600">R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="space-y-3">
                <Button
                  onClick={handleFinalizarCompra}
                  className="w-full h-12 bg-gradient-to-r from-[#25992E] to-[#1f7a24] hover:from-[#1f7a24] hover:to-[#25992E] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Finalizar Compra
                </Button>
                <Button
                  onClick={handleContinuarComprando}
                  variant="outline"
                  className="w-full h-12 border-2 border-[#F9A01B] text-[#F9A01B] hover:bg-[#F9A01B] hover:text-white font-semibold rounded-xl transition-all"
                >
                  Continuar Comprando
                </Button>
              </div>

              {/* Informações Adicionais */}
              <div className="mt-6 p-4 bg-orange-50 rounded-xl">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">🎉 Frete Grátis</span> para compras acima de R$ 50,00
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

export default Carrinho
