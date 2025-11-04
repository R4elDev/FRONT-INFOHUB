import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Settings, User, Mail, Phone, Calendar, Save, X, Loader2 } from "lucide-react"
import { atualizarUsuario, obterDadosUsuario } from "../../services/apiServicesFixed"
import type { atualizarUsuarioRequest } from "../../services/types"

function PerfilUsuario() {
  const navigate = useNavigate()
  const [nome, setNome] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [cpf, setCpf] = useState<string>("")
  const [telefone, setTelefone] = useState<string>("")
  const [dataNascimento, setDataNascimento] = useState<string>("")
  const [senha, setSenha] = useState<string>("")
  const [confirmarSenha, setConfirmarSenha] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  // Carrega dados do usuário ao montar o componente
  useEffect(() => {
    const dadosUsuario = obterDadosUsuario()
    if (dadosUsuario) {
      setNome(dadosUsuario.nome || "")
      setEmail(dadosUsuario.email || "")
      setCpf(dadosUsuario.cpf || "")
      setTelefone(dadosUsuario.telefone || "")
      // dataNascimento pode vir em formatos diferentes, vamos tratar
      if (dadosUsuario.data_nascimento) {
        const data = new Date(dadosUsuario.data_nascimento)
        setDataNascimento(data.toISOString().split('T')[0])
      }
    }
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

  const validarCPF = (cpf: string): boolean => {
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) return false
    
    // Validação básica de CPF
    if (/^(\d)\1+$/.test(cpfLimpo)) return false
    
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
    if (cpf.trim() && !validarCPF(cpf.trim())) {
      showMessage("CPF deve ter 11 dígitos válidos", "error")
      return
    }

    // Validações de senha
    if (senha && senha !== confirmarSenha) {
      showMessage("Senhas não coincidem", "error")
      return
    }
    if (senha && senha.length < 6) {
      showMessage("Senha deve ter pelo menos 6 caracteres", "error")
      return
    }

    setLoading(true)
    try {
      const payload: atualizarUsuarioRequest = {
        nome: nome.trim(),
        email: email.trim(),
      }

      // Adiciona campos opcionais apenas se preenchidos
      // CPF não é enviado pois é somente leitura (puxado do banco)
      if (telefone.trim()) payload.telefone = telefone.trim()
      if (dataNascimento) payload.data_nascimento = dataNascimento
      if (senha.trim()) payload.senha = senha.trim()

      const response = await atualizarUsuario(payload)
      
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
        
        // Limpa campos de senha
        setSenha("")
        setConfirmarSenha("")
      } else {
        showMessage(response.message || "Erro ao atualizar perfil", "error")
      }
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error)
      
      if (error.response?.status === 401) {
        showMessage("Sessão expirada. Você será redirecionado para fazer login novamente.", "error")
        // O interceptor já vai redirecionar automaticamente
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
    setSenha("")
    setConfirmarSenha("")
    setMessage("")
    setMessageType("")
  }

  return (
    <SidebarLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-8 relative animate-scaleIn">
          {/* Botão de Configurações */}
          <button 
            onClick={() => navigate('/configuracoes')}
            className="absolute top-4 right-4 text-gray-400 hover:text-[#F9A01B] transition-colors"
            title="Configurações"
          >
            <Settings size={24} />
          </button>

          {/* Título */}
          <h1 className="text-3xl font-bold text-[#F9A01B] text-center mb-2">
            MEU PERFIL
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Atualize suas informações pessoais
          </p>

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

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Foto de Perfil */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center shadow-xl">
                <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                  <User className="w-12 h-12 text-[#F9A01B]" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Pessoa Física</p>
            </div>

            {/* Formulário */}
            <div className="flex-1 space-y-4 w-full">
              {/* Nome Completo */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nome Completo *"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent ${
                    email && !validarEmail(email) 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-[#F9A01B]'
                  }`}
                  required
                />
                {email && !validarEmail(email) && (
                  <p className="text-xs text-red-500 mt-1">
                    ❌ Email deve ter um formato válido
                  </p>
                )}
              </div>

              {/* CPF */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="CPF será carregado automaticamente"
                  value={cpf}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  📋 CPF cadastrado no sistema (não editável)
                </p>
              </div>

              {/* Telefone */}
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => {
                    const valorFormatado = formatarTelefone(e.target.value)
                    setTelefone(valorFormatado)
                  }}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent ${
                    telefone && !validarTelefone(telefone) 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-[#F9A01B]'
                  }`}
                  maxLength={15}
                />
                {telefone && !validarTelefone(telefone) && (
                  <p className="text-xs text-red-500 mt-1">
                    ❌ Telefone deve estar no formato (11) 99999-9999
                  </p>
                )}
              </div>

              {/* Data de Nascimento */}
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  placeholder="Data de Nascimento"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] focus:border-transparent"
                />
              </div>

              {/* Divisor */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Alterar senha (deixe em branco para manter a atual)
                </p>
              </div>

              {/* Nova Senha */}
              <input
                type="password"
                placeholder="Nova senha (opcional)"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] focus:border-transparent"
                minLength={6}
              />

              {/* Confirmar Senha */}
              {senha && (
                <input
                  type="password"
                  placeholder="Confirme a nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] focus:border-transparent"
                />
              )}

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSalvar}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelar}
                  disabled={loading}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default PerfilUsuario
