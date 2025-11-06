import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { User, Mail, Phone, Calendar, Save, X, Loader2, Settings, ArrowLeft, LogOut } from "lucide-react"
import { atualizarUsuario, obterDadosUsuario, buscarDadosUsuarioDireto } from "../../services/apiServicesFixed"
import type { atualizarUsuarioRequest } from "../../services/types"

function PerfilUsuario() {
  const navigate = useNavigate()
  const [nome, setNome] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [cpf, setCpf] = useState<string>("")
  const [telefone, setTelefone] = useState<string>("")
  const [dataNascimento, setDataNascimento] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  // Carrega dados do usuário ao montar o componente
  useEffect(() => {
    const carregarDados = async () => {
      console.log('🔄 [PerfilUsuario] Iniciando carregamento de dados...')
      
      // Primeiro tenta do localStorage
      let dadosUsuario = obterDadosUsuario()
      console.log('📦 [PerfilUsuario] Dados do localStorage:', dadosUsuario)
      
      // Se tiver CNPJ ao invés de CPF (dados incorretos), limpa e busca da API
      if (dadosUsuario && dadosUsuario.cnpj && !dadosUsuario.cpf) {
        console.warn('⚠️ [PerfilUsuario] Dados incorretos no localStorage (CNPJ ao invés de CPF)')
        console.log('🔍 Buscando dados corretos da API...')
        const dadosAPI = await buscarDadosUsuarioDireto()
        if (dadosAPI) {
          dadosUsuario = dadosAPI
          console.log('✅ [PerfilUsuario] Dados atualizados da API:', dadosAPI)
        }
      }
      
      if (dadosUsuario) {
        setNome(dadosUsuario.nome || "")
        setEmail(dadosUsuario.email || "")
        
        // Para usuário consumidor, só aceita CPF (não CNPJ)
        if (dadosUsuario.perfil === 'consumidor') {
          const cpfValue = dadosUsuario.cpf || ""
          setCpf(cpfValue)
          console.log('✅ [PerfilUsuario] CPF carregado:', cpfValue || 'vazio/null')
        } else {
          // Para outros perfis, pode usar CNPJ
          const cpfValue = dadosUsuario.cpf || dadosUsuario.cnpj || ""
          setCpf(cpfValue)
          console.log('✅ [PerfilUsuario] CPF/CNPJ carregado:', cpfValue)
        }
        
        setTelefone(dadosUsuario.telefone || "")
        // dataNascimento pode vir em formatos diferentes, vamos tratar
        if (dadosUsuario.data_nascimento) {
          const data = new Date(dadosUsuario.data_nascimento)
          setDataNascimento(data.toISOString().split('T')[0])
        }
      } else {
        console.error('❌ [PerfilUsuario] Nenhum dado de usuário encontrado!')
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

  const formatarTelefone = (valor: string): string => {
    const numeros = valor.replace(/\D/g, '')
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
  }

  const handleSalvar = async () => {
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
      showMessage("Nome é obrigatório", "error")
      return
    }
    if (nome.trim().length < 2) {
      showMessage("Nome deve ter pelo menos 2 caracteres", "error")
      return
    }
    if (nome.trim().length > 255) {
      showMessage("Nome não pode ter mais de 255 caracteres", "error")
      return
    }
    if (!email.trim()) {
      showMessage("Email é obrigatório", "error")
      return
    }
    if (email.trim().length > 255) {
      showMessage("Email não pode ter mais de 255 caracteres", "error")
      return
    }
    if (!validarEmail(email.trim())) {
      showMessage("Email deve ter um formato válido (exemplo@dominio.com)", "error")
      return
    }

    // CPF não é obrigatório - será enviado como null se não existir

    // Validações opcionais (se preenchidas)
    if (telefone.trim() && !validarTelefone(telefone.trim())) {
      showMessage("Telefone deve estar no formato (11) 99999-9999", "error")
      return
    }
    if (telefone.trim().length > 20) {
      showMessage("Telefone não pode ter mais de 20 caracteres", "error")
      return
    }

    setLoading(true)
    
    // Declara payload fora do try para estar disponível no catch
    let payload: atualizarUsuarioRequest = {
      nome: nome.trim(),
      email: email.trim()
    }
    
    try {
      console.log('🔍 [PerfilUsuario] CPF atual:', cpf)
      
      // Busca dados atuais do usuário para garantir que temos todos os campos
      const dadosAtuais = obterDadosUsuario()
      
      if (!dadosAtuais) {
        showMessage("Erro: dados do usuário não encontrados. Faça login novamente.", "error")
        setLoading(false)
        return
      }
      
      console.log('📋 [PerfilUsuario] Dados atuais do usuário:', dadosAtuais)
      
      // CPF: usa o valor do formulário ou o valor atual do usuário
      const cpfParaEnviar = cpf && cpf.trim() ? cpf.trim() : dadosAtuais?.cpf
      const cpfLimpo = cpfParaEnviar ? cpfParaEnviar.replace(/\D/g, '') : ''
      
      // Valida CPF se fornecido (deve ter 11 dígitos)
      if (cpfLimpo && cpfLimpo.length !== 11) {
        showMessage("CPF deve ter exatamente 11 dígitos", "error")
        setLoading(false)
        return
      }
      
      // Telefone: usa o valor do formulário ou o valor atual
      const telefoneParaEnviar = telefone.trim() || dadosAtuais?.telefone
      // Remove formatação do telefone (mantém apenas números)
      const telefoneLimpo = telefoneParaEnviar ? telefoneParaEnviar.replace(/\D/g, '') : ''
      
      // Data de nascimento: usa o valor do formulário ou o valor atual
      const dataParaEnviar = dataNascimento || dadosAtuais?.data_nascimento
      
      // SOLUÇÃO: Backend exige TODOS os campos obrigatórios em cada PUT
      // Sempre envia dados completos do usuário (formulário OU dados atuais)
      
      payload = {
        nome: nome.trim(),
        email: email.trim()
      }
      
      // CPF: só incluir no payload se existir e for válido (não enviar null)
      if (cpfLimpo && cpfLimpo.length === 11) {
        payload.cpf = cpfLimpo
        console.log('✅ [PerfilUsuario] CPF adicionado ao payload:', payload.cpf)
      } else if (dadosAtuais?.cpf) {
        // Se não tem CPF no formulário, usa o CPF atual do usuário
        const cpfAtual = dadosAtuais.cpf.replace(/\D/g, '')
        if (cpfAtual && cpfAtual.length === 11) {
          payload.cpf = cpfAtual
          console.log('✅ [PerfilUsuario] CPF atual adicionado ao payload:', payload.cpf)
        } else {
          console.log('⚠️ [PerfilUsuario] CPF inválido, não será enviado:', dadosAtuais.cpf)
        }
      } else {
        // Não incluir CPF no payload se não existir
        console.log('⚠️ [PerfilUsuario] CPF não existe, não será enviado no payload')
      }
      
      // Telefone: usa valor do formulário OU valor atual (SEMPRE envia se existir)
      if (telefoneLimpo && (telefoneLimpo.length === 10 || telefoneLimpo.length === 11)) {
        payload.telefone = telefoneLimpo
        console.log('✅ [PerfilUsuario] Telefone do formulário adicionado ao payload:', payload.telefone)
      } else if (dadosAtuais?.telefone) {
        // Se não tem telefone válido no formulário, usa o telefone atual
        const telefoneAtual = dadosAtuais.telefone.replace(/\D/g, '')
        if (telefoneAtual && (telefoneAtual.length === 10 || telefoneAtual.length === 11)) {
          payload.telefone = telefoneAtual
          console.log('✅ [PerfilUsuario] Telefone atual adicionado ao payload:', payload.telefone)
        }
      } else {
        console.log('⚠️ [PerfilUsuario] Telefone não disponível')
      }
      
      // Data de nascimento: usa valor do formulário OU valor atual (SEMPRE envia se existir)
      if (dataParaEnviar && dataParaEnviar.trim() !== '') {
        // Garante que a data está no formato correto (YYYY-MM-DD)
        const dataFormatada = dataParaEnviar.includes('T') ? dataParaEnviar.split('T')[0] : dataParaEnviar
        payload.data_nascimento = dataFormatada
        console.log('✅ [PerfilUsuario] Data nascimento adicionada ao payload:', payload.data_nascimento)
      } else if (dadosAtuais?.data_nascimento) {
        // Se não tem data no formulário, usa a data atual do usuário
        const dataAtual = dadosAtuais.data_nascimento.includes('T') 
          ? dadosAtuais.data_nascimento.split('T')[0] 
          : dadosAtuais.data_nascimento
        payload.data_nascimento = dataAtual
        console.log('✅ [PerfilUsuario] Data nascimento atual adicionada ao payload:', payload.data_nascimento)
      } else {
        console.log('⚠️ [PerfilUsuario] Data nascimento não disponível')
      }

      console.log('📤 [PerfilUsuario] Payload final:', payload)
      console.log('🔍 [PerfilUsuario] Campos no payload:', Object.keys(payload))
      console.log('🔍 [PerfilUsuario] Tem CPF no payload?', !!payload.cpf)
      console.log('🔍 [PerfilUsuario] Tem telefone no payload?', !!payload.telefone)
      console.log('🔍 [PerfilUsuario] Tem data_nascimento no payload?', !!payload.data_nascimento)
      
      // Validação adicional dos campos
      console.log('🔍 [PerfilUsuario] Validação dos campos:')
      console.log('  - Nome:', payload.nome, '(length:', payload.nome?.length, ')')
      console.log('  - Email:', payload.email, '(length:', payload.email?.length, ')')
      if (payload.cpf) console.log('  - CPF:', payload.cpf, '(length:', payload.cpf.length, ')')
      if (payload.telefone) console.log('  - Telefone:', payload.telefone, '(length:', payload.telefone.length, ')')
      if (payload.data_nascimento) console.log('  - Data:', payload.data_nascimento, '(format: YYYY-MM-DD)')
      
      // Verificações específicas de validação
      const problemas = []
      if (!payload.nome || payload.nome.length < 2) problemas.push('Nome muito curto')
      if (!payload.email || !validarEmail(payload.email)) problemas.push('Email inválido')
      if (payload.telefone && (payload.telefone.length < 10 || payload.telefone.length > 11)) problemas.push('Telefone inválido')
      
      if (problemas.length > 0) {
        console.error('❌ [PerfilUsuario] Problemas encontrados:', problemas)
      } else {
        console.log('✅ [PerfilUsuario] Todos os campos parecem válidos')
      }

      // TESTE SISTEMÁTICO: Vamos testar diferentes combinações
      console.log('🧪 [TESTE] Iniciando teste sistemático de campos...')
      
      // Teste 1: Payload mínimo (só nome + email)
      const payloadMinimo = {
        nome: nome.trim(),
        email: email.trim()
      }
      console.log('🧪 [TESTE 1] Payload mínimo:', payloadMinimo)
      
      // Teste 2: Com CPF vazio (string)
      const payloadComCpfVazio = {
        ...payloadMinimo,
        cpf: ""
      }
      console.log('🧪 [TESTE 2] Payload com CPF vazio:', payloadComCpfVazio)
      
      // Teste 3: Com telefone formatado vs sem formatação
      const payloadComTelefoneFormatado = {
        ...payloadMinimo,
        telefone: telefone.trim() // Com formatação (11) 99999-9999
      }
      const payloadComTelefoneLimpo = {
        ...payloadMinimo,
        telefone: telefoneLimpo // Só números 11999999999
      }
      console.log('🧪 [TESTE 3a] Payload com telefone formatado:', payloadComTelefoneFormatado)
      console.log('🧪 [TESTE 3b] Payload com telefone limpo:', payloadComTelefoneLimpo)
      
      // Teste 4: Payload atual completo
      console.log('🧪 [TESTE 4] Payload atual completo:', payload)
      
      // RESULTADO: CPF vazio também falhou! Backend exige MAIS campos.
      // TESTE FINAL: Vamos testar com TODOS os campos obrigatórios
      const payloadCompleto = {
        nome: nome.trim(),
        email: email.trim(),
        cpf: "", // CPF vazio (string)
        telefone: telefoneLimpo || "", // Telefone limpo ou vazio
        data_nascimento: dataParaEnviar || "" // Data ou vazio
      }
      
      console.log('🚀 [TESTE FINAL] CPF vazio FALHOU! Testando com TODOS os campos...')
      console.log('📋 [PAYLOAD COMPLETO]:', payloadCompleto)
      const response = await atualizarUsuario(payloadCompleto)
      
      if (response.status) {
        showMessage("Perfil atualizado com sucesso!", "success")
        
        // Atualiza localStorage com os novos dados
        const dadosUsuario = obterDadosUsuario()
        if (dadosUsuario) {
          const dadosAtualizados = {
            ...dadosUsuario,
            nome: nome.trim(),
            email: email.trim(),
            telefone: telefone.trim() || dadosUsuario.telefone,
            data_nascimento: dataNascimento || dadosUsuario.data_nascimento
          }
          localStorage.setItem('user_data', JSON.stringify(dadosAtualizados))
        }
      } else {
        showMessage(response.message || "Erro ao atualizar perfil", "error")
      }
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error)
      
      if (error.response?.status === 401) {
        showMessage("Sessão expirada. Você será redirecionado para fazer login novamente.", "error")
        // O interceptor já vai redirecionar automaticamente
      } else if (error.response?.status === 400) {
        // Erro 400 - Bad Request: campos obrigatórios ou limites excedidos
        const errorMessage = error.response?.data?.message || "Erro de validação nos dados"
        console.error("❌ Erro 400 - Detalhes:", {
          message: errorMessage,
          payload: payload,
          response: error.response?.data
        })
        
        // Mensagem mais específica para o usuário
        if (errorMessage.includes("obrigatórios")) {
          showMessage("Verifique se todos os campos obrigatórios estão preenchidos corretamente", "error")
        } else if (errorMessage.includes("caracteres")) {
          showMessage("Alguns campos excedem o limite de caracteres permitido", "error")
        } else {
          showMessage(errorMessage, "error")
        }
      } else {
        showMessage(error.response?.data?.message || "Erro ao atualizar perfil", "error")
      }
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
      setCpf(dadosUsuario.cpf || "")
      setTelefone(dadosUsuario.telefone || "")
      if (dadosUsuario.data_nascimento) {
        const data = new Date(dadosUsuario.data_nascimento)
        setDataNascimento(data.toISOString().split('T')[0])
      }
    }
    setMessage("")
    setMessageType("")
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header Elegante */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/HomeInicial')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                  title="Voltar ao Dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Meu Perfil
                  </h1>
                  <p className="text-orange-100 mt-1">Gerencie suas informações pessoais</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/configuracoes-usuario')}
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

          {/* Mensagem de Feedback */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-center ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Card Principal com Design Moderno */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Banner Superior */}
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-32 relative">
              <div className="absolute -bottom-16 left-8">
                <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-xl">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="pt-20 px-6 md:px-8 pb-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Pessoa Física</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">✓ Verificado</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{nome || "Seu Nome"}</h2>
                <p className="text-gray-500">{email || "email@exemplo.com"}</p>
              </div>

              {/* Formulário Organizado */}
              <div className="space-y-6">
                {/* Seção: Dados Pessoais */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-600" />
                    Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome Completo */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
                        <input
                          type="text"
                          placeholder="Digite seu nome completo"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-gray-50 focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
                        <input
                          type="email"
                          placeholder="email@exemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
                            email && !validarEmail(email) 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-200 focus:ring-orange-400 focus:border-orange-400'
                          }`}
                          required
                        />
                      </div>
                      {email && !validarEmail(email) && (
                        <p className="text-xs text-red-500 mt-1">
                          ❌ Email deve ter um formato válido
                        </p>
                      )}
                    </div>

                    {/* CPF */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
                      <input
                        type="text"
                        placeholder={cpf ? "CPF cadastrado" : "CPF não cadastrado"}
                        value={cpf || "Não informado"}
                        readOnly
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {cpf ? "📋 CPF não pode ser alterado" : "⚠️ CPF não foi cadastrado no sistema"}
                      </p>
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
                          onChange={(e) => {
                            const valorFormatado = formatarTelefone(e.target.value)
                            setTelefone(valorFormatado)
                          }}
                          className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
                            telefone && !validarTelefone(telefone) 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-200 focus:ring-orange-400 focus:border-orange-400'
                          }`}
                          maxLength={15}
                        />
                      </div>
                      {telefone && !validarTelefone(telefone) && (
                        <p className="text-xs text-red-500 mt-1">
                          ❌ Telefone deve estar no formato (11) 99999-9999
                        </p>
                      )}
                    </div>

                    {/* Data de Nascimento */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Nascimento</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
                        <input
                          type="date"
                          value={dataNascimento}
                          onChange={(e) => setDataNascimento(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t-2 border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={handleSalvar}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 hover:shadow-2xl shadow-lg flex items-center justify-center gap-2"
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
                    className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 border-2 border-gray-200"
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

export default PerfilUsuario
