import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useUser } from './UserContext'
import * as carrinhoService from '../services/carrinhoService'
import type { CarrinhoItem } from '../services/carrinhoService'
import type { Product, CartItem } from '../types'

// ============================================
// TIPOS
// ============================================

interface CarrinhoContextType {
  items: CartItem[]
  loading: boolean
  addToCart: (product: Product, quantidade?: number) => Promise<void>
  removeFromCart: (productId: number) => Promise<void>
  updateQuantity: (productId: number, quantidade: number) => Promise<void>
  clearCart: () => Promise<void>
  total: number
  totalItems: number
  isEmpty: boolean
  refreshCart: () => Promise<void>
}

// ============================================
// CONTEXTO
// ============================================

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined)

export const useCarrinho = () => {
  const context = useContext(CarrinhoContext)
  if (context === undefined) {
    throw new Error('useCarrinho must be used within a CarrinhoProvider')
  }
  return context
}

// ============================================
// PROVIDER
// ============================================

interface CarrinhoProviderProps {
  children: ReactNode
}

export const CarrinhoProvider: React.FC<CarrinhoProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useUser()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  // Converter CarrinhoItem da API para CartItem
  const convertToCartItem = (item: CarrinhoItem): CartItem => {
    return {
      id: item.produto?.id_produto || item.id_produto,
      nome: item.produto?.nome || '',
      preco: item.produto?.preco_promocional || item.produto?.preco || 0,
      precoAntigo: item.produto?.preco,
      imagem: item.produto?.imagem || '',
      categoria: item.produto?.categoria,
      descricao: item.produto?.descricao,
      quantidade: item.quantidade
    }
  }

  // Buscar carrinho do localStorage (temporário até backend estar pronto)
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setItems([])
      return
    }

    try {
      setLoading(true)
      
      // TODO: Quando o backend estiver pronto, descomentar:
      // const response = await carrinhoService.buscarCarrinho(user.id)
      // if (response.status && response.itens) {
      //   const cartItems = response.itens.map(convertToCartItem)
      //   setItems(cartItems)
      // }
      
      // TEMPORÁRIO: Usar localStorage
      const key = `carrinho_user_${user.id}`
      const stored = localStorage.getItem(key)
      if (stored) {
        const cartItems = JSON.parse(stored)
        setItems(cartItems)
      } else {
        setItems([])
      }
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

  // Carregar carrinho quando o usuário fizer login
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Adicionar ao carrinho
  const addToCart = useCallback(async (product: Product, quantidade = 1) => {
    if (!isAuthenticated || !user?.id) {
      alert('Você precisa estar logado para adicionar ao carrinho')
      return
    }

    try {
      setLoading(true)
      
      // Verifica se o produto já está no carrinho
      const existingItem = items.find(item => item.id === product.id)
      
      let novosItens: CartItem[]
      
      if (existingItem) {
        // Se já existe, atualiza a quantidade
        const novaQuantidade = existingItem.quantidade + quantidade
        
        // TODO: Quando o backend estiver pronto, descomentar:
        // const response = await carrinhoService.buscarCarrinho(user.id)
        // const carrinhoItem = response.itens?.find(i => i.id_produto === product.id)
        // if (carrinhoItem) {
        //   await carrinhoService.atualizarQuantidade(carrinhoItem.id_carrinho, {
        //     quantidade: novaQuantidade
        //   })
        // }
        
        // TEMPORÁRIO: Atualizar no localStorage
        novosItens = items.map(item =>
          item.id === product.id
            ? { ...item, quantidade: novaQuantidade }
            : item
        )
      } else {
        // Se não existe, adiciona novo item
        // TODO: Quando o backend estiver pronto, descomentar:
        // await carrinhoService.adicionarAoCarrinho({
        //   id_usuario: user.id,
        //   id_produto: product.id,
        //   quantidade
        // })
        
        // TEMPORÁRIO: Adicionar no localStorage
        const newItem: CartItem = {
          ...product,
          quantidade
        }
        novosItens = [...items, newItem]
      }
      
      setItems(novosItens)
      const key = `carrinho_user_${user.id}`
      localStorage.setItem(key, JSON.stringify(novosItens))
      
      console.log('✅ Produto adicionado ao carrinho (localStorage)')
    } catch (error: any) {
      console.error('Erro ao adicionar ao carrinho:', error)
      alert('Erro ao adicionar ao carrinho')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id, items])

  // Remover do carrinho
  const removeFromCart = useCallback(async (productId: number) => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    try {
      setLoading(true)
      
      // TODO: Quando o backend estiver pronto, descomentar:
      // const response = await carrinhoService.buscarCarrinho(user.id)
      // const carrinhoItem = response.itens?.find(i => i.id_produto === productId)
      // if (carrinhoItem) {
      //   await carrinhoService.removerDoCarrinho(carrinhoItem.id_carrinho)
      // }
      
      // TEMPORÁRIO: Remover do localStorage
      const novosItens = items.filter(item => item.id !== productId)
      setItems(novosItens)
      const key = `carrinho_user_${user.id}`
      localStorage.setItem(key, JSON.stringify(novosItens))
      
      console.log('✅ Produto removido do carrinho (localStorage)')
    } catch (error: any) {
      console.error('Erro ao remover do carrinho:', error)
      alert('Erro ao remover do carrinho')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id, items])

  // Atualizar quantidade
  const updateQuantity = useCallback(async (productId: number, quantidade: number) => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    if (quantidade <= 0) {
      await removeFromCart(productId)
      return
    }

    try {
      setLoading(true)
      
      // TODO: Quando o backend estiver pronto, descomentar:
      // const response = await carrinhoService.buscarCarrinho(user.id)
      // const carrinhoItem = response.itens?.find(i => i.id_produto === productId)
      // if (carrinhoItem) {
      //   await carrinhoService.atualizarQuantidade(carrinhoItem.id_carrinho, {
      //     quantidade
      //   })
      // }
      
      // TEMPORÁRIO: Atualizar no localStorage
      const novosItens = items.map(item =>
        item.id === productId ? { ...item, quantidade } : item
      )
      setItems(novosItens)
      const key = `carrinho_user_${user.id}`
      localStorage.setItem(key, JSON.stringify(novosItens))
      
      console.log('✅ Quantidade atualizada (localStorage)')
    } catch (error: any) {
      console.error('Erro ao atualizar quantidade:', error)
      alert('Erro ao atualizar quantidade')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id, removeFromCart, items])

  // Limpar carrinho
  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    try {
      setLoading(true)
      
      // TODO: Quando o backend estiver pronto, descomentar:
      // await carrinhoService.limparCarrinho(user.id)
      
      // TEMPORÁRIO: Limpar do localStorage
      setItems([])
      const key = `carrinho_user_${user.id}`
      localStorage.removeItem(key)
      
      console.log('✅ Carrinho limpo (localStorage)')
    } catch (error: any) {
      console.error('Erro ao limpar carrinho:', error)
      alert('Erro ao limpar carrinho')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

  // Calcular total
  const total = items.reduce((sum, item) => sum + (Number(item.preco) * item.quantidade), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantidade, 0)

  const value: CarrinhoContextType = {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    totalItems,
    isEmpty: items.length === 0,
    refreshCart
  }

  return (
    <CarrinhoContext.Provider value={value}>
      {children}
    </CarrinhoContext.Provider>
  )
}
