import bolalaranjaCadastro from '../../assets/bolalaranjaCadastro.png'
import bolavermelhaCadastro from '../../assets/bolavermelhaCadastro.png'
import muiemexendonoscompuiter from '../../assets/muiemexendonoscompuiter.png'

import { Button } from '../../components/ui/button'
import { Input } from "../../components/ui/input"
import { useState } from "react"
import { Eye, EyeOff, User, CreditCard, Building2, Shield, Star, Sparkles, Zap, CheckCircle, UserCircle, Loader2, Mail, Phone, Lock } from "lucide-react"
import { useNavigate } from 'react-router-dom'

import { cadastrarUsuario, login } from "../../services/requests"
import type { cadastroRequest } from "../../services/types"
import { ROUTES } from "../../utils/constants"
import { validateCadastro } from "../../utils/validation"
import { formatCPF, formatCNPJ, formatPhone } from "../../utils/formatters"
import toast from 'react-hot-toast'

type TipoPessoa = 'consumidor' | 'estabelecimento'

function Cadastro() {
  const navigate = useNavigate()
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>('consumidor')

  // Estados gerais
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [telefone, setTelefone] = useState('')

  // Senhas
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Feedback
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const senhasIguais = senha === confirmarSenha
  const mostrarErro = confirmarSenha.length > 0 && !senhasIguais

  const handleToggle = (tipo: TipoPessoa) => {
    setTipoPessoa(tipo)
    setCpf('')
    setCnpj('')
    setTelefone('')
  }

  // Handlers para formatação de inputs
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      setCpf(formatCPF(value))
    }
  }

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 14) {
      setCnpj(formatCNPJ(value))
    }
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      setTelefone(formatPhone(value))
    }
  }

  // Função para lidar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    // Validação usando sistema centralizado
    const validation = validateCadastro({
      nome,
      email,
      senha,
      confirmarSenha,
      telefone,
      cpf,
      cnpj,
      tipoPessoa
    })

    if (!validation.isValid) {
      const firstError = validation.errors[0]
      setErrorMsg(firstError.message)
      toast.error(firstError.message)
      return
    }

    const payload: cadastroRequest = tipoPessoa === "consumidor" 
      ? {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha_hash: senha,
          perfil: tipoPessoa,
          cpf: cpf.replace(/[^\d]/g, ''),
          telefone: telefone.replace(/[^\d]/g, ''),
          data_nascimento: new Date().toISOString().split('T')[0]
        }
      : {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha_hash: senha,
          perfil: tipoPessoa,
          cnpj: cnpj.replace(/[^\d]/g, ''),
          telefone: telefone.replace(/[^\d]/g, ''),
          data_nascimento: new Date().toISOString().split('T')[0] // Data atual para empresas
        }

    console.log("📤 Enviando payload:", payload)

    try {
      setLoading(true)
      const res = await cadastrarUsuario(payload)
      console.log("📥 Resposta do servidor:", res)

      if (res.status) {
        setSuccessMsg(res.message)
        toast.success(res.message)
        
        // Tenta obter o ID da resposta direta
        let userId = res.id || res.data?.id
        
        // Se não retornou o ID, faz login automático para obter
        if (!userId) {
          console.log('🔄 ID não retornado, fazendo login automático...')
          try {
            const loginRes = await login({
              email: payload.email,
              senha: payload.senha_hash
            })
            
            if (loginRes.status && loginRes.usuario) {
              userId = loginRes.usuario.id
              console.log('✅ ID obtido via login:', userId)
            }
          } catch (loginErr) {
            console.error('❌ Erro ao fazer login automático:', loginErr)
          }
        }
        
        // Salva o ID do usuário no localStorage
        if (userId) {
          localStorage.setItem('usuarioCadastrado', JSON.stringify({
            id: userId,
            nome: payload.nome,
            email: payload.email,
            perfil: payload.perfil
          }))
          console.log('✅ ID do usuário salvo no localStorage:', userId)
          setTimeout(() => navigate(ROUTES.CADASTRO_ENDERECO), 1000)
        } else {
          console.error('❌ Não foi possível obter o ID do usuário')
          toast.error('Cadastro realizado, mas houve um problema. Por favor, faça login manualmente.')
          setTimeout(() => navigate(ROUTES.LOGIN), 2000)
        }
      } else {
        setErrorMsg(res.message)
        toast.error(res.message)
      }
    } catch (err: any) {
      console.error("❌ Erro completo:", err)
      console.error("❌ Resposta do erro:", err.response?.data)
      const errorMessage = err.response?.data?.message || "Erro ao cadastrar, tente novamente."
      setErrorMsg(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br from-orange-50 via-white to-yellow-50 relative'>
      {/* Gradientes decorativos */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-300/20 to-yellow-300/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-orange-300/20 to-red-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      
      {/* Badges de status */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fadeInLeft z-20">
        <Shield className="w-4 h-4 text-green-600" />
        <span className="text-xs font-bold text-gray-700">Cadastro Seguro</span>
      </div>
      
      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full shadow-lg flex items-center gap-1 animate-fadeInRight z-20">
        <Star className="w-4 h-4 text-white fill-white" />
        <span className="text-xs font-bold text-white">Fácil</span>
      </div>
      
      {/* Imagens decorativas flutuantes */}
      <img src={bolalaranjaCadastro} alt="bola laranja" className="absolute top-0 right-0 w-20 sm:w-24 md:w-28 animate-float drop-shadow-xl z-10" />
      <img src={bolavermelhaCadastro} alt="bola vermelha" className="absolute top-20 sm:top-24 md:top-28 left-0 w-12 sm:w-14 md:w-16 animate-float-reverse drop-shadow-xl z-10" />
      
      {/* Partículas flutuantes */}
      <div className="absolute top-32 right-16 animate-float opacity-15 z-10">
        <Sparkles className="w-6 h-6 text-orange-500" />
      </div>
      <div className="absolute bottom-32 left-16 animate-float-reverse opacity-15 z-10" style={{animationDelay: '1s'}}>
        <Zap className="w-5 h-5 text-orange-500" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 relative z-10 overflow-y-auto">
        {/* Imagem com glow */}
        <div className="relative mb-4 animate-scaleIn">
          <div className="absolute inset-0 bg-orange-400/20 blur-2xl rounded-full" />
          <img
            src={muiemexendonoscompuiter}
            alt="mulher mexendo no computador"
            className="relative w-auto h-[120px] sm:h-[140px] md:h-[160px] object-contain drop-shadow-2xl"
          />
        </div>
        
        {/* Título */}
        <div className="text-center mb-4 animate-fadeInDown">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-lg">
              Crie sua conta
            </h1>
            <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" style={{animationDelay: '0.5s'}} />
          </div>
          <p className="text-sm text-gray-600 flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Rápido, fácil e seguro
          </p>
        </div>

        {/* Toggle Pessoa Premium */}
        <div className="flex bg-white/90 backdrop-blur-sm rounded-full p-1.5 mb-6 shadow-xl animate-fadeInUp border-2 border-orange-200">
          <button
            onClick={() => handleToggle('consumidor')}
            className={`px-5 sm:px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              tipoPessoa === 'consumidor'
                ? 'text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <UserCircle className="w-4 h-4" />
            Pessoa Física
          </button>
          <button
            onClick={() => handleToggle('estabelecimento')}
            className={`px-5 sm:px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              tipoPessoa === 'estabelecimento'
                ? 'text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Pessoa Jurídica
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          {tipoPessoa === 'consumidor' ? (
            <>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <User className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <Input 
                  placeholder="Nome completo *" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100" />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <CreditCard className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <Input 
                  placeholder="CPF *" 
                  value={cpf} 
                  onChange={handleCpfChange}
                  onKeyDown={handleKeyPress}
                  maxLength={14}
                  className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100" />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <Input 
                  placeholder="Telefone *" 
                  value={telefone} 
                  onChange={handleTelefoneChange}
                  onKeyDown={handleKeyPress}
                  maxLength={15}
                  className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100" />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <Input 
                  placeholder="E-mail *" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100" />
              </div>
            </>
          ) : (
            <>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Building2 className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <Input 
                  placeholder="Nome Da Empresa *" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100" />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <CreditCard className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <Input 
                  placeholder="CNPJ *" 
                  value={cnpj} 
                  onChange={handleCnpjChange}
                  onKeyDown={handleKeyPress}
                  maxLength={18}
                  className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100" />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <Input 
                  placeholder="Telefone *" 
                  value={telefone} 
                  onChange={handleTelefoneChange}
                  onKeyDown={handleKeyPress}
                  maxLength={15}
                  className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100" />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <Input 
                  placeholder="E-mail *" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100" />
              </div>
            </>
          )}

            {/* Senha */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <Input 
                placeholder="Senha *" 
                type={showPassword ? "text" : "password"} 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={handleKeyPress}
                className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-12 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100" />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-all hover:scale-125 z-10 p-1 hover:bg-orange-50 rounded-full"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <Input 
                placeholder="Confirme a senha *" 
                type="password" 
                value={confirmarSenha} 
                onChange={(e) => setConfirmarSenha(e.target.value)}
                onKeyDown={handleKeyPress}
                className={`h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 ${mostrarErro ? "border-red-400" : "border-gray-100"}`} />
            </div>

            {mostrarErro && <p className="text-red-500 text-sm mt-1 px-2">❌ As senhas não coincidem</p>}
            {senhasIguais && senha.length > 0 && confirmarSenha.length > 0 && <p className="text-green-500 text-sm mt-1 px-2">✅ Senhas coincidem</p>}


            {errorMsg && (
              <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-2xl text-center animate-shake shadow-xl border-2 border-red-400">
                <p className="text-sm font-semibold">{errorMsg}</p>
              </div>
            )}
            {successMsg && (
              <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-2xl text-center animate-pulse shadow-xl border-2 border-green-400">
                <p className="text-sm font-semibold">{successMsg}</p>
              </div>
            )}

          <Button 
            type="submit" 
            disabled={loading || mostrarErro}
            className="w-full h-[56px] rounded-full text-[18px] font-bold text-white transition-all duration-300 overflow-hidden group shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 ring-2 ring-orange-300 hover:ring-orange-400 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #FF8C00 0%, #FFA726 50%, #FF8C00 100%)',
              backgroundSize: '200% 100%'
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  {tipoPessoa === "estabelecimento" ? "Cadastrar Empresa" : "Cadastrar"}
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Button>
          
          {/* Hint Enter */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200">
              <p className="text-[11px] text-orange-700 font-semibold flex items-center gap-2">
                <Zap className="w-3 h-3" />
                Pressione <kbd className="px-2 py-0.5 bg-orange-200 rounded text-[10px] font-mono">Enter</kbd> para cadastrar
              </p>
            </div>
          </div>
          </form>

          
        
      </div>
    </div>
  )
}

export default Cadastro
