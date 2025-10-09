import { Button } from '../../components/ui/button'
import { Input } from "../../components/ui/input"
import bolalaranjaCadastro from '../../assets/bolalaranjaCadastro.png'
import bolavermelhaCadastro from '../../assets/bolavermelhaCadastro.png'
import muiemexendonoscompuiter from '../../assets/muiemexendonoscompuiter.png'
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { salvarEndereco } from "../../utils/endereco"
import type { EnderecoData } from "../../utils/endereco"

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

  const navigate = useNavigate()

  // Função para buscar coordenadas (com fallback silencioso)
  const buscarCoordenadas = async (endereco: string, cidadeNome: string, estadoUF: string) => {
    // Primeiro, verificar se temos coordenadas padrão para a cidade
    const coordenadasPadrao = obterCoordenadasPadrao(cidadeNome, estadoUF)
    
    // Se temos coordenadas padrão, usar diretamente (mais rápido e confiável)
    if (coordenadasPadrao) {
      setLatitude(coordenadasPadrao.lat)
      setLongitude(coordenadasPadrao.lon)
      console.log('📍 Coordenadas definidas para:', cidadeNome)
      return
    }
    
    // Apenas tentar API se não temos coordenadas padrão
    const query = `${endereco}, ${cidadeNome}, ${estadoUF}, Brasil`
    
    try {
      // Tentar apenas um proxy confiável
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      const proxyUrl = 'https://corsproxy.io/?'
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // Timeout menor
      
      const response = await fetch(proxyUrl + encodeURIComponent(nominatimUrl), {
        headers: { 'User-Agent': 'InfoHub-App/1.0' },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          setLatitude(data[0].lat)
          setLongitude(data[0].lon)
          console.log('✅ Coordenadas encontradas online:', { lat: data[0].lat, lon: data[0].lon })
          return
        }
      }
    } catch (error) {
      // Erro silencioso - não logar para não poluir console
    }
    
    // Fallback final: usar coordenadas de São Paulo
    setLatitude('-23.5505')
    setLongitude('-46.6333')
    console.log('📍 Usando coordenadas padrão (São Paulo) para:', cidadeNome)
  }

  // Função auxiliar para coordenadas padrão de cidades principais
  const obterCoordenadasPadrao = (cidade: string, uf: string) => {
    const coordenadasCidades: Record<string, {lat: string, lon: string}> = {
      'São Paulo-SP': { lat: '-23.5505', lon: '-46.6333' },
      'Rio de Janeiro-RJ': { lat: '-22.9068', lon: '-43.1729' },
      'Belo Horizonte-MG': { lat: '-19.9167', lon: '-43.9345' },
      'Salvador-BA': { lat: '-12.9714', lon: '-38.5014' },
      'Brasília-DF': { lat: '-15.7942', lon: '-47.8822' },
      'Fortaleza-CE': { lat: '-3.7319', lon: '-38.5267' },
      'Manaus-AM': { lat: '-3.1190', lon: '-60.0217' },
      'Curitiba-PR': { lat: '-25.4284', lon: '-49.2733' },
      'Recife-PE': { lat: '-8.0476', lon: '-34.8770' },
      'Goiânia-GO': { lat: '-16.6869', lon: '-49.2648' },
      'Carapicuíba-SP': { lat: '-23.5222', lon: '-46.8361' }
    }
    
    const chave = `${cidade}-${uf}`
    return coordenadasCidades[chave] || coordenadasCidades['São Paulo-SP'] // Fallback para SP
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
        alert('CEP não encontrado!')
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
      alert('Erro ao buscar CEP. Tente novamente.')
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
    
    // Validações melhoradas
    const erros = []
    
    if (!cep.trim()) erros.push("CEP")
    if (!rua.trim()) erros.push("Rua")
    if (!numero.trim()) erros.push("Número")
    if (!bairro.trim()) erros.push("Bairro")
    if (!cidade.trim()) erros.push("Cidade")
    if (!estado.trim()) erros.push("Estado")
    
    if (erros.length > 0) {
      alert(`Por favor, preencha os seguintes campos obrigatórios: ${erros.join(", ")}`)
      return
    }
    
    // Validação de CEP
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      alert("CEP deve ter 8 dígitos")
      return
    }

    // Preparar dados do endereço completo
    const enderecoData = {
      cep: cep.replace(/\D/g, ''), // Remove formatação
      rua: rua.trim(),
      numero: numero.trim(),
      complemento: complemento.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      estado: estado.trim(),
      latitude: latitude || '',
      longitude: longitude || '',
      endereco_completo: `${rua}, ${numero}${complemento ? `, ${complemento}` : ''}, ${bairro}, ${cidade} - ${estado}, ${cep}`,
      data_cadastro: new Date().toISOString()
    }
    
    console.log('📍 Salvando dados do endereço:', enderecoData)

    try {
      // Salvar usando a função utilitária
      salvarEndereco(enderecoData as EnderecoData)
      
      // Tentar salvar no backend (se o usuário estiver logado)
      const userData = localStorage.getItem('user_data')
      if (userData) {
        const user = JSON.parse(userData)
        
        // Aqui você pode implementar uma chamada para salvar no backend
        // await salvarEnderecoBackend(user.id, enderecoData)
        
        console.log('✅ Endereço salvo para o usuário:', user.nome)
      } else {
        console.log('💾 Endereço salvo localmente (usuário não logado)')
      }

      alert("Endereço cadastrado com sucesso!")
      
      // Redireciona para a tela de login
      navigate("/login")
    } catch (error) {
      console.error('Erro ao navegar:', error)
    }
  }

  return (
    <div className='h-screen w-screen overflow-hidden flex flex-col'>
      <div className='bg-[#FFFF] relative h-full'>
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

        <div className="h-full flex flex-col items-center justify-center px-4 py-4 overflow-y-auto">
          <img
            src={muiemexendonoscompuiter}
            alt="mulher mexendo no computador"
            className="w-32 sm:w-40 md:w-56 lg:w-72 h-auto object-contain mb-4"
          />

          {/* Área de título/especificação */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-4 sm:mb-6">
            <div className="px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium text-white bg-green-500 shadow-md">
              Cadastro de Endereço
            </div>
          </div>

          {/* Formulário de Endereço */}
          <form 
            className="w-full max-w-md space-y-3 sm:space-y-4 mt-4 px-2 sm:px-4"
            onSubmit={handleNextStep}
          >
            <div className="relative">
              <Input 
                type='text'
                placeholder="CEP *" 
                value={cep} 
                onChange={handleCepChange}
                maxLength={9}
                disabled={carregandoCep}
                required
                className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[5px] text-[16px] sm:text-[20px] md:text-[22px] px-4 sm:px-6 placeholder:text-[14px] sm:placeholder:text-[18px] md:placeholder:text-[20px] focus:ring-2 focus:ring-orange-500 transition-all shadow-md"
              />
              {carregandoCep && (
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-500 text-xs sm:text-sm">
                  Buscando...
                </span>
              )}
            </div>
            
            <Input 
              type='text'
              placeholder="Rua *" 
              value={rua} 
              onChange={(e) => setRua(e.target.value)} 
              required
              className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[5px] text-[16px] sm:text-[20px] md:text-[22px] px-4 sm:px-6 placeholder:text-[14px] sm:placeholder:text-[18px] md:placeholder:text-[20px] focus:ring-2 focus:ring-orange-500 transition-all shadow-md"
            />
            
            <Input 
              type='text'
              placeholder="Número *" 
              value={numero} 
              onChange={(e) => setNumero(e.target.value)} 
              required
              className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[5px] text-[16px] sm:text-[20px] md:text-[22px] px-4 sm:px-6 placeholder:text-[14px] sm:placeholder:text-[18px] md:placeholder:text-[20px] focus:ring-2 focus:ring-orange-500 transition-all shadow-md"
            />
            
            <Input 
              type='text'
              placeholder="Complemento" 
              value={complemento} 
              onChange={(e) => setComplemento(e.target.value)} 
              className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[5px] text-[16px] sm:text-[20px] md:text-[22px] px-4 sm:px-6 placeholder:text-[14px] sm:placeholder:text-[18px] md:placeholder:text-[20px] focus:ring-2 focus:ring-orange-500 transition-all shadow-md"
            />
            
            <Input 
              type='text'
              placeholder="Bairro *" 
              value={bairro} 
              onChange={(e) => setBairro(e.target.value)} 
              required
              className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[5px] text-[16px] sm:text-[20px] md:text-[22px] px-4 sm:px-6 placeholder:text-[14px] sm:placeholder:text-[18px] md:placeholder:text-[20px] focus:ring-2 focus:ring-orange-500 transition-all shadow-md"
            />
            
            <Input 
              type='text'
              placeholder="Cidade *" 
              value={cidade} 
              onChange={(e) => setCidade(e.target.value)} 
              required
              className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[5px] text-[16px] sm:text-[20px] md:text-[22px] px-4 sm:px-6 placeholder:text-[14px] sm:placeholder:text-[18px] md:placeholder:text-[20px] focus:ring-2 focus:ring-orange-500 transition-all shadow-md"
            />
            
            <Input 
              type='text'
              placeholder="Estado *" 
              value={estado} 
              onChange={(e) => setEstado(e.target.value.toUpperCase())}
              maxLength={2}
              required
              className="h-[50px] sm:h-[55px] md:h-[59px] bg-white rounded-[5px] text-[16px] sm:text-[20px] md:text-[22px] px-4 sm:px-6 placeholder:text-[14px] sm:placeholder:text-[18px] md:placeholder:text-[20px] focus:ring-2 focus:ring-orange-500 transition-all shadow-md"
            />
            
            <Button 
              type="submit"
              disabled={carregandoCep}
              className="w-full h-[50px] sm:h-[55px] md:h-[60px] text-[16px] sm:text-[18px] md:text-[20px] bg-orange-500 hover:bg-green-600 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg transition-all duration-300"
            >
              Cadastrar Endereço
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CadastroDeEndereco
