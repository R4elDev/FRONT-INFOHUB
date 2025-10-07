import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, CreditCard, Smartphone, Banknote, MapPin, User, Phone, Mail } from "lucide-react"
import { useState } from "react"
import iconJarra from "../../assets/icon de jara.png"
import SidebarLayout from "../../components/layouts/SidebarLayout"

type FormaPagamento = 'credito' | 'debito' | 'pix' | 'dinheiro'

function Checkout() {
  const navigate = useNavigate()
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('credito')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')

  // Dados do carrinho (virão do contexto/estado global depois)
  const itensCarrinho = [
    { id: 1, nome: "Garrafa de suco de laranja 250 ml", preco: 8.99, quantidade: 2, imagem: iconJarra },
    { id: 2, nome: "Garrafa de suco de laranja 250 ml", preco: 8.99, quantidade: 1, imagem: iconJarra }
  ]

  const subtotal = itensCarrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)
  const frete = 5.00
  const total = subtotal + frete

  const handleVoltar = () => {
    navigate('/carrinho')
  }

  const handleFinalizarPedido = () => {
    // Validações básicas
    if (!nome || !telefone || !cep || !endereco || !numero || !bairro || !cidade || !estado) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    // Navega para página de sucesso
    navigate('/pagamento-sucesso')
  }

  const formasPagamento = [
    { id: 'credito' as FormaPagamento, label: 'Cartão de Crédito', icon: CreditCard },
    { id: 'debito' as FormaPagamento, label: 'Cartão de Débito', icon: CreditCard },
    { id: 'pix' as FormaPagamento, label: 'PIX', icon: Smartphone },
    { id: 'dinheiro' as FormaPagamento, label: 'Dinheiro', icon: Banknote }
  ]

  return (
    <SidebarLayout>
      {/* Header */}
      <section className="mt-8 mb-6">
        <button 
          onClick={handleVoltar}
          className="flex items-center gap-2 text-[#F9A01B] hover:text-[#FF8C00] font-semibold transition-colors group mb-4"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg">Voltar ao Carrinho</span>
        </button>
        <h1 className="text-[#F9A01B] text-3xl sm:text-4xl md:text-5xl font-bold">
          Finalizar Pedido
        </h1>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Pessoais */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-[#F9A01B]" />
              <h2 className="text-2xl font-bold text-gray-800">Dados Pessoais</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="h-12 pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-12 pl-10"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Endereço de Entrega */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-[#F9A01B]" />
              <h2 className="text-2xl font-bold text-gray-800">Endereço de Entrega</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CEP *</label>
                <Input
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="h-12"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Endereço *</label>
                <Input
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, Avenida, etc"
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Número *</label>
                <Input
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="123"
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Complemento</label>
                <Input
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Apto, Bloco, etc"
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro *</label>
                <Input
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Seu bairro"
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade *</label>
                <Input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Sua cidade"
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
                <Input
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                  className="h-12"
                />
              </div>
            </div>
          </section>

          {/* Forma de Pagamento */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-[#F9A01B]" />
              <h2 className="text-2xl font-bold text-gray-800">Forma de Pagamento</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formasPagamento.map((forma) => {
                const Icon = forma.icon
                return (
                  <button
                    key={forma.id}
                    onClick={() => setFormaPagamento(forma.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      formaPagamento === forma.id
                        ? 'border-[#F9A01B] bg-orange-50'
                        : 'border-gray-200 hover:border-[#F9A01B]/50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${formaPagamento === forma.id ? 'text-[#F9A01B]' : 'text-gray-400'}`} />
                    <span className={`font-semibold ${formaPagamento === forma.id ? 'text-[#F9A01B]' : 'text-gray-700'}`}>
                      {forma.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Informações adicionais baseadas na forma de pagamento */}
            {formaPagamento === 'pix' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  📱 Após confirmar o pedido, você receberá o QR Code do PIX para pagamento.
                </p>
              </div>
            )}
            {formaPagamento === 'dinheiro' && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-800">
                  💵 Pagamento em dinheiro na entrega. Tenha o valor exato ou troco disponível.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Resumo do Pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 sticky top-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumo do Pedido</h2>

            {/* Produtos */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {itensCarrinho.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src={item.imagem} alt={item.nome} className="w-12 h-12 object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium line-clamp-2">{item.nome}</p>
                    <p className="text-sm text-gray-600">Qtd: {item.quantidade}</p>
                    <p className="text-sm font-bold text-green-600">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Valores */}
            <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frete</span>
                <span className="font-semibold">R$ {frete.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-green-600">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Botão Finalizar */}
            <Button
              onClick={handleFinalizarPedido}
              className="w-full h-14 bg-gradient-to-r from-[#25992E] to-[#1f7a24] hover:from-[#1f7a24] hover:to-[#25992E] text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Finalizar Pedido
            </Button>

            {/* Segurança */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                🔒 Pagamento seguro e protegido
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default Checkout
