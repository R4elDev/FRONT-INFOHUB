import { useState } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import { Input as CampoTexto } from "../../components/ui/input"
import lupaPesquisa from "../../assets/lupa de pesquisa .png"
import microfoneVoz from "../../assets/microfone de voz.png"
import SidebarLayout from "../../components/layouts/SidebarLayout"

interface SearchResult {
  display_name: string
  lat: string
  lon: string
  place_id: number
}

interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

// Interface removida - não sendo utilizada no código atual

function Localizacao() {
  const [searchText, setSearchText] = useState<string>("")
  // Coordenadas mantidas internamente para envio ao backend (não exibidas na tela)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [zoom, setZoom] = useState<number>(7)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  // Função para verificar se é um CEP válido
  const isCEP = (text: string): boolean => {
    const cleanText = text.replace(/\D/g, '')
    const isValid = cleanText.length === 8 && /^\d{8}$/.test(cleanText)
    console.log("Verificando CEP:", text, "Limpo:", cleanText, "Válido:", isValid)
    return isValid
  }


  // Coordenadas padrão para cidades brasileiras (fallback)
  const getDefaultCoords = (city: string, state: string): {lat: number, lon: number} => {
    const defaultCities: {[key: string]: {lat: number, lon: number}} = {
      'São Paulo-SP': {lat: -23.5505, lon: -46.6333},
      'Carapicuíba-SP': {lat: -23.5225, lon: -46.8356},
      'Rio de Janeiro-RJ': {lat: -22.9068, lon: -43.1729},
      'Belo Horizonte-MG': {lat: -19.9167, lon: -43.9345},
      'Brasília-DF': {lat: -15.7939, lon: -47.8828},
      'Curitiba-PR': {lat: -25.4284, lon: -49.2733},
      'Porto Alegre-RS': {lat: -30.0346, lon: -51.2177},
      'Salvador-BA': {lat: -12.9714, lon: -38.5014},
      'Fortaleza-CE': {lat: -3.7172, lon: -38.5433},
      'Recife-PE': {lat: -8.0476, lon: -34.8770}
    }
    
    const key = `${city}-${state}`
    return defaultCities[key] || defaultCities['São Paulo-SP']
  }

  // Buscar endereço pelo CEP - Fluxo simplificado: BrasilAPI → Coordenadas aproximadas
  const searchByCEP = async (cep: string): Promise<void> => {
    const cleanCEP = cep.replace(/\D/g, '')
    console.log("=== Iniciando busca por CEP:", cleanCEP, "===")
    
    try {
      let fullAddress = ""
      let city = ""
      let state = ""
      
      // 1. Tentar BrasilAPI primeiro
      console.log("1️⃣ Buscando endereço na BrasilAPI...")
      const brasilApiResponse = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCEP}`)
      
      if (brasilApiResponse.ok) {
        const data = await brasilApiResponse.json()
        console.log("✅ Dados da BrasilAPI v1:", data)
        
        if (data.street && data.city && data.state) {
          fullAddress = `${data.street}, ${data.neighborhood || ''}, ${data.city}, ${data.state}, Brasil`.replace(', ,', ',')
          city = data.city
          state = data.state
          console.log("✅ Endereço da BrasilAPI:", fullAddress)
        }
      } else {
        // 2. Fallback para ViaCEP se BrasilAPI falhar
        console.log("2️⃣ Fallback: Buscando endereço no ViaCEP...")
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
        
        if (!viaCepResponse.ok) {
          throw new Error("Erro ao buscar no ViaCEP")
        }

        const viaCepData: ViaCepResponse = await viaCepResponse.json()
        console.log("✅ Dados do ViaCEP:", viaCepData)

        if (viaCepData.erro) {
          setError("CEP não encontrado. Verifique e tente novamente.")
          return
        }

        fullAddress = `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`
        city = viaCepData.localidade
        state = viaCepData.uf
      }

      console.log("📍 Endereço completo:", fullAddress)

      // 2. Buscar coordenadas aproximadas (sem usar Nominatim por causa do CORS)
      console.log("2️⃣ Buscando coordenadas aproximadas...")
      
      // Usa coordenadas padrão da cidade
      const coords = getDefaultCoords(city, state)
      
      setLatitude(coords.lat)
      setLongitude(coords.lon)
      setZoom(13)
      setSearchText(fullAddress)
      setError(`📍 Localização aproximada para ${city}/${state}`)
      setSearchResults([])
      
      console.log("✅ Coordenadas definidas:", coords)
    } catch (err) {
      setError("Erro ao buscar CEP. Tente novamente.")
      console.error("Erro na busca por CEP:", err)
    }
  }

  const searchLocation = async (): Promise<void> => {
    if (!searchText.trim()) {
      setError("Por favor, digite um endereço ou CEP para buscar")
      return
    }

    setLoading(true)
    setError("")
    setSearchResults([])

    try {
      // Verifica se é um CEP
      if (isCEP(searchText)) {
        await searchByCEP(searchText)
      } else {
        // Busca por nome de cidade
        const searchTerms = searchText.toLowerCase()
        
        // Tenta encontrar a cidade nas coordenadas padrão
        let foundCoords = null
        for (const [cityKey, coords] of Object.entries({
          'São Paulo-SP': {lat: -23.5505, lon: -46.6333},
          'Carapicuíba-SP': {lat: -23.5225, lon: -46.8356},
          'Rio de Janeiro-RJ': {lat: -22.9068, lon: -43.1729},
          'Belo Horizonte-MG': {lat: -19.9167, lon: -43.9345},
          'Brasília-DF': {lat: -15.7939, lon: -47.8828},
          'Curitiba-PR': {lat: -25.4284, lon: -49.2733},
          'Porto Alegre-RS': {lat: -30.0346, lon: -51.2177},
          'Salvador-BA': {lat: -12.9714, lon: -38.5014},
          'Fortaleza-CE': {lat: -3.7172, lon: -38.5433},
          'Recife-PE': {lat: -8.0476, lon: -34.8770}
        })) {
          const cityName = cityKey.split('-')[0].toLowerCase()
          if (searchTerms.includes(cityName)) {
            foundCoords = { cityKey, ...coords }
            break
          }
        }

        if (foundCoords) {
          setLatitude(foundCoords.lat)
          setLongitude(foundCoords.lon)
          setZoom(12)
          setSearchText(foundCoords.cityKey.replace('-', ' / '))
          setError(`📍 Localização aproximada para ${foundCoords.cityKey}`)
          setSearchResults([])
        } else {
          setError("Cidade não encontrada. Tente: São Paulo, Rio de Janeiro, Brasília, etc.")
        }
      }
    } catch (err) {
      setError("Erro ao buscar localização. Tente novamente.")
      console.error("Erro na busca:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(e.target.value)
    setError("")
  }

  const handleSearchClick = (): void => {
    searchLocation()
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      searchLocation()
    }
  }

  const handleResultClick = (result: SearchResult): void => {
    const lat = parseFloat(result.lat)
    const lon = parseFloat(result.lon)
    
    // Validar coordenadas antes de definir
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      setLatitude(lat)
      setLongitude(lon)
      setZoom(15)
      setSearchText(result.display_name)
      setSearchResults([])
      setError("")
    } else {
      setError("Coordenadas inválidas selecionadas.")
    }
  }

  const handleVoiceClick = (): void => {
    // Implementar lógica de reconhecimento de voz aqui
    console.log("Ativar microfone")
  }

  return (
    <SidebarLayout>
      {/* Barra de Pesquisa */}
      <section className="mt-8">
        <div className="relative">
          <div
            className="relative w-full bg-white rounded-3xl border border-gray-100 
                       shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all 
                       hover:shadow-[0_6px_30px_rgba(0,0,0,0.12)]"
          >
            <button
              onClick={handleSearchClick}
              className="absolute left-6 top-1/2 -translate-y-1/2 transition-transform hover:scale-110 z-10"
            >
              <img
                src={lupaPesquisa}
                alt="Pesquisar"
                className="w-6 h-6"
              />
            </button>
            <CampoTexto
              placeholder="Digite um endereço ou CEP (ex: 01310-100)..."
              value={searchText}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="h-16 pl-16 pr-16 rounded-3xl border-0 text-gray-700 text-base 
                         focus-visible:ring-2 focus-visible:ring-[#F9A01B] 
                         placeholder:text-gray-400"
            />
            <button
              onClick={handleVoiceClick}
              className="absolute right-6 top-1/2 -translate-y-1/2 transition-transform hover:scale-110"
            >
              <img
                src={microfoneVoz}
                alt="Pesquisar por voz"
                className="w-5 h-6"
              />
            </button>
          </div>

          {/* Resultados da Busca */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl max-h-80 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <p className="text-sm text-gray-800 font-medium">{result.display_name}</p>
                </button>
              ))}
            </div>
          )}

          {/* Mensagens de Erro */}
          {error && (
            <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-600">Buscando localização...</p>
            </div>
          )}
        </div>
      </section>

      {/* Mapa */}
      <section
        className="mt-6 bg-white rounded-3xl border border-gray-100 
                   shadow-[0_4px_20px_RGBA(0,0,0,0.06)] overflow-hidden"
      >
        <div className="w-full h-[calc(100vh-450px)] min-h-[400px] max-h-[600px]">
          {latitude !== null && longitude !== null ? (
            <iframe
              key={`map-${latitude}-${longitude}-${zoom}-${Date.now()}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`}
              className="w-full h-full border-0"
              loading="lazy"
              title="Mapa de Localização"
              allow="geolocation"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Mapa não carregado</h3>
                <p className="text-gray-500 mb-4">Digite um endereço ou CEP para visualizar a localização</p>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Exemplo de CEP: <span className="font-mono bg-gray-100 px-2 py-1 rounded">01310-100</span></p>
                  <p className="text-sm text-gray-600 mt-1">Exemplo de endereço: <span className="font-mono bg-gray-100 px-2 py-1 rounded">São Paulo, SP</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          {latitude !== null && longitude !== null ? (
            <a
              href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#F9A01B] hover:text-[#FF8C00] font-medium transition-colors"
            >
              Ver mapa maior no OpenStreetMap →
            </a>
          ) : (
            <p className="text-sm text-gray-500">Aguardando localização para exibir link do mapa</p>
          )}
        </div>
      </section>
    </SidebarLayout>
  )
}

export default Localizacao;
