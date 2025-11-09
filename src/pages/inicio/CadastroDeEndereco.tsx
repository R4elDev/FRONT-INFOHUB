import { Button } from '../../components/ui/button'
import { Input } from "../../components/ui/input"
import bolalaranjaCadastro from '../../assets/bolalaranjaCadastro.png'
import bolavermelhaCadastro from '../../assets/bolavermelhaCadastro.png'
import muiemexendonoscompuiter from '../../assets/muiemexendonoscompuiter.png'
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cadastrarEndereco } from "../../services/apiServicesFixed"
import type { enderecoRequest } from "../../services/types"
import { MapPin, Home, Hash, Building, Map, Globe, Shield, Star, Sparkles, Zap, CheckCircle, Loader2 } from "lucide-react"
import toast from 'react-hot-toast'

function CadastroDeEndereco() {
  const [cep, setCep] = useState("")
  const [rua, setRua] = useState("")
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [carregandoCep, setCarregandoCep] = useState(false)
  const [salvandoEndereco, setSalvandoEndereco] = useState(false)

  const navigate = useNavigate()

  // Função para lidar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !carregandoCep && !salvandoEndereco) {
      e.preventDefault();
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  // Função para buscar coordenadas usando Nominatim (OpenStreetMap)
  const buscarCoordenadas = async (endereco: string, cidadeNome: string, estadoUF: string) => {
    try {
      const query = `${endereco}, ${cidadeNome}, ${estadoUF}, Brasil`
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      )
      
      if (!response.ok) {
        throw new Error('Erro ao buscar coordenadas')
      }

      const data = await response.json()
      
      if (data && data.length > 0) {
        setLatitude(data[0].lat)
        setLongitude(data[0].lon)
        console.log('Coordenadas encontradas:', { lat: data[0].lat, lon: data[0].lon })
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error)
      // Não exibe alerta para não interromper o fluxo
    }
  }

  // Função para buscar CEP (usa ViaCEP diretamente)
  const buscarCep = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, '')
    
    if (cepLimpo.length !== 8) {
      return
    }

    setCarregandoCep(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      
      if (!response.ok) {
        throw new Error('Erro na requisição')
      }

      const data = await response.json()

      if (data.erro) {
        toast.error('CEP não encontrado!')
        setCarregandoCep(false)
        return
      }

      // Preenche os campos automaticamente
      setRua(data.logradouro || "")
      setBairro(data.bairro || "")
      setCidade(data.localidade || "")
      setEstado(data.uf || "")
      setComplemento(data.complemento || "")

      // Busca as coordenadas geográficas
      await buscarCoordenadas(data.logradouro, data.localidade, data.uf)

    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      toast.error('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setCarregandoCep(false)
    }
  }



  // Função para formatar CEP com máscara
  const formatarCep = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, '')
    if (apenasNumeros.length <= 5) {
      return apenasNumeros
    }
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`
  }

  // Handler para mudança do CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    const cepFormatado = formatarCep(valor)
    setCep(cepFormatado)

    // Busca automaticamente quando completar 8 dígitos
    const apenasNumeros = valor.replace(/\D/g, '')
    if (apenasNumeros.length === 8) {
      buscarCep(apenasNumeros)
    }
  }

  const handleNextStep = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validações
    if (!cep.trim() || !rua.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !estado.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    // Recupera os dados do usuário cadastrado do localStorage
    const usuarioCadastrado = localStorage.getItem('usuarioCadastrado')
    
    console.log('🔍 Verificando localStorage:', usuarioCadastrado)
    
    if (!usuarioCadastrado) {
      console.error('❌ localStorage vazio')
      toast.error("Erro: Dados do usuário não encontrados. Por favor, faça o cadastro novamente.")
      navigate("/cadastro")
      return
    }

    try {
      const dadosUsuario = JSON.parse(usuarioCadastrado)
      console.log('📦 Dados do usuário parseados:', dadosUsuario)
      
      // Valida se tem o ID do usuário
      if (!dadosUsuario.id) {
        console.error('❌ ID do usuário não encontrado nos dados:', dadosUsuario)
        toast.error("Erro: ID do usuário não encontrado. Por favor, faça o cadastro novamente.")
        navigate("/cadastro")
        return
      }
      
      console.log('✅ ID do usuário encontrado:', dadosUsuario.id)

      setSalvandoEndereco(true)

      // Prepara os dados para enviar à API
      const enderecoData: enderecoRequest = {
        id_usuario: dadosUsuario.id,
        cep: cep.replace(/\D/g, ''), // Remove a máscara do CEP
        logradouro: rua.trim(),
        numero: numero.trim(),
        complemento: complemento.trim() || undefined,
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined
      }
      
      console.log('📍 Enviando endereço para a API:', enderecoData)

      // Chama a API para cadastrar o endereço
      const response = await cadastrarEndereco(enderecoData)
      
      if (response.status) {
        console.log('✅ Endereço cadastrado com sucesso:', response)
        toast.success("Endereço cadastrado com sucesso! Você será redirecionado para o login.")
        
        // Limpa os dados temporários do localStorage
        localStorage.removeItem('usuarioCadastrado')
        
        // Redireciona para a tela de login
        navigate("/login")
      } else {
        throw new Error(response.message || 'Erro ao cadastrar endereço')
      }
    } catch (error: any) {
      console.error('❌ Erro ao cadastrar endereço:', error)
      const mensagemErro = error.response?.data?.message || error.message || 'Erro ao cadastrar endereço. Tente novamente.'
      toast.error(mensagemErro)
    } finally {
      setSalvandoEndereco(false)
    }
  }

  return (
    <div className='h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br from-orange-50 via-white to-yellow-50 relative'>
      {/* Gradientes decorativos */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-300/20 to-yellow-300/20 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-orange-300/20 to-red-300/20 rounded-full blur-3xl animate-pulse z-0" style={{animationDelay: '1s'}} />
      
      {/* Badges de status */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fadeInLeft z-20">
        <Shield className="w-4 h-4 text-green-600" />
        <span className="text-xs font-bold text-gray-700">Cadastro Seguro</span>
      </div>
      
      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full shadow-lg flex items-center gap-1 animate-fadeInRight z-20">
        <Star className="w-4 h-4 text-white fill-white" />
        <span className="text-xs font-bold text-white">Passo 2</span>
      </div>
      
      <div className='relative h-full z-10'>
        {/* Imagens decorativas */}
        <img 
          src={bolalaranjaCadastro} 
          alt="bola laranja" 
          className="absolute top-0 right-0 w-24 sm:w-32 md:w-40 lg:w-52 max-w-full" 
        />
        <img 
          src={bolavermelhaCadastro} 
          alt="bola vermelha" 
          className="absolute top-20 sm:top-28 md:top-36 left-0 w-12 sm:w-16 md:w-20 lg:w-28 max-w-full" 
        />

        {/* Partículas flutuantes */}
        <div className="absolute top-32 right-16 animate-float opacity-15 z-10">
          <Sparkles className="w-6 h-6 text-orange-500" />
        </div>
        <div className="absolute bottom-32 left-16 animate-float-reverse opacity-15 z-10" style={{animationDelay: '1s'}}>
          <Zap className="w-5 h-5 text-orange-500" />
        </div>

        <div className="h-full flex flex-col items-center justify-center px-4 py-4 overflow-y-auto">
          {/* Imagem com glow */}
          <div className="relative mb-4 animate-scaleIn">
            <div className="absolute inset-0 bg-orange-400/20 blur-2xl rounded-full" />
            <img
              src={muiemexendonoscompuiter}
              alt="mulher mexendo no computador"
              className="relative w-auto h-[120px] sm:h-[140px] object-contain drop-shadow-2xl"
            />
          </div>

          {/* Título premium */}
          <div className="text-center mb-4 animate-fadeInDown">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MapPin className="w-6 h-6 text-orange-500 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-lg">
                Cadastro de Endereço
              </h1>
              <MapPin className="w-6 h-6 text-orange-500 animate-pulse" style={{animationDelay: '0.5s'}} />
            </div>
            <p className="text-sm text-gray-600 flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Preencha seu endereço para finalizar
            </p>
          </div>

          {/* Formulário de Endereço Premium */}
          <form 
            className="w-full max-w-md space-y-3 animate-fadeInUp"
            onSubmit={handleNextStep}
            style={{animationDelay: '0.3s'}}
          >
            {/* CEP */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <MapPin className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <Input 
                type='text'
                placeholder="CEP *" 
                value={cep} 
                onChange={handleCepChange}
                onKeyDown={handleKeyPress}
                maxLength={9}
                disabled={carregandoCep}
                required
                className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-24 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100"
              />
              {carregandoCep && (
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-500 text-sm font-semibold flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Buscando...
                </span>
              )}
            </div>
            
            {/* Rua */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Home className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <Input 
                type='text'
                placeholder="Rua *" 
                value={rua} 
                onChange={(e) => setRua(e.target.value)}
                onKeyDown={handleKeyPress}
                required
                className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100"
              />
            </div>
            
            {/* Número */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Hash className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <Input 
                type='text'
                placeholder="Número *" 
                value={numero} 
                onChange={(e) => setNumero(e.target.value)}
                onKeyDown={handleKeyPress}
                required
                className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100"
              />
            </div>
            
            {/* Complemento */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Building className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <Input 
                type='text'
                placeholder="Complemento" 
                value={complemento} 
                onChange={(e) => setComplemento(e.target.value)}
                onKeyDown={handleKeyPress}
                className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100"
              />
            </div>
            
            {/* Bairro */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Map className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <Input 
                type='text'
                placeholder="Bairro *" 
                value={bairro} 
                onChange={(e) => setBairro(e.target.value)}
                onKeyDown={handleKeyPress}
                required
                className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100"
              />
            </div>
            
            {/* Cidade */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Globe className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <Input 
                type='text'
                placeholder="Cidade *" 
                value={cidade} 
                onChange={(e) => setCidade(e.target.value)}
                onKeyDown={handleKeyPress}
                required
                className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100"
              />
            </div>
            
            {/* Estado */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Globe className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <Input 
                type='text'
                placeholder="Estado (UF) *" 
                value={estado} 
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                onKeyDown={handleKeyPress}
                maxLength={2}
                required
                className="h-[52px] bg-white/95 backdrop-blur-sm rounded-full pl-12 pr-4 text-[16px] placeholder:text-gray-400 focus:ring-4 focus:ring-orange-400 focus:scale-[1.02] shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-100"
              />
            </div>
            
            {/* Botão Premium */}
            <Button 
              type="submit"
              disabled={carregandoCep || salvandoEndereco}
              className="w-full h-[56px] rounded-full text-[18px] font-bold text-white transition-all duration-300 overflow-hidden group shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 ring-2 ring-orange-300 hover:ring-orange-400 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              style={{
                background: 'linear-gradient(135deg, #FF8C00 0%, #FFA726 50%, #FF8C00 100%)',
                backgroundSize: '200% 100%'
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {salvandoEndereco ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Cadastrar Endereço
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
    </div>
  )
}

export default CadastroDeEndereco
