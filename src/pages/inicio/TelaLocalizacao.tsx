// ===============================
// TELA LOCALIZAÇÃO - GOOGLE MAPS
// Versão atualizada usando Google Maps API
// ===============================

import { useState, useEffect, useRef } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import { Input as CampoTexto } from "../../components/ui/input"
import lupaPesquisa from "../../assets/lupa de pesquisa .png"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { MapPin, Star, ShoppingCart, X, Navigation } from "lucide-react"
import { GoogleMapWrapper, type GoogleMapRef } from "../../components/GoogleMap"
import {
  buscarCoordenadasPorCEP,
  buscarCoordenadasPorEndereco,
  buscarEstabelecimentosPorNome,
  buscarPorCategoria,
  buscarDetalhesEstabelecimento,
  type Coordinates
} from "../../services/googleMapsService"

// ===============================
// INTERFACES
// ===============================
interface Estabelecimento {
  id: string
  nome: string
  tipo: string
  coordinates: Coordinates
  distancia: number
  rating: number
  comentario: string
  endereco?: string
  imagem: string
  // Informações reais da Places API
  priceLevel?: number // 0-4 (gratuito a muito caro)
  priceLevelText?: string // Texto descritivo do preço
  abreAgora?: boolean
  horarios?: string[]
  telefone?: string
  website?: string
  totalAvaliacoes?: number
  // Informações detalhadas
  fotos?: string[] // Array de URLs de fotos
  avaliacoes?: Array<{
    rating: number
    texto: string
    autor: string
    tempo: string
  }>
  informacoesAdicionais?: {
    servicos?: string[]
    acessibilidade?: string[]
    formasPagamento?: string[]
  }
}

function TelaLocalizacao() {
  // ===============================
  // ESTADOS
  // ===============================
  const [searchText, setSearchText] = useState<string>("")
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: -23.5505, lng: -46.6333 }) // São Paulo padrão
  const [zoom, setZoom] = useState<number>(13)
  const [loading, setLoading] = useState<boolean>(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>("")
  const [feedbackType, setFeedbackType] = useState<"success" | "warning" | "error" | "">("")
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([])
  const [estabelecimentoSelecionado, setEstabelecimentoSelecionado] = useState<Estabelecimento | null>(null)
  const [modalAberto, setModalAberto] = useState<boolean>(false)
  const [animatingCardId, setAnimatingCardId] = useState<string | null>(null)
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('')
  const [showCategoriaDropdown, setShowCategoriaDropdown] = useState<boolean>(false)
  
  // Refs
  const mapRef = useRef<GoogleMapRef>(null)

  // Lista de categorias para filtro
  const categorias = [
    { id: '', nome: 'Todos os tipos' },
    { id: 'supermercado', nome: '🏪 Supermercados' },
    { id: 'farmacia', nome: '💊 Farmácias' },
    { id: 'restaurante', nome: '🍽️ Restaurantes' },
    { id: 'academia', nome: '💪 Academias' },
    { id: 'loja', nome: '👕 Lojas' },
    { id: 'posto', nome: '⛽ Postos' },
    { id: 'banco', nome: '🏦 Bancos' },
    { id: 'hospital', nome: '🏥 Hospitais' },
    { id: 'padaria', nome: '🥖 Padarias' }
  ]

  // ===============================
  // UTILITÁRIOS
  // ===============================

  // Verificar se é CEP válido
  const isCEP = (text: string): boolean => {
    const cleanText = text.replace(/\D/g, '')
    return cleanText.length === 8 && /^\d{8}$/.test(cleanText)
  }

  // Calcular distância entre dois pontos (em km)
  const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
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

  // Obter logo/imagem do estabelecimento
  const obterImagemEstabelecimento = (nome: string): string => {
    const logosConhecidas: { [key: string]: string } = {
      'assai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Assai_Atacadista_logo.svg/800px-Assai_Atacadista_logo.svg.png',
      'pão de açucar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/P%C3%A3o_de_A%C3%A7%C3%BAcar_logo.svg/800px-P%C3%A3o_de_A%C3%A7%C3%BAcar_logo.svg.png',
      'carrefour': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Carrefour_logo.svg/800px-Carrefour_logo.svg.png'
    }
    
    const nomeNormalizado = nome.toLowerCase()
    for (const [marca, logo] of Object.entries(logosConhecidas)) {
      if (nomeNormalizado.includes(marca)) {
        return logo
      }
    }
    
    return 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=300&fit=crop'
  }

  // ===============================
  // BUSCA DE ESTABELECIMENTOS
  // ===============================

  // Busca por categoria específica
  const buscarPorCategoriaEspecifica = async (categoria: string): Promise<void> => {
    try {
      console.log("🔍 Buscando por categoria:", categoria)
      
      if (!mapRef.current) {
        console.warn("⚠️ Referência do mapa não disponível")
        return
      }

      const estabelecimentosEncontrados = await buscarPorCategoria(mapRef.current.getMap(), categoria, mapCenter)
      
      // Processar resultados (mesmo código da busca geral)
      processarEstabelecimentos(estabelecimentosEncontrados, mapCenter)
      
    } catch (error) {
      console.error("❌ Erro ao buscar por categoria:", error)
      setFeedbackMessage("❌ Erro ao buscar estabelecimentos por categoria.")
      setFeedbackType("error")
      setEstabelecimentos([])
    }
  }

  // Busca por nome específico
  const buscarPorNomeEspecifico = async (nome: string): Promise<void> => {
    try {
      console.log("🔍 Buscando por nome:", nome)
      
      if (!mapRef.current) {
        console.warn("⚠️ Referência do mapa não disponível")
        return
      }

      const estabelecimentosEncontrados = await buscarEstabelecimentosPorNome(mapRef.current.getMap(), nome, mapCenter)
      
      // Processar resultados (mesmo código da busca geral)
      processarEstabelecimentos(estabelecimentosEncontrados, mapCenter)
      
    } catch (error) {
      console.error("❌ Erro ao buscar por nome:", error)
      setFeedbackMessage("❌ Erro ao buscar estabelecimentos por nome.")
      setFeedbackType("error")
      setEstabelecimentos([])
    }
  }

  // Função para processar estabelecimentos encontrados
  const processarEstabelecimentos = (estabelecimentosEncontrados: any[], coordinates: Coordinates): void => {
    // Converter resultados do Google Places para nossa interface
    const estabelecimentosProcessados: Estabelecimento[] = estabelecimentosEncontrados
      .slice(0, 10) // Limitar a 10 resultados
      .map((place: any, index: number) => {
        const placeCoords: Coordinates = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
        
        const distancia = calcularDistancia(
          coordinates.lat, 
          coordinates.lng, 
          placeCoords.lat, 
          placeCoords.lng
        )

        // Obter MÚLTIPLAS fotos do estabelecimento via Places API
        let imagemEstabelecimento = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=300&fit=crop'
        let fotosEstabelecimento: string[] = []
        
        if (place.photos && place.photos.length > 0) {
          try {
            // Usar primeira foto como principal
            imagemEstabelecimento = place.photos[0].getUrl({
              maxWidth: 400,
              maxHeight: 300
            })
            
            // Coletar até 5 fotos para galeria
            fotosEstabelecimento = place.photos
              .slice(0, 5)
              .map((photo: any) => {
                return photo.getUrl({
                  maxWidth: 400,
                  maxHeight: 300
                })
              })
          } catch (error) {
            // Usar fallback em caso de erro
            imagemEstabelecimento = obterImagemEstabelecimento(place.name || '')
            fotosEstabelecimento = [imagemEstabelecimento]
          }
        } else {
          // Fallback para logos conhecidas
          imagemEstabelecimento = obterImagemEstabelecimento(place.name || '')
          fotosEstabelecimento = [imagemEstabelecimento]
        }

        // Processar horários de funcionamento
        const horarios = place.opening_hours?.weekday_text || []
        
        // Determinar se está aberto agora
        const abreAgora = place.opening_hours?.open_now ?? null

        // Processar nível de preços com texto descritivo
        const getPriceLevelText = (level?: number): string => {
          switch (level) {
            case 0: return 'Gratuito'
            case 1: return 'Econômico'
            case 2: return 'Moderado'  
            case 3: return 'Caro'
            case 4: return 'Muito Caro'
            default: return 'Não informado'
          }
        }

        // Processar avaliações dos usuários (primeiras 3)
        const avaliacoesUsuarios = place.reviews?.slice(0, 3).map((review: any) => ({
          rating: review.rating,
          texto: review.text,
          autor: review.author_name,
          tempo: review.relative_time_description
        })) || []

        return {
          id: place.place_id || `place_${index}`,
          nome: place.name || `Estabelecimento ${index + 1}`,
          tipo: place.types?.[0] || 'store',
          coordinates: placeCoords,
          distancia: parseFloat(distancia.toFixed(2)),
          rating: place.rating || obterRatingAleatorio(),
          comentario: avaliacoesUsuarios.length > 0 ? avaliacoesUsuarios[0].texto : obterComentarioAleatorio(),
          endereco: place.vicinity || place.formatted_address || "Endereço não disponível",
          imagem: imagemEstabelecimento,
          // Informações reais da Places API
          priceLevel: place.price_level,
          priceLevelText: getPriceLevelText(place.price_level),
          abreAgora: abreAgora,
          horarios: horarios,
          telefone: place.formatted_phone_number,
          website: place.website,
          totalAvaliacoes: place.user_ratings_total,
          // Informações detalhadas
          fotos: fotosEstabelecimento,
          avaliacoes: avaliacoesUsuarios
        }
      })
      .sort((a, b) => a.distancia - b.distancia)

    console.log(`📊 Total de estabelecimentos encontrados: ${estabelecimentosProcessados.length}`)
    setEstabelecimentos(estabelecimentosProcessados)

    if (estabelecimentosProcessados.length > 0) {
      setFeedbackMessage(`✅ ${estabelecimentosProcessados.length} estabelecimento(s) encontrado(s)!`)
      setFeedbackType("success")
    } else {
      setFeedbackMessage("⚠️ Nenhum estabelecimento encontrado.")
      setFeedbackType("warning")
    }
  }

  const buscarEstabelecimentosProximos = async (coordinates: Coordinates): Promise<void> => {
    try {
      console.log("🔍 Buscando estabelecimentos próximos de:", coordinates)
      
      if (!mapRef.current) {
        console.warn("⚠️ Referência do mapa não disponível")
        return
      }

      const estabelecimentosEncontrados = await mapRef.current.buscarEstabelecimentos(coordinates, 5000)
      
      // Usar função centralizada para processar resultados
      processarEstabelecimentos(estabelecimentosEncontrados, coordinates)

    } catch (error) {
      console.error("❌ Erro ao buscar estabelecimentos:", error)
      setFeedbackMessage("❌ Erro ao buscar estabelecimentos. Tente novamente.")
      setFeedbackType("error")
      setEstabelecimentos([])
    }
  }

  // ===============================
  // BUSCA POR CEP
  // ===============================
  const buscarPorCEP = async (cep: string): Promise<void> => {
    try {
      console.log("🔍 Buscando CEP:", cep)
      
      const resultado = await buscarCoordenadasPorCEP(cep)
      
      console.log("✅ Coordenadas encontradas:", resultado)
      
      setMapCenter(resultado.coordinates)
      setZoom(15)
      setSearchText(resultado.formattedAddress)
      setFeedbackMessage("✅ CEP encontrado com sucesso!")
      setFeedbackType("success")

      // Buscar estabelecimentos próximos
      await buscarEstabelecimentosProximos(resultado.coordinates)
      
    } catch (error) {
      console.error("❌ Erro na busca por CEP:", error)
      setFeedbackMessage(`❌ ${error instanceof Error ? error.message : 'Erro ao buscar CEP'}`)
      setFeedbackType("error")
    }
  }

  // ===============================
  // BUSCA POR ENDEREÇO
  // ===============================
  const buscarPorEndereco = async (endereco: string): Promise<void> => {
    try {
      console.log("🔍 Buscando endereço:", endereco)
      
      const resultado = await buscarCoordenadasPorEndereco(endereco)
      
      console.log("✅ Coordenadas encontradas:", resultado)
      
      setMapCenter(resultado.coordinates)
      setZoom(15)
      setSearchText(resultado.formattedAddress)
      setFeedbackMessage("✅ Endereço encontrado com sucesso!")
      setFeedbackType("success")

      // Buscar estabelecimentos próximos
      await buscarEstabelecimentosProximos(resultado.coordinates)
      
    } catch (error) {
      console.error("❌ Erro na busca por endereço:", error)
      setFeedbackMessage(`❌ ${error instanceof Error ? error.message : 'Erro ao buscar endereço'}`)
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
    
    // Tentar buscar detalhes completos se tivermos o place_id
    if (estabelecimento.id && !estabelecimento.id.startsWith('place_')) {
      try {
        if (mapRef.current) {
          const detalhes = await buscarDetalhesEstabelecimento(mapRef.current.getMap(), estabelecimento.id)
          
          // Atualizar estabelecimento com detalhes completos
          const estabelecimentoAtualizado: Estabelecimento = {
            ...estabelecimento,
            telefone: detalhes.formatted_phone_number || estabelecimento.telefone,
            website: detalhes.website || estabelecimento.website,
            // Adicionar fotos extras se disponíveis
            fotos: detalhes.photos && detalhes.photos.length > 0 
              ? detalhes.photos.slice(0, 6).map((photo: any) => photo.getUrl({ maxWidth: 400, maxHeight: 300 }))
              : estabelecimento.fotos,
            // Adicionar avaliações se disponíveis
            avaliacoes: detalhes.reviews?.slice(0, 3).map((review: any) => ({
              rating: review.rating,
              texto: review.text,
              autor: review.author_name,
              tempo: review.relative_time_description
            })) || estabelecimento.avaliacoes
          }
          
          setEstabelecimentoSelecionado(estabelecimentoAtualizado)
        } else {
          setEstabelecimentoSelecionado(estabelecimento)
        }
      } catch (error) {
        setEstabelecimentoSelecionado(estabelecimento)
      }
    } else {
      setEstabelecimentoSelecionado(estabelecimento)
    }
    
    setTimeout(() => {
      setModalAberto(true)
      setAnimatingCardId(null)
    }, 150)
  }

  const handleCloseModal = (): void => {
    setModalAberto(false)
    setEstabelecimentoSelecionado(null)
  }

  // Obter localização atual do usuário ao carregar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords
          const currentLocation: Coordinates = { lat, lng }
          setMapCenter(currentLocation)
          buscarEstabelecimentosProximos(currentLocation)
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
                const saoPauloCenter: Coordinates = { lat: -23.5505, lng: -46.6333 }
                setMapCenter(saoPauloCenter)
                buscarEstabelecimentosProximos(saoPauloCenter)
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

      {/* Filtros de Busca Inteligente */}
      <section className="mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            🔍 Busca Inteligente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por Categoria */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📋 Categoria
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowCategoriaDropdown(!showCategoriaDropdown)}
                  className="w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-xl hover:border-[#F9A01B] focus:border-[#F9A01B] focus:ring-2 focus:ring-[#F9A01B] focus:ring-opacity-20 transition-all"
                >
                  <span className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {categorias.find(cat => cat.id === categoriaFiltro)?.nome || "Selecione uma categoria"}
                    </span>
                    <span className={`transform transition-transform ${showCategoriaDropdown ? 'rotate-180' : ''}`}>
                      ⌄
                    </span>
                  </span>
                </button>
                
                {showCategoriaDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {categorias.map((categoria) => (
                      <button
                        key={categoria.id}
                        onClick={() => {
                          setCategoriaFiltro(categoria.id)
                          setShowCategoriaDropdown(false)
                          // Buscar por categoria se uma localização estiver definida
                          if (categoria.id && mapCenter) {
                            buscarPorCategoriaEspecifica(categoria.id)
                          } else if (!categoria.id && mapCenter) {
                            // Se "Todos os tipos", buscar estabelecimentos normais
                            buscarEstabelecimentosProximos(mapCenter)
                          }
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                          categoriaFiltro === categoria.id ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                        }`}
                      >
                        {categoria.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Busca por Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏪 Nome do Estabelecimento
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: Carrefour, Assaí..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-[#F9A01B] focus:border-[#F9A01B] focus:ring-2 focus:ring-[#F9A01B] focus:ring-opacity-20 transition-all"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement
                      if (target.value.trim() && mapCenter) {
                        buscarPorNomeEspecifico(target.value.trim())
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Raio de Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Raio de Busca
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-[#F9A01B] focus:border-[#F9A01B] focus:ring-2 focus:ring-[#F9A01B] focus:ring-opacity-20 transition-all"
                defaultValue="5000"
                onChange={(e) => {
                  // Pode implementar mudança de raio
                  console.log('Raio selecionado:', e.target.value)
                }}
              >
                <option value="1000">📍 1 km</option>
                <option value="2000">📍 2 km</option>
                <option value="5000">📍 5 km</option>
                <option value="10000">📍 10 km</option>
                <option value="20000">📍 20 km</option>
              </select>
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setCategoriaFiltro('')
                setShowCategoriaDropdown(false)
                // Limpar campos de input
                const inputs = document.querySelectorAll('input[type="text"]')
                inputs.forEach(input => {
                  if (input !== document.querySelector('input[placeholder*="endereço"]')) {
                    (input as HTMLInputElement).value = ''
                  }
                })
                // Buscar estabelecimentos normais
                if (mapCenter) {
                  buscarEstabelecimentosProximos(mapCenter)
                }
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all text-sm font-medium"
            >
              🗑️ Limpar Filtros
            </button>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_RGBA(0,0,0,0.06)] overflow-hidden">
        <div className="w-full h-[400px]">
          <GoogleMapWrapper
            ref={mapRef}
            center={mapCenter}
            zoom={zoom}
            showEstabelecimentos={false} // Vamos controlar manualmente
            className="w-full h-full rounded-3xl"
          />
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
                    {/* Foto Real do Estabelecimento */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                        <img 
                          src={estabelecimento.imagem} 
                          alt={estabelecimento.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback para ícone se a imagem não carregar
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement!;
                            parent.className = "w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] flex items-center justify-center shadow-lg";
                            parent.innerHTML = '<div class="w-8 h-8 text-white"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/></svg></div>';
                          }}
                        />
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
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm text-gray-600 font-medium">
                          {estabelecimento.tipo === 'grocery_or_supermarket' ? '🏪 Supermercado' :
                           estabelecimento.tipo === 'store' ? '🏪 Loja' : 
                           estabelecimento.tipo === 'convenience_store' ? '🏪 Conveniência' : '🏪 ' + estabelecimento.tipo}
                        </span>
                        
                        {/* Status de Abertura */}
                        {estabelecimento.abreAgora !== null && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              estabelecimento.abreAgora 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {estabelecimento.abreAgora ? '🟢 Aberto' : '🔴 Fechado'}
                            </span>
                          </>
                        )}
                        
                        <span className="text-xs text-gray-400">•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-gray-800">
                            {estabelecimento.rating}
                          </span>
                          {estabelecimento.totalAvaliacoes && (
                            <span className="text-xs text-gray-500">
                              ({estabelecimento.totalAvaliacoes})
                            </span>
                          )}
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

      {/* Modal de Detalhes */}
      {modalAberto && estabelecimentoSelecionado && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center p-3">
          {/* Modal */}
          <div
            className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto pointer-events-auto"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* Botão Fechar */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-md transition-all hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Header moderno com foto */}
            <div className="relative">
              {/* Imagem principal */}
              <div className="h-52 rounded-t-3xl overflow-hidden relative">
                <img 
                  src={estabelecimentoSelecionado.imagem}
                  alt={estabelecimentoSelecionado.nome}
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement!;
                    parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  }}
                />
                {/* Overlay gradiente sofisticado */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20"></div>
                
                {/* Badge de status */}
                {estabelecimentoSelecionado.abreAgora !== null && (
                  <div className="absolute top-4 left-4">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border ${
                      estabelecimentoSelecionado.abreAgora 
                        ? 'bg-green-500/90 text-white border-green-300/50' 
                        : 'bg-red-500/90 text-white border-red-300/50'
                    }`}>
                      {estabelecimentoSelecionado.abreAgora ? '🟢 ABERTO' : '🔴 FECHADO'}
                    </div>
                  </div>
                )}

                {/* Rating badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-800">{estabelecimentoSelecionado.rating}</span>
                  </div>
                </div>
                
                {/* Conteúdo principal */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end gap-4">
                    <div className="w-18 h-18 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-10 h-10 text-white drop-shadow-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-3xl font-bold text-white mb-2 pr-8 leading-tight drop-shadow-xl">
                        {estabelecimentoSelecionado.nome}
                      </h1>
                      <div className="flex items-center gap-2">
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <p className="text-white text-sm font-medium">
                            {estabelecimentoSelecionado.tipo === 'grocery_or_supermarket' ? '🏪 Supermercado' :
                             estabelecimentoSelecionado.tipo === 'store' ? '🏪 Loja' : 
                             estabelecimentoSelecionado.tipo === 'convenience_store' ? '🏪 Conveniência' : '🏪 ' + estabelecimentoSelecionado.tipo}
                          </p>
                        </div>
                        <div className="bg-orange-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
                          <p className="text-white text-sm font-bold">
                            {estabelecimentoSelecionado.distancia} km
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo moderno */}
            <div className="px-7 pt-7 pb-7 space-y-7">
              {/* Cards de informações principais */}
              <div className="grid grid-cols-2 gap-4">
                {/* Card de Preço */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">💰</span>
                    </div>
                    <span className="text-green-700 text-xs font-semibold px-2 py-1 bg-green-100 rounded-full">
                      PREÇO
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {estabelecimentoSelecionado.priceLevel !== undefined ? 
                      '💰'.repeat(estabelecimentoSelecionado.priceLevel + 1) : 'N/A'}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {estabelecimentoSelecionado.priceLevelText || 'Não informado'}
                  </p>
                </div>

                {/* Card de Avaliações */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 fill-white text-white" />
                    </div>
                    <span className="text-yellow-700 text-xs font-semibold px-2 py-1 bg-yellow-100 rounded-full">
                      RATING
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-yellow-700">{estabelecimentoSelecionado.rating}</span>
                    <span className="text-yellow-600 text-sm">/5</span>
                  </div>
                  {estabelecimentoSelecionado.totalAvaliacoes && (
                    <p className="text-xs text-yellow-600 font-medium">
                      {estabelecimentoSelecionado.totalAvaliacoes} avaliações
                    </p>
                  )}
                </div>
              </div>

              {/* Informações detalhadas */}
              <div className="space-y-4">
                {/* Card de Endereço */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-800 mb-1">Localização</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {estabelecimentoSelecionado.endereco}
                      </p>
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        📍 {estabelecimentoSelecionado.coordinates.lat.toFixed(4)}, {estabelecimentoSelecionado.coordinates.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card de Horários */}
                {estabelecimentoSelecionado.horarios && estabelecimentoSelecionado.horarios.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">🕒</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Horários de Funcionamento</h3>
                        <div className="grid grid-cols-1 gap-1.5">
                          {estabelecimentoSelecionado.horarios.slice(0, 4).map((horario, index) => (
                            <div key={index} className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-1.5">
                              <span className="text-xs font-medium text-purple-700">
                                {horario.split(':')[0]}:
                              </span>
                              <span className="text-xs text-purple-600">
                                {horario.split(': ')[1]}
                              </span>
                            </div>
                          ))}
                        </div>
                        {estabelecimentoSelecionado.horarios.length > 4 && (
                          <p className="text-xs text-purple-600 text-center mt-2">
                            +{estabelecimentoSelecionado.horarios.length - 4} mais dias
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Galeria de Fotos Moderna */}
                {estabelecimentoSelecionado.fotos && estabelecimentoSelecionado.fotos.length > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">📷</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-800">Galeria de Fotos</h3>
                        <p className="text-xs text-orange-600">
                          {estabelecimentoSelecionado.fotos.length} foto(s) • Clique para ampliar
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {estabelecimentoSelecionado.fotos.slice(0, 4).map((foto, index) => (
                        <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-white/60 border border-orange-200/30">
                          <img 
                            src={foto} 
                            alt={`${estabelecimentoSelecionado.nome} - Foto ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-110 transition-all duration-300 cursor-pointer"
                            onClick={() => window.open(foto, '_blank')}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
                          <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                            <span className="text-xs">🔍</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* Avaliações dos Clientes - Modernas */}
                {estabelecimentoSelecionado.avaliacoes && estabelecimentoSelecionado.avaliacoes.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 fill-white text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-800">Avaliações dos Clientes</h3>
                        <p className="text-xs text-indigo-600">
                          {estabelecimentoSelecionado.avaliacoes.length} review(s) verificada(s)
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {estabelecimentoSelecionado.avaliacoes.map((avaliacao, index) => (
                        <div key={index} className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-indigo-100/50">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {avaliacao.autor.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-gray-800">{avaliacao.autor}</span>
                                <span className="text-xs text-gray-500">{avaliacao.tempo}</span>
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < avaliacao.rating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="text-xs font-bold text-indigo-600 ml-1">
                                  {avaliacao.rating}/5
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed italic">
                                "{avaliacao.texto}"
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card de Contato */}
                {(estabelecimentoSelecionado.telefone || estabelecimentoSelecionado.website) && (
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200/50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">📞</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-800">Entre em Contato</h3>
                        <p className="text-xs text-teal-600">Informações de contato disponíveis</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {estabelecimentoSelecionado.telefone && (
                        <a 
                          href={`tel:${estabelecimentoSelecionado.telefone}`}
                          className="flex items-center gap-3 bg-white/60 rounded-lg p-3 hover:bg-white/80 transition-colors duration-200"
                        >
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs">📱</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700">Telefone</span>
                            <p className="text-xs text-teal-600">{estabelecimentoSelecionado.telefone}</p>
                          </div>
                        </a>
                      )}
                      {estabelecimentoSelecionado.website && (
                        <a 
                          href={estabelecimentoSelecionado.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 bg-white/60 rounded-lg p-3 hover:bg-white/80 transition-colors duration-200"
                        >
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs">🌐</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700">Website</span>
                            <p className="text-xs text-teal-600 truncate">Visitar site oficial</p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Ações finais */}
              <div className="pt-6 mt-6 border-t border-gray-200/50">
                <div className="space-y-3">
                  {/* Botão principal - Rota */}
                  <button
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${estabelecimentoSelecionado.coordinates.lat},${estabelecimentoSelecionado.coordinates.lng}`,
                        '_blank'
                      )
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 group"
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <span className="text-lg">Como Chegar</span>
                    <div className="w-2 h-2 bg-white/40 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  </button>
                  
                  {/* Botão secundário - Ver no Maps */}
                  <button
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps/place/${estabelecimentoSelecionado.coordinates.lat},${estabelecimentoSelecionado.coordinates.lng}/@${estabelecimentoSelecionado.coordinates.lat},${estabelecimentoSelecionado.coordinates.lng},17z`,
                        '_blank'
                      )
                    }}
                    className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Ver no Google Maps</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

export default TelaLocalizacao
