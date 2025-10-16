import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Package, DollarSign, Hash, FileText, ShoppingCart, TrendingDown, Percent, Calendar, Store, Image, CheckCircle, Sparkles, Gift, Zap, AlertCircle, Tag, ChevronDown } from 'lucide-react'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { useUser } from "../../contexts/UserContext"
import { cadastrarProduto, cadastrarEstabelecimento, cadastrarEnderecoEstabelecimento, listarCategorias } from "../../services/apiServicesFixed"
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
      const estabelecimentoUserId = localStorage.getItem('estabelecimentoUserId')

      // Se existe estabelecimento mas é de outro usuário, limpa o localStorage
      if (estabelecimentoUserId && parseInt(estabelecimentoUserId) !== user.id) {
        console.log('🧹 Limpando estabelecimento de outro usuário:', estabelecimentoUserId, '!==', user.id)
        localStorage.removeItem('estabelecimentoId')
        localStorage.removeItem('estabelecimentoNome')
        localStorage.removeItem('estabelecimentoUserId')
      }
      // Se tem estabelecimento do usuário atual, usa ele
      else if (estabelecimentoId && estabelecimentoNome && estabelecimentoUserId && parseInt(estabelecimentoUserId) === user.id) {
        console.log('✅ Usando estabelecimento existente do usuário:', user.id)
        setEstabelecimento({
          id: parseInt(estabelecimentoId),
          nome: estabelecimentoNome
        })
        setTemEstabelecimento(true)
        setVerificandoEstabelecimento(false)
        return
      }

      // Se não tem estabelecimento, cria automaticamente
      try {
        console.log('🏢 Usuário sem estabelecimento, criando automaticamente para usuário ID:', user.id)
        
        const cnpjUnico = gerarCNPJUnico(user.id)
        const novoEstabelecimento = {
          nome: user.nome ? `${user.nome} - Estabelecimento` : 'Meu Estabelecimento',
          cnpj: cnpjUnico,
          telefone: user.telefone || '(00) 0000-0000'
        }

        console.log('🏢 Criando estabelecimento com CNPJ único:', cnpjUnico)
        const response = await cadastrarEstabelecimento(novoEstabelecimento)
        
        if (response.status && response.id) {
          // Salva no localStorage com ID do usuário para validação
          localStorage.setItem('estabelecimentoId', response.id.toString())
          localStorage.setItem('estabelecimentoNome', novoEstabelecimento.nome)
          localStorage.setItem('estabelecimentoUserId', user.id.toString())
          
          setEstabelecimento({
            id: response.id,
            nome: novoEstabelecimento.nome
          })
          setTemEstabelecimento(true)
          
          console.log('✅ Estabelecimento criado automaticamente:', response.id, 'para usuário:', user.id)
          
          // Agora cria um endereço padrão para o estabelecimento
          try {
            console.log('📍 Criando endereço padrão para o estabelecimento automático...')
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
            
            console.log('📍 Payload do endereço automático:', enderecoData)
            const enderecoResponse = await cadastrarEnderecoEstabelecimento(enderecoData)
            
            if (enderecoResponse && enderecoResponse.status) {
              console.log('✅ Endereço padrão criado para o estabelecimento automático!')
            } else {
              console.log('⚠️ Resposta inválida ao criar endereço padrão:', enderecoResponse)
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
    console.log('🚀 useEffect EXECUTADO - Iniciando carregamento de categorias')
    
    const carregarCategorias = async () => {
      try {
        console.log('🔄 Definindo loading como true')
        setLoadingCategorias(true)
        
        console.log('📞 Chamando listarCategorias()')
        const response = await listarCategorias()
        console.log('📋 Resposta recebida:', response)
        
        if (response.status && response.data) {
          console.log('✅ Definindo categorias no estado:', response.data)
          setCategorias(response.data)
          console.log('✅ Categorias carregadas:', response.data.length, 'categorias')
        } else {
          console.log('⚠️ Resposta inválida, definindo array vazio')
          console.log('⚠️ Status:', response.status)
          console.log('⚠️ Data:', response.data)
          setCategorias([])
        }
      } catch (error: any) {
        console.error('❌ ERRO no carregamento:', error)
        console.error('❌ Tipo do erro:', typeof error)
        console.error('❌ Mensagem:', error.message)
        console.error('❌ Stack:', error.stack)
        setCategorias([])
      } finally {
        console.log('🏁 Definindo loading como false')
        setLoadingCategorias(false)
      }
    }

    carregarCategorias()
  }, [])

  // Fechar dropdown ao clicar fora (TEMPORARIAMENTE DESABILITADO PARA DEBUG)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Temporariamente desabilitado para debug
      console.log('🖱️ Click outside detectado, mas ignorado para debug')
      // if (showCategoriaDropdown) {
      //   setShowCategoriaDropdown(false)
      // }
    }

    if (showCategoriaDropdown) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showCategoriaDropdown])

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
        console.log('📋 Categoria selecionada - ID:', formData.categoriaId, 'Nome:', formData.categoriaNome)
      }
      
      // Adiciona promoção apenas se tiver preço promocional
      if (precoPromocional) {
        produtoData.promocao = {
          preco_promocional: precoPromocional,
          data_inicio: new Date().toISOString().split('T')[0],
          data_fim: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      }
      
      console.log('📦 Payload no formato exato solicitado:', produtoData)
      console.log('🔍 Campos do payload:', {
        nome: produtoData.nome,
        nome_length: produtoData.nome.length,
        descricao: produtoData.descricao,
        descricao_length: produtoData.descricao.length,
        id_categoria: produtoData.id_categoria,
        id_estabelecimento: produtoData.id_estabelecimento,
        preco: produtoData.preco,
        tem_promocao: !!produtoData.promocao
      })
      
      if (produtoData.promocao) {
        console.log('🎁 Dados da promoção:', produtoData.promocao)
      }

      const response = await cadastrarProduto(produtoData)
      
      console.log('✅ Resposta do cadastro:', response)
      
      if (response.status) {
        const produtoId = response.id
        console.log('✅ ID do produto cadastrado:', produtoId)
        
        setMessage({ type: 'success', text: `Produto cadastrado com sucesso! ID: ${produtoId}` })
        
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
                  
                  {/* Campo de Categoria */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Tag className="w-4 h-4 text-purple-500" />
                      Categoria do Produto
                      <span className="text-xs text-gray-500 font-normal">(Opcional)</span>
                      <button
                        type="button"
                        onClick={() => {
                          console.log('🔧 DEBUG: Forçando toggle do dropdown')
                          console.log('🔧 Estado atual:', showCategoriaDropdown)
                          console.log('🔧 Categorias:', categorias.length)
                          setShowCategoriaDropdown(prev => {
                            console.log('🔧 Mudando de', prev, 'para', !prev)
                            return !prev
                          })
                        }}
                        className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        🔧 Toggle
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          console.log('🔄 FORÇANDO carregamento manual de categorias')
                          try {
                            setLoadingCategorias(true)
                            const response = await listarCategorias()
                            console.log('📋 Resposta manual:', response)
                            
                            if (response.status && response.data) {
                              setCategorias(response.data)
                              console.log('✅ Categorias definidas manualmente:', response.data.length)
                              alert(`✅ Sucesso! ${response.data.length} categorias carregadas`)
                            } else {
                              console.log('⚠️ Resposta manual inválida')
                              alert('❌ Resposta inválida da API')
                            }
                          } catch (error) {
                            console.error('❌ Erro manual:', error)
                            alert('❌ Erro ao carregar categorias')
                          } finally {
                            setLoadingCategorias(false)
                          }
                        }}
                        className="ml-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        🔄 Carregar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          console.log('🧹 LIMPANDO localStorage do estabelecimento')
                          localStorage.removeItem('estabelecimentoId')
                          localStorage.removeItem('estabelecimentoNome')
                          localStorage.removeItem('estabelecimentoUserId')
                          alert('🧹 localStorage limpo! Recarregue a página para criar novo estabelecimento.')
                        }}
                        className="ml-1 px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                      >
                        🧹 Limpar
                      </button>
                    </label>
                    <div className="relative">
                      {/* Indicador de estado para debug */}
                      <div className="mb-2 text-xs">
                        <span className={`px-2 py-1 rounded ${showCategoriaDropdown ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          Dropdown: {showCategoriaDropdown ? 'ABERTO' : 'FECHADO'}
                        </span>
                        <span className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-800">
                          Categorias: {categorias.length}
                        </span>
                        <span className="ml-2 px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                          Loading: {loadingCategorias ? 'SIM' : 'NÃO'}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          console.log('🖱️ Clique no dropdown - Estado atual:', showCategoriaDropdown)
                          console.log('🖱️ Categorias disponíveis:', categorias.length)
                          console.log('🖱️ Loading:', loadingCategorias)
                          setShowCategoriaDropdown(!showCategoriaDropdown)
                          console.log('🖱️ Novo estado será:', !showCategoriaDropdown)
                        }}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all text-left flex items-center justify-between bg-white hover:bg-gray-50"
                      >
                        <span className={formData.categoriaNome ? 'text-gray-800' : 'text-gray-500'}>
                          {formData.categoriaNome || 'Selecione uma categoria (opcional)'}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCategoriaDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showCategoriaDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {(() => {
                            console.log('🎨 RENDERIZANDO DROPDOWN')
                            console.log('🎨 Loading:', loadingCategorias)
                            console.log('🎨 Categorias:', categorias)
                            console.log('🎨 Quantidade:', categorias.length)
                            return null
                          })()}
                          {loadingCategorias ? (
                            <div className="p-4 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                              <span className="text-sm text-gray-500">Carregando categorias...</span>
                            </div>
                          ) : categorias.length > 0 ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
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
                                  onClick={() => {
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