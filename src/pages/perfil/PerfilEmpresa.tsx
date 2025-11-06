import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Building2, Mail, Phone, MapPin, Save, X, Loader2, Settings, ArrowLeft, LogOut } from "lucide-react"
import { atualizarEmpresa, obterDadosUsuario, buscarDadosEstabelecimentoAtualizado } from "../../services/apiServicesFixed"
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
          setRazaoSocial(dadosAtualizados.razao_social || "")
          setEndereco(dadosAtualizados.endereco || "")
          
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
          setRazaoSocial(dadosUsuario.razao_social || "")
          setEndereco(dadosUsuario.endereco || "")
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
      if (razaoSocial.trim()) payload.razao_social = razaoSocial.trim()
      if (endereco.trim()) payload.endereco = endereco.trim()
      if (senha.trim()) payload.senha = senha.trim()

      const response = await atualizarEmpresa(payload)
      
      if (response.status) {
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
            setRazaoSocial(dadosAtualizados.razao_social || "")
            setEndereco(dadosAtualizados.endereco || "")
            console.log('✅ [PerfilEmpresa] Dados recarregados com sucesso')
          }
        } catch (error) {
          console.error('⚠️ [PerfilEmpresa] Erro ao recarregar dados:', error)
        }
        
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header Elegante */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard-empresa')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                  title="Voltar ao Dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Perfil da Empresa
                  </h1>
                  <p className="text-orange-100 mt-1">Gerencie as informações da sua empresa</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                    <Building2 className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="pt-20 px-6 md:px-8 pb-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Pessoa Jurídica</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">✓ Verificado</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{nome || "Sua Empresa"}</h2>
                <p className="text-gray-500">{email || "email@empresa.com"}</p>
              </div>

              {/* Formulário Organizado */}
              <div className="space-y-6">
                {/* Seção: Dados Principais */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-orange-600" />
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

                    {/* Razão Social */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Razão Social</label>
                      <input
                        type="text"
                        placeholder="Razão social da empresa"
                        value={razaoSocial}
                        onChange={(e) => setRazaoSocial(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>

                    {/* Endereço */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Endereço Completo</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
                        <input
                          type="text"
                          placeholder="Rua, número, bairro, cidade - UF"
                          value={endereco}
                          onChange={(e) => setEndereco(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção: Segurança */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-200">Segurança</h3>
                  <p className="text-sm text-gray-600 mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    💡 <strong>Dica:</strong> Deixe os campos em branco para manter sua senha atual
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nova Senha */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nova Senha</label>
                      <input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-gray-50 focus:bg-white"
                        minLength={6}
                      />
                    </div>

                    {/* Confirmar Senha */}
                    {senha && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Senha</label>
                        <input
                          type="password"
                          placeholder="Digite a senha novamente"
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-gray-50 focus:bg-white"
                        />
                      </div>
                    )}
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

export default PerfilEmpresa
