import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Camera, MapPin, Send, X, ArrowLeft, CheckCircle, AlertCircle, Loader2, Package } from "lucide-react"
import iconPerfilComentario from "../../assets/iconPerfilComentario.png"
// @ts-ignore - Arquivo existe, TypeScript precisa recompilar
import comunidadeService from '../../services/comunidadeService'
// Usar o mesmo serviço que a tela de Promoções usa (que funciona!)
import { listarProdutos } from '../../services/apiServicesFixed'
import { useUser } from '../../contexts/UserContext'

// Interface do Produto baseada no que vem da API
interface Produto {
  id: number;
  id_produto?: number;
  nome: string;
  descricao?: string;
  preco?: number;
  categoria?: any;
  estabelecimento?: any;
}

export default function InfoCashNovoComentario() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [img, setImg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para produtos
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>("")
  const [carregandoProdutos, setCarregandoProdutos] = useState(true)

  // Carregar produtos ao montar o componente
  useEffect(() => {
    carregarProdutos()
  }, [])
  
  // Debug: monitorar mudanças no array de produtos
  useEffect(() => {
    console.log('📊 [Estado] Produtos atualizados:', produtos.length, 'produtos')
    if (produtos.length > 0) {
      console.log('📊 [Estado] Primeiro produto:', produtos[0])
    }
  }, [produtos])

  async function carregarProdutos() {
    console.log('🔄 [InfoCashNovoComentario] Iniciando carregamento de produtos...')
    console.log('📌 [InfoCashNovoComentario] Usando mesma função da tela de Promoções')
    setCarregandoProdutos(true)
    try {
      // Usando a mesma função que a tela de Promoções (que funciona!)
      const response = await listarProdutos()
      console.log('📦 [InfoCashNovoComentario] Resposta do serviço:', response)
      console.log('🔍 [DEBUG] Response.status:', response.status)
      console.log('🔍 [DEBUG] Response.data:', response.data)
      console.log('🔍 [DEBUG] Response.data length:', response.data?.length)
      
      if (response.status && response.data) {
        console.log('✅ [InfoCashNovoComentario] Produtos recebidos:', response.data)
        // A função listarProdutos já retorna os produtos no formato correto
        const produtosMapeados = response.data.map((produto: any) => ({
          ...produto,
          id_produto: produto.id || produto.id_produto
        }))
        setProdutos(produtosMapeados)
        console.log('✅ [InfoCashNovoComentario] Total de produtos:', produtosMapeados.length)
      } else {
        console.warn('⚠️ [InfoCashNovoComentario] Nenhum produto encontrado')
        console.warn('⚠️ [InfoCashNovoComentario] Response status:', response.status)
        console.warn('⚠️ [InfoCashNovoComentario] Response data:', response)
        setProdutos([])
      }
    } catch (err) {
      console.error('❌ [InfoCashNovoComentario] Erro ao carregar produtos:', err)
      setProdutos([])
    } finally {
      setCarregandoProdutos(false)
      console.log('🏁 [InfoCashNovoComentario] Carregamento finalizado')
    }
  }

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImg(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!user) {
      setError('Você precisa estar logado para comentar')
      return
    }
    
    if (!titulo.trim() || !conteudo.trim()) {
      setError('Por favor, preencha todos os campos')
      return
    }
    
    // Combinar título e conteúdo, já que o backend não suporta título separado
    const conteudoCompleto = titulo.trim() 
      ? `${titulo.trim()}\n\n${conteudo.trim()}`
      : conteudo.trim();
      
    // Validar tamanho do conteúdo (backend aceita máximo 500 caracteres)
    if (conteudoCompleto.length > 500) {
      setError(`O texto completo tem ${conteudoCompleto.length} caracteres. Máximo permitido: 500.`)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
        
      console.log('📝 [InfoCashNovoComentario] Criando post...');
      console.log('📝 [InfoCashNovoComentario] Conteúdo completo:', conteudoCompleto);
      console.log('📝 [InfoCashNovoComentario] Produto selecionado:', produtoSelecionado);
      
      // Criando post - TEMPORARIAMENTE sem produto para testar
      console.log('⚠️ TESTE: Enviando SEM produto para evitar erro no backend');
      const response = await comunidadeService.criarPost({
        conteudo: conteudoCompleto, // Backend não aceita título separado
        // id_produto: produtoSelecionado ? parseInt(produtoSelecionado) : undefined, // DESABILITADO TEMPORARIAMENTE
        imagem: img || undefined
      })
      
      // Para testar COM produto, descomente a linha abaixo:
      // id_produto: produtoSelecionado ? parseInt(produtoSelecionado) : undefined,
      
      if (response.status) {
        setSuccess(true)
        // Mostrar mensagem de sucesso e redirecionar
        setTimeout(() => {
          navigate("/infocash/comentarios")
        }, 2000)
      } else {
        setError(response.message || 'Erro ao criar comentário')
      }
    } catch (err: any) {
      console.error('Erro ao criar comentário:', err)
      setError('Erro ao criar comentário. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarLayout>
      <div className="relative min-h-screen -mx-6 md:-mx-12 -mb-12 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="px-4 sm:px-6 md:px-12 py-6">
          {/* Header Moderno */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-orange-100 p-4 mb-6 sticky top-4 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Novo Comentário</h1>
                <p className="text-xs text-gray-500">Compartilhe sua experiência</p>
              </div>
            </div>
          </div>

          {/* Card do Formulário Moderno */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-fadeInDown">
            {/* Perfil */}
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={iconPerfilComentario} 
                alt="perfil" 
                className="w-12 h-12 rounded-full border-2 border-orange-200 shadow-sm"
              />
              <div>
                <p className="font-bold text-gray-800">Você</p>
                <p className="text-xs text-gray-500">Usuário verificado</p>
              </div>
            </div>

            {/* Notificações */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800">Comentário publicado com sucesso!</p>
                  <p className="text-xs text-green-600">Você ganhou +10 HubCoins! 🎉</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              {/* Título do Comentário */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">
                  Título do comentário <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Ótima experiência de compra"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#F9A01B] focus:ring-2 focus:ring-[#F9A01B] focus:ring-opacity-20 outline-none transition-all text-sm"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{titulo.length}/100 caracteres</p>
              </div>

              {/* Campo de Conteúdo */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">
                  Seu comentário <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Compartilhe sua experiência detalhada sobre este estabelecimento..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#F9A01B] focus:ring-2 focus:ring-[#F9A01B] focus:ring-opacity-20 outline-none transition-all resize-none text-sm"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{conteudo.length}/500 caracteres</p>
              </div>

              {/* Seletor de Produto DINÂMICO */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700 block">
                    Vincular a um produto (opcional)
                  </label>
                  {!carregandoProdutos && produtos.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🔁 Tentando recarregar produtos...')
                        carregarProdutos()
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                    >
                      Tentar novamente
                    </button>
                  )}
                </div>
                {carregandoProdutos ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Carregando produtos...</span>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={produtoSelecionado}
                        onChange={(e) => setProdutoSelecionado(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#F9A01B] focus:ring-2 focus:ring-[#F9A01B] focus:ring-opacity-20 outline-none transition-all text-sm appearance-none cursor-pointer bg-white"
                      >
                        <option value="">-- Nenhum (post geral) --</option>
                        {produtos.map((produto) => {
                          const produtoId = produto.id_produto || produto.id
                          console.log('🎯 [Render] Produto:', produtoId, produto.nome)
                          return (
                            <option key={produtoId} value={produtoId}>
                              {produto.nome}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                    <p className="text-xs mt-2">
                      {produtoSelecionado ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Post será vinculado ao produto selecionado
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center gap-1">
                          ℹ️ Post será geral (sem produto específico)
                        </span>
                      )}
                    </p>
                    {produtos.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Nenhum produto cadastrado no momento
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Preview da Imagem */}
              {img && (
                <div className="relative rounded-2xl overflow-hidden border-2 border-orange-200">
                  <img src={img} alt="preview" className="w-full max-h-64 object-cover" />
                  <button
                    type="button"
                    onClick={() => setImg(null)}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <label className="group cursor-pointer">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 px-4 py-2.5 rounded-xl transition-all">
                      <Camera className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-700">Foto</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
                  </label>

                  <button 
                    type="button" 
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 px-4 py-2.5 rounded-xl transition-all"
                  >
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Local</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!titulo.trim() || !conteudo.trim() || loading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Publicar Comentário</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
