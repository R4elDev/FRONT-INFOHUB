import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { Settings } from "lucide-react"

function PerfilUsuario() {
  const navigate = useNavigate()
  const [cpf, setCpf] = useState<string>("")
  const [nomeCompleto, setNomeCompleto] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [senha, setSenha] = useState<string>("")
  const [confirmarSenha, setConfirmarSenha] = useState<string>("")

  const handleSalvar = () => {
    // Aqui virá a lógica de salvar via API
    console.log("Salvando perfil:", { cpf, nomeCompleto, email })
  }

  const handleCancelar = () => {
    // Limpar campos
    setCpf("")
    setNomeCompleto("")
    setEmail("")
    setSenha("")
    setConfirmarSenha("")
  }

  return (
    <SidebarLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-8 relative animate-scaleIn">
          {/* Botão de Configurações */}
          <button 
            onClick={() => navigate('/configuracoes')}
            className="absolute top-4 right-4 text-gray-400 hover:text-[#F9A01B] transition-colors"
            title="Configurações"
          >
            <Settings size={24} />
          </button>

          {/* Título */}
          <h1 className="text-3xl font-bold text-[#F9A01B] text-center mb-8">
            MEU PERFIL
          </h1>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Foto de Perfil */}
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center shadow-xl animate-bounceIn hover-glow">
                <div className="w-36 h-36 rounded-full bg-white flex items-center justify-center">
                  <svg
                    className="w-20 h-20 text-[#F9A01B]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <div className="flex-1 space-y-4 w-full">
              {/* CPF */}
              <input
                type="text"
                placeholder="CPF*"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] text-gray-700"
                maxLength={14}
              />

              {/* Nome Completo */}
              <input
                type="text"
                placeholder="Nome Completo*"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                className="w-full px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] text-gray-700"
              />

              {/* Email */}
              <input
                type="email"
                placeholder="Email*"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] text-gray-700"
              />

              {/* Senha */}
              <input
                type="password"
                placeholder="Senha*"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] text-gray-700"
              />

              {/* Confirmar Senha */}
              <input
                type="password"
                placeholder="Confirme a senha *"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] text-gray-700"
              />

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSalvar}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-colors hover-scale"
                >
                  SALVAR
                </button>
                <button
                  onClick={handleCancelar}
                  className="flex-1 bg-[#F9A01B] hover:bg-[#FF8C00] text-white font-bold py-3 px-6 rounded-full transition-colors"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default PerfilUsuario
