import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Package, DollarSign, Hash, FileText, ShoppingCart, TrendingDown, Percent, Calendar, Store, Image, CheckCircle, Sparkles, Gift, Zap, AlertCircle } from 'lucide-react'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { useUser } from "../../contexts/UserContext"
import { cadastrarProduto, verificarEstabelecimento } from "../../services/apiServicesFixed"
import type { produtoRequest } from "../../services/types"

export default function CadastroPromocao() {
  const { user } = useUser()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    normalPrice: '',
    promoPrice: '',
    discount: '',
    quantity: '',
    market: '',
    validUntil: '',
    image: null
  })
  
  const [loading, setLoading] = useState(false)
  const [verificandoEstabelecimento, setVerificandoEstabelecimento] = useState(true)
  const [temEstabelecimento, setTemEstabelecimento] = useState(false)
  const [estabelecimento, setEstabelecimento] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Verificar se usuário tem estabelecimento ao carregar
  useEffect(() => {
    const verificarEstabelecimentoUsuario = async () => {
      if (user?.perfil !== 'estabelecimento') {
        setVerificandoEstabelecimento(false)
        return
      }

      try {
        const resultado = await verificarEstabelecimento()
        
        if (resultado.possuiEstabelecimento) {
          setTemEstabelecimento(true)
          setEstabelecimento(resultado.estabelecimento)
        } else {
          // Redirecionar para cadastro de estabelecimento
          navigate('/empresa/cadastro-estabelecimento')
          return
        }
      } catch (error) {
        console.error('Erro ao verificar estabelecimento:', error)
        setMessage({ 
          type: 'error', 
          text: 'Erro ao verificar estabelecimento. Tente novamente.' 
        })
      } finally {
        setVerificandoEstabelecimento(false)
      }
    }

    verificarEstabelecimentoUsuario()
  }, [user, navigate])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateDiscount = () => {
    const normal = parseFloat(formData.normalPrice.replace(',', '.'))
    const promo = parseFloat(formData.promoPrice.replace(',', '.'))
    if (normal && promo) {
      return Math.round(((normal - promo) / normal) * 100)
    }
    return 0
  }

  // Removido carregamento automático de categorias para evitar erro 404

  // Função para cadastrar produto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setMessage({ type: 'error', text: 'Usuário não autenticado' })
      return
    }

    // Validações
    if (!formData.name.trim() || !formData.description.trim()) {
      setMessage({ type: 'error', text: 'Preencha o nome e descrição do produto' })
      return
    }

    if (!formData.normalPrice || parseFloat(formData.normalPrice.replace(',', '.')) <= 0) {
      setMessage({ type: 'error', text: 'Preço deve ser maior que zero' })
      return
    }

    try {
      setLoading(true)
      
      // Validação e preparação dos dados
      const preco = parseFloat(formData.normalPrice.replace(',', '.'))
      const precoPromocional = formData.promoPrice ? parseFloat(formData.promoPrice.replace(',', '.')) : null
      
      // Validações adicionais
      if (isNaN(preco) || preco <= 0) {
        setMessage({ type: 'error', text: 'Preço inválido' })
        return
      }
      
      if (precoPromocional && (isNaN(precoPromocional) || precoPromocional <= 0)) {
        setMessage({ type: 'error', text: 'Preço promocional inválido' })
        return
      }
      
      if (precoPromocional && precoPromocional >= preco) {
        setMessage({ type: 'error', text: 'Preço promocional deve ser menor que o preço normal' })
        return
      }

      const produtoData: produtoRequest = {
        nome: formData.name.trim(),
        descricao: formData.description.trim(),
        id_categoria: 1, // ID padrão fixo por enquanto
        id_estabelecimento: estabelecimento?.id || user.id,
        preco: preco,
        promocao: precoPromocional ? {
          preco_promocional: precoPromocional,
          data_inicio: new Date().toISOString().split('T')[0],
          data_fim: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 dias se não especificado
        } : undefined
      }
      
      console.log('🔍 Dados que serão enviados:', produtoData)

      const response = await cadastrarProduto(produtoData)
      
      if (response.status) {
        setMessage({ type: 'success', text: 'Produto cadastrado com sucesso!' })
        // Limpar formulário
        setFormData({
          name: '',
          description: '',
          normalPrice: '',
          promoPrice: '',
          discount: '',
          quantity: '',
          market: '',
          validUntil: '',
          image: null
        })
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erro ao cadastrar produto' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Loading de verificação de estabelecimento
  if (verificandoEstabelecimento) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando estabelecimento...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  // Se não tem estabelecimento, será redirecionado automaticamente
  if (!temEstabelecimento) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecionando para cadastro de estabelecimento...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Info do Estabelecimento */}
          {estabelecimento && (
            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-orange-200">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">{estabelecimento.nome}</h3>
                  <p className="text-sm text-gray-600">CNPJ: {estabelecimento.cnpj}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Mensagem de Feedback */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-6 w-full">
              {/* Formulário Principal */}
              <div className="flex-1 space-y-6">
              {/* Header com gradiente */}
              <div className="bg-gradient-to-r from-[#F9A01B] via-[#FF8C00] to-[#F9A01B] rounded-3xl shadow-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <Gift className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Cadastrar Promoção</h1>
                    <p className="text-orange-100 text-sm">Adicione ofertas imperdíveis para seus clientes</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    <span className="font-semibold">Economia Garantida</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">Ofertas Diárias</span>
                  </div>
                </div>
              </div>

              {/* Card de Informações do Produto */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-[#F9A01B]/20">
                  <div className="bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] p-3 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Informações do Produto</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Package className="w-4 h-4 text-orange-500" />
                        Nome do Produto
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9A01B] focus:outline-none transition-all"
                        placeholder="Ex: Arroz Integral 1kg"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Store className="w-4 h-4 text-green-600" />
                        Mercado
                      </label>
                      <input
                        type="text"
                        value={formData.market}
                        onChange={(e) => handleInputChange('market', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-all"
                        placeholder="Nome do mercado"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      Descrição da Oferta
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all resize-none"
                      rows={3}
                      placeholder="Descreva os detalhes da promoção..."
                    />
                  </div>
                  {/* Campo de categoria removido temporariamente */}
                </div>
              </div>

              {/* Card de Preços e Descontos */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b-2 border-green-100">
                  <div className="bg-gradient-to-br from-green-400 to-green-500 p-2 rounded-lg">
                    <Percent className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Preços e Desconto</h2>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      Preço Normal
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-medium">R$</span>
                      <input
                        type="text"
                        value={formData.normalPrice}
                        onChange={(e) => handleInputChange('normalPrice', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-green-600 mb-2">
                      <Zap className="w-4 h-4" />
                      Preço Promo
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-green-600 font-medium">R$</span>
                      <input
                        type="text"
                        value={formData.promoPrice}
                        onChange={(e) => handleInputChange('promoPrice', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-400 focus:outline-none transition-all bg-green-50"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Hash className="w-4 h-4 text-orange-500" />
                      Estoque
                    </label>
                    <input
                      type="text"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      Válido até
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => handleInputChange('validUntil', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="mt-4 bg-gradient-to-r from-orange-50 to-green-50 p-4 rounded-xl border-2 border-orange-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Desconto Calculado:</span>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">{calculateDiscount()}% OFF</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload de Imagem */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b-2 border-orange-100">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-2 rounded-lg">
                    <Image className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Imagem do Produto</h2>
                </div>
                <div className="border-3 border-dashed border-orange-300 rounded-2xl p-12 text-center hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer bg-gradient-to-br from-orange-50 to-yellow-50">
                  <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Upload className="w-10 h-10 text-orange-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">Arraste a imagem aqui</p>
                  <p className="text-sm text-gray-500 mb-2">ou clique para selecionar</p>
                  <p className="text-xs text-gray-400">PNG, JPG ou WEBP até 5MB</p>
                </div>
              </div>

              {/* Botão de Cadastrar */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#F9A01B] text-white font-bold py-5 rounded-2xl hover:shadow-2xl transform hover:scale-[1.02] transition-all text-lg flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Cadastrar Produto
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Preview Card */}
            <div className="w-96 space-y-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-orange-100">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold text-gray-800">Pré-visualização</h2>
                </div>
                
                {/* Card de Oferta */}
                <div className="border-2 border-orange-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                  <div className="bg-gradient-to-br from-orange-100 to-yellow-50 h-48 flex items-center justify-center relative">
                    <Package className="w-20 h-20 text-orange-300" />
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1 shadow-lg">
                      <Percent className="w-4 h-4" />
                      {calculateDiscount()}% OFF
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">{formData.market}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2 text-lg">{formData.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{formData.description}</p>
                    {formData.quantity && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{formData.quantity} un.</span>
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-orange-50 to-green-50 p-3 rounded-xl mb-3">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs text-gray-500 line-through">R$ {formData.normalPrice}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-green-600">R$ {formData.promoPrice}</span>
                        </div>
                        <TrendingDown className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    {formData.validUntil && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>Válido até {new Date(formData.validUntil).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Economia de:</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {formData.normalPrice && formData.promoPrice ? 
                      `R$ ${(parseFloat(formData.normalPrice.replace(',', '.')) - parseFloat(formData.promoPrice.replace(',', '.'))).toFixed(2).replace('.', ',')}` 
                      : 'R$ 0,00'
                    }
                  </span>
                </div>
              </div>
            </div>
            
            {/* Removido botão duplicado */}
          </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}
