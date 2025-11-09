import { useState } from "react"
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
  X,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  LogOut,
  Mail
} from "lucide-react"
import { atualizarEmpresa } from '../../services/apiServicesFixed'
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
if (!document.head.querySelector('style[data-configuracoes-empresa-animations]')) {
  styles.setAttribute('data-configuracoes-empresa-animations', 'true')
  document.head.appendChild(styles)
}

type ConfigTab = 'notificacoes' | 'seguranca'

function ConfiguracoesEmpresa() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ConfigTab>('notificacoes')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  // Estados para Notificações
  const [emailNotificacoes, setEmailNotificacoes] = useState(true)
  const [notifPedidos, setNotifPedidos] = useState(true)
  const [notifPromocoes, setNotifPromocoes] = useState(true)
  const [notifVendas, setNotifVendas] = useState(true)
  
  // Estados para Segurança
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("")
  

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 5000)
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

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Premium */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/perfil-empresa')}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                title="Voltar"
              >
                <ArrowLeft className="text-gray-600" size={20} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-xl">
                  <Settings className="text-white" size={28} />
                </div>
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
              <div>
                <h1 className="text-4xl font-black text-white" style={{textShadow: '3px 3px 10px rgba(0,0,0,0.3)'}}>Configurações</h1>
                <p className="text-white text-base font-bold mt-1" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.3)'}}>Gerencie as configurações da sua empresa</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Menu Lateral Premium */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-6 space-y-3 border-2 border-gray-100 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setActiveTab('notificacoes')}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold ${
                    activeTab === 'notificacoes'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bell size={22} />
                  <span>Notificações</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('seguranca')}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold ${
                    activeTab === 'seguranca'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Shield size={22} />
                  <span>Segurança</span>
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="lg:col-span-3">
              {/* Notificações */}
              {activeTab === 'notificacoes' && (
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 animate-fade-in">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-purple-200">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                      <Bell className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800">Preferências de Notificações</h2>
                  </div>
                  
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
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 animate-fade-in">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-green-200">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800">Segurança da Conta</h2>
                  </div>
                  
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
