import api from '../lib/api'

// ============================================
// TIPOS
// ============================================

export interface CarrinhoItem {
  id_carrinho: number
  id_usuario: number
  id_produto: number
  quantidade: number
  data_adicao: string
  produto?: {
    id_produto: number
    nome: string
    descricao?: string
    preco: number
    preco_promocional?: number
    imagem?: string
    categoria?: string
    id_estabelecimento: number
  }
}

export interface CarrinhoResponse {
  status: boolean
  status_code: number
  message: string
  data?: CarrinhoItem
  itens?: CarrinhoItem[]
  total?: number
  subtotal?: number
}

export interface AdicionarCarrinhoRequest {
  id_usuario: number
  id_produto: number
  quantidade: number
}

export interface AtualizarQuantidadeRequest {
  quantidade: number
}

// ============================================
// SERVIÇOS DE API
// ============================================

/**
 * Buscar todos os itens do carrinho de um usuário
 */
export async function buscarCarrinho(idUsuario: number): Promise<CarrinhoResponse> {
  try {
    const { data } = await api.get<CarrinhoResponse>(`/carrinho/usuario/${idUsuario}`)
    return data
  } catch (error: any) {
    console.error('Erro ao buscar carrinho:', error)
    throw error
  }
}

/**
 * Adicionar produto ao carrinho
 */
export async function adicionarAoCarrinho(payload: AdicionarCarrinhoRequest): Promise<CarrinhoResponse> {
  try {
    const { data } = await api.post<CarrinhoResponse>('/carrinho', payload)
    return data
  } catch (error: any) {
    console.error('Erro ao adicionar ao carrinho:', error)
    throw error
  }
}

/**
 * Atualizar quantidade de um item no carrinho
 */
export async function atualizarQuantidade(
  idCarrinho: number, 
  payload: AtualizarQuantidadeRequest
): Promise<CarrinhoResponse> {
  try {
    const { data } = await api.put<CarrinhoResponse>(`/carrinho/${idCarrinho}`, payload)
    return data
  } catch (error: any) {
    console.error('Erro ao atualizar quantidade:', error)
    throw error
  }
}

/**
 * Remover item do carrinho
 */
export async function removerDoCarrinho(idCarrinho: number): Promise<CarrinhoResponse> {
  try {
    const { data } = await api.delete<CarrinhoResponse>(`/carrinho/${idCarrinho}`)
    return data
  } catch (error: any) {
    console.error('Erro ao remover do carrinho:', error)
    throw error
  }
}

/**
 * Limpar todo o carrinho de um usuário
 */
export async function limparCarrinho(idUsuario: number): Promise<CarrinhoResponse> {
  try {
    const { data } = await api.delete<CarrinhoResponse>(`/carrinho/usuario/${idUsuario}`)
    return data
  } catch (error: any) {
    console.error('Erro ao limpar carrinho:', error)
    throw error
  }
}
