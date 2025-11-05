import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { 
  Settings, 
  Bell, 
  Shield, 
  Building2,
  Mail, 
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { obterDadosUsuario, atualizarEmpresa, buscarDadosCompletosDaAPI, buscarDadosEstabelecimento, buscarDadosUsuarioDireto } from '../../services/apiServicesFixed'
import type { atualizarEmpresaRequest } from "../../services/types"

type ConfigTab = 'geral' | 'notificacoes' | 'seguranca'

function ConfiguracoesEmpresa() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ConfigTab>('geral')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  // Estados para Configurações Gerais - Integrados com API
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [telefone, setTelefone] = useState("")
  const [razaoSocial, setRazaoSocial] = useState("")
  const [cep, setCep] = useState("")
  const [endereco, setEndereco] = useState("")
  const [loadingCep, setLoadingCep] = useState(false)
  
  // Estados para Notificações
  const [emailNotificacoes, setEmailNotificacoes] = useState(true)
  const [notifPedidos, setNotifPedidos] = useState(true)
  const [notifPromocoes, setNotifPromocoes] = useState(true)
  const [notifVendas, setNotifVendas] = useState(true)
  
  // Estados para Segurança
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("")
  
  // Carrega dados da empresa ao montar o componente
  useEffect(() => {
    const carregarDados = async () => {
      console.log('🔍 Iniciando carregamento de dados...')
      
      // Primeiro tenta carregar do localStorage
      const dadosUsuario = obterDadosUsuario()
      console.log('📋 Dados do localStorage:', dadosUsuario)
      
      if (dadosUsuario) {
        // Preenche campos com dados do localStorage
        setNome(dadosUsuario.nome || "")
        setEmail(dadosUsuario.email || "")
        setCnpj(dadosUsuario.cnpj || "")
        setTelefone(dadosUsuario.telefone || "")
        setRazaoSocial(dadosUsuario.razao_social || "")
        setEndereco(dadosUsuario.endereco || "")
        
        // Se CNPJ não estiver disponível, busca dados diretamente da tabela usuario
        if (!dadosUsuario.cnpj) {
          console.log('⚠️ CNPJ não encontrado no localStorage, buscando na tabela usuario...')
          
          try {
            const dadosCompletos = await buscarDadosUsuarioDireto()
            if (dadosCompletos) {
              setNome(dadosCompletos.nome || "")
              setEmail(dadosCompletos.email || "")
              setCnpj(dadosCompletos.cnpj || "")
              setTelefone(dadosCompletos.telefone || "")
              setRazaoSocial(dadosCompletos.razao_social || "")
              setEndereco(dadosCompletos.endereco || "")
              
              console.log('✅ Dados atualizados da tabela usuario:', dadosCompletos)
            }
          } catch (error) {
            console.error('❌ Erro ao buscar dados da tabela usuario:', error)
          }
        }
        
        console.log('📋 Campos finais preenchidos:', {
          nome: nome || dadosUsuario.nome || "",
          email: email || dadosUsuario.email || "",
          cnpj: cnpj || dadosUsuario.cnpj || "",
          telefone: telefone || dadosUsuario.telefone || "",
          razao_social: razaoSocial || dadosUsuario.razao_social || "",
          endereco: endereco || dadosUsuario.endereco || ""
        })
      } else {
        console.log('⚠️ Nenhum dado de usuário encontrado no localStorage')
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

  // Funções de validação
  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validarTelefone = (telefone: string): boolean => {
    const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
    return telefoneRegex.test(telefone)
  }

  const validarCNPJ = (cnpj: string): boolean => {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) return false
    
    // Validação básica de CNPJ
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false
    
    return true
  }

  const formatarTelefone = (valor: string): string => {
    const numeros = valor.replace(/\D/g, '')
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
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

      // Monta endereço completo
      const enderecoCompleto = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
      setEndereco(enderecoCompleto)
      showMessage("Endereço preenchido automaticamente!", "success")
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      showMessage("Erro ao buscar CEP", "error")
    } finally {
      setLoadingCep(false)
    }
  }
  
  const handleSalvarGeral = async () => {
    // Verifica se o usuário está autenticado
    const token = localStorage.getItem('auth_token')
    if (!token) {
      showMessage("Sessão expirada. Redirecionando para login...", "error")
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
      return
    }

    // Validações obrigatórias
    if (!nome.trim()) {
      showMessage("Nome da empresa é obrigatório", "error")
      return
    }
    if (!email.trim()) {
      showMessage("Email é obrigatório", "error")
      return
    }
    if (!validarEmail(email.trim())) {
      showMessage("Email deve ter um formato válido (exemplo@dominio.com)", "error")
      return
    }

    // Validações opcionais (se preenchidas)
    if (telefone.trim() && !validarTelefone(telefone.trim())) {
      showMessage("Telefone deve estar no formato (11) 99999-9999", "error")
      return
    }
    if (cnpj.trim() && !validarCNPJ(cnpj.trim())) {
      showMessage("CNPJ deve ter 14 dígitos válidos", "error")
      return
    }
    if (cep.trim() && cep.replace(/\D/g, '').length !== 8) {
      showMessage("CEP deve ter 8 dígitos", "error")
      return
    }
    if (razaoSocial.trim() && razaoSocial.trim().length < 3) {
      showMessage("Razão social deve ter pelo menos 3 caracteres", "error")
      return
    }

    setLoading(true)
    try {
      // Validação de comprimento de campos
      if (nome.trim().length > 100) {
        showMessage("Nome da empresa deve ter no máximo 100 caracteres", "error")
        setLoading(false)
        return
      }
      if (email.trim().length > 100) {
        showMessage("Email deve ter no máximo 100 caracteres", "error")
        setLoading(false)
        return
      }
      if (telefone.trim() && telefone.trim().length > 20) {
        showMessage("Telefone deve ter no máximo 20 caracteres", "error")
        setLoading(false)
        return
      }
      if (razaoSocial.trim() && razaoSocial.trim().length > 200) {
        showMessage("Razão social deve ter no máximo 200 caracteres", "error")
        setLoading(false)
        return
      }
      if (endereco.trim() && endereco.trim().length > 300) {
        showMessage("Endereço deve ter no máximo 300 caracteres", "error")
        setLoading(false)
        return
      }

      // Verifica se CNPJ está disponível
      if (!cnpj || !cnpj.trim()) {
        showMessage("CNPJ é obrigatório. Verifique se seus dados foram carregados corretamente.", "error")
        setLoading(false)
        return
      }

      // Obtém dados do usuário para verificar campos obrigatórios
      const dadosUsuario = obterDadosUsuario()
      if (!dadosUsuario) {
        showMessage("Dados do usuário não encontrados. Faça login novamente.", "error")
        setLoading(false)
        return
      }

      const payload: atualizarEmpresaRequest = {
        nome: nome.trim(),
        email: email.trim(),
        cnpj: cnpj.trim(), // CNPJ é obrigatório
      }

      // Adiciona campos opcionais apenas se preenchidos
      if (telefone.trim()) payload.telefone = telefone.trim()
      if (razaoSocial.trim()) payload.razao_social = razaoSocial.trim()
      if (endereco.trim()) payload.endereco = endereco.trim()

      // Adiciona outros campos que podem ser obrigatórios
      console.log('🔍 Dados completos do usuário:', dadosUsuario)
      console.log('🔍 Verificando campos obrigatórios...')

      console.log('📋 Payload completo sendo enviado:', payload)
      console.log('📋 Tamanhos dos campos:', {
        nome: nome.trim().length,
        email: email.trim().length,
        cnpj: cnpj.trim().length,
        telefone: telefone.trim().length,
        razaoSocial: razaoSocial.trim().length,
        endereco: endereco.trim().length
      })

      const response = await atualizarEmpresa(payload)
      
      if (response.status) {
        showMessage("Informações atualizadas com sucesso!", "success")
        
        // Atualiza localStorage com os novos dados
        const dadosUsuario = obterDadosUsuario()
        if (dadosUsuario) {
          const dadosAtualizados = {
            ...dadosUsuario,
            nome: nome.trim(),
            email: email.trim(),
            telefone: telefone.trim() || dadosUsuario.telefone,
            razao_social: razaoSocial.trim() || dadosUsuario.razao_social,
            endereco: endereco.trim() || dadosUsuario.endereco
          }
          localStorage.setItem('user_data', JSON.stringify(dadosAtualizados))
        }
      } else {
        showMessage(response.message || "Erro ao atualizar informações", "error")
      }
    } catch (error: any) {
      console.error("Erro ao atualizar informações:", error)
      console.error("Resposta completa da API:", error.response?.data)
      
      if (error.response?.status === 401) {
        showMessage("Sessão expirada. Você será redirecionado para fazer login novamente.", "error")
        // O interceptor já vai redirecionar automaticamente
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || "Erro de validação"
        if (errorMessage.includes("campos obrigatórios")) {
          showMessage("Verifique se todos os campos obrigatórios estão preenchidos corretamente e não excedem o limite de caracteres.", "error")
        } else if (errorMessage.includes("caracteres")) {
          showMessage("Um ou mais campos excedem o limite de caracteres permitido.", "error")
        } else {
          showMessage(errorMessage, "error")
        }
      } else {
        showMessage(error.response?.data?.message || "Erro ao atualizar informações", "error")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSalvarSenha = async () => {
    // Verifica se o usuário está autenticado
    const token = localStorage.getItem('auth_token')
    if (!token) {
      showMessage("Sessão expirada. Redirecionando para login...", "error")
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
      return
    }

    if (!senhaAtual.trim()) {
      showMessage("Senha atual é obrigatória", "error")
      return
    }
    if (!novaSenha.trim()) {
      showMessage("Nova senha é obrigatória", "error")
      return
    }
    if (novaSenha !== confirmarNovaSenha) {
      showMessage("Senhas não coincidem", "error")
      return
    }
    if (novaSenha.length < 6) {
      showMessage("Nova senha deve ter pelo menos 6 caracteres", "error")
      return
    }

    setLoading(true)
    try {
      const payload: atualizarEmpresaRequest = {
        senha: novaSenha.trim()
      }

      const response = await atualizarEmpresa(payload)
      
      if (response.status) {
        showMessage("Senha atualizada com sucesso!", "success")
        setSenhaAtual("")
        setNovaSenha("")
        setConfirmarNovaSenha("")
      } else {
        showMessage(response.message || "Erro ao atualizar senha", "error")
      }
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error)
      showMessage(error.response?.data?.message || "Erro ao atualizar senha", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSalvarNotificacoes = () => {
    // Aqui você pode implementar a lógica para salvar preferências de notificação
    // Por enquanto, apenas mostra mensagem de sucesso
    showMessage("Preferências de notificação salvas!", "success")
  }

  const testarCamposObrigatorios = async () => {
    console.log('🧪 Testando quais campos são obrigatórios...')
    
    const dadosUsuario = obterDadosUsuario()
    console.log('🔍 Dados do localStorage:', dadosUsuario)
    
    // Testa com payload mínimo
    const payloadMinimo = {
      nome: "Teste",
      email: "teste@teste.com"
    }
    
    console.log('📋 Testando payload mínimo:', payloadMinimo)
    
    try {
      const response = await atualizarEmpresa(payloadMinimo)
      console.log('✅ Payload mínimo funcionou:', response)
    } catch (error: any) {
      console.log('❌ Payload mínimo falhou:', error.response?.data)
      
      // Testa com CNPJ
      if (cnpj.trim()) {
        const payloadComCnpj = {
          ...payloadMinimo,
          cnpj: cnpj.trim()
        }
        
        console.log('📋 Testando com CNPJ:', payloadComCnpj)
        
        try {
          const response2 = await atualizarEmpresa(payloadComCnpj)
          console.log('✅ Payload com CNPJ funcionou:', response2)
        } catch (error2: any) {
          console.log('❌ Payload com CNPJ também falhou:', error2.response?.data)
        }
      }
    }
  }

  const testarEndpointEstabelecimentos = async () => {
    console.log('🧪 Testando endpoint /estabelecimentos...')
    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:8080/v1/infohub/estabelecimentos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📋 Status da resposta:', response.status)
      console.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('📋 Dados completos da resposta:', data)
      console.log('📋 Tipo da resposta:', typeof data)
      console.log('📋 É array?', Array.isArray(data))
      
      if (data && typeof data === 'object') {
        console.log('📋 Propriedades da resposta:', Object.keys(data))
        
        if (data.data && Array.isArray(data.data)) {
          console.log('📋 Estabelecimentos encontrados:', data.data.length)
          data.data.forEach((est: any, index: number) => {
            console.log(`📋 Estabelecimento ${index + 1}:`, est)
          })
        }
      }
      
      showMessage(`Teste concluído! Verifique o console. Status: ${response.status}`, response.ok ? "success" : "error")
    } catch (error) {
      console.error('❌ Erro no teste:', error)
      showMessage("Erro no teste do endpoint", "error")
    } finally {
      setLoading(false)
    }
  }

  const forcarCarregamentoDaAPI = async () => {
    console.log('🔄 Forçando carregamento de dados da tabela usuario...')
    setLoading(true)
    
    try {
      const dadosCompletos = await buscarDadosUsuarioDireto()
      if (dadosCompletos && dadosCompletos.cnpj) {
        setNome(dadosCompletos.nome || "")
        setEmail(dadosCompletos.email || "")
        setCnpj(dadosCompletos.cnpj || "")
        setTelefone(dadosCompletos.telefone || "")
        setRazaoSocial(dadosCompletos.razao_social || "")
        setEndereco(dadosCompletos.endereco || "")
        
        showMessage("CNPJ carregado da tabela usuario com sucesso!", "success")
        console.log('✅ Dados carregados da tabela usuario:', dadosCompletos)
      } else {
        showMessage("CNPJ não encontrado na tabela usuario. Verifique se o usuário tem CNPJ cadastrado.", "error")
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados da tabela usuario:', error)
      showMessage("Erro ao carregar dados da tabela usuario", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 animate-fadeInDown">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/perfil-empresa')}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                title="Voltar"
              >
                <ArrowLeft className="text-gray-600" size={20} />
              </button>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center">
                <Settings className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
                <p className="text-gray-500 text-sm">Gerencie as configurações da sua empresa</p>
              </div>
            </div>
          </div>

          {/* Mensagem de Feedback */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-center flex items-center justify-center gap-2 ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Menu Lateral */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-4 space-y-2 animate-fadeInUp">
                <button
                  onClick={() => setActiveTab('geral')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'geral'
                      ? 'bg-[#F9A01B] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Building2 size={20} />
                  <span className="font-medium">Informações Gerais</span>
                </button>

                <button
                  onClick={() => setActiveTab('notificacoes')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'notificacoes'
                      ? 'bg-[#F9A01B] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bell size={20} />
                  <span className="font-medium">Notificações</span>
                </button>

                <button
                  onClick={() => setActiveTab('seguranca')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'seguranca'
                      ? 'bg-[#F9A01B] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Shield size={20} />
                  <span className="font-medium">Segurança</span>
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="lg:col-span-3">
              {/* Configurações Gerais */}
              {activeTab === 'geral' && (
                <div className="bg-white rounded-3xl shadow-lg p-6 animate-scaleIn">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Informações Gerais</h2>
                  
                  <div className="space-y-4">
                    {/* Nome da Empresa */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Empresa *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                            nome.length > 100 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-[#F9A01B]'
                          }`}
                          maxLength={100}
                          required
                        />
                      </div>
                      <p className={`text-xs mt-1 ${nome.length > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                        {nome.length}/100 caracteres
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Corporativo *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                            (email && !validarEmail(email)) || email.length > 100
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-[#F9A01B]'
                          }`}
                          maxLength={100}
                          required
                        />
                        {email && !validarEmail(email) && (
                          <p className="text-xs text-red-500 mt-1">
                            ❌ Email deve ter um formato válido
                          </p>
                        )}
                        <p className={`text-xs mt-1 ${email.length > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                          {email.length}/100 caracteres
                        </p>
                      </div>
                    </div>

                    {/* CNPJ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNPJ *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={cnpj}
                          readOnly
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                          placeholder="CNPJ será carregado automaticamente"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        📋 CNPJ cadastrado no sistema (não editável)
                        {!cnpj && <span className="text-red-500 ml-2">⚠️ CNPJ não carregado!</span>}
                      </p>
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone (opcional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="tel"
                          value={telefone}
                          onChange={(e) => {
                            const valorFormatado = formatarTelefone(e.target.value)
                            setTelefone(valorFormatado)
                          }}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                            telefone && !validarTelefone(telefone) 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-[#F9A01B]'
                          }`}
                          placeholder="(11) 99999-9999"
                          maxLength={15}
                        />
                        {telefone && !validarTelefone(telefone) && (
                          <p className="text-xs text-red-500 mt-1">
                            ❌ Telefone deve estar no formato (11) 99999-9999
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Razão Social */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Razão Social (opcional)
                      </label>
                      <input
                        type="text"
                        value={razaoSocial}
                        onChange={(e) => setRazaoSocial(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                          razaoSocial.length > 200 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-[#F9A01B]'
                        }`}
                        maxLength={200}
                      />
                      <p className={`text-xs mt-1 ${razaoSocial.length > 200 ? 'text-red-500' : 'text-gray-500'}`}>
                        {razaoSocial.length}/200 caracteres
                      </p>
                    </div>

                    {/* CEP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP (opcional)
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={cep}
                          onChange={(e) => {
                            const valor = e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2')
                            setCep(valor)
                            if (valor.replace(/\D/g, '').length === 8) {
                              buscarCep(valor)
                            }
                          }}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                          placeholder="00000-000"
                          maxLength={9}
                        />
                        {loadingCep && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        🔍 Digite o CEP para preenchimento automático do endereço
                      </p>
                    </div>

                    {/* Endereço */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço (opcional)
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <textarea
                          value={endereco}
                          onChange={(e) => setEndereco(e.target.value)}
                          rows={3}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                            endereco.length > 300 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-[#F9A01B]'
                          }`}
                          placeholder="Rua, número, bairro, cidade, estado"
                          maxLength={300}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">
                          📍 Preenchido automaticamente via CEP ou digite manualmente
                        </p>
                        <p className={`text-xs ${endereco.length > 300 ? 'text-red-500' : 'text-gray-500'}`}>
                          {endereco.length}/300
                        </p>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSalvarGeral}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save size={20} />
                            Salvar Alterações
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => navigate('/perfil-empresa')}
                        disabled={loading}
                        className="px-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <X size={20} />
                        Cancelar
                      </button>
                    </div>

                    {/* Botões de Debug */}
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <h3 className="text-sm font-medium text-yellow-800 mb-3">🔧 Ferramentas de Debug</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <button
                          onClick={forcarCarregamentoDaAPI}
                          disabled={loading}
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "🔄"
                          )}
                          Carregar CNPJ da Tabela Usuario
                        </button>
                        
                        <button
                          onClick={testarEndpointEstabelecimentos}
                          disabled={loading}
                          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "🔍"
                          )}
                          Testar API Estabelecimentos
                        </button>
                        
                        <button
                          onClick={testarCamposObrigatorios}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          🧪 Testar Campos Obrigatórios
                        </button>
                      </div>
                      
                      <div className="text-xs text-yellow-700 space-y-1">
                        <p>• <strong>Carregar CNPJ da Tabela Usuario:</strong> Busca CNPJ diretamente da tabela usuario</p>
                        <p>• <strong>Testar API Estabelecimentos:</strong> Verifica se a API está retornando dados (console)</p>
                        <p>• <strong>Testar Campos:</strong> Testa quais campos são obrigatórios (verifique o console)</p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Notificações */}
              {activeTab === 'notificacoes' && (
                <div className="bg-white rounded-3xl shadow-lg p-6 animate-scaleIn">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Preferências de Notificações</h2>
                  
                  <div className="space-y-6">
                    {/* Canal de Notificação */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Canal de Notificação</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <Mail className="text-gray-600" size={20} />
                            <div>
                              <p className="font-medium text-gray-700">Notificações por Email</p>
                              <p className="text-sm text-gray-500">Receba notificações no seu email corporativo</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={emailNotificacoes}
                            onChange={(e) => setEmailNotificacoes(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Tipos de Notificação */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Tipos de Notificação</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium text-gray-700">Novos Pedidos</p>
                            <p className="text-sm text-gray-500">Receba notificações quando houver novos pedidos</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifPedidos}
                            onChange={(e) => setNotifPedidos(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium text-gray-700">Promoções Ativas</p>
                            <p className="text-sm text-gray-500">Alertas sobre suas promoções e desempenho</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifPromocoes}
                            onChange={(e) => setNotifPromocoes(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium text-gray-700">Relatórios de Vendas</p>
                            <p className="text-sm text-gray-500">Resumos periódicos de vendas e estatísticas</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifVendas}
                            onChange={(e) => setNotifVendas(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSalvarNotificacoes}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Save size={20} />
                        Salvar Preferências
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Segurança */}
              {activeTab === 'seguranca' && (
                <div className="bg-white rounded-3xl shadow-lg p-6 animate-scaleIn">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Segurança da Conta</h2>
                  
                  <div className="space-y-6">
                    {/* Alterar Senha */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Alterar Senha</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Senha Atual *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={senhaAtual}
                              onChange={(e) => setSenhaAtual(e.target.value)}
                              className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                              placeholder="Digite sua senha atual"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nova Senha *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                              type="password"
                              value={novaSenha}
                              onChange={(e) => setNovaSenha(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                              placeholder="Digite a nova senha (mín. 6 caracteres)"
                              minLength={6}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nova Senha *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                              type="password"
                              value={confirmarNovaSenha}
                              onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                              placeholder="Confirme a nova senha"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSalvarSenha}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Atualizando...
                          </>
                        ) : (
                          <>
                            <Save size={20} />
                            Atualizar Senha
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => {
                          setSenhaAtual("")
                          setNovaSenha("")
                          setConfirmarNovaSenha("")
                        }}
                        disabled={loading}
                        className="px-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <X size={20} />
                        Limpar
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default ConfiguracoesEmpresa
