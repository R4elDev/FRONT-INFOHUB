import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Building2, Mail, Phone, Save, X, Loader2, Settings, ArrowLeft, LogOut, CheckCircle, AlertCircle, Sparkles, LayoutDashboard, MapPin } from "lucide-react"
import { atualizarEmpresa, obterDadosUsuario, buscarDadosEstabelecimentoAtualizado } from "../../services/apiServicesFixed"
import type { atualizarEmpresaRequest } from "../../services/types"

// Animações CSS
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
if (!document.head.querySelector('style[data-perfil-empresa-animations]')) {
  styles.setAttribute('data-perfil-empresa-animations', 'true')
  document.head.appendChild(styles)
}

function PerfilEmpresa() {
  const navigate = useNavigate()
  const [nome, setNome] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [cnpj, setCnpj] = useState<string>("")
  const [telefone, setTelefone] = useState<string>("")
  const [cep, setCep] = useState<string>("")
  const [rua, setRua] = useState<string>("")
  const [numero, setNumero] = useState<string>("")
  const [bairro, setBairro] = useState<string>("")
  const [cidade, setCidade] = useState<string>("")
  const [estado, setEstado] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingCep, setLoadingCep] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  // Carrega dados da empresa ao montar o componente
  useEffect(() => {
    const carregarDados = async () => {
      console.log('🔍 [PerfilEmpresa] Carregando dados da API...')
      setLoading(true)
      
      try {
        // Busca dados atualizados da API
        const dadosAtualizados = await buscarDadosEstabelecimentoAtualizado()
        console.log('✅ [PerfilEmpresa] Dados recebidos:', dadosAtualizados)
        
        if (dadosAtualizados) {
          setNome(dadosAtualizados.nome || "")
          setEmail(dadosAtualizados.email || "")
          setCnpj(dadosAtualizados.cnpj || "")
          setTelefone(dadosAtualizados.telefone || "")
          
          // Carregar endereço do localStorage se existir
          const enderecoSalvo = localStorage.getItem('endereco_empresa')
          if (enderecoSalvo) {
            try {
              const enderecoData = JSON.parse(enderecoSalvo)
              setCep(enderecoData.cep || "")
              setRua(enderecoData.rua || "")
              setNumero(enderecoData.numero || "")
              setBairro(enderecoData.bairro || "")
              setCidade(enderecoData.cidade || "")
              setEstado(enderecoData.estado || "")
            } catch (e) {
              console.error('Erro ao carregar endereço:', e)
            }
          }
          
          console.log('📋 [PerfilEmpresa] Campos preenchidos:', {
            nome: dadosAtualizados.nome,
            email: dadosAtualizados.email,
            cnpj: dadosAtualizados.cnpj,
            telefone: dadosAtualizados.telefone,
            endereco: dadosAtualizados.endereco
          })
        }
      } catch (error) {
        console.error('❌ [PerfilEmpresa] Erro ao carregar dados:', error)
        // Fallback para localStorage
        const dadosUsuario = obterDadosUsuario()
        if (dadosUsuario) {
          setNome(dadosUsuario.nome || "")
          setEmail(dadosUsuario.email || "")
          setCnpj(dadosUsuario.cnpj || "")
          setTelefone(dadosUsuario.telefone || "")
          
          // Carregar endereço do localStorage
          const enderecoSalvo = localStorage.getItem('endereco_empresa')
          if (enderecoSalvo) {
            try {
              const enderecoData = JSON.parse(enderecoSalvo)
              setCep(enderecoData.cep || "")
              setRua(enderecoData.rua || "")
              setNumero(enderecoData.numero || "")
              setBairro(enderecoData.bairro || "")
              setCidade(enderecoData.cidade || "")
              setEstado(enderecoData.estado || "")
            } catch (e) {
              console.error('Erro ao carregar endereço:', e)
            }
          }
        }
      } finally {
        setLoading(false)
      }
    }
    
    carregarDados()
  }, [])

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 5000)
  }

  const buscarCep = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return

    setLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        showMessage("CEP não encontrado", "error")
        return
      }

      setRua(data.logradouro || "")
      setBairro(data.bairro || "")
      setCidade(data.localidade || "")
      setEstado(data.uf || "")
      showMessage("Endereço preenchido automaticamente!", "success")
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      showMessage("Erro ao buscar CEP", "error")
    } finally {
      setLoadingCep(false)
    }
  }

  const handleSalvar = async () => {
    // Validações básicas
    if (!nome.trim()) {
      showMessage("Nome da empresa é obrigatório", "error")
      return
    }
    if (!email.trim()) {
      showMessage("Email é obrigatório", "error")
      return
    }

    setLoading(true)
    try {
      const payload: atualizarEmpresaRequest = {
        nome: nome.trim(),
        email: email.trim(),
      }

      // Adiciona campos opcionais apenas se preenchidos
      if (cnpj.trim()) {
        // Remove formatação do CNPJ (apenas números)
        const cnpjLimpo = cnpj.replace(/\D/g, '')
        payload.cnpj = cnpjLimpo
      }
      if (telefone.trim()) {
        // Remove formatação do telefone (apenas números)
        const telefoneLimpo = telefone.replace(/\D/g, '')
        payload.telefone = telefoneLimpo
      }

      const response = await atualizarEmpresa(payload)
      
      if (response.status) {
        // Salvar endereço no localStorage
        const enderecoData = {
          cep,
          rua,
          numero,
          bairro,
          cidade,
          estado,
          enderecoCompleto: `${rua}, ${numero} - ${bairro}, ${cidade} - ${estado}`
        }
        localStorage.setItem('endereco_empresa', JSON.stringify(enderecoData))
        
        showMessage("Perfil da empresa atualizado com sucesso!", "success")
        
        // Recarrega dados atualizados da API
        console.log('🔄 [PerfilEmpresa] Recarregando dados da API...')
        try {
          const dadosAtualizados = await buscarDadosEstabelecimentoAtualizado()
          if (dadosAtualizados) {
            setNome(dadosAtualizados.nome || "")
            setEmail(dadosAtualizados.email || "")
            setCnpj(dadosAtualizados.cnpj || "")
            setTelefone(dadosAtualizados.telefone || "")
            console.log('✅ [PerfilEmpresa] Dados recarregados com sucesso')
          }
        } catch (error) {
          console.error('⚠️ [PerfilEmpresa] Erro ao recarregar dados:', error)
        }
        
      } else {
        showMessage(response.message || "Erro ao atualizar perfil", "error")
      }
    } catch (error: any) {
      console.error("Erro ao atualizar perfil da empresa:", error)
      showMessage(error.response?.data?.message || "Erro ao atualizar perfil", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = () => {
    // Recarrega dados originais
    const dadosUsuario = obterDadosUsuario()
    if (dadosUsuario) {
      setNome(dadosUsuario.nome || "")
      setEmail(dadosUsuario.email || "")
      setCnpj(dadosUsuario.cnpj || "")
      setTelefone(dadosUsuario.telefone || "")
    }
    
    // Recarregar endereço
    const enderecoSalvo = localStorage.getItem('endereco_empresa')
    if (enderecoSalvo) {
      try {
        const enderecoData = JSON.parse(enderecoSalvo)
        setCep(enderecoData.cep || "")
        setRua(enderecoData.rua || "")
        setNumero(enderecoData.numero || "")
        setBairro(enderecoData.bairro || "")
        setCidade(enderecoData.cidade || "")
        setEstado(enderecoData.estado || "")
      } catch (e) {
        console.error('Erro ao carregar endereço:', e)
      }
    }
    
    setMessage("")
    setMessageType("")
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header Premium */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard-empresa')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                  title="Ir ao Dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-4xl font-black text-white" style={{textShadow: '3px 3px 10px rgba(0,0,0,0.3)'}}>
                    Perfil da Empresa
                  </h1>
                  <p className="text-white text-base font-bold mt-1" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.3)'}}>Gerencie as informações da sua empresa</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard-empresa')}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all flex items-center gap-2"
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5 text-white" />
                  <span className="text-white font-medium text-sm">Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/configuracoes-empresa')}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                  title="Configurações"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.clear()
                    navigate('/login')
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/90 hover:bg-red-600 rounded-xl transition-all"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4 text-white" />
                  <span className="text-white font-medium text-sm">Sair</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mensagem de Feedback Premium */}
          {message && (
            <div className={`mb-6 p-5 rounded-3xl animate-fade-in shadow-lg ${
              messageType === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-3">
                {messageType === 'success' ? (
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                )}
                <span className="font-bold text-base">{message}</span>
              </div>
            </div>
          )}

          {/* Card Principal Premium */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100 animate-fade-in" style={{animationDelay: '0.1s'}}>
            {/* Banner Superior Gradiente */}
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-40 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
              <div className="absolute -bottom-20 left-8">
                <div className="w-40 h-40 rounded-3xl bg-white p-3 shadow-2xl border-4 border-white">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl">
                    <Building2 className="w-20 h-20 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="pt-24 px-6 md:px-10 pb-10">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
                    <Building2 className="w-4 h-4" />
                    Pessoa Jurídica
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
                    <CheckCircle className="w-4 h-4" />
                    Verificado
                  </span>
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-1">{nome || "Sua Empresa"}</h2>
                <p className="text-gray-600 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {email || "email@empresa.com"}
                </p>
              </div>

              {/* Formulário Organizado */}
              <div className="space-y-6">
                {/* Seção: Dados Principais */}
                <div>
                  <h3 className="text-xl font-black text-gray-800 mb-6 pb-3 border-b-2 border-blue-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    Dados da Empresa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome da Empresa */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Empresa *</label>
                      <div className="relative group">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
                        <input
                          type="text"
                          placeholder="Digite o nome da empresa"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-gray-50 focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Corporativo *</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
                        <input
                          type="email"
                          placeholder="email@empresa.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-gray-50 focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* CNPJ */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CNPJ</label>
                      <input
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-gray-50 focus:bg-white"
                        maxLength={18}
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
                        <input
                          type="tel"
                          placeholder="(00) 00000-0000"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Seção: Endereço */}
                <div>
                  <h3 className="text-xl font-black text-gray-800 mb-6 pb-3 border-b-2 border-green-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    Endereço da Empresa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CEP */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CEP</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400 group-focus-within:text-green-600 transition-colors" />
                        <input
                          type="text"
                          placeholder="00000-000"
                          value={cep}
                          onChange={(e) => {
                            const valor = e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2')
                            setCep(valor)
                            if (valor.replace(/\D/g, '').length === 8) {
                              buscarCep(valor)
                            }
                          }}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all bg-gray-50 focus:bg-white"
                          maxLength={9}
                        />
                        {loadingCep && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-green-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">🔍 Digite o CEP para buscar automaticamente</p>
                    </div>

                    {/* Rua */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Rua/Avenida</label>
                      <input
                        type="text"
                        placeholder="Nome da rua"
                        value={rua}
                        onChange={(e) => setRua(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>

                    {/* Número */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Número</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>

                    {/* Bairro */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro</label>
                      <input
                        type="text"
                        placeholder="Nome do bairro"
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>

                    {/* Cidade */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade</label>
                      <input
                        type="text"
                        placeholder="Nome da cidade"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                      <input
                        type="text"
                        placeholder="UF"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all bg-gray-50 focus:bg-white"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Informação sobre senha */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-2">Alterar Senha</h4>
                      <p className="text-sm text-gray-600 mb-3">Para alterar sua senha, acesse a página de Configurações.</p>
                      <button
                        type="button"
                        onClick={() => navigate('/configuracoes-empresa')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-bold transition-all hover:scale-105 shadow-lg text-sm flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Ir para Configurações
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação Premium */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-2 border-gray-100 mt-8">
                  <button
                    type="button"
                    onClick={handleSalvar}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-black py-5 px-8 rounded-3xl transition-all hover:scale-105 hover:shadow-2xl shadow-xl flex items-center justify-center gap-3 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelar}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:from-gray-50 disabled:to-gray-50 text-gray-700 font-black py-5 px-8 rounded-3xl transition-all hover:scale-105 flex items-center justify-center gap-3 border-2 border-gray-300 shadow-lg text-lg"
                  >
                    <X className="w-5 h-5" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default PerfilEmpresa
