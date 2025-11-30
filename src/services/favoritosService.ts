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
  data?: any // Flexível para diferentes tipos de resposta
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
    const { data } = await api.get<FavoritoResponse>(`/favoritos/${idUsuario}`)
    return data
  } catch (error: any) {
    // Usar warn em vez de error pois há fallback para localStorage
    console.warn('⚠️ API favoritos indisponível:', error.response?.status || error.message)
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
export async function removerFavorito(idUsuario: number, idProduto: number): Promise<FavoritoResponse> {
  try {
    const { data } = await api.delete<FavoritoResponse>(`/favoritos/${idUsuario}/${idProduto}`)
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
    const { data } = await api.get<FavoritoResponse>(`/favoritos/${idUsuario}/${idProduto}/check`)
    return data.data?.is_favorito || false
  } catch (error: any) {
    console.error('Erro ao verificar favorito:', error)
    return false
  }
}

/**
 * Alternar favorito (adiciona se não existe, remove se existe)
 */
export async function alternarFavorito(payload: AdicionarFavoritoRequest): Promise<FavoritoResponse> {
  try {
    const { data } = await api.post<FavoritoResponse>('/favoritos/toggle', payload)
    return data
  } catch (error: any) {
    console.error('Erro ao alternar favorito:', error)
    throw error
  }
}

/**
 * Contar favoritos do usuário
 */
export async function contarFavoritos(idUsuario: number): Promise<number> {
  try {
    const { data } = await api.get<FavoritoResponse>(`/favoritos/${idUsuario}/count`)
    return data.data?.total_favoritos || 0
  } catch (error: any) {
    console.error('Erro ao contar favoritos:', error)
    return 0
  }
}

/**
 * Buscar favoritos em promoção
 */
export async function favoritosEmPromocao(idUsuario: number): Promise<FavoritoResponse> {
  try {
    const { data } = await api.get<FavoritoResponse>(`/favoritos/${idUsuario}/promocoes`)
    return data
  } catch (error: any) {
    console.error('Erro ao buscar favoritos em promoção:', error)
    throw error
  }
}

/**
 * Produtos mais favoritados (público)
 */
export async function produtosMaisFavoritados(limit?: number): Promise<FavoritoResponse> {
  try {
    const endpoint = limit ? `/favoritos/mais-favoritados/${limit}` : '/favoritos/mais-favoritados'
    const { data } = await api.get<FavoritoResponse>(endpoint)
    return data
  } catch (error: any) {
    console.error('Erro ao buscar produtos mais favoritados:', error)
    throw error
  }
}
