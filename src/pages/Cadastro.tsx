import bolalaranjaCadastro from '../assets/bolalaranjaCadastro.png'
import bolaLaranjaEntrarCadastro from '../assets/bolaLaranjaEntrarCadastro.png'
import bolavermelhaCadastro from '../assets/bolavermelhaCadastro.png'
import muiemexendonoscompuiter from '../assets/muiemexendonoscompuiter.png'

import { Button } from '../components/ui/button'
import { Input } from "../components/ui/input"
import { useState } from "react"

type TipoPessoa = 'fisica' | 'juridica'
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from 'react-router-dom'

function Cadastro() {
  const navigate = useNavigate()
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>('fisica')
  
  // Estados para as senhas
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  const handleToggle = (tipo: TipoPessoa) => {
    setTipoPessoa(tipo)
  }

  // Validações simples
  const senhasIguais = senha === confirmarSenha
  const mostrarErro = confirmarSenha.length > 0 && !senhasIguais

  return (
    <div className='h-screen w-screen overflow-hidden flex flex-col'>
      <div className='bg-[#FFFF] relative min-h-screen'>
        <img
          src={bolalaranjaCadastro}
          alt="bola laranja"
          className="absolute top-0 right-0"
        />
        <img
          src={bolavermelhaCadastro}
          alt="bola laranja"
          className="absolute top-36 left-0"
        />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <img
            src={muiemexendonoscompuiter}
            alt="mulher mexendo no computador"
            className="w-auto h-[80%] object-contain"
          />
          
          {/* Toggle Component */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-6">
            <button
              onClick={() => handleToggle('fisica')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                tipoPessoa === 'fisica'
                  ? 'text-white bg-orange-500 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pessoa Física
            </button>
            <button
              onClick={() => handleToggle('juridica')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                tipoPessoa === 'juridica'
                  ? 'text-white bg-orange-500 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pessoa Jurídica
            </button>
          </div>

          {/* Formulários condicionais */}
          {tipoPessoa === 'fisica' ? (
            <div className="w-full max-w-md space-y-4">
              <Input 
                placeholder="Nome completo *"
                className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px] placeholder:text-gray-400 font-[Poppins]"
              />
              <Input 
                placeholder="CPF *"
                className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px] placeholder:text-gray-400 font-[Poppins]"
              />
              <Input 
                placeholder="E-mail *" type="email" 
                className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px] placeholder:text-gray-400 font-[Poppins]"  
              />
              <Input 
                placeholder="Celular *" 
                className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px] placeholder:text-gray-400 font-[Poppins]"
              />
              
              {/* Campo Senha */}
              <Input 
                placeholder="Senha" 
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px] placeholder:text-gray-400 font-[Poppins]"  
              />
              
              {/* Campo Confirmar Senha */}
              <div>
                <Input 
                  placeholder="Confirme a senha *" 
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className={`h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px] placeholder:text-gray-400 font-[Poppins] ${
                    mostrarErro ? 'border-2 border-red-400' : ''
                  }`}
                />
                
                {/* Mensagem de erro */}
                {mostrarErro && (
                  <p className="text-red-500 text-sm mt-1 px-2">
                    ❌ As senhas não coincidem
                  </p>
                )}
                
                {/* Mensagem de sucesso */}
                {senhasIguais && senha.length > 0 && confirmarSenha.length > 0 && (
                  <p className="text-green-500 text-sm mt-1 px-2">
                    ✅ Senhas coincidem
                  </p>
                )}
              </div>
              
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                Cadastrar
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-4">
              <Input 
                placeholder="CNPJ*"
                className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px] placeholder:text-gray-400 font-[Poppins]" 
              />
              <Input 
                placeholder="Nome*" 
                className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px] placeholder:text-gray-400 font-[Poppins]"  
              />
              <Input 
                placeholder="E-mail*" 
                type="email"
                className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px] placeholder:text-gray-400 font-[Poppins]" 
              />
              
              {/* Campo Senha */}
              <Input 
                placeholder="Senha" 
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px] placeholder:text-gray-400 font-[Poppins]" 
              />
              
              {/* Campo Confirmar Senha */}
              <div>
                <Input 
                  placeholder="Confirme a senha *" 
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className={`h-[59px] bg-white rounded-[5px] text-[32px] px-6 placeholder:text-[22px] placeholder:text-gray-400 font-[Poppins] ${
                    mostrarErro ? 'border-2 border-red-400' : ''
                  }`}
                />
                
                {/* Mensagem de erro */}
                {mostrarErro && (
                  <p className="text-red-500 text-sm mt-1 px-2">
                    ❌ As senhas não coincidem
                  </p>
                )}
                
                {/* Mensagem de sucesso */}
                {senhasIguais && senha.length > 0 && confirmarSenha.length > 0 && (
                  <p className="text-green-500 text-sm mt-1 px-2">
                    ✅ Senhas coincidem
                  </p>
                )}
              </div>
              
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                Cadastrar Empresa
              </Button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}

export default Cadastro