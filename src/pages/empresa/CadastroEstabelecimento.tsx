import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { useUser } from "../../contexts/UserContext"
import { cadastrarEstabelecimento } from "../../services/apiServicesFixed"
import type { estabelecimentoRequest } from "../../services/types"

// Componente Input personalizado
const InputField = ({ label, name, value, onChange, placeholder, required = false, type = "text" }: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  type?: string
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
)

// Componente Button personalizado
const ButtonComponent = ({ children, onClick, variant = "primary", disabled = false, type = "button" }: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary"
  disabled?: boolean
  type?: "button" | "submit"
}) => {
  const baseClasses = "px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  const variantClasses = variant === "primary" 
    ? "bg-blue-600 text-white hover:bg-blue-700" 
    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
    >
      {children}
    </button>
  )
}

export function CadastroEstabelecimento() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [verificandoEstabelecimento, setVerificandoEstabelecimento] = useState(true)
  const [jaTemEstabelecimento, setJaTemEstabelecimento] = useState(false)
  const [estabelecimentoExistente, setEstabelecimentoExistente] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    telefone: ''
  })

  // Verificar se usuário já tem estabelecimento e pré-preencher CNPJ
  useEffect(() => {
    // Verifica se o estabelecimento no localStorage pertence ao usuário atual
    const estabelecimentoId = localStorage.getItem('estabelecimentoId')
    const estabelecimentoNome = localStorage.getItem('estabelecimentoNome')
    const estabelecimentoUserId = localStorage.getItem('estabelecimentoUserId')
    
    // Se existe estabelecimento mas é de outro usuário, limpa o localStorage
    if (estabelecimentoUserId && user && parseInt(estabelecimentoUserId) !== user.id) {
      console.log('🧹 CadastroEstabelecimento: Limpando estabelecimento de outro usuário:', estabelecimentoUserId, '!==', user.id)
      localStorage.removeItem('estabelecimentoId')
      localStorage.removeItem('estabelecimentoNome')
      localStorage.removeItem('estabelecimentoUserId')
      setJaTemEstabelecimento(false)
      setEstabelecimentoExistente(null)
    }
    // Se tem estabelecimento do usuário atual, usa ele
    else if (estabelecimentoId && estabelecimentoNome && estabelecimentoUserId && user?.perfil === 'estabelecimento' && parseInt(estabelecimentoUserId) === user.id) {
      // Se tem ID E NOME salvos do usuário atual, marca como já tendo estabelecimento
      setJaTemEstabelecimento(true)
      setEstabelecimentoExistente({
        id: parseInt(estabelecimentoId),
        nome: estabelecimentoNome,
        cnpj: user.cnpj || '',
        telefone: user.telefone || ''
      })
    } else if (user?.cnpj && user.cnpj.replace(/\D/g, '').length === 14) {
      // Pré-preenche o CNPJ do usuário no formulário (apenas se tiver 14 dígitos)
      const cnpjFormatado = user.cnpj
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18)
      
      setFormData(prev => ({ ...prev, cnpj: cnpjFormatado }))
    }
    
    setVerificandoEstabelecimento(false)
  }, [user])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Formatação específica para CNPJ
    if (name === 'cnpj') {
      const cnpjFormatado = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18)
      
      setFormData(prev => ({ ...prev, [name]: cnpjFormatado }))
      return
    }

    // Formatação específica para telefone
    if (name === 'telefone') {
      const telefoneFormatado = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15)
      
      setFormData(prev => ({ ...prev, [name]: telefoneFormatado }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validarCNPJ = (cnpj: string): boolean => {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    
    if (cnpjLimpo.length !== 14) return false
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false

    // Validação dos dígitos verificadores
    let soma = 0
    let peso = 2
    
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cnpjLimpo[i]) * peso
      peso = peso === 9 ? 2 : peso + 1
    }
    
    const digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    
    soma = 0
    peso = 2
    
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cnpjLimpo[i]) * peso
      peso = peso === 9 ? 2 : peso + 1
    }
    
    const digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    
    return digito1 === parseInt(cnpjLimpo[12]) && digito2 === parseInt(cnpjLimpo[13])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // Validações
    if (!formData.nome.trim()) {
      setMessage({ type: 'error', text: 'Nome do estabelecimento é obrigatório' })
      return
    }

    if (!formData.cnpj.trim()) {
      setMessage({ type: 'error', text: 'CNPJ é obrigatório' })
      return
    }

    if (!validarCNPJ(formData.cnpj)) {
      setMessage({ type: 'error', text: 'CNPJ inválido' })
      return
    }

    try {
      setLoading(true)

      const estabelecimentoData: estabelecimentoRequest = {
        nome: formData.nome.trim(),
        cnpj: formData.cnpj.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, '') || undefined
      }
      
      console.log('📤 Payload final:', estabelecimentoData)

      const response = await cadastrarEstabelecimento(estabelecimentoData)
      
      if (response.status) {
        const estabelecimentoId = response.id || response.data?.id
        console.log('✅ ID do estabelecimento:', estabelecimentoId)
        
        // Salva o ID, NOME e USER_ID do estabelecimento no localStorage
        if (estabelecimentoId && user) {
          localStorage.setItem('estabelecimentoId', estabelecimentoId.toString())
          localStorage.setItem('estabelecimentoNome', formData.nome)
          localStorage.setItem('estabelecimentoUserId', user.id.toString())
          console.log('✅ Estabelecimento salvo para usuário:', user.id)
        }
        
        setMessage({ type: 'success', text: 'Estabelecimento cadastrado com sucesso!' })
        
        // Atualiza o estado para mostrar que já tem estabelecimento
        setJaTemEstabelecimento(true)
        setEstabelecimentoExistente({
          id: estabelecimentoId,
          nome: formData.nome,
          cnpj: formData.cnpj,
          telefone: formData.telefone
        })
      } else {
        setMessage({ type: 'error', text: response.message || 'Erro ao cadastrar estabelecimento' })
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar estabelecimento:', error)
      
      let mensagemErro = 'Erro ao cadastrar estabelecimento. Tente novamente.'
      
      // Verifica se é erro de CNPJ duplicado
      if (error.response?.status === 500) {
        mensagemErro = 'Este CNPJ já possui um estabelecimento cadastrado. Cada CNPJ pode ter apenas um estabelecimento.'
      } else if (error.response?.data?.message) {
        mensagemErro = error.response.data.message
      }
      
      setMessage({ 
        type: 'error', 
        text: mensagemErro
      })
    } finally {
      setLoading(false)
    }
  }

  // Verificar se usuário tem permissão
  if (user?.perfil !== 'estabelecimento') {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
            <p className="text-gray-600 mb-6">Esta funcionalidade é exclusiva para usuários jurídicos.</p>
            <ButtonComponent onClick={() => navigate('/')}>
              Voltar ao Início
            </ButtonComponent>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  // Loading de verificação
  if (verificandoEstabelecimento) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando estabelecimento...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  // Se já tem estabelecimento
  if (jaTemEstabelecimento && estabelecimentoExistente) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Estabelecimento Cadastrado</h1>
              <p className="text-gray-600">Você já possui um estabelecimento cadastrado</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                {estabelecimentoExistente.nome}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {estabelecimentoExistente.cnpj && (
                  <div>
                    <span className="font-medium text-gray-700">CNPJ:</span>
                    <span className="ml-2 text-gray-600">{estabelecimentoExistente.cnpj}</span>
                  </div>
                )}
                {estabelecimentoExistente.telefone && (
                  <div>
                    <span className="font-medium text-gray-700">Telefone:</span>
                    <span className="ml-2 text-gray-600">{estabelecimentoExistente.telefone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Agora você pode cadastrar produtos para seu estabelecimento!
              </p>
              <div className="flex gap-4 justify-center">
                <ButtonComponent 
                  onClick={() => navigate('/empresa/cadastro-promocao')} 
                  variant="primary"
                >
                  Cadastrar Produtos
                </ButtonComponent>
                <ButtonComponent 
                  onClick={() => navigate('/HomeInicial')} 
                  variant="secondary"
                >
                  Voltar ao Início
                </ButtonComponent>
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  // Formulário de cadastro
  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Cadastrar Estabelecimento</h1>
            <p className="text-gray-600">
              Cadastre seu estabelecimento para começar a vender produtos na plataforma
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do Estabelecimento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Dados do Estabelecimento</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Preencha os dados básicos do seu estabelecimento. Apenas um estabelecimento por CNPJ.
                </p>
              </div>
              
              <div className="md:col-span-2">
                <InputField
                  label="Nome do Estabelecimento"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: Supermercado Central"
                  required
                />
              </div>

              {user?.cnpj && user.cnpj.replace(/\D/g, '').length === 14 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    readOnly
                    disabled
                    placeholder="00.000.000/0000-00"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                    title="CNPJ do seu cadastro (não editável)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ℹ️ CNPJ vinculado ao seu cadastro
                  </p>
                </div>
              ) : (
                <InputField
                  label="CNPJ"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0000-00"
                  required
                />
              )}

              <InputField
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <ButtonComponent
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Estabelecimento'}
              </ButtonComponent>
              
              <ButtonComponent
                type="button"
                variant="secondary"
                onClick={() => navigate('/HomeInicial')}
                disabled={loading}
              >
                Cancelar
              </ButtonComponent>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CadastroEstabelecimento
