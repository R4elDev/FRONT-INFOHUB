import bolalaranjaCadastro from '../assets/bolalaranjaCadastro.png'
import bolaLaranjaEntrarCadastro from '../assets/bolaLaranjaEntrarCadastro.png'
import bolavermelhaCadastro from '../assets/bolavermelhaCadastro.png'
import muiemexendonoscompuiter from '../assets/muiemexendonoscompuiter.png'

import { Button } from '../components/ui/button'
import { Input } from "../components/ui/input"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from 'react-router-dom'

import { cadastrarUsuario } from "../services/requests"
import type { cadastroRequest } from "../services/types"

type TipoPessoa = 'consumidor' | 'admin' | 'estabelecimento'

function Cadastro() {
  const navigate = useNavigate()
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>('consumidor')

  // Estados gerais
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [celular, setCelular] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')

  // Senhas
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Feedback
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Validações simples
  const senhasIguais = senha === confirmarSenha
  const mostrarErro = confirmarSenha.length > 0 && !senhasIguais

  const handleToggle = (tipo: TipoPessoa) => {
    setTipoPessoa(tipo)
    setCpf('')
    setCnpj('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!senhasIguais) {
      setErrorMsg("As senhas não coincidem")
      return
    }

    // Validações adicionais
    if (!nome || !email || !senha || (tipoPessoa === 'consumidor' && !cpf) || (tipoPessoa === 'estabelecimento' && !cnpj)) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios")
      return
    }

    const payload: cadastroRequest = {
      nome,
      email,
      senha_hash: senha,
      perfil: tipoPessoa, // Usa o tipo de pessoa diretamente
      cpf: tipoPessoa === "consumidor" ? cpf : null,
      cnpj: tipoPessoa === "estabelecimento" ? cnpj : null,
      telefone: celular || null, // Inclui o telefone
      data_nascimento: dataNascimento || new Date().toISOString().split('T')[0] // Data atual se não informada
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
    <div className='h-screen w-screen overflow-hidden flex flex-col'>
      <div className='bg-[#FFFF] relative min-h-screen'>
        {/* Imagens decorativas */}
        <img src={bolalaranjaCadastro} alt="bola laranja" className="absolute top-0 right-0 w-40 sm:w-52 md:w-94 max-w-full" />
        <img src={bolavermelhaCadastro} alt="bola vermelha" className="absolute top-36 left-0 w-16 sm:w-28 md:w-66 max-w-full" />

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <img
            src={muiemexendonoscompuiter}
            alt="mulher mexendo no computador"
            className="w-auto h-[80%] object-contain"
          />

          {/* Toggle Pessoa */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-6">
            <button
              onClick={() => handleToggle('consumidor')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                tipoPessoa === 'consumidor'
                  ? 'text-white bg-orange-500 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pessoa Física
            </button>
            <button
              onClick={() => handleToggle('estabelecimento')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                tipoPessoa === 'estabelecimento'
                  ? 'text-white bg-orange-500 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pessoa Jurídica
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            {tipoPessoa === 'consumidor' ? (
              <>
                <Input
                  placeholder="Nome completo *"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px]"
                />
                <Input
                  placeholder="CPF *"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px]"
                />
                <Input
                  placeholder="E-mail *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px]"
                />
                <Input
                  placeholder="Celular *"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px]"
                />
              </>
            ) : (
              <>
                <Input
                  placeholder="CNPJ *"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px]"
                />
                <Input
                  placeholder="Nome *"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px]"
                />
                <Input
                  placeholder="E-mail *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px]"
                />
              </>
            )}

            {/* Campo Senha */}
            <div className="relative">
              <Input
                placeholder="Senha *"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirmar Senha */}
            <div>
              <Input
                placeholder="Confirme a senha *"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className={`h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px] ${
                  mostrarErro ? "border-2 border-red-400" : ""
                }`}
              />
              {mostrarErro && (
                <p className="text-red-500 text-sm mt-1 px-2">❌ As senhas não coincidem</p>
              )}
              {senhasIguais && senha.length > 0 && confirmarSenha.length > 0 && (
                <p className="text-green-500 text-sm mt-1 px-2">✅ Senhas coincidem</p>
              )}
            </div>

            {/* Feedback */}
            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
            {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

            {/* Botão */}
            <Button
              type="submit"
              disabled={loading || mostrarErro}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {loading ? "Cadastrando..." : tipoPessoa === "estabelecimento" ? "Cadastrar" : "Cadastrar Empresa"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Cadastro