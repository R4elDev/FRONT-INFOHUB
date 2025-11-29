import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { useUser } from "../../contexts/UserContext"
import { cadastrarEnderecoEstabelecimento } from "../../services/apiServicesFixed"
import { Store, MapPin, Phone, FileText, Plus, Edit, Save, X } from 'lucide-react'

export default function MeuEstabelecimento() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [estabelecimento, setEstabelecimento] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editandoEndereco, setEditandoEndereco] = useState(false)
  const [salvandoEndereco, setSalvandoEndereco] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [enderecoForm, setEnderecoForm] = useState({
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

  useEffect(() => {
    const buscarEstabelecimento = async () => {
      if (!user || user.perfil !== 'estabelecimento') {
        setLoading(false)
        return
      }

      // Verifica se o estabelecimento no localStorage pertence ao usuário atual
      const estabelecimentoId = localStorage.getItem('estabelecimentoId')
      const estabelecimentoNome = localStorage.getItem('estabelecimentoNome')
      const estabelecimentoUserId = localStorage.getItem('estabelecimentoUserId')
      const estabelecimentoEndereco = localStorage.getItem('estabelecimentoEndereco')
      
      // Se existe estabelecimento mas é de outro usuário, limpa o localStorage
      if (estabelecimentoUserId && parseInt(estabelecimentoUserId) !== user.id) {
        console.log('🧹 MeuEstabelecimento: Limpando estabelecimento de outro usuário:', estabelecimentoUserId, '!==', user.id)
        localStorage.removeItem('estabelecimentoId')
        localStorage.removeItem('estabelecimentoNome')
        localStorage.removeItem('estabelecimentoUserId')
        localStorage.removeItem('estabelecimentoEndereco')
        localStorage.removeItem('estabelecimentoEnderecoCompleto')
        localStorage.removeItem('estabelecimentoCNPJ')
      }
      
      // Se tem estabelecimento do usuário atual no localStorage, usa ele
      if (estabelecimentoId && estabelecimentoNome && estabelecimentoUserId && parseInt(estabelecimentoUserId) === user.id) {
        console.log('✅ Estabelecimento encontrado no localStorage:', estabelecimentoNome)
        setEstabelecimento({
          id: parseInt(estabelecimentoId),
          nome: estabelecimentoNome,
          cnpj: user?.cnpj || '',
          telefone: user?.telefone || '',
          endereco: estabelecimentoEndereco || 'Endereço não informado'
        })
        setLoading(false)
        return
      }
      
      // Se não tem no localStorage, busca do backend usando novo endpoint
      console.log('🔍 Buscando estabelecimento do backend para usuário:', user.id)
      try {
        const api = (await import('../../lib/api')).default
        
        // USA O NOVO ENDPOINT: /estabelecimento/usuario/:id_usuario
        const response = await api.get<any>(`/estabelecimento/usuario/${user.id}`)
        console.log('📦 Resposta /estabelecimento/usuario:', response.data)
        
        if (response.data?.status && response.data?.estabelecimento) {
          const meuEstab = response.data.estabelecimento
          
          console.log('✅ Estabelecimento encontrado no backend:', meuEstab)
            
            // Salva no localStorage
            localStorage.setItem('estabelecimentoId', String(meuEstab.id_estabelecimento))
            localStorage.setItem('estabelecimentoNome', meuEstab.nome)
            localStorage.setItem('estabelecimentoUserId', String(user.id))
            localStorage.setItem('estabelecimentoCNPJ', meuEstab.cnpj || user.cnpj || '')
            
            if (meuEstab.logradouro) {
              const enderecoFormatado = `${meuEstab.logradouro}, ${meuEstab.numero || ''} - ${meuEstab.bairro || ''}, ${meuEstab.cidade || ''}/${meuEstab.estado || ''} - CEP: ${meuEstab.cep || ''}`
              localStorage.setItem('estabelecimentoEndereco', enderecoFormatado)
              
              // Salvar endereço completo com coordenadas
              localStorage.setItem('estabelecimentoEnderecoCompleto', JSON.stringify({
                logradouro: meuEstab.logradouro,
                numero: meuEstab.numero,
                bairro: meuEstab.bairro,
                cidade: meuEstab.cidade,
                estado: meuEstab.estado,
                cep: meuEstab.cep,
                latitude: meuEstab.latitude,
                longitude: meuEstab.longitude
              }))
            }
            
            setEstabelecimento({
              id: meuEstab.id_estabelecimento,
              nome: meuEstab.nome,
              cnpj: meuEstab.cnpj || user?.cnpj || '',
              telefone: meuEstab.telefone || user?.telefone || '',
              endereco: meuEstab.logradouro 
                ? `${meuEstab.logradouro}, ${meuEstab.numero || ''} - ${meuEstab.bairro || ''}, ${meuEstab.cidade || ''}`
                : 'Endereço não informado'
            })
        } else {
          console.log('ℹ️ Nenhum estabelecimento encontrado para este usuário')
        }
      } catch (error: any) {
        console.log('⚠️ Erro ao buscar estabelecimento:', error.message)
      }
      
      setLoading(false)
    }
    
    buscarEstabelecimento()
  }, [user])

  // Busca coordenadas via Google Geocoding API (mais preciso que Nominatim)
  const buscarCoordenadasGoogle = async (endereco: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      console.log('📍 Buscando coordenadas via Google Geocoding para:', endereco)
      
      // Verifica se o Google Maps está carregado
      if (!(window as any).google?.maps?.Geocoder) {
        console.log('⚠️ Google Maps não carregado, tentando carregar...')
        // Aguarda o Google Maps carregar
        await new Promise<void>((resolve) => {
          const checkGoogle = setInterval(() => {
            if ((window as any).google?.maps?.Geocoder) {
              clearInterval(checkGoogle)
              resolve()
            }
          }, 100)
          // Timeout de 5 segundos
          setTimeout(() => {
            clearInterval(checkGoogle)
            resolve()
          }, 5000)
        })
      }
      
      if (!(window as any).google?.maps?.Geocoder) {
        console.log('❌ Google Maps não disponível')
        return null
      }
      
      const geocoder = new (window as any).google.maps.Geocoder()
      
      return new Promise((resolve) => {
        geocoder.geocode({ address: endereco }, (results: any[], status: string) => {
          if (status === 'OK' && results && results.length > 0) {
            const location = results[0].geometry.location
            const coords = {
              lat: location.lat(),
              lng: location.lng()
            }
            console.log('✅ Coordenadas Google encontradas:', coords)
            resolve(coords)
          } else {
            console.log('⚠️ Google Geocoding não encontrou resultados:', status)
            resolve(null)
          }
        })
      })
    } catch (error) {
      console.error('❌ Erro ao buscar coordenadas Google:', error)
      return null
    }
  }

  // Busca CEP via ViaCEP e coordenadas via Google Geocoding API
  const buscarCep = async (cep: string) => {
    if (cep.length !== 8) return

    try {
      console.log('🔍 Buscando CEP para edição:', cep)
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        console.log('✅ CEP encontrado para edição:', data)
        setEnderecoForm(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }))
        
        // Busca coordenadas via Google Geocoding (mais preciso)
        const enderecoCompleto = `${data.logradouro}, ${enderecoForm.numero || ''}, ${data.bairro}, ${data.localidade}, ${data.uf}, Brasil`
        const coordenadas = await buscarCoordenadasGoogle(enderecoCompleto)
        
        if (coordenadas) {
          setEnderecoForm(prev => ({
            ...prev,
            latitude: coordenadas.lat.toString(),
            longitude: coordenadas.lng.toString()
          }))
          setMessage({ type: 'success', text: `CEP encontrado! Coordenadas Google: ${coordenadas.lat.toFixed(6)}, ${coordenadas.lng.toFixed(6)}` })
        } else {
          // Tenta buscar só pelo endereço sem número
          const enderecoSemNumero = `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}, Brasil`
          const coords = await buscarCoordenadasGoogle(enderecoSemNumero)
          if (coords) {
            setEnderecoForm(prev => ({
              ...prev,
              latitude: coords.lat.toString(),
              longitude: coords.lng.toString()
            }))
            setMessage({ type: 'success', text: 'CEP encontrado! Coordenadas aproximadas.' })
          } else {
            setMessage({ type: 'error', text: 'CEP encontrado, mas coordenadas não disponíveis. Tente novamente.' })
          }
        }
      } else {
        setMessage({ type: 'error', text: 'CEP não encontrado. Verifique e tente novamente.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao buscar CEP. Tente novamente.' })
    }
  }

  const handleEnderecoChange = (field: string, value: string) => {
    setEnderecoForm(prev => ({ ...prev, [field]: value }))
    
    // Se mudou o CEP e tem 8 dígitos, busca automaticamente
    if (field === 'cep') {
      const cepLimpo = value.replace(/\D/g, '')
      if (cepLimpo.length === 8) {
        buscarCep(cepLimpo)
      }
    }
  }

  const salvarEndereco = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Usuário não encontrado' })
      return
    }

    if (!enderecoForm.cep || !enderecoForm.logradouro || !enderecoForm.bairro || !enderecoForm.cidade || !enderecoForm.estado) {
      setMessage({ type: 'error', text: 'Preencha pelo menos CEP, logradouro, bairro, cidade e estado' })
      return
    }

    // VERIFICAÇÃO CRÍTICA: Coordenadas são necessárias para o mapa
    if (!enderecoForm.latitude || !enderecoForm.longitude) {
      setMessage({ type: 'error', text: '⚠️ Coordenadas não encontradas! Aguarde a busca do CEP e tente novamente.' })
      console.log('❌ ERRO: Coordenadas não foram obtidas!')
      console.log('   latitude:', enderecoForm.latitude)
      console.log('   longitude:', enderecoForm.longitude)
      return
    }

    try {
      setSalvandoEndereco(true)
      setMessage(null)

      const estabelecimentoId = localStorage.getItem('estabelecimentoId')
      
      // DEBUG: Verificar se coordenadas existem no form
      console.log('🔍 DEBUG - enderecoForm atual:', enderecoForm)
      console.log('🔍 DEBUG - latitude no form:', enderecoForm.latitude, 'tipo:', typeof enderecoForm.latitude)
      console.log('🔍 DEBUG - longitude no form:', enderecoForm.longitude, 'tipo:', typeof enderecoForm.longitude)
      
      const enderecoData = {
        id_usuario: user.id,
        id_estabelecimento: estabelecimentoId ? parseInt(estabelecimentoId) : null,
        cep: enderecoForm.cep.replace(/\D/g, ''),
        logradouro: enderecoForm.logradouro,
        numero: enderecoForm.numero || 'S/N',
        complemento: enderecoForm.complemento || '',
        bairro: enderecoForm.bairro,
        cidade: enderecoForm.cidade,
        estado: enderecoForm.estado,
        latitude: enderecoForm.latitude ? parseFloat(enderecoForm.latitude) : null,
        longitude: enderecoForm.longitude ? parseFloat(enderecoForm.longitude) : null
      }

      console.log('📍 Salvando endereço do estabelecimento:', enderecoData)
      console.log('📍 COORDENADAS ENVIADAS:', { lat: enderecoData.latitude, lng: enderecoData.longitude })
      const response = await cadastrarEnderecoEstabelecimento(enderecoData)

      if (response && response.status) {
        console.log('✅ Endereço salvo com sucesso!')
        setMessage({ type: 'success', text: 'Endereço salvo com sucesso!' })
        setEditandoEndereco(false)
        
        // Atualiza o estabelecimento na interface com o novo endereço
        const novoEndereco = localStorage.getItem('estabelecimentoEndereco')
        if (novoEndereco && estabelecimento) {
          setEstabelecimento({
            ...estabelecimento,
            endereco: novoEndereco
          })
        }
      } else {
        console.log('❌ Erro na resposta do endereço:', response)
        setMessage({ type: 'error', text: 'Erro ao salvar endereço. Tente novamente.' })
      }
    } catch (error: any) {
      console.error('❌ Erro ao salvar endereço:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar endereço. Verifique os dados e tente novamente.' })
    } finally {
      setSalvandoEndereco(false)
    }
  }

  const iniciarEdicaoEndereco = () => {
    setEditandoEndereco(true)
    setMessage(null)
    // Limpa o formulário para começar fresh
    setEnderecoForm({
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
  }

  const cancelarEdicaoEndereco = () => {
    setEditandoEndereco(false)
    setMessage(null)
  }

  // Verificar se usuário tem permissão
  if (user?.perfil !== 'estabelecimento') {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
            <p className="text-gray-600 mb-6">Esta funcionalidade é exclusiva para usuários jurídicos.</p>
            <button
              onClick={() => navigate('/HomeInicial')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  // Loading
  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  // Se não tem estabelecimento
  if (!estabelecimento) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Nenhum Estabelecimento Cadastrado</h1>
            <p className="text-gray-600 mb-6">
              Você ainda não possui um estabelecimento cadastrado. Cadastre agora para começar a vender!
            </p>
            <button
              onClick={() => navigate('/empresa/cadastro-estabelecimento')}
              className="px-6 py-3 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white rounded-lg hover:from-[#FF8C00] hover:to-[#F9A01B] transition-all flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Cadastrar Estabelecimento
            </button>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  // Mostra estabelecimento
  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F9A01B] via-[#FF8C00] to-[#F9A01B] rounded-3xl shadow-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Meu Estabelecimento</h1>
              <p className="text-white/90">Informações do seu estabelecimento</p>
            </div>
          </div>
        </div>

        {/* Card do Estabelecimento */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{estabelecimento.nome}</h2>
              <p className="text-gray-500">ID: #{estabelecimento.id}</p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
              ✓ Ativo
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CNPJ */}
            {estabelecimento.cnpj && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">CNPJ</p>
                  <p className="text-lg font-semibold text-gray-800">{estabelecimento.cnpj}</p>
                </div>
              </div>
            )}

            {/* Telefone */}
            {estabelecimento.telefone && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Telefone</p>
                  <p className="text-lg font-semibold text-gray-800">{estabelecimento.telefone}</p>
                </div>
              </div>
            )}

            {/* Endereço */}
            <div className="md:col-span-2">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Endereço</p>
                    {!editandoEndereco && (
                      <button
                        onClick={iniciarEdicaoEndereco}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Editar Endereço
                      </button>
                    )}
                  </div>
                  
                  {!editandoEndereco ? (
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {estabelecimento.endereco || 'Endereço não informado'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Configure seu endereço para que os clientes possam encontrar você
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-lg font-semibold text-gray-800 mb-4">
                        Configurar Endereço do Estabelecimento
                      </p>
                      
                      {/* Mensagem de feedback */}
                      {message && (
                        <div className={`p-3 rounded-lg text-sm ${
                          message.type === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-800' 
                            : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                          {message.text}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                          <input
                            type="text"
                            value={enderecoForm.cep}
                            onChange={(e) => handleEnderecoChange('cep', e.target.value)}
                            placeholder="00000-000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                          <input
                            type="text"
                            value={enderecoForm.logradouro}
                            onChange={(e) => handleEnderecoChange('logradouro', e.target.value)}
                            placeholder="Rua, Avenida, etc."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                          <input
                            type="text"
                            value={enderecoForm.numero}
                            onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                            placeholder="123"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                          <input
                            type="text"
                            value={enderecoForm.complemento}
                            onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                            placeholder="Apto, Sala, etc."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                          <input
                            type="text"
                            value={enderecoForm.bairro}
                            onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                            placeholder="Nome do bairro"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                          <input
                            type="text"
                            value={enderecoForm.cidade}
                            onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                            placeholder="Nome da cidade"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                          <input
                            type="text"
                            value={enderecoForm.estado}
                            onChange={(e) => handleEnderecoChange('estado', e.target.value)}
                            placeholder="SP, RJ, MG, etc."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={salvarEndereco}
                          disabled={salvandoEndereco}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {salvandoEndereco ? 'Salvando...' : 'Salvar Endereço'}
                        </button>
                        
                        <button
                          onClick={cancelarEdicaoEndereco}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/empresa/cadastro-promocao')}
            className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white rounded-2xl hover:from-[#FF8C00] hover:to-[#F9A01B] transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-6 h-6" />
            <div className="text-left">
              <p className="font-bold text-lg">Cadastrar Produto</p>
              <p className="text-sm text-white/90">Adicione novos produtos</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/HomeInicial')}
            className="flex items-center justify-center gap-3 p-6 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-[#F9A01B] hover:bg-orange-50 transition-all"
          >
            <MapPin className="w-6 h-6" />
            <div className="text-left">
              <p className="font-bold text-lg">Ir para Home</p>
              <p className="text-sm text-gray-500">Voltar ao início</p>
            </div>
          </button>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Dicas</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Mantenha suas informações sempre atualizadas</li>
            <li>• Cadastre produtos com descrições detalhadas</li>
            <li>• Use fotos de qualidade para atrair mais clientes</li>
          </ul>
        </div>
      </div>
    </SidebarLayout>
  )
}