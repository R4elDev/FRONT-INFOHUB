import { useState } from 'react'
import { MapPin, Save, ArrowLeft, Navigation, Home } from 'lucide-react'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { useUser } from "../../contexts/UserContext"
import { cadastrarEndereco } from "../../services/apiServicesFixed"
import { useToast } from "../../components/ui/Toast"
import type { enderecoRequest } from "../../services/types"
import { useNavigate } from 'react-router-dom'

export default function CadastroEndereco() {
  const { user } = useUser()
  const { success, error, ToastContainer } = useToast()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    latitude: '',
    longitude: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Busca CEP via API dos Correios
  const buscarCep = async (cep: string) => {
    if (cep.length !== 8) return

    try {
      setBuscandoCep(true)
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }))
      } else {
        error('CEP não encontrado')
      }
    } catch (err) {
      error('Erro ao buscar CEP')
    } finally {
      setBuscandoCep(false)
    }
  }

  // Busca localização atual
  const buscarLocalizacaoAtual = () => {
    if (!navigator.geolocation) {
      error('Geolocalização não suportada pelo navegador')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }))
        success('Localização obtida com sucesso!')
      },
      (err) => {
        error('Erro ao obter localização: ' + err.message)
      }
    )
  }

  // Submete o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      error('Usuário não autenticado')
      return
    }

    // Validações
    if (!formData.cep || !formData.logradouro || !formData.numero || !formData.bairro || !formData.cidade || !formData.estado) {
      error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setLoading(true)
      
      const enderecoData: enderecoRequest = {
        id_usuario: user.id,
        cep: formData.cep.replace(/\D/g, ''),
        logradouro: formData.logradouro.trim(),
        numero: formData.numero.trim(),
        complemento: formData.complemento.trim() || undefined,
        bairro: formData.bairro.trim(),
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
      }

      const response = await cadastrarEndereco(enderecoData)
      
      if (response.status) {
        success('Endereço cadastrado com sucesso!')
        // Limpar formulário
        setFormData({
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          latitude: '',
          longitude: ''
        })
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/perfil')
        }, 2000)
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Erro ao cadastrar endereço')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarLayout>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#F9A01B] via-[#FF8C00] to-[#F9A01B] rounded-3xl shadow-2xl p-8 text-white mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate('/perfil')}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="bg-white/20 p-3 rounded-xl">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Cadastrar Endereço</h1>
                <p className="text-white/90">Adicione um novo endereço ao seu perfil</p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CEP */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CEP *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => {
                      const cep = e.target.value.replace(/\D/g, '').slice(0, 8)
                      handleInputChange('cep', cep)
                      if (cep.length === 8) {
                        buscarCep(cep)
                      }
                    }}
                    placeholder="00000-000"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9A01B] focus:outline-none"
                    maxLength={8}
                  />
                  {buscandoCep && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#F9A01B]"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Logradouro */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logradouro *
                </label>
                <input
                  type="text"
                  value={formData.logradouro}
                  onChange={(e) => handleInputChange('logradouro', e.target.value)}
                  placeholder="Rua, Avenida, etc."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9A01B] focus:outline-none"
                />
              </div>

              {/* Número */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número *
                </label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  placeholder="123"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9A01B] focus:outline-none"
                />
              </div>

              {/* Complemento */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                  placeholder="Apto, Bloco, etc."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9A01B] focus:outline-none"
                />
              </div>

              {/* Bairro */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bairro *
                </label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  placeholder="Nome do bairro"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9A01B] focus:outline-none"
                />
              </div>

              {/* Cidade */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Nome da cidade"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9A01B] focus:outline-none"
                />
              </div>

              {/* Estado */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado *
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9A01B] focus:outline-none"
                >
                  <option value="">Selecione o estado</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>

              {/* Localização */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Coordenadas (Opcional)
                  </label>
                  <button
                    type="button"
                    onClick={buscarLocalizacaoAtual}
                    className="flex items-center gap-2 text-sm text-[#F9A01B] hover:text-[#FF8C00] font-semibold"
                  >
                    <Navigation className="w-4 h-4" />
                    Usar localização atual
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    placeholder="Latitude"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9A01B] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    placeholder="Longitude"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#F9A01B] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate('/perfil')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#F9A01B] text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Endereço
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}
