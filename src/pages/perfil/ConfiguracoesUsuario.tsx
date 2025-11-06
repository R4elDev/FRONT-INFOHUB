import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { 
  Settings, 
  Bell, 
  Shield, 
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  ArrowLeft,
  Mail,
  LogOut
} from "lucide-react"
import { atualizarUsuario, obterDadosUsuario } from "../../services/apiServicesFixed"
import type { atualizarUsuarioRequest } from "../../services/types"

type ConfigTab = 'notificacoes' | 'seguranca' | 'privacidade'

function ConfiguracoesUsuario() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ConfigTab>('notificacoes')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  // Estados para Notificações
  const [emailNotificacoes, setEmailNotificacoes] = useState(true)
  const [smsNotificacoes, setSmsNotificacoes] = useState(false)
  const [pushNotificacoes, setPushNotificacoes] = useState(true)
  const [notifPromocoes, setNotifPromocoes] = useState(true)
  const [notifPedidos, setNotifPedidos] = useState(true)
  const [notifOfertas, setNotifOfertas] = useState(true)
  
  // Estados para Segurança
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("")
  const [autenticacaoDoisFatores, setAutenticacaoDoisFatores] = useState(false)
  
  // Estados para Privacidade
  const [perfilPublico, setPerfilPublico] = useState(false)
  const [mostrarEmail, setMostrarEmail] = useState(false)
  const [mostrarTelefone, setMostrarTelefone] = useState(false)
  const [permitirMensagens, setPermitirMensagens] = useState(true)
  const [compartilharDados, setCompartilharDados] = useState(false)

  // Carrega preferências do localStorage
  useEffect(() => {
    const preferencias = localStorage.getItem('user_preferences')
    if (preferencias) {
      const prefs = JSON.parse(preferencias)
      setEmailNotificacoes(prefs.emailNotificacoes ?? true)
      setSmsNotificacoes(prefs.smsNotificacoes ?? false)
      setPushNotificacoes(prefs.pushNotificacoes ?? true)
      setNotifPromocoes(prefs.notifPromocoes ?? true)
      setNotifPedidos(prefs.notifPedidos ?? true)
      setNotifOfertas(prefs.notifOfertas ?? true)
      setPerfilPublico(prefs.perfilPublico ?? false)
      setMostrarEmail(prefs.mostrarEmail ?? false)
      setMostrarTelefone(prefs.mostrarTelefone ?? false)
      setPermitirMensagens(prefs.permitirMensagens ?? true)
      setCompartilharDados(prefs.compartilharDados ?? false)
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
  
  const handleSalvarNotificacoes = () => {
    const preferencias = {
      emailNotificacoes,
      smsNotificacoes,
      pushNotificacoes,
      notifPromocoes,
      notifPedidos,
      notifOfertas,
      perfilPublico,
      mostrarEmail,
      mostrarTelefone,
      permitirMensagens,
      compartilharDados
    }
    localStorage.setItem('user_preferences', JSON.stringify(preferencias))
    showMessage("Preferências salvas com sucesso!", "success")
  }
  
  const handleSalvarPrivacidade = () => {
    const preferencias = {
      emailNotificacoes,
      smsNotificacoes,
      pushNotificacoes,
      notifPromocoes,
      notifPedidos,
      notifOfertas,
      perfilPublico,
      mostrarEmail,
      mostrarTelefone,
      permitirMensagens,
      compartilharDados
    }
    localStorage.setItem('user_preferences', JSON.stringify(preferencias))
    showMessage("Configurações de privacidade salvas!", "success")
  }

  const handleSalvarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      showMessage("Preencha todos os campos de senha", "error")
      return
    }
    if (novaSenha !== confirmarNovaSenha) {
      showMessage("As senhas não coincidem", "error")
      return
    }
    if (novaSenha.length < 6) {
      showMessage("A senha deve ter pelo menos 6 caracteres", "error")
      return
    }

    setLoading(true)
    try {
      const dadosUsuario = obterDadosUsuario()
      const payload: atualizarUsuarioRequest = {
        nome: dadosUsuario?.nome || "",
        email: dadosUsuario?.email || "",
        senha: novaSenha
      }
      const response = await atualizarUsuario(payload)
      if (response.status) {
        showMessage("Senha atualizada com sucesso!", "success")
        setSenhaAtual("")
        setNovaSenha("")
        setConfirmarNovaSenha("")
      } else {
        showMessage(response.message || "Erro ao atualizar senha", "error")
      }
    } catch (error: any) {
      showMessage(error.response?.data?.message || "Erro ao atualizar senha", "error")
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
                  onClick={() => navigate('/perfil-usuario')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                  title="Voltar ao Perfil"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-white">Configurações</h1>
                  <p className="text-orange-100 mt-1">Gerencie suas preferências e informações</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-8 h-8 text-white" />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.clear()
                    navigate('/login')
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/90 hover:bg-red-600 rounded-xl transition-all ml-4"
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
            <div className={`mb-6 p-4 rounded-xl text-center animate-fadeIn ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-700 border-2 border-green-200' 
                : 'bg-red-100 text-red-700 border-2 border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Menu Lateral */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-4 space-y-2 animate-fadeInUp">
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

                <button
                  onClick={() => setActiveTab('privacidade')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'privacidade'
                      ? 'bg-[#F9A01B] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Lock size={20} />
                  <span className="font-medium">Privacidade</span>
                </button>

              </div>
            </div>

            {/* Conteúdo */}
            <div className="lg:col-span-3">
              {/* Notificações */}
              {activeTab === 'notificacoes' && (
                <div className="bg-white rounded-3xl shadow-lg p-6 animate-scaleIn">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Preferências de Notificações</h2>
                  
                  <div className="space-y-6">
                    {/* Canal de Notificação */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Canais de Comunicação</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <Mail className="text-gray-600" size={20} />
                            <div>
                              <p className="font-medium text-gray-700">Notificações por Email</p>
                              <p className="text-sm text-gray-500">Receba atualizações no seu email</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={emailNotificacoes}
                            onChange={(e) => setEmailNotificacoes(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <Bell className="text-gray-600" size={20} />
                            <div>
                              <p className="font-medium text-gray-700">Notificações Push</p>
                              <p className="text-sm text-gray-500">Receba alertas no navegador</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={pushNotificacoes}
                            onChange={(e) => setPushNotificacoes(e.target.checked)}
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
                            <p className="font-medium text-gray-700">Promoções e Ofertas</p>
                            <p className="text-sm text-gray-500">Receba notificações sobre promoções especiais</p>
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
                            <p className="font-medium text-gray-700">Status de Pedidos</p>
                            <p className="text-sm text-gray-500">Acompanhe o status dos seus pedidos</p>
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
                            <p className="font-medium text-gray-700">Ofertas Personalizadas</p>
                            <p className="text-sm text-gray-500">Receba ofertas baseadas nas suas preferências</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifOfertas}
                            onChange={(e) => setNotifOfertas(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSalvarNotificacoes}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
                      >
                        <Save size={20} />
                        Salvar Preferências
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacidade */}
              {activeTab === 'privacidade' && (
                <div className="bg-white rounded-3xl shadow-lg p-6 animate-scaleIn">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Configurações de Privacidade</h2>
                  
                  <div className="space-y-6">
                    {/* Visibilidade do Perfil */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Visibilidade do Perfil</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium text-gray-700">Perfil Público</p>
                            <p className="text-sm text-gray-500">Permitir que outros usuários vejam seu perfil</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={perfilPublico}
                            onChange={(e) => setPerfilPublico(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium text-gray-700">Mostrar Email</p>
                            <p className="text-sm text-gray-500">Exibir seu email no perfil público</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={mostrarEmail}
                            onChange={(e) => setMostrarEmail(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                            disabled={!perfilPublico}
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium text-gray-700">Mostrar Telefone</p>
                            <p className="text-sm text-gray-500">Exibir seu telefone no perfil público</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={mostrarTelefone}
                            onChange={(e) => setMostrarTelefone(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                            disabled={!perfilPublico}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Comunicação */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Comunicação</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium text-gray-700">Permitir Mensagens</p>
                            <p className="text-sm text-gray-500">Receber mensagens de outros usuários</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={permitirMensagens}
                            onChange={(e) => setPermitirMensagens(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Dados */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Uso de Dados</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium text-gray-700">Compartilhar Dados para Análise</p>
                            <p className="text-sm text-gray-500">Ajude-nos a melhorar compartilhando dados anônimos</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={compartilharDados}
                            onChange={(e) => setCompartilharDados(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSalvarPrivacidade}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
                      >
                        <Save size={20} />
                        Salvar Configurações
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
                            Senha Atual
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={senhaAtual}
                              onChange={(e) => setSenhaAtual(e.target.value)}
                              className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
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
                            Nova Senha
                          </label>
                          <input
                            type="password"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nova Senha
                          </label>
                          <input
                            type="password"
                            value={confirmarNovaSenha}
                            onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Autenticação de Dois Fatores */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Autenticação de Dois Fatores</h3>
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium text-gray-700">Ativar 2FA</p>
                          <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={autenticacaoDoisFatores}
                          onChange={(e) => setAutenticacaoDoisFatores(e.target.checked)}
                          className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                        />
                      </label>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleSalvarSenha}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save size={20} />
                            Atualizar Senha
                          </>
                        )}
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

export default ConfiguracoesUsuario
