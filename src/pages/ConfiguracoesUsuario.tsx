import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../components/layouts/SidebarLayout"
import { 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  MapPin, 
  Mail, 
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  ArrowLeft
} from "lucide-react"

type ConfigTab = 'geral' | 'notificacoes' | 'seguranca' | 'pagamento' | 'enderecos'

function ConfiguracoesUsuario() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ConfigTab>('geral')
  const [showPassword, setShowPassword] = useState(false)
  
  // Estados para Configurações Gerais
  const [nomeCompleto, setNomeCompleto] = useState("João Silva")
  const [email, setEmail] = useState("joao.silva@email.com")
  const [cpf, setCpf] = useState("123.456.789-00")
  const [telefone, setTelefone] = useState("(11) 98765-4321")
  const [dataNascimento, setDataNascimento] = useState("1990-05-15")
  
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
  
  const handleSalvar = () => {
    console.log("Salvando configurações...")
    alert("Configurações salvas com sucesso!")
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 animate-fadeInDown">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/perfil')}
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
                <p className="text-gray-500 text-sm">Gerencie suas preferências e informações pessoais</p>
              </div>
            </div>
          </div>

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
                  <User size={20} />
                  <span className="font-medium">Perfil</span>
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
                  onClick={() => setActiveTab('enderecos')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'enderecos'
                      ? 'bg-[#F9A01B] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MapPin size={20} />
                  <span className="font-medium">Endereços</span>
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="lg:col-span-3">
              {/* Perfil */}
              {activeTab === 'geral' && (
                <div className="bg-white rounded-3xl shadow-lg p-6 animate-scaleIn">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Informações Pessoais</h2>
                  
                  <div className="space-y-4">
                    {/* Nome Completo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={nomeCompleto}
                        onChange={(e) => setNomeCompleto(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                        />
                      </div>
                    </div>

                    {/* CPF */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CPF
                      </label>
                      <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">O CPF não pode ser alterado</p>
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

                    {/* Data de Nascimento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B]"
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
                <div className="bg-white rounded-3xl shadow-lg p-6 animate-scaleIn">
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
                            <p className="font-medium text-gray-700">Promoções e Ofertas</p>
                            <p className="text-sm text-gray-500">Receba as melhores ofertas e promoções</p>
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
                            <p className="text-sm text-gray-500">Acompanhe seus pedidos em tempo real</p>
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
                            <p className="text-sm text-gray-500">Ofertas baseadas nos seus interesses</p>
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
                            <p className="text-sm text-gray-500">Visa •••• 4532</p>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          Principal
                        </span>
                      </div>
                    </div>

                    {/* Cartão de Débito */}
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-[#F9A01B] transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="text-gray-600" size={24} />
                        <div>
                          <p className="font-medium text-gray-800">Cartão de Débito</p>
                          <p className="text-sm text-gray-500">Mastercard •••• 8765</p>
                        </div>
                      </div>
                    </div>

                    {/* PIX */}
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-[#F9A01B] transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-teal-600 font-bold text-sm">PIX</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">PIX</p>
                          <p className="text-sm text-gray-500">joao.silva@email.com</p>
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

              {/* Endereços */}
              {activeTab === 'enderecos' && (
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Meus Endereços</h2>
                    <button className="bg-[#F9A01B] hover:bg-[#FF8C00] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      + Adicionar Endereço
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Endereço Principal */}
                    <div className="p-4 border-2 border-[#F9A01B] rounded-xl bg-orange-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <MapPin className="text-[#F9A01B] mt-1" size={20} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-800">Casa</p>
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                Principal
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Rua das Flores, 123</p>
                            <p className="text-sm text-gray-600">Jardim Primavera - São Paulo, SP</p>
                            <p className="text-sm text-gray-600">CEP: 01234-567</p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-[#F9A01B]">
                          <Settings size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Endereço Trabalho */}
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-[#F9A01B] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <MapPin className="text-gray-600 mt-1" size={20} />
                          <div>
                            <p className="font-medium text-gray-800 mb-1">Trabalho</p>
                            <p className="text-sm text-gray-600">Av. Paulista, 1000</p>
                            <p className="text-sm text-gray-600">Bela Vista - São Paulo, SP</p>
                            <p className="text-sm text-gray-600">CEP: 01310-100</p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-[#F9A01B]">
                          <Settings size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Endereço Pais */}
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-[#F9A01B] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <MapPin className="text-gray-600 mt-1" size={20} />
                          <div>
                            <p className="font-medium text-gray-800 mb-1">Casa dos Pais</p>
                            <p className="text-sm text-gray-600">Rua dos Lírios, 456</p>
                            <p className="text-sm text-gray-600">Vila Mariana - São Paulo, SP</p>
                            <p className="text-sm text-gray-600">CEP: 04567-890</p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-[#F9A01B]">
                          <Settings size={18} />
                        </button>
                      </div>
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
