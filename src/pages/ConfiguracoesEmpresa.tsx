import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../components/layouts/SidebarLayout"
import { 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Users, 
  Mail, 
  Globe, 
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  ArrowLeft
} from "lucide-react"

type ConfigTab = 'geral' | 'notificacoes' | 'seguranca' | 'pagamento' | 'equipe'

function ConfiguracoesEmpresa() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ConfigTab>('geral')
  const [showPassword, setShowPassword] = useState(false)
  
  // Estados para Configurações Gerais
  const [nomeEmpresa, setNomeEmpresa] = useState("SUPERMERCADO JAPÃO")
  const [emailEmpresa, setEmailEmpresa] = useState("japao@gmail.com")
  const [telefone, setTelefone] = useState("(11) 98765-4321")
  const [endereco, setEndereco] = useState("Rua das Flores, 123 - São Paulo, SP")
  const [horarioFuncionamento, setHorarioFuncionamento] = useState("08:00 - 22:00")
  
  // Estados para Notificações
  const [emailNotificacoes, setEmailNotificacoes] = useState(true)
  const [smsNotificacoes, setSmsNotificacoes] = useState(false)
  const [pushNotificacoes, setPushNotificacoes] = useState(true)
  const [notifPedidos, setNotifPedidos] = useState(true)
  const [notifPromocoes, setNotifPromocoes] = useState(true)
  const [notifAvaliacoes, setNotifAvaliacoes] = useState(false)
  
  // Estados para Segurança
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("")
  const [autenticacaoDoisFatores, setAutenticacaoDoisFatores] = useState(false)
  
  const handleSalvar = () => {
    console.log("Salvando configurações...")
    alert("Configurações salvas com sucesso!")
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Menu Lateral */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-4 space-y-2">
                <button
                  onClick={() => setActiveTab('geral')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'geral'
                      ? 'bg-[#F9A01B] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={20} />
                  <span className="font-medium">Geral</span>
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

                <button
                  onClick={() => setActiveTab('pagamento')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'pagamento'
                      ? 'bg-[#F9A01B] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard size={20} />
                  <span className="font-medium">Pagamento</span>
                </button>

                <button
                  onClick={() => setActiveTab('equipe')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'equipe'
                      ? 'bg-[#F9A01B] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users size={20} />
                  <span className="font-medium">Equipe</span>
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="lg:col-span-3">
              {/* Configurações Gerais */}
              {activeTab === 'geral' && (
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Informações Gerais</h2>
                  
                  <div className="space-y-4">
                    {/* Nome da Empresa */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        value={nomeEmpresa}
                        onChange={(e) => setNomeEmpresa(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Corporativo
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={emailEmpresa}
                          onChange={(e) => setEmailEmpresa(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                        />
                      </div>
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                      />
                    </div>

                    {/* Endereço */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço Completo
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 text-gray-400" size={20} />
                        <textarea
                          value={endereco}
                          onChange={(e) => setEndereco(e.target.value)}
                          rows={3}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                        />
                      </div>
                    </div>

                    {/* Horário de Funcionamento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário de Funcionamento
                      </label>
                      <input
                        type="text"
                        value={horarioFuncionamento}
                        onChange={(e) => setHorarioFuncionamento(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                        placeholder="Ex: 08:00 - 22:00"
                      />
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSalvar}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Save size={20} />
                        Salvar Alterações
                      </button>
                      <button className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                        <X size={20} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notificações */}
              {activeTab === 'notificacoes' && (
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Preferências de Notificações</h2>
                  
                  <div className="space-y-6">
                    {/* Canais de Notificação */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Canais de Notificação</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <Mail className="text-gray-600" size={20} />
                            <span className="font-medium text-gray-700">Email</span>
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
                            <span className="font-medium text-gray-700">SMS</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={smsNotificacoes}
                            onChange={(e) => setSmsNotificacoes(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <Bell className="text-gray-600" size={20} />
                            <span className="font-medium text-gray-700">Push Notifications</span>
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
                            <p className="text-sm text-gray-500">Alertas sobre suas promoções</p>
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
                            <p className="font-medium text-gray-700">Avaliações de Clientes</p>
                            <p className="text-sm text-gray-500">Notificações de novas avaliações</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifAvaliacoes}
                            onChange={(e) => setNotifAvaliacoes(e.target.checked)}
                            className="w-5 h-5 text-[#F9A01B] rounded focus:ring-[#F9A01B]"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSalvar}
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
                <div className="bg-white rounded-3xl shadow-lg p-6">
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
                        onClick={handleSalvar}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Save size={20} />
                        Atualizar Senha
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagamento */}
              {activeTab === 'pagamento' && (
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Métodos de Pagamento</h2>
                  
                  <div className="space-y-4">
                    {/* Cartão de Crédito */}
                    <div className="p-4 border-2 border-[#F9A01B] rounded-xl bg-orange-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="text-[#F9A01B]" size={24} />
                          <div>
                            <p className="font-medium text-gray-800">Cartão de Crédito</p>
                            <p className="text-sm text-gray-500">**** **** **** 4532</p>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          Principal
                        </span>
                      </div>
                    </div>

                    {/* PIX */}
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-[#F9A01B] transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-teal-600 font-bold">PIX</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">PIX</p>
                          <p className="text-sm text-gray-500">japao@gmail.com</p>
                        </div>
                      </div>
                    </div>

                    {/* Adicionar Novo */}
                    <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#F9A01B] hover:bg-orange-50 transition-colors text-gray-600 hover:text-[#F9A01B] font-medium">
                      + Adicionar Novo Método de Pagamento
                    </button>
                  </div>
                </div>
              )}

              {/* Equipe */}
              {activeTab === 'equipe' && (
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Gerenciar Equipe</h2>
                    <button className="bg-[#F9A01B] hover:bg-[#FF8C00] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      + Adicionar Membro
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Membro 1 */}
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          JM
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">João Mendes</p>
                          <p className="text-sm text-gray-500">joao@japao.com</p>
                        </div>
                      </div>
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                        Administrador
                      </span>
                    </div>

                    {/* Membro 2 */}
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold">
                          MS
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Maria Silva</p>
                          <p className="text-sm text-gray-500">maria@japao.com</p>
                        </div>
                      </div>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        Gerente
                      </span>
                    </div>

                    {/* Membro 3 */}
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                          PC
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Pedro Costa</p>
                          <p className="text-sm text-gray-500">pedro@japao.com</p>
                        </div>
                      </div>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        Funcionário
                      </span>
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
