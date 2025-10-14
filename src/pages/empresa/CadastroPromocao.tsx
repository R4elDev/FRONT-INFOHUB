import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Package, DollarSign, Hash, FileText, ShoppingCart, TrendingDown, Percent, Calendar, Store, Image, CheckCircle, Sparkles, Gift, Zap, AlertCircle, Tag, Plus } from 'lucide-react'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { useUser } from "../../contexts/UserContext"
import { cadastrarProduto, cadastrarCategoria } from "../../services/apiServicesFixed"
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
    categoria: '',
    image: null
  })
  
  const [loading, setLoading] = useState(false)
  const [verificandoEstabelecimento, setVerificandoEstabelecimento] = useState(true)
  const [temEstabelecimento, setTemEstabelecimento] = useState(false)
  const [estabelecimento, setEstabelecimento] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Estados para categorias
  const [categorias, setCategorias] = useState<Array<{ id: number; nome: string }>>([
    { id: 1, nome: "Alimentos e Bebidas" },
    { id: 2, nome: "Eletrônicos" },
    { id: 3, nome: "Roupas e Acessórios" },
    { id: 4, nome: "Casa e Decoração" },
    { id: 5, nome: "Saúde e Beleza" },
    { id: 6, nome: "Esportes e Lazer" },
    { id: 7, nome: "Livros e Papelaria" },
    { id: 8, nome: "Automotivo" },
    { id: 9, nome: "Pet Shop" },
    { id: 10, nome: "Outros" }
  ])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | ''>('')
  const [novaCategoria, setNovaCategoria] = useState('')
  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false)
  const [carregandoCategorias, setCarregandoCategorias] = useState(false)

  // Verificar se usuário tem estabelecimento ao carregar
  useEffect(() => {
    if (user?.perfil !== 'estabelecimento') {
      setVerificandoEstabelecimento(false)
      return
    }

    // Busca estabelecimento do localStorage
    const estabelecimentoId = localStorage.getItem('estabelecimentoId')
    const estabelecimentoNome = localStorage.getItem('estabelecimentoNome')
    
    if (estabelecimentoId && estabelecimentoNome) {
      setTemEstabelecimento(true)
      setEstabelecimento({
        id: parseInt(estabelecimentoId),
        nome: estabelecimentoNome,
        cnpj: user?.cnpj || '',
        telefone: user?.telefone || ''
      })
      console.log('🏢 Estabelecimento carregado:', {
        id: estabelecimentoId,
        nome: estabelecimentoNome,
        cnpj: user?.cnpj
      })
    } else {
      // Redirecionar para cadastro de estabelecimento
      navigate('/empresa/cadastro-estabelecimento')
    }
    
    setVerificandoEstabelecimento(false)
  }, [user, navigate])

  // Carregar categorias disponíveis (usando categorias padrão por enquanto)
  useEffect(() => {
    // Como os endpoints de categoria não existem, usamos categorias padrão
    console.log('📋 Usando categorias padrão:', categorias)
  }, [])

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

  // Função para criar nova categoria
  const handleCriarNovaCategoria = async () => {
    if (!novaCategoria.trim()) {
      setMessage({ type: 'error', text: 'Digite o nome da categoria' })
      return
    }

    try {
      setCarregandoCategorias(true)
      
      // Tenta criar via API, mas se falhar, cria localmente
      try {
        const response = await cadastrarCategoria({ nome: novaCategoria.trim() })
        
        if (response.status && response.data) {
          // API funcionou - usa ID real
          const novaCategoriaCriada = response.data
          setCategorias(prev => [...prev, novaCategoriaCriada])
          setCategoriaSelecionada(novaCategoriaCriada.id)
          setMessage({ type: 'success', text: 'Categoria criada com sucesso!' })
          console.log('✅ Nova categoria criada via API:', novaCategoriaCriada)
        }
      } catch (apiError) {
        // API não funcionou - cria categoria local
        console.log('ℹ️ Endpoint de categoria não disponível, criando categoria local')
        const novoId = Math.max(...categorias.map(c => c.id)) + 1
        const novaCategoriaCriada = {
          id: novoId,
          nome: novaCategoria.trim()
        }
        setCategorias(prev => [...prev, novaCategoriaCriada])
        setCategoriaSelecionada(novaCategoriaCriada.id)
        setMessage({ type: 'success', text: 'Categoria adicionada à lista!' })
        console.log('✅ Nova categoria criada localmente:', novaCategoriaCriada)
      }
      
      setNovaCategoria('')
      setMostrarNovaCategoria(false)
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000)
      
    } catch (error) {
      console.error('Erro ao processar categoria:', error)
      setMessage({ type: 'error', text: 'Erro ao processar categoria. Tente novamente.' })
    } finally {
      setCarregandoCategorias(false)
    }
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

      // Validar ID do estabelecimento
      if (!estabelecimento?.id) {
        setMessage({ type: 'error', text: 'ID do estabelecimento não encontrado. Faça logout e login novamente.' })
        return
      }

      // Validar categoria
      let idCategoria = categoriaSelecionada
      if (!idCategoria) {
        setMessage({ type: 'error', text: 'Selecione uma categoria para o produto' })
        return
      }

      // Monta payload base (COM id_categoria)
      const produtoData: produtoRequest = {
        nome: formData.name.trim(),
        descricao: formData.description.trim(),
        id_categoria: Number(idCategoria),
        id_estabelecimento: estabelecimento.id,
        preco: preco
      }
      
      // Adiciona promoção apenas se tiver preço promocional
      if (precoPromocional) {
        produtoData.promocao = {
          preco_promocional: precoPromocional,
          data_inicio: new Date().toISOString().split('T')[0],
          data_fim: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      }
      
      console.log('📦 Payload COMPLETO do produto:', produtoData)
      console.log('🔍 Campos individuais:', {
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
            categoria: '',
            image: null
          })
          setCategoriaSelecionada('')
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
                      Categoria *
                    </label>
                    <div className="space-y-3">
                      {/* Dropdown de categorias existentes */}
                      <div className="flex gap-2">
                        <select
                          value={categoriaSelecionada}
                          onChange={(e) => setCategoriaSelecionada(e.target.value === '' ? '' : Number(e.target.value))}
                          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all"
                          disabled={carregandoCategorias}
                        >
                          <option value="">Selecione uma categoria</option>
                          {categorias.map(categoria => (
                            <option key={categoria.id} value={categoria.id}>
                              {categoria.nome}
                            </option>
                          ))}
                        </select>
                        
                        <button
                          type="button"
                          onClick={() => setMostrarNovaCategoria(!mostrarNovaCategoria)}
                          className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all flex items-center gap-2"
                          disabled={carregandoCategorias}
                        >
                          <Plus className="w-4 h-4" />
                          Nova
                        </button>
                      </div>
                      
                      {carregandoCategorias && (
                        <div className="flex items-center gap-2 text-purple-600 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          Carregando categorias...
                        </div>
                      )}
                      
                      {/* Indicador de categoria selecionada */}
                      {categoriaSelecionada && !mostrarNovaCategoria && (
                        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          Categoria selecionada: {categorias.find(c => c.id === categoriaSelecionada)?.nome}
                        </div>
                      )}
                      
                      {/* Campo para criar nova categoria */}
                      {mostrarNovaCategoria && (
                        <div className="flex gap-2 p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
                          <input
                            type="text"
                            value={novaCategoria}
                            onChange={(e) => setNovaCategoria(e.target.value)}
                            placeholder="Nome da nova categoria"
                            className="flex-1 px-3 py-2 rounded-lg border border-purple-300 focus:border-purple-500 focus:outline-none"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleCriarNovaCategoria()
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleCriarNovaCategoria}
                            disabled={!novaCategoria.trim() || carregandoCategorias}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg transition-all text-sm"
                          >
                            {carregandoCategorias ? '...' : 'Criar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMostrarNovaCategoria(false)
                              setNovaCategoria('')
                            }}
                            className="px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-all text-sm"
                          >
                            Cancelar
                          </button>
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
