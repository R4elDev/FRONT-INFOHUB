// ===============================
// GOOGLE MAPS TYPES
// Declarações de tipos para Google Maps JavaScript API
// ===============================

declare global {
  interface Window {
    google: typeof google
  }
}

// Declarações básicas para Google Maps (caso não estejam disponíveis)
declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options: MapOptions)
      setCenter(latLng: LatLng | LatLngLiteral): void
      setZoom(zoom: number): void
      getCenter(): LatLng
      getZoom(): number
    }

    class Marker {
      constructor(options: MarkerOptions)
      setPosition(latLng: LatLng | LatLngLiteral): void
      setMap(map: Map | null): void
      getPosition(): LatLng | undefined
    }

    class Geocoder {
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void
    }

    class LatLng {
      constructor(lat: number, lng: number)
      lat(): number
      lng(): number
    }

    interface LatLngLiteral {
      lat: number
      lng: number
    }

    interface MapOptions {
      center: LatLng | LatLngLiteral
      zoom: number
      mapTypeId?: MapTypeId
      zoomControl?: boolean
      mapTypeControl?: boolean
      scaleControl?: boolean
      streetViewControl?: boolean
      rotateControl?: boolean
      fullscreenControl?: boolean
      styles?: MapTypeStyle[]
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral
      map: Map
      title?: string
      icon?: string | Icon | Symbol
      animation?: Animation
    }

    interface GeocoderRequest {
      address?: string
      region?: string
      bounds?: LatLngBounds
      componentRestrictions?: GeocoderComponentRestrictions
    }

    interface GeocoderResult {
      address_components: GeocoderAddressComponent[]
      formatted_address: string
      geometry: GeocoderGeometry
      place_id: string
      types: string[]
    }

    interface GeocoderAddressComponent {
      long_name: string
      short_name: string
      types: string[]
    }

    interface GeocoderGeometry {
      location: LatLng
      location_type: GeocoderLocationType
      viewport: LatLngBounds
      bounds?: LatLngBounds
    }

    interface GeocoderComponentRestrictions {
      country?: string | string[]
      postalCode?: string
      administrativeArea?: string
      locality?: string
    }

    interface MapTypeStyle {
      featureType?: string
      elementType?: string
      stylers: MapTypeStyler[]
    }

    interface MapTypeStyler {
      visibility?: string
      color?: string
      weight?: number
      gamma?: number
      lightness?: number
      saturation?: number
    }

    interface Icon {
      url: string
      size?: Size
      origin?: Point
      anchor?: Point
      scaledSize?: Size
    }

    interface Symbol {
      path: string | SymbolPath
      anchor?: Point
      fillColor?: string
      fillOpacity?: number
      rotation?: number
      scale?: number
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
    }

    class Size {
      constructor(width: number, height: number)
    }

    class Point {
      constructor(x: number, y: number)
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral)
    }

    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain'
    }

    enum Animation {
      BOUNCE = 1,
      DROP = 2
    }

    enum GeocoderStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }

    enum GeocoderLocationType {
      ROOFTOP = 'ROOFTOP',
      RANGE_INTERPOLATED = 'RANGE_INTERPOLATED',
      GEOMETRIC_CENTER = 'GEOMETRIC_CENTER',
      APPROXIMATE = 'APPROXIMATE'
    }

    enum SymbolPath {
      CIRCLE = 0,
      FORWARD_CLOSED_ARROW = 1,
      FORWARD_OPEN_ARROW = 2,
      BACKWARD_CLOSED_ARROW = 3,
      BACKWARD_OPEN_ARROW = 4
    }

    // Google Places API
    namespace places {
      class PlacesService {
        constructor(map: Map)
        nearbySearch(request: PlaceSearchRequest, callback: (results: PlaceResult[], status: PlacesServiceStatus) => void): void
        textSearch(request: TextSearchRequest, callback: (results: PlaceResult[], status: PlacesServiceStatus) => void): void
      }

      interface PlaceSearchRequest {
        location: LatLng | LatLngLiteral
        radius: number
        types?: string[]
        keyword?: string
        name?: string
      }

      interface TextSearchRequest {
        query: string
        location?: LatLng | LatLngLiteral
        radius?: number
        types?: string[]
      }

      interface PlaceResult {
        geometry?: PlaceGeometry
        icon?: string
        name?: string
        photos?: PlacePhoto[]
        place_id?: string
        rating?: number
        types?: string[]
        vicinity?: string
        formatted_address?: string
        price_level?: number
        opening_hours?: PlaceOpeningHours
      }

      interface PlaceGeometry {
        location: LatLng
        viewport: LatLngBounds
      }

      interface PlacePhoto {
        height: number
        width: number
        getUrl(opts: PhotoOptions): string
      }

      interface PhotoOptions {
        maxHeight?: number
        maxWidth?: number
      }

      interface PlaceOpeningHours {
        /** @deprecated Use isOpen() instead */
        open_now?: boolean
        periods?: PlaceOpeningHoursPeriod[]
        weekday_text?: string[]
        /** Returns whether the place is open now. Use this instead of open_now */
        isOpen?: () => boolean
      }

      interface PlaceOpeningHoursPeriod {
        close?: PlaceOpeningHoursTime
        open: PlaceOpeningHoursTime
      }

      interface PlaceOpeningHoursTime {
        day: number
        time: string
      }

      enum PlacesServiceStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR'
      }
    }
  }
}

export {}
