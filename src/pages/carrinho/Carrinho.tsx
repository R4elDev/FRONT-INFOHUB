import { Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom"
import { Trash2, Plus, Minus, ShoppingCart, Package, TrendingUp, Truck, ArrowRight } from "lucide-react"
import { useCarrinho } from "../../contexts/CarrinhoContext"
import iconJarra from "../../assets/icon de jara.png"
import SidebarLayout from "../../components/layouts/SidebarLayout"

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
  
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-slide-in {
    animation: slide-in 0.4s ease-out forwards;
  }
`
if (!document.head.querySelector('style[data-carrinho-animations]')) {
  styles.setAttribute('data-carrinho-animations', 'true')
  document.head.appendChild(styles)
}

function Carrinho() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeFromCart, total, totalItems, isEmpty, loading } = useCarrinho()

  // Função helper para formatar preços de forma segura
  const formatarPreco = (preco: any): string => {
    const precoNum = Number(preco)
    if (isNaN(precoNum)) return '0.00'
    return precoNum.toFixed(2)
  }

  const incrementarQuantidade = async (id: number, quantidadeAtual: number) => {
    await updateQuantity(id, quantidadeAtual + 1)
  }

  const decrementarQuantidade = async (id: number, quantidadeAtual: number) => {
    if (quantidadeAtual > 1) {
      await updateQuantity(id, quantidadeAtual - 1)
    }
  }

  const removerItem = async (id: number) => {
    await removeFromCart(id)
  }

  const calcularSubtotal = () => {
    return total
  }

  const calcularFrete = () => {
    return 5.00 // Frete fixo por enquanto
  }

  const calcularTotal = () => {
    return total + calcularFrete()
  }

  const handleFinalizarCompra = () => {
    navigate('/checkout')
  }

  const handleContinuarComprando = () => {
    navigate('/promocoes')
  }

  return (
    <SidebarLayout>
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4">
        {/* Header Premium */}
        <section className="mt-8 mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFA726] to-[#FF8C00] flex items-center justify-center shadow-xl animate-bounce-slow">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 tracking-tight">
                Meu Carrinho
              </h1>
              <p className="text-base md:text-lg text-gray-600 mt-1 flex items-center gap-2">
                <Package className="w-4 h-4" />
                {loading ? 'Carregando...' : `${items.length} ${items.length === 1 ? 'item' : 'itens'} no carrinho`}
              </p>
            </div>
          </div>
          
          {/* Barra de Progresso do Pedido */}
          {!isEmpty && !loading && (
            <div className="mt-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-4 border-2 border-orange-100 animate-slide-in">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-orange-800">
                    {total >= 50 ? '🎉 Você ganhou frete grátis!' : `Faltam R$ ${(50 - total).toFixed(2)} para frete grátis`}
                  </span>
                </div>
                {total < 50 && (
                  <Truck className="w-5 h-5 text-orange-400" />
                )}
              </div>
              {total < 50 && (
                <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 transition-all duration-500"
                    style={{ width: `${Math.min((total / 50) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </section>

      {loading ? (
        <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-12 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Carregando carrinho...</p>
        </section>
      ) : isEmpty ? (
        // Carrinho Vazio - Design Premium
        <section className="bg-white rounded-3xl border-2 border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-16 text-center animate-fade-in">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center animate-bounce-slow">
            <ShoppingCart className="w-16 h-16 text-orange-400" />
          </div>
          <h2 className="text-4xl font-black text-gray-800 mb-4">Seu carrinho está vazio</h2>
          <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
            Que tal adicionar alguns produtos incríveis? Temos ofertas especiais esperando por você!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleContinuarComprando}
              className="bg-gradient-to-r from-[#FFA726] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FFA726] text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Explorar Produtos
            </Button>
            <Button
              onClick={() => navigate('/HomeInicial')}
              className="bg-white border-2 border-gray-200 hover:border-[#FFA726] text-gray-700 hover:text-[#FFA726] px-10 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Ver Destaques
            </Button>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 sm:p-6 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Imagem */}
                  <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl flex items-center justify-center">
                    <img 
                      src={item.imagem || iconJarra} 
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
                        R$ {formatarPreco(item.preco)}
                      </p>
                    </div>

                    {/* Controles */}
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantidade */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1">
                        <Button
                          onClick={() => decrementarQuantidade(item.id, item.quantidade)}
                          disabled={item.quantidade <= 1 || loading}
                          className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-700 p-0 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg font-bold text-gray-800 min-w-[2rem] text-center">
                          {item.quantidade}
                        </span>
                        <Button
                          onClick={() => incrementarQuantidade(item.id, item.quantidade)}
                          disabled={loading}
                          className="w-8 h-8 rounded-full bg-[#F9A01B] hover:bg-[#FF8C00] text-white p-0 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Remover */}
                      <Button
                        onClick={() => removerItem(item.id)}
                        disabled={loading}
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
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
                  <span>Subtotal ({totalItems} itens)</span>
                  <span className="font-semibold">R$ {formatarPreco(calcularSubtotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span className="font-semibold">R$ {formatarPreco(calcularFrete())}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-green-600">R$ {formatarPreco(calcularTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="space-y-3">
                <Button
                  onClick={handleFinalizarCompra}
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-[#25992E] to-[#1f7a24] hover:from-[#1f7a24] hover:to-[#25992E] text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? 'Processando...' : (
                    <>
                      <ArrowRight className="w-5 h-5" />
                      Finalizar Compra
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleContinuarComprando}
                  variant="outline"
                  className="w-full h-12 border-2 border-[#F9A01B] text-[#F9A01B] hover:bg-[#F9A01B] hover:text-white font-bold rounded-xl transition-all hover:scale-105"
                >
                  Continuar Comprando
                </Button>
              </div>

              {/* Informações Adicionais */}
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-100">
                <p className="text-sm text-gray-700 font-medium">
                  <span className="font-bold">🎉 Frete Grátis</span> para compras acima de R$ 50,00
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </SidebarLayout>
  )
}

export default Carrinho
