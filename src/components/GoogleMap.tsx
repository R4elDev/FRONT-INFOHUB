// ===============================
// GOOGLE MAP COMPONENT
// Componente React para Google Maps
// ===============================

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { 
  loadGoogleMapsAPI, 
  createGoogleMap, 
  centerMapAndAddMarker,
  buscarEstabelecimentosProximos,
  type Coordinates,
  type GoogleMapsConfig
} from '../services/googleMapsService'

// Interface para props do componente
export interface GoogleMapProps {
  center: Coordinates
  zoom?: number
  onMapLoad?: (map: any) => void
  onLocationClick?: (coordinates: Coordinates) => void
  showEstabelecimentos?: boolean
  className?: string
  style?: React.CSSProperties
}

// Interface para métodos expostos via ref
export interface GoogleMapRef {
  getMap: () => any
  setCenter: (coordinates: Coordinates, zoom?: number) => void
  addMarker: (coordinates: Coordinates, options?: { title?: string; color?: 'green' | 'orange' | 'red' | 'blue'; onClick?: () => void }) => any
  clearMarkers: () => void
  buscarEstabelecimentos: (coordinates: Coordinates, radius?: number) => Promise<any[]>
}

// Componente GoogleMap
export const GoogleMap = forwardRef<GoogleMapRef, GoogleMapProps>(({
  center,
  zoom = 13,
  onMapLoad,
  onLocationClick,
  showEstabelecimentos = false,
  className = '',
  style
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Expor métodos via ref
  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    
    setCenter: (coordinates: Coordinates, newZoom?: number) => {
      if (mapRef.current) {
        mapRef.current.setCenter(coordinates)
        if (newZoom) {
          mapRef.current.setZoom(newZoom)
        }
      }
    },
    
    addMarker: (coordinates: Coordinates, options?: { title?: string; color?: 'green' | 'orange' | 'red' | 'blue'; onClick?: () => void }) => {
      if (mapRef.current) {
        // Cores para os marcadores
        const colors: { [key: string]: string } = {
          green: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          orange: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
          red: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          blue: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
        
        const markerOptions: any = {
          position: coordinates,
          map: mapRef.current,
          title: options?.title,
          animation: (window as any).google.maps.Animation.DROP
        }
        
        // Se uma cor foi especificada, usar ícone colorido
        if (options?.color && colors[options.color]) {
          markerOptions.icon = colors[options.color]
        }
        
        const marker = new (window as any).google.maps.Marker(markerOptions)
        
        // Adicionar evento de clique se fornecido
        if (options?.onClick) {
          marker.addListener('click', options.onClick)
        }
        
        markersRef.current.push(marker)
        return marker
      }
      return null
    },
    
    clearMarkers: () => {
      markersRef.current.forEach(marker => {
        marker.setMap(null)
      })
      markersRef.current = []
    },
    
    buscarEstabelecimentos: async (coordinates: Coordinates, radius = 5000) => {
      if (mapRef.current) {
        return await buscarEstabelecimentosProximos(mapRef.current, coordinates, radius)
      }
      return []
    }
  }))

  // Inicializar o mapa
  useEffect(() => {
    let isMounted = true

    const initializeMap = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!mapContainerRef.current) {
          throw new Error('Container do mapa não encontrado')
        }

        // Carregar Google Maps API
        console.log('🔄 Carregando Google Maps API...')
        await loadGoogleMapsAPI()

        if (!isMounted) return

        // Criar mapa
        console.log('🗺️ Criando Google Maps...')
        const mapConfig: GoogleMapsConfig = {
          center,
          zoom
        }

        const map = await createGoogleMap(mapContainerRef.current, mapConfig)
        mapRef.current = map

        // Adicionar event listener para cliques
        if (onLocationClick) {
          map.addListener('click', (event: any) => {
            if (event.latLng) {
              const coordinates: Coordinates = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
              }
              onLocationClick(coordinates)
            }
          })
        }

        // Adicionar marcador inicial
        const initialMarker = centerMapAndAddMarker(map, center, zoom)
        markersRef.current.push(initialMarker)

        // Buscar estabelecimentos se solicitado
        if (showEstabelecimentos) {
          try {
            const estabelecimentos = await buscarEstabelecimentosProximos(map, center)
            console.log(`✅ ${estabelecimentos.length} estabelecimentos encontrados`)
            
            // Adicionar marcadores dos estabelecimentos
            estabelecimentos.forEach(place => {
              if (place.geometry?.location) {
                const marker = new (window as any).google.maps.Marker({
                  position: place.geometry.location,
                  map,
                  title: place.name,
                  icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new (window as any).google.maps.Size(32, 32)
                  }
                })
                markersRef.current.push(marker)

                // Adicionar info window
                const infoWindow = new (window as any).google.maps.InfoWindow({
                  content: `
                    <div style="padding: 8px;">
                      <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${place.name}</h3>
                      <p style="margin: 0; font-size: 12px; color: #666;">${place.vicinity}</p>
                      ${place.rating ? `<p style="margin: 4px 0 0 0; font-size: 12px;">⭐ ${place.rating}</p>` : ''}
                    </div>
                  `
                })

                marker.addListener('click', () => {
                  infoWindow.open(map, marker)
                })
              }
            })
          } catch (estabelecimentosError) {
            console.warn('⚠️ Erro ao buscar estabelecimentos:', estabelecimentosError)
          }
        }

        // Chamar callback se fornecido
        if (onMapLoad) {
          onMapLoad(map)
        }

        console.log('✅ Google Maps inicializado com sucesso')

      } catch (err) {
        console.error('❌ Erro ao inicializar Google Maps:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeMap()

    return () => {
      isMounted = false
      // Limpar marcadores ao desmontar
      markersRef.current.forEach(marker => {
        marker.setMap(null)
      })
      markersRef.current = []
    }
  }, []) // Executar apenas uma vez na montagem

  // Atualizar centro quando prop mudar
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter(center)
      
      // Limpar marcadores existentes e adicionar novo
      markersRef.current.forEach(marker => {
        marker.setMap(null)
      })
      markersRef.current = []

      const newMarker = centerMapAndAddMarker(mapRef.current, center, zoom)
      markersRef.current.push(newMarker)
    }
  }, [center, zoom])

  // Renderização
  if (error) {
    return (
      <div 
        className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}
        style={style}
      >
        <div className="text-red-600 mb-2">❌ Erro ao carregar o mapa</div>
        <div className="text-sm text-red-500">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Recarregar página
        </button>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F9A01B] mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Carregando mapa...</div>
          </div>
        </div>
      )}
      
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
    </div>
  )
})

GoogleMap.displayName = 'GoogleMap'

// Componente wrapper com loading state
export interface GoogleMapWrapperProps extends GoogleMapProps {
  loadingComponent?: React.ReactNode
}

export const GoogleMapWrapper = forwardRef<GoogleMapRef, GoogleMapWrapperProps>(({
  loadingComponent,
  ...mapProps
}, ref) => {
  const [isAPIReady, setIsAPIReady] = useState(false)

  useEffect(() => {
    loadGoogleMapsAPI()
      .then(() => {
        setIsAPIReady(true)
      })
      .catch((error) => {
        console.error('❌ Erro ao carregar Google Maps API:', error)
      })
  }, [])

  if (!isAPIReady) {
    return (
      loadingComponent || (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F9A01B] mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Carregando Google Maps...</div>
          <div className="text-sm text-gray-500 mt-2">Aguarde alguns instantes</div>
        </div>
      )
    )
  }

  return <GoogleMap ref={ref} {...mapProps} />
})

GoogleMapWrapper.displayName = 'GoogleMapWrapper'

export default GoogleMap
