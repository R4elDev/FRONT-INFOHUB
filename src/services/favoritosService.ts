import api from '../lib/api'

// ============================================
// TIPOS
// ============================================

export interface FavoritoItem {
  id_favorito: number
  id_usuario: number
  id_produto: number
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

export interface FavoritoResponse {
  status: boolean
  status_code: number
  message: string
  data?: FavoritoItem
  favoritos?: FavoritoItem[]
}

export interface AdicionarFavoritoRequest {
  id_usuario: number
  id_produto: number
}

// ============================================
// SERVIÇOS DE API
// ============================================

/**
 * Buscar todos os favoritos de um usuário
 */
export async function buscarFavoritos(idUsuario: number): Promise<FavoritoResponse> {
  try {
    const { data } = await api.get<FavoritoResponse>(`/favoritos/usuario/${idUsuario}`)
    return data
  } catch (error: any) {
    console.error('Erro ao buscar favoritos:', error)
    throw error
  }
}

/**
 * Adicionar produto aos favoritos
 */
export async function adicionarFavorito(payload: AdicionarFavoritoRequest): Promise<FavoritoResponse> {
  try {
    const { data } = await api.post<FavoritoResponse>('/favoritos', payload)
    return data
  } catch (error: any) {
    console.error('Erro ao adicionar favorito:', error)
    throw error
  }
}

/**
 * Remover produto dos favoritos
 */
export async function removerFavorito(idFavorito: number): Promise<FavoritoResponse> {
  try {
    const { data } = await api.delete<FavoritoResponse>(`/favoritos/${idFavorito}`)
    return data
  } catch (error: any) {
    console.error('Erro ao remover favorito:', error)
    throw error
  }
}

/**
 * Verificar se um produto está nos favoritos
 */
export async function verificarFavorito(idUsuario: number, idProduto: number): Promise<boolean> {
  try {
    const { data } = await api.get<FavoritoResponse>(`/favoritos/verificar/${idUsuario}/${idProduto}`)
    return data.status
  } catch (error: any) {
    console.error('Erro ao verificar favorito:', error)
    return false
  }
}

/**
 * Limpar todos os favoritos de um usuário
 */
export async function limparFavoritos(idUsuario: number): Promise<FavoritoResponse> {
  try {
    const { data } = await api.delete<FavoritoResponse>(`/favoritos/usuario/${idUsuario}`)
    return data
  } catch (error: any) {
    console.error('Erro ao limpar favoritos:', error)
    throw error
  }
}
