import { useState, useCallback } from 'react'
import type { Product, CartItem } from '../types'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = useCallback((product: Product, quantidade = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === product.id)
      
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item
        )
      }
      
      return [...prev, { ...product, quantidade }]
    })
  }, [])

  const removeFromCart = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: number, quantidade: number) => {
    if (quantidade <= 0) {
      removeFromCart(id)
      return
    }
    
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantidade } : item
      )
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantidade, 0)

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    totalItems,
    isEmpty: items.length === 0
  }
}
