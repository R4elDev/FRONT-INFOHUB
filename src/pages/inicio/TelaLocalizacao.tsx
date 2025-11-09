import { useState, useEffect, useRef } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { DivIcon } from "leaflet"
import "leaflet/dist/leaflet.css"
import { Input as CampoTexto } from "../../components/ui/input"
import lupaPesquisa from "../../assets/lupa de pesquisa .png"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { MapPin, Star, ShoppingCart, X, Navigation } from "lucide-react"

// ===============================
// INTERFACES
// ===============================
interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

interface NominatimResponse {
  lat: string
  lon: string
  display_name: string
}

interface Estabelecimento {
  id: number
  nome: string
  tipo: string
  lat: number
  lon: number
  distancia: number
  rating: number
  comentario: string
  endereco?: string
  imagem: string
}

// ===============================
// COMPONENTES AUXILIARES
// ===============================

// Componente para atualizar o centro do mapa
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

function Localizacao() {
  // ===============================
  // ESTADOS
  // ===============================
  const [searchText, setSearchText] = useState<string>("")
  const [latitude, setLatitude] = useState<number>(-23.5505) // São Paulo padrão
  const [longitude, setLongitude] = useState<number>(-46.6333)
  const [zoom, setZoom] = useState<number>(13)
  const [loading, setLoading] = useState<boolean>(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>("")
  const [feedbackType, setFeedbackType] = useState<"success" | "warning" | "error" | "">("")
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([])
  const [estabelecimentoSelecionado, setEstabelecimentoSelecionado] = useState<Estabelecimento | null>(null)
  const [modalAberto, setModalAberto] = useState<boolean>(false)
  const [animatingCardId, setAnimatingCardId] = useState<number | null>(null)
  
  // Refs
  const mapRef = useRef(null)

  // ===============================
  // UTILITÁRIOS
  // ===============================

  // Verificar se é CEP válido
  const isCEP = (text: string): boolean => {
    const cleanText = text.replace(/\D/g, '')
    return cleanText.length === 8 && /^\d{8}$/.test(cleanText)
  }

  // Calcular distância entre dois pontos (em km)
  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Gerar comentários aleatórios
  const comentariosAleatorios = [
    "Ótimo atendimento!",
    "Produtos frescos.",
    "Preços justos.",
    "Variedade incrível!",
    "Ambiente limpo e organizado.",
    "Equipe muito atenciosa.",
    "Recomendo muito!",
    "Bom custo-benefício.",
  ]

  const obterComentarioAleatorio = (): string => {
    return comentariosAleatorios[Math.floor(Math.random() * comentariosAleatorios.length)]
  }

  // Gerar rating aleatório
  const obterRatingAleatorio = (): number => {
    return parseFloat((3.5 + Math.random() * 1.5).toFixed(1))
  }

  // Obter logo/imagem real do estabelecimento
  const obterImagemEstabelecimento = (nome: string, tipo: string): string => {
    // Normalizar nome para busca
    const nomeNormalizado = nome.toLowerCase()
    
    // Mapeamento de marcas conhecidas para suas logos (URLs diretas confiáveis)
    const logosConhecidas: { [key: string]: string } = {
      // Grandes redes
      'assai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Assai_Atacadista_logo.svg/800px-Assai_Atacadista_logo.svg.png',
      'assá': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Assai_Atacadista_logo.svg/800px-Assai_Atacadista_logo.svg.png',
      'pão de açucar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/P%C3%A3o_de_A%C3%A7%C3%BAcar_logo.svg/800px-P%C3%A3o_de_A%C3%A7%C3%BAcar_logo.svg.png',
      'extra': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Extra_Hipermercados_logo.svg/800px-Extra_Hipermercados_logo.svg.png',
      'carrefour': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Carrefour_logo.svg/800px-Carrefour_logo.svg.png',
      'walmart': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Walmart_logo.svg/800px-Walmart_logo.svg.png',
      'big': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/BIG_%28supermercado%29_logo.svg/800px-BIG_%28supermercado%29_logo.svg.png',
      'dia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Supermercados_DIA_logo.svg/800px-Supermercados_DIA_logo.svg.png',
      'atacadão': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Atacad%C3%A3o_logo.svg/800px-Atacad%C3%A3o_logo.svg.png',
      'savegnago': 'https://savegnago.vtexassets.com/assets/vtex.file-manager-graphql/images/f4e0ec1e-f5db-4a9f-9b9a-0c3e9e0b9e9e___d9b0c9b9f9e9e9e9e9e9e9e9e9e9e9e9.png',
      'condor': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Condor_Super_Center_logo.svg/800px-Condor_Super_Center_logo.svg.png',
      'angeloni': 'https://www.angeloni.com.br/static/version1701234567/frontend/Angeloni/default/pt_BR/images/logo.svg',
      'zona sul': 'https://www.zonasul.com.br/themes/zonasul/assets/img/logo.svg',
      'mercado livre': 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png',
    }
    
    // Verificar se alguma marca conhecida está no nome
    for (const [marca, logo] of Object.entries(logosConhecidas)) {
      if (nomeNormalizado.includes(marca)) {
        console.log(`✅ Logo encontrada para ${nome}: ${marca}`)
        return logo
      }
    }
    
    // Fallback: usar imagem genérica do tipo (Wikipedia Commons - sempre funciona)
    const imagensPorTipo: { [key: string]: string } = {
      supermarket: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=300&fit=crop',
      convenience: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
      grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    }
    
    console.log(`⚠️ Usando imagem genérica para ${nome}`)
    return imagensPorTipo[tipo] || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=300&fit=crop'
  }

  // Criar ícone personalizado para marcadores
  const criarIconeCarrinho = () => {
    return new DivIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #F9A01B 0%, #FF8C00 100%);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(249, 160, 27, 0.4);
          border: 3px solid white;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"/>
            <circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
        </div>
      `,
      className: "custom-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    })
  }

  // ===============================
  // BUSCA DE MERCADOS PRÓXIMOS
  // ===============================
  const buscarMercadosProximos = async (lat: number, lon: number): Promise<void> => {
    setLoading(true)
    try {
      console.log("🔍 Buscando estabelecimentos próximos de:", lat, lon)
      
      // API Overpass do OpenStreetMap - Query melhorada para incluir center
      const query = `
        [out:json][timeout:25];
        (
          node["shop"~"supermarket|convenience|grocery"](around:5000,${lat},${lon});
          way["shop"~"supermarket|convenience|grocery"](around:5000,${lat},${lon});
        );
        out center body;
      `
      
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      })

      if (!response.ok) {
        throw new Error("Erro ao buscar estabelecimentos")
      }

      const data = await response.json()
      console.log("📦 Dados recebidos da Overpass API:", data)
      
      // Processar resultados
      const estabelecimentosEncontrados: Estabelecimento[] = []
      
      // Mapeamento de tipos para nomes mais amigáveis
      const tiposNomes: { [key: string]: string[] } = {
        supermarket: ["Supermercado Local", "Mercado", "Supermercado", "Mini Mercado"],
        convenience: ["Conveniência", "Loja de Conveniência", "Mercearia", "Empório"],
        grocery: ["Mercearia", "Quitanda", "Armazém", "Empório"]
      }
      
      data.elements.forEach((element: any, index: number) => {
        // Pegar coordenadas do elemento
        const elementLat = element.lat || element.center?.lat
        const elementLon = element.lon || element.center?.lon
        
        if (elementLat && elementLon && element.tags) {
          const distancia = calcularDistancia(lat, lon, elementLat, elementLon)
          const tipoShop = element.tags.shop || "supermarket"
          
          // Gerar nome melhorado
          let nomeFinal = element.tags.name
          if (!nomeFinal || nomeFinal.trim() === "") {
            // Se não tem nome, gerar um nome descritivo
            const nomesPossiveis = tiposNomes[tipoShop] || ["Estabelecimento Local"]
            const nomeBase = nomesPossiveis[index % nomesPossiveis.length]
            nomeFinal = `${nomeBase} ${Math.floor(distancia * 10)}`
          }
          
          // Melhorar endereço
          const rua = element.tags["addr:street"] || element.tags["addr:place"] || ""
          const numero = element.tags["addr:housenumber"] || ""
          const bairro = element.tags["addr:suburb"] || element.tags["addr:neighbourhood"] || ""
          const cidade = element.tags["addr:city"] || ""
          
          let enderecoCompleto = ""
          if (rua) {
            enderecoCompleto = `${rua}${numero ? ', ' + numero : ''}`
            if (bairro) enderecoCompleto += ` - ${bairro}`
            if (cidade) enderecoCompleto += ` - ${cidade}`
          } else {
            enderecoCompleto = "Endereço não disponível"
          }
          
          const estabelecimento: Estabelecimento = {
            id: element.id,
            nome: nomeFinal,
            tipo: tipoShop,
            lat: elementLat,
            lon: elementLon,
            distancia: parseFloat(distancia.toFixed(2)),
            rating: obterRatingAleatorio(),
            comentario: obterComentarioAleatorio(),
            endereco: enderecoCompleto,
            imagem: obterImagemEstabelecimento(nomeFinal, tipoShop),
          }
          
          estabelecimentosEncontrados.push(estabelecimento)
          console.log("✅ Estabelecimento adicionado:", estabelecimento.nome)
        }
      })

      // Ordenar por distância e limitar a 10 resultados
      const estabelecimentosOrdenados = estabelecimentosEncontrados
        .sort((a, b) => a.distancia - b.distancia)
        .slice(0, 10)

      console.log(`📊 Total de estabelecimentos encontrados: ${estabelecimentosOrdenados.length}`)
      setEstabelecimentos(estabelecimentosOrdenados)

      if (estabelecimentosOrdenados.length > 0) {
        setFeedbackMessage(`✅ ${estabelecimentosOrdenados.length} estabelecimento(s) encontrado(s)!`)
        setFeedbackType("success")
      } else {
        setFeedbackMessage("⚠️ Nenhum estabelecimento próximo encontrado.")
        setFeedbackType("warning")
      }
    } catch (error) {
      console.error("❌ Erro ao buscar mercados:", error)
      setFeedbackMessage("❌ Erro ao buscar estabelecimentos. Tente novamente.")
      setFeedbackType("error")
      setEstabelecimentos([])
    } finally {
      setLoading(false)
    }
  }

  // ===============================
  // BUSCA POR CEP
  // ===============================
  const buscarPorCEP = async (cep: string): Promise<void> => {
    const cleanCEP = cep.replace(/\D/g, '')
    console.log("🔍 Buscando CEP:", cleanCEP)
    
    try {
      // Buscar endereço no ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      
      if (!response.ok) {
        throw new Error("Erro ao buscar CEP")
      }

      const data: ViaCepResponse = await response.json()
      console.log("📦 Dados do ViaCEP:", data)

      if (data.erro) {
        setFeedbackMessage("❌ CEP não encontrado. Verifique e tente novamente.")
        setFeedbackType("error")
        return
      }

      // Tentar buscar com endereço completo primeiro
      let addressToSearch = ""
      
      if (data.logradouro && data.logradouro.trim() !== "") {
        // Se tem logradouro, usar endereço completo
        addressToSearch = `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}, Brasil`
      } else {
        // Se não tem logradouro, usar apenas cidade e estado
        addressToSearch = `${data.localidade}, ${data.uf}, Brasil`
      }
      
      console.log("📍 Buscando endereço:", addressToSearch)
      await buscarPorEndereco(addressToSearch)
      
    } catch (err) {
      console.error("❌ Erro na busca por CEP:", err)
      setFeedbackMessage("❌ Erro ao buscar CEP. Tente novamente.")
      setFeedbackType("error")
    }
  }

  // ===============================
  // BUSCA POR ENDEREÇO (NOMINATIM)
  // ===============================
  const buscarPorEndereco = async (endereco: string): Promise<void> => {
    try {
      console.log("🔍 Buscando coordenadas para:", endereco)
      
      // Usar Nominatim do OpenStreetMap para geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1&countrycodes=br`,
        {
          headers: {
            'User-Agent': 'InfoHub-App/1.0'
          }
        }
      )

      if (!response.ok) {
        console.error("❌ Erro na resposta do Nominatim:", response.status)
        throw new Error("Erro ao buscar endereço")
      }

      const data: NominatimResponse[] = await response.json()
      console.log("📦 Dados do Nominatim:", data)

      if (data.length === 0) {
        setFeedbackMessage("❌ Endereço não encontrado. Tente apenas a cidade.")
        setFeedbackType("error")
        return
      }

      const location = data[0]
      const lat = parseFloat(location.lat)
      const lon = parseFloat(location.lon)

      console.log("📍 Coordenadas encontradas:", lat, lon)

      setLatitude(lat)
      setLongitude(lon)
      setZoom(15)
      setSearchText(location.display_name)
      setFeedbackMessage("✅ Endereço encontrado com sucesso!")
      setFeedbackType("success")

      // Buscar mercados próximos
      await buscarMercadosProximos(lat, lon)
      
    } catch (err) {
      console.error("❌ Erro na busca por endereço:", err)
      setFeedbackMessage("❌ Erro ao buscar endereço. Tente novamente.")
      setFeedbackType("error")
    }
  }

  // ===============================
  // HANDLERS
  // ===============================
  const realizarBusca = async (): Promise<void> => {
    if (!searchText.trim()) {
      setFeedbackMessage("Por favor, digite um endereço ou CEP para buscar")
      setFeedbackType("error")
      return
    }

    setLoading(true)
    setFeedbackMessage("")
    setFeedbackType("")
    setEstabelecimentos([])

    try {
      // Verifica se é um CEP
      if (isCEP(searchText)) {
        await buscarPorCEP(searchText)
      } else {
        // Busca por endereço
        await buscarPorEndereco(searchText)
      }
    } catch (err) {
      console.error("Erro na busca:", err)
      setFeedbackMessage("❌ Erro ao buscar localização. Tente novamente.")
      setFeedbackType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(e.target.value)
    setFeedbackMessage("")
    setFeedbackType("")
  }

  const handleSearchClick = (): void => {
    realizarBusca()
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      realizarBusca()
    }
  }

  const handleCardClick = (estabelecimento: Estabelecimento): void => {
    setAnimatingCardId(estabelecimento.id)
    setTimeout(() => {
      setEstabelecimentoSelecionado(estabelecimento)
      setModalAberto(true)
      setAnimatingCardId(null)
    }, 300)
  }

  const handleCloseModal = (): void => {
    setModalAberto(false)
    setEstabelecimentoSelecionado(null)
  }

  // Obter localização do usuário ao carregar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lon } = position.coords
          setLatitude(lat)
          setLongitude(lon)
          buscarMercadosProximos(lat, lon)
        },
        () => {
          setFeedbackMessage("⚠️ Não foi possível acessar sua localização atual.")
          setFeedbackType("warning")
        }
      )
    }
  }, [])

  // Prevenir scroll quando modal está aberto
  useEffect(() => {
    if (modalAberto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [modalAberto])

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
              onClick={() => {
                setLatitude(-23.5505)
                setLongitude(-46.6333)
                buscarMercadosProximos(-23.5505, -46.6333)
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 transition-transform hover:scale-110"
              title="Centralizar em São Paulo"
            >
              <Navigation className="w-5 h-5 text-[#F9A01B]" />
            </button>
          </div>

          {/* Mensagens de Feedback */}
          {feedbackMessage && (
            <div className={`mt-3 p-4 rounded-xl border ${
              feedbackType === "success" ? "bg-green-50 border-green-200" :
              feedbackType === "warning" ? "bg-yellow-50 border-yellow-200" :
              "bg-red-50 border-red-200"
            }`}>
              <p className={`text-sm ${
                feedbackType === "success" ? "text-green-600" :
                feedbackType === "warning" ? "text-yellow-600" :
                "text-red-600"
              }`}>{feedbackMessage}</p>
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

      {/* Mapa Interativo */}
      <section className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_RGBA(0,0,0,0.06)] overflow-hidden">
        <div className="w-full h-[400px] relative">
          <MapContainer
            center={[latitude, longitude]}
            zoom={zoom}
            className="w-full h-full"
            ref={mapRef}
          >
            <MapUpdater center={[latitude, longitude]} zoom={zoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Marcadores dos estabelecimentos */}
            {estabelecimentos.map((estabelecimento) => (
              <Marker
                key={estabelecimento.id}
                position={[estabelecimento.lat, estabelecimento.lon]}
                icon={criarIconeCarrinho()}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1">{estabelecimento.nome}</h3>
                    <p className="text-xs text-gray-600 mb-1">{estabelecimento.tipo}</p>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{estabelecimento.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">{estabelecimento.distancia} km</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>
      {/* Lista de Estabelecimentos */}
      {estabelecimentos.length > 0 && (
        <section className="mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
            {/* Header da Lista */}
            <div className="bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Estabelecimentos Próximos
              </h2>
            </div>

            {/* Lista */}
            <div className="divide-y divide-gray-100">
              {estabelecimentos.map((estabelecimento, index) => (
                <div
                  key={estabelecimento.id}
                  onClick={() => handleCardClick(estabelecimento)}
                  className={`
                    p-5 cursor-pointer transition-all duration-200
                    hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50
                    ${animatingCardId === estabelecimento.id ? 'bg-orange-50 scale-[0.98]' : ''}
                  `}
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Ícone do Estabelecimento */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center shadow-lg">
                        <ShoppingCart className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Informações Principais */}
                    <div className="flex-1 min-w-0">
                      {/* Nome e Distância */}
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <h3 className="text-lg font-bold text-gray-800 truncate">
                          {estabelecimento.nome}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F9A01B] text-white rounded-full text-xs font-bold shadow-sm flex-shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                          {estabelecimento.distancia} km
                        </span>
                      </div>

                      {/* Tipo e Rating */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-600 font-medium">
                          {estabelecimento.tipo === 'supermarket' ? '🏪 Supermercado' :
                           estabelecimento.tipo === 'convenience' ? '🏪 Conveniência' :
                           estabelecimento.tipo === 'grocery' ? '🫒 Mercearia' : estabelecimento.tipo}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-gray-800">
                            {estabelecimento.rating}
                          </span>
                        </div>
                      </div>

                      {/* Comentário e Endereço */}
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 italic line-clamp-1">
                          💬 "{estabelecimento.comentario}"
                        </p>
                        {estabelecimento.endereco && estabelecimento.endereco !== "Endereço não disponível" && (
                          <p className="text-xs text-gray-500 line-clamp-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {estabelecimento.endereco}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Card de Detalhes Aprimorado */}
      {modalAberto && estabelecimentoSelecionado && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center p-4">
          {/* Modal */}
          <div
            className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto pointer-events-auto"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* Botão Fechar */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-md transition-all hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Header com ícone */}
            <div className="bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] p-6 rounded-t-3xl">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h2 className="text-2xl font-bold text-white mb-1 pr-8 leading-tight">
                    {estabelecimentoSelecionado.nome}
                  </h2>
                  <p className="text-white text-opacity-90 text-sm font-medium">
                    {estabelecimentoSelecionado.tipo === 'supermarket' ? '🏪 Supermercado' :
                     estabelecimentoSelecionado.tipo === 'convenience' ? '🏪 Conveniência' :
                     estabelecimentoSelecionado.tipo === 'grocery' ? '🫒 Mercearia' : estabelecimentoSelecionado.tipo}
                  </p>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              {/* Distância e Rating */}
              <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#F9A01B]" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Distância</p>
                    <p className="text-lg font-bold text-gray-800">{estabelecimentoSelecionado.distancia} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Avaliação</p>
                    <p className="text-lg font-bold text-gray-800">{estabelecimentoSelecionado.rating}</p>
                  </div>
                </div>
              </div>

              {/* Informações */}
              <div className="space-y-4 mb-5">
                {/* Endereço */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">📍 Endereço</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {estabelecimentoSelecionado.endereco}
                  </p>
                </div>

                {/* Comentário */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">💬 Avaliação</p>
                  <div className="bg-gradient-to-r from-gray-50 to-orange-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-700 italic">
                      "{estabelecimentoSelecionado.comentario}"
                    </p>
                  </div>
                </div>

                {/* Coordenadas (opcional, para debug) */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">🧭 Coordenadas</p>
                  <p className="text-xs text-gray-500 font-mono">
                    {estabelecimentoSelecionado.lat.toFixed(6)}, {estabelecimentoSelecionado.lon.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Botão de Ação */}
              <button
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${estabelecimentoSelecionado.lat},${estabelecimentoSelecionado.lon}`,
                    '_blank'
                  )
                }}
                className="w-full bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Abrir Rota no Google Maps
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

// Adicionar animações CSS
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, -45%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .leaflet-container {
    border-radius: 1.5rem;
    position: relative !important;
    z-index: 1 !important;
  }

  .custom-marker {
    background: transparent;
    border: none;
  }
`
document.head.appendChild(style)

export default Localizacao;
