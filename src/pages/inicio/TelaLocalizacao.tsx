// ===============================
// TELA LOCALIZAÇÃO - GOOGLE MAPS
// Versão atualizada usando Google Maps API
// ===============================

import { useState, useEffect, useRef } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import { Input as CampoTexto } from "../../components/ui/input"
import lupaPesquisa from "../../assets/lupa de pesquisa .png"
import SidebarLayout from "../../components/layouts/SidebarLayout"
import { MapPin, Star, ShoppingCart, X, Navigation, Store } from "lucide-react"
import { GoogleMapWrapper, type GoogleMapRef } from "../../components/GoogleMap"
import {
  buscarCoordenadasPorCEP,
  buscarCoordenadasPorEndereco,
  buscarEstabelecimentosPorNome,
  buscarPorCategoria,
  buscarDetalhesEstabelecimento,
  type Coordinates
} from "../../services/googleMapsService"
import api from "../../lib/api"
import { listarProdutos, formatarPreco, isProdutoEmPromocao } from "../../services/apiServicesFixed"

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
  // Estados para estabelecimentos cadastrados no InfoHub
  const [estabelecimentosCadastrados, setEstabelecimentosCadastrados] = useState<Estabelecimento[]>([])
  const [produtosEstabelecimento, setProdutosEstabelecimento] = useState<any[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState<boolean>(false)
  
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
  // BUSCA DE PRODUTOS DO ESTABELECIMENTO
  // ===============================
  
  const buscarProdutosDoEstabelecimento = async (estabelecimentoId: number, estabelecimento: Estabelecimento): Promise<void> => {
    try {
      console.log(`📦 Buscando produtos do estabelecimento ${estabelecimentoId}...`)
      setLoadingProdutos(true)
      
      const response = await listarProdutos({ estabelecimento: estabelecimentoId })
      
      if (response.status && response.data) {
        // DEBUG: Mostra todos os produtos recebidos
        console.log(`📦 Produtos recebidos da API:`, response.data.map((p: any) => ({
          id: p.id_produto,
          nome: p.nome,
          id_estabelecimento: p.id_estabelecimento,
          tipo: typeof p.id_estabelecimento
        })))
        
        // FILTRO ADICIONAL: Garante que só mostra produtos do estabelecimento correto
        // Converte para número para garantir comparação correta
        const idEstab = Number(estabelecimentoId)
        const produtosFiltrados = response.data.filter((p: any) => {
          const produtoEstabId = Number(p.id_estabelecimento || p.estabelecimento_id || p.estabelecimento)
          const match = produtoEstabId === idEstab
          console.log(`   Produto ${p.nome}: id_estab=${produtoEstabId} === ${idEstab} ? ${match}`)
          return match
        })
        
        console.log(`✅ ${response.data.length} produtos retornados, ${produtosFiltrados.length} do estabelecimento ${estabelecimentoId}`)
        setProdutosEstabelecimento(produtosFiltrados)
      } else {
        console.log('ℹ️ Nenhum produto encontrado')
        setProdutosEstabelecimento([])
      }
      
      // Abre o modal com o estabelecimento
      setEstabelecimentoSelecionado(estabelecimento)
      setModalAberto(true)
      
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error)
      setProdutosEstabelecimento([])
      setEstabelecimentoSelecionado(estabelecimento)
      setModalAberto(true)
    } finally {
      setLoadingProdutos(false)
    }
  }

  // ===============================
  // BUSCA DE ESTABELECIMENTOS CADASTRADOS NO INFOHUB
  // ===============================
  
  const buscarEstabelecimentosCadastrados = async (lat: number, lng: number): Promise<void> => {
    try {
      console.log("🏢 Buscando estabelecimentos cadastrados no InfoHub...")
      console.log("🗺️ Coordenadas de busca:", lat, lng)
      
      // Primeiro, verifica se tem dados do próprio estabelecimento no localStorage
      const meuEstabelecimentoId = localStorage.getItem('estabelecimentoId')
      const enderecoStorage = localStorage.getItem('estabelecimentoEnderecoCompleto')
      let coordenadasLocalStorage: { lat: number, lng: number } | null = null
      
      if (enderecoStorage) {
        try {
          const enderecoObj = JSON.parse(enderecoStorage)
          console.log("📍 Endereço do localStorage:", enderecoObj)
          if (enderecoObj.latitude && enderecoObj.longitude) {
            coordenadasLocalStorage = {
              lat: parseFloat(enderecoObj.latitude),
              lng: parseFloat(enderecoObj.longitude)
            }
            console.log("✅ Coordenadas encontradas no localStorage:", coordenadasLocalStorage)
          }
        } catch (e) {
          console.log("⚠️ Erro ao parsear endereço do localStorage")
        }
      }
      
      // Busca todos os estabelecimentos do backend COM endereço e coordenadas
      let data: any = null
      try {
        // Usa o novo endpoint que retorna estabelecimentos COM coordenadas
        const response = await api.get<any>("/estabelecimentos/todos")
        data = response.data
        console.log("📦 Resposta da API /estabelecimentos/todos:", data)
      } catch (apiError: any) {
        console.log("⚠️ Erro ao buscar /estabelecimentos/todos:", apiError.message)
        // Tenta endpoint alternativo
        try {
          const response2 = await api.get<any>("/estabelecimentos")
          data = response2.data
          console.log("📦 Resposta da API /estabelecimentos (fallback):", data)
        } catch (e) {
          console.log("❌ Também falhou /estabelecimentos")
        }
      }
      
      // Normalizar resposta - pode vir como 'data' ou 'estabelecimentos'
      const listaEstabelecimentos = data?.data || data?.estabelecimentos || []
      
      if (listaEstabelecimentos.length > 0) {
        console.log(`✅ ${listaEstabelecimentos.length} estabelecimentos cadastrados encontrados`)
        
        const estabelecimentosProcessados: Estabelecimento[] = []
        
        for (const estab of listaEstabelecimentos) {
          console.log(`🔍 Processando estabelecimento: ${estab.nome}`, estab)
          
          const estabId = String(estab.id_estabelecimento || estab.id)
          
          // O novo endpoint /estabelecimentos/todos já retorna as coordenadas diretamente
          // IMPORTANTE: Converter para número pois pode vir como string do backend
          let estabLat: number | null = estab.latitude ? parseFloat(estab.latitude) : (estab.endereco?.latitude ? parseFloat(estab.endereco.latitude) : null)
          let estabLng: number | null = estab.longitude ? parseFloat(estab.longitude) : (estab.endereco?.longitude ? parseFloat(estab.endereco.longitude) : null)
          
          console.log(`📍 Coordenadas do backend para ${estab.nome}: lat=${estabLat}, lng=${estabLng}`)
          
          // Se não tem coordenadas e é o estabelecimento do usuário atual, usa do localStorage
          if ((!estabLat || !estabLng || isNaN(estabLat) || isNaN(estabLng)) && meuEstabelecimentoId === estabId && coordenadasLocalStorage) {
            console.log(`📍 Usando coordenadas do localStorage para ${estab.nome}`)
            estabLat = coordenadasLocalStorage.lat
            estabLng = coordenadasLocalStorage.lng
          }
          
          // Se ainda não tem coordenadas válidas, pula este estabelecimento
          if (!estabLat || !estabLng || isNaN(estabLat) || isNaN(estabLng)) {
            console.log(`⚠️ Estabelecimento ${estab.nome} sem coordenadas válidas, ignorando...`)
            continue
          }
          
          console.log(`✅ Coordenadas válidas para ${estab.nome}: ${estabLat}, ${estabLng}`)
          
          const distancia = calcularDistancia(lat, lng, estabLat, estabLng)
          
          // Só mostra estabelecimentos em até 50km do endereço buscado
          if (distancia > 50) {
            console.log(`📏 Estabelecimento ${estab.nome} está a ${distancia.toFixed(2)}km - fora do raio de 50km`)
            continue
          }
          
          // Construir endereço completo (o novo endpoint retorna os campos diretamente)
          const enderecoCompleto = estab.logradouro 
            ? `${estab.logradouro}, ${estab.numero || ''} - ${estab.bairro || ''}, ${estab.cidade || ''}`
            : 'Endereço cadastrado'
          
          console.log(`✅ ESTABELECIMENTO INFOHUB ENCONTRADO NO RAIO:`)
          console.log(`   📍 Nome: ${estab.nome}`)
          console.log(`   🗺️ Endereço: ${enderecoCompleto}`)
          console.log(`   📌 Coordenadas: ${estabLat}, ${estabLng}`)
          console.log(`   📏 Distância: ${distancia.toFixed(2)}km`)
          
          estabelecimentosProcessados.push({
            id: `cadastrado-${estab.id_estabelecimento || estab.id}`,
            nome: estab.nome,
            tipo: 'parceiro',
            coordinates: { lat: Number(estabLat), lng: Number(estabLng) },
            distancia: parseFloat(distancia.toFixed(2)),
            rating: 5.0, // Estabelecimentos cadastrados têm nota máxima
            comentario: 'Estabelecimento parceiro InfoHub',
            endereco: enderecoCompleto,
            imagem: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=300&fit=crop',
            isCadastrado: true
          } as any)
        }
        
        // Ordena por distância
        estabelecimentosProcessados.sort((a, b) => a.distancia - b.distancia)
        
        console.log(`📍 ${estabelecimentosProcessados.length} estabelecimentos cadastrados com coordenadas`)
        console.log(`📍 Lista de estabelecimentos processados:`, estabelecimentosProcessados.map(e => ({ nome: e.nome, coords: e.coordinates })))
        setEstabelecimentosCadastrados(estabelecimentosProcessados)
        
        // Adicionar marcadores LARANJAS no mapa para os estabelecimentos do InfoHub
        if (mapRef.current && estabelecimentosProcessados.length > 0) {
          console.log(`🗺️ Adicionando ${estabelecimentosProcessados.length} marcadores LARANJAS ao mapa`)
          estabelecimentosProcessados.forEach((estab, index) => {
            console.log(`🟠 [${index + 1}/${estabelecimentosProcessados.length}] Adicionando marcador LARANJA para: ${estab.nome} em ${estab.coordinates.lat}, ${estab.coordinates.lng}`)
            
            // Extrair o ID do estabelecimento (remove o prefixo "cadastrado-")
            const estabId = estab.id.replace('cadastrado-', '')
            
            mapRef.current?.addMarker(estab.coordinates, { 
              title: `� ${estab.nome} (Parceiro InfoHub)`,
              color: 'orange',
              onClick: () => {
                // Quando clicar no marcador, abre o modal com os produtos
                buscarProdutosDoEstabelecimento(parseInt(estabId), estab)
              }
            })
          })
        }
      } else {
        console.log("ℹ️ Nenhum estabelecimento cadastrado encontrado na API")
        console.log("📦 Dados recebidos:", data)
        setEstabelecimentosCadastrados([])
      }
    } catch (error: any) {
      console.log("⚠️ Erro ao buscar estabelecimentos cadastrados:", error?.message || error)
      console.log("⚠️ Detalhes do erro:", error?.response?.data || error)
      setEstabelecimentosCadastrados([])
    }
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
        
        // Determinar se está aberto agora (usando isOpen() se disponível)
        // NOTA: open_now foi depreciado em Nov 2019, usar isOpen() do getDetails()
        let abreAgora: boolean | undefined = undefined
        if (place.opening_hours?.isOpen && typeof place.opening_hours.isOpen === 'function') {
          try {
            abreAgora = place.opening_hours.isOpen()
          } catch {
            abreAgora = undefined
          }
        }

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

    // Adicionar marcadores VERDES no mapa para estabelecimentos da região
    if (mapRef.current && estabelecimentosProcessados.length > 0) {
      estabelecimentosProcessados.forEach((estab) => {
        console.log(`🟢 Adicionando marcador VERDE para: ${estab.nome}`)
        mapRef.current?.addMarker(estab.coordinates, { 
          title: `🟢 ${estab.nome}`,
          color: 'green',
          onClick: () => {
            setEstabelecimentoSelecionado(estab)
            setProdutosEstabelecimento([]) // Região não tem produtos
            setModalAberto(true)
          }
        })
      })
    }

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
      
      // Limpar marcadores e listas anteriores antes de nova busca
      if (mapRef.current) {
        mapRef.current.clearMarkers()
      }
      setEstabelecimentos([])
      setEstabelecimentosCadastrados([])
      
      if (!mapRef.current) {
        console.warn("⚠️ Referência do mapa não disponível")
        return
      }

      // Buscar estabelecimentos cadastrados no InfoHub PRIMEIRO (com await)
      await buscarEstabelecimentosCadastrados(coordinates.lat, coordinates.lng)
      
      // Depois buscar estabelecimentos do Google Places
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
    
    // VERIFICAR SE É ESTABELECIMENTO CADASTRADO NO INFOHUB
    const isCadastrado = estabelecimento.id.startsWith('cadastrado-') || (estabelecimento as any).isCadastrado
    
    if (isCadastrado) {
      // Para estabelecimentos cadastrados, buscar os produtos
      const estabId = estabelecimento.id.replace('cadastrado-', '')
      console.log(`🟠 Clicou em estabelecimento InfoHub: ${estabelecimento.nome} (ID: ${estabId})`)
      
      setLoadingProdutos(true)
      try {
        const idEstab = parseInt(estabId)
        const response = await listarProdutos({ estabelecimento: idEstab })
        if (response.status && response.data) {
          // FILTRO: Garante que só mostra produtos do estabelecimento correto
          // O produto mapeado pode ter id_estabelecimento OU estabelecimento.id
          const produtosFiltrados = response.data.filter((p: any) => {
            const produtoEstabId = Number(
              p.id_estabelecimento || 
              p.estabelecimento_id || 
              p.estabelecimento?.id ||
              (typeof p.estabelecimento === 'number' ? p.estabelecimento : 0)
            )
            console.log(`   Produto ${p.nome}: estab_id=${produtoEstabId} === ${idEstab} ? ${produtoEstabId === idEstab}`)
            return produtoEstabId === idEstab
          })
          console.log(`✅ ${response.data.length} produtos retornados, ${produtosFiltrados.length} do estabelecimento ${idEstab}`)
          setProdutosEstabelecimento(produtosFiltrados)
        } else {
          setProdutosEstabelecimento([])
        }
      } catch (error) {
        console.error('❌ Erro ao buscar produtos:', error)
        setProdutosEstabelecimento([])
      } finally {
        setLoadingProdutos(false)
      }
      
      setEstabelecimentoSelecionado(estabelecimento)
    } else {
      // Para estabelecimentos do Google Maps, buscar detalhes via Places API
      console.log(`🟢 Clicou em estabelecimento da região: ${estabelecimento.nome}`)
      setProdutosEstabelecimento([]) // Região não tem produtos
      
      try {
        if (mapRef.current && estabelecimento.id) {
          const detalhes = await buscarDetalhesEstabelecimento(mapRef.current.getMap(), estabelecimento.id)
          
          // Atualizar estabelecimento com detalhes completos
          const estabelecimentoAtualizado: Estabelecimento = {
            ...estabelecimento,
            telefone: detalhes.formatted_phone_number || estabelecimento.telefone,
            website: detalhes.website || estabelecimento.website,
            fotos: detalhes.photos && detalhes.photos.length > 0 
              ? detalhes.photos.slice(0, 6).map((photo: any) => photo.getUrl({ maxWidth: 400, maxHeight: 300 }))
              : estabelecimento.fotos,
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
    }
    
    setTimeout(() => {
      setModalAberto(true)
      setAnimatingCardId(null)
    }, 150)
  }

  const handleCloseModal = (): void => {
    setModalAberto(false)
    setEstabelecimentoSelecionado(null)
    setProdutosEstabelecimento([]) // Limpar produtos ao fechar
  }

  // Obter localização atual do usuário ao carregar (apenas centralizar mapa, NÃO buscar estabelecimentos)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords
          const currentLocation: Coordinates = { lat, lng }
          setMapCenter(currentLocation)
          // NÃO buscar estabelecimentos automaticamente - só quando o usuário fizer busca
          console.log('📍 Localização atual obtida, mapa centralizado. Aguardando busca do usuário...')
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

      {/* Lista de Estabelecimentos CADASTRADOS no InfoHub (Parceiros) */}
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
              <p className="text-orange-100 text-sm mt-1">Estabelecimentos verificados com produtos cadastrados</p>
            </div>

            {/* Lista de Parceiros */}
            <div className="divide-y divide-orange-100">
              {estabelecimentosCadastrados.map((estabelecimento, index) => (
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

      {/* Lista de Estabelecimentos do Google Maps */}
      {estabelecimentos.length > 0 && (
        <section className="mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
            {/* Header da Lista */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Estabelecimentos da Região
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {estabelecimentos.length}
                </span>
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
                        {estabelecimento.abreAgora !== undefined && (
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

      {/* Modal de Detalhes PREMIUM */}
      {modalAberto && estabelecimentoSelecionado && (
        <>
          {/* Overlay com blur */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md"
            onClick={handleCloseModal}
            style={{ animation: 'fadeIn 0.25s ease-out' }}
          />
          
          {/* Modal Grande */}
          <div className="fixed inset-4 z-[9999] flex items-center justify-center">
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {/* Header Hero com Imagem Grande */}
              <div className="relative h-56 flex-shrink-0 overflow-hidden">
                <img 
                  src={estabelecimentoSelecionado.imagem}
                  alt={estabelecimentoSelecionado.nome}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement!;
                    parent.style.background = 'linear-gradient(135deg, #F9A01B 0%, #FF8C00 50%, #E91E63 100%)';
                  }}
                />
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-transparent to-purple-600/20" />
                
                {/* Decorações */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
                
                {/* Botão Fechar Premium */}
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full p-3 transition-all hover:scale-110 border border-white/20"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                
                {/* Badges Premium */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {estabelecimentoSelecionado.abreAgora !== undefined && (
                    <div className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-xl border ${
                      estabelecimentoSelecionado.abreAgora 
                        ? 'bg-green-500/80 text-white border-green-300/30' 
                        : 'bg-red-500/80 text-white border-red-300/30'
                    }`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${estabelecimentoSelecionado.abreAgora ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`} />
                        {estabelecimentoSelecionado.abreAgora ? 'Aberto Agora' : 'Fechado'}
                      </span>
                    </div>
                  )}
                  {estabelecimentoSelecionado.rating >= 4.5 && (
                    <div className="px-3 py-2 rounded-full text-sm font-bold bg-yellow-500/80 text-white backdrop-blur-xl border border-yellow-300/30">
                      ⭐ Top Avaliado
                    </div>
                  )}
                </div>
                
                {/* Info Principal sobre Hero */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end gap-5">
                    {/* Ícone Grande */}
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center flex-shrink-0 shadow-2xl">
                      <ShoppingCart className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-3xl font-black text-white mb-2 drop-shadow-2xl leading-tight">
                        {estabelecimentoSelecionado.nome}
                      </h1>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-sm font-medium">
                          {estabelecimentoSelecionado.tipo === 'grocery_or_supermarket' ? '🏪 Supermercado' :
                           estabelecimentoSelecionado.tipo === 'store' ? '🏬 Loja' : 
                           estabelecimentoSelecionado.tipo === 'convenience_store' ? '🏪 Conveniência' : 
                           '🏢 ' + estabelecimentoSelecionado.tipo.replace(/_/g, ' ')}
                        </span>
                        <span className="bg-orange-500 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg">
                          📍 {estabelecimentoSelecionado.distancia} km
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards Premium */}
              <div className="grid grid-cols-2 gap-4 p-5 bg-gradient-to-r from-gray-50 to-orange-50/30 border-b border-gray-100">
                {/* Rating */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg">
                    <Star className="w-7 h-7 fill-white text-white" />
                  </div>
                  <p className="text-3xl font-black text-gray-800">{estabelecimentoSelecionado.rating}</p>
                  <p className="text-sm text-gray-500 font-medium">{estabelecimentoSelecionado.totalAvaliacoes || 0} avaliações</p>
                </div>
                {/* Distância */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-black text-gray-800">{estabelecimentoSelecionado.distancia} <span className="text-lg font-bold text-gray-500">km</span></p>
                  <p className="text-sm text-gray-500 font-medium">de distância</p>
                </div>
              </div>

              {/* Conteúdo Principal Scrollável */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {/* PRODUTOS DO ESTABELECIMENTO InfoHub (se for parceiro) */}
                {(estabelecimentoSelecionado as any).isCadastrado && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-5 border-2 border-orange-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#F9A01B] to-[#FF8C00] rounded-xl flex items-center justify-center shadow-lg">
                        <Store className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">Produtos Cadastrados</h3>
                        <p className="text-xs text-orange-600">
                          {loadingProdutos ? 'Carregando...' : `${produtosEstabelecimento.length} produtos disponíveis`}
                        </p>
                      </div>
                      <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-bold">
                        ⭐ Parceiro InfoHub
                      </span>
                    </div>
                    
                    {loadingProdutos ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F9A01B]"></div>
                      </div>
                    ) : produtosEstabelecimento.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {produtosEstabelecimento.map((produto) => (
                          <div 
                            key={produto.id} 
                            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-100 hover:border-orange-300 transition-colors"
                          >
                            {produto.imagem ? (
                              <img 
                                src={produto.imagem} 
                                alt={produto.nome}
                                className="w-14 h-14 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 truncate">{produto.nome}</p>
                              <p className="text-xs text-gray-500 truncate">{produto.descricao || 'Sem descrição'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {isProdutoEmPromocao(produto) ? (
                                  <>
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatarPreco(produto.preco)}
                                    </span>
                                    <span className="text-sm font-bold text-green-600">
                                      {formatarPreco(produto.promocao?.preco_promocional || produto.preco)}
                                    </span>
                                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                      PROMOÇÃO
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm font-bold text-[#F9A01B]">
                                    {formatarPreco(produto.preco)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Nenhum produto cadastrado ainda</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Endereço Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-800 mb-1">Endereço Completo</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{estabelecimentoSelecionado.endereco}</p>
                      <p className="text-xs text-blue-600 font-mono mt-2 bg-blue-100/50 inline-block px-2 py-1 rounded">
                        📍 {estabelecimentoSelecionado.coordinates.lat.toFixed(5)}, {estabelecimentoSelecionado.coordinates.lng.toFixed(5)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid de 2 Colunas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Horários */}
                  {estabelecimentoSelecionado.horarios && estabelecimentoSelecionado.horarios.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-lg">🕒</span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-800">Horários</h3>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {estabelecimentoSelecionado.horarios.map((horario, index) => (
                          <div key={index} className="flex justify-between items-center bg-white/70 rounded-lg px-3 py-2 text-xs">
                            <span className="font-medium text-purple-700">{horario.split(':')[0]}</span>
                            <span className="text-gray-600">{horario.split(': ').slice(1).join(': ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contato */}
                  {(estabelecimentoSelecionado.telefone || estabelecimentoSelecionado.website) && (
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-5 border border-teal-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-lg">📞</span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-800">Contato</h3>
                      </div>
                      <div className="space-y-3">
                        {estabelecimentoSelecionado.telefone && (
                          <a 
                            href={`tel:${estabelecimentoSelecionado.telefone}`}
                            className="flex items-center gap-3 bg-white/70 rounded-xl p-3 hover:bg-white transition-colors group"
                          >
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <span className="text-white">📱</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Telefone</p>
                              <p className="text-sm font-bold text-gray-800">{estabelecimentoSelecionado.telefone}</p>
                            </div>
                          </a>
                        )}
                        {estabelecimentoSelecionado.website && (
                          <a 
                            href={estabelecimentoSelecionado.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-white/70 rounded-xl p-3 hover:bg-white transition-colors group"
                          >
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <span className="text-white">🌐</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Website</p>
                              <p className="text-sm font-bold text-blue-600">Visitar site oficial →</p>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Galeria de Fotos Premium */}
                {estabelecimentoSelecionado.fotos && estabelecimentoSelecionado.fotos.length > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-5 border border-orange-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-lg">📷</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">Galeria de Fotos</h3>
                        <p className="text-xs text-orange-600">{estabelecimentoSelecionado.fotos.length} fotos disponíveis</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {estabelecimentoSelecionado.fotos.slice(0, 8).map((foto, index) => (
                        <div 
                          key={index} 
                          className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
                          onClick={() => window.open(foto, '_blank')}
                        >
                          <img 
                            src={foto} 
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-lg">🔍</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Avaliações Premium */}
                {estabelecimentoSelecionado.avaliacoes && estabelecimentoSelecionado.avaliacoes.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-5 border border-indigo-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Star className="w-5 h-5 fill-white text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">Avaliações de Clientes</h3>
                        <p className="text-xs text-indigo-600">{estabelecimentoSelecionado.avaliacoes.length} reviews verificados</p>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {estabelecimentoSelecionado.avaliacoes.map((avaliacao, index) => (
                        <div key={index} className="bg-white rounded-xl p-4 border border-indigo-100/50">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">
                                {avaliacao.autor.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm text-gray-800">{avaliacao.autor}</span>
                                <span className="text-xs text-gray-400">{avaliacao.tempo}</span>
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < avaliacao.rating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-gray-200'
                                    }`}
                                  />
                                ))}
                                <span className="text-xs font-bold text-indigo-600 ml-2">{avaliacao.rating}/5</span>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed">"{avaliacao.texto}"</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer com Ações Premium */}
              <div className="p-5 bg-gradient-to-r from-gray-50 to-orange-50/50 border-t border-gray-100 flex-shrink-0">
                {/* Botões diferentes para InfoHub vs Google Maps */}
                {(estabelecimentoSelecionado as any).isCadastrado ? (
                  /* BOTÕES PARA ESTABELECIMENTOS INFOHUB - SÓ "Ver Produtos" */
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalAberto(false)}
                      className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Fechar
                    </button>
                    <button
                      onClick={() => {
                        // Navegar para a página de produtos do estabelecimento
                        const estabId = estabelecimentoSelecionado.id.replace('cadastrado-', '')
                        window.location.href = `/promocoes?estabelecimento=${estabId}`
                      }}
                      className="flex-[2] bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-300/50 hover:shadow-xl hover:shadow-orange-300/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      <span className="text-lg">Ver Todos os Produtos</span>
                    </button>
                  </div>
                ) : (
                  /* BOTÕES PARA ESTABELECIMENTOS DO GOOGLE MAPS */
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/place/${estabelecimentoSelecionado.coordinates.lat},${estabelecimentoSelecionado.coordinates.lng}`,
                          '_blank'
                        )
                      }}
                      className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-5 h-5" />
                      Ver no Maps
                    </button>
                    <button
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${estabelecimentoSelecionado.coordinates.lat},${estabelecimentoSelecionado.coordinates.lng}`,
                          '_blank'
                        )
                      }}
                      className="flex-[2] bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-300/50 hover:shadow-xl hover:shadow-orange-300/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      <Navigation className="w-6 h-6" />
                      <span className="text-lg">Como Chegar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Animações */}
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { 
              from { opacity: 0; transform: scale(0.9); } 
              to { opacity: 1; transform: scale(1); } 
            }
          `}</style>
        </>
      )}
    </SidebarLayout>
  )
}

export default TelaLocalizacao
