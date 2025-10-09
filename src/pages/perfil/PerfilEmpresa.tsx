import { useState, useEffect } from "react"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { useRouteProtection } from "../../hooks/useUserRedirect"
import { getLoggedUserData } from "../../services/requests"
import { PROFESSIONAL_LIMITS } from "../../utils/validation"

function PerfilEmpresa() {
  const { hasAccess } = useRouteProtection('estabelecimento')
  
  const [cnpj, setCnpj] = useState<string>("")
  const [nomeEmpresa, setNomeEmpresa] = useState<string>("")
  const [razaoSocial, setRazaoSocial] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [telefone, setTelefone] = useState<string>("")
  const [endereco, setEndereco] = useState<string>("")
  const [senha, setSenha] = useState<string>("")
  const [confirmarSenha, setConfirmarSenha] = useState<string>("")

  // Carregar dados da empresa logada
  useEffect(() => {
    const userData = getLoggedUserData()
    if (userData) {
      setNomeEmpresa(userData.nome || "")
      setEmail(userData.email || "")
      setCnpj(userData.cnpj || "")
      setTelefone(userData.telefone || "")
      setEndereco(userData.endereco || "")
      setRazaoSocial(userData.razao_social || "")
    }
  }, [])

  // Se não tem acesso, não renderiza nada (redirecionamento automático)
  if (!hasAccess) {
    return null
  }

  const handleSalvar = () => {
    // Aqui virá a lógica de salvar via API
    console.log("Salvando perfil empresa:", { cnpj, nomeEmpresa, razaoSocial, email, telefone, endereco })
  }

  const handleCancelar = () => {
    // Limpar campos
    setCnpj("")
    setNomeEmpresa("")
    setRazaoSocial("")
    setEmail("")
    setTelefone("")
    setEndereco("")
    setSenha("")
    setConfirmarSenha("")
  }

  return (
    <SidebarLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8">
          {/* Título */}
          <h1 className="text-3xl font-bold text-[#F9A01B] text-center mb-8">
            PERFIL DA EMPRESA
          </h1>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo da Empresa */}
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center shadow-xl">
                <div className="w-36 h-36 rounded-full bg-white flex items-center justify-center">
                  <svg
                    className="w-20 h-20 text-[#F9A01B]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Logo da Empresa</p>
            </div>

            {/* Formulário */}
            <div className="flex-1 space-y-4 w-full">
              {/* CNPJ */}
              <input
                type="text"
                placeholder="CNPJ*"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] text-gray-700"
                maxLength={18}
              />

              {/* Nome da Empresa */}
              <input
                type="text"
                placeholder="Nome da Empresa*"
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
                maxLength={PROFESSIONAL_LIMITS.NOME_EMPRESA_MAX}
                className="w-full px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] text-gray-700"
              />

              {/* Razão Social */}
              <input
                type="text"
                placeholder="Razão Social*"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                maxLength={PROFESSIONAL_LIMITS.RAZAO_SOCIAL_MAX}
                className="w-full px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] text-gray-700"
              />

              {/* Email */}
              <input
                type="email"
                placeholder="Email*"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={PROFESSIONAL_LIMITS.EMAIL_MAX}
                className="w-full px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] text-gray-700"
              />

              {/* Telefone */}
              <input
                type="tel"
                placeholder="Telefone*"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                maxLength={PROFESSIONAL_LIMITS.TELEFONE_MAX}
                className="w-full px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F9A01B] text-gray-700"
              />

              {/* Endereço */}
              <input
                type="text"
                placeholder="Endereço Completo*"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                maxLength={PROFESSIONAL_LIMITS.ENDERECO_MAX}
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
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
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

export default PerfilEmpresa
