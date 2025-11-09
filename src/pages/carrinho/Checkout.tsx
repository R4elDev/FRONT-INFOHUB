import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, CreditCard, Smartphone, Banknote, MapPin, User, Phone, Mail, Check, ShoppingCart, Truck, Package, Loader2, AlertCircle } from "lucide-react"
import { useState } from "react"
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
  
  @keyframes slide-in-right {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.4s ease-out forwards;
  }
  
  @keyframes pulse-border {
    0%, 100% { border-color: rgb(249, 160, 27); }
    50% { border-color: rgb(255, 140, 0); }
  }
  
  .animate-pulse-border {
    animation: pulse-border 2s ease-in-out infinite;
  }
`
if (!document.head.querySelector('style[data-checkout-animations]')) {
  styles.setAttribute('data-checkout-animations', 'true')
  document.head.appendChild(styles)
}

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
  
  // Estados para busca de CEP
  const [loadingCep, setLoadingCep] = useState(false)
  const [erroCep, setErroCep] = useState('')

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
  
  // Função para buscar CEP na API ViaCEP
  const buscarCEP = async (cepValue: string) => {
    // Remove caracteres não numéricos
    const cepLimpo = cepValue.replace(/\D/g, '')
    
    // Valida se tem 8 dígitos
    if (cepLimpo.length !== 8) {
      setErroCep('')
      return
    }
    
    setLoadingCep(true)
    setErroCep('')
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        setErroCep('CEP não encontrado')
        setEndereco('')
        setBairro('')
        setCidade('')
        setEstado('')
      } else {
        // Preenche os campos automaticamente
        setEndereco(data.logradouro || '')
        setBairro(data.bairro || '')
        setCidade(data.localidade || '')
        setEstado(data.uf || '')
        setComplemento(data.complemento || '')
        setErroCep('')
        
        // Foca no campo de número após preencher
        setTimeout(() => {
          document.getElementById('numero-input')?.focus()
        }, 100)
      }
    } catch (error) {
      setErroCep('Erro ao buscar CEP. Tente novamente.')
      console.error('Erro ao buscar CEP:', error)
    } finally {
      setLoadingCep(false)
    }
  }
  
  // Função para formatar CEP enquanto digita
  const handleCepChange = (value: string) => {
    // Remove tudo que não é número
    const apenasNumeros = value.replace(/\D/g, '')
    
    // Limita a 8 dígitos
    const limitado = apenasNumeros.slice(0, 8)
    
    // Formata: 00000-000
    let formatado = limitado
    if (limitado.length > 5) {
      formatado = `${limitado.slice(0, 5)}-${limitado.slice(5)}`
    }
    
    setCep(formatado)
    
    // Busca automaticamente quando completar 8 dígitos
    if (apenasNumeros.length === 8) {
      buscarCEP(apenasNumeros)
    }
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
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4">
        {/* Header Premium */}
        <section className="mt-8 mb-8 animate-fade-in">
          <button 
            onClick={handleVoltar}
            className="flex items-center gap-2 text-[#FFA726] hover:text-[#FF8C00] font-bold transition-all group mb-6 hover:scale-105"
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-lg">Voltar ao Carrinho</span>
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFA726] to-[#FF8C00] flex items-center justify-center shadow-xl">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 tracking-tight">
                Finalizar Pedido
              </h1>
              <p className="text-base text-gray-600 mt-1">
                Preencha seus dados para concluir a compra
              </p>
            </div>
          </div>
          
          {/* Stepper de Progresso */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:block ml-2 font-semibold text-green-600">Carrinho</span>
            </div>
            <div className="h-1 w-12 sm:w-24 bg-[#FFA726]"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#FFA726] flex items-center justify-center animate-pulse-border border-4">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:block ml-2 font-bold text-[#FFA726]">Checkout</span>
            </div>
            <div className="h-1 w-12 sm:w-24 bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Truck className="w-5 h-5 text-gray-400" />
              </div>
              <span className="hidden sm:block ml-2 font-semibold text-gray-400">Confirmação</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Pessoais */}
          <section className="bg-white rounded-3xl border-2 border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_8px_30px_rgba(249,160,27,0.15)] transition-all">
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
          <section className="bg-white rounded-3xl border-2 border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_8px_30px_rgba(249,160,27,0.15)] transition-all">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-[#F9A01B]" />
              <h2 className="text-2xl font-bold text-gray-800">Endereço de Entrega</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">CEP *</label>
                <div className="relative">
                  <Input
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className={`h-12 pr-10 ${erroCep ? 'border-red-500' : ''}`}
                  />
                  {loadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFA726] animate-spin" />
                  )}
                  {erroCep && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {erroCep && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {erroCep}
                  </p>
                )}
                {!erroCep && !loadingCep && cep.replace(/\D/g, '').length === 8 && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    CEP encontrado! Endereço preenchido automaticamente
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Endereço *</label>
                <Input
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, Avenida, etc"
                  className="h-12"
                  disabled={loadingCep}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Número *</label>
                <Input
                  id="numero-input"
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
                  disabled={loadingCep}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade *</label>
                <Input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Sua cidade"
                  className="h-12"
                  disabled={loadingCep}
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
                  disabled={loadingCep}
                />
              </div>
            </div>
          </section>

          {/* Forma de Pagamento */}
          <section className="bg-white rounded-3xl border-2 border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_8px_30px_rgba(249,160,27,0.15)] transition-all">
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
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
                      formaPagamento === forma.id
                        ? 'border-[#FFA726] bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg'
                        : 'border-gray-200 hover:border-[#FFA726]/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formaPagamento === forma.id ? 'bg-[#FFA726]' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${formaPagamento === forma.id ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <span className={`font-bold ${formaPagamento === forma.id ? 'text-[#FFA726]' : 'text-gray-700'}`}>
                      {forma.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Informações adicionais baseadas na forma de pagamento */}
            {formaPagamento === 'pix' && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 animate-fade-in">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Pagamento via PIX</p>
                    <p className="text-xs text-blue-700">QR Code será gerado após confirmação</p>
                  </div>
                </div>
              </div>
            )}
            {formaPagamento === 'dinheiro' && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 animate-fade-in">
                <div className="flex items-center gap-3">
                  <Banknote className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm font-bold text-green-900">Pagamento na entrega</p>
                    <p className="text-xs text-green-700">Tenha o valor exato ou troco</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Resumo do Pedido */}
        <div className="lg:col-span-1 animate-slide-in-right">
          <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6 sticky top-6">
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
              className="w-full h-16 bg-gradient-to-r from-[#25992E] to-[#1f7a24] hover:from-[#1f7a24] hover:to-[#25992E] text-white text-xl font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              <Check className="w-6 h-6" />
              Confirmar Pedido
            </Button>

            {/* Segurança */}
            <div className="mt-6 space-y-3">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-green-800">
                    Pagamento 100% Seguro
                  </p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-700 text-center font-medium">
                  🔒 Seus dados estão protegidos com criptografia SSL
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default Checkout
