import api from '../lib/api'

// ============================================
// TIPOS BASEADOS NA DOCUMENTAÇÃO DA API
// ============================================

export interface CarrinhoItem {
  id_carrinho: number
  id_usuario: number
  id_produto: number
  quantidade: number
  nome_produto: string
  descricao?: string
  categoria?: string
  preco_atual: number
  preco_promocional?: number | null
  promocao_valida_ate?: string
  data_adicionado: string
}

export interface CarrinhoResumo {
  total_itens: number
  total_produtos: number
  valor_total: string
}

export interface CarrinhoData {
  itens: CarrinhoItem[]
  resumo: CarrinhoResumo
}

export interface CarrinhoResponse {
  status: boolean
  status_code: number
  message: string
  data: CarrinhoData | CarrinhoItem | { total_itens: number; total_produtos: number }
}

export interface AdicionarCarrinhoRequest {
  id_usuario: number
  id_produto: number
  quantidade?: number
}

export interface AtualizarQuantidadeRequest {
  id_usuario: number
  id_produto: number
  quantidade: number
}

// ============================================
// CLASSE COMPLETA PARA CARRINHO - SEGUINDO DOCUMENTAÇÃO
// ============================================

export class CarrinhoAPI {
  // 1. Adicionar item ao carrinho
  static async adicionarItem(idUsuario: number, idProduto: number, quantidade: number = 1): Promise<CarrinhoItem> {
    try {
      console.log(`🛒 Adicionando produto ${idProduto} ao carrinho (quantidade: ${quantidade})`)
      
      const { data } = await api.post<CarrinhoResponse>('/carrinho', {
        id_usuario: idUsuario,
        id_produto: idProduto,
        quantidade: quantidade
      })

      if (data.status) {
        console.log('✅ Item adicionado ao carrinho!')
        return data.data as CarrinhoItem
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      console.error('❌ Erro ao adicionar item:', error.response?.data?.message || error.message)
      throw error
    }
  }

  // 2. Atualizar quantidade do item
  static async atualizarQuantidade(idUsuario: number, idProduto: number, novaQuantidade: number): Promise<boolean> {
    try {
      if (novaQuantidade <= 0) {
        throw new Error('Quantidade deve ser maior que zero')
      }

      console.log(`🔄 Atualizando quantidade do produto ${idProduto} para ${novaQuantidade}`)

      const { data } = await api.put<CarrinhoResponse>('/carrinho', {
        id_usuario: idUsuario,
        id_produto: idProduto,
        quantidade: novaQuantidade
      })

      if (data.status) {
        console.log('✅ Quantidade atualizada!')
        return true
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar quantidade:', error.response?.data?.message || error.message)
      throw error
    }
  }

  // 3. Listar carrinho do usuário
  static async listarCarrinho(idUsuario: number): Promise<CarrinhoData> {
    try {
      console.log(`📋 Listando carrinho do usuário ${idUsuario}`)

      const { data } = await api.get<CarrinhoResponse>(`/carrinho/${idUsuario}`)

      if (data.status) {
        const carrinhoData = data.data as CarrinhoData
        console.log(`✅ Carrinho: ${carrinhoData.resumo.total_itens} itens`)
        return carrinhoData
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      console.error('❌ Erro ao listar carrinho:', error.response?.data?.message || error.message)
      throw error
    }
  }

  // 4. Contar itens do carrinho
  static async contarItens(idUsuario: number): Promise<{ total_itens: number; total_produtos: number }> {
    try {
      const { data } = await api.get<CarrinhoResponse>(`/carrinho/${idUsuario}/count`)

      if (data.status) {
        return data.data as { total_itens: number; total_produtos: number }
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      console.error('❌ Erro ao contar itens:', error.response?.data?.message || error.message)
      throw error
    }
  }

  // 5. Remover item específico
  static async removerItem(idUsuario: number, idProduto: number): Promise<boolean> {
    try {
      console.log(`🗑️ Removendo produto ${idProduto} do carrinho`)

      const { data } = await api.delete<CarrinhoResponse>(`/carrinho/${idUsuario}/${idProduto}`)

      if (data.status) {
        console.log('✅ Item removido do carrinho!')
        return true
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      console.error('❌ Erro ao remover item:', error.response?.data?.message || error.message)
      throw error
    }
  }

  // 6. Limpar carrinho completo
  static async limparCarrinho(idUsuario: number): Promise<boolean> {
    try {
      console.log(`🧹 Limpando carrinho do usuário ${idUsuario}`)

      const { data } = await api.delete<CarrinhoResponse>(`/carrinho/${idUsuario}`)

      if (data.status) {
        console.log('✅ Carrinho limpo!')
        return true
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      console.error('❌ Erro ao limpar carrinho:', error.response?.data?.message || error.message)
      throw error
    }
  }

  // Função auxiliar: Calcular total com desconto
  static calcularTotalItem(item: CarrinhoItem): string {
    const preco = item.preco_promocional || item.preco_atual
    return (preco * item.quantidade).toFixed(2)
  }

  // Função auxiliar: Verificar se item está em promoção
  static itemEmPromocao(item: CarrinhoItem): boolean {
    return item.preco_promocional !== null && item.preco_promocional !== undefined
  }

  // Função auxiliar: Calcular desconto do item
  static calcularDesconto(item: CarrinhoItem): { valor: string; percentual: string } {
    if (!this.itemEmPromocao(item)) return { valor: '0.00', percentual: '0.0' }
    
    const desconto = item.preco_atual - item.preco_promocional!
    const percentual = (desconto / item.preco_atual) * 100
    return {
      valor: (desconto * item.quantidade).toFixed(2),
      percentual: percentual.toFixed(1)
    }
  }
}

// ============================================
// FUNÇÕES DE COMPATIBILIDADE (MANTER EXISTENTES)
// ============================================

export async function buscarCarrinho(idUsuario: number): Promise<CarrinhoData> {
  return CarrinhoAPI.listarCarrinho(idUsuario)
}

export async function adicionarAoCarrinho(payload: AdicionarCarrinhoRequest): Promise<CarrinhoItem> {
  return CarrinhoAPI.adicionarItem(payload.id_usuario, payload.id_produto, payload.quantidade || 1)
}

export async function atualizarQuantidade(idUsuario: number, idProduto: number, quantidade: number): Promise<boolean> {
  return CarrinhoAPI.atualizarQuantidade(idUsuario, idProduto, quantidade)
}

export async function removerDoCarrinho(idUsuario: number, idProduto: number): Promise<boolean> {
  return CarrinhoAPI.removerItem(idUsuario, idProduto)
}

export async function limparCarrinho(idUsuario: number): Promise<boolean> {
  return CarrinhoAPI.limparCarrinho(idUsuario)
}
