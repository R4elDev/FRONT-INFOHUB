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

  // Buscar endereço usando BrasilAPI (v1 é mais estável)
  const getAddressFromBrazilAPI = async (cep: string): Promise<string | null> => {
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`)
      
      if (!response.ok) {
        console.log("BrasilAPI v1 falhou, tentando ViaCEP...")
        return null
      }

      const data = await response.json()
      console.log("✅ Dados da BrasilAPI v1:", data)
      
      if (data.street && data.city && data.state) {
        return `${data.street}, ${data.neighborhood || ''}, ${data.city}, ${data.state}, Brasil`.replace(', ,', ',')
      }
      
      return null
    } catch (err) {
      console.error("Erro ao buscar endereço na BrazilAPI:", err)
      return null
    }
  }

  // Buscar informações complementares no OpenStreetMap
  const getAddressFromOpenStreetMap = async (address: string): Promise<SearchResult | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=br`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      )

      if (!response.ok) {
        return null
      }

      const data: SearchResult[] = await response.json()
      console.log("Dados do OpenStreetMap:", data)
      
      return data.length > 0 ? data[0] : null
    } catch (err) {
      console.error("Erro no OpenStreetMap:", err)
      return null
    }
  }

  // Buscar endereço pelo CEP - Fluxo: BrasilAPI → Nominatim → OpenStreetMap
  const searchByCEP = async (cep: string): Promise<void> => {
    const cleanCEP = cep.replace(/\D/g, '')
    console.log("=== Iniciando busca por CEP:", cleanCEP, "===")
    
    try {
      let fullAddress = ""
      
      // 1. Tentar BrasilAPI primeiro
      console.log("1️⃣ Buscando endereço na BrasilAPI...")
      const brasilApiAddress = await getAddressFromBrazilAPI(cleanCEP)
      
      if (brasilApiAddress) {
        fullAddress = brasilApiAddress
        console.log("✅ Endereço da BrasilAPI:", fullAddress)
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
      }

      console.log("📍 Endereço completo para busca:", fullAddress)

      // 3. Buscar coordenadas no Nominatim (OpenStreetMap)
      console.log("3️⃣ Buscando coordenadas no Nominatim...")
      const osmData = await getAddressFromOpenStreetMap(fullAddress)
      
      if (osmData) {
        console.log("✅ Coordenadas encontradas:", { lat: osmData.lat, lon: osmData.lon })
        const lat = parseFloat(osmData.lat)
        const lon = parseFloat(osmData.lon)
        
        // Validar coordenadas
        if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          setLatitude(lat)
          setLongitude(lon)
          setZoom(16)
          setSearchText(fullAddress)
          setError("")
          setSearchResults([])
          return
        }
      }

      // 4. Se não encontrar coordenadas específicas, tentar pela cidade
      console.log("⚠️ Tentando buscar pela cidade...")
      const addressParts = fullAddress.split(',')
      const cityState = addressParts.slice(-3, -1).join(',').trim() + ", Brasil"
      const cityData = await getAddressFromOpenStreetMap(cityState)
      
      if (cityData) {
        console.log("✅ Localização aproximada pela cidade:", cityData)
        const lat = parseFloat(cityData.lat)
        const lon = parseFloat(cityData.lon)
        
        if (!isNaN(lat) && !isNaN(lon)) {
          setLatitude(lat)
          setLongitude(lon)
          setZoom(13)
          setSearchText(fullAddress)
          setError(`Localização aproximada encontrada para a cidade`)
          setSearchResults([])
          return
        }
      }

      setError("Não foi possível localizar as coordenadas do CEP.")
      console.log("❌ Nenhuma coordenada válida encontrada")
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
        // API Nominatim do OpenStreetMap para endereços
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5&countrycodes=br`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        )

        if (!response.ok) {
          throw new Error("Erro ao buscar localização")
        }

        const data: SearchResult[] = await response.json()

        if (data.length === 0) {
          setError("Nenhum resultado encontrado. Tente outro endereço ou CEP.")
        } else {
          setSearchResults(data)
          // Atualiza o mapa com o primeiro resultado
          const firstResult = data[0]
          const lat = parseFloat(firstResult.lat)
          const lon = parseFloat(firstResult.lon)
          
          // Validar coordenadas antes de definir
          if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            setLatitude(lat)
            setLongitude(lon)
            setZoom(15)
          } else {
            setError("Coordenadas inválidas encontradas.")
          }
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
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {parseFloat(result.lat).toFixed(4)}, Lon: {parseFloat(result.lon).toFixed(4)}
                  </p>
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

      {/* Informações de Coordenadas */}
      <section className="mt-6">
        <div className="bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] rounded-2xl p-4 shadow-lg">
          <p className="text-white text-sm font-semibold">
            📍 Latitude: {latitude !== null ? latitude.toFixed(6) : 'N/A'} | Longitude: {longitude !== null ? longitude.toFixed(6) : 'N/A'} | Zoom: {zoom}
          </p>
          {latitude !== null && longitude !== null && (
            <p className="text-white text-xs mt-1 opacity-90">
              🔗 Link: https://www.openstreetmap.org/?mlat={latitude}&mlon={longitude}#map={zoom}/{latitude}/{longitude}
            </p>
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
