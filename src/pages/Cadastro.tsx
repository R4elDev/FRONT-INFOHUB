import bolalaranjaCadastro from '../assets/bolalaranjaCadastro.png'
import bolavermelhaCadastro from '../assets/bolavermelhaCadastro.png'
import muiemexendonoscompuiter from '../assets/muiemexendonoscompuiter.png'

import { Button } from '../components/ui/button'
import { Input } from "../components/ui/input"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from 'react-router-dom'

import { cadastrarUsuario } from "../services/requests"
import type { cadastroRequest } from "../services/types"

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!senhasIguais) {
      setErrorMsg("As senhas não coincidem")
      return
    }

    if (!nome || !email || !senha || !telefone || (tipoPessoa === 'consumidor' && !cpf) || (tipoPessoa === 'estabelecimento' && !cnpj)) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios")
      return
    }

    const payload: cadastroRequest = {
      nome,
      email,
      senha_hash: senha,
      perfil: tipoPessoa,
      cpf: tipoPessoa === "consumidor" ? cpf : null,
      cnpj: tipoPessoa === "estabelecimento" ? cnpj : null,
      telefone: telefone,
      data_nascimento: new Date().toISOString().split('T')[0]
    }

    try {
      setLoading(true)
      const res = await cadastrarUsuario(payload)

      if (res.status) {
        setSuccessMsg(res.message)
        setTimeout(() => navigate("/CadastroDeEndereco"), 1000)
      } else {
        setErrorMsg(res.message)
      }
    } catch (err: any) {
      setErrorMsg("Erro ao cadastrar, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='h-screen w-screen overflow-hidden flex flex-col bg-white'>
      {/* Imagens decorativas flutuantes */}
      <img src={bolalaranjaCadastro} alt="bola laranja" className="absolute top-0 right-0 w-24 sm:w-32 md:w-40 lg:w-52 animate-float-slow" />
      <img src={bolavermelhaCadastro} alt="bola vermelha" className="absolute top-20 sm:top-28 md:top-36 left-0 w-12 sm:w-16 md:w-20 lg:w-28 animate-float-fast" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 relative z-10 overflow-y-auto">
        <img
          src={muiemexendonoscompuiter}
          alt="mulher mexendo no computador"
          className="w-auto h-[15%] sm:h-[20%] md:h-[25%] object-contain animate-zoom-in mb-4"
        />

        {/* Toggle Pessoa */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-4 sm:mb-6 shadow-md animate-slide-up">
          <button
            onClick={() => handleToggle('consumidor')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
              tipoPessoa === 'consumidor'
                ? 'text-white bg-green-500 shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pessoa Física
          </button>
          <button
            onClick={() => handleToggle('estabelecimento')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
              tipoPessoa === 'estabelecimento'
                ? 'text-white bg-green-500 shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pessoa Jurídica
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 sm:space-y-4 animate-fade-in">
          {tipoPessoa === 'consumidor' ? (
            <>
              <Input 
                placeholder="Nome completo *" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)}
                className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[10px] text-[16px] sm:text-[18px] md:text-[22px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[18px] md:placeholder:text-[20px] 
                          focus:ring-2 focus:ring-orange-500 transition-all duration-300 shadow-md hover:scale-[1.02]" />

              <Input 
                placeholder="CPF *" 
                value={cpf} 
                onChange={(e) => setCpf(e.target.value)}
                className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[10px] text-[16px] sm:text-[18px] md:text-[22px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[18px] md:placeholder:text-[20px] 
                          focus:ring-2 focus:ring-orange-500 transition-all duration-300 shadow-md hover:scale-[1.02]" />

              <Input 
                placeholder="Telefone *" 
                value={telefone} 
                onChange={(e) => setTelefone(e.target.value)}
                className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[10px] text-[16px] sm:text-[18px] md:text-[22px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[18px] md:placeholder:text-[20px] 
                          focus:ring-2 focus:ring-orange-500 transition-all duration-300 shadow-md hover:scale-[1.02]" />

              <Input 
                placeholder="E-mail *" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[10px] text-[16px] sm:text-[18px] md:text-[22px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[18px] md:placeholder:text-[20px] 
                          focus:ring-2 focus:ring-orange-500 transition-all duration-300 shadow-md hover:scale-[1.02]" />
            </>
          ) : (
            <>
              <Input 
                placeholder="Nome Da Empresa *" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)}
                className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[10px] text-[16px] sm:text-[18px] md:text-[22px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[18px] md:placeholder:text-[20px] 
                          focus:ring-2 focus:ring-orange-500 transition-all duration-300 shadow-md hover:scale-[1.02]" />

              <Input 
                placeholder="CNPJ *" 
                value={cnpj} 
                onChange={(e) => setCnpj(e.target.value)}
                className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[10px] text-[16px] sm:text-[18px] md:text-[22px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[18px] md:placeholder:text-[20px] 
                          focus:ring-2 focus:ring-orange-500 transition-all duration-300 shadow-md hover:scale-[1.02]" />

              <Input 
                placeholder="Telefone *" 
                value={telefone} 
                onChange={(e) => setTelefone(e.target.value)}
                className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[10px] text-[16px] sm:text-[18px] md:text-[22px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[18px] md:placeholder:text-[20px] 
                          focus:ring-2 focus:ring-orange-500 transition-all duration-300 shadow-md hover:scale-[1.02]" />

              <Input 
                placeholder="E-mail *" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[10px] text-[16px] sm:text-[18px] md:text-[22px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[18px] md:placeholder:text-[20px] 
                          focus:ring-2 focus:ring-orange-500 transition-all duration-300 shadow-md hover:scale-[1.02]" />
            </>
          )}

            {/* Senha */}
            <div className="relative">
              <Input 
                placeholder="Senha *" 
                type={showPassword ? "text" : "password"} 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)}
                className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[10px] text-[16px] sm:text-[18px] md:text-[22px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[18px] md:placeholder:text-[20px] 
                          focus:ring-2 focus:ring-orange-500 transition-all duration-300 shadow-md hover:scale-[1.02]" />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors"
              >
                {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
              </button>
            </div>

            <Input 
              placeholder="Confirme a senha *" 
              type="password" 
              value={confirmarSenha} 
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className={`h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[10px] text-[16px] sm:text-[18px] md:text-[22px] px-4 sm:px-6 placeholder:text-[16px] sm:placeholder:text-[18px] md:placeholder:text-[20px] 
                        focus:ring-2 focus:ring-orange-500 transition-all duration-300 shadow-md hover:scale-[1.02] ${mostrarErro ? "border-2 border-red-400" : ""}`} />

            {mostrarErro && <p className="text-red-500 text-sm mt-1 px-2">❌ As senhas não coincidem</p>}
            {senhasIguais && senha.length > 0 && confirmarSenha.length > 0 && <p className="text-green-500 text-sm mt-1 px-2">✅ Senhas coincidem</p>}


            {errorMsg && <p className="text-red-500 text-sm animate-shake">{errorMsg}</p>}
          {successMsg && <p className="text-green-500 text-sm animate-pulse">{successMsg}</p>}

          <Button type="submit" disabled={loading || mostrarErro}
                  className="w-full h-[50px] sm:h-[55px] md:h-[60px] text-[16px] sm:text-[18px] md:text-[20px] bg-green-500 hover:bg-orange-600 hover:scale-105 active:scale-95 shadow-lg transition-all duration-300">
            {loading ? "Cadastrando..." : tipoPessoa === "estabelecimento" ? "Cadastrar Empresa" : "Cadastrar "}
          </Button>
          </form>

          
        
      </div>
    </div>
  )
}

export default Cadastro
