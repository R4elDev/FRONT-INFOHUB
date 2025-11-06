import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useUser } from './UserContext'
import * as favoritosService from '../services/favoritosService'
import type { FavoritoItem } from '../services/favoritosService'
import type { Product } from '../types'

// ============================================
// TIPOS
// ============================================

interface FavoritosContextType {
  favoritos: Product[]
  loading: boolean
  addFavorite: (product: Product) => Promise<void>
  removeFavorite: (productId: number) => Promise<void>
  isFavorite: (productId: number) => boolean
  clearFavorites: () => Promise<void>
  count: number
  refreshFavorites: () => Promise<void>
}

// ============================================
// CONTEXTO
// ============================================

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined)

export const useFavoritos = () => {
  const context = useContext(FavoritosContext)
  if (context === undefined) {
    throw new Error('useFavoritos must be used within a FavoritosProvider')
  }
  return context
}

// ============================================
// PROVIDER
// ============================================

interface FavoritosProviderProps {
  children: ReactNode
}

export const FavoritosProvider: React.FC<FavoritosProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useUser()
  const [favoritos, setFavoritos] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // Converter FavoritoItem da API para Product
  const convertToProduct = (item: FavoritoItem): Product => {
    return {
      id: item.produto?.id_produto || item.id_produto,
      nome: item.produto?.nome || '',
      preco: item.produto?.preco_promocional || item.produto?.preco || 0,
      precoAntigo: item.produto?.preco,
      imagem: item.produto?.imagem || '',
      categoria: item.produto?.categoria,
      descricao: item.produto?.descricao,
    }
  }

  // Buscar favoritos do localStorage (temporário até backend estar pronto)
  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setFavoritos([])
      return
    }

    try {
      setLoading(true)
      
      // TODO: Quando o backend estiver pronto, descomentar:
      // const response = await favoritosService.buscarFavoritos(user.id)
      // if (response.status && response.favoritos) {
      //   const produtos = response.favoritos.map(convertToProduct)
      //   setFavoritos(produtos)
      // }
      
      // TEMPORÁRIO: Usar localStorage
      const key = `favoritos_user_${user.id}`
      const stored = localStorage.getItem(key)
      if (stored) {
        const produtos = JSON.parse(stored)
        setFavoritos(produtos)
      } else {
        setFavoritos([])
      }
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error)
      setFavoritos([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

  // Carregar favoritos quando o usuário fizer login
  useEffect(() => {
    refreshFavorites()
  }, [refreshFavorites])

  // Adicionar aos favoritos
  const addFavorite = useCallback(async (product: Product) => {
    if (!isAuthenticated || !user?.id) {
      alert('Você precisa estar logado para adicionar favoritos')
      return
    }

    try {
      // Verifica se já está nos favoritos
      if (favoritos.some(p => p.id === product.id)) {
        console.log('Produto já está nos favoritos')
        return
      }

      setLoading(true)
      
      // TODO: Quando o backend estiver pronto, descomentar:
      // await favoritosService.adicionarFavorito({
      //   id_usuario: user.id,
      //   id_produto: product.id
      // })

      // TEMPORÁRIO: Salvar no localStorage
      const novosFavoritos = [...favoritos, product]
      setFavoritos(novosFavoritos)
      const key = `favoritos_user_${user.id}`
      localStorage.setItem(key, JSON.stringify(novosFavoritos))
      
      console.log('✅ Produto adicionado aos favoritos (localStorage)')
    } catch (error: any) {
      console.error('Erro ao adicionar favorito:', error)
      alert('Erro ao adicionar aos favoritos')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id, favoritos])

  // Remover dos favoritos
  const removeFavorite = useCallback(async (productId: number) => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    try {
      setLoading(true)
      
      // TODO: Quando o backend estiver pronto, descomentar:
      // const response = await favoritosService.buscarFavoritos(user.id)
      // const favorito = response.favoritos?.find(f => f.id_produto === productId)
      // if (favorito) {
      //   await favoritosService.removerFavorito(favorito.id_favorito)
      // }
      
      // TEMPORÁRIO: Remover do localStorage
      const novosFavoritos = favoritos.filter(p => p.id !== productId)
      setFavoritos(novosFavoritos)
      const key = `favoritos_user_${user.id}`
      localStorage.setItem(key, JSON.stringify(novosFavoritos))
      
      console.log('✅ Produto removido dos favoritos (localStorage)')
    } catch (error: any) {
      console.error('Erro ao remover favorito:', error)
      alert('Erro ao remover dos favoritos')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id, favoritos])

  // Verificar se está nos favoritos
  const isFavorite = useCallback((productId: number) => {
    return favoritos.some(p => p.id === productId)
  }, [favoritos])

  // Limpar todos os favoritos
  const clearFavorites = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    try {
      setLoading(true)
      
      // TODO: Quando o backend estiver pronto, descomentar:
      // await favoritosService.limparFavoritos(user.id)
      
      // TEMPORÁRIO: Limpar do localStorage
      setFavoritos([])
      const key = `favoritos_user_${user.id}`
      localStorage.removeItem(key)
      
      console.log('✅ Todos os favoritos foram removidos (localStorage)')
    } catch (error: any) {
      console.error('Erro ao limpar favoritos:', error)
      alert('Erro ao limpar favoritos')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

  const value: FavoritosContextType = {
    favoritos,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
    count: favoritos.length,
    refreshFavorites
  }

  return (
    <FavoritosContext.Provider value={value}>
      {children}
    </FavoritosContext.Provider>
  )
}
