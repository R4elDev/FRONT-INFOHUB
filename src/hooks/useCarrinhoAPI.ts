import { useState, useEffect } from 'react'
import { useUser } from '../contexts/UserContext'
import { CarrinhoAPI, type CarrinhoItem, type CarrinhoData } from '../services/carrinhoService'

// ============================================
// HOOK PERSONALIZADO PARA CARRINHO
// ============================================

export const useCarrinhoAPI = () => {
  const { user, isAuthenticated } = useUser()
  const [carrinho, setCarrinho] = useState<CarrinhoData>({
    itens: [],
    resumo: { total_itens: 0, total_produtos: 0, valor_total: "0.00" }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Carregar carrinho
  const carregarCarrinho = async () => {
    if (!isAuthenticated || !user?.id) {
      setCarrinho({
        itens: [],
        resumo: { total_itens: 0, total_produtos: 0, valor_total: "0.00" }
      })
      setError('')
      return
    }

    setLoading(true)
    setError('')
    try {
      const dados = await CarrinhoAPI.listarCarrinho(user.id)
      setCarrinho(dados)
      console.log(`✅ Carrinho carregado: ${dados.resumo.total_itens} itens`)
    } catch (err: any) {
      // Backend indisponível - não é erro crítico, usaremos localStorage
      setCarrinho({
        itens: [],
        resumo: { total_itens: 0, total_produtos: 0, valor_total: "0.00" }
      })
      // Não mostrar erro na UI se for 500 do backend
      if (err.response?.status !== 500) {
        setError(err.message || 'Erro ao carregar carrinho')
      }
      console.warn('⚠️ API carrinho indisponível, usando fallback local')
    } finally {
      setLoading(false)
    }
  }

  // Adicionar item
  const adicionarItem = async (idProduto: number, quantidade = 1) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      setError('')
      await CarrinhoAPI.adicionarItem(user.id, idProduto, quantidade)
      await carregarCarrinho() // Recarregar para pegar dados atualizados
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar item')
      throw err
    }
  }

  // Atualizar quantidade
  const atualizarQuantidade = async (idProduto: number, novaQuantidade: number) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      setError('')
      if (novaQuantidade <= 0) {
        await removerItem(idProduto)
        return
      }
      
      await CarrinhoAPI.atualizarQuantidade(user.id, idProduto, novaQuantidade)
      
      // Atualizar localmente para feedback imediato
      setCarrinho(prev => ({
        ...prev,
        itens: prev.itens.map(item => 
          item.id_produto === idProduto 
            ? { ...item, quantidade: novaQuantidade }
            : item
        )
      }))
      
      // Recarregar para recalcular totais
      await carregarCarrinho()
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar quantidade')
      throw err
    }
  }

  // Remover item
  const removerItem = async (idProduto: number) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      setError('')
      await CarrinhoAPI.removerItem(user.id, idProduto)
      
      // Remover localmente para feedback imediato
      setCarrinho(prev => ({
        ...prev,
        itens: prev.itens.filter(item => item.id_produto !== idProduto)
      }))
      
      await carregarCarrinho()
    } catch (err: any) {
      setError(err.message || 'Erro ao remover item')
      throw err
    }
  }

  // Limpar carrinho
  const limparCarrinho = async () => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('Usuário não autenticado')
    }

    try {
      setError('')
      await CarrinhoAPI.limparCarrinho(user.id)
      setCarrinho({
        itens: [],
        resumo: { total_itens: 0, total_produtos: 0, valor_total: "0.00" }
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao limpar carrinho')
      throw err
    }
  }

  // Contar itens (para badge)
  const contarItens = async () => {
    if (!isAuthenticated || !user?.id) {
      return { total_itens: 0, total_produtos: 0 }
    }

    try {
      return await CarrinhoAPI.contarItens(user.id)
    } catch (err: any) {
      console.error('Erro ao contar itens:', err)
      return { total_itens: 0, total_produtos: 0 }
    }
  }

  // Carregar automaticamente quando usuário mudar
  useEffect(() => {
    carregarCarrinho()
  }, [isAuthenticated, user?.id])

  return {
    carrinho,
    loading,
    error,
    adicionarItem,
    atualizarQuantidade,
    removerItem,
    limparCarrinho,
    contarItens,
    recarregar: carregarCarrinho
  }
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

// Verificar se item está em promoção
export const itemEmPromocao = (item: CarrinhoItem): boolean => {
  return CarrinhoAPI.itemEmPromocao(item)
}

// Calcular total do item
export const calcularTotalItem = (item: CarrinhoItem): string => {
  return CarrinhoAPI.calcularTotalItem(item)
}

// Calcular desconto do item
export const calcularDesconto = (item: CarrinhoItem) => {
  return CarrinhoAPI.calcularDesconto(item)
}

// Formatar preço para exibição
export const formatarPreco = (valor: number | string): string => {
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}
