import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useUser } from './UserContext'
import { CarrinhoAPI, type CarrinhoItem, type CarrinhoData } from '../services/carrinhoService'
import type { Product, CartItem } from '../types'

// ============================================
// TIPOS
// ============================================

interface CarrinhoContextType {
  items: CartItem[]
  loading: boolean
  error: string
  addToCart: (product: Product, quantidade?: number) => Promise<void>
  removeFromCart: (productId: number) => Promise<void>
  updateQuantity: (productId: number, quantidade: number) => Promise<void>
  clearCart: () => Promise<void>
  total: number
  totalItems: number
  isEmpty: boolean
  refreshCart: () => Promise<void>
  contarItens: () => Promise<{ total_itens: number; total_produtos: number }>
  testarAPI: () => Promise<void>
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
  const [error, setError] = useState('')

  // Converter CarrinhoItem da API para CartItem
  const convertToCartItem = (item: CarrinhoItem): CartItem => {
    return {
      id: item.id_produto,
      nome: item.nome_produto,
      preco: item.preco_promocional || item.preco_atual,
      precoAntigo: item.preco_promocional ? item.preco_atual : undefined,
      imagem: '', // A API não retorna imagem no carrinho
      categoria: item.categoria,
      descricao: item.descricao,
      quantidade: item.quantidade
    }
  }

  // Buscar carrinho do backend com fallback para localStorage
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setItems([])
      setError('')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      console.log('🔄 Carregando carrinho do backend...')
      
      // Tentar buscar do backend primeiro
      const carrinhoData = await CarrinhoAPI.listarCarrinho(user.id)
      
      if (carrinhoData.itens && carrinhoData.itens.length > 0) {
        const cartItems = carrinhoData.itens.map(convertToCartItem)
        setItems(cartItems)
        console.log(`✅ Carrinho carregado do backend: ${carrinhoData.resumo.total_itens} itens`)
      } else {
        setItems([])
        console.log('📭 Carrinho vazio no backend')
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar carrinho do backend:', error)
      setError(error.message || 'Erro ao carregar carrinho')
      
      // Fallback para localStorage
      try {
        console.log('⚠️ Tentando carregar do localStorage como fallback...')
        const key = `carrinho_user_${user.id}`
        const stored = localStorage.getItem(key)
        if (stored) {
          const cartItems = JSON.parse(stored)
          setItems(cartItems)
          console.log('✅ Carrinho carregado do localStorage')
        } else {
          setItems([])
        }
      } catch (localError) {
        console.error('❌ Erro no localStorage também:', localError)
        setItems([])
      }
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
      setError('Você precisa estar logado para adicionar ao carrinho')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      console.log(`🛒 Adicionando produto ${product.id} ao carrinho (quantidade: ${quantidade})`)
      
      // Tentar adicionar no backend primeiro
      await CarrinhoAPI.adicionarItem(user.id, product.id, quantidade)
      
      // Recarregar carrinho para pegar dados atualizados
      await refreshCart()
      
      console.log('✅ Produto adicionado ao carrinho com sucesso!')
      
    } catch (error: any) {
      console.error('❌ Erro ao adicionar ao carrinho:', error)
      setError(error.message || 'Erro ao adicionar ao carrinho')
      
      // Fallback para localStorage
      try {
        console.log('⚠️ Usando localStorage como fallback...')
        const existingItem = items.find(item => item.id === product.id)
        
        let novosItens: CartItem[]
        
        if (existingItem) {
          const novaQuantidade = existingItem.quantidade + quantidade
          novosItens = items.map(item =>
            item.id === product.id
              ? { ...item, quantidade: novaQuantidade }
              : item
          )
        } else {
          const newItem: CartItem = {
            ...product,
            quantidade
          }
          novosItens = [...items, newItem]
        }
        
        setItems(novosItens)
        const key = `carrinho_user_${user.id}`
        localStorage.setItem(key, JSON.stringify(novosItens))
        
        console.log('✅ Produto adicionado ao localStorage')
      } catch (localError) {
        console.error('❌ Erro no localStorage também:', localError)
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id, items, refreshCart])

  // Remover do carrinho
  const removeFromCart = useCallback(async (productId: number) => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    try {
      setLoading(true)
      setError('')
      
      console.log(`🗑️ Removendo produto ${productId} do carrinho`)
      
      // Tentar remover do backend primeiro
      await CarrinhoAPI.removerItem(user.id, productId)
      
      // Recarregar carrinho
      await refreshCart()
      
      console.log('✅ Produto removido do carrinho com sucesso!')
      
    } catch (error: any) {
      console.error('❌ Erro ao remover do carrinho:', error)
      setError(error.message || 'Erro ao remover do carrinho')
      
      // Fallback para localStorage
      try {
        console.log('⚠️ Usando localStorage como fallback...')
        const novosItens = items.filter(item => item.id !== productId)
        setItems(novosItens)
        const key = `carrinho_user_${user.id}`
        localStorage.setItem(key, JSON.stringify(novosItens))
        
        console.log('✅ Produto removido do localStorage')
      } catch (localError) {
        console.error('❌ Erro no localStorage também:', localError)
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id, items, refreshCart])

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
      setError('')
      
      console.log(`🔄 Atualizando quantidade do produto ${productId} para ${quantidade}`)
      
      // Tentar atualizar no backend primeiro
      await CarrinhoAPI.atualizarQuantidade(user.id, productId, quantidade)
      
      // Recarregar carrinho
      await refreshCart()
      
      console.log('✅ Quantidade atualizada com sucesso!')
      
    } catch (error: any) {
      console.error('❌ Erro ao atualizar quantidade:', error)
      setError(error.message || 'Erro ao atualizar quantidade')
      
      // Fallback para localStorage
      try {
        console.log('⚠️ Usando localStorage como fallback...')
        const novosItens = items.map(item =>
          item.id === productId ? { ...item, quantidade } : item
        )
        setItems(novosItens)
        const key = `carrinho_user_${user.id}`
        localStorage.setItem(key, JSON.stringify(novosItens))
        
        console.log('✅ Quantidade atualizada no localStorage')
      } catch (localError) {
        console.error('❌ Erro no localStorage também:', localError)
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id, removeFromCart, items, refreshCart])

  // Limpar carrinho
  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    try {
      setLoading(true)
      setError('')
      
      console.log('🧹 Limpando carrinho...')
      
      // Tentar limpar no backend primeiro
      await CarrinhoAPI.limparCarrinho(user.id)
      
      // Limpar estado local
      setItems([])
      
      // Limpar localStorage também
      const key = `carrinho_user_${user.id}`
      localStorage.removeItem(key)
      
      console.log('✅ Carrinho limpo com sucesso!')
      
    } catch (error: any) {
      console.error('❌ Erro ao limpar carrinho:', error)
      setError(error.message || 'Erro ao limpar carrinho')
      
      // Fallback para localStorage
      try {
        console.log('⚠️ Limpando localStorage como fallback...')
        setItems([])
        const key = `carrinho_user_${user.id}`
        localStorage.removeItem(key)
        
        console.log('✅ Carrinho limpo do localStorage')
      } catch (localError) {
        console.error('❌ Erro no localStorage também:', localError)
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

  // Contar itens do carrinho
  const contarItens = useCallback(async (): Promise<{ total_itens: number; total_produtos: number }> => {
    if (!isAuthenticated || !user?.id) {
      return { total_itens: 0, total_produtos: 0 }
    }

    try {
      console.log('📊 Contando itens do carrinho...')
      const contador = await CarrinhoAPI.contarItens(user.id)
      console.log(`✅ Contador: ${contador.total_produtos} produtos em ${contador.total_itens} tipos`)
      return contador
    } catch (error: any) {
      console.error('❌ Erro ao contar itens:', error)
      
      // Fallback para contagem local
      const totalItems = items.length
      const totalProdutos = items.reduce((sum, item) => sum + item.quantidade, 0)
      
      return {
        total_itens: totalItems,
        total_produtos: totalProdutos
      }
    }
  }, [isAuthenticated, user?.id, items])

  // Função de teste da API
  const testarAPI = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('❌ Usuário não autenticado para teste')
      return
    }

    console.log('🧪 === TESTE COMPLETO DA API DE CARRINHO ===')
    
    try {
      // 1. Listar carrinho atual
      console.log('1. 📋 Listando carrinho atual...')
      const carrinhoAtual = await CarrinhoAPI.listarCarrinho(user.id)
      console.log('Carrinho atual:', carrinhoAtual)

      // 2. Contar itens
      console.log('2. 📊 Contando itens...')
      const contador = await CarrinhoAPI.contarItens(user.id)
      console.log('Contador:', contador)

      // 3. Adicionar item de teste
      console.log('3. 🛒 Adicionando item de teste (produto ID: 1)...')
      await CarrinhoAPI.adicionarItem(user.id, 1, 2)

      // 4. Listar novamente
      console.log('4. 📋 Listando após adicionar...')
      const carrinhoAposAdicionar = await CarrinhoAPI.listarCarrinho(user.id)
      console.log('Carrinho após adicionar:', carrinhoAposAdicionar)

      // 5. Atualizar quantidade
      console.log('5. 🔄 Atualizando quantidade para 3...')
      await CarrinhoAPI.atualizarQuantidade(user.id, 1, 3)

      // 6. Listar após atualizar
      console.log('6. 📋 Listando após atualizar...')
      const carrinhoAposAtualizar = await CarrinhoAPI.listarCarrinho(user.id)
      console.log('Carrinho após atualizar:', carrinhoAposAtualizar)

      // 7. Remover item
      console.log('7. 🗑️ Removendo item...')
      await CarrinhoAPI.removerItem(user.id, 1)

      // 8. Listar após remover
      console.log('8. 📋 Listando após remover...')
      const carrinhoAposRemover = await CarrinhoAPI.listarCarrinho(user.id)
      console.log('Carrinho após remover:', carrinhoAposRemover)

      console.log('✅ === TESTE COMPLETO CONCLUÍDO ===')
      
    } catch (error) {
      console.error('❌ Erro durante o teste:', error)
    }
  }, [isAuthenticated, user?.id])

  // Calcular total e quantidade
  const total = items.reduce((sum, item) => sum + (Number(item.preco) * item.quantidade), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantidade, 0)

  const value: CarrinhoContextType = {
    items,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    totalItems,
    isEmpty: items.length === 0,
    refreshCart,
    contarItens,
    testarAPI
  }

  return (
    <CarrinhoContext.Provider value={value}>
      {children}
    </CarrinhoContext.Provider>
  )
}
