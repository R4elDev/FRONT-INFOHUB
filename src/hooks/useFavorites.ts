import { useState, useCallback } from 'react'
import type { Product } from '../types'

export function useFavorites() {
  const [favoritos, setFavoritos] = useState<Product[]>([])

  const addFavorite = useCallback((product: Product) => {
    setFavoritos(prev => {
      if (prev.some(p => p.id === product.id)) {
        return prev // Já está nos favoritos
      }
      return [...prev, product]
    })
  }, [])

  const removeFavorite = useCallback((id: number) => {
    setFavoritos(prev => prev.filter(p => p.id !== id))
  }, [])

  const isFavorite = useCallback((id: number) => {
    return favoritos.some(p => p.id === id)
  }, [favoritos])

  const clearFavorites = useCallback(() => {
    setFavoritos([])
  }, [])

  return {
    favoritos,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
    count: favoritos.length
  }
}
