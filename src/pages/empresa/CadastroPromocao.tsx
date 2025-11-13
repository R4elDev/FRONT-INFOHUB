import { useState, useEffect } from 'react'
import { Upload, Package, DollarSign, Hash, FileText, ShoppingCart, TrendingDown, Percent, Calendar, Store, Image, CheckCircle, Sparkles, Gift, Zap, AlertCircle, Tag, ChevronDown } from 'lucide-react'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { useUser } from "../../contexts/UserContext"
import { cadastrarProduto, cadastrarEstabelecimento, cadastrarEnderecoEstabelecimento, listarCategorias } from "../../services/apiServicesFixed"
import type { produtoRequest } from "../../services/types"

// CSS para animação
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
    animation: fade-in 0.5s ease-out forwards;
  }
`
if (!document.head.querySelector('style[data-cadastro-promocao-animations]')) {
  styles.setAttribute('data-cadastro-promocao-animations', 'true')
  document.head.appendChild(styles)
}

export default function CadastroPromocao() {
  const { user } = useUser()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    normalPrice: '',
    promoPrice: '',
    discount: '',
    quantity: '',
    market: '',
    validUntil: '',
    image: null,
    categoriaId: null as number | null,
    categoriaNome: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [verificandoEstabelecimento, setVerificandoEstabelecimento] = useState(true)
  const [temEstabelecimento, setTemEstabelecimento] = useState(false)
  const [estabelecimento, setEstabelecimento] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [categorias, setCategorias] = useState<Array<{ id: number; nome: string }>>([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)
  const [showCategoriaDropdown, setShowCategoriaDropdown] = useState(false)

  // Função para gerar CNPJ único baseado no ID do usuário
  const gerarCNPJUnico = (userId: number): string => {
    // Gera um CNPJ único baseado no ID do usuário
    const base = userId.toString().padStart(8, '0')
    return `${base.substring(0,2)}.${base.substring(2,5)}.${base.substring(5,8)}/0001-${(userId % 100).toString().padStart(2, '0')}`
  }

  // Verificar se usuário tem estabelecimento ao carregar e criar se necessário
  useEffect(() => {
    const verificarOuCriarEstabelecimento = async () => {
      if (user?.perfil !== 'estabelecimento') {
        setVerificandoEstabelecimento(false)
        return
      }

      // Verifica se o estabelecimento no localStorage pertence ao usuário atual
      const estabelecimentoId = localStorage.getItem('estabelecimentoId')
      const estabelecimentoNome = localStorage.getItem('estabelecimentoNome')
      const estabelecimentoCNPJ = localStorage.getItem('estabelecimentoCNPJ')
      const estabelecimentoUserId = localStorage.getItem('estabelecimentoUserId')

      // Se existe estabelecimento mas é de outro usuário, limpa o localStorage
      if (estabelecimentoUserId && parseInt(estabelecimentoUserId) !== user.id) {
        localStorage.removeItem('estabelecimentoId')
        localStorage.removeItem('estabelecimentoNome')
        localStorage.removeItem('estabelecimentoCNPJ')
        localStorage.removeItem('estabelecimentoUserId')
      }
      // Se tem estabelecimento do usuário atual, usa ele
      else if (estabelecimentoId && estabelecimentoNome && estabelecimentoUserId && parseInt(estabelecimentoUserId) === user.id) {
        setEstabelecimento({
          id: parseInt(estabelecimentoId),
          nome: estabelecimentoNome,
          cnpj: estabelecimentoCNPJ || gerarCNPJUnico(user.id)
        })
        setTemEstabelecimento(true)
        setVerificandoEstabelecimento(false)
        return
      }

      // Se não tem estabelecimento, cria automaticamente
      try {
        
        const cnpjUnico = gerarCNPJUnico(user.id)
        const novoEstabelecimento = {
          nome: user.nome ? `${user.nome} - Estabelecimento` : 'Meu Estabelecimento',
          cnpj: cnpjUnico,
          telefone: user.telefone || '(00) 0000-0000'
        }

        const response = await cadastrarEstabelecimento(novoEstabelecimento)
        
        if (response.status && response.id) {
          // Salva no localStorage com ID do usuário para validação
          localStorage.setItem('estabelecimentoId', response.id.toString())
          localStorage.setItem('estabelecimentoNome', novoEstabelecimento.nome)
          localStorage.setItem('estabelecimentoCNPJ', cnpjUnico)
          localStorage.setItem('estabelecimentoUserId', user.id.toString())
          
          setEstabelecimento({
            id: response.id,
            nome: novoEstabelecimento.nome,
            cnpj: cnpjUnico
          })
          setTemEstabelecimento(true)
          
          
          // Agora cria um endereço padrão para o estabelecimento
          try {
            const enderecoData = {
              id_usuario: user.id,
              cep: '00000000', // CEP sem hífen para API
              logradouro: 'Endereço não informado',
              numero: 'S/N',
              complemento: '',
              bairro: 'Centro',
              cidade: 'Cidade não informada',
              estado: 'Estado não informado'
            }
            
            const enderecoResponse = await cadastrarEnderecoEstabelecimento(enderecoData)
            
            if (enderecoResponse && enderecoResponse.status) {
            } else {
            }
          } catch (enderecoError: any) {
            console.error('❌ Erro ao criar endereço padrão automático:', enderecoError)
            console.error('❌ Detalhes do erro de endereço:', enderecoError.response?.data)
            // Não falha a criação do estabelecimento por causa do endereço
          }
        } else {
          console.error('❌ Erro na resposta do estabelecimento:', response)
          setTemEstabelecimento(false)
        }
      } catch (error: any) {
        console.error('❌ Erro ao criar estabelecimento automaticamente:', error)
        console.error('❌ Detalhes:', error.response?.data)
        setTemEstabelecimento(false)
      } finally {
        setVerificandoEstabelecimento(false)
      }
    }

    verificarOuCriarEstabelecimento()
  }, [user])

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

  // Carregar categorias disponíveis
  useEffect(() => {
    
    const carregarCategorias = async () => {
      try {
        setLoadingCategorias(true)
        
        const response = await listarCategorias()
        
        if (response.status && response.data) {
          setCategorias(response.data)
        } else {
          setCategorias([])
        }
      } catch (error: any) {
        console.error('❌ ERRO no carregamento:', error)
        console.error('❌ Tipo do erro:', typeof error)
        console.error('❌ Mensagem:', error.message)
        console.error('❌ Stack:', error.stack)
        setCategorias([])
      } finally {
        setLoadingCategorias(false)
      }
    }

    carregarCategorias()
  }, [])

  // Fechar dropdown ao clicar fora - REMOVIDO para evitar conflitos
  // O dropdown agora fecha apenas ao selecionar uma opção

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

      // Validar ID do estabelecimento
      if (!estabelecimento?.id) {
        setMessage({ type: 'error', text: 'ID do estabelecimento não encontrado. Faça logout e login novamente.' })
        return
      }

      // Monta payload no formato exato solicitado
      const produtoData: produtoRequest = {
        nome: formData.name.trim(),
        descricao: formData.description.trim(),
        id_estabelecimento: estabelecimento.id,
        preco: preco
      }
      
      // Adiciona id_categoria se selecionado (opcional)
      if (formData.categoriaId) {
        produtoData.id_categoria = formData.categoriaId
      }
      
      // Adiciona promoção apenas se tiver preço promocional
      if (precoPromocional) {
        produtoData.promocao = {
          preco_promocional: precoPromocional,
          data_inicio: new Date().toISOString().split('T')[0],
          data_fim: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      }
      
      

      const response = await cadastrarProduto(produtoData)
      
      
      if (response.status) {
        
        // Garante que a mensagem seja sempre uma string
        const mensagemSucesso = typeof response.message === 'string' 
          ? response.message 
          : 'Produto cadastrado com sucesso!'
        
        setMessage({ type: 'success', text: mensagemSucesso })
        
        // Limpar formulário após 2 segundos
        setTimeout(() => {
          setFormData({
            name: '',
            description: '',
            normalPrice: '',
            promoPrice: '',
            discount: '',
            quantity: '',
            market: '',
            validUntil: '',
            image: null,
            categoriaId: null,
            categoriaNome: ''
          })
          setMessage(null)
        }, 2000)
      }
    } catch (error: any) {
      console.error('❌ Erro ao cadastrar produto:', error)
      
      let mensagemErro = 'Erro ao cadastrar produto. Tente novamente.'
      
      if (error.response?.status === 400) {
        mensagemErro = 'Dados inválidos. Verifique os campos e tente novamente.'
      } else if (error.response?.status === 401) {
        mensagemErro = 'Sessão expirada. Faça login novamente.'
      } else if (error.response?.data?.message) {
        mensagemErro = error.response.data.message
      }
      
      setMessage({ 
        type: 'error', 
        text: mensagemErro
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
          
          {/* Info do Estabelecimento - Premium */}
          {estabelecimento && (
            <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-lg border-2 border-blue-200 p-6 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                  <Store className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{estabelecimento.nome}</h3>
                  <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    CNPJ: <span className="font-mono font-semibold text-blue-700">{estabelecimento.cnpj || 'Carregando...'}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Mensagem de Feedback Premium */}
          {message && (
            <div className={`mb-6 p-5 rounded-3xl animate-fade-in shadow-lg ${
              message.type === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-800'
            }`}>
              <div className="flex items-center gap-3">
                {message.type === 'success' ? (
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                )}
                <span className="font-bold text-base">
                  {typeof message.text === 'string' 
                    ? message.text 
                    : JSON.stringify(message.text)
                  }
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-6 w-full">
              {/* Formulário Principal */}
              <div className="flex-1 space-y-6">
              {/* Header com gradiente modernizado */}
              <div className="bg-gradient-to-r from-[#F7931E] via-[#FF8C00] to-[#F7931E] rounded-3xl shadow-2xl p-8 text-white animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-xl">
                    <Gift className="w-9 h-9 drop-shadow-lg" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black mb-1" style={{textShadow: '3px 3px 10px rgba(0,0,0,0.3)'}}>Cadastrar Promoção</h1>
                    <p className="text-white text-base font-bold" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.3)'}}>Adicione ofertas imperdíveis para seus clientes</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-3 flex items-center gap-2 shadow-lg hover:bg-white/30 transition-all">
                    <TrendingDown className="w-5 h-5" />
                    <span className="font-bold">Economia Garantida</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-3 flex items-center gap-2 shadow-lg hover:bg-white/30 transition-all">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold">Ofertas Diárias</span>
                  </div>
                </div>
              </div>

              {/* Card de Informações do Produto */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-[#F9A01B]/20">
                  <div className="bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] p-2 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Informações do Produto</h2>
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
                  
                  {/* Campo de Categoria */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Tag className="w-4 h-4 text-purple-500" />
                      Categoria do Produto
                      <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">(Opcional)</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowCategoriaDropdown(!showCategoriaDropdown)
                        }}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all text-left flex items-center justify-between bg-white hover:bg-purple-50"
                      >
                        <span className={formData.categoriaNome ? 'text-gray-800' : 'text-gray-500'}>
                          {formData.categoriaNome || 'Selecione uma categoria (opcional)'}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCategoriaDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showCategoriaDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {loadingCategorias ? (
                            <div className="p-4 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                              <span className="text-sm text-gray-500">Carregando categorias...</span>
                            </div>
                          ) : categorias.length > 0 ? (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFormData(prev => ({ ...prev, categoriaId: null, categoriaNome: '' }))
                                  setShowCategoriaDropdown(false)
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 text-gray-500 italic"
                              >
                                Nenhuma categoria
                              </button>
                              {categorias.map((categoria) => (
                                <button
                                  key={categoria.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      categoriaId: categoria.id, 
                                      categoriaNome: categoria.nome 
                                    }))
                                    setShowCategoriaDropdown(false)
                                  }}
                                  className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                    formData.categoriaId === categoria.id ? 'bg-purple-50 text-purple-700 font-medium' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-purple-500" />
                                    {categoria.nome}
                                  </div>
                                </button>
                              ))}
                            </>
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">Nenhuma categoria disponível</p>
                              <p className="text-xs text-gray-400 mt-1">Cadastre categorias primeiro</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de Preços e Descontos Premium */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Percent className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Preços e Desconto</h2>
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

              {/* Upload de Imagem Premium */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Imagem do Produto</h2>
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

              {/* Botão de Cadastrar Premium */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#F7931E] via-[#FF8C00] to-[#F7931E] hover:from-[#FF8C00] hover:via-[#F7931E] hover:to-[#FF8C00] text-white font-black py-6 rounded-3xl hover:shadow-2xl transform hover:scale-[1.02] transition-all text-xl flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in" style={{animationDelay: '0.4s'}}
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

            {/* Preview Card Premium */}
            <div className="w-96 space-y-4">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 sticky top-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
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