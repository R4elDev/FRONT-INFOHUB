import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useUser } from './UserContext'
import * as favoritosService from '../services/favoritosService'
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
  testarBancoDados: () => Promise<void>
  toggleFavorite: (product: Product) => Promise<{ action: string; is_favorito: boolean } | undefined>
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

  // Converter dados da API para Product
  const convertToProduct = (item: any): Product => {
    return {
      id: item.id_produto || item.id,
      nome: item.nome_produto || item.nome || '',
      preco: item.preco_promocional || item.preco_atual || item.preco || 0,
      precoAntigo: item.preco_original || item.preco_atual,
      imagem: item.imagem || '',
      categoria: item.categoria || '',
      descricao: item.descricao || '',
    }
  }

  // Buscar favoritos do banco de dados com fallback para localStorage
  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setFavoritos([])
      return
    }

    try {
      setLoading(true)
      
      // TENTA PRIMEIRO O BANCO DE DADOS
      try {
        console.log('🔄 Carregando favoritos do banco de dados...')
        const response = await favoritosService.buscarFavoritos(user.id)
        
        if (response.status && response.data?.favoritos) {
          const produtos = response.data.favoritos.map(convertToProduct)
          setFavoritos(produtos)
          
          // Atualiza localStorage também
          const key = `favoritos_user_${user.id}`
          localStorage.setItem(key, JSON.stringify(produtos))
          
          console.log('✅ Favoritos carregados do banco de dados:', produtos.length)
          return
        }
      } catch (apiError: any) {
        // Backend indisponível - usar fallback silenciosamente
        console.warn('⚠️ API favoritos indisponível, usando localStorage...')
      }
      
      // FALLBACK: Usar localStorage
      const key = `favoritos_user_${user.id}`
      const stored = localStorage.getItem(key)
      if (stored) {
        const produtos = JSON.parse(stored)
        setFavoritos(produtos)
        console.log('✅ Favoritos carregados do localStorage:', produtos.length)
      } else {
        setFavoritos([])
        console.log('📝 Nenhum favorito encontrado')
      }
    } catch (error) {
      console.warn('⚠️ Erro geral ao buscar favoritos, iniciando vazio')
      setFavoritos([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

  // Carregar favoritos quando o usuário fizer login
  useEffect(() => {
    refreshFavorites()
  }, [refreshFavorites])

  // Alternar favorito (toggle) - MÉTODO PRINCIPAL
  const toggleFavorite = useCallback(async (product: Product) => {
    if (!isAuthenticated || !user?.id) {
      alert('Você precisa estar logado para usar favoritos')
      return
    }

    try {
      setLoading(true)
      
      // USA O ENDPOINT TOGGLE DA API
      try {
        console.log('🔄 Alternando favorito no banco de dados...')
        const response = await favoritosService.alternarFavorito({
          id_usuario: user.id,
          id_produto: product.id
        })
        
        if (response.status && response.data) {
          const { action, is_favorito } = response.data
          
          if (action === 'added' || is_favorito) {
            // Produto foi adicionado
            if (!favoritos.some(p => p.id === product.id)) {
              const novosFavoritos = [...favoritos, product]
              setFavoritos(novosFavoritos)
              const key = `favoritos_user_${user.id}`
              localStorage.setItem(key, JSON.stringify(novosFavoritos))
            }
            console.log('✅ Produto adicionado aos favoritos')
          } else {
            // Produto foi removido
            const novosFavoritos = favoritos.filter(p => p.id !== product.id)
            setFavoritos(novosFavoritos)
            const key = `favoritos_user_${user.id}`
            localStorage.setItem(key, JSON.stringify(novosFavoritos))
            console.log('✅ Produto removido dos favoritos')
          }
          
          return { action, is_favorito }
        }
        
      } catch (apiError: any) {
        console.log('⚠️ Falha no banco, usando localStorage como fallback')
        console.error('Erro da API:', apiError)
        
        // FALLBACK: Toggle no localStorage
        const isFavorito = favoritos.some(p => p.id === product.id)
        let novosFavoritos
        
        if (isFavorito) {
          novosFavoritos = favoritos.filter(p => p.id !== product.id)
          console.log('✅ Produto removido dos favoritos (localStorage)')
        } else {
          novosFavoritos = [...favoritos, product]
          console.log('✅ Produto adicionado aos favoritos (localStorage)')
        }
        
        setFavoritos(novosFavoritos)
        const key = `favoritos_user_${user.id}`
        localStorage.setItem(key, JSON.stringify(novosFavoritos))
        
        return { action: isFavorito ? 'removed' : 'added', is_favorito: !isFavorito }
      }
      
    } catch (error: any) {
      console.error('Erro ao alternar favorito:', error)
      alert('Erro ao alterar favorito')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id, favoritos])

  // Adicionar aos favoritos (compatibilidade)
  const addFavorite = useCallback(async (product: Product) => {
    await toggleFavorite(product)
  }, [toggleFavorite])

  // Remover dos favoritos (compatibilidade)
  const removeFavorite = useCallback(async (productId: number) => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    try {
      setLoading(true)
      
      // TENTA REMOVER DO BANCO PRIMEIRO
      try {
        console.log('🔄 Tentando remover do banco de dados...')
        const response = await favoritosService.removerFavorito(user.id, productId)
        
        if (response.status) {
          console.log('✅ Produto removido do banco de dados')
        }
      } catch (apiError: any) {
        console.log('⚠️ Falha no banco ao remover favorito')
        console.error('Erro da API:', apiError)
      }
      
      // Remove do localStorage também
      const novosFavoritos = favoritos.filter(p => p.id !== productId)
      setFavoritos(novosFavoritos)
      const key = `favoritos_user_${user.id}`
      localStorage.setItem(key, JSON.stringify(novosFavoritos))
      
      console.log('✅ Produto removido dos favoritos')
      
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

  // Limpar favoritos
  const clearFavorites = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    try {
      setLoading(true)
      
      // Remove todos individualmente (não há endpoint de limpar tudo)
      const promises = favoritos.map(produto => 
        favoritosService.removerFavorito(user.id, produto.id).catch(err => {
          console.log(`Erro ao remover produto ${produto.id}:`, err)
        })
      )
      
      await Promise.all(promises)
      console.log('✅ Tentativa de limpeza no banco concluída')
      
      // Limpa localStorage
      setFavoritos([])
      const key = `favoritos_user_${user.id}`
      localStorage.removeItem(key)
      
      console.log('✅ Favoritos limpos')
    } catch (error: any) {
      console.error('Erro ao limpar favoritos:', error)
      alert('Erro ao limpar favoritos')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id, favoritos])

  // Função para testar integração completa com backend
  const testarBancoDados = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('❌ Usuário não autenticado')
      alert('❌ Você precisa estar logado para executar os testes')
      return
    }

    console.log('🧪 === TESTE COMPLETO DE INTEGRAÇÃO COM BACKEND ===')
    console.log(`👤 Usuário: ${user.id}`)
    console.log(`🌐 Base URL: ${process.env.REACT_APP_API_URL || 'http://localhost:8080/v1/infohub'}`)
    
    const resultados = {
      buscarFavoritos: '❌',
      adicionarFavorito: '❌',
      alternarFavorito: '❌',
      verificarFavorito: '❌',
      removerFavorito: '❌',
      contarFavoritos: '❌',
      favoritosPromocao: '❌'
    }

    try {
      // Teste 1: Buscar favoritos existentes
      console.log('\n📋 TESTE 1: Buscando favoritos existentes...')
      try {
        const response = await favoritosService.buscarFavoritos(user.id)
        console.log('✅ Buscar favoritos: SUCESSO')
        console.log('📊 Dados recebidos:', response)
        console.log(`📈 Total de favoritos: ${response.data?.total_favoritos || response.data?.favoritos?.length || 0}`)
        resultados.buscarFavoritos = '✅'
      } catch (error: any) {
        console.log('❌ Buscar favoritos: FALHA')
        console.log('🔍 Erro:', error.response?.data || error.message)
      }

      // Teste 2: Contar favoritos
      console.log('\n🔢 TESTE 2: Contando favoritos...')
      try {
        const total = await favoritosService.contarFavoritos(user.id)
        console.log('✅ Contar favoritos: SUCESSO')
        console.log(`📊 Total: ${total}`)
        resultados.contarFavoritos = '✅'
      } catch (error: any) {
        console.log('❌ Contar favoritos: FALHA')
        console.log('🔍 Erro:', error.response?.data || error.message)
      }

      // Teste 3: Verificar se produto específico é favorito
      console.log('\n🔍 TESTE 3: Verificando produto específico (ID: 1)...')
      try {
        const isFavorito = await favoritosService.verificarFavorito(user.id, 1)
        console.log('✅ Verificar favorito: SUCESSO')
        console.log(`❤️ Produto 1 é favorito: ${isFavorito}`)
        resultados.verificarFavorito = '✅'
      } catch (error: any) {
        console.log('❌ Verificar favorito: FALHA')
        console.log('🔍 Erro:', error.response?.data || error.message)
      }

      // Teste 4: Adicionar favorito (método tradicional)
      console.log('\n➕ TESTE 4: Adicionando favorito (produto teste ID: 999)...')
      try {
        const response = await favoritosService.adicionarFavorito({
          id_usuario: user.id,
          id_produto: 999
        })
        console.log('✅ Adicionar favorito: SUCESSO')
        console.log('📊 Resposta:', response)
        resultados.adicionarFavorito = '✅'
      } catch (error: any) {
        console.log('❌ Adicionar favorito: FALHA')
        console.log('🔍 Erro:', error.response?.data || error.message)
        if (error.response?.status === 409) {
          console.log('💡 Produto já está nos favoritos (esperado)')
          resultados.adicionarFavorito = '⚠️'
        }
      }

      // Teste 5: Alternar favorito (toggle)
      console.log('\n🔄 TESTE 5: Alternando favorito (toggle - produto ID: 998)...')
      try {
        const response = await favoritosService.alternarFavorito({
          id_usuario: user.id,
          id_produto: 998
        })
        console.log('✅ Alternar favorito: SUCESSO')
        console.log('📊 Ação realizada:', response.data?.action)
        console.log('❤️ Status final:', response.data?.is_favorito)
        resultados.alternarFavorito = '✅'
      } catch (error: any) {
        console.log('❌ Alternar favorito: FALHA')
        console.log('🔍 Erro:', error.response?.data || error.message)
      }

      // Teste 6: Remover favorito
      console.log('\n➖ TESTE 6: Removendo favorito (produto ID: 999)...')
      try {
        const response = await favoritosService.removerFavorito(user.id, 999)
        console.log('✅ Remover favorito: SUCESSO')
        console.log('📊 Resposta:', response)
        resultados.removerFavorito = '✅'
      } catch (error: any) {
        console.log('❌ Remover favorito: FALHA')
        console.log('🔍 Erro:', error.response?.data || error.message)
        if (error.response?.status === 404) {
          console.log('💡 Produto não estava nos favoritos (esperado)')
          resultados.removerFavorito = '⚠️'
        }
      }

      // Teste 7: Favoritos em promoção
      console.log('\n🎁 TESTE 7: Buscando favoritos em promoção...')
      try {
        const response = await favoritosService.favoritosEmPromocao(user.id)
        console.log('✅ Favoritos em promoção: SUCESSO')
        console.log('📊 Promoções encontradas:', response.data?.total_promocoes || 0)
        console.log('🎯 Dados:', response.data?.promocoes || [])
        resultados.favoritosPromocao = '✅'
      } catch (error: any) {
        console.log('❌ Favoritos em promoção: FALHA')
        console.log('🔍 Erro:', error.response?.data || error.message)
      }

      // Relatório final
      console.log('\n📊 === RELATÓRIO FINAL DOS TESTES ===')
      console.log('🔍 Buscar Favoritos:', resultados.buscarFavoritos)
      console.log('➕ Adicionar Favorito:', resultados.adicionarFavorito)
      console.log('🔄 Alternar Favorito:', resultados.alternarFavorito)
      console.log('❓ Verificar Favorito:', resultados.verificarFavorito)
      console.log('➖ Remover Favorito:', resultados.removerFavorito)
      console.log('🔢 Contar Favoritos:', resultados.contarFavoritos)
      console.log('🎁 Favoritos Promoção:', resultados.favoritosPromocao)

      const sucessos = Object.values(resultados).filter(r => r === '✅').length
      const avisos = Object.values(resultados).filter(r => r === '⚠️').length
      const falhas = Object.values(resultados).filter(r => r === '❌').length

      console.log(`\n🎯 RESUMO: ${sucessos} sucessos, ${avisos} avisos, ${falhas} falhas`)
      
      if (sucessos >= 5) {
        console.log('🎉 BACKEND FUNCIONANDO CORRETAMENTE!')
        alert('🎉 Backend funcionando! Verifique o console para detalhes.')
      } else if (sucessos >= 3) {
        console.log('⚠️ BACKEND PARCIALMENTE FUNCIONAL')
        alert('⚠️ Backend parcialmente funcional. Verifique o console.')
      } else {
        console.log('❌ PROBLEMAS NO BACKEND')
        alert('❌ Problemas detectados no backend. Verifique o console.')
      }

      // Atualizar lista de favoritos após os testes
      console.log('\n🔄 Atualizando lista de favoritos...')
      await refreshFavorites()
      
    } catch (error: any) {
      console.error('💥 ERRO CRÍTICO NO TESTE:', error)
      console.log('💡 Possíveis problemas:')
      console.log('   - Backend não está rodando')
      console.log('   - URL da API incorreta')
      console.log('   - Token de autenticação inválido')
      console.log('   - Problemas de CORS')
      console.log('   - Endpoints não implementados')
      alert('💥 Erro crítico nos testes. Verifique o console.')
    }
  }, [isAuthenticated, user?.id, refreshFavorites])

  const value: FavoritosContextType = {
    favoritos,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
    count: favoritos.length,
    refreshFavorites,
    testarBancoDados,
    toggleFavorite
  }

  return (
    <FavoritosContext.Provider value={value}>
      {children}
    </FavoritosContext.Provider>
  )
}
