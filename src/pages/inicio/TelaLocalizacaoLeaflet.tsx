import { useState, useEffect, useRef } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { DivIcon } from "leaflet"
import "leaflet/dist/leaflet.css"
import { Input as CampoTexto } from "../../components/ui/input"
import lupaPesquisa from "../../assets/lupa de pesquisa .png"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { MapPin, Star, ShoppingCart, X, Navigation, Store, Building2, Package, Tag } from "lucide-react"
import api from "../../lib/api"
import { listarProdutos, formatarPreco, isProdutoEmPromocao } from "../../services/apiServicesFixed"

// CSS para corrigir problema de ícones do Leaflet
const leafletCustomCSS = `
  .custom-marker-cadastrado,
  .custom-marker-regiao,
  .custom-marker-usuario {
    background: transparent !important;
    border: none !important;
  }
  .leaflet-marker-icon {
    background: transparent !important;
    border: none !important;
  }
`

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
  isCadastrado?: boolean // true = cadastrado no sistema (laranja), false = da região (verde)
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
  const [produtosEstabelecimento, setProdutosEstabelecimento] = useState<any[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState<boolean>(false)
  
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

  // Estado para estabelecimentos cadastrados no sistema
  const [estabelecimentosCadastrados, setEstabelecimentosCadastrados] = useState<Estabelecimento[]>([])

  // Criar ícone LARANJA para estabelecimentos CADASTRADOS no sistema
  const criarIconeCadastrado = () => {
    return new DivIcon({
      html: `
        <div style="position: relative; width: 44px; height: 54px;">
          <div style="
            background: linear-gradient(135deg, #F9A01B 0%, #FF8C00 100%);
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(249, 160, 27, 0.5);
            border: 3px solid white;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div style="
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 10px solid #FF8C00;
          "></div>
        </div>
      `,
      className: "custom-marker-cadastrado",
      iconSize: [44, 54],
      iconAnchor: [22, 54],
    })
  }

  // Criar ícone VERDE para estabelecimentos da REGIÃO (OpenStreetMap)
  const criarIconeRegiao = () => {
    return new DivIcon({
      html: `
        <div style="position: relative; width: 38px; height: 48px;">
          <div style="
            background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
            border-radius: 50%;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
            border: 3px solid white;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
          </div>
          <div style="
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid #16A34A;
          "></div>
        </div>
      `,
      className: "custom-marker-regiao",
      iconSize: [38, 48],
      iconAnchor: [19, 48],
    })
  }

  // ===============================
  // BUSCA DE ESTABELECIMENTOS CADASTRADOS NO SISTEMA
  // ===============================
  const buscarEstabelecimentosCadastrados = async (lat: number, lon: number): Promise<void> => {
    try {
      console.log("🏢 Buscando estabelecimentos cadastrados no sistema...")
      
      // Busca todos os estabelecimentos do backend
      const response = await api.get<any>("/estabelecimentos")
      const data = response.data
      
      if (data.status && data.estabelecimentos && data.estabelecimentos.length > 0) {
        console.log(`✅ ${data.estabelecimentos.length} estabelecimentos cadastrados encontrados`)
        
        const estabelecimentosProcessados: Estabelecimento[] = []
        
        for (const estab of data.estabelecimentos) {
          // Verifica se tem coordenadas
          let estabLat = estab.latitude || estab.endereco?.latitude
          let estabLon = estab.longitude || estab.endereco?.longitude
          
          // Se não tem coordenadas, tenta buscar pelo endereço
          if (!estabLat || !estabLon) {
            // Tenta pegar do localStorage se for do próprio usuário
            const enderecoStorage = localStorage.getItem('estabelecimentoEnderecoCompleto')
            if (enderecoStorage) {
              try {
                const enderecoObj = JSON.parse(enderecoStorage)
                if (enderecoObj.latitude && enderecoObj.longitude) {
                  estabLat = enderecoObj.latitude
                  estabLon = enderecoObj.longitude
                }
              } catch (e) {
                // Ignora erro de parse
              }
            }
          }
          
          // Se ainda não tem coordenadas, pula este estabelecimento
          if (!estabLat || !estabLon) {
            console.log(`⚠️ Estabelecimento ${estab.nome} sem coordenadas, ignorando...`)
            continue
          }
          
          const distancia = calcularDistancia(lat, lon, estabLat, estabLon)
          
          // Só mostra estabelecimentos em até 50km
          if (distancia > 50) continue
          
          estabelecimentosProcessados.push({
            id: estab.id_estabelecimento || estab.id,
            nome: estab.nome,
            tipo: 'cadastrado',
            lat: estabLat,
            lon: estabLon,
            distancia: parseFloat(distancia.toFixed(2)),
            rating: 5.0, // Estabelecimentos cadastrados têm nota máxima
            comentario: 'Estabelecimento parceiro InfoHub',
            endereco: estab.endereco?.logradouro 
              ? `${estab.endereco.logradouro}, ${estab.endereco.numero || ''} - ${estab.endereco.bairro || ''}`
              : 'Endereço cadastrado',
            imagem: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=300&fit=crop',
            isCadastrado: true
          })
        }
        
        // Ordena por distância
        estabelecimentosProcessados.sort((a, b) => a.distancia - b.distancia)
        
        console.log(`📍 ${estabelecimentosProcessados.length} estabelecimentos cadastrados com coordenadas`)
        setEstabelecimentosCadastrados(estabelecimentosProcessados)
      } else {
        console.log("ℹ️ Nenhum estabelecimento cadastrado encontrado")
        setEstabelecimentosCadastrados([])
      }
    } catch (error) {
      console.log("⚠️ Erro ao buscar estabelecimentos cadastrados:", error)
      setEstabelecimentosCadastrados([])
    }
  }

  // ===============================
  // BUSCA DE MERCADOS PRÓXIMOS (REGIÃO)
  // ===============================
  const buscarMercadosProximos = async (lat: number, lon: number): Promise<void> => {
    setLoading(true)
    
    // Também busca estabelecimentos cadastrados
    buscarEstabelecimentosCadastrados(lat, lon)
    
    try {
      console.log("🔍 Buscando estabelecimentos da região de:", lat, lon)
      
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

  const handleCardClick = async (estabelecimento: Estabelecimento): Promise<void> => {
    setAnimatingCardId(estabelecimento.id)
    
    // Se é um estabelecimento cadastrado, busca os produtos
    if (estabelecimento.isCadastrado) {
      setLoadingProdutos(true)
      try {
        console.log(`📦 Buscando produtos do estabelecimento ${estabelecimento.id}...`)
        const response = await listarProdutos({ estabelecimento: estabelecimento.id })
        if (response.status && response.data) {
          console.log(`✅ ${response.data.length} produtos encontrados`)
          setProdutosEstabelecimento(response.data)
        } else {
          setProdutosEstabelecimento([])
        }
      } catch (error) {
        console.error('❌ Erro ao buscar produtos:', error)
        setProdutosEstabelecimento([])
      } finally {
        setLoadingProdutos(false)
      }
    } else {
      setProdutosEstabelecimento([])
    }
    
    setTimeout(() => {
      setEstabelecimentoSelecionado(estabelecimento)
      setModalAberto(true)
      setAnimatingCardId(null)
    }, 300)
  }

  const handleCloseModal = (): void => {
    setModalAberto(false)
    setEstabelecimentoSelecionado(null)
    setProdutosEstabelecimento([])
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

  // Criar ícone AZUL para posição atual do USUÁRIO
  const criarIconeUsuario = () => {
    return new DivIcon({
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="
            background: #3B82F6;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.4);
            border: 3px solid white;
            animation: pulse 2s infinite;
          ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      className: "custom-marker-usuario",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  return (
    <SidebarLayout>
      {/* CSS para marcadores Leaflet */}
      <style>{leafletCustomCSS}</style>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
      
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

      {/* Legenda do Mapa */}
      <section className="mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Legenda do Mapa
          </h3>
          <div className="flex flex-wrap gap-4">
            {/* Marcador do usuário */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-md ring-2 ring-blue-200">
                <Navigation className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-600">Sua localização</span>
            </div>
            {/* Parceiros InfoHub */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] flex items-center justify-center shadow-md">
                <Store className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-600">Parceiros InfoHub</span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                {estabelecimentosCadastrados.length}
              </span>
            </div>
            {/* Estabelecimentos da região */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <Building2 className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-600">Estabelecimentos da região</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {estabelecimentos.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa Interativo */}
      <section className="mt-4 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_RGBA(0,0,0,0.06)] overflow-hidden">
        <div className="w-full h-[450px] relative">
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
            
            {/* Marcador AZUL - Posição atual do USUÁRIO */}
            <Marker
              key="user-location"
              position={[latitude, longitude]}
              icon={criarIconeUsuario()}
            >
              <Popup>
                <div className="p-2 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Navigation className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-bold text-sm">Sua localização</span>
                  </div>
                  <p className="text-xs text-gray-500">Você está aqui</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Marcadores LARANJAS - Estabelecimentos CADASTRADOS no sistema */}
            {estabelecimentosCadastrados.map((estabelecimento) => (
              <Marker
                key={`cadastrado-${estabelecimento.id}`}
                position={[estabelecimento.lat, estabelecimento.lon]}
                icon={criarIconeCadastrado()}
              >
                <Popup>
                  <div className="p-3 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] flex items-center justify-center">
                        <Store className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-800">{estabelecimento.nome}</h3>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                          Parceiro InfoHub
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{estabelecimento.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {estabelecimento.distancia} km de distância
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Marcadores VERDES - Estabelecimentos da REGIÃO */}
            {estabelecimentos.map((estabelecimento) => (
              <Marker
                key={`regiao-${estabelecimento.id}`}
                position={[estabelecimento.lat, estabelecimento.lon]}
                icon={criarIconeRegiao()}
              >
                <Popup>
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                        <ShoppingCart className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm">{estabelecimento.nome}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {estabelecimento.tipo === 'supermarket' ? '🏪 Supermercado' :
                       estabelecimento.tipo === 'convenience' ? '🏪 Conveniência' :
                       estabelecimento.tipo === 'grocery' ? '🫒 Mercearia' : estabelecimento.tipo}
                    </p>
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
      {/* Lista de Estabelecimentos CADASTRADOS (Parceiros InfoHub) */}
      {estabelecimentosCadastrados.length > 0 && (
        <section className="mt-6">
          <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-lg overflow-hidden">
            {/* Header Premium */}
            <div className="bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
              <h2 className="text-xl font-bold text-white flex items-center gap-2 relative">
                <Store className="w-6 h-6" />
                Parceiros InfoHub
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {estabelecimentosCadastrados.length}
                </span>
              </h2>
              <p className="text-orange-100 text-sm mt-1">Estabelecimentos verificados</p>
            </div>

            {/* Lista */}
            <div className="divide-y divide-orange-100">
              {estabelecimentosCadastrados.map((estabelecimento, index) => (
                <div
                  key={`list-cad-${estabelecimento.id}`}
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
                    {/* Ícone LARANJA */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center shadow-lg">
                        <Store className="w-7 h-7 text-white" />
                      </div>
                      {/* Badge de verificado */}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <h3 className="text-lg font-bold text-gray-800 truncate">
                          {estabelecimento.nome}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F9A01B] text-white rounded-full text-xs font-bold shadow-sm flex-shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                          {estabelecimento.distancia} km
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                          ⭐ Parceiro Verificado
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-gray-800">
                            {estabelecimento.rating}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 italic line-clamp-1">
                        💬 "{estabelecimento.comentario}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lista de Estabelecimentos da REGIÃO */}
      {estabelecimentos.length > 0 && (
        <section className="mt-6">
          <div className="bg-white rounded-2xl border border-green-200 shadow-md overflow-hidden">
            {/* Header Verde */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Estabelecimentos da Região
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {estabelecimentos.length}
                </span>
              </h2>
              <p className="text-green-100 text-sm mt-1">Encontrados via OpenStreetMap</p>
            </div>

            {/* Lista */}
            <div className="divide-y divide-green-50">
              {estabelecimentos.map((estabelecimento, index) => (
                <div
                  key={`list-reg-${estabelecimento.id}`}
                  onClick={() => handleCardClick(estabelecimento)}
                  className={`
                    p-5 cursor-pointer transition-all duration-200
                    hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50
                    ${animatingCardId === estabelecimento.id ? 'bg-green-50 scale-[0.98]' : ''}
                  `}
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Ícone VERDE */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
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
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-bold shadow-sm flex-shrink-0">
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

      {/* Card de Detalhes PRO - Design Compacto */}
      {modalAberto && estabelecimentoSelecionado && (
        <>
          {/* Overlay com blur */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
            onClick={handleCloseModal}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          />
          
          {/* Modal Card Compacto */}
          <div className="fixed inset-x-4 bottom-4 z-[9999] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm">
            <div
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
              style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {/* Header Compacto */}
              <div className={`p-4 relative overflow-hidden ${
                estabelecimentoSelecionado.isCadastrado 
                  ? 'bg-gradient-to-r from-[#F9A01B] to-[#FF8C00]' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600'
              }`}>
                {/* Decoração */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
                <div className="absolute -right-2 -bottom-8 w-16 h-16 bg-white/5 rounded-full" />
                
                {/* Botão Fechar */}
                <button
                  onClick={handleCloseModal}
                  className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-all"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                
                {/* Info Principal */}
                <div className="flex items-center gap-3 relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    estabelecimentoSelecionado.isCadastrado 
                      ? 'bg-white/20' 
                      : 'bg-white/20'
                  }`}>
                    {estabelecimentoSelecionado.isCadastrado ? (
                      <Store className="w-6 h-6 text-white" />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white truncate pr-6">
                      {estabelecimentoSelecionado.nome}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 text-xs">
                        {estabelecimentoSelecionado.tipo === 'supermarket' ? 'Supermercado' :
                         estabelecimentoSelecionado.tipo === 'convenience' ? 'Conveniência' :
                         estabelecimentoSelecionado.tipo === 'grocery' ? 'Mercearia' : 
                         estabelecimentoSelecionado.tipo === 'cadastrado' ? 'Parceiro' : estabelecimentoSelecionado.tipo}
                      </span>
                      {estabelecimentoSelecionado.isCadastrado && (
                        <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                          ✓ Verificado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats em Grid */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                <div className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-[#F9A01B] mb-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">{estabelecimentoSelecionado.distancia}</p>
                  <p className="text-[10px] text-gray-500 uppercase">km</p>
                </div>
                <div className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-500 mb-0.5">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">{estabelecimentoSelecionado.rating}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Nota</p>
                </div>
                <div className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-green-500 mb-0.5">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">~{Math.round(estabelecimentoSelecionado.distancia * 3)}</p>
                  <p className="text-[10px] text-gray-500 uppercase">min</p>
                </div>
              </div>

              {/* Info Compacta */}
              <div className="p-4 space-y-3">
                {/* Endereço */}
                {estabelecimentoSelecionado.endereco && estabelecimentoSelecionado.endereco !== "Endereço não disponível" && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 line-clamp-2">{estabelecimentoSelecionado.endereco}</p>
                  </div>
                )}
                
                {/* Comentário */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-600 italic line-clamp-2">
                    "{estabelecimentoSelecionado.comentario}"
                  </p>
                </div>

                {/* Produtos do estabelecimento (apenas para parceiros) */}
                {estabelecimentoSelecionado.isCadastrado && (
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-[#F9A01B]" />
                      Produtos Disponíveis
                    </h3>
                    
                    {loadingProdutos ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F9A01B]"></div>
                      </div>
                    ) : produtosEstabelecimento.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {produtosEstabelecimento.slice(0, 5).map((produto) => (
                          <div 
                            key={produto.id} 
                            className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100 hover:border-orange-200 transition-colors"
                          >
                            {produto.imagem ? (
                              <img 
                                src={produto.imagem} 
                                alt={produto.nome}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{produto.nome}</p>
                              <div className="flex items-center gap-2">
                                {isProdutoEmPromocao(produto) ? (
                                  <>
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatarPreco(produto.preco)}
                                    </span>
                                    <span className="text-sm font-bold text-green-600">
                                      {formatarPreco(produto.promocao?.preco_promocional || produto.preco)}
                                    </span>
                                    <Tag className="w-3 h-3 text-red-500" />
                                  </>
                                ) : (
                                  <span className="text-sm font-bold text-gray-700">
                                    {formatarPreco(produto.preco)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {produtosEstabelecimento.length > 5 && (
                          <p className="text-xs text-center text-gray-500 pt-2">
                            +{produtosEstabelecimento.length - 5} produtos disponíveis
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">
                        Nenhum produto cadastrado ainda
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Botão de Ação */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${estabelecimentoSelecionado.lat},${estabelecimentoSelecionado.lon}`,
                      '_blank'
                    )
                  }}
                  className={`w-full font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    estabelecimentoSelecionado.isCadastrado 
                      ? 'bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white shadow-lg shadow-orange-200' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200'
                  }`}
                >
                  <Navigation className="w-5 h-5" />
                  Iniciar Navegação
                </button>
              </div>
            </div>
          </div>
          
          {/* Estilos de animação */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </>
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
