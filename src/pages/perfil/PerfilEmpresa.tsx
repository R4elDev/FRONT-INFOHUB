import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Building2, Mail, Phone, MapPin, Save, X, Loader2, Plus } from "lucide-react"
import { atualizarEmpresa, obterDadosUsuario } from "../../services/apiServicesFixed"
import type { atualizarEmpresaRequest } from "../../services/types"

function PerfilEmpresa() {
  const navigate = useNavigate()
  const [nome, setNome] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [cnpj, setCnpj] = useState<string>("")
  const [telefone, setTelefone] = useState<string>("")
  const [razaoSocial, setRazaoSocial] = useState<string>("")
  const [endereco, setEndereco] = useState<string>("")
  const [senha, setSenha] = useState<string>("")
  const [confirmarSenha, setConfirmarSenha] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  // Carrega dados da empresa ao montar o componente
  useEffect(() => {
    const dadosUsuario = obterDadosUsuario()
    if (dadosUsuario) {
      setNome(dadosUsuario.nome || "")
      setEmail(dadosUsuario.email || "")
      setCnpj(dadosUsuario.cnpj || "")
      setTelefone(dadosUsuario.telefone || "")
      // Campos específicos de empresa podem não estar no localStorage
      // Vamos deixar vazios para o usuário preencher
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
      const payload: atualizarEmpresaRequest = {
        nome: nome.trim(),
        email: email.trim(),
      }

      // Adiciona campos opcionais apenas se preenchidos
      if (cnpj.trim()) payload.cnpj = cnpj.trim()
      if (telefone.trim()) payload.telefone = telefone.trim()
      if (razaoSocial.trim()) payload.razao_social = razaoSocial.trim()
      if (endereco.trim()) payload.endereco = endereco.trim()
      if (senha.trim()) payload.senha = senha.trim()

      const response = await atualizarEmpresa(payload)
      
      if (response.status) {
        showMessage("Perfil da empresa atualizado com sucesso!", "success")
        // Limpa campos de senha
        setSenha("")
        setConfirmarSenha("")
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
    setRazaoSocial("")
    setEndereco("")
    setSenha("")
    setConfirmarSenha("")
    setMessage("")
    setMessageType("")
  }

  return (
    <SidebarLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8">
          {/* Título e Botão Nova Promoção */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#F9A01B] mb-2">
                PERFIL DA EMPRESA
              </h1>
              <p className="text-gray-600">
                Gerencie as informações da sua empresa
              </p>
            </div>
            <button
              onClick={() => navigate('/cadastro-promocao')}
              className="bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#F9A01B] text-white px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nova Promoção
            </button>
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

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo da Empresa */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center shadow-xl">
                <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-[#F9A01B]" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Pessoa Jurídica</p>
            </div>

            {/* Formulário */}
            <div className="flex-1 space-y-4 w-full">
              {/* Nome da Empresa */}
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nome da Empresa *"
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
                  placeholder="Email Corporativo *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] focus:border-transparent"
                  required
                />
              </div>

              {/* CNPJ */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="CNPJ (opcional)"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] focus:border-transparent"
                  maxLength={18}
                />
              </div>

              {/* Telefone */}
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Telefone (opcional)"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] focus:border-transparent"
                />
              </div>

              {/* Razão Social */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Razão Social (opcional)"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] focus:border-transparent"
                />
              </div>

              {/* Endereço */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Endereço (opcional)"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
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

export default PerfilEmpresa
