import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { User, Mail, Phone, Calendar, Save, X, Loader2, Settings, ArrowLeft, LogOut, Lock } from "lucide-react"
import { obterDadosUsuario, buscarDadosUsuarioDireto, atualizarUsuario } from "../../services/apiServicesFixed"

function PerfilUsuario() {
  const navigate = useNavigate()
  const [nome, setNome] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [cpf, setCpf] = useState<string>("")
  const [telefone, setTelefone] = useState<string>("")
  const [dataNascimento, setDataNascimento] = useState<string>("")
  const [novaSenha, setNovaSenha] = useState<string>("")
  const [confirmarSenha, setConfirmarSenha] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  // Carrega dados do usuário ao montar o componente
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true)
      console.log('🔄 [PerfilUsuario] Iniciando carregamento de dados...')
      
      try {
        // Sempre tenta buscar dados atualizados da API primeiro
        console.log('🔍 [PerfilUsuario] Buscando dados atualizados da API...')
        const dadosAPI = await buscarDadosUsuarioDireto()
        
        // Se conseguiu dados da API, usa eles
        if (dadosAPI) {
          console.log('✅ [PerfilUsuario] Dados obtidos da API:', dadosAPI)
          preencherFormulario(dadosAPI)
          return
        }
        
        // Se não conseguiu da API, tenta do localStorage
        console.log('⚠️ [PerfilUsuario] Não foi possível obter dados da API, usando localStorage')
        const dadosUsuario = obterDadosUsuario()
        console.log('📦 [PerfilUsuario] Dados do localStorage:', dadosUsuario)
        
        if (dadosUsuario) {
          preencherFormulario(dadosUsuario)
        } else {
          console.error('❌ [PerfilUsuario] Nenhum dado de usuário encontrado!')
          showMessage("Não foi possível carregar seus dados. Por favor, faça login novamente.", "error")
          setTimeout(() => {
            window.location.href = '/login'
          }, 3000)
        }
      } catch (error) {
        console.error('❌ [PerfilUsuario] Erro ao carregar dados:', error)
        showMessage("Erro ao carregar seus dados. Por favor, tente novamente.", "error")
      } finally {
        setLoading(false)
      }
    }
    
    // Função auxiliar para preencher o formulário com os dados do usuário
    const preencherFormulario = (dadosUsuario: any) => {
      if (!dadosUsuario) return
      
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
        try {
          const data = new Date(dadosUsuario.data_nascimento)
          if (!isNaN(data.getTime())) {
            setDataNascimento(data.toISOString().split('T')[0])
          }
        } catch (error) {
          console.error('❌ [PerfilUsuario] Erro ao processar data de nascimento:', error)
        }
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
    // Verificação básica
    if (!nome.trim() || !email.trim() || !validarEmail(email.trim())) {
      showMessage("Preencha todos os campos obrigatórios corretamente", "error")
      return
    }

    // Validação de senha (se preenchida)
    if (novaSenha || confirmarSenha) {
      if (novaSenha.length < 6) {
        showMessage("A nova senha deve ter no mínimo 6 caracteres", "error")
        return
      }
      if (novaSenha !== confirmarSenha) {
        showMessage("As senhas não coincidem", "error")
        return
      }
    }

    setLoading(true)
    
    try {
      // Pega os dados do usuário do localStorage
      const userData = localStorage.getItem('user_data')
      if (!userData) {
        showMessage("Sessão expirada. Faça login novamente.", "error")
        setTimeout(() => window.location.href = '/login', 2000)
        return
      }
      
      const user = JSON.parse(userData)
      const userId = user.id
      
      if (!userId) {
        showMessage("ID de usuário não encontrado. Faça login novamente.", "error")
        setTimeout(() => window.location.href = '/login', 2000)
        return
      }
      
      console.log('🔑 ID do usuário para atualização:', userId)
      console.log('👤 Dados do usuário atual:', user)
      
      // Estratégia: Enviar apenas os dados que realmente mudaram
      // Baseado no schema do banco: nome, email, senha_hash são NOT NULL
      const payloadBase: any = {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim() || null,  // null se vazio
        data_nascimento: dataNascimento || null  // null se vazio
      }
      
      // Adiciona CPF apenas se não estiver vazio (evita enviar string vazia)
      if (cpf && cpf.trim() !== '') {
        payloadBase.cpf = cpf.trim()
      } else {
        payloadBase.cpf = null  // Envia null explicitamente
      }
      
      // Mantém o perfil do usuário (não deve mudar)
      if (user.perfil) {
        payloadBase.perfil = user.perfil
      }
      
      // Adiciona senha apenas se o usuário preencheu (quer alterar)
      if (novaSenha && novaSenha.trim() !== '') {
        payloadBase.senha_hash = novaSenha.trim()
        console.log('🔐 Nova senha será atualizada')
      } else {
        console.log('🔐 Senha não será alterada (campo vazio)')
      }
      
      console.log('📤 Enviando payload para API:', payloadBase)
      
      // Chama a API para atualizar os dados no backend
      const response = await atualizarUsuario(payloadBase)
      
      console.log('📥 Resposta da API:', response)
      
      // Verifica se a atualização foi bem-sucedida
      if (response.status) {
        showMessage(response.message || "Seus dados foram atualizados com sucesso!", "success")
        console.log('✅ Dados atualizados com sucesso no backend e localStorage')
        // Limpa os campos de senha após sucesso
        setNovaSenha("")
        setConfirmarSenha("")
      } else {
        showMessage(response.message || "Erro ao atualizar dados no servidor", "error")
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar dados:', error)
      const errorMessage = error.response?.data?.message || error.message || "Erro ao atualizar seus dados. Tente novamente."
      showMessage(errorMessage, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = async () => {
    setLoading(true)
    setMessage("")
    setMessageType("")
    // Limpa os campos de senha
    setNovaSenha("")
    setConfirmarSenha("")
    
    try {
      // Tenta buscar dados atualizados da API
      const dadosAPI = await buscarDadosUsuarioDireto()
      
      if (dadosAPI) {
        console.log('✅ [PerfilUsuario] Dados recarregados da API:', dadosAPI)
        setNome(dadosAPI.nome || "")
        setEmail(dadosAPI.email || "")
        setCpf(dadosAPI.cpf || "")
        setTelefone(dadosAPI.telefone || "")
        
        if (dadosAPI.data_nascimento) {
          try {
            const data = new Date(dadosAPI.data_nascimento)
            if (!isNaN(data.getTime())) {
              setDataNascimento(data.toISOString().split('T')[0])
            }
          } catch (error) {
            console.error('❌ [PerfilUsuario] Erro ao processar data de nascimento:', error)
          }
        }
        
        showMessage("Dados recarregados com sucesso!", "success")
      } else {
        // Se não conseguiu da API, usa dados do localStorage
        const dadosUsuario = obterDadosUsuario()
        if (dadosUsuario) {
          setNome(dadosUsuario.nome || "")
          setEmail(dadosUsuario.email || "")
          setCpf(dadosUsuario.cpf || "")
          setTelefone(dadosUsuario.telefone || "")
          
          if (dadosUsuario.data_nascimento) {
            try {
              const data = new Date(dadosUsuario.data_nascimento)
              if (!isNaN(data.getTime())) {
                setDataNascimento(data.toISOString().split('T')[0])
              }
            } catch (error) {
              console.error('❌ [PerfilUsuario] Erro ao processar data de nascimento:', error)
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ [PerfilUsuario] Erro ao recarregar dados:', error)
    } finally {
      setLoading(false)
    }
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
          
          {/* Indicador de Carregamento */}
          {loading && (
            <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
              <p className="text-blue-700 font-medium">Carregando dados...</p>
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

                    {/* CPF - Campo somente leitura */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder={cpf ? "CPF cadastrado" : "CPF não cadastrado"}
                          value={cpf || "Não informado"}
                          readOnly
                          className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <span className="text-orange-500 text-xs font-semibold bg-orange-100 px-2 py-1 rounded-full">Bloqueado</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {cpf ? "📋 CPF não pode ser alterado após o cadastro" : "⚠️ CPF não foi cadastrado no sistema"}
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

                {/* Seção: Segurança (Alterar Senha) */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-600" />
                    Segurança - Alterar Senha (Opcional)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    💡 Deixe em branco se não quiser alterar a senha
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nova Senha */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nova Senha</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
                        <input
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={novaSenha}
                          onChange={(e) => setNovaSenha(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
                            novaSenha && novaSenha.length < 6
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-200 focus:ring-orange-400 focus:border-orange-400'
                          }`}
                        />
                      </div>
                      {novaSenha && novaSenha.length < 6 && (
                        <p className="text-xs text-red-500 mt-1">
                          ❌ A senha deve ter no mínimo 6 caracteres
                        </p>
                      )}
                    </div>

                    {/* Confirmar Senha */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Nova Senha</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
                        <input
                          type="password"
                          placeholder="Digite a senha novamente"
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
                            confirmarSenha && novaSenha !== confirmarSenha
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-200 focus:ring-orange-400 focus:border-orange-400'
                          }`}
                        />
                      </div>
                      {confirmarSenha && novaSenha !== confirmarSenha && (
                        <p className="text-xs text-red-500 mt-1">
                          ❌ As senhas não coincidem
                        </p>
                      )}
                      {confirmarSenha && novaSenha === confirmarSenha && novaSenha.length >= 6 && (
                        <p className="text-xs text-green-600 mt-1">
                          ✅ As senhas coincidem
                        </p>
                      )}
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
