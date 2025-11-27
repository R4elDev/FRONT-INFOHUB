// ===============================
// GOOGLE MAPS SERVICE
// Integração com Google Maps JavaScript API e Google Geocoding API
// ===============================

// Interfaces para os tipos de dados
export interface Coordinates {
  lat: number
  lng: number
}

export interface GeocodeResult {
  coordinates: Coordinates
  formattedAddress: string
  addressComponents?: {
    logradouro?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
  }
}

export interface GoogleMapsConfig {
  center: Coordinates
  zoom: number
  mapTypeId?: any
}

// Configuração da API
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_SCRIPT_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places`

// Estado global do carregamento da API
let googleMapsLoaded = false
let googleMapsPromise: Promise<void> | null = null

/**
 * Carrega dinamicamente a Google Maps JavaScript API
 */
export const loadGoogleMapsAPI = (): Promise<void> => {
  if (googleMapsLoaded) {
    return Promise.resolve()
  }

  if (googleMapsPromise) {
    return googleMapsPromise
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Verificar se window.google já existe
    if ((window as any).google && (window as any).google.maps) {
      googleMapsLoaded = true
      resolve()
      return
    }

    // Verificar se já existe um script carregando
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        googleMapsLoaded = true
        resolve()
      })
      existingScript.addEventListener('error', reject)
      return
    }

    // Criar e carregar o script
    const script = document.createElement('script')
    script.src = GOOGLE_MAPS_SCRIPT_URL
    script.async = true
    script.defer = true

    script.onload = () => {
      googleMapsLoaded = true
      console.log('✅ Google Maps API carregada com sucesso')
      resolve()
    }

    script.onerror = (error) => {
      console.error('❌ Erro ao carregar Google Maps API:', error)
      googleMapsPromise = null
      reject(new Error('Falha ao carregar Google Maps API'))
    }

    document.head.appendChild(script)
  })

  return googleMapsPromise
}

/**
 * Busca coordenadas por CEP usando Google Geocoding API
 * @param cep - CEP brasileiro (com ou sem máscara)
 * @returns Promise com as coordenadas encontradas
 */
export const buscarCoordenadasPorCEP = async (cep: string): Promise<GeocodeResult> => {
  try {
    // Garantir que a API está carregada
    await loadGoogleMapsAPI()

    // Limpar CEP (remover caracteres não numéricos)
    const cepLimpo = cep.replace(/\D/g, '')

    // Validar CEP brasileiro
    if (cepLimpo.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos')
    }

    // Formatar CEP para busca
    const cepFormatado = `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`
    
    console.log('🔍 Buscando coordenadas para CEP:', cepFormatado)

    // Usar Geocoder do Google Maps
    const geocoder = new (window as any).google.maps.Geocoder()
    
    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { 
          address: `${cepFormatado}, Brasil`,
          region: 'BR'  // Restringir busca ao Brasil
        },
        (results: any, status: any) => {
          if (status === (window as any).google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const result = results[0]
            const location = result.geometry.location

            // Extrair componentes do endereço
            const addressComponents = extractAddressComponents(result.address_components)

            const geocodeResult: GeocodeResult = {
              coordinates: {
                lat: location.lat(),
                lng: location.lng()
              },
              formattedAddress: result.formatted_address,
              addressComponents
            }

            console.log('✅ Coordenadas encontradas para CEP:', geocodeResult)
            resolve(geocodeResult)
          } else {
            console.error('❌ CEP não encontrado:', status)
            reject(new Error(`CEP não encontrado: ${status}`))
          }
        }
      )
    })

  } catch (error) {
    console.error('❌ Erro ao buscar CEP:', error)
    throw new Error(`Erro ao buscar coordenadas por CEP: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

/**
 * Busca coordenadas por endereço completo usando Google Geocoding API
 * @param enderecoCompleto - Endereço completo (rua, número, cidade, etc.)
 * @returns Promise com as coordenadas encontradas
 */
export const buscarCoordenadasPorEndereco = async (enderecoCompleto: string): Promise<GeocodeResult> => {
  try {
    // Garantir que a API está carregada
    await loadGoogleMapsAPI()

    if (!enderecoCompleto.trim()) {
      throw new Error('Endereço não pode estar vazio')
    }

    console.log('🔍 Buscando coordenadas para endereço:', enderecoCompleto)

    // Usar Geocoder do Google Maps
    const geocoder = new (window as any).google.maps.Geocoder()
    
    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { 
          address: `${enderecoCompleto}, Brasil`,
          region: 'BR'  // Restringir busca ao Brasil
        },
        (results: any, status: any) => {
          if (status === (window as any).google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const result = results[0]
            const location = result.geometry.location

            // Extrair componentes do endereço
            const addressComponents = extractAddressComponents(result.address_components)

            const geocodeResult: GeocodeResult = {
              coordinates: {
                lat: location.lat(),
                lng: location.lng()
              },
              formattedAddress: result.formatted_address,
              addressComponents
            }

            console.log('✅ Coordenadas encontradas para endereço:', geocodeResult)
            resolve(geocodeResult)
          } else {
            console.error('❌ Endereço não encontrado:', status)
            reject(new Error(`Endereço não encontrado: ${status}`))
          }
        }
      )
    })

  } catch (error) {
    console.error('❌ Erro ao buscar endereço:', error)
    throw new Error(`Erro ao buscar coordenadas por endereço: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

/**
 * Cria uma nova instância do Google Maps
 * @param container - Elemento HTML onde o mapa será renderizado
 * @param config - Configurações do mapa
 * @returns Instância do Google Maps
 */
export const createGoogleMap = async (
  container: HTMLElement, 
  config: GoogleMapsConfig
): Promise<any> => {
  try {
    // Garantir que a API está carregada
    await loadGoogleMapsAPI()

    console.log('🗺️ Criando Google Maps:', config)

    const mapOptions: any = {
      center: config.center,
      zoom: config.zoom,
      mapTypeId: config.mapTypeId || (window as any).google.maps.MapTypeId.ROADMAP,
      // Configurações adicionais para melhor UX
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
      // Estilo moderno
      styles: [
        {
          featureType: "poi.business",
          stylers: [{ visibility: "on" }]
        },
        {
          featureType: "poi.medical",
          stylers: [{ visibility: "on" }]
        }
      ]
    }

    const map = new (window as any).google.maps.Map(container, mapOptions)
    
    console.log('✅ Google Maps criado com sucesso')
    return map

  } catch (error) {
    console.error('❌ Erro ao criar Google Maps:', error)
    throw new Error(`Erro ao criar mapa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

/**
 * Adiciona um marcador no mapa
 * @param map - Instância do Google Maps
 * @param position - Coordenadas do marcador
 * @param options - Opções do marcador
 * @returns Instância do marcador
 */
export const addMarker = (
  map: any, 
  position: Coordinates,
  options?: {
    title?: string
    icon?: string | any
    animation?: any
  }
): any => {
  const markerOptions: any = {
    position,
    map,
    title: options?.title,
    icon: options?.icon,
    animation: options?.animation || (window as any).google.maps.Animation.DROP
  }

  const marker = new (window as any).google.maps.Marker(markerOptions)
  console.log('📍 Marcador adicionado:', position)
  
  return marker
}

/**
 * Centraliza o mapa em uma coordenada e adiciona marcador
 * @param map - Instância do Google Maps
 * @param coordinates - Coordenadas para centralizar
 * @param zoom - Nível de zoom (opcional)
 */
export const centerMapAndAddMarker = (
  map: any,
  coordinates: Coordinates,
  zoom?: number
): any => {
  // Centralizar mapa
  map.setCenter(coordinates)
  if (zoom) {
    map.setZoom(zoom)
  }

  // Adicionar marcador
  return addMarker(map, coordinates, {
    title: 'Localização encontrada',
    animation: (window as any).google.maps.Animation.BOUNCE
  })
}

/**
 * Busca estabelecimentos próximos usando Google Places API
 * @param map - Instância do Google Maps
 * @param center - Centro da busca
 * @param radius - Raio da busca em metros
 * @param types - Tipos de estabelecimentos a buscar
 * @param keyword - Palavra-chave para busca (opcional)
 */
export const buscarEstabelecimentosProximos = (
  map: any,
  center: Coordinates,
  radius: number = 5000,
  types: string[] = ['grocery_or_supermarket', 'store'],
  keyword?: string
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const service = new (window as any).google.maps.places.PlacesService(map)

    const request: any = {
      location: center,
      radius,
      types,
      keyword
    }

    service.nearbySearch(request, (results: any, status: any) => {
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) {
        console.log(`✅ ${results.length} estabelecimentos encontrados`)
        
        // Log detalhado dos primeiros resultados para debug
        if (results.length > 0) {
          console.log('📷 Debug - Primeiros resultados com fotos:')
          results.slice(0, 3).forEach((place: any, index: number) => {
            console.log(`  ${index + 1}. ${place.name}: ${place.photos?.length || 0} fotos`)
            if (place.photos && place.photos.length > 0) {
              console.log(`     Primeira foto URL: ${place.photos[0].getUrl({ maxWidth: 100 })}`)
            }
          })
        }
        
        resolve(results)
      } else {
        console.error('❌ Erro ao buscar estabelecimentos:', status)
        reject(new Error(`Erro na busca: ${status}`))
      }
    })
  })
}

/**
 * Busca estabelecimentos por nome/texto usando Google Places API
 * @param map - Instância do Google Maps
 * @param query - Texto da busca
 * @param location - Centro da busca (opcional)
 * @param radius - Raio da busca em metros
 */
export const buscarEstabelecimentosPorNome = (
  map: any,
  query: string,
  location?: Coordinates,
  radius: number = 10000
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const service = new (window as any).google.maps.places.PlacesService(map)

    const request: any = {
      query,
      location,
      radius
    }

    service.textSearch(request, (results: any, status: any) => {
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) {
        console.log(`✅ ${results.length} estabelecimentos encontrados por nome: "${query}"`)
        resolve(results)
      } else {
        console.error('❌ Erro ao buscar por nome:', status)
        reject(new Error(`Erro na busca por nome: ${status}`))
      }
    })
  })
}

/**
 * Busca estabelecimentos por categoria específica
 * @param map - Instância do Google Maps
 * @param categoria - Categoria a buscar
 * @param center - Centro da busca
 * @param radius - Raio da busca em metros
 */
export const buscarPorCategoria = (
  map: any,
  categoria: string,
  center: Coordinates,
  radius: number = 5000
): Promise<any[]> => {
  const categorias: { [key: string]: string[] } = {
    'supermercado': ['grocery_or_supermarket', 'supermarket'],
    'farmacia': ['pharmacy'],
    'restaurante': ['restaurant', 'food'],
    'academia': ['gym'],
    'loja': ['store', 'clothing_store', 'shoe_store'],
    'posto': ['gas_station'],
    'banco': ['bank', 'atm'],
    'hospital': ['hospital'],
    'escola': ['school'],
    'padaria': ['bakery']
  }

  const types = categorias[categoria.toLowerCase()] || [categoria]
  
  return buscarEstabelecimentosProximos(map, center, radius, types)
}

/**
 * Busca detalhes completos de um estabelecimento usando Place ID
 * @param map - Instância do Google Maps
 * @param placeId - ID único do estabelecimento no Google Places
 * @returns Promise com detalhes completos do estabelecimento
 */
export const buscarDetalhesEstabelecimento = (
  map: any,
  placeId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const service = new (window as any).google.maps.places.PlacesService(map)

    const request = {
      placeId: placeId,
      fields: [
        'name',
        'formatted_address', 
        'formatted_phone_number',
        'website',
        'rating',
        'user_ratings_total',
        'price_level',
        'opening_hours',
        'photos',
        'reviews',
        'geometry'
      ]
    }

    service.getDetails(request, (place: any, status: any) => {
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place) {
        console.log('✅ Detalhes do estabelecimento obtidos:', place)
        resolve(place)
      } else {
        console.error('❌ Erro ao buscar detalhes:', status)
        reject(new Error(`Erro ao buscar detalhes: ${status}`))
      }
    })
  })
}

/**
 * Função auxiliar para extrair componentes do endereço
 */
const extractAddressComponents = (components: any[]) => {
  const result: any = {}

  components.forEach(component => {
    const types = component.types

    if (types.includes('route')) {
      result.logradouro = component.long_name
    } else if (types.includes('street_number')) {
      result.numero = component.long_name
    } else if (types.includes('sublocality') || types.includes('neighborhood')) {
      result.bairro = component.long_name
    } else if (types.includes('locality')) {
      result.cidade = component.long_name
    } else if (types.includes('administrative_area_level_1')) {
      result.estado = component.short_name
    } else if (types.includes('postal_code')) {
      result.cep = component.long_name
    }
  })

  return result
}

// Função de utilidade para verificar se a API está carregada
export const isGoogleMapsLoaded = (): boolean => {
  return googleMapsLoaded && !!((window as any).google && (window as any).google.maps)
}

// Exportar configurações padrão
export const DEFAULT_MAP_CONFIG: GoogleMapsConfig = {
  center: { lat: -23.5505, lng: -46.6333 }, // São Paulo padrão
  zoom: 13
}
