import { useState, useRef } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import { Input as CampoTexto } from "../components/ui/input"
import lupaPesquisa from "../assets/lupa de pesquisa .png"
import microfoneVoz from "../assets/microfone de voz.png"
import SidebarLayout from "../components/layouts/SidebarLayout"

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

interface BrazilAPIResponse {
  cep: string
  state: string
  city: string
  neighborhood: string
  street: string
  service: string
  location?: {
    type: string
    coordinates: {
      latitude: string
      longitude: string
    }
  }
}

function Localizacao() {
  const [searchText, setSearchText] = useState<string>("")
  const [latitude, setLatitude] = useState<number>(-11.496)
  const [longitude, setLongitude] = useState<number>(-43.737)
  const [zoom, setZoom] = useState<number>(7)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const isProcessingRef = useRef<boolean>(false)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(e.target.value)
    setError("")
  }

  // Função para verificar se é um CEP válido
  const isCEP = (text: string): boolean => {
    const cleanText = text.replace(/\D/g, '')
    return cleanText.length === 8 && /^\d{8}$/.test(cleanText)
  }

  // Buscar informações no OpenStreetMap
  const getAddressFromOpenStreetMap = async (address: string): Promise<SearchResult | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=br&addressdetails=1`
      
      const response = await fetch(url, {
        headers: { 
          'Accept': 'application/json', 
          'User-Agent': 'InfoHubApp/1.0'
        }
      })

      if (!response.ok) {
        console.log(`⚠️ OpenStreetMap retornou erro ${response.status}`)
        return null
      }

      const data: SearchResult[] = await response.json()
      return data.length > 0 ? data[0] : null
      
    } catch (err) {
      console.error("❌ Erro ao buscar no OpenStreetMap:", err)
      return null
    }
  }

  // Buscar endereço pelo CEP
  const searchByCEP = async (cep: string): Promise<void> => {
    const cleanCEP = cep.replace(/\D/g, '')
    setLoading(true)
    setError("")
    console.log("🚀 Buscando CEP:", cleanCEP)
    
    try {
      // 1. BUSCAR DADOS DO ENDEREÇO NO VIACEP
      const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      
      if (!viaCepResponse.ok) {
        throw new Error("Erro ao buscar no ViaCEP")
      }

      const viaCepData: ViaCepResponse = await viaCepResponse.json()
      
      if (viaCepData.erro) {
        throw new Error("CEP não encontrado")
      }

      console.log("✅ Endereço encontrado:", viaCepData)

      const fullAddress = `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`

      // 2. BUSCAR COORDENADAS EXATAS NA BRASILAPI
      console.log("🔍 Buscando coordenadas na BrazilAPI...")
      try {
        const brazilApiResponse = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCEP}`)
        if (brazilApiResponse.ok) {
          const brazilData: BrazilAPIResponse = await brazilApiResponse.json()
          
          if (brazilData.location?.coordinates) {
            const lat = parseFloat(brazilData.location.coordinates.latitude)
            const lon = parseFloat(brazilData.location.coordinates.longitude)
            
            if (!isNaN(lat) && !isNaN(lon)) {
              console.log("✅ Coordenadas EXATAS encontradas:", lat, lon)
              setLatitude(lat)
              setLongitude(lon)
              setZoom(18)
              setSearchText(fullAddress)
              setError("")
              setSearchResults([])
              return
            }
          }
        }
      } catch (err) {
        console.log("⚠️ BrazilAPI sem coordenadas")
      }

      // 3. TENTAR OPENSTREETMAP COM VARIAÇÕES DO ENDEREÇO
      console.log("🔍 Tentando OpenStreetMap...")
      
      // Primeira tentativa: Endereço completo com CEP na query
      let osmData = await getAddressFromOpenStreetMap(`${fullAddress} ${cleanCEP}`)
      
      if (!osmData) {
        console.log("⚠️ Tentando com bairro...")
        const addressWithNeighborhood = `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade}, ${viaCepData.uf}`
        osmData = await getAddressFromOpenStreetMap(addressWithNeighborhood)
      }
      
      if (!osmData) {
        console.log("⚠️ Tentando rua + cidade...")
        const addressSimple = `${viaCepData.logradouro}, ${viaCepData.localidade}, ${viaCepData.uf}`
        osmData = await getAddressFromOpenStreetMap(addressSimple)
      }
      
      if (!osmData) {
        console.log("⚠️ Tentando apenas cidade...")
        const cityOnly = `${viaCepData.localidade}, ${viaCepData.uf}`
        osmData = await getAddressFromOpenStreetMap(cityOnly)
      }
      
      if (osmData) {
        console.log("✅ Coordenadas encontradas no OpenStreetMap")
        setLatitude(parseFloat(osmData.lat))
        setLongitude(parseFloat(osmData.lon))
        setZoom(17)
        setSearchText(fullAddress)
        setError("")
        setSearchResults([])
        return
      }

      // 4. ÚLTIMO RECURSO: CIDADE
      console.log("🔍 Buscando pela cidade...")
      const cityAddress = `${viaCepData.localidade}, ${viaCepData.uf}, Brasil`
      const cityData = await getAddressFromOpenStreetMap(cityAddress)
      
      if (cityData) {
        console.log("⚠️ Localização aproximada")
        setLatitude(parseFloat(cityData.lat))
        setLongitude(parseFloat(cityData.lon))
        setZoom(13)
        setSearchText(fullAddress)
        setError(`⚠️ Localização aproximada: ${viaCepData.localidade} - ${viaCepData.uf}`)
        setSearchResults([])
        return
      }

      throw new Error("Não foi possível localizar as coordenadas")
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar CEP"
      setError(errorMessage)
      console.error("❌ Erro:", err)
    } finally {
      setLoading(false)
    }
  }

  const searchLocation = async (): Promise<void> => {
    const searchTerm = searchText.trim()
    if (!searchTerm) {
      setError("Por favor, digite um endereço ou CEP")
      return
    }

    if (isProcessingRef.current) {
      console.log("⚠️ Já processando...")
      return
    }

    isProcessingRef.current = true
    setLoading(true)
    setError("")
    setSearchResults([])

    try {
      if (isCEP(searchTerm)) {
        await searchByCEP(searchTerm)
      } else {
        console.log("🔍 Buscando endereço:", searchTerm)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=5&countrycodes=br&addressdetails=1`
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'InfoHubApp/1.0'
          }
        })

        if (!response.ok) {
          throw new Error("Erro ao buscar localização")
        }

        const data: SearchResult[] = await response.json()

        if (data.length === 0) {
          setError("Nenhum resultado encontrado")
        } else {
          console.log("✅ Resultados:", data.length)
          setSearchResults(data)
          const firstResult = data[0]
          setLatitude(parseFloat(firstResult.lat))
          setLongitude(parseFloat(firstResult.lon))
          setZoom(15)
        }
      }
    } catch (err) {
      setError("Erro ao buscar localização")
      console.error("Erro:", err)
    } finally {
      setLoading(false)
      isProcessingRef.current = false
    }
  }

  const handleSearchClick = (): void => {
    searchLocation()
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      searchLocation()
    }
  }

  const handleResultClick = (result: SearchResult): void => {
    setLatitude(parseFloat(result.lat))
    setLongitude(parseFloat(result.lon))
    setZoom(15)
    setSearchText(result.display_name)
    setSearchResults([])
  }

  const handleVoiceClick = (): void => {
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
              <p className="text-sm text-blue-600">🔄 Buscando localização...</p>
            </div>
          )}
        </div>
      </section>

      {/* Informações de Coordenadas */}
      <section className="mt-6">
        <div className="bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] rounded-2xl p-4 shadow-lg">
          <p className="text-white text-sm font-semibold">
            📍 Latitude: {latitude?.toFixed(4) || 'N/A'} | Longitude: {longitude?.toFixed(4) || 'N/A'} | Zoom: {zoom}
          </p>
        </div>
      </section>

      {/* Mapa */}
      <section
        className="mt-6 bg-white rounded-3xl border border-gray-100 
                   shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        <div className="w-full h-[calc(100vh-400px)] min-h-[500px]">
          {latitude && longitude && !isNaN(latitude) && !isNaN(longitude) ? (
            <iframe
              key={`${latitude}-${longitude}-${zoom}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`}
              className="w-full h-full border-0"
              loading="lazy"
              title="Mapa de Localização"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">🗺️</p>
                <p className="text-gray-600 text-sm">
                  {loading ? "Carregando mapa..." : "Digite um endereço ou CEP para visualizar o mapa"}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <a
            href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#F9A01B] hover:text-[#FF8C00] font-medium transition-colors"
          >
            Ver mapa maior no OpenStreetMap →
          </a>
        </div>
      </section>
    </SidebarLayout>
  )
}

export default Localizacao
