import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { useUser } from "../../contexts/UserContext"
import { cadastrarEstabelecimento, cadastrarEnderecoEstabelecimento } from "../../services/apiServicesFixed"
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
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F9A01B] focus:border-transparent transition-all"
    />
  </div>
)

// Componente Button personalizado
const ButtonComponent = ({ children, onClick, type = "button", variant = "primary", disabled = false }: {
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit"
  variant?: "primary" | "secondary"
  disabled?: boolean
}) => {
  const baseClasses = "px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variantClasses = variant === "primary" 
    ? "bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white hover:from-[#FF8C00] hover:to-[#F9A01B] focus:ring-[#F9A01B] shadow-lg hover:shadow-xl"
    : "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400"
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
  const [buscandoCep, setBuscandoCep] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    // Campos de endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
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

  // Busca CEP via ViaCEP
  const buscarCep = async (cep: string) => {
    if (cep.length !== 8) return

    try {
      setBuscandoCep(true)
      console.log('🔍 Buscando CEP:', cep)
      
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        console.log('✅ CEP encontrado:', data)
        setFormData(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }))
        setMessage({ type: 'success', text: 'CEP encontrado! Dados preenchidos automaticamente.' })
      } else {
        console.log('❌ CEP não encontrado')
        setMessage({ type: 'error', text: 'CEP não encontrado. Verifique e tente novamente.' })
      }
    } catch (err) {
      console.error('❌ Erro ao buscar CEP:', err)
      setMessage({ type: 'error', text: 'Erro ao buscar CEP. Tente novamente.' })
    } finally {
      setBuscandoCep(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Formatação específica para CEP
    if (name === 'cep') {
      const cepFormatado = value
        .replace(/\D/g, '')
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .substring(0, 9)
      
      setFormData(prev => ({ ...prev, [name]: cepFormatado }))
      
      // Se CEP tem 8 dígitos, busca automaticamente
      const cepLimpo = value.replace(/\D/g, '')
      if (cepLimpo.length === 8) {
        buscarCep(cepLimpo)
      }
      return
    }

    // Para outros campos, apenas atualiza o valor
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Validação de CNPJ
  const validarCNPJ = (cnpj: string): boolean => {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    
    if (cnpjLimpo.length !== 14) return false
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false
    
    // Validação do primeiro dígito verificador
    let soma = 0
    let peso = 5
    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpjLimpo[i]) * peso
      peso = peso === 2 ? 9 : peso - 1
    }
    
    const digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    
    // Validação do segundo dígito verificador
    soma = 0
    peso = 6
    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpjLimpo[i]) * peso
      peso = peso === 2 ? 9 : peso - 1
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
        telefone: formData.telefone.replace(/\D/g, '') || '(00) 0000-0000'
      }
      
      console.log('📤 Payload final:', estabelecimentoData)
      console.log('📤 Dados do usuário:', user)
      console.log('📤 Token de autenticação:', localStorage.getItem('auth_token') ? 'Presente' : 'Ausente')

      const response = await cadastrarEstabelecimento(estabelecimentoData)
      console.log('📥 Resposta recebida:', response)
      
      if (response.status) {
        const estabelecimentoId = response.id
        console.log('✅ ID do estabelecimento:', estabelecimentoId)
        
        // Salva o ID, NOME e USER_ID do estabelecimento no localStorage
        if (estabelecimentoId && user) {
          localStorage.setItem('estabelecimentoId', estabelecimentoId.toString())
          localStorage.setItem('estabelecimentoNome', formData.nome)
          localStorage.setItem('estabelecimentoUserId', user.id.toString())
          console.log('✅ Estabelecimento salvo para usuário:', user.id)
        }
        
        // SEMPRE cria um endereço (mesmo que seja padrão)
        if (!user) {
          console.error('❌ Usuário não encontrado para criar endereço')
          setMessage({ type: 'success', text: 'Estabelecimento cadastrado! Erro: usuário não encontrado.' })
          return
        }
        
        try {
          console.log('📍 Criando endereço do estabelecimento...')
          console.log('📍 Dados do formulário:', {
            cep: formData.cep,
            logradouro: formData.logradouro,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado
          })
          
          // Se tem dados completos do ViaCEP, usa eles
          if (formData.cep && formData.logradouro && formData.bairro && formData.cidade && formData.estado) {
            const enderecoData = {
              id_usuario: user.id,
              cep: formData.cep.replace(/\D/g, ''),
              logradouro: formData.logradouro,
              numero: formData.numero || 'S/N',
              complemento: formData.complemento || '',
              bairro: formData.bairro,
              cidade: formData.cidade,
              estado: formData.estado
            }
            
            console.log('📍 Usando dados completos do formulário:', enderecoData)
            const enderecoResponse = await cadastrarEnderecoEstabelecimento(enderecoData)
            
            if (enderecoResponse.status) {
              console.log('✅ Endereço completo criado com sucesso!')
              setMessage({ type: 'success', text: 'Estabelecimento e endereço cadastrados com sucesso!' })
            } else {
              console.log('⚠️ Falha ao criar endereço completo, criando padrão...')
              throw new Error('Falha no endereço completo')
            }
          } else {
            // Se não tem dados completos, cria endereço padrão
            console.log('📍 Dados incompletos, criando endereço padrão...')
            const enderecoDefault = {
              id_usuario: user.id,
              cep: '00000000',
              logradouro: 'Endereço não informado',
              numero: 'S/N',
              complemento: '',
              bairro: 'Centro',
              cidade: 'Cidade não informada',
              estado: 'Estado não informado'
            }
            
            console.log('📍 Criando endereço padrão:', enderecoDefault)
            const enderecoResponse = await cadastrarEnderecoEstabelecimento(enderecoDefault)
            
            if (enderecoResponse.status) {
              console.log('✅ Endereço padrão criado com sucesso!')
              setMessage({ type: 'success', text: 'Estabelecimento cadastrado! Configure o endereço depois.' })
            } else {
              console.log('⚠️ Falha ao criar endereço padrão')
              setMessage({ type: 'success', text: 'Estabelecimento cadastrado! Erro ao criar endereço.' })
            }
          }
        } catch (enderecoError: any) {
          console.error('❌ Erro ao criar qualquer tipo de endereço:', enderecoError)
          setMessage({ type: 'success', text: 'Estabelecimento cadastrado! Erro ao salvar endereço.' })
        }
        
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
      
      if (error.response?.data?.message) {
        mensagemErro = error.response.data.message
      } else if (error.message) {
        mensagemErro = error.message
      }
      
      setMessage({ type: 'error', text: mensagemErro })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
            <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (verificandoEstabelecimento) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F9A01B] mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando estabelecimento...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (jaTemEstabelecimento && estabelecimentoExistente) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Estabelecimento Já Cadastrado!</h1>
              <p className="text-gray-600">Você já possui um estabelecimento cadastrado no sistema.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Dados do seu estabelecimento:</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Nome:</span>
                  <span className="ml-2 text-gray-600">{estabelecimentoExistente.nome}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">CNPJ:</span>
                  <span className="ml-2 text-gray-600">{estabelecimentoExistente.cnpj}</span>
                </div>
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

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Cadastro de Estabelecimento</h1>
            <p className="text-gray-600">Preencha os dados do seu estabelecimento para começar a vender</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField
                  label="Nome do Estabelecimento"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: Padaria do João"
                  required
                />
              </div>

              {user?.cnpj && user.cnpj.replace(/\D/g, '').length === 14 ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600">
                    {formData.cnpj}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    CNPJ pré-preenchido com base no seu cadastro
                  </p>
                </div>
              ) : (
                <InputField
                  label="CNPJ"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0001-00"
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

              {/* Seção de Endereço */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Endereço do Estabelecimento
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Informe o endereço para que os clientes possam encontrar seu estabelecimento
                </p>
              </div>

              <div className="relative">
                <InputField
                  label="CEP"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  placeholder="00000-000"
                />
                {buscandoCep && (
                  <div className="absolute right-3 top-9 text-sm text-blue-600">
                    Buscando...
                  </div>
                )}
              </div>

              <InputField
                label="Logradouro"
                name="logradouro"
                value={formData.logradouro}
                onChange={handleInputChange}
                placeholder="Rua, Avenida, etc."
              />

              <InputField
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                placeholder="123"
              />

              <InputField
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
                placeholder="Apto, Sala, etc. (opcional)"
              />

              <InputField
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                placeholder="Nome do bairro"
              />

              <InputField
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                placeholder="Nome da cidade"
              />

              <InputField
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                placeholder="SP, RJ, MG, etc."
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
                onClick={() => navigate('/HomeInicial')}
                variant="secondary"
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
